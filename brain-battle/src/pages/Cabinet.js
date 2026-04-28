import React, { useEffect, useMemo, useState } from "react";
import { API_BASE, getAuthHeaders } from "../lib/api";

const Cabinet = ({ user, questions, loading, serverAvailable }) => {
  const [filterCategory, setFilterCategory] = useState("Барлығы");
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [gameSaved, setGameSaved] = useState(false);

  const categories = useMemo(() => {
    const values = new Set(["Барлығы", ...questions.map((q) => q.category).filter(Boolean)]);
    return Array.from(values);
  }, [questions]);

  const filteredQuestions = useMemo(
    () =>
      questions.filter((q) => filterCategory === "Барлығы" || q.category === filterCategory),
    [questions, filterCategory]
  );

  const activeQuestion = filteredQuestions[currentQ];

  useEffect(() => {
    const saveGameResult = async () => {
      if (!showResult || gameSaved || !serverAvailable) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/games`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(user),
          },
          body: JSON.stringify({ score }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || "Нәтиже сақталмады");
        }

        setSaveMessage("Нәтиже дерекқорға сақталды.");
        setGameSaved(true);
      } catch (error) {
        setSaveMessage(error.message);
      }
    };

    saveGameResult();
  }, [gameSaved, score, serverAvailable, showResult, user]);

  const resetGame = () => {
    setIsGameStarted(false);
    setShowResult(false);
    setScore(0);
    setCurrentQ(0);
    setGameSaved(false);
    setSaveMessage("");
  };

  const handleAnswer = (index) => {
    if (!activeQuestion) {
      return;
    }

    if (index === activeQuestion.answer) {
      setScore((prev) => prev + 1);
    }

    if (currentQ + 1 < filteredQuestions.length) {
      setCurrentQ((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  return (
    <div style={styles.page}>
      {!isGameStarted ? (
        <div style={styles.heroCard}>
          <p style={styles.eyebrow}>Player Cabinet</p>
          <h1 style={styles.title}>Пайдаланушының жеке кабинеті</h1>
          <p style={styles.text}>
            Player рөлі ойынға қатысады, жауап береді және нәтижесін базаға жібереді.
          </p>
          <div style={styles.controls}>
            <select
              style={styles.select}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button
              style={styles.primaryButton}
              onClick={() => {
                setCurrentQ(0);
                setScore(0);
                setShowResult(false);
                setSaveMessage("");
                setGameSaved(false);
                setIsGameStarted(true);
              }}
              disabled={loading || filteredQuestions.length === 0}
            >
              {loading ? "Жүктелуде..." : "Ойынды бастау"}
            </button>
          </div>
        </div>
      ) : showResult ? (
        <div style={styles.resultCard}>
          <p style={styles.eyebrow}>Нәтиже</p>
          <h2 style={styles.sectionTitle}>Ойын аяқталды</h2>
          <div style={styles.scoreCircle}>
            <strong style={styles.scoreValue}>{score}</strong>
            <span style={styles.scoreLabel}>/ {filteredQuestions.length || questions.length}</span>
          </div>
          {saveMessage && <p style={styles.text}>{saveMessage}</p>}
          <button style={styles.primaryButton} onClick={resetGame}>
            Қайта бастау
          </button>
        </div>
      ) : activeQuestion ? (
        <div style={styles.quizCard}>
          <div style={styles.quizHeader}>
            <span style={styles.categoryTag}>{activeQuestion.category}</span>
            <span style={styles.progressText}>
              {currentQ + 1} / {filteredQuestions.length}
            </span>
          </div>
          <h2 style={styles.questionTitle}>{activeQuestion.question}</h2>
          <div style={styles.optionsGrid}>
            {activeQuestion.options.map((option, index) => (
              <button
                key={`${activeQuestion.id}-${index}`}
                style={styles.optionButton}
                onClick={() => handleAnswer(index)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={styles.heroCard}>
          <h2 style={styles.sectionTitle}>Сұрақтар табылмады</h2>
          <p style={styles.text}>Фильтрді өзгертіп көріңіз.</p>
        </div>
      )}
    </div>
  );
};

const card = {
  background:
    "linear-gradient(180deg, rgba(11, 24, 59, 0.95), rgba(6, 13, 34, 0.98) 78%, rgba(4, 8, 21, 1))",
  border: "1px solid rgba(126, 171, 255, 0.14)",
  boxShadow: "0 24px 70px rgba(0, 6, 24, 0.38)",
};

const styles = {
  page: { padding: "48px min(8vw, 80px) 72px" },
  heroCard: { ...card, borderRadius: 32, padding: "40px 36px", textAlign: "center" },
  resultCard: { ...card, borderRadius: 32, width: "min(520px, 100%)", margin: "0 auto", padding: "48px 32px", textAlign: "center" },
  quizCard: { ...card, borderRadius: 32, width: "min(820px, 100%)", margin: "0 auto", padding: "36px 32px" },
  eyebrow: { color: "#8ab4ff", textTransform: "uppercase", letterSpacing: "0.24em", fontSize: 12, marginBottom: 12 },
  title: { fontSize: "clamp(2rem, 4vw, 3.4rem)", marginBottom: 12 },
  sectionTitle: { fontSize: "clamp(1.5rem, 3vw, 2.4rem)", marginBottom: 16 },
  text: { color: "#b7c7e7", lineHeight: 1.7, maxWidth: 720, margin: "0 auto 18px" },
  controls: { display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 20 },
  select: {
    minWidth: 220,
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(126, 171, 255, 0.12)",
    background: "rgba(5, 11, 28, 0.96)",
    color: "#fff",
  },
  primaryButton: {
    background: "linear-gradient(135deg, #7db4ff, #b5d0ff)",
    color: "#071327",
    border: "none",
    padding: "14px 24px",
    borderRadius: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
  quizHeader: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 28, flexWrap: "wrap" },
  categoryTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: 999,
    color: "#d8e7ff",
    background: "rgba(125, 180, 255, 0.1)",
    border: "1px solid rgba(125, 180, 255, 0.18)",
    fontSize: 12,
    fontWeight: 700,
  },
  progressText: { color: "#aac0e0", fontWeight: 700 },
  questionTitle: { fontSize: "clamp(1.7rem, 4vw, 2.6rem)", lineHeight: 1.25, marginBottom: 28 },
  optionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 },
  optionButton: {
    minHeight: 84,
    padding: 18,
    background: "linear-gradient(180deg, rgba(9, 20, 47, 0.96), rgba(4, 8, 21, 1))",
    border: "1px solid rgba(126, 171, 255, 0.12)",
    color: "#fff",
    borderRadius: 20,
    cursor: "pointer",
    fontSize: 16,
    textAlign: "left",
    lineHeight: 1.5,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: "50%",
    margin: "28px auto",
    display: "grid",
    placeItems: "center",
    background: "radial-gradient(circle at top, rgba(125, 180, 255, 0.3), rgba(55, 103, 196, 0.12))",
    border: "1px solid rgba(126, 171, 255, 0.12)",
  },
  scoreValue: { display: "block", fontSize: 56, lineHeight: 1 },
  scoreLabel: { color: "#aac0e0" },
};

export default Cabinet;
