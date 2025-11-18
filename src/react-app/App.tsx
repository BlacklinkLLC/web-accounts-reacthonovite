import "./App.css";
import { useEffect, useState } from "react";
import { Badge } from "./components/Badge";
import { Button } from "./components/Button";
import { NavBar } from "./components/NavBar";
import { ThemeControls } from "./components/ThemeControls";
import { PageRenderer } from "./pages";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import { ThemeProvider, useTheme } from "./theme/ThemeProvider";
import { ThemeOption, themeOptions } from "./theme/themes";
import GradientText from "../components/reactbits/GradientText";
import TextPressure from "../components/TextPressure/TextPressure";

const WelcomeModal = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = typeof window !== "undefined" ? localStorage.getItem("bl_welcome4") : "1";
    if (!seen) setVisible(true);
    if (typeof window !== "undefined") {
      (window as unknown as { __BL_SHOW_WELCOME__?: () => void; __BL_HIDE_WELCOME__?: () => void }).__BL_SHOW_WELCOME__ =
        () => setVisible(true);
      (window as unknown as { __BL_HIDE_WELCOME__?: () => void }).__BL_HIDE_WELCOME__ = () => setVisible(false);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("bl_welcome4", "1");
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <div className="welcome-overlay" role="dialog" aria-modal="true" aria-label="Welcome to Accounts 4.0">
      <div className="welcome-modal layout">
        <div className="welcome-left">
          <p className="pill" aria-hidden="true">
            <span aria-hidden>🚀</span> New stack
          </p>
          <div className="relative h-24 w-full">
            <TextPressure
              text="Welcome to 4.0 Beta"
              flex
              alpha
              width
              weight
              italic
              textColor="#ffffff"
              className="w-full justify-start text-left"
              minFontSize={28}
            />
          </div>
          <p className="gradient-text">
            <GradientText>Legacy Accounts now on React + Vite + Firebase + shadcn/ui.</GradientText>
          </p>
        </div>
        <div className="welcome-right">
          <div className="welcome-card" aria-label="Roadmap">
            <h3 className="welcome-card-title">4.0 Roadmap</h3>
            <ul className="welcome-list">
              <li>Expanded ULTRA+ features (Messages, Community, QuickLaunch)</li>
              <li>Updated legal: AUP, TOS, Privacy, AUR, SDPP, 3DPP</li>
              <li>Connect & SSO: ClassLink OneRoster, OpenSiS framework, external SSO URL</li>
              <li>Visibility & Privacy controls for data sharing</li>
            </ul>
          </div>
          <div className="welcome-actions">
            <Button onClick={dismiss}>Start exploring</Button>
            <Button variant="secondary" onClick={dismiss}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const heroStats = [
  { label: "Themes", value: "32", detail: "Core + ULTRA palettes" },
  { label: "Components", value: "Reusable UI", detail: "Buttons, badges, forms" },
  { label: "Accessibility", value: "Built-in", detail: "Contrast, motion, text" },
];

const accountStats = [
  { label: "Active users", value: "128,410", trend: "+4.2%" },
  { label: "Org spaces", value: "312", trend: "+8 ULTRA" },
  { label: "API health", value: "99.99%", trend: "Edge" },
];

const timeline = [
  { title: "New session", detail: "WebAuthn + device binding", badge: "info" as const },
  { title: "Role updated", detail: "Elevated to admin in Nova", badge: "warning" as const },
  { title: "Billing synced", detail: "Stripe + workers KV", badge: "success" as const },
  { title: "Alert dismissed", detail: "Login anomaly resolved", badge: "default" as const },
];

const Swatch = ({ label, token }: { label: string; token: string }) => (
  <div className="swatch">
    <div className="swatch-sample" style={{ backgroundColor: `var(${token})` }} />
    <div>
      <p className="swatch-label">{label}</p>
      <p className="swatch-token">{token}</p>
    </div>
  </div>
);

const ComponentShowcase = () => (
  <div className="component-showcase">
    <div className="component-row">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="success" icon="✅" size="sm">
        Confirm
      </Button>
      <Button variant="danger" icon="⚡" size="sm">
        Danger
      </Button>
    </div>

    <div className="component-row badge-row">
      <Badge>Beta</Badge>
      <Badge variant="success">Synced</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="danger">Blocked</Badge>
      <Badge variant="info">Edge</Badge>
      <Badge variant="ultra-plus">ULTRA</Badge>
    </div>

    <div className="component-grid">
      <div className="mini-card">
        <div className="form-group">
          <label htmlFor="email-input">Email</label>
          <input id="email-input" placeholder="you@blacklink.app" defaultValue="team@blacklink.app" />
        </div>
        <div className="form-group">
          <label htmlFor="role-select">Role</label>
          <select id="role-select" defaultValue="admin">
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        </div>
        <Button size="sm">Save profile</Button>
      </div>

      <div className="mini-card">
        <div className="pill-row">
          <span className="pill">Session MFA</span>
          <span className="pill pill-success">Device-bound</span>
          <span className="pill pill-ultra">ULTRA+</span>
        </div>
        <div className="timeline">
          <div className="timeline-item">
            <div>
              <p className="timeline-title">Access token</p>
              <p className="timeline-subtitle">Issued from Worker edge POP</p>
            </div>
            <Badge variant="info">Edge</Badge>
          </div>
          <div className="timeline-item">
            <div>
              <p className="timeline-title">Nova sync</p>
              <p className="timeline-subtitle">Organizations + billing</p>
            </div>
            <Badge variant="success">OK</Badge>
          </div>
          <div className="timeline-item">
            <div>
              <p className="timeline-title">Audit trail</p>
              <p className="timeline-subtitle">Structured logs shipped</p>
            </div>
            <Badge variant="warning">Live</Badge>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ThemeMeta = () => {
  const { settings } = useTheme();
  const activeTheme =
    themeOptions.find((theme: ThemeOption) => theme.id === settings.theme) ??
    themeOptions[0];
  const isUltra = activeTheme.tier === "ultra";

  return (
    <div className="theme-meta">
      <div className="theme-meta-row">
        <div>
          <p className="eyebrow">Active theme</p>
          <p className="theme-name">{activeTheme.label}</p>
          <p className="theme-caption">
            {activeTheme.description ?? "Ported palette from Accounts-Old"}
          </p>
        </div>
        <Badge variant={isUltra ? "ultra-plus" : "info"}>
          {isUltra ? "ULTRA" : "Core"}
        </Badge>
      </div>
      <div className="swatch-grid">
        <Swatch label="Primary" token="--primary" />
        <Swatch label="Primary Light" token="--primary-light" />
        <Swatch label="Surface" token="--card-bg" />
        <Swatch label="Canvas" token="--bg" />
        <Swatch label="Border" token="--border" />
      </div>
      <p className="theme-footnote">
        ThemeProvider writes <code>data-theme</code>, <code>data-contrast</code>,{" "}
        <code>data-motion</code>, and text preferences to <code>html</code> so every
        component inherits the correct variables.
      </p>
    </div>
  );
};

const HealthPanel = () => (
  <div className="stat-grid">
    {accountStats.map((stat) => (
      <div key={stat.label} className="stat-block">
        <p className="eyebrow">{stat.label}</p>
        <p className="stat-value">{stat.value}</p>
        <p className="stat-trend">{stat.trend}</p>
      </div>
    ))}
  </div>
);

const ProfileCard = () => (
  <div className="profile-card">
    <div className="profile-header">
      <div className="avatar avatar-ultra-plus">BL</div>
      <div>
        <p className="profile-name">Nova Admin</p>
        <p className="profile-meta">admin@blacklink.app</p>
        <div className="pill-row">
          <span className="pill">SSO</span>
          <span className="pill pill-success">MFA</span>
          <span className="pill pill-ultra">ULTRA+</span>
        </div>
      </div>
      <Badge variant="success">Verified</Badge>
    </div>
    <div className="profile-body">
      <div>
        <p className="eyebrow">Organization</p>
        <p className="profile-value">Nova Labs</p>
      </div>
      <div>
        <p className="eyebrow">Tier</p>
        <p className="profile-value">ULTRA+</p>
      </div>
      <div>
        <p className="eyebrow">Devices</p>
        <p className="profile-value">7 trusted</p>
      </div>
    </div>
    <div className="profile-actions">
      <Button size="sm">Manage access</Button>
      <Button variant="secondary" size="sm">
        Audit trail
      </Button>
    </div>
  </div>
);

const TimelineCard = () => (
  <div className="timeline-card">
    {timeline.map((item) => (
      <div key={item.title} className="timeline-item strong">
        <div>
          <p className="timeline-title">{item.title}</p>
          <p className="timeline-subtitle">{item.detail}</p>
        </div>
        <Badge variant={item.badge}>{item.title === "Alert dismissed" ? "Ok" : "Live"}</Badge>
      </div>
    ))}
    <div className="timeline-footer">
      <p className="theme-footnote">
        Events stream uses the same badge + card primitives. Tie into Workers logs or KV to replay.
      </p>
      <Button size="sm" variant="secondary">
        Ship to analytics
      </Button>
    </div>
  </div>
);

const normalizePath = (path: string) => {
  if (!path) return "/";
  const cleaned = path.replace(/\/+$/, "") || "/";
  return cleaned.toLowerCase();
};

const AuthGate = ({ path, children }: { path: string; children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.includes(path);

  useEffect(() => {
    if (!loading && !user && !isAuthRoute) {
      window.location.href = "/login";
    }
    if (!loading && user && isAuthRoute) {
      window.location.href = "/dashboard";
    }
  }, [loading, user, isAuthRoute]);

  if (loading) {
    return (
      <div className="app-shell">
        <p className="theme-footnote">Loading session...</p>
      </div>
    );
  }

  if (!user && !isAuthRoute) return null;

  return <>{children}</>;
};

const ComponentGridPage = () => {
  const { settings } = useTheme();
  const activeTheme =
    themeOptions.find((theme: ThemeOption) => theme.id === settings.theme) ??
    themeOptions[0];

  return (
    <div className="app-shell">
      <header className="hero card">
        <div className="eyebrow-row">
          <span className="pill">Accounts 4.0 Beta</span>
          <Badge variant="ultra-plus">Theme kit</Badge>
        </div>
        <div className="hero-main">
          <div className="brand-mark" aria-hidden>
            4.0
          </div>
          <div>
            <p className="eyebrow">Blacklink Design System</p>
            <h1>Component grid</h1>
            <p className="hero-subtitle">
              Palette selector, accessibility toggles, and UI primitives ported from the legacy
              Accounts-Old set into 4.0 Beta.
            </p>
            <div className="hero-actions">
              <Button>Primary CTA</Button>
              <Button variant="secondary">Secondary CTA</Button>
            </div>
          </div>
        </div>
        <div className="hero-metrics">
          {heroStats.map((stat) => (
            <div key={stat.label} className="metric">
              <p className="metric-label">{stat.label}</p>
              <p className="metric-value">{stat.value}</p>
              <p className="metric-detail">{stat.detail}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="grid grid-2 layout-top">
        <section className="card theme-card">
          <div className="card-header">
            <div className="card-title">
              <span role="img" aria-hidden="true">
                🎨
              </span>
              Theme system
            </div>
            <Badge variant={activeTheme.tier === "ultra" ? "ultra" : "info"}>
              {activeTheme.tier === "ultra" ? "ULTRA palette" : "Core palette"}
            </Badge>
          </div>
          <ThemeControls />
          <ThemeMeta />
        </section>

        <section className="card component-card">
          <div className="card-header">
            <div className="card-title">
              <span role="img" aria-hidden="true">
                🧩
              </span>
              Component sampler
            </div>
            <Badge variant="success">Live</Badge>
          </div>
          <ComponentShowcase />
        </section>
      </div>

      <div className="grid grid-3 layout-bottom">
        <section className="card">
          <div className="card-header">
            <div className="card-title">
              <span role="img" aria-hidden="true">
                📊
              </span>
              Account health
            </div>
            <Badge variant="info">Edge</Badge>
          </div>
          <HealthPanel />
        </section>

        <section className="card">
          <div className="card-header">
            <div className="card-title">
              <span role="img" aria-hidden="true">
                🛡️
              </span>
              Profile
            </div>
            <Badge variant="warning">Preview</Badge>
          </div>
          <ProfileCard />
        </section>

        <section className="card">
          <div className="card-header">
            <div className="card-title">
              <span role="img" aria-hidden="true">
                🛰️
              </span>
              Events
            </div>
            <Badge>Streaming</Badge>
          </div>
          <TimelineCard />
        </section>
      </div>
    </div>
  );
};

function App() {
  const path =
    typeof window !== "undefined" ? normalizePath(window.location.pathname) : "/";
  const isComponentGrid = path.startsWith("/dev/compgrid");

  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate path={path}>
          {path !== "/login" && path !== "/register" ? (
            <div className="app-layout">
              <NavBar path={path} />
              <main className="app-main">
                <div className="announcement-bar" role="status">
                  Accounts 4.0 Alpha 2 Fix 2 Build :4.0.PB2.A2-F2.20251117
                </div>
                {isComponentGrid ? <ComponentGridPage /> : <PageRenderer path={path} />}
              </main>
              <WelcomeModal />
            </div>
          ) : (
            isComponentGrid ? <ComponentGridPage /> : <PageRenderer path={path} />
          )}
        </AuthGate>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
