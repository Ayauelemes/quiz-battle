import React from "react";

const Card = ({ title, description, icon }) => (
  <article style={styles.card}>
    {icon && <div style={styles.icon}>{icon}</div>}
    <h3 style={styles.title}>{title}</h3>
    <p style={styles.description}>{description}</p>
  </article>
);

const styles = {
  card: {
    background:
      "linear-gradient(180deg, rgba(11, 24, 59, 0.94), rgba(6, 13, 34, 0.98) 76%, rgba(4, 8, 21, 1))",
    padding: 28,
    borderRadius: 24,
    border: "1px solid rgba(126, 171, 255, 0.14)",
    boxShadow: "0 24px 60px rgba(1, 7, 24, 0.36)",
  },
  icon: {
    width: 54,
    height: 54,
    display: "grid",
    placeItems: "center",
    borderRadius: 18,
    marginBottom: 18,
    background: "rgba(125, 180, 255, 0.1)",
    border: "1px solid rgba(125, 180, 255, 0.14)",
    fontSize: 24,
  },
  title: {
    color: "#eef5ff",
    marginBottom: 10,
    fontSize: 22,
  },
  description: {
    color: "#b8c8e6",
    lineHeight: 1.7,
  },
};

export default Card;
