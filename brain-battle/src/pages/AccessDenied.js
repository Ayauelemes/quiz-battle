import React from "react";
import { Link } from "react-router-dom";

const AccessDenied = ({ user }) => (
  <section style={styles.page}>
    <div style={styles.card}>
      <p style={styles.code}>403</p>
      <h1 style={styles.title}>Access denied</h1>
      <p style={styles.text}>
        Бұл бетке сіздің рөліңізбен кіруге рұқсат жоқ. Рөл: {user?.role || "guest"}.
      </p>
      <Link to="/" style={styles.link}>
        Басты бетке оралу
      </Link>
    </div>
  </section>
);

const styles = {
  page: {
    minHeight: "calc(100vh - 88px)",
    display: "grid",
    placeItems: "center",
    padding: 24,
  },
  card: {
    width: "min(560px, 100%)",
    textAlign: "center",
    padding: "46px 34px",
    borderRadius: 32,
    background:
      "linear-gradient(180deg, rgba(11, 24, 59, 0.95), rgba(6, 13, 34, 0.98) 78%, rgba(4, 8, 21, 1))",
    border: "1px solid rgba(126, 171, 255, 0.15)",
  },
  code: { fontSize: 72, color: "#9dc5ff", fontWeight: 900, marginBottom: 14 },
  title: { fontSize: 32, marginBottom: 14, color: "#eef5ff" },
  text: { color: "#b7c7e7", lineHeight: 1.7, marginBottom: 24 },
  link: {
    display: "inline-block",
    textDecoration: "none",
    background: "linear-gradient(135deg, #7db4ff, #b5d0ff)",
    color: "#071327",
    padding: "12px 18px",
    borderRadius: 14,
    fontWeight: 800,
  },
};

export default AccessDenied;
