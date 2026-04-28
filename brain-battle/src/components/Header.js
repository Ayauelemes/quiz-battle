import React from "react";
import { Link, NavLink } from "react-router-dom";

const Header = ({ user, logout, unreadCount = 0 }) => {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const isMessagePage = currentPath === "/reviews";
  const visibleUnreadCount = isMessagePage ? 0 : unreadCount;

  return (
  <header style={styles.header}>
    <Link to="/" style={styles.logo}>
      Brain Battle
    </Link>
    <nav style={styles.nav}>
      <NavLink to="/" style={getNavLinkStyle}>
        Басты бет
      </NavLink>
      <NavLink to="/services" style={getNavLinkStyle}>
        Мүмкіндіктер
      </NavLink>
      <NavLink to="/about" style={getNavLinkStyle}>
        Жоба туралы
      </NavLink>
      <NavLink to="/contact" style={getNavLinkStyle}>
        Байланыс
      </NavLink>
      {user?.role === "player" && (
        <NavLink to="/cabinet" style={getNavLinkStyle}>
          Кабинет
        </NavLink>
      )}
      {user?.role === "moderator" && (
        <NavLink to="/moderator" style={getNavLinkStyle}>
          Moderator
        </NavLink>
      )}
      {user?.role === "admin" && (
        <>
          <NavLink to="/admin" style={getNavLinkStyle}>
            Admin
          </NavLink>
          <NavLink to="/moderator" style={getNavLinkStyle}>
            Статистика
          </NavLink>
        </>
      )}
      {user && user.role !== "admin" && (
        <NavLink to="/inbox" style={getNavLinkStyle}>
          Чат
        </NavLink>
      )}
      {user && (
        <NavLink to="/reviews" style={getNavLinkStyle}>
          Reviews
          {visibleUnreadCount > 0 && <span style={styles.badge}>{visibleUnreadCount}</span>}
        </NavLink>
      )}
    </nav>

    {user ? (
      <div style={styles.userZone}>
        {visibleUnreadCount > 0 && (
          <div style={styles.noticeChip}>
            Сізде {visibleUnreadCount} хабарлама бар
          </div>
        )}
        <div>
          <div style={styles.userName}>{user.name}</div>
          <div style={styles.userRole}>{roleLabels[user.role] || user.role}</div>
        </div>
        <button onClick={logout} style={styles.logout}>
          Шығу
        </button>
      </div>
    ) : (
      <div style={styles.authActions}>
        <Link to="/login" style={styles.loginLink}>
          Кіру
        </Link>
        <Link to="/register" style={styles.registerLink}>
          Тіркелу
        </Link>
      </div>
    )}
  </header>
  );
};

const roleLabels = {
  admin: "Әкімші",
  player: "Пайдаланушы",
  moderator: "Moderator",
};

const getNavLinkStyle = ({ isActive }) => ({
  color: isActive ? "#eef5ff" : "#a8bddf",
  textDecoration: "none",
  fontSize: 15,
  fontWeight: isActive ? 700 : 500,
  display: "inline-flex",
  gap: 8,
  alignItems: "center",
});

const actionBase = {
  textDecoration: "none",
  borderRadius: 12,
  padding: "10px 16px",
  fontWeight: 700,
};

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
    padding: "18px min(8vw, 80px)",
    background: "rgba(6, 14, 34, 0.78)",
    backdropFilter: "blur(18px)",
    borderBottom: "1px solid rgba(126, 171, 255, 0.12)",
    flexWrap: "wrap",
  },
  logo: {
    color: "#9ac3ff",
    textDecoration: "none",
    fontSize: 26,
    fontWeight: 900,
    letterSpacing: "0.03em",
  },
  nav: {
    display: "flex",
    gap: 22,
    alignItems: "center",
    flexWrap: "wrap",
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: "50%",
    display: "inline-grid",
    placeItems: "center",
    padding: "0 6px",
    background: "#7db4ff",
    color: "#071327",
    fontSize: 12,
    fontWeight: 800,
  },
  authActions: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  loginLink: {
    ...actionBase,
    color: "#e8f1ff",
    border: "1px solid rgba(145, 181, 255, 0.16)",
    background: "rgba(255,255,255,0.03)",
  },
  registerLink: {
    ...actionBase,
    color: "#071327",
    background: "linear-gradient(135deg, #7db4ff, #b5d0ff)",
  },
  userZone: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    paddingLeft: 18,
    borderLeft: "1px solid rgba(126, 171, 255, 0.12)",
  },
  noticeChip: {
    padding: "9px 14px",
    borderRadius: 999,
    background: "rgba(125, 180, 255, 0.12)",
    border: "1px solid rgba(125, 180, 255, 0.18)",
    color: "#eaf3ff",
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  userName: {
    color: "#eef5ff",
    fontWeight: 700,
  },
  userRole: {
    color: "#9fb4d7",
    fontSize: 13,
  },
  logout: {
    background: "transparent",
    border: "1px solid rgba(255, 126, 126, 0.28)",
    color: "#ff9d9d",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },
};

export default Header;
