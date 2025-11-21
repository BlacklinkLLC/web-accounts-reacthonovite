import React, { ReactElement } from "react";
import { QuickLaunchApp } from "./providers/AuthProvider";
import { Badge } from "./components/Badge";
import { Button } from "./components/Button";
import { useAuth } from "./providers/AuthProvider";
import GradientText from "../components/reactbits/GradientText";
import { useTheme } from "./theme/ThemeProvider";
import { themeOptions, ThemeOption } from "./theme/themes";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase/client";
import FileDescriptionIcon from "./components/icons/outline/file-description.svg?react";
import RocketIcon from "./components/icons/outline/rocket.svg?react";
import ShieldIcon from "./components/icons/outline/shield.svg?react";
import BookIcon from "./components/icons/outline/book.svg?react";
import SearchIcon from "./components/icons/outline/search.svg?react";
import TrashIcon from "./components/icons/outline/trash.svg?react";
import BoxIcon from "./components/icons/outline/box.svg?react";
import ToolsIcon from "./components/icons/outline/tools.svg?react";
import PhotoIcon from "./components/icons/outline/photo.svg?react";
import CompassIcon from "./components/icons/outline/compass.svg?react";
import BellIcon from "./components/icons/outline/bell.svg?react";
import ConfettiIcon from "./components/icons/outline/confetti.svg?react";
import PaletteIcon from "./components/icons/outline/palette.svg?react";
import FlaskIcon from "./components/icons/outline/flask.svg?react";
import RoadIcon from "./components/icons/outline/road.svg?react";
import TagIcon from "./components/icons/outline/tag.svg?react";
import BoltIcon from "./components/icons/outline/bolt.svg?react";
import HelpIcon from "./components/icons/outline/help.svg?react";
import ClipboardIcon from "./components/icons/outline/clipboard-text.svg?react";
import LockIcon from "./components/icons/outline/lock.svg?react";
import CheckIcon from "./components/icons/outline/check.svg?react";
import SettingsIcon from "./components/icons/outline/settings.svg?react";
import AlertTriangleIcon from "./components/icons/outline/alert-triangle.svg?react";
import StarIcon from "./components/icons/outline/star.svg?react";
import PencilIcon from "./components/icons/outline/pencil.svg?react";

type PageRendererProps = {
  path: string;
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
};

const PageSection = ({ title, badge, children }: SectionProps) => (
  <section className="card page-card">
    <div className="card-header">
      <div className="card-title">
        <FileDescriptionIcon className="icon-inline icon-muted" aria-hidden="true" width={18} height={18} />
        {title}
      </div>
      {badge}
    </div>
    {children}
  </section>
);

const PageHero = ({
  title,
  subtitle,
  badge,
  ctas,
}: {
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  ctas?: React.ReactNode;
}) => (
  <header className="hero card">
    <div className="eyebrow-row">
      <span className="pill">Accounts 4.0 Beta</span>
      {badge}
    </div>
    <div className="hero-main page-hero-main">
      <div>
        <p className="eyebrow">Blacklink</p>
        <h1 className="gradient-text" style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.35rem" }}>
          {title}
        </h1>
        <p className="hero-subtitle">
          <GradientText>{subtitle}</GradientText>
        </p>
        {ctas ? <div className="hero-actions">{ctas}</div> : null}
      </div>
    </div>
  </header>
);

const HomePage = () => (
  <div className="page-shell">
    <PageHero
      title="Blacklink Accounts"
      subtitle="Accounts workspace running inside the 4.0 shell."
      badge={<Badge variant="warning">Beta</Badge>}
      ctas={
        <>
          <Button>Open dashboard</Button>
          <Button variant="secondary">Go to settings</Button>
        </>
      }
    />
    <div className="grid grid-3 layout-bottom">
      <PageSection title="Quick links" badge={<Badge variant="info">Navigation</Badge>}>
        <div className="pill-row">
          <span className="pill">Dashboard</span>
          <span className="pill pill-success">Profile</span>
          <span className="pill pill-ultra">Settings</span>
          <span className="pill pill-success">Subscriptions</span>
        </div>
        <p className="theme-footnote">Key URLs: /dashboard, /profile, /settings, /subscription, /beta, /about.</p>
      </PageSection>
      <PageSection title="Status" badge={<Badge variant="success">Operational</Badge>}>
        <div className="stat-grid">
          <div className="stat-block">
            <p className="eyebrow">Auth</p>
            <p className="stat-value">Green</p>
            <p className="stat-trend">Edge-verified</p>
          </div>
          <div className="stat-block">
            <p className="eyebrow">Billing</p>
            <p className="stat-value">Syncing</p>
            <p className="stat-trend">Stripe aligned</p>
          </div>
        </div>
      </PageSection>
      <PageSection title="Beta notes" badge={<Badge variant="warning">Beta</Badge>}>
        <p className="theme-footnote">No additional features in this phase.</p>
      </PageSection>
    </div>
  </div>
);

const DashboardPage = () => (
  <DashboardContent />
);

const formatTier = (tier: string) => {
  const norm = tier?.toUpperCase() || "";
  if (norm.includes("ULTRA_PLUS") || norm.includes("ULTRA+")) return "ULTRA+ (Employee)";
  if (norm.includes("ULTRA")) return "ULTRA";
  return norm || "ULTRA+";
};

const useMarkdown = (path: string) => {
  const [content, setContent] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${path}`);
        return res.text();
      })
      .then((text) => {
        if (alive) setContent(text);
      })
      .catch((err) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [path]);

  return { content, loading, error };
};

const DashboardContent = () => {
  const { profile, quickLaunch, addQuickLaunch, updateQuickLaunch, deleteQuickLaunch } = useAuth();
  const quickLaunchApps = quickLaunch.length
    ? quickLaunch
    : [
        { id: "nova", name: "Nova", url: "https://nova.blacklink.app", icon: "rocket" },
        { id: "admin", name: "Admin", url: "https://admin.blacklink.app", icon: "shield" },
        { id: "docs", name: "Docs", url: "https://docs.blacklink.app", icon: "book" },
        { id: "support", name: "Support", url: "https://support.blacklink.app", icon: "support" },
      ];
  const [search, setSearch] = React.useState("");
  const [showFavorites, setShowFavorites] = React.useState(false);
  const filteredApps = quickLaunchApps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.url.toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = showFavorites ? app.favorite : true;
    return matchesSearch && matchesFavorite;
  });

  const handleAddApp = async () => {
    const name = window.prompt("App name");
    if (!name) return;
    const url = window.prompt("App URL");
    if (!url) return;
    await addQuickLaunch({ name, url, icon: "bolt", favorite: false });
  };

  const handleEditApp = async (app: QuickLaunchApp) => {
    const name = window.prompt("Edit name", app.name) ?? "";
    const url = window.prompt("Edit URL", app.url) ?? "";
    if (!name.trim() || !url.trim()) return;
    await updateQuickLaunch(app.id, { name, url });
  };

  const handleDeleteApp = async (app: QuickLaunchApp) => {
    if (!window.confirm(`Delete ${app.name}?`)) return;
    await deleteQuickLaunch(app.id);
  };

  const handleToggleFavorite = async (app: QuickLaunchApp) => {
    await updateQuickLaunch(app.id, { favorite: !app.favorite });
  };

  const groupedApps = filteredApps.reduce<Record<string, QuickLaunchApp[]>>((acc, app) => {
    const key = (app.group as string | undefined) || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(app);
    return acc;
  }, {});

  const groupNames = Object.keys(groupedApps).sort((a, b) => a.localeCompare(b));

  return (
    <div className="page-shell">
      <header className="hero card">
        <div className="eyebrow-row">
          <span className="pill tier-badge ultra-plus">{formatTier(profile.tier)}</span>
        </div>
        <div className="hero-main">
          <div className="brand-mark" aria-hidden>
            4.0
          </div>
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>Blacklink Dashboard</h1>
            <p className="hero-subtitle">Overview of identity, billing, usage, and shortcuts.</p>
          </div>
        </div>
        <div className="release-banner">
          <span className="release-badge">Beta</span>
          <span className="release-note">Some areas are still in active development.</span>
        </div>
      </header>
        <PageSection title="QuickLaunch" badge={<Badge variant="info">Accounts-Old</Badge>}>
        <div className="quicklaunch">
          <div className="quicklaunch-header">
            <div className="quicklaunch-title">
              <div className="quicklaunch-icon">
                <BoltIcon className="icon-inline" aria-hidden="true" width={24} height={24} />
              </div>
              QuickLaunch
            </div>
            <Button size="sm" type="button" onClick={handleAddApp}>
              Add app
            </Button>
          </div>
          <div className="quicklaunch-toolbar">
            <div className="search-apps">
              <span className="search-icon" aria-hidden="true">
                <SearchIcon className="icon-inline icon-muted" width={16} height={16} />
              </span>
              <input
                type="search"
                aria-label="Search quicklaunch apps"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search apps"
              />
            </div>
            <div className="quicklaunch-filters">
              <button
                type="button"
                className={`chip-toggle ${!showFavorites ? "active" : ""}`}
                onClick={() => setShowFavorites(false)}
              >
                All
              </button>
              <button
                type="button"
                className={`chip-toggle ${showFavorites ? "active" : ""}`}
                onClick={() => setShowFavorites(true)}
              >
                Favorites
              </button>
              <select defaultValue="all" aria-label="Filter collection" className="select-dropdown">
                <option value="all">All collections</option>
                <option value="default">Default</option>
              </select>
            </div>
          </div>
          <div className="apps-grid">
            {groupNames.map((group) => (
              <div key={group} className="app-group">
                <div className="app-group-header">{group}</div>
                {groupedApps[group].map((app) => {
                  const iconName = app.icon || "bolt";
                  const iconEl =
                    iconName === "rocket" ? (
                      <RocketIcon className="icon-inline" aria-hidden="true" />
                    ) : iconName === "shield" ? (
                      <ShieldIcon className="icon-inline" aria-hidden="true" />
                    ) : iconName === "book" ? (
                      <BookIcon className="icon-inline" aria-hidden="true" />
                    ) : iconName === "support" ? (
                      <HelpIcon className="icon-inline" aria-hidden="true" />
                    ) : (
                      <BoltIcon className="icon-inline" aria-hidden="true" />
                    );

                  return (
                    <a key={app.id} className="app-card" href={app.url} target="_blank" rel="noreferrer">
                      <div
                        className="app-icon"
                        style={app.color ? { background: app.color } : undefined}
                      >
                        {iconEl}
                      </div>
                      <div className="app-name">{app.name}</div>
                      <div className="app-url">{app.url}</div>
                      <div className="app-actions">
                        <button
                          className="app-action-btn favorite"
                          title="Favorite"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleToggleFavorite(app);
                          }}
                        >
                          <StarIcon
                            className="icon-inline icon-warning"
                            aria-hidden="true"
                            width={14}
                            height={14}
                          />
                        </button>
                        <button
                          className="app-action-btn"
                          title="Edit"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleEditApp(app);
                          }}
                        >
                          <PencilIcon
                            className="icon-inline icon-muted"
                            aria-hidden="true"
                            width={14}
                            height={14}
                          />
                        </button>
                        <button
                          className="app-action-btn"
                          title="Delete"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteApp(app);
                          }}
                        >
                          <TrashIcon
                            className="icon-inline icon-muted"
                            aria-hidden="true"
                            width={14}
                            height={14}
                          />
                        </button>
                      </div>
                      {app.favorite ? (
                        <span className="usage-chip">
                          <StarIcon
                            className="icon-inline icon-warning"
                            aria-hidden="true"
                            width={12}
                            height={12}
                          />
                          Favorite
                        </span>
                      ) : null}
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <p className="theme-footnote">QuickLaunch shortcuts are stored in product_pulse/quicklaunch.</p>
      </PageSection>
    </div>
  );
};

const LoginPage = () => {
  const { signIn, signInWithGoogle, signInWithClassLink, error, loading } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className="page-shell">
      <PageHero
        title="Sign in"
        subtitle="Access your Blacklink account with MFA and device trust."
        badge={<Badge variant="info">Secure</Badge>}
      />
      <section className="card form-card">
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              placeholder="you@blacklink.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="component-row">
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <Button variant="secondary" type="button" onClick={signInWithGoogle}>
              Sign in with Google
            </Button>
            <Button variant="secondary" type="button" onClick={signInWithClassLink}>
              Sign in with ClassLink
            </Button>
          </div>
          {error ? <p className="form-error">Authentication error. Check credentials.</p> : null}
          <p className="theme-footnote">Need an account? Visit /register.</p>
        </form>
      </section>
    </div>
  );
};

const RegisterPage = () => {
  const { signUp, signInWithGoogle, signInWithClassLink, error, loading } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await signUp(email, password);
    document.cookie = `bl_name=${encodeURIComponent(name)}; path=/; SameSite=Lax`;
  };

  return (
    <div className="page-shell">
      <PageHero
        title="Create account"
        subtitle="Start an organization, invite teammates, and enable ULTRA."
        badge={<Badge variant="success">Open</Badge>}
      />
      <section className="card form-card">
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label htmlFor="reg-name">Name</label>
              <input
                id="reg-name"
                placeholder="Nova Admin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                placeholder="admin@blacklink.app"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="form-help">MFA and passkeys can be enforced after sign up.</p>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>
          <div className="component-row">
            <Button variant="secondary" type="button" onClick={signInWithGoogle}>
              Continue with Google
            </Button>
            <Button variant="secondary" type="button" onClick={signInWithClassLink}>
              Continue with ClassLink
            </Button>
          </div>
          {error ? <p className="form-error">Could not register. Check your info.</p> : null}
        </form>
      </section>
    </div>
  );
};

const ProfilePage = () => {
  const { profile, quickLaunch } = useAuth();
  const username = profile.username || (profile.email ? profile.email.split("@")[0] : "user");
  const apps = quickLaunch.slice(0, 6);

  return (
    <div className="profile-page-container">
      <div className="rb-profile-card">
        <div className="rb-profile-header">
          <div className="rb-avatar">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} referrerPolicy="no-referrer" />
            ) : (
              profile.displayName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className="rb-username gradient-text">@{username}</p>
            <h2 className="rb-name">{profile.displayName}</h2>
            <div className="rb-badges">
              <span className="pill">{formatTier(profile.tier)}</span>
              {profile.organization ? <span className="pill pill-outline">{profile.organization}</span> : null}
            </div>
            <div className="rb-actions" style={{ marginTop: "0.5rem" }}>
              <Button size="sm" onClick={() => (window.location.href = "/settings")}>
                Edit profile
              </Button>
            </div>
          </div>
        </div>
        <div className="rb-stats">
          <div className="rb-stat">
            <p className="rb-stat-label">Devices</p>
            <p className="rb-stat-value">{profile.devices ?? "—"}</p>
          </div>
          <div className="rb-stat">
            <p className="rb-stat-label">QuickLaunch</p>
            <p className="rb-stat-value">{apps.length}</p>
          </div>
          <div className="rb-stat">
            <p className="rb-stat-label">Roles</p>
            <p className="rb-stat-value">{profile.roles?.length || 1}</p>
          </div>
        </div>
      </div>

      <section className="profile-section">
        <div className="profile-section-title">
          <div className="profile-section-icon">
            <ConfettiIcon className="icon-inline" aria-hidden="true" />
          </div>
          Features
        </div>
        <div className="profile-feature-grid">
          <div className="profile-feature-card">
            <div className="profile-feature-title">SSO providers</div>
            <div className="profile-feature-meta">
              <span>Google</span>
              <span>ClassLink</span>
            </div>
          </div>
          <div className="profile-feature-card">
            <div className="profile-feature-title">MFA</div>
            <div className="profile-feature-meta">
              <span>Enabled</span>
              <span>Accounts</span>
            </div>
          </div>
          <div className="profile-feature-card">
            <div className="profile-feature-title">Sessions</div>
            <div className="profile-feature-meta">
              <span>Active</span>
              <span>Device trust</span>
            </div>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-title">
          <div className="profile-section-icon">
            <BoxIcon className="icon-inline" aria-hidden="true" />
          </div>
          QuickLaunch favorites
        </div>
        <div className="profile-app-list">
          {apps.length === 0 ? (
            <p className="theme-footnote">No apps yet. Add some from Dashboard.</p>
          ) : (
            apps.map((app, index) => (
              <div key={app.id} className="profile-app-item">
                <div className="profile-app-primary">
                  <div className="app-icon">
                    <BoltIcon className="icon-inline" aria-hidden="true" />
                  </div>
                  <div className="profile-app-details">
                    <span>{app.name}</span>
                    <span className="profile-app-meta">{app.url}</span>
                  </div>
                </div>
                <div className="app-rank">{index + 1}</div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-title">
          <div className="profile-section-icon">
            <ShieldIcon className="icon-inline" aria-hidden="true" />
          </div>
          Security
        </div>
        <div className="security-grid">
          <div className="security-card">
            <span className="label">Devices</span>
            <span className="value">{profile.devices ?? "—"} trusted</span>
            <span className="hint">Review devices in security settings.</span>
          </div>
          <div className="security-card">
            <span className="label">Sessions</span>
            <span className="value">Active</span>
            <span className="hint">Sign out all devices from security panel.</span>
          </div>
          <div className="security-card">
            <span className="label">SSO</span>
            <span className="value">Google, ClassLink</span>
            <span className="hint">Managed via auth providers.</span>
          </div>
        </div>
      </section>

      {profile.isAdmin ? (
        <section className="profile-section">
          <div className="profile-section-title">
            <div className="profile-section-icon">
              <ToolsIcon className="icon-inline" aria-hidden="true" />
            </div>
            Admin
          </div>
          <div className="profile-admin-grid">
            <div className="profile-admin-card">
              <strong>Audit</strong>
              <span>Review org configuration</span>
            </div>
            <div className="profile-admin-card">
              <strong>Security events</strong>
              <span>See logs in product_pulse/security_events</span>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

type ThreadSummary = {
  id: string;
  name: string;
  handle: string;
  verified?: boolean;
  preview?: string;
  badge?: string;
  variant?: "info" | "success" | "warning" | "danger";
  unread?: boolean;
  updatedAt?: unknown;
};

type ChatMessage = {
  id: string;
  content: string;
  senderId: string;
  createdAt?: unknown;
};

const MessagesPage = () => {
  const { profile, user } = useAuth();
  const [threads, setThreads] = React.useState<ThreadSummary[]>([]);
  const [unreadThreads, setUnreadThreads] = React.useState<ThreadSummary[]>([]);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null);
  const [handleInput, setHandleInput] = React.useState("@blacklink");
  const [bodyInput, setBodyInput] = React.useState("");
  const [sendStatus, setSendStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) {
      setThreads([]);
      setUnreadThreads([]);
      return;
    }

    const convRef = collection(db, "conversations");
    const q = query(
      convRef,
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc"),
      limit(50),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const nextThreads: ThreadSummary[] = snap.docs.map((d) => {
          const data = d.data();
          const participants = (data.participants as string[]) || [];
          const otherId = participants.find((p) => p !== user.uid) || user.uid;
          const handles = (data.handles as Record<string, string> | undefined) || {};
          const displayHandle = handles[otherId] || handles[user.uid] || `@${otherId.slice(0, 6)}`;
          const lastMessage = (data.lastMessage || {}) as { content?: string };
          return {
            id: d.id,
            name: displayHandle,
            handle: displayHandle,
            verified: false,
            preview: (lastMessage.content as string) || "",
            badge: undefined,
            variant: "info",
            unread: false,
            updatedAt: data.lastMessageAt,
          };
        });
        setThreads(nextThreads);
        setUnreadThreads(nextThreads);
      },
      (err) => {
        console.error("[Messages] Failed to load inbox", err);
        setThreads([]);
        setUnreadThreads([]);
      },
    );
    return () => unsub();
  }, [user]);

  React.useEffect(() => {
    if (!user || !activeThreadId) {
      setMessages([]);
      return;
    }
    const msgsRef = collection(db, "conversations", activeThreadId, "messages");
    const q = query(msgsRef, orderBy("createdAt", "asc"), limit(100));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const nextMessages: ChatMessage[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            content: (data.content as string) || "",
            senderId: (data.senderId as string) || "",
            createdAt: data.createdAt,
          };
        });
        setMessages(nextMessages);
      },
      (err) => {
        console.error("[Messages] Failed to load thread", err);
        setMessages([]);
      },
    );
    return () => unsub();
  }, [user, activeThreadId]);

  const resolveHandle = async (handleRaw: string) => {
    const normalized = handleRaw.trim().replace(/^@/, "").toLowerCase();
    const snap = await getDoc(doc(db, "usernames", normalized));
    if (!snap.exists()) {
      throw new Error("Handle not found");
    }
    const data = snap.data() as { uid?: string };
    if (!data.uid) throw new Error("Handle missing uid");
    return { uid: data.uid, handle: `@${normalized}` };
  };

  const conversationIdFor = (uidA: string, uidB: string) => [uidA, uidB].sort().join("--");

  const ensureConversation = async (peerUid: string, peerHandle: string) => {
    if (!user) throw new Error("Not signed in");
    const conversationId = conversationIdFor(user.uid, peerUid);
    const conversationRef = doc(db, "conversations", conversationId);
    const snap = await getDoc(conversationRef);
    if (!snap.exists()) {
      const handles: Record<string, string> = {
        [user.uid]: profile.username ? `@${profile.username}` : profile.email,
        [peerUid]: peerHandle,
      };
      await setDoc(conversationRef, {
        participants: [user.uid, peerUid],
        handles,
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return conversationId;
  };

  const sendMessage = async () => {
    if (!user) {
      setSendStatus("Sign in to send a message.");
      return;
    }
    const text = bodyInput.trim();
    if (!text) {
      setSendStatus("Message cannot be empty.");
      return;
    }
    setSendStatus("Sending…");
    try {
      const { uid: peerUid, handle: peerHandle } = await resolveHandle(handleInput);
      const conversationId = await ensureConversation(peerUid, peerHandle);
      const messageRef = collection(db, "conversations", conversationId, "messages");
      await addDoc(messageRef, {
        senderId: user.uid,
        content: text,
        createdAt: serverTimestamp(),
      });
      const conversationRef = doc(db, "conversations", conversationId);
      await updateDoc(conversationRef, {
        lastMessage: { senderId: user.uid, content: text },
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setActiveThreadId(conversationId);
      setBodyInput("");
      setSendStatus("Sent");
    } catch (err) {
      console.error("[Messages] send failed", err);
      setSendStatus((err as Error).message || "Failed to send.");
    }
  };

  return (
    <div className="page-shell">
      <PageHero
        title="Messages"
        subtitle="Preview of the conversation workspace—free for every Blacklink user."
        badge={<Badge variant="warning">Beta</Badge>}
      />
      <div className="messages-layout">
        <aside className="messages-sidebar">
          <div className="messages-profile-card">
            <div className="messages-profile-avatar">{profile.displayName.slice(0, 2).toUpperCase()}</div>
            <div>
              <p className="eyebrow">{profile.username || profile.email}</p>
              <p className="hero-subtitle" style={{ marginBottom: 0 }}>
                Messages are free and follow your ULTRA status automatically.
              </p>
            </div>
          </div>

          <div className="messages-send-card">
            <div>
              <h3 className="card-title" style={{ marginBottom: "0.35rem" }}>
                Send a message
              </h3>
              <p className="messages-empty-cta">
                Type a handle using the @ prefix. Messages write to Firestore; delivery to others arrives once mirrored.
              </p>
            </div>
            <div className="form-group">
              <label htmlFor="messages-handle">Recipient handle</label>
              <input
                id="messages-handle"
                placeholder="@handle"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="messages-body">Message</label>
              <textarea
                id="messages-body"
                placeholder="Type your note…"
                rows={3}
                value={bodyInput}
                onChange={(e) => setBodyInput(e.target.value)}
              />
            </div>
            <Button onClick={sendMessage} disabled={!user}>
              Send
            </Button>
            {sendStatus ? <p className="theme-footnote">{sendStatus}</p> : null}
          </div>

          <div className="card" style={{ gap: "0.75rem" }}>
            <div className="card-header">
              <div className="card-title">Inbox</div>
              <Badge variant="success">Preview</Badge>
            </div>
            <div className="stat-grid">
              <div className="stat-block">
                <p className="eyebrow">Unread</p>
                <p className="stat-value">{unreadThreads.length}</p>
                <p className="stat-trend">Waiting for you</p>
              </div>
              <div className="stat-block">
                <p className="eyebrow">Total</p>
                <p className="stat-value">{threads.length}</p>
                <p className="stat-trend">Every thread visible</p>
              </div>
            </div>
            <div className="inbox-list">
              {unreadThreads.map((thread) => (
                <div key={thread.id} className="inbox-entry">
                  <span>
                    {thread.name}
                    {thread.verified ? (
                      <span className="verified-pill small">
                        <CheckIcon className="icon-inline icon-success" aria-hidden="true" width={12} height={12} />
                        Verified
                      </span>
                    ) : null}
                  </span>
                  <span>{thread.handle}</span>
                </div>
              ))}
              {unreadThreads.length === 0 ? <span>No unread conversations.</span> : null}
            </div>
            <p className="theme-footnote">Inbox summary mirrors Accounts-Old counts. Hooks coming later.</p>
          </div>

          <div className="card" style={{ gap: "0.75rem" }}>
            <div className="card-header">
              <div className="card-title">All conversations</div>
              <Badge variant="info">Mock</Badge>
            </div>
            <div className="conversation-list">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  className={`conversation-item ${activeThreadId === thread.id ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveThreadId(thread.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div className="conversation-title-row">
                      <strong>{thread.name}</strong>
                      {thread.verified ? (
                        <span className="verified-pill small">
                          <CheckIcon className="icon-inline icon-success" aria-hidden="true" width={12} height={12} />
                          Verified
                        </span>
                      ) : null}
                      <span className="conversation-meta">{thread.handle}</span>
                      {thread.unread ? <span className="unread-dot" aria-label="Unread message indicator" /> : null}
                    </div>
                    <p className="conversation-meta">{thread.preview}</p>
                  </div>
                  <Badge variant={thread.variant}>{thread.badge}</Badge>
                </button>
              ))}
              {threads.length === 0 ? <p className="theme-footnote">No conversations yet. Send one to get started.</p> : null}
            </div>
            <p className="theme-footnote">All threads are rendered by default until backend wiring lands.</p>
          </div>
        </aside>

        <section className="messages-chat-card">
          <div className="chat-header">
            {activeThreadId ? (
              <div>
                <strong>Conversation</strong>
                <p className="messages-empty-cta">Messages are stored in Firestore. Delivery to peers depends on mirrors.</p>
              </div>
            ) : (
              <div>
                <strong>No conversation selected</strong>
                <p className="messages-empty-cta">Choose a thread from the inbox to load messages.</p>
              </div>
            )}
            <Badge variant="info">Preview</Badge>
          </div>
          {activeThreadId ? (
            <>
              <div className="chat-body">
                {messages.length === 0 ? <p className="messages-empty-cta">No messages yet. Start the conversation.</p> : null}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="chat-message"
                    style={{ alignSelf: message.senderId === user?.uid ? "flex-end" : "flex-start" }}
                  >
                    <strong>{message.senderId === user?.uid ? "You" : "Partner"}</strong>
                    {message.content}
                  </div>
                ))}
              </div>
              <div className="chat-footer">
                <p className="messages-empty-cta">Messages persist in Firestore. Replies from others require their mirrors.</p>
              </div>
            </>
          ) : (
            <>
              <div className="chat-body empty-state">
                <div className="chat-sample" aria-live="polite">
                  <div className="chat-sample-header">
                    <span>Blacklink</span>
                    <span className="verified-pill">
                      <CheckIcon className="icon-inline icon-success" aria-hidden="true" width={12} height={12} />
                      Verified
                    </span>
                    <span className="conversation-meta">@blacklink</span>
                  </div>
                  <p>Welcome to Blacklink Messages! This chat is open to everyone—free for all tiers.</p>
                </div>
                <div className="chat-message">
                  <strong>Blacklink</strong>
                  We will mirror Accounts-Old conversations here. Use the Send a message field to draft a note to @support,
                  @billing, or any teammate once the APIs are ready.
                </div>
              </div>
              <div className="chat-footer">
                <p className="messages-empty-cta">Live conversations arrive later. Preview mode only.</p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const { profile, setUsername, setPhotoUrl, error, loading } = useAuth();
  const [usernameInput, setUsernameInput] = React.useState(profile.username || "");
  const [photoUrlInput, setPhotoUrlInput] = React.useState(profile.photoURL || "");
  const [fontScale, setFontScale] = React.useState(100);
  const [highContrast, setHighContrast] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [loginAlerts, setLoginAlerts] = React.useState(true);
  const [subscriptionAlerts, setSubscriptionAlerts] = React.useState(true);
  const [browserNotifications, setBrowserNotifications] = React.useState(false);
  const [photoZoom, setPhotoZoom] = React.useState(110);
  const [photoOffsetX, setPhotoOffsetX] = React.useState(0);
  const [photoOffsetY, setPhotoOffsetY] = React.useState(0);
  const [photoPreview, setPhotoPreview] = React.useState(profile.photoURL || "");

  const handleUsernameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await setUsername(usernameInput);
  };

  const handlePhotoUrlSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrlInput.trim()) return;
    await setPhotoUrl(photoUrlInput.trim());
    setPhotoPreview(photoUrlInput.trim());
  };

  const handlePhotoFile = async (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        setPhotoUrlInput(result);
        setPhotoPreview(result);
        await setPhotoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyCrop = async () => {
    if (!photoPreview) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = photoPreview;
    await new Promise((res) => {
      img.onload = res;
    });
    const size = 320;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scale = photoZoom / 100;
    const centerX = size / 2 + photoOffsetX;
    const centerY = size / 2 + photoOffsetY;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
    ctx.restore();
    const dataUrl = canvas.toDataURL("image/png");
    setPhotoPreview(dataUrl);
    setPhotoUrlInput(dataUrl);
    await setPhotoUrl(dataUrl);
  };

  return (
    <div className="profile-page-container">
      <div className="profile-header-card">
        <div className="profile-info">
          <div className="profile-avatar">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} referrerPolicy="no-referrer" />
            ) : (
              profile.displayName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="profile-details">
            <div className="profile-name">
              Settings
              <span className={`tier-badge ${profile.tier.toUpperCase().includes("ULTRA") ? "ultra-plus" : "ultra"}`}>
                {formatTier(profile.tier)}
              </span>
            </div>
            <div className="profile-email">{profile.email}</div>
          </div>
        </div>
      </div>

      <section className="profile-section">
        <div className="profile-section-title">
          <div className="profile-section-icon">
            <SettingsIcon className="icon-inline" aria-hidden="true" />
          </div>
          General
        </div>
        <form className="profile-info-grid" onSubmit={handleUsernameSave}>
          <div className="info-item">
            <span className="info-label">Display name</span>
            <span className="info-value">{profile.displayName}</span>
          </div>
          <div className="info-item">
            <label className="info-label" htmlFor="username-input">
              Username
            </label>
            <input
              id="username-input"
              className="info-value"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="username"
            />
            <p className="profile-section-note">District users automatically get .wsdr4 appended.</p>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Saving..." : "Save username"}
            </Button>
            {error === "username-taken" ? (
              <p className="form-error">Username is taken.</p>
            ) : error === "username-empty" ? (
              <p className="form-error">Username cannot be empty.</p>
            ) : null}
          </div>
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{profile.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Organization</span>
            <span className="info-value">{profile.organization || "—"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Tier</span>
            <span className="info-value">{formatTier(profile.tier)}</span>
          </div>
        </form>
      </section>

      <section className="profile-section">
        <div className="profile-section-title">
          <div className="profile-section-icon">
            <PhotoIcon className="icon-inline" aria-hidden="true" />
          </div>
          Profile photo
        </div>
        <form className="profile-info-grid" onSubmit={handlePhotoUrlSave}>
          <div className="info-item">
            <label className="info-label" htmlFor="photo-url">
              Photo URL
            </label>
            <input
              id="photo-url"
              className="info-value"
              value={photoUrlInput}
              onChange={(e) => setPhotoUrlInput(e.target.value)}
              placeholder="https://example.com/avatar.png"
            />
            <div className="component-row">
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? "Saving..." : "Save photo"}
              </Button>
              <label className="file-input-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoFile(e.target.files?.[0])}
                  style={{ display: "none" }}
                />
                <span className="pill">Upload image</span>
              </label>
            </div>
            <p className="profile-section-note">We store the URL on your user doc for consistent sizing.</p>
          </div>
          <div className="info-item">
            <span className="info-label">Preview & crop</span>
            <div className="avatar-editor">
              <div className="avatar-editor-preview" role="img" aria-label="Profile preview">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{
                      transform: `translate(${photoOffsetX}px, ${photoOffsetY}px) scale(${photoZoom / 100})`,
                    }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="fallback-avatar">{profile.displayName.slice(0, 2).toUpperCase()}</div>
                )}
              </div>
              <label className="slider-label">
                Zoom ({photoZoom}%)
                <input
                  className="slider"
                  type="range"
                  min="80"
                  max="180"
                  value={photoZoom}
                  onChange={(e) => setPhotoZoom(Number(e.target.value))}
                  aria-label="Photo zoom"
                />
              </label>
              <div className="component-row">
                <label className="slider-label">
                  Offset X
                  <input
                    className="slider"
                    type="range"
                    min="-80"
                    max="80"
                    value={photoOffsetX}
                    onChange={(e) => setPhotoOffsetX(Number(e.target.value))}
                    aria-label="Photo horizontal offset"
                  />
                </label>
                <label className="slider-label">
                  Offset Y
                  <input
                    className="slider"
                    type="range"
                    min="-80"
                    max="80"
                    value={photoOffsetY}
                    onChange={(e) => setPhotoOffsetY(Number(e.target.value))}
                    aria-label="Photo vertical offset"
                  />
                </label>
              </div>
              <Button type="button" size="sm" onClick={applyCrop}>
                Save cropped avatar
              </Button>
            </div>
          </div>
        </form>
      </section>

      <section className="profile-section">
        <div className="profile-section-title">
          <div className="profile-section-icon">
            <CompassIcon className="icon-inline" aria-hidden="true" />
          </div>
          Accessibility
        </div>
        <div className="profile-info-grid">
          <div className="info-item">
            <span className="info-label">Font scaling</span>
            <input
              className="slider"
              type="range"
              min="80"
              max="140"
              step="5"
              value={fontScale}
              onChange={(e) => setFontScale(Number(e.target.value))}
            />
            <span className="info-value">{fontScale}%</span>
          </div>
          <div className="info-item info-toggle">
            <span className="info-label">Reduced motion</span>
            <label className={`toggle-switch ${reducedMotion ? "on" : ""}`}>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
              />
              <span className="toggle-thumb" />
            </label>
          </div>
          <div className="info-item info-toggle">
            <span className="info-label">High contrast</span>
            <label className={`toggle-switch ${highContrast ? "on" : ""}`}>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
              />
              <span className="toggle-thumb" />
            </label>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-title">
          <div className="profile-section-icon">
            <BellIcon className="icon-inline" aria-hidden="true" />
          </div>
          Notifications
        </div>
        <div className="profile-info-grid">
          <div className="info-item info-toggle">
            <span className="info-label">Login alerts</span>
            <label className={`toggle-switch ${loginAlerts ? "on" : ""}`}>
              <input
                type="checkbox"
                checked={loginAlerts}
                onChange={(e) => setLoginAlerts(e.target.checked)}
              />
              <span className="toggle-thumb" />
            </label>
          </div>
          <div className="info-item info-toggle">
            <span className="info-label">Subscription alerts</span>
            <label className={`toggle-switch ${subscriptionAlerts ? "on" : ""}`}>
              <input
                type="checkbox"
                checked={subscriptionAlerts}
                onChange={(e) => setSubscriptionAlerts(e.target.checked)}
              />
              <span className="toggle-thumb" />
            </label>
          </div>
          <div className="info-item info-toggle">
            <span className="info-label">Browser notifications</span>
            <label className={`toggle-switch ${browserNotifications ? "on" : ""}`}>
              <input
                type="checkbox"
                checked={browserNotifications}
                onChange={(e) => setBrowserNotifications(e.target.checked)}
              />
              <span className="toggle-thumb" />
            </label>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-title">
          <div className="profile-section-icon">
            <ShieldIcon className="icon-inline" aria-hidden="true" />
          </div>
          Security & Privacy
        </div>
        <div className="profile-info-grid">
          <div className="info-item">
            <span className="info-label">MFA</span>
            <span className="info-value">Enabled</span>
          </div>
          <div className="info-item">
            <span className="info-label">Device trust</span>
            <span className="info-value">{profile.devices ?? "—"} devices</span>
          </div>
          <div className="info-item">
            <span className="info-label">SSO providers</span>
            <span className="info-value">Google, ClassLink</span>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-title">
          <div className="profile-section-icon">
            <BoltIcon className="icon-inline" aria-hidden="true" />
          </div>
          QuickLaunch settings
        </div>
        <p className="profile-section-note">Manage apps from the dashboard QuickLaunch section.</p>
      </section>
    </div>
  );
};

const SubscriptionPage = () => {
  const { profile } = useAuth();
  const currentTier = profile.tier.toUpperCase();

  const plans = [
    {
      id: "FREE",
      name: "Free",
      price: "$0",
      period: "/ month",
      features: ["Core Blacklink apps", "Standard privacy controls", "QuickLaunch and profile basics"],
      cta: "Current Plan",
      variant: "secondary" as const,
    },
    {
      id: "ULTRA",
      name: "ULTRA",
      price: "$10",
      period: "/ month",
      features: [
        "$10 Aero AI credits monthly",
        "25+ premium themes",
        "QuickLaunch analytics & automations",
        "Priority support & feature flighting",
      ],
      cta: "Upgrade to ULTRA",
      variant: "primary" as const,
    },
    {
      id: "ULTRA_PLUS",
      name: "ULTRA+",
      price: "$25",
      period: "/ month",
      features: [
        "Everything in ULTRA",
        "$25 Aero AI credits & pooled tokens",
        "Custom theme builder (Beta)",
        "Experimental feature access",
      ],
      cta: "Unlock ULTRA+",
      variant: "primary" as const,
    },
  ];

  const ultraFeatures = [
    {
      name: "Aero credits",
      description: "Monthly Aero token allocation with pooled support.",
      tier: "ULTRA+",
      status: "Ready",
    },
    {
      name: "Theme builder",
      description: "Custom theme presets (Beta).",
      tier: "ULTRA+",
      status: "Ready",
    },
    {
      name: "QuickLaunch automations",
      description: "Analytics & automations for shortcuts.",
      tier: "ULTRA",
      status: "Ready",
    },
  ];

  return (
    <div className="page-shell">
      <div className="hero card">
        <div className="release-chip">
          <span aria-hidden="true">
            <ConfettiIcon className="icon-inline icon-accent" width={16} height={16} />
          </span>
          Accounts 3.9
        </div>
        <h1 style={{ margin: 0 }}>Choose the right plan</h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "640px" }}>
          Whether you’re exploring Blacklink for free or need ULTRA+ benefits, here are all tiers and how to activate
          them instantly.
        </p>
        <div className="component-row">
          <Button onClick={() => window.open("https://buymeacoffee.com/Blacklink/membership", "_blank")}>
            Get ULTRA Membership
          </Button>
          <Button variant="secondary" onClick={() => (window.location.href = "mailto:support@blacklink.net")}>
            Contact Sales
          </Button>
        </div>
      </div>

      <div className="plan-grid">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`plan-card ${plan.id === "ULTRA" ? "featured" : ""}`}
            aria-label={`${plan.name} plan`}
          >
            <h3>{plan.name}</h3>
            <p className="plan-price">
              {plan.price} <span>{plan.period}</span>
            </p>
            <ul className="plan-features">
              {plan.features.map((feat) => (
                <li key={feat}>
                  <CheckIcon className="icon-inline icon-success" aria-hidden="true" width={16} height={16} />
                  {feat}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.variant}
              disabled={currentTier.includes(plan.id)}
              aria-label={`${plan.cta} ${plan.name}`}
            >
              {currentTier.includes(plan.id) ? "Current Plan" : plan.cta}
            </Button>
            <p className="plan-meta">
              {plan.id === "FREE"
                ? "Perfect for students or trying out Blacklink."
                : plan.id === "ULTRA"
                  ? "Unlock automation, customization, and faster response times."
                  : "Best for power users, early adopters, and creators."}
            </p>
          </article>
        ))}
      </div>

      <section
        className="comparison-card"
        style={{
          background: "linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(99, 102, 241, 0.08))",
          borderColor: "rgba(236, 72, 153, 0.3)",
        }}
      >
        <div className="comparison-grid">
          <div className="comparison-pill">
            <ShieldIcon className="icon-inline icon-accent" aria-hidden="true" width={16} height={16} />
            Employee / District perks honored for ULTRA+
          </div>
          <div className="comparison-pill">
            <BoltIcon className="icon-inline icon-warning" aria-hidden="true" width={16} height={16} />
            Fast activation—no downtime
          </div>
          <div className="comparison-pill">
            <PaletteIcon className="icon-inline icon-accent" aria-hidden="true" width={16} height={16} />
            Premium themes unlocked
          </div>
        </div>
      </section>

      <div className="ultra-feature-grid" style={{ marginTop: "2rem" }}>
        {ultraFeatures.map((feat) => (
          <div key={feat.name} className="ultra-feature-card">
            <div className="ultra-feature-name">{feat.name}</div>
            <div className="ultra-feature-description">{feat.description}</div>
            <div className="feature-meta">
              <span className={`feature-tier-pill ${feat.tier === "ULTRA_PLUS" ? "tier-ultra-plus" : "tier-ultra"}`}>
                {feat.tier}
              </span>
              <span className={`feature-status ${feat.status === "Ready" ? "ready" : "locked"}`}>{feat.status}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="cta-banner">
        <strong>Need invoices or finance contacts?</strong>
        <p className="theme-footnote">Download invoices or email finance. Reach out to support@blacklink.net.</p>
        <div className="component-row">
          <Button variant="secondary" size="sm">
            View invoices
          </Button>
          <Button size="sm">Contact support</Button>
        </div>
      </div>
    </div>
  );
};

const PrivacyPage = () => (
  <div className="page-shell">
    <PageHero
      title="Privacy"
      subtitle="Data handling, retention, and compliance posture for Accounts 4.0."
      badge={<Badge variant="info">Updated</Badge>}
    />
    <PageSection title="Highlights" badge={<Badge variant="success">Secure</Badge>}>
      <ul className="list">
        <li>Data residency aligned to your region.</li>
        <li>Audit logging and export for all sensitive actions.</li>
        <li>SSO, passkeys, and MFA available for every workspace.</li>
      </ul>
      <p className="theme-footnote">Contact security@blacklink.app for DSRs.</p>
    </PageSection>
  </div>
);

const BetaPage = () => (
  <div className="page-shell">
    <div className="beta-hero">
      <div className="beta-hero-content">
        <div className="pill">
          <FlaskIcon className="icon-inline icon-accent" aria-hidden="true" width={16} height={16} /> Blacklink Beta
        </div>
        <h1>
          <RocketIcon className="icon-inline icon-accent" aria-hidden="true" width={18} height={18} /> Try upcoming
          Blacklink experiences
        </h1>
        <p>
          Opt in to the Beta program to preview releases while keeping core flows stable. Parity first, no new features.
        </p>
        <div className="component-row">
          <Button size="sm">Opt in to Beta</Button>
          <Button size="sm" variant="secondary">
            View current betas
          </Button>
        </div>
      </div>
    </div>
    <div className="beta-grid">
      <div className="beta-card">
        <h2>
          <span aria-hidden="true">
            <ClipboardIcon className="icon-inline icon-accent" width={16} height={16} />
          </span>
          Preferences
        </h2>
        <div className="beta-list">
          <div className="beta-card">
            <h3>
              <CheckIcon className="icon-inline icon-success" aria-hidden="true" width={16} height={16} />
              Accounts 4.0 UI and settings
            </h3>
            <p className="muted">Early access to settings + privacy center updates.</p>
          </div>
          <div className="beta-card">
            <h3>
              <LockIcon className="icon-inline icon-muted" aria-hidden="true" width={16} height={16} /> Privacy &
              data controls
            </h3>
            <p className="muted">Data controls, permissions, audit surfaces.</p>
          </div>
          <div className="beta-card">
            <h3>
              <PaletteIcon className="icon-inline icon-accent" aria-hidden="true" width={16} height={16} /> Themes &
              accessibility
            </h3>
            <p className="muted">Themes, accessibility tweaks, and layout polish.</p>
          </div>
        </div>
      </div>
      <div className="beta-card">
        <h2>
          <span aria-hidden="true">
            <CompassIcon className="icon-inline icon-accent" aria-hidden="true" width={16} height={16} />
          </span>
          Beta tracks
        </h2>
        <div className="beta-meta">
          <span className="status upcoming">
            <RoadIcon className="icon-inline icon-muted" aria-hidden="true" width={16} height={16} /> Upcoming
          </span>
          <div className="tags">
            <span className="tag">
              <TagIcon className="icon-inline icon-muted" aria-hidden="true" width={12} height={12} /> Accounts
            </span>
            <span className="tag">
              <TagIcon className="icon-inline icon-muted" aria-hidden="true" width={12} height={12} /> UI
            </span>
            <span className="tag">
              <TagIcon className="icon-inline icon-muted" aria-hidden="true" width={12} height={12} /> Settings
            </span>
          </div>
        </div>
        <p className="muted">
          Accounts 4.0 preview: settings, theme system, privacy center, organized user subcollections.
        </p>
      </div>
    </div>
  </div>
);

const AdminPage = () => (
  <div className="page-shell">
    <PageHero
      title="Admin center"
      subtitle="Control member roles, danger actions, and environment toggles."
      badge={<Badge variant="danger">Admin</Badge>}
    />
    <PageSection title="Controls" badge={<Badge variant="warning">Caution</Badge>}>
      <div className="component-row">
        <Button
          variant="danger"
          icon={<BoltIcon className="icon-inline icon-warning" aria-hidden="true" width={16} height={16} />}
        >
          Suspend org
        </Button>
        <Button variant="secondary">Rotate secrets</Button>
        <Button variant="secondary">Review logs</Button>
      </div>
      <p className="theme-footnote">
        These templates are placeholders; wire them to your admin services before production.
      </p>
    </PageSection>
  </div>
);

const AdminRoute = () => {
  const { profile } = useAuth();
  if (!profile.isAdmin) {
    return (
      <div className="page-shell">
        <PageHero
          title="Unauthorized"
          subtitle="You need admin access to view this page."
          badge={<Badge variant="danger">Restricted</Badge>}
        />
      </div>
    );
  }
  return <AdminPage />;
};

const LogoutPage = () => {
  const { signOutUser } = useAuth();
  React.useEffect(() => {
    signOutUser().finally(() => {
      window.location.href = "/login";
    });
  }, []);
  return (
    <div className="page-shell">
      <PageHero title="Signing out" subtitle="Clearing your session..." badge={<Badge>Logout</Badge>} />
    </div>
  );
};

const NotificationsPage = () => (
  <div className="page-shell">
    <PageHero title="Notifications" subtitle="Notification preferences" badge={<Badge>Settings</Badge>} />
    <PageSection title="Email & system alerts" badge={<Badge variant="info">Notifications</Badge>}>
      <ul className="list">
        <li>Security alerts</li>
        <li>Billing alerts</li>
        <li>System notifications</li>
      </ul>
    </PageSection>
  </div>
);

const SecurityPage = () => (
  <div className="page-shell">
    <PageHero title="Security" subtitle="Security controls" badge={<Badge>Security</Badge>} />
    <PageSection title="Devices & sessions" badge={<Badge variant="info">Sessions</Badge>}>
      <p className="theme-footnote">List active sessions, devices, and login history.</p>
    </PageSection>
  </div>
);

const DevicesPage = () => (
  <div className="page-shell">
    <PageHero title="Devices" subtitle="Trusted devices and removal" badge={<Badge>Devices</Badge>} />
    <PageSection title="Device list" badge={<Badge variant="info">Devices</Badge>}>
      <p className="theme-footnote">Device management UI.</p>
    </PageSection>
  </div>
);

const VisibilityPage = () => (
  <VisibilityContent />
);

const VisibilityContent = () => {
  const { profile } = useAuth();
  const { setTheme, settings } = useTheme();
  const isUltra = profile.tier?.toUpperCase().includes("ULTRA");
  const [customPrimary, setCustomPrimary] = React.useState("#8b5cf6");
  const [customPrimaryHover, setCustomPrimaryHover] = React.useState("#7c3aed");
  const [customBg, setCustomBg] = React.useState("#0b1020");
  const [customBgSecondary, setCustomBgSecondary] = React.useState("#0f162a");
  const [customCard, setCustomCard] = React.useState("#131a2c");
  const [customBorder, setCustomBorder] = React.useState("#243047");
  const [customText, setCustomText] = React.useState("#e5e7eb");
  const [customTextSecondary, setCustomTextSecondary] = React.useState("#9ca3af");

  const applyCustomTheme = () => {
    const root = document.documentElement;
    root.style.setProperty("--primary", customPrimary);
    root.style.setProperty("--primary-hover", customPrimaryHover);
    root.style.setProperty("--bg", customBg);
    root.style.setProperty("--bg-secondary", customBgSecondary);
    root.style.setProperty("--card-bg", customCard);
    root.style.setProperty("--border", customBorder);
    root.style.setProperty("--text", customText);
    root.style.setProperty("--text-secondary", customTextSecondary);
  };

  const visibleThemes = isUltra ? themeOptions : themeOptions.filter((t) => t.tier === "core");
  const handleApplyTheme = (opt: ThemeOption) => {
    setTheme(opt.id);
  };

  return (
    <div className="page-shell">
      <PageHero
        title="Visibility & Themes"
        subtitle="Appearance, privacy, accessibility, and theme selection"
        badge={<Badge variant="info">Accounts-Old</Badge>}
      />

      <PageSection title="Theme preview" badge={<Badge variant="success">Preview</Badge>}>
        <p className="theme-footnote">Preview reflects your currently selected theme.</p>
        <div className="theme-preview-card">
          <div className="preview-header">
            <div className="preview-logo">BL</div>
            <div className="preview-nav">
              <span className="pill">Dashboard</span>
              <span className="pill pill-outline">Settings</span>
            </div>
          </div>
          <div className="preview-content">
            <div className="preview-card">
              <div className="preview-card-title">Welcome back!</div>
              <div className="preview-card-text">This is how your interface will look with the selected theme.</div>
              <Button size="sm">Get started</Button>
            </div>
            <div className="preview-card preview-card-secondary">
              <div className="preview-stat">
                <div className="preview-stat-value">24</div>
                <div className="preview-stat-label">Apps</div>
              </div>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection title="Choose a theme" badge={<Badge variant="info">{isUltra ? "ULTRA" : "Core"}</Badge>}>
        <div className="theme-grid">
          {visibleThemes.map((opt) => (
            <div key={opt.id} className={`theme-card ${settings.theme === opt.id ? "active" : ""}`}>
              <div className="theme-card-header">
                <div>
                  <div className="theme-card-title">{opt.label}</div>
                  <div className="theme-card-sub">{opt.description}</div>
                </div>
                <span className="theme-chip">{opt.tier === "ultra" ? "ULTRA" : "Core"}</span>
              </div>
              <div className="theme-card-actions">
                <Button size="sm" variant={settings.theme === opt.id ? "secondary" : "primary"} onClick={() => handleApplyTheme(opt)}>
                  {settings.theme === opt.id ? "Active" : "Apply"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      {isUltra ? (
        <PageSection title="ULTRA+ Theme Mixer (Beta)" badge={<Badge variant="ultra-plus">Beta</Badge>}>
          <div className="theme-maker-columns">
            <div className="theme-maker-grid">
              <label className="theme-maker-field">
                <span>Primary gradient start</span>
                <input type="color" value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} />
              </label>
              <label className="theme-maker-field">
                <span>Primary gradient end</span>
                <input type="color" value={customPrimaryHover} onChange={(e) => setCustomPrimaryHover(e.target.value)} />
              </label>
              <label className="theme-maker-field">
                <span>Background</span>
                <input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} />
              </label>
              <label className="theme-maker-field">
                <span>Background secondary</span>
                <input type="color" value={customBgSecondary} onChange={(e) => setCustomBgSecondary(e.target.value)} />
              </label>
              <label className="theme-maker-field">
                <span>Card background</span>
                <input type="color" value={customCard} onChange={(e) => setCustomCard(e.target.value)} />
              </label>
              <label className="theme-maker-field">
                <span>Border</span>
                <input type="color" value={customBorder} onChange={(e) => setCustomBorder(e.target.value)} />
              </label>
              <label className="theme-maker-field">
                <span>Text</span>
                <input type="color" value={customText} onChange={(e) => setCustomText(e.target.value)} />
              </label>
              <label className="theme-maker-field">
                <span>Text secondary</span>
                <input type="color" value={customTextSecondary} onChange={(e) => setCustomTextSecondary(e.target.value)} />
              </label>
            </div>

            <div className="theme-palette">
              <div className="theme-palette-header">
                <span>Palette</span>
                <span className="theme-footnote">Tap to apply to primary/hover</span>
              </div>
              <div className="theme-palette-grid">
                {visibleThemes.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className="theme-swatch-btn"
                    title={opt.label}
                    onClick={() => {
                        // Approximate palette by reusing current theme colors
                        setCustomPrimary(customPrimary);
                        setCustomPrimaryHover(customPrimaryHover);
                    }}
                    style={{
                      background: settings.theme === opt.id ? "var(--primary)" : "var(--border)",
                    }}
                  >
                    {opt.label[0]}
                  </button>
                ))}
              </div>
              <div className="theme-palette-grid scrollable-swatches">
                {["#8b5cf6", "#7c3aed", "#0ea5e9", "#22c55e", "#f97316", "#f43f5e", "#eab308", "#06b6d4", "#6366f1", "#0f172a"].map(
                  (hex) => (
                    <button
                      key={hex}
                      type="button"
                      className="theme-swatch-btn"
                      style={{ background: hex }}
                      onClick={() => {
                        setCustomPrimary(hex);
                        setCustomPrimaryHover(hex);
                      }}
                    />
                  ),
                )}
              </div>
              <div className="component-row" style={{ marginTop: "0.5rem" }}>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    applyCustomTheme();
                  }}
                >
                  Apply to gradients
                </Button>
              </div>
            </div>
          </div>
          <div
            className="theme-maker-preview"
            style={{
              background: `linear-gradient(135deg, ${customPrimary}, ${customPrimaryHover})`,
              borderColor: customBorder,
            }}
          >
            <div className="preview-logo" style={{ background: customPrimary }}>BL</div>
            <div>
              <p className="theme-footnote">Live preview</p>
              <p className="theme-footnote">
                Gradient, card, and border colors will be written to CSS vars on apply.
              </p>
            </div>
          </div>
          <div
            className="theme-maker-preview"
            style={{
              background: customCard,
              borderColor: customBorder,
              height: "220px",
              color: customText,
            }}
          >
            <div style={{ color: customPrimary, fontWeight: 700, fontSize: "1.1rem" }}>Cards</div>
            <p className="theme-footnote" style={{ color: customTextSecondary }}>
              Buttons and text adopt your palette.
            </p>
            <div className="component-row">
              <Button size="sm" variant="primary">Primary</Button>
              <Button size="sm" variant="secondary">Secondary</Button>
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              <span className="pill" style={{ background: customBgSecondary, color: customText }}>Pill</span>
            </div>
          </div>
          <Button variant="primary" onClick={applyCustomTheme}>
            Apply custom theme
          </Button>
          <div className="component-row" style={{ marginTop: "0.5rem" }}>
            <Button
              variant="secondary"
              onClick={() => setTheme("midnight")}
            >
              Switch to Midnight
            </Button>
            <Button
              onClick={() => {
                setCustomPrimary("#8b5cf6");
                setCustomPrimaryHover("#7c3aed");
                setCustomBg("#0b1020");
                setCustomBgSecondary("#0f162a");
                setCustomCard("#131a2c");
                setCustomBorder("#243047");
                setCustomText("#e5e7eb");
                setCustomTextSecondary("#9ca3af");
                applyCustomTheme();
              }}
              style={{ background: "#dc2626", color: "#fff", border: "1px solid #b91c1c" }}
            >
              Reset Theme
            </Button>
          </div>
        </PageSection>
      ) : null}

      <PageSection title="Visibility & privacy" badge={<Badge variant="info">Privacy</Badge>}>
        <ul className="list">
          <li>Profile visibility: Public / Org / Private</li>
          <li>Last active: show / hide</li>
          <li>App visibility: QuickLaunch and connected apps</li>
          <li>Data sharing for SSO / external integrations</li>
        </ul>
      </PageSection>

      <PageSection title="Accessibility" badge={<Badge variant="success">Accessibility</Badge>}>
        <ul className="list">
          <li>Reduce motion</li>
          <li>High contrast</li>
          <li>Large text</li>
          <li>Focus indicators</li>
        </ul>
      </PageSection>

      <PageSection title="Display customization" badge={<Badge variant="info">UI</Badge>}>
        <ul className="list">
          <li>Border radius presets (sharp, small, medium, large, round)</li>
          <li>UI density (compact, comfortable, spacious)</li>
          <li>Smooth scrolling toggle</li>
          <li>Compact mode toggle</li>
        </ul>
      </PageSection>
    </div>
  );
};

const QuickLaunchPage = () => {
  const { quickLaunch, addQuickLaunch, updateQuickLaunch, deleteQuickLaunch } = useAuth();
  const [search, setSearch] = React.useState("");
  const [showFavorites, setShowFavorites] = React.useState(false);
  const [draft, setDraft] = React.useState<Omit<QuickLaunchApp, "id">>({
    name: "",
    url: "",
    icon: "bolt",
    favorite: false,
    group: "General",
    color: "",
  });
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const filtered = quickLaunch.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.url.toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = showFavorites ? app.favorite : true;
    return matchesSearch && matchesFavorite;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.url.trim()) return;
    if (editingId) {
      await updateQuickLaunch(editingId, draft);
    } else {
      await addQuickLaunch(draft);
    }
    setDraft({ name: "", url: "", icon: "bolt", favorite: false });
    setEditingId(null);
  };

  const handleEdit = (app: QuickLaunchApp) => {
    setEditingId(app.id);
    setDraft({
      name: app.name,
      url: app.url,
      icon: app.icon || "bolt",
      favorite: Boolean(app.favorite),
      group: app.group || "General",
      color: app.color || "",
    });
  };

  return (
    <div className="page-shell">
      <PageHero title="QuickLaunch" subtitle="Manage shortcuts" badge={<Badge>Shortcuts</Badge>} />
      <PageSection title="Apps" badge={<Badge variant="info">QuickLaunch</Badge>}>
        <div className="quicklaunch">
          <form className="quicklaunch-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="form-label" htmlFor="ql-name">
                Name
              </label>
              <input
                id="ql-name"
                value={draft.name}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nova"
                required
              />
            </div>
            <div className="form-row">
              <label className="form-label" htmlFor="ql-url">
                URL
              </label>
              <input
                id="ql-url"
                value={draft.url}
                onChange={(e) => setDraft((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://nova.blacklink.app"
                required
              />
            </div>
            <div className="form-row">
              <label className="form-label" htmlFor="ql-icon">
                Icon
              </label>
              <input
                id="ql-icon"
                value={draft.icon}
                onChange={(e) => setDraft((prev) => ({ ...prev, icon: e.target.value || "bolt" }))}
                placeholder="bolt"
              />
            </div>
            <div className="form-row">
              <label className="form-label" htmlFor="ql-group">
                Group
              </label>
              <input
                id="ql-group"
                value={draft.group}
                onChange={(e) => setDraft((prev) => ({ ...prev, group: e.target.value }))}
                placeholder="General"
              />
            </div>
            <div className="form-row">
              <label className="form-label" htmlFor="ql-color">
                Color (optional)
              </label>
              <input
                id="ql-color"
                type="color"
                value={draft.color || "#667eea"}
                onChange={(e) => setDraft((prev) => ({ ...prev, color: e.target.value }))}
              />
            </div>
            <label className={`toggle-switch ${draft.favorite ? "on" : ""}`}>
              <input
                type="checkbox"
                checked={draft.favorite}
                onChange={(e) => setDraft((prev) => ({ ...prev, favorite: e.target.checked }))}
              />
              <span className="toggle-thumb" />
              <span className="toggle-label">Favorite</span>
            </label>
            <div className="component-row">
              <Button type="submit" size="sm">
                {editingId ? "Save changes" : "Add app"}
              </Button>
              {editingId ? (
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setDraft({ name: "", url: "", icon: "bolt", favorite: false });
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>

          <div className="quicklaunch-toolbar">
            <div className="search-apps">
              <span className="search-icon" aria-hidden="true">
                <SearchIcon className="icon-inline icon-muted" width={16} height={16} />
              </span>
              <input
                type="search"
                aria-label="Search quicklaunch apps"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search apps"
              />
            </div>
            <div className="quicklaunch-filters">
              <button
                type="button"
                className={`chip-toggle ${!showFavorites ? "active" : ""}`}
                onClick={() => setShowFavorites(false)}
              >
                All
              </button>
              <button
                type="button"
                className={`chip-toggle ${showFavorites ? "active" : ""}`}
                onClick={() => setShowFavorites(true)}
              >
                Favorites
              </button>
            </div>
          </div>

          <div className="apps-grid">
            {filtered.map((app) => (
              <div key={app.id} className="app-card">
                <div className="app-icon">
                  <BoltIcon className="icon-inline" aria-hidden="true" />
                </div>
                <div className="app-name">{app.name}</div>
                <div className="app-url">{app.url}</div>
                <div className="app-actions">
                  <button
                    className="app-action-btn favorite"
                    title="Favorite"
                    type="button"
                    onClick={() => updateQuickLaunch(app.id, { favorite: !app.favorite })}
                  >
                    <StarIcon className="icon-inline icon-warning" aria-hidden="true" width={14} height={14} />
                  </button>
                  <button
                    className="app-action-btn"
                    title="Edit"
                    type="button"
                    onClick={() => handleEdit(app)}
                  >
                    <PencilIcon className="icon-inline icon-muted" aria-hidden="true" width={14} height={14} />
                  </button>
                  <button
                    className="app-action-btn"
                    title="Delete"
                    type="button"
                    onClick={() => deleteQuickLaunch(app.id)}
                  >
                    <TrashIcon className="icon-inline icon-muted" aria-hidden="true" width={14} height={14} />
                  </button>
                </div>
                {app.favorite ? (
                  <span className="usage-chip">
                    <StarIcon className="icon-inline icon-warning" aria-hidden="true" width={12} height={12} />
                    Favorite
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          {filtered.length === 0 ? <p className="theme-footnote">No apps yet.</p> : null}
        </div>
      </PageSection>
    </div>
  );
};

const DevComponentsPage = () => (
  <div className="page-shell">
    <PageHero title="Dev Components" subtitle="Visual testbed for CSS components" badge={<Badge>Dev</Badge>} />
    <div className="grid grid-2">
      <PageSection title="Buttons" badge={<Badge variant="info">UI</Badge>}>
        <div className="component-row">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button
            variant="success"
            icon={<CheckIcon className="icon-inline icon-success" aria-hidden="true" width={14} height={14} />}
          >
            Success
          </Button>
          <Button
            variant="danger"
            icon={<AlertTriangleIcon className="icon-inline icon-warning" aria-hidden="true" width={14} height={14} />}
          >
            Danger
          </Button>
        </div>
      </PageSection>
      <PageSection title="Badges" badge={<Badge variant="info">UI</Badge>}>
        <div className="component-row badge-row">
          <Badge>Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="ultra-plus">ULTRA+</Badge>
        </div>
      </PageSection>
    </div>

    <div className="grid grid-2">
      <PageSection title="Inputs" badge={<Badge variant="info">Form</Badge>}>
        <div className="form-group">
          <label htmlFor="dev-input">Text input</label>
          <input id="dev-input" placeholder="Type here" />
        </div>
        <div className="form-group">
          <label htmlFor="dev-select">Select</label>
          <select id="dev-select" className="select-dropdown">
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>
      </PageSection>
      <PageSection title="Toggles & sliders" badge={<Badge variant="info">Form</Badge>}>
        <div className="component-row">
          <label className="toggle-switch on">
            <input type="checkbox" defaultChecked />
            <span className="toggle-thumb" />
          </label>
          <label className="toggle-switch">
            <input type="checkbox" />
            <span className="toggle-thumb" />
          </label>
          <div style={{ flex: 1, minWidth: "160px" }}>
            <input className="slider" type="range" min="0" max="100" defaultValue="50" />
          </div>
        </div>
      </PageSection>
    </div>

    <PageSection title="Card & list" badge={<Badge variant="info">Layout</Badge>}>
      <div className="profile-info-grid">
        <div className="info-item">
          <span className="info-label">Label</span>
          <span className="info-value">Value</span>
        </div>
        <div className="info-item">
          <span className="info-label">Long text</span>
          <span className="info-value">This value wraps to demonstrate text wrapping in info boxes.</span>
        </div>
      </div>
    </PageSection>

    <PageSection title="Route map" badge={<Badge variant="info">Sitemap</Badge>}>
      <ul className="list">
        <li><a href="/dashboard">/dashboard</a></li>
        <li><a href="/profile">/profile</a></li>
        <li><a href="/settings">/settings</a></li>
        <li><a href="/subscription">/subscription</a></li>
        <li><a href="/beta">/beta</a></li>
        <li><a href="/about">/about</a></li>
        <li><a href="/admin">/admin</a> (admin only)</li>
        <li><a href="/dev">/dev</a></li>
      </ul>
    </PageSection>
  </div>
);

const ConstructionPage = () => (
  <div className="page-shell">
    <PageHero
      title="Under construction"
      subtitle="This area is still being refreshed for the 4.0 Beta."
      badge={<Badge variant="warning">Building</Badge>}
    />
    <PageSection title="Next steps" badge={<Badge variant="info">Planned</Badge>}>
      <p className="theme-footnote">
        We are porting functionality from the legacy page. Check back soon or use the dashboard for
        live features.
      </p>
    </PageSection>
  </div>
);

const AboutPage = () => (
  <div className="page-shell">
    <PageHero
      title="About Blacklink Accounts"
      subtitle="The unified authentication and subscription platform powering Blacklink products with ULTRA tiers and Aero AI."
      badge={<Badge variant="info">About</Badge>}
    />
    <PageSection title="Current build" badge={<Badge variant="success">Beta 1</Badge>}>
      <div className="build-grid">
        <div className="build-stat">
          <div className="build-stat-label">Version</div>
          <div className="build-stat-value">4.0 Beta 1</div>
        </div>
        <div className="build-stat">
          <div className="build-stat-label">Build Number</div>
          <div className="build-stat-value">4.0.PB1.B1.20251119</div>
        </div>
        <div className="build-stat">
          <div className="build-stat-label">Release Date</div>
          <div className="build-stat-value">November 19 2025</div>
        </div>
        <div className="build-stat">
          <div className="build-stat-label">Status</div>
          <div className="build-stat-value" style={{ color: "var(--success)" }}>
            Beta
          </div>
        </div>
      </div>
    </PageSection>

    <PageSection title="What's new in 4.0 Beta 1" badge={<Badge variant="info">Overview</Badge>}>
      <p className="theme-footnote">Focus on matching existing behavior plus ULTRA+ Theme Mixer and visibility controls.</p>
      <ul className="feature-list">
        <li>Accounts-Old parity across dashboard, profile, settings, subscriptions</li>
        <li>Visibility & Privacy center restored with theme mixer</li>
        <li>ULTRA+ Theme Mixer (beta) with gradient/custom color palette</li>
        <li>Announcement bar for build identifiers</li>
        <li>
          Admin link gating by <code>users/{"{uid}"}.isAdmin</code>
        </li>
        <li>QuickLaunch CRUD wired to product_pulse/quicklaunch</li>
      </ul>
    </PageSection>

    <PageSection title="Roadmap" badge={<Badge variant="info">Roadmap</Badge>}>
      <div className="roadmap">
        <div className="roadmap-item">
          <span className="roadmap-version current">v3.9 (Current)</span>
          <div className="roadmap-title">Teams, Organizations, Modular Architecture</div>
          <div className="roadmap-description">
            Bridge release between 3.8 and 4.0. Focus on collaboration, modular codebase, and backend readiness.
          </div>
          <ul className="feature-list">
            <li>Team subscriptions and organization accounts</li>
            <li>Shared AeroAI credits</li>
            <li>Org dashboard with roles & permissions</li>
            <li>Connect API groundwork and ClassLink discovery</li>
            <li>ULTRA+ early access features</li>
            <li>Advanced analytics tracking</li>
            <li>Premium themes and live theme picker</li>
          </ul>
        </div>
        <div className="roadmap-item">
          <span className="roadmap-version" style={{ background: "var(--primary)" }}>
            v4.0 (Preview)
          </span>
          <div className="roadmap-title">Parity build on new stack</div>
          <div className="roadmap-description">
            Running the same experience on React + Vite + Hono + Firebase while maintaining data structures.
          </div>
        </div>
      </div>
    </PageSection>

    <PageSection title="Contact" badge={<Badge variant="info">Support</Badge>}>
      <p className="theme-footnote">Need help? Email support@blacklink.net.</p>
    </PageSection>
  </div>
);

const TemplatePage = () => (
  <div className="page-shell">
    <PageHero
      title="Template"
      subtitle="Starter layout for future sections."
      badge={<Badge>Template</Badge>}
    />
    <PageSection title="Starter block" badge={<Badge variant="info">Info</Badge>}>
      <p className="theme-footnote">
        Duplicate this structure to build new pages with the Accounts 4.0 Beta components.
      </p>
    </PageSection>
  </div>
);

const LegalPage = ({ slug, title, description }: { slug: string; title: string; description: string }) => {
  const { content, loading, error } = useMarkdown(`/legal/${slug}.md`);
  return (
    <div className="page-shell">
      <PageHero title={title} subtitle={description} badge={<Badge variant="info">Markdown</Badge>} />
      <PageSection title="Document" badge={<Badge variant="success">Live</Badge>}>
        {loading ? <p className="theme-footnote">Loading document…</p> : null}
        {error ? <p className="form-error">Could not load file: {error}</p> : null}
        {!loading && !error ? (
          <pre className="markdown-viewer" aria-label={`${title} markdown`}>
            {content}
          </pre>
        ) : null}
        <p className="theme-footnote">Place markdown files under /public/legal to update these pages.</p>
      </PageSection>
    </div>
  );
};

const NotFoundPage = () => (
  <div className="page-shell">
    <PageHero
      title="Not found"
      subtitle="The path you requested is not mapped yet. Try a URL like /dashboard or /login."
      badge={<Badge variant="danger">404</Badge>}
    />
  </div>
);

const pages: Record<string, ReactElement> = {
  "/": <HomePage />,
  "/index": <HomePage />,
  "/dashboard": <DashboardPage />,
  "/login": <LoginPage />,
  "/register": <RegisterPage />,
  "/logout": <LogoutPage />,
  "/profile": <ProfilePage />,
  "/messages": <MessagesPage />,
  "/settings": <SettingsPage />,
  "/settings/notifications": <NotificationsPage />,
  "/settings/security": <SecurityPage />,
  "/settings/devices": <DevicesPage />,
  "/settings/visibility": <VisibilityPage />,
  "/settings/quicklaunch": <QuickLaunchPage />,
  "/subscription": <SubscriptionPage />,
  "/privacy": <PrivacyPage />,
  "/beta": <BetaPage />,
  "/admin": <AdminRoute />,
  "/legal/tos": <LegalPage slug="tos" title="Terms of Service" description="Blacklink Accounts Terms (markdown)" />,
  "/legal/privacy": <LegalPage slug="privacy" title="Privacy Policy" description="Blacklink Accounts Privacy Policy" />,
  "/legal/aup": <LegalPage slug="aup" title="Acceptable Use" description="Blacklink AUP (markdown viewer)" />,
  "/construction": <ConstructionPage />,
  "/about": <AboutPage />,
  "/template": <TemplatePage />,
  "/dev": <DevComponentsPage />,
};

export const PageRenderer = ({ path }: PageRendererProps) => {
  const page = pages[path] ?? <NotFoundPage />;
  return page;
};
