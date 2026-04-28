import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDefaultRoute } from "../lib/api";

const Home = ({ user, questions }) => {
  const navigate = useNavigate();
  const [counter, setCounter] = useState(1);
  const [showGameArea, setShowGameArea] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);

  const previewQuestions = questions.length
    ? questions
    : [
        {
          id: 1,
          question: "React қосымшасында маршруттарды не басқарады?",
          options: ["Axios", "React Router", "Redux", "Node"],
          category: "Frontend",
        },
      ];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCounter((prev) => (prev >= 128 ? 1 : prev + 1));
    }, 1600);

    return () => window.clearInterval(interval);
  }, []);

  const activeQuestion = previewQuestions[questionIndex % previewQuestions.length];

  const handleStartGame = () => {
    setShowGameArea(true);
    if (user) {
      navigate(getDefaultRoute(user));
    }
  };

  const handleNextQuestion = () => {
    setShowGameArea(true);
    setQuestionIndex((prev) => (prev + 1) % previewQuestions.length);
  };

  return (
    <main style={styles.page}>
      <section style={styles.heroSection}>
        <div style={styles.heroCard}>
          <p style={styles.kicker}>Brain Battle</p>
          <h1 style={styles.title}>Біліміңді тексеріп, басқа ойыншылармен жарыс</h1>
          <p style={styles.description}>
            Жеңіл, әдемі және заманауи платформа. Басты бет барлығына ортақ, ал кіргеннен кейін
            әр рөлге жеке кабинет ашылады.
          </p>
          <div style={styles.heroActions}>
            <button style={styles.mainButton} onClick={handleStartGame}>
              Ойынды бастау
            </button>
            {!user && (
              <button style={styles.ghostButton} onClick={() => navigate("/register")}>
                Тіркелу
              </button>
            )}
          </div>
        </div>

        <div style={styles.pulsePanelContainer}>
          <div style={styles.pulsePanel}>
            <div style={styles.activityStatus}>
              <span style={styles.pulseDot} /> Тікелей эфир
            </div>

            <div style={styles.pulseContent}>
              <h3 style={styles.panelTitle}>Ойыншылар пульсі</h3>
              <div style={styles.counterBlock}>
                <div style={styles.counterNumber}>{counter}</div>
                <div style={styles.counterLabel}>баттлға дайын</div>
              </div>
              <p style={styles.panelDescription}>
                Қазіргі уақытта платформада белсенді немесе кіруге дайын қолданушылар саны.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={showGameArea ? styles.quizContainer : styles.quizContainerHidden}>
        <div style={styles.quizCard}>
          <div style={styles.quizHeader}>
            <span style={styles.categoryBadge}>{activeQuestion.category || "Интеллект"}</span>
            <div style={styles.timerTrack}>
              <div style={styles.timerBar} />
            </div>
          </div>

          <div style={styles.questionBox}>
            <h3 style={styles.questionTitle}>{activeQuestion.question}</h3>
          </div>

          <div style={styles.answerOptions}>
            {activeQuestion.options.map((option, index) => (
              <button key={`${activeQuestion.id}-${index}`} style={styles.optionButton}>
                {option}
              </button>
            ))}
          </div>

          <div style={styles.quizFooter}>
            <button style={styles.mainButton} onClick={handleNextQuestion}>
              Келесі сұрақ
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

const styles = {
  page: {
    padding: "48px min(7vw, 80px) 80px",
  },
  heroSection: {
    display: "grid",
    gridTemplateColumns: "1.35fr 0.9fr",
    gap: 24,
    alignItems: "stretch",
    marginBottom: 28,
  },
  heroCard: {
    padding: "44px 38px",
    borderRadius: 32,
    background:
      "linear-gradient(145deg, rgba(12, 29, 69, 0.96), rgba(7, 15, 38, 0.98) 60%, rgba(5, 10, 24, 1))",
    border: "1px solid rgba(123, 169, 255, 0.18)",
    boxShadow: "0 30px 80px rgba(2, 9, 28, 0.48)",
  },
  kicker: {
    color: "#8ab4ff",
    textTransform: "uppercase",
    letterSpacing: "0.24em",
    fontSize: 12,
    marginBottom: 14,
  },
  title: {
    fontSize: "clamp(2.3rem, 5vw, 4.5rem)",
    lineHeight: 1.03,
    marginBottom: 18,
    maxWidth: 720,
  },
  description: {
    color: "#b9c8eb",
    fontSize: 17,
    lineHeight: 1.8,
    maxWidth: 640,
    marginBottom: 28,
  },
  heroActions: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
  },
  mainButton: {
    border: "none",
    borderRadius: 14,
    padding: "14px 22px",
    fontWeight: 800,
    cursor: "pointer",
    color: "#071327",
    background: "linear-gradient(135deg, #7db4ff, #b5d0ff)",
    boxShadow: "0 14px 32px rgba(68, 126, 228, 0.28)",
  },
  ghostButton: {
    borderRadius: 14,
    padding: "14px 22px",
    fontWeight: 800,
    cursor: "pointer",
    color: "#e8f1ff",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(145, 181, 255, 0.2)",
  },
  pulsePanelContainer: {
    display: "flex",
  },
  pulsePanel: {
    width: "100%",
    padding: "28px 24px",
    borderRadius: 30,
    background:
      "linear-gradient(180deg, rgba(11, 24, 59, 0.96), rgba(6, 13, 34, 0.98) 72%, rgba(4, 8, 21, 1))",
    border: "1px solid rgba(127, 175, 255, 0.16)",
    boxShadow: "0 24px 60px rgba(1, 7, 24, 0.44)",
  },
  activityStatus: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 14px",
    borderRadius: 999,
    color: "#dbe8ff",
    background: "rgba(125, 180, 255, 0.08)",
    border: "1px solid rgba(125, 180, 255, 0.14)",
    marginBottom: 26,
    fontWeight: 700,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#65c6ff",
    boxShadow: "0 0 14px #65c6ff",
  },
  pulseContent: {
    display: "grid",
    gap: 18,
  },
  panelTitle: {
    fontSize: 26,
  },
  counterBlock: {
    padding: "22px 18px",
    borderRadius: 24,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(145, 181, 255, 0.14)",
    textAlign: "center",
  },
  counterNumber: {
    fontSize: 72,
    fontWeight: 900,
    color: "#95c4ff",
    lineHeight: 1,
  },
  counterLabel: {
    marginTop: 8,
    color: "#d3e2ff",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: 12,
  },
  panelDescription: {
    color: "#b8c7e6",
    lineHeight: 1.8,
  },
  quizContainer: {
    marginBottom: 28,
    opacity: 1,
    transform: "translateY(0)",
    transition: "all 0.35s ease",
  },
  quizContainerHidden: {
    marginBottom: 28,
    opacity: 0.92,
    transform: "translateY(0)",
    transition: "all 0.35s ease",
  },
  quizCard: {
    padding: "30px 28px",
    borderRadius: 30,
    background:
      "linear-gradient(180deg, rgba(10, 23, 54, 0.96), rgba(5, 11, 28, 0.98) 78%, rgba(4, 8, 21, 1))",
    border: "1px solid rgba(126, 171, 255, 0.16)",
    boxShadow: "0 24px 70px rgba(0, 6, 24, 0.42)",
  },
  quizHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap",
  },
  categoryBadge: {
    padding: "8px 14px",
    borderRadius: 999,
    background: "rgba(123, 169, 255, 0.1)",
    border: "1px solid rgba(123, 169, 255, 0.2)",
    color: "#ddecff",
    fontWeight: 700,
  },
  timerTrack: {
    width: 180,
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  timerBar: {
    width: "72%",
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #7db4ff, #4dd0ff)",
  },
  questionBox: {
    marginBottom: 24,
    padding: "24px 20px",
    borderRadius: 24,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(145, 181, 255, 0.12)",
  },
  questionTitle: {
    fontSize: "clamp(1.4rem, 3vw, 2rem)",
    lineHeight: 1.4,
  },
  answerOptions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 14,
    marginBottom: 20,
  },
  optionButton: {
    padding: "18px 16px",
    borderRadius: 18,
    border: "1px solid rgba(145, 181, 255, 0.12)",
    background: "rgba(255,255,255,0.03)",
    color: "#eef4ff",
    textAlign: "left",
    cursor: "pointer",
  },
  quizFooter: {
    display: "flex",
    justifyContent: "flex-end",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
  },
  infoCard: {
    padding: "26px 22px",
    borderRadius: 24,
    background: "rgba(10, 22, 52, 0.72)",
    border: "1px solid rgba(133, 176, 255, 0.12)",
  },
  infoTitle: {
    fontSize: 22,
    marginBottom: 10,
  },
  infoText: {
    color: "#b6c6e4",
    lineHeight: 1.8,
  },
};

export default Home;
