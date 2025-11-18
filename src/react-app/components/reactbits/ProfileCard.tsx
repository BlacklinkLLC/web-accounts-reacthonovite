import React from "react";

type Stat = { label: string; value: React.ReactNode };
type Badge = { label: string; variant?: "primary" | "secondary" | "outline" };

type ProfileCardProps = {
  name: string;
  username?: string;
  avatarUrl?: string;
  fallback?: string;
  badges?: Badge[];
  stats?: Stat[];
  actions?: React.ReactNode;
};

// Minimal ReactBits-inspired profile card.
export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  username,
  avatarUrl,
  fallback,
  badges = [],
  stats = [],
  actions,
}) => {
  return (
    <section className="rb-profile-card">
      <div className="rb-profile-header">
        <div className="rb-avatar" aria-hidden={!fallback}>
          {avatarUrl ? <img src={avatarUrl} alt={name} referrerPolicy="no-referrer" /> : fallback ?? name[0]}
        </div>
        <div>
          {username ? <p className="rb-username gradient-text">@{username}</p> : null}
          <h2 className="rb-name">{name}</h2>
          <div className="rb-badges">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className={`pill ${badge.variant === "outline" ? "pill-outline" : ""}`}
                aria-label={badge.label}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {stats.length ? (
        <div className="rb-stats">
          {stats.map((stat) => (
            <div key={String(stat.label)} className="rb-stat">
              <p className="rb-stat-label">{stat.label}</p>
              <p className="rb-stat-value">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {actions ? <div className="rb-actions">{actions}</div> : null}
    </section>
  );
};

export default ProfileCard;
