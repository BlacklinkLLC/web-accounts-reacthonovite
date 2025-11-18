import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  QueryDocumentSnapshot,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useRef } from "react";
import { auth, db } from "../firebase/client";

export type UserProfile = {
  displayName: string;
  email: string;
  tier: string;
  username?: string;
  organization?: string;
  roles?: string[];
  devices?: number;
  photoURL?: string;
  isAdmin?: boolean;
};

export type QuickLaunchApp = {
  id: string;
  name: string;
  url: string;
  icon?: string;
  favorite?: boolean;
  userId?: string;
  createdAt?: unknown;
};

export type AeroTokens = {
  remaining: number;
  allocatedAt?: string;
  lastReset?: string;
};

export type Org = {
  id: string;
  name: string;
  tier?: string;
  members?: number;
};

export type Stats = {
  activeUsers: number;
  orgs: number;
  apiHealth: string;
};

type AuthContextShape = {
  user: User | null;
  profile: UserProfile;
  orgs: Org[];
  stats: Stats;
  quickLaunch: QuickLaunchApp[];
  aeroTokens: AeroTokens;
  loading: boolean;
  error: string | null;
  statsPermissionDenied: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithClassLink: () => Promise<void>;
  signOutUser: () => Promise<void>;
  addQuickLaunch: (payload: Omit<QuickLaunchApp, "id">) => Promise<void>;
  updateQuickLaunch: (id: string, payload: Partial<QuickLaunchApp>) => Promise<void>;
  deleteQuickLaunch: (id: string) => Promise<void>;
  setUsername: (username: string) => Promise<void>;
  setPhotoUrl: (url: string) => Promise<void>;
};

const fallbackProfile: UserProfile = {
  displayName: "Guest",
  email: "guest@blacklink.app",
  tier: "ULTRA_PLUS",
  organization: "Demo Org",
  roles: ["viewer"],
  devices: 1,
  photoURL: "",
  isAdmin: false,
};

const fallbackStats: Stats = {
  activeUsers: 0,
  orgs: 0,
  apiHealth: "Unknown",
};

const fallbackAeroTokens: AeroTokens = {
  remaining: 0,
  allocatedAt: "",
  lastReset: "",
};

const AuthContext = createContext<AuthContextShape | null>(null);

const normalizeProfile = (user: User | null, docSnap?: QueryDocumentSnapshot): UserProfile => {
  if (docSnap?.exists()) {
    const data = docSnap.data() as Partial<UserProfile>;
    const orgField = (() => {
      if (typeof data.organization === "string") return data.organization;
      const legacyOrg = (data as Record<string, unknown>).org;
      return typeof legacyOrg === "string" ? legacyOrg : fallbackProfile.organization;
    })();
    return {
      displayName: data.displayName || user?.displayName || fallbackProfile.displayName,
      email: data.email || user?.email || fallbackProfile.email,
      tier: data.tier || "ULTRA_PLUS",
      username: data.username,
      organization: orgField,
      roles: (data.roles as string[]) || ["member"],
      devices: typeof data.devices === "number" ? data.devices : fallbackProfile.devices,
      photoURL:
        (data as Record<string, unknown>).photoURL && typeof (data as Record<string, unknown>).photoURL === "string"
          ? ((data as Record<string, unknown>).photoURL as string)
          : user?.photoURL || fallbackProfile.photoURL,
      isAdmin: Boolean((data as Record<string, unknown>).isAdmin),
    };
  }

  if (user) {
    return {
      displayName: user.displayName || fallbackProfile.displayName,
      email: user.email || fallbackProfile.email,
      tier: "ULTRA_PLUS",
      username: undefined,
      organization: fallbackProfile.organization,
      roles: ["member"],
      devices: fallbackProfile.devices,
      photoURL: user?.photoURL || fallbackProfile.photoURL,
      isAdmin: fallbackProfile.isAdmin,
    };
  }

  return fallbackProfile;
};

const normalizeOrg = (snap: QueryDocumentSnapshot): Org => {
  const data = snap.data() as Partial<Org>;
  return {
    id: snap.id,
    name: data.name || "Workspace",
    tier: data.tier || "FREE",
    members: data.members || 0,
  };
};

const normalizeStats = (snap?: QueryDocumentSnapshot): Stats => {
  if (snap?.exists()) {
    const data = snap.data() as Partial<Stats>;
    return {
      activeUsers: data.activeUsers ?? fallbackStats.activeUsers,
      orgs: data.orgs ?? fallbackStats.orgs,
      apiHealth: data.apiHealth || fallbackStats.apiHealth,
    };
  }
  return fallbackStats;
};

const logFirebaseError = (label: string, err: unknown) => {
  const code = (err as { code?: string })?.code ?? "unknown";
  const message = (err as { message?: string })?.message ?? String(err);
  console.error(`[Firebase][${label}]`, { code, message, error: err });
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>(fallbackProfile);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [stats, setStats] = useState<Stats>(fallbackStats);
  const [quickLaunch, setQuickLaunch] = useState<QuickLaunchApp[]>([]);
  const [aeroTokens, setAeroTokens] = useState<AeroTokens>(fallbackAeroTokens);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsPermissionDenied, setStatsPermissionDenied] = useState(false);
  const statsErrorLoggedRef = useRef(false);

  useEffect(() => {
    // Persist auth across reloads using browser storage (cookie-like behavior)
    setPersistence(auth, browserLocalPersistence).catch((err: unknown) => {
      logFirebaseError("auth-persistence", err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (nextUser: User | null) => {
      setUser(nextUser);
      setLoading(true);
      setError(null);
      setStatsPermissionDenied(false);

      if (!nextUser) {
        setProfile(fallbackProfile);
        setOrgs([]);
        setStats(fallbackStats);
        setQuickLaunch([]);
        setAeroTokens(fallbackAeroTokens);
        setLoading(false);
        return;
      }

      try {
        const profileSnap = await getDoc(doc(db, "users", nextUser.uid));
        setProfile(normalizeProfile(nextUser, profileSnap as QueryDocumentSnapshot));
      } catch (err) {
        logFirebaseError("profile-fetch", err);
        setProfile(normalizeProfile(nextUser));
        setError("profile-fetch");
      }

      try {
        const orgQuery = query(
          collection(db, "organizations"),
          where("members", "array-contains", nextUser.uid),
          limit(6),
        );
        const orgSnap = await getDocs(orgQuery);
        setOrgs(orgSnap.docs.map(normalizeOrg));
      } catch (err) {
        logFirebaseError("org-fetch", err);
        setOrgs([]);
        setError("org-fetch");
      }

      try {
        const statsSnap = await getDoc(doc(db, "stats", "global"));
        setStats(normalizeStats(statsSnap as QueryDocumentSnapshot));
      } catch (err) {
        logFirebaseError("stats-fetch", err);
        setStats(fallbackStats);
        const code = (err as { code?: string })?.code;
        if (code === "permission-denied") {
          setStatsPermissionDenied(true);
          if (!statsErrorLoggedRef.current) {
            console.warn(
              "[Firebase][stats-fetch] Add a read rule for stats/global. Example:\nmatch /stats/{docId} { allow read: if request.auth != null; }",
            );
            statsErrorLoggedRef.current = true;
          }
        }
        setError(`stats:${code ?? "unknown"}`);
      }

      try {
        const qlSnap = await getDocs(collection(db, "product_pulse", nextUser.uid, "quicklaunch"));
        const items: QuickLaunchApp[] = qlSnap.docs.map((docSnap: QueryDocumentSnapshot) => {
          const data = docSnap.data() as Record<string, unknown>;
          return {
            id: docSnap.id,
            name: (data.name as string) || "App",
            url: (data.url as string) || "#",
            icon: typeof data.icon === "string" ? (data.icon as string) : "⚡",
            favorite: Boolean(data.favorite),
          };
        });
        setQuickLaunch(items);
      } catch (err) {
        logFirebaseError("quicklaunch-fetch", err);
        setQuickLaunch([]);
      }

      try {
        const tokensSnap = await getDoc(doc(db, "aero_tokens", nextUser.uid));
        if (tokensSnap.exists()) {
          const data = tokensSnap.data() as Record<string, unknown>;
          setAeroTokens({
            remaining: Number(data.remaining ?? 0),
            allocatedAt: (data.allocatedAt as string) || "",
            lastReset: (data.lastReset as string) || "",
          });
        } else {
          setAeroTokens(fallbackAeroTokens);
        }
      } catch (err) {
        logFirebaseError("aero-tokens-fetch", err);
        setAeroTokens(fallbackAeroTokens);
      }

      try {
        // Prefer username stored on user doc
        setProfile((prev) => ({
          ...prev,
          username: (prev.username as string | undefined) || undefined,
        }));

        // Fallback: query usernames/{username} where uid == current user
        const usernamesQuery = query(
          collection(db, "usernames"),
          where("uid", "==", nextUser.uid),
          limit(1),
        );
        const snap = await getDocs(usernamesQuery);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          setProfile((prev) => ({ ...prev, username: docSnap.id }));
        }
      } catch (err) {
        logFirebaseError("username-fetch", err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "auth";
      setError(code);
      logFirebaseError("sign-in", err);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "auth";
      setError(code);
      logFirebaseError("sign-up", err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "auth";
      setError(code);
      logFirebaseError("sign-in-google", err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithClassLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new OAuthProvider("classlink");
      await signInWithPopup(auth, provider);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "auth";
      setError(code);
      logFirebaseError("sign-in-classlink", err);
    } finally {
      setLoading(false);
    }
  };

  const setUsername = async (username: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const desired = username.trim();
    if (!username.trim()) {
      setError("username-empty");
      return;
    }
    const needsDistrictSuffix =
      (profile.organization || "").toLowerCase().includes("district") ||
      (profile.roles || []).some((r) => r.toLowerCase().includes("district"));
    const finalUsername = needsDistrictSuffix ? `${desired}.wsdr4` : desired;
    setLoading(true);
    setError(null);
    try {
      await runTransaction(db, async (tx) => {
        const newUsernameRef = doc(db, "usernames", finalUsername);
        const newUsernameSnap = await tx.get(newUsernameRef);
        if (newUsernameSnap.exists()) {
          const existingUid = (newUsernameSnap.data() as { uid?: string }).uid;
          if (existingUid && existingUid !== uid) {
            throw new Error("username-taken");
          }
        }

        const userRef = doc(db, "users", uid);
        const userSnap = await tx.get(userRef);
        const data = userSnap.data() as { username?: string; email?: string } | undefined;
        const currentUsername = data?.username;
        const currentEmail = data?.email || profile.email;

        tx.set(newUsernameRef, { uid, createdAt: serverTimestamp() });
        tx.set(
          userRef,
          { username: finalUsername, email: currentEmail, updatedAt: serverTimestamp() },
          { merge: true },
        );

        if (currentUsername && currentUsername !== finalUsername) {
          const oldRef = doc(db, "usernames", currentUsername);
          tx.delete(oldRef);
        }
      });

      setProfile((prev) => ({ ...prev, username: finalUsername }));
    } catch (err) {
      const message = (err as Error).message;
      setError(message === "username-taken" ? "username-taken" : "username");
      logFirebaseError("username-set", err);
    } finally {
      setLoading(false);
    }
  };

  const setPhotoUrl = async (url: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    setLoading(true);
    setError(null);
    try {
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);
      const email = (snap.data() as { email?: string } | undefined)?.email ?? profile.email;
      await setDoc(
        userRef,
        {
          email,
          photoURL: url,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setProfile((prev) => ({ ...prev, photoURL: url }));
    } catch (err) {
      logFirebaseError("photo-set", err);
      setError("photo");
    } finally {
      setLoading(false);
    }
  };

  const addQuickLaunch = async (payload: Omit<QuickLaunchApp, "id">) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const colRef = collection(db, "product_pulse", uid, "quicklaunch");
    const docRef = doc(colRef);
    const record = {
      name: payload.name,
      url: payload.url,
      icon: payload.icon || "⚡",
      favorite: Boolean(payload.favorite),
      userId: uid,
      createdAt: serverTimestamp(),
    };
    await setDoc(docRef, record);
    setQuickLaunch((prev) => [...prev, { ...record, id: docRef.id }]);
  };

  const updateQuickLaunch = async (id: string, payload: Partial<QuickLaunchApp>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const docRef = doc(db, "product_pulse", uid, "quicklaunch", id);
    const update: Record<string, unknown> = {
      ...payload,
      userId: uid,
    };
    delete update.id;
    await updateDoc(docRef, update);
    setQuickLaunch((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...payload, userId: uid } : app)),
    );
  };

  const deleteQuickLaunch = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const docRef = doc(db, "product_pulse", uid, "quicklaunch", id);
    await deleteDoc(docRef);
    setQuickLaunch((prev) => prev.filter((app) => app.id !== id));
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign-out failed", err);
    }
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      orgs,
      stats,
      quickLaunch,
      aeroTokens,
      loading,
      error,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithClassLink,
      addQuickLaunch,
      updateQuickLaunch,
      deleteQuickLaunch,
      setUsername,
      setPhotoUrl,
      signOutUser,
      statsPermissionDenied,
    }),
    [user, profile, orgs, stats, quickLaunch, aeroTokens, loading, error, statsPermissionDenied],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
