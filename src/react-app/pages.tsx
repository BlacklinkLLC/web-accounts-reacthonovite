import React, { ReactElement } from "react";
import { Badge } from "./components/Badge";
import { Button } from "./components/Button";
import { useAuth } from "./providers/AuthProvider";

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
        <span role="img" aria-hidden="true">
          📄
        </span>
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
        <h1>{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        {ctas ? <div className="hero-actions">{ctas}</div> : null}
      </div>
    </div>
  </header>
);

const HomePage = () => (
  <div className="page-shell">
    <PageHero
      title="Blacklink Accounts"
      subtitle="Legacy Accounts experience running inside Accounts 4.0."
      badge={<Badge variant="warning">Port</Badge>}
      ctas={
        <>
          <Button>Open dashboard</Button>
          <Button variant="secondary">Go to settings</Button>
        </>
      }
    />
    <div className="grid grid-3 layout-bottom">
      <PageSection title="Quick links" badge={<Badge variant="info">Legacy</Badge>}>
        <div className="pill-row">
          <span className="pill">Dashboard</span>
          <span className="pill pill-success">Profile</span>
          <span className="pill pill-ultra">Settings</span>
          <span className="pill pill-success">Subscriptions</span>
        </div>
        <p className="theme-footnote">
          Legacy URLs: /dashboard, /profile, /settings, /subscription, /beta, /about.
        </p>
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
        <p className="theme-footnote">Strict 1:1 port. No new features in this phase.</p>
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

const DashboardContent = () => {
  const { profile, quickLaunch } = useAuth();
  const quickLaunchApps = quickLaunch.length
    ? quickLaunch
    : [
        { id: "nova", name: "Nova", url: "https://nova.blacklink.app", icon: "🚀" },
        { id: "admin", name: "Admin", url: "https://admin.blacklink.app", icon: "🛡️" },
        { id: "docs", name: "Docs", url: "https://docs.blacklink.app", icon: "📘" },
        { id: "support", name: "Support", url: "https://support.blacklink.app", icon: "🆘" },
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
          <span className="release-note">Strict port of Accounts-Old. No new features enabled.</span>
        </div>
      </header>
        <PageSection title="QuickLaunch" badge={<Badge variant="info">Accounts-Old</Badge>}>
        <div className="quicklaunch">
          <div className="quicklaunch-header">
            <div className="quicklaunch-title">
              <div className="quicklaunch-icon">⚡</div>
              QuickLaunch
            </div>
            <Button size="sm">Add app</Button>
          </div>
          <div className="quicklaunch-toolbar">
            <div className="search-apps">
              <span className="search-icon">🔎</span>
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
            {filteredApps.map((app) => (
              <a key={app.name} className="app-card" href={app.url}>
                <div className="app-icon">{app.icon}</div>
                <div className="app-name">{app.name}</div>
                <div className="app-url">{app.url}</div>
                <div className="app-actions">
                  <button className="app-action-btn favorite" title="Favorite" type="button">
                    ★
                  </button>
                  <button className="app-action-btn" title="Edit" type="button">
                    ✏️
                  </button>
                  <button className="app-action-btn" title="Delete" type="button">
                    🗑️
                  </button>
                </div>
                {app.favorite ? (
                  <span className="usage-chip">
                    <i>★</i> Favorite
                  </span>
                ) : null}
              </a>
            ))}
          </div>
        </div>
        <p className="theme-footnote">Legacy quicklaunch ported; hook to product_pulse/quicklaunch.</p>
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
  const tierClass = profile.tier.toUpperCase().includes("ULTRA") ? "ultra-plus" : "ultra";
  const username = profile.email ? profile.email.split("@")[0] : "user";
  const apps = quickLaunch.slice(0, 6);

  return (
    <div className="profile-page-container">
      <div className="profile-header-card">
        <div className="profile-info">
          <div className="profile-avatar-legacy">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} referrerPolicy="no-referrer" />
            ) : (
              profile.displayName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="profile-details">
            <div className="profile-name-legacy">
              {profile.displayName}
              <span className={`tier-badge ${tierClass}`}>{formatTier(profile.tier)}</span>
            </div>
            <div className="profile-email">{profile.email}</div>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">{profile.devices ?? "—"}</span>
                <span className="profile-stat-label">Devices</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{apps.length}</span>
                <span className="profile-stat-label">QuickLaunch apps</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{profile.roles?.length || 1}</span>
                <span className="profile-stat-label">Roles</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="profile-section">
        <div className="profile-section-title">
          <div className="profile-section-icon">🪪</div>
          Profile details
        </div>
        <div className="profile-info-grid">
          <div className="info-item">
            <span className="info-label">Display name</span>
            <span className="info-value">{profile.displayName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Username</span>
            <span className="info-value">{username}</span>
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
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-title">
          <div className="profile-section-icon">✨</div>
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
          <div className="profile-section-icon">📦</div>
          QuickLaunch favorites
        </div>
        <div className="profile-app-list">
          {apps.length === 0 ? (
            <p className="theme-footnote">No apps yet. Add some from Dashboard.</p>
          ) : (
            apps.map((app, index) => (
              <div key={app.id} className="profile-app-item">
                <div className="profile-app-primary">
                  <div className="app-icon">{app.icon || "⚡"}</div>
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
          <div className="profile-section-icon">🛡️</div>
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
            <div className="profile-section-icon">🛠️</div>
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

const SettingsPage = () => {
  const { profile, setUsername, error, loading } = useAuth();
  const [usernameInput, setUsernameInput] = React.useState(profile.username || "");

  const handleUsernameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await setUsername(usernameInput);
  };

  return (
    <div className="profile-page-container">
      <div className="profile-header-card">
        <div className="profile-info">
          <div className="profile-avatar-legacy">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} referrerPolicy="no-referrer" />
            ) : (
              profile.displayName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="profile-details">
            <div className="profile-name-legacy">
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
          <div className="profile-section-icon">⚙️</div>
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
          <div className="profile-section-icon">🧭</div>
          Accessibility
        </div>
        <div className="profile-info-grid">
          <div className="info-item">
            <span className="info-label">Font scaling</span>
            <span className="info-value">Default</span>
          </div>
          <div className="info-item">
            <span className="info-label">Reduced motion</span>
            <span className="info-value">Off</span>
          </div>
          <div className="info-item">
            <span className="info-label">High contrast</span>
            <span className="info-value">Off</span>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-title">
          <div className="profile-section-icon">🔔</div>
          Notifications
        </div>
        <div className="profile-info-grid">
          <div className="info-item">
            <span className="info-label">Security alerts</span>
            <span className="info-value">On</span>
          </div>
          <div className="info-item">
            <span className="info-label">Billing emails</span>
            <span className="info-value">On</span>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-title">
          <div className="profile-section-icon">🛡️</div>
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
          <div className="profile-section-icon">⚡</div>
          QuickLaunch settings
        </div>
        <p className="profile-section-note">Manage apps from the dashboard QuickLaunch section.</p>
      </section>
    </div>
  );
};

const SubscriptionPage = () => {
  const { profile } = useAuth();

  return (
    <div className="page-shell">
      <PageHero
        title="Subscription"
        subtitle="Control plan, invoices, and ULTRA feature access."
        badge={<Badge variant="success">Active</Badge>}
      />
      <PageSection title="Plans" badge={<Badge variant="info">Billing</Badge>}>
        <div className="component-grid">
          <div className="mini-card">
            <p className="metric-label">Current</p>
            <p className="metric-value">{formatTier(profile.tier)}</p>
            <p className="theme-footnote">Includes audit pipelines, passkeys, and org limits.</p>
            <Button size="sm">Manage</Button>
          </div>
          <div className="mini-card">
            <p className="metric-label">Invoices</p>
            <p className="metric-value">Up to date</p>
            <p className="theme-footnote">Download CSV or send to finance.</p>
            <Button size="sm" variant="secondary">
              View invoices
            </Button>
          </div>
        </div>
      </PageSection>
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
    <PageHero
      title="Beta program"
      subtitle="Thanks for testing Accounts 4.0 Beta. Your feedback drives the final release."
      badge={<Badge variant="warning">Beta</Badge>}
    />
    <PageSection title="What’s new" badge={<Badge variant="info">Changelog</Badge>}>
      <ul className="list">
        <li>ULTRA palette refresh and theme controls.</li>
        <li>Improved forms and cards across all templates.</li>
        <li>Passkey-first login with device binding.</li>
      </ul>
    </PageSection>
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
        <Button variant="danger" icon="⚡">
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
    <PageHero title="Notifications" subtitle="Legacy notifications settings" badge={<Badge>Legacy</Badge>} />
    <PageSection title="Email & system alerts" badge={<Badge variant="info">Accounts-Old</Badge>}>
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
    <PageHero title="Security" subtitle="Legacy security controls" badge={<Badge>Legacy</Badge>} />
    <PageSection title="Devices & sessions" badge={<Badge variant="info">Accounts-Old</Badge>}>
      <p className="theme-footnote">List active sessions, devices, login history (legacy parity placeholder).</p>
    </PageSection>
  </div>
);

const DevicesPage = () => (
  <div className="page-shell">
    <PageHero title="Devices" subtitle="Trusted devices and removal" badge={<Badge>Legacy</Badge>} />
    <PageSection title="Device list" badge={<Badge variant="info">Accounts-Old</Badge>}>
      <p className="theme-footnote">Legacy device management UI to be ported.</p>
    </PageSection>
  </div>
);

const QuickLaunchPage = () => (
  <div className="page-shell">
    <PageHero title="QuickLaunch" subtitle="Manage shortcuts" badge={<Badge>Legacy</Badge>} />
    <PageSection title="Apps" badge={<Badge variant="info">Accounts-Old</Badge>}>
      <p className="theme-footnote">Legacy QuickLaunch add/edit/delete UI to be ported.</p>
    </PageSection>
  </div>
);

const DevComponentsPage = () => (
  <div className="page-shell">
    <PageHero title="Dev Components" subtitle="Visual testbed for CSS components" badge={<Badge>Dev</Badge>} />
    <div className="grid grid-2">
      <PageSection title="Buttons" badge={<Badge variant="info">UI</Badge>}>
        <div className="component-row">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success" icon="✅">
            Success
          </Button>
          <Button variant="danger" icon="⚠️">
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
      subtitle="Accounts 4.0 Beta modernizes the legacy experience with a new React + Hono + Vite stack while keeping familiar flows intact."
      badge={<Badge variant="info">About</Badge>}
    />
    <PageSection title="Mission" badge={<Badge variant="success">Ready</Badge>}>
      <p className="theme-footnote">
        Secure, fast, and delightful account management that scales with your teams.
      </p>
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

const NotFoundPage = () => (
  <div className="page-shell">
    <PageHero
      title="Not found"
      subtitle="The path you requested is not mapped yet. Try a legacy URL like /dashboard or /login."
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
  "/settings": <SettingsPage />,
  "/settings/notifications": <NotificationsPage />,
  "/settings/security": <SecurityPage />,
  "/settings/devices": <DevicesPage />,
  "/settings/quicklaunch": <QuickLaunchPage />,
  "/subscription": <SubscriptionPage />,
  "/privacy": <PrivacyPage />,
  "/beta": <BetaPage />,
  "/admin": <AdminRoute />,
  "/construction": <ConstructionPage />,
  "/about": <AboutPage />,
  "/template": <TemplatePage />,
  "/dev": <DevComponentsPage />,
};

export const PageRenderer = ({ path }: PageRendererProps) => {
  const page = pages[path] ?? <NotFoundPage />;
  return page;
};
