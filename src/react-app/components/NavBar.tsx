import { useMemo, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { Badge } from "./Badge";

type NavLink = {
  label: string;
  href: string;
};

const links: NavLink[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
  { label: "Subscriptions", href: "/subscription" },
  { label: "Beta", href: "/beta" },
  { label: "About", href: "/about" },
];

type NavBarProps = {
  path: string;
};

const formatTier = (tier: string) => {
  const norm = tier.toUpperCase();
  if (norm.includes("ULTRA_PLUS") || norm.includes("ULTRA+")) return "ULTRA+ (Employee)";
  if (norm.includes("ULTRA")) return "ULTRA";
  return norm || "ULTRA+";
};

export const NavBar = ({ path }: NavBarProps) => {
  const [open, setOpen] = useState(false);
  const { profile, signOutUser } = useAuth();

  const activeLookup = useMemo(
    () =>
      links.reduce<Record<string, boolean>>((acc, link) => {
        acc[link.href] = path.startsWith(link.href);
        return acc;
      }, {}),
    [path],
  );

  return (
    <header className="app-header">
      <a className="app-logo" href="/dashboard">
        <div className="app-logo-icon">BL</div>
        <span>Blacklink Accounts</span>
      </a>

      <nav className="app-nav">
        {links.map((link) => (
          <a
            key={link.href}
            className={`app-nav-link ${activeLookup[link.href] ? "active" : ""}`}
            href={link.href}
          >
            {link.label}
          </a>
        ))}
        {profile.isAdmin ? (
          <a
            className={`app-nav-link ${activeLookup["/admin"] ? "active" : ""}`}
            href="/admin"
          >
            Admin
          </a>
        ) : null}
      </nav>

      <div className="app-user-menu">
        <button
          type="button"
          className="user-menu-button"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <div className="user-avatar avatar-ultra-plus avatar-photo">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} referrerPolicy="no-referrer" />
            ) : (
              profile.displayName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="user-menu-label">
            <span className="user-menu-name">{profile.displayName}</span>
            <span className="user-menu-meta">
              <Badge variant={profile.tier.includes("ULTRA") ? "ultra-plus" : "info"}>
                {formatTier(profile.tier)}
              </Badge>
            </span>
          </div>
          <span className="user-menu-caret" aria-hidden="true">
            ▾
          </span>
        </button>
        <div className={`user-dropdown ${open ? "open" : ""}`}>
          <div className="user-dropdown-profile">
            <div className="avatar avatar-ultra-plus avatar-photo">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} referrerPolicy="no-referrer" />
              ) : (
                profile.displayName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <p className="user-dropdown-name">{profile.displayName}</p>
              <p className="user-dropdown-email">{profile.email}</p>
            </div>
            <span className="user-dropdown-tier">{formatTier(profile.tier)}</span>
          </div>
          <button className="user-dropdown-item" type="button">
            <span aria-hidden="true">👤</span> Profile
          </button>
          <button className="user-dropdown-item" type="button">
            <span aria-hidden="true">⚙️</span> Settings
          </button>
          <button className="user-dropdown-item" type="button" onClick={signOutUser}>
            <span aria-hidden="true">🚪</span> Sign out
          </button>
        </div>
      </div>
    </header>
  );
};
