import React from "react";

const formatDateTime = (value) =>
  new Date(value).toLocaleString("kk-KZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const ModeratorPanel = ({ games = [], loading = false }) => (
  <section style={styles.page}>
    <div style={styles.hero}>
      <p style={styles.eyebrow}>Game Stats</p>
      <h1 style={styles.title}>Ойын статистикасы</h1>
      <p style={styles.text}>Бұл бетте ойын нәтижелері уақыт бойынша көрсетіледі.</p>
    </div>

    <div style={styles.card}>
      {loading ? (
        <p style={styles.text}>Жүктелуде...</p>
      ) : games.length === 0 ? (
        <p style={styles.text}>Әзірге статистика жоқ.</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Пайдаланушы</th>
                <th style={styles.th}>Рөл</th>
                <th style={styles.th}>Ұпай</th>
                <th style={styles.th}>Уақыты</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td style={styles.td}>{game.id}</td>
                  <td style={styles.td}>{game.userName || game.userId}</td>
                  <td style={styles.td}>{game.role || "-"}</td>
                  <td style={styles.td}>{game.score}</td>
                  <td style={styles.td}>{formatDateTime(game.playedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </section>
);

const cardBase = {
  background:
    "linear-gradient(180deg, rgba(11, 24, 59, 0.95), rgba(6, 13, 34, 0.98) 78%, rgba(4, 8, 21, 1))",
  border: "1px solid rgba(126, 171, 255, 0.14)",
  boxShadow: "0 24px 70px rgba(0, 6, 24, 0.38)",
  borderRadius: 28,
};

const styles = {
  page: { padding: "48px min(8vw, 80px) 72px", display: "grid", gap: 20 },
  hero: { ...cardBase, padding: 32 },
  card: { ...cardBase, padding: 24 },
  eyebrow: { color: "#8ab4ff", textTransform: "uppercase", letterSpacing: "0.24em", fontSize: 12, marginBottom: 12 },
  title: { fontSize: "clamp(2rem, 4vw, 3.2rem)", marginBottom: 12, color: "#eef5ff" },
  text: { color: "#b7c7e7", lineHeight: 1.7 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "14px 12px",
    color: "#9dc5ff",
    borderBottom: "1px solid rgba(126, 171, 255, 0.14)",
    fontWeight: 800,
  },
  td: {
    padding: "14px 12px",
    color: "#eef5ff",
    borderBottom: "1px solid rgba(126, 171, 255, 0.08)",
  },
};

export default ModeratorPanel;
