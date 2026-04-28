import React from "react";

const About = () => (
  <section style={styles.page}>
    <div style={styles.panel}>
      <p style={styles.eyebrow}>About Project</p>
      <h1 style={styles.title}>Brain Battle туралы</h1>
      <p style={styles.text}>
        Brain Battle — білімді ойын стилінде тексеруге арналған платформа. Жүйеде ортақ
        басты бет бар, ал кіргеннен кейін пайдаланушы мен әкімшіге бөлек жеке кабинет
        көрсетіледі.
      </p>
    </div>
  </section>
);

const styles = {
  page: {
    padding: "48px min(8vw, 80px) 72px",
  },
  panel: {
    maxWidth: 880,
    padding: "42px 36px",
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
    fontSize: "clamp(2rem, 5vw, 3.2rem)",
    marginBottom: 18,
    color: "#eef5ff",
  },
  text: {
    color: "#b7c7e7",
    lineHeight: 1.85,
    marginBottom: 14,
  },
};

export default About;
