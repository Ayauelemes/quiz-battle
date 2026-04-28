import React from "react";

const Contact = () => (
  <section style={styles.page}>
    <div style={styles.panel}>
      <p style={styles.eyebrow}>Contact</p>
      <h1 style={styles.title}>Байланыс ақпараты</h1>
      <div style={styles.infoList}>
        <div style={styles.infoItem}>
          <span style={styles.label}>Email</span>
          <strong style={styles.value}>info@brainbattle.kz</strong>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.label}>Телефон</span>
          <strong style={styles.value}>+7 700 123 45 67</strong>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.label}>Қолдау</span>
          <strong style={styles.value}>Дс-Жм, 09:00-18:00</strong>
        </div>
      </div>
    </div>
  </section>
);

const styles = {
  page: {
    padding: "48px min(8vw, 80px) 72px",
  },
  panel: {
    maxWidth: 760,
    padding: "40px 34px",
    borderRadius: 32,
    background:
      "linear-gradient(180deg, rgba(11, 24, 59, 0.95), rgba(6, 13, 34, 0.98) 78%, rgba(4, 8, 21, 1))",
    border: "1px solid rgba(126, 171, 255, 0.15)",
    boxShadow: "0 24px 70px rgba(0, 6, 24, 0.38)",
  },
  eyebrow: {
    color: "#8ab4ff",
    letterSpacing: "0.24em",
    textTransform: "uppercase",
    fontSize: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: "clamp(2rem, 5vw, 3rem)",
    marginBottom: 24,
    color: "#eef5ff",
  },
  infoList: {
    display: "grid",
    gap: 16,
  },
  infoItem: {
    padding: "18px 20px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(126, 171, 255, 0.12)",
    display: "grid",
    gap: 6,
  },
  label: {
    color: "#9bb3d6",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  value: {
    color: "#edf4ff",
  },
};

export default Contact;
