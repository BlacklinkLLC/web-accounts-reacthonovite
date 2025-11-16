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
      title="Welcome back to Accounts 4.0"
      subtitle="Unified access, billing, and identity across Blacklink. Navigate to any section using the legacy URLs; everything is refreshed for the Beta."
      ctas={
        <>
          <Button>Open dashboard</Button>
          <Button variant="secondary">View organizations</Button>
        </>
      }
    />
    <div className="grid grid-3 layout-bottom">
      <PageSection title="Quick links" badge={<Badge variant="info">Live</Badge>}>
        <div className="pill-row">
          <span className="pill">Dashboard</span>
          <span className="pill pill-success">Profile</span>
          <span className="pill pill-ultra">Settings</span>
          <span className="pill pill-success">Subscription</span>
        </div>
        <p className="theme-footnote">
          Use /dashboard, /profile, /settings, /subscription, /beta, /about to view the refreshed
          pages.
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
        <p className="theme-footnote">
          Expect rapid changes as we iterate on the 4.0 Beta. Legacy URLs still resolve to these
          updated templates so bookmarks remain functional.
        </p>
      </PageSection>
    </div>
  </div>
);

const DashboardPage = () => (
  <DashboardContent />
);

const DashboardContent = () => {
  const { stats, orgs, statsPermissionDenied, profile } = useAuth();

  return (
    <div className="page-shell">
      <PageHero
        title="Dashboard"
        subtitle="Overview of identity, billing, usage, and shortcuts from Accounts 3.9 revived in 4.0."
        badge={<Badge variant="success">Live</Badge>}
      />
      <div className="grid grid-3 layout-bottom">
        <PageSection title="Usage" badge={<Badge variant="info">Edge</Badge>}>
          {statsPermissionDenied ? (
            <p className="theme-footnote">
              Stats unavailable: Firestore denies access to <code>stats/global</code>. Update rules
              or sign in with a role that can read stats.
            </p>
          ) : null}
          <div className="stat-grid">
            <div className="stat-block">
              <p className="eyebrow">Active users</p>
              <p className="stat-value">{stats.activeUsers || "—"}</p>
              <p className="stat-trend">Realtime from Firebase</p>
            </div>
            <div className="stat-block">
              <p className="eyebrow">Organizations</p>
              <p className="stat-value">{stats.orgs || orgs.length || "—"}</p>
              <p className="stat-trend">{stats.apiHealth}</p>
            </div>
          </div>
        </PageSection>
        <PageSection title="Security" badge={<Badge variant="success">Secured</Badge>}>
          <div className="timeline">
            <div className="timeline-item strong">
              <div>
                <p className="timeline-title">MFA enforced</p>
                <p className="timeline-subtitle">Org-wide</p>
              </div>
              <Badge variant="success">On</Badge>
            </div>
            <div className="timeline-item strong">
              <div>
                <p className="timeline-title">Passkeys</p>
                <p className="timeline-subtitle">Available to all members</p>
              </div>
              <Badge variant="info">Ready</Badge>
            </div>
          </div>
        </PageSection>
        <PageSection title="Shortcuts" badge={<Badge variant="info">Navigate</Badge>}>
          <div className="component-row">
            <Button size="sm">Profile</Button>
            <Button size="sm" variant="secondary">
              Settings
            </Button>
            <Button size="sm" variant="secondary">
              Subscription
            </Button>
          </div>
        </PageSection>
      </div>
      <div className="grid grid-2 layout-top">
        <PageSection title="Account overview" badge={<Badge variant="ultra-plus">ULTRA+</Badge>}>
          <div className="timeline">
            <div className="timeline-item">
              <div>
                <p className="timeline-title">Tier</p>
                <p className="timeline-subtitle">Ultra+ for Employees</p>
              </div>
              <Badge variant="ultra-plus">{profile.tier}</Badge>
            </div>
            <div className="timeline-item">
              <div>
                <p className="timeline-title">Billing</p>
                <p className="timeline-subtitle">Employee-sponsored</p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="timeline-item">
              <div>
                <p className="timeline-title">Devices</p>
                <p className="timeline-subtitle">{profile.devices ?? "—"} trusted</p>
              </div>
              <Badge variant="info">Edge-bound</Badge>
            </div>
          </div>
        </PageSection>
        <PageSection title="QuickLaunch" badge={<Badge variant="info">3.9 carry</Badge>}>
          <div className="component-row">
            <Button size="sm">Nova</Button>
            <Button size="sm" variant="secondary">
              Admin
            </Button>
            <Button size="sm" variant="secondary">
              Support
            </Button>
          </div>
          <p className="theme-footnote">Pulled forward from Accounts 3.9 quicklaunch presets.</p>
        </PageSection>
      </div>
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
  const { profile } = useAuth();

  return (
    <div className="page-shell">
      <PageHero
        title="Profile"
        subtitle="Manage your personal details, badges, and trusted devices."
        badge={<Badge variant="info">Identity</Badge>}
      />
      <div className="grid grid-2 layout-top">
        <section className="card profile-card">
          <div className="profile-header">
            <div className="avatar avatar-ultra-plus">{profile.displayName.slice(0, 2).toUpperCase()}</div>
            <div>
              <p className="profile-name">{profile.displayName}</p>
              <p className="profile-meta">{profile.email}</p>
              <div className="pill-row">
                <span className="pill">SSO</span>
                <span className="pill pill-success">MFA</span>
                <span className="pill pill-ultra">{profile.tier}</span>
              </div>
            </div>
            <Badge variant="success">Verified</Badge>
          </div>
          <div className="profile-body">
            <div>
              <p className="eyebrow">Organization</p>
              <p className="profile-value">{profile.organization || "—"}</p>
            </div>
            <div>
              <p className="eyebrow">Devices</p>
              <p className="profile-value">{profile.devices ?? "—"} trusted</p>
            </div>
            <div>
              <p className="eyebrow">Roles</p>
              <p className="profile-value">{profile.roles?.join(", ") || "member"}</p>
            </div>
          </div>
          <div className="profile-actions">
            <Button size="sm">Manage access</Button>
            <Button variant="secondary" size="sm">
              Audit trail
            </Button>
          </div>
        </section>
        <PageSection title="Activity" badge={<Badge variant="info">Recent</Badge>}>
          <div className="timeline">
            <div className="timeline-item">
              <div>
                <p className="timeline-title">Passkey challenge</p>
                <p className="timeline-subtitle">Approved on trusted device</p>
              </div>
              <Badge variant="success">OK</Badge>
            </div>
            <div className="timeline-item">
              <div>
                <p className="timeline-title">Email update</p>
                <p className="timeline-subtitle">Pending verification</p>
              </div>
              <Badge variant="warning">Pending</Badge>
            </div>
          </div>
        </PageSection>
      </div>
    </div>
  );
};

const SettingsPage = () => (
  <div className="page-shell">
    <PageHero
      title="Settings"
      subtitle="Configure security, notifications, and localization."
      badge={<Badge variant="warning">Preview</Badge>}
    />
    <div className="grid grid-2 layout-top">
      <PageSection title="Security" badge={<Badge variant="success">On</Badge>}>
        <div className="timeline">
          <div className="timeline-item">
            <div>
              <p className="timeline-title">MFA</p>
              <p className="timeline-subtitle">Required for all members</p>
            </div>
            <Badge variant="success">Enabled</Badge>
          </div>
          <div className="timeline-item">
            <div>
              <p className="timeline-title">Device trust</p>
              <p className="timeline-subtitle">Session-bound</p>
            </div>
            <Badge variant="info">Active</Badge>
          </div>
        </div>
      </PageSection>
      <PageSection title="Preferences" badge={<Badge>UI</Badge>}>
        <div className="timeline">
          <div className="timeline-item">
            <div>
              <p className="timeline-title">Language</p>
              <p className="timeline-subtitle">English</p>
            </div>
            <Badge variant="info">Default</Badge>
          </div>
          <div className="timeline-item">
            <div>
              <p className="timeline-title">Notifications</p>
              <p className="timeline-subtitle">Security alerts, billing</p>
            </div>
            <Badge variant="success">On</Badge>
          </div>
        </div>
      </PageSection>
    </div>
  </div>
);

const OrganizationsPage = () => {
  const { orgs } = useAuth();

  return (
    <div className="page-shell">
      <PageHero
        title="Organizations"
        subtitle="Manage workspaces, roles, and cross-tenant ULTRA settings."
        badge={<Badge variant="info">Multi-tenant</Badge>}
      />
      <PageSection title="Spaces" badge={<Badge variant="success">Healthy</Badge>}>
        <div className="component-grid">
          {orgs.length === 0 ? (
            <p className="theme-footnote">No orgs found for your account.</p>
          ) : (
            orgs.map((org) => (
              <div key={org.id} className="mini-card">
                <p className="metric-value">{org.name}</p>
                <p className="theme-footnote">
                  {org.tier} · {org.members ?? "—"} members
                </p>
                <div className="component-row">
                  <Button size="sm">Open</Button>
                  <Button size="sm" variant="secondary">
                    Audit
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </PageSection>
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
            <p className="metric-value">{profile.tier}</p>
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
  "/profile": <ProfilePage />,
  "/settings": <SettingsPage />,
  "/organizations": <OrganizationsPage />,
  "/subscription": <SubscriptionPage />,
  "/privacy": <PrivacyPage />,
  "/beta": <BetaPage />,
  "/admin": <AdminPage />,
  "/construction": <ConstructionPage />,
  "/about": <AboutPage />,
  "/template": <TemplatePage />,
};

export const PageRenderer = ({ path }: PageRendererProps) => {
  const page = pages[path] ?? <NotFoundPage />;
  return page;
};
