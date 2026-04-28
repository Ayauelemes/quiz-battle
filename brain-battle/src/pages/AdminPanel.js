import React, { useMemo, useState } from "react";
import { API_BASE, getAuthHeaders } from "../lib/api";

const initialUserForm = {
  name: "",
  email: "",
  password: "",
  role: "player",
};

const initialQuestionForm = {
  question: "",
  options: ["", "", "", ""],
  answer: 0,
  category: "Frontend",
};

const AdminPanel = ({
  user,
  users,
  questions,
  games,
  refreshUsers,
  refreshQuestions,
  refreshGames,
  loading,
  serverAvailable,
}) => {
  const [userForm, setUserForm] = useState(initialUserForm);
  const [questionForm, setQuestionForm] = useState(initialQuestionForm);
  const [userSearch, setUserSearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [userError, setUserError] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (item) =>
          item.name.toLowerCase().includes(userSearch.toLowerCase()) ||
          item.email.toLowerCase().includes(userSearch.toLowerCase()) ||
          item.role.toLowerCase().includes(userSearch.toLowerCase())
      ),
    [users, userSearch]
  );

  const filteredQuestions = useMemo(
    () =>
      questions.filter(
        (item) =>
          item.question.toLowerCase().includes(questionSearch.toLowerCase()) ||
          item.category.toLowerCase().includes(questionSearch.toLowerCase())
      ),
    [questions, questionSearch]
  );

  const stats = useMemo(() => {
    const totalGames = games.length;
    const avgScore = totalGames
      ? (games.reduce((sum, game) => sum + Number(game.score || 0), 0) / totalGames).toFixed(1)
      : 0;
    return {
      totalUsers: users.length,
      totalQuestions: questions.length,
      totalGames,
      avgScore,
    };
  }, [games, questions.length, users.length]);

  const createUser = async (e) => {
    e.preventDefault();
    setUserError("");
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(user),
        },
        body: JSON.stringify(userForm),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Пайдаланушы қосылмады");
      }
      setUserForm(initialUserForm);
      await refreshUsers();
    } catch (error) {
      setUserError(error.message);
    }
  };

  const updateRole = async (id, role) => {
    const response = await fetch(`${API_BASE}/users/${id}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(user),
      },
      body: JSON.stringify({ role }),
    });
    if (response.ok) {
      await refreshUsers();
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Пайдаланушыны өшіргіңіз келе ме?")) {
      return;
    }
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(user),
    });
    if (response.ok) {
      await refreshUsers();
    }
  };

  const submitQuestion = async (e) => {
    e.preventDefault();
    setQuestionError("");
    try {
      const response = await fetch(
        editingQuestionId ? `${API_BASE}/questions/${editingQuestionId}` : `${API_BASE}/questions`,
        {
          method: editingQuestionId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(user),
          },
          body: JSON.stringify(questionForm),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Сұрақ сақталмады");
      }
      setQuestionForm(initialQuestionForm);
      setEditingQuestionId(null);
      await refreshQuestions();
    } catch (error) {
      setQuestionError(error.message);
    }
  };

  const editQuestion = (question) => {
    setEditingQuestionId(question.id);
    setQuestionForm({
      question: question.question,
      options: question.options,
      answer: question.answer,
      category: question.category,
    });
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Сұрақты өшіргіңіз келе ме?")) {
      return;
    }
    const response = await fetch(`${API_BASE}/questions/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(user),
    });
    if (response.ok) {
      await refreshQuestions();
    }
  };

  return (
    <section style={styles.page}>
      <div style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>Admin Panel</p>
          <h1 style={styles.title}>Әкімшілік басқару панелі</h1>
        </div>
        <button style={styles.secondaryButton} onClick={refreshGames}>
          Статистиканы жаңарту
        </button>
      </div>

      {!serverAvailable && <div style={styles.warning}>Сервер жоқ кезде CRUD шектеледі.</div>}

      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <span style={styles.label}>Пайдаланушы</span>
          <strong>{stats.totalUsers}</strong>
        </div>
        <div style={styles.statCard}>
          <span style={styles.label}>Сұрақ</span>
          <strong>{stats.totalQuestions}</strong>
        </div>
        <div style={styles.statCard}>
          <span style={styles.label}>Ойын</span>
          <strong>{stats.totalGames}</strong>
        </div>
        <div style={styles.statCard}>
          <span style={styles.label}>Орташа ұпай</span>
          <strong>{stats.avgScore}</strong>
        </div>
      </div>

      <div style={styles.formGrid}>
        <form style={styles.card} onSubmit={createUser}>
          <h2 style={styles.sectionTitle}>Пайдаланушы қосу</h2>
          <input
            style={styles.input}
            placeholder="Аты"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Құпиясөз"
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
          />
          <select
            style={styles.input}
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
          >
            <option value="player">Player</option>
            <option value="admin">Admin</option>
          </select>
          {userError && <p style={styles.error}>{userError}</p>}
          <button style={styles.primaryButton} type="submit">
            Қосу
          </button>
        </form>

        <form style={styles.card} onSubmit={submitQuestion}>
          <h2 style={styles.sectionTitle}>
            {editingQuestionId ? "Сұрақты өңдеу" : "Сұрақ қосу"}
          </h2>
          <input
            style={styles.input}
            placeholder="Сұрақ"
            value={questionForm.question}
            onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Санат"
            value={questionForm.category}
            onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
          />
          {questionForm.options.map((option, index) => (
            <input
              key={index}
              style={styles.input}
              placeholder={`Нұсқа ${index + 1}`}
              value={option}
              onChange={(e) => {
                const nextOptions = [...questionForm.options];
                nextOptions[index] = e.target.value;
                setQuestionForm({ ...questionForm, options: nextOptions });
              }}
            />
          ))}
          <select
            style={styles.input}
            value={questionForm.answer}
            onChange={(e) => setQuestionForm({ ...questionForm, answer: Number(e.target.value) })}
          >
            {questionForm.options.map((_, index) => (
              <option key={index} value={index}>
                Дұрыс жауап: {index + 1}
              </option>
            ))}
          </select>
          {questionError && <p style={styles.error}>{questionError}</p>}
          <div style={styles.actionRow}>
            <button style={styles.primaryButton} type="submit">
              Сақтау
            </button>
            {editingQuestionId && (
              <button
                style={styles.secondaryButton}
                type="button"
                onClick={() => {
                  setEditingQuestionId(null);
                  setQuestionForm(initialQuestionForm);
                }}
              >
                Болдырмау
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={styles.card}>
        <div style={styles.tableHeader}>
          <h2 style={styles.sectionTitle}>Пайдаланушылар тізімі</h2>
          <input
            style={styles.search}
            placeholder="Іздеу..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Аты</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Рөл</th>
              <th style={styles.th}>Әрекет</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((item) => (
              <tr key={item.id}>
                <td style={styles.td}>{item.id}</td>
                <td style={styles.td}>{item.name}</td>
                <td style={styles.td}>{item.email}</td>
                <td style={styles.td}>
                  <select
                    style={styles.smallSelect}
                    value={item.role}
                    onChange={(e) => updateRole(item.id, e.target.value)}
                  >
                    <option value="player">Player</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={styles.td}>
                  <button style={styles.deleteButton} onClick={() => deleteUser(item.id)}>
                    Жою
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.card}>
        <div style={styles.tableHeader}>
          <h2 style={styles.sectionTitle}>Сұрақтар тізімі</h2>
          <input
            style={styles.search}
            placeholder="Іздеу..."
            value={questionSearch}
            onChange={(e) => setQuestionSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <p style={styles.text}>Жүктелуде...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Сұрақ</th>
                <th style={styles.th}>Санат</th>
                <th style={styles.th}>Әрекет</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((item) => (
                <tr key={item.id}>
                  <td style={styles.td}>{item.id}</td>
                  <td style={styles.td}>{item.question}</td>
                  <td style={styles.td}>{item.category}</td>
                  <td style={styles.td}>
                    <div style={styles.actionRow}>
                      <button style={styles.secondaryButton} onClick={() => editQuestion(item)}>
                        Өңдеу
                      </button>
                      <button style={styles.deleteButton} onClick={() => deleteQuestion(item.id)}>
                        Жою
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Ойын статистикасы</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Game ID</th>
              <th style={styles.th}>Пайдаланушы</th>
              <th style={styles.th}>Ұпай</th>
              <th style={styles.th}>Уақыты</th>
            </tr>
          </thead>
          <tbody>
            {games.map((item) => (
              <tr key={item.id}>
                <td style={styles.td}>{item.id}</td>
                <td style={styles.td}>{item.userName || item.userId}</td>
                <td style={styles.td}>{item.score}</td>
                <td style={styles.td}>{new Date(item.playedAt).toLocaleString("kk-KZ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const card = {
  background:
    "linear-gradient(180deg, rgba(11, 24, 59, 0.95), rgba(6, 13, 34, 0.98) 78%, rgba(4, 8, 21, 1))",
  border: "1px solid rgba(126, 171, 255, 0.14)",
  boxShadow: "0 24px 70px rgba(0, 6, 24, 0.38)",
  borderRadius: 28,
};

const inputBase = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(126, 171, 255, 0.12)",
  background: "rgba(5, 11, 28, 0.96)",
  color: "#fff",
};

const styles = {
  page: { padding: "48px min(8vw, 80px) 72px", display: "grid", gap: 20 },
  hero: { ...card, padding: 32, display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", flexWrap: "wrap" },
  eyebrow: { color: "#8ab4ff", textTransform: "uppercase", letterSpacing: "0.24em", fontSize: 12, marginBottom: 12 },
  title: { fontSize: "clamp(2rem, 4vw, 3.4rem)", marginBottom: 12 },
  text: { color: "#b7c7e7", lineHeight: 1.7 },
  warning: { ...card, padding: 16, color: "#d6e6ff" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 },
  statCard: { ...card, padding: 20, display: "grid", gap: 8 },
  label: { color: "#9fb4d7", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 },
  card: { ...card, padding: 24, overflowX: "auto" },
  sectionTitle: { fontSize: 24, marginBottom: 18 },
  input: { ...inputBase, marginBottom: 12 },
  search: { ...inputBase, maxWidth: 260 },
  smallSelect: { ...inputBase, padding: "10px 12px", minWidth: 150 },
  primaryButton: {
    background: "linear-gradient(135deg, #7db4ff, #b5d0ff)",
    color: "#071327",
    border: "none",
    padding: "12px 18px",
    borderRadius: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryButton: {
    background: "transparent",
    color: "#eef5ff",
    border: "1px solid rgba(126, 171, 255, 0.16)",
    padding: "12px 16px",
    borderRadius: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  deleteButton: {
    background: "transparent",
    color: "#ff9d9d",
    border: "1px solid rgba(255, 126, 126, 0.28)",
    padding: "12px 16px",
    borderRadius: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  error: { color: "#ff9a9a", marginBottom: 12 },
  tableHeader: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 18, flexWrap: "wrap" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 14px", color: "#9fb4d7", borderBottom: "1px solid rgba(126, 171, 255, 0.12)" },
  td: { padding: "14px", borderBottom: "1px solid rgba(126, 171, 255, 0.08)", color: "#e7f0ff", verticalAlign: "top" },
  actionRow: { display: "flex", gap: 10, flexWrap: "wrap" },
};

export default AdminPanel;
