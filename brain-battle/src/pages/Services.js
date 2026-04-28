import React from "react";
import Card from "../components/Card";

const Services = () => (
  <section style={styles.page}>
    <div style={styles.header}>
      <p style={styles.eyebrow}>Platform Features</p>
      <h1 style={styles.title}>Платформа мүмкіндіктері</h1>
    </div>
    <div style={styles.grid}>
      <Card
        icon="⚡"
        title="Жылдам ойын режимі"
        description="Пайдаланушы бірнеше сұраққа жауап беріп, нәтижесін бірден көре алады."
      />
      <Card
        icon="👤"
        title="Жеке кабинет"
        description="Әкімші мен пайдаланушыға бөлек кабинет ашылады, бірақ басты бет ортақ күйде қалады."
      />
      <Card
        icon="🛠"
        title="Сұрақтарды басқару"
        description="Әкімші сұрақтарды қосып, өңдеп, жойып және жүйедегі қолданушыларды қарай алады."
      />
    </div>
  </section>
);

const styles = {
  page: {
    padding: "48px min(8vw, 80px) 72px",
  },
  header: {
    marginBottom: 28,
    maxWidth: 760,
  },
  eyebrow: {
    color: "#8ab4ff",
    letterSpacing: "0.24em",
    textTransform: "uppercase",
    fontSize: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: "clamp(2rem, 5vw, 3.2rem)",
    marginBottom: 14,
    color: "#eef5ff",
  },
  subtitle: {
    color: "#b7c7e7",
    lineHeight: 1.8,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 20,
  },
};

export default Services;
