import React, { useState } from "react";
import { Link } from "react-router-dom";

const REGISTER_API_URL = "http://127.0.0.1:5000/api/register";

const Register = ({ setUser }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "player",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(REGISTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Тіркелу кезінде қате шықты");
      }

      setUser(data);
    } catch (err) {
      const message =
        err.message === "Failed to fetch" || err.message === "Load failed"
          ? "Backend серверге қосылмады. `npm run server` іске қосыңыз."
          : err.message;
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.logo}>BB</div>
        <p style={styles.eyebrow}>Sign Up</p>
        <h1 style={styles.title}>Тіркелу</h1>
        <p style={styles.subtitle}>Бұл форма енді деректерді тікелей `users` кестесіне жазады.</p>

        <input
          type="text"
          placeholder="Аты-жөні"
          required
          style={styles.input}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          required
          style={styles.input}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Құпиясөз"
          required
          style={styles.input}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select
          style={styles.input}
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="player">Пайдаланушы</option>
          <option value="moderator">Moderator</option>
        </select>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" style={styles.btn} disabled={submitting}>
          {submitting ? "Сақталуда..." : "Тіркелу"}
        </button>

        <p style={styles.switchText}>
          Аккаунт бар ма?{" "}
          <Link to="/login" style={styles.link}>
            Кіру
          </Link>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "calc(100vh - 88px)",
    display: "grid",
    placeItems: "center",
    padding: 24,
  },
  card: {
    width: "min(470px, 100%)",
    padding: "42px 34px",
    borderRadius: 30,
    background:
      "linear-gradient(180deg, rgba(11, 24, 59, 0.95), rgba(6, 13, 34, 0.98) 78%, rgba(4, 8, 21, 1))",
    border: "1px solid rgba(126, 171, 255, 0.16)",
    boxShadow: "0 26px 70px rgba(0, 6, 24, 0.4)",
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    marginBottom: 18,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 22,
    background: "linear-gradient(135deg, #7db4ff, #b5d0ff)",
    color: "#071327",
  },
  eyebrow: {
    color: "#8ab4ff",
    textTransform: "uppercase",
    letterSpacing: "0.24em",
    fontSize: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: "clamp(2rem, 4vw, 2.8rem)",
    lineHeight: 1.05,
    marginBottom: 12,
    color: "#eef5ff",
  },
  subtitle: {
    color: "#b7c7e7",
    lineHeight: 1.7,
    marginBottom: 18,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    marginBottom: 14,
    borderRadius: 14,
    border: "1px solid rgba(126, 171, 255, 0.12)",
    background: "rgba(5, 11, 28, 0.96)",
    color: "#fff",
  },
  btn: {
    width: "100%",
    padding: "14px 18px",
    background: "linear-gradient(135deg, #7db4ff, #b5d0ff)",
    color: "#071327",
    border: "none",
    borderRadius: 14,
    fontWeight: 800,
    cursor: "pointer",
    marginTop: 8,
  },
  error: {
    color: "#ff9a9a",
    marginBottom: 14,
  },
  switchText: {
    marginTop: 18,
    color: "#b7c7e7",
    textAlign: "center",
  },
  link: {
    color: "#9dc5ff",
    textDecoration: "none",
    fontWeight: 700,
  },
};

export default Register;
