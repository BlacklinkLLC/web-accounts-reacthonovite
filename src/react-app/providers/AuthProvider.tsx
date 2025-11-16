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
} from "firebase/firestore";
import { useRef } from "react";
import { auth, db } from "../firebase/client";

export type UserProfile = {
  displayName: string;
  email: string;
  tier: string;
  organization?: string;
  roles?: string[];
  devices?: number;
  photoURL?: string;
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
  loading: boolean;
  error: string | null;
  statsPermissionDenied: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithClassLink: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const fallbackProfile: UserProfile = {
  displayName: "Guest",
  email: "guest@blacklink.app",
  tier: "ULTRA_PLUS",
  organization: "Demo Org",
  roles: ["viewer"],
  devices: 1,
  photoURL: "",
};

const fallbackStats: Stats = {
  activeUsers: 0,
  orgs: 0,
  apiHealth: "Unknown",
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
      organization: orgField,
      roles: (data.roles as string[]) || ["member"],
      devices: typeof data.devices === "number" ? data.devices : fallbackProfile.devices,
      photoURL:
        (data as Record<string, unknown>).photoURL && typeof (data as Record<string, unknown>).photoURL === "string"
          ? ((data as Record<string, unknown>).photoURL as string)
          : user?.photoURL || fallbackProfile.photoURL,
    };
  }

  if (user) {
    return {
      displayName: user.displayName || fallbackProfile.displayName,
      email: user.email || fallbackProfile.email,
      tier: "ULTRA_PLUS",
      organization: fallbackProfile.organization,
      roles: ["member"],
      devices: fallbackProfile.devices,
      photoURL: user?.photoURL || fallbackProfile.photoURL,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsPermissionDenied, setStatsPermissionDenied] = useState(false);
  const statsErrorLoggedRef = useRef(false);

  useEffect(() => {
    // Persist auth across reloads using browser storage (cookie-like behavior)
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      logFirebaseError("auth-persistence", err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setLoading(true);
      setError(null);
      setStatsPermissionDenied(false);

      if (!nextUser) {
        setProfile(fallbackProfile);
        setOrgs([]);
        setStats(fallbackStats);
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
      loading,
      error,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithClassLink,
      signOutUser,
      statsPermissionDenied,
    }),
    [user, profile, orgs, stats, loading, error, statsPermissionDenied],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
