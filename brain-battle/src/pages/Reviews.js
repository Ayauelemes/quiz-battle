import React, { useEffect, useState } from "react";
import { API_BASE, getAuthHeaders } from "../lib/api";

const formatDateTime = (value) =>
  new Date(value).toLocaleString("kk-KZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const renderStars = (rating) => {
  const safeRating = Math.max(0, Math.min(5, Number(rating || 0)));
  return `${"★".repeat(safeRating)}${"☆".repeat(5 - safeRating)}`;
};

const parseJsonSafely = async (response) => {
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch (_error) {
    return null;
  }
};

const Reviews = ({ user, refreshNotifications, clearNotificationsLocally }) => {
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbacks, setFeedbacks] = useState([]);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);

  const markNotificationsRead = async () => {
    clearNotificationsLocally();
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PATCH",
        headers: getAuthHeaders(user),
      });
      await refreshNotifications();
    } catch (error) {
      console.error("Notifications read-all қатесі:", error);
    }
  };

  useEffect(() => {
    if (!user) return;
    markNotificationsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    const loadReviews = async () => {
      if (!user) return;

      const endpoint = user.role === "admin" ? "/feedbacks" : "/my-feedbacks";
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: getAuthHeaders(user),
      });

      if (!response.ok) {
        return;
      }

      const data = await parseJsonSafely(response);
      if (!Array.isArray(data)) {
        return;
      }

      if (user.role === "admin") {
        setFeedbacks(data);
      } else {
        setMyFeedbacks(data);
      }
    };

    loadReviews();
  }, [user]);

  const sendFeedback = async (e) => {
    e.preventDefault();
    setFeedbackError("");
    setFeedbackSuccess("");
    setSavingFeedback(true);

    try {
      const response = await fetch(`${API_BASE}/feedbacks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(user),
        },
        body: JSON.stringify({
          messageText: feedbackText.trim(),
          rating: feedbackRating,
        }),
      });

      const data = await parseJsonSafely(response);
      if (!response.ok) {
        throw new Error(data?.error || "Пікіріңіз жіберілмеді");
      }

      const createdFeedback = data || {
        id: Date.now(),
        userId: Number(user.id),
        userName: user.name,
        messageText: feedbackText.trim(),
        rating: feedbackRating,
        createdAt: new Date().toISOString(),
      };

      setMyFeedbacks((prev) => [createdFeedback, ...prev]);
      setFeedbackText("");
      setFeedbackRating(5);
      setFeedbackSuccess("Пікір сәтті жіберілді.");
      await markNotificationsRead();
    } catch (error) {
      setFeedbackError(error.message || "Пікіріңіз жіберілмеді");
    } finally {
      setSavingFeedback(false);
    }
  };

  if (user.role === "admin") {
    return (
      <section style={styles.page}>
        <div style={styles.hero}>
          <p style={styles.eyebrow}>Reviews Hub</p>
          <h1 style={styles.title}>Пайдаланушы пікірлері</h1>
        </div>

        <div style={styles.reviewsGrid}>
          {feedbacks.length === 0 ? (
            <div style={styles.emptyCard}>
              <h2 style={styles.sectionTitle}>Әзірге пікір жоқ</h2>
              <p style={styles.text}>Пайдаланушылар жұлдыз қойып, пікір қалдырғанда осы жерде көрінеді.</p>
            </div>
          ) : (
            feedbacks.map((item) => (
              <article key={item.id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div>
                    <h3 style={styles.reviewAuthor}>{item.userName || item.userId}</h3>
                    <span style={styles.dateText}>{formatDateTime(item.createdAt)}</span>
                  </div>
                  <span style={styles.ratingPill}>{renderStars(item.rating)}</span>
                </div>
                {item.messageText ? (
                  <p style={styles.reviewText}>{item.messageText}</p>
                ) : (
                  <p style={styles.reviewMuted}>Пайдаланушы тек жұлдызбен бағалады.</p>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    );
  }

  return (
    <section style={styles.page}>
      <div style={styles.hero}>
        <p style={styles.eyebrow}>Rate Experience</p>
        <h1 style={styles.title}>Пікір және баға</h1>
        <p style={styles.text}>
          Платформаны бағалап, қысқа пікір қалдырыңыз. Баға жұлдызбен сақталады.
        </p>
      </div>

      <div style={styles.formLayout}>
        <div style={styles.formCard}>
          <h2 style={styles.sectionTitle}>Баға беру</h2>
          <form onSubmit={sendFeedback} style={styles.form}>
            <div style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  style={value <= feedbackRating ? styles.starButtonActive : styles.starButton}
                  onClick={() => setFeedbackRating(value)}
                >
                  ★
                </button>
              ))}
              <span style={styles.starHint}>{feedbackRating} / 5</span>
            </div>

            <textarea
              style={styles.textarea}
              placeholder="Қаласаңыз, қысқа пікір жазыңыз..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              maxLength={500}
            />

            {feedbackError && <p style={styles.error}>{feedbackError}</p>}
            {feedbackSuccess && <p style={styles.success}>{feedbackSuccess}</p>}

            <button style={styles.primaryButton} type="submit" disabled={savingFeedback}>
              {savingFeedback ? "Жіберілуде..." : "Отзыв жіберу"}
            </button>
          </form>
        </div>

        <div style={styles.listCard}>
          <div style={styles.listHeader}>
            <h2 style={styles.sectionTitle}>Менің пікірлерім</h2>
            <button style={styles.secondaryButton} onClick={markNotificationsRead}>
              Жаңарту
            </button>
          </div>

          <div style={styles.reviewList}>
            {myFeedbacks.length === 0 ? (
              <p style={styles.text}>Әзірге пікір жіберілмеген.</p>
            ) : (
              myFeedbacks.map((item) => (
                <article key={item.id} style={styles.historyCard}>
                  <div style={styles.historyHeader}>
                    <span style={styles.ratingText}>{renderStars(item.rating)}</span>
                    <span style={styles.dateText}>{formatDateTime(item.createdAt)}</span>
                  </div>
                  {item.messageText ? (
                    <p style={styles.reviewText}>{item.messageText}</p>
                  ) : (
                    <p style={styles.reviewMuted}>Тек жұлдызды баға жіберілді.</p>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const card = {
  background:
    "linear-gradient(180deg, rgba(11, 24, 59, 0.95), rgba(6, 13, 34, 0.98) 78%, rgba(4, 8, 21, 1))",
  border: "1px solid rgba(126, 171, 255, 0.14)",
  boxShadow: "0 24px 70px rgba(0, 6, 24, 0.38)",
  borderRadius: 30,
};

const styles = {
  page: { padding: "48px min(8vw, 80px) 72px", display: "grid", gap: 22 },
  hero: { ...card, padding: 34 },
  eyebrow: { color: "#8ab4ff", textTransform: "uppercase", letterSpacing: "0.24em", fontSize: 12, marginBottom: 12 },
  title: { fontSize: "clamp(2.1rem, 4vw, 3.6rem)", marginBottom: 12, color: "#eef5ff" },
  text: { color: "#b7c7e7", lineHeight: 1.7 },
  formLayout: { display: "grid", gridTemplateColumns: "minmax(320px, 460px) minmax(0, 1fr)", gap: 20, alignItems: "start" },
  formCard: { ...card, padding: 28, display: "grid", gap: 18 },
  listCard: { ...card, padding: 28, display: "grid", gap: 18 },
  emptyCard: { ...card, padding: 32 },
  reviewsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 },
  reviewCard: {
    ...card,
    padding: 24,
    background:
      "linear-gradient(180deg, rgba(14, 29, 70, 0.96), rgba(8, 16, 40, 0.98) 76%, rgba(5, 10, 24, 1))",
  },
  reviewHeader: { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", marginBottom: 16 },
  reviewAuthor: { color: "#eef5ff", fontSize: 22, marginBottom: 6 },
  ratingPill: {
    padding: "9px 14px",
    borderRadius: 999,
    background: "rgba(255, 209, 102, 0.14)",
    border: "1px solid rgba(255, 209, 102, 0.25)",
    color: "#ffd166",
    fontWeight: 800,
    letterSpacing: "0.08em",
    whiteSpace: "nowrap",
  },
  reviewText: { color: "#e9f1ff", lineHeight: 1.7 },
  reviewMuted: { color: "#9fb4d7", lineHeight: 1.7, fontStyle: "italic" },
  sectionTitle: { fontSize: 26, color: "#eef5ff" },
  form: { display: "grid", gap: 14 },
  starRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  starButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    border: "1px solid rgba(126, 171, 255, 0.12)",
    background: "rgba(5, 11, 28, 0.96)",
    color: "#6f87b2",
    fontSize: 26,
    cursor: "pointer",
  },
  starButtonActive: {
    width: 46,
    height: 46,
    borderRadius: 14,
    border: "1px solid rgba(255, 210, 102, 0.3)",
    background: "linear-gradient(135deg, rgba(255,209,102,0.23), rgba(255,183,77,0.12))",
    color: "#ffd166",
    fontSize: 26,
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(255, 191, 73, 0.18)",
  },
  starHint: { color: "#d9e6ff", fontSize: 13, fontWeight: 700, marginLeft: 6 },
  textarea: {
    width: "100%",
    minHeight: 150,
    padding: "16px 18px",
    borderRadius: 16,
    border: "1px solid rgba(126, 171, 255, 0.12)",
    background: "rgba(5, 11, 28, 0.96)",
    color: "#fff",
    resize: "vertical",
  },
  listHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  reviewList: { display: "grid", gap: 14, maxHeight: 700, overflowY: "auto" },
  historyCard: {
    padding: "18px 20px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(126, 171, 255, 0.1)",
    display: "grid",
    gap: 10,
  },
  historyHeader: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" },
  ratingText: { color: "#ffd166", fontSize: 16, letterSpacing: "0.08em", fontWeight: 800 },
  dateText: { color: "#9fb4d7", fontSize: 12 },
  primaryButton: {
    background: "linear-gradient(135deg, #7db4ff, #b5d0ff)",
    color: "#071327",
    border: "none",
    padding: "14px 18px",
    borderRadius: 16,
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
  error: { color: "#ff9a9a" },
  success: { color: "#9ce7b2" },
};

export default Reviews;
