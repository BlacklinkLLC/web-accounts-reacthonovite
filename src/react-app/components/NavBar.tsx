import { useMemo, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { Badge } from "./Badge";
import UserIcon from "./icons/outline/user.svg?react";
import LogoutIcon from "./icons/outline/logout.svg?react";
import SettingsIcon from "./icons/outline/settings.svg?react";
import Menu2Icon from "./icons/outline/menu-2.svg?react";

type NavLink = {
  label: string;
  href: string;
};

const groupedLinks: { title: string; items: NavLink[] }[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Profile", href: "/profile" },
      { label: "Messages", href: "/messages" },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Settings", href: "/settings" },
      { label: "Privacy", href: "/privacy" },
      { label: "Visibility", href: "/settings/visibility" },
      { label: "Subscriptions", href: "/subscription" },
    ],
  },
  {
    title: "Info",
    items: [
      { label: "Beta", href: "/beta" },
      { label: "About", href: "/about" },
    ],
  },
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    groupedLinks.reduce<Record<string, boolean>>(
      (acc, group) => {
        acc[group.title] = true;
        return acc;
      },
      { Admin: true },
    ),
  );
  const { profile, signOutUser } = useAuth();

  const activeLookup = useMemo(() => {
    const flat = groupedLinks.flatMap((g) => g.items);
    return flat.reduce<Record<string, boolean>>((acc, link) => {
      acc[link.href] = path.startsWith(link.href);
      return acc;
    }, {});
  }, [path]);

  return (
    <aside className={`app-sidebar ${sidebarOpen ? "open" : "collapsed"}`} aria-label="Primary navigation">
      <div className="sidebar-top">
        <button
          type="button"
          className="sidebar-toggle"
          aria-label={sidebarOpen ? "Collapse navigation" : "Expand navigation"}
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <span className="sidebar-toggle-icon" aria-hidden="true">
            <Menu2Icon className="icon-inline icon-muted" width={18} height={18} />
          </span>
        </button>
        <a className="app-logo" href="/dashboard" aria-label="Blacklink Accounts Home">
          <div className="app-logo-icon">BL</div>
          {sidebarOpen ? <span className="app-logo-text">Blacklink Accounts</span> : null}
        </a>
      </div>

      <nav className="app-nav-vertical" aria-label="Main">
        {groupedLinks.map((group) => {
          const isOpen = openGroups[group.title] ?? true;
          return (
            <div key={group.title} className={`nav-group ${isOpen ? "open" : "collapsed"}`}>
              <button
                type="button"
                className="nav-group-toggle"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenGroups((prev) => ({
                    ...prev,
                    [group.title]: !isOpen,
                  }))
                }
              >
                <span className="nav-group-title">{group.title}</span>
                <span className="nav-group-chevron" aria-hidden="true">
                  ▾
                </span>
              </button>
              <div className="nav-group-items" role="group" aria-label={`${group.title} links`} hidden={!isOpen}>
                {group.items.map((link) => (
                  <a
                    key={link.href}
                    className={`app-nav-link-vertical ${activeLookup[link.href] ? "active" : ""}`}
                    href={link.href}
                  >
                    <span className="nav-dot" aria-hidden="true" />
                    <span className="nav-label">{link.label}</span>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
        {profile.isAdmin ? (
          <div className={`nav-group ${openGroups.Admin ? "open" : "collapsed"}`}>
            <button
              type="button"
              className="nav-group-toggle"
              aria-expanded={openGroups.Admin}
              onClick={() =>
                setOpenGroups((prev) => ({
                  ...prev,
                  Admin: !prev.Admin,
                }))
              }
            >
              <span className="nav-group-title">Admin</span>
              <span className="nav-group-chevron" aria-hidden="true">
                ▾
              </span>
            </button>
            <div className="nav-group-items" role="group" aria-label="Admin links" hidden={!openGroups.Admin}>
              <a className={`app-nav-link-vertical ${activeLookup["/admin"] ? "active" : ""}`} href="/admin">
                <span className="nav-dot" aria-hidden="true" />
                <span className="nav-label">Admin</span>
              </a>
            </div>
          </div>
        ) : null}
      </nav>

      <div className="app-user-menu">
        <button
          type="button"
          className="user-menu-button"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
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
        <div className={`user-dropdown ${menuOpen ? "open" : ""}`}>
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
          <button className="user-dropdown-item" type="button" onClick={() => (window.location.href = "/profile")}>
            <span aria-hidden="true">
              <UserIcon className="icon-inline icon-accent" width={16} height={16} />
            </span>
            Profile
          </button>
          <button className="user-dropdown-item" type="button" onClick={() => (window.location.href = "/settings")}>
            <span aria-hidden="true">
              <SettingsIcon className="icon-inline icon-muted" width={16} height={16} />
            </span>
            Settings
          </button>
          <button className="user-dropdown-item" type="button" onClick={signOutUser}>
            <span aria-hidden="true">
              <LogoutIcon className="icon-inline icon-warning" width={16} height={16} />
            </span>
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
};
