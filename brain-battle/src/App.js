import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cabinet from "./pages/Cabinet";
import AdminPanel from "./pages/AdminPanel";
import ModeratorPanel from "./pages/ModeratorPanel";
import AccessDenied from "./pages/AccessDenied";
import Inbox from "./pages/Inbox";
import Reviews from "./pages/Reviews";
import { API_BASE, getAuthHeaders, getDefaultRoute } from "./lib/api";

const USER_STORAGE_KEY = "brain-battle-user";

const fallbackQuestions = [
  {
    id: 1,
    question: "React қосымшасында компоненттерді бағыттау үшін қай кітапхана қолданылады?",
    options: ["Axios", "React Router", "Redux", "Bootstrap"],
    answer: 1,
    category: "Frontend",
  },
  {
    id: 2,
    question: "JavaScript тілінде массивтің ұзындығын қай қасиет қайтарады?",
    options: ["count", "length", "size", "index"],
    answer: 1,
    category: "JS",
  },
  {
    id: 3,
    question: "PostgreSQL қай категорияға жатады?",
    options: ["CSS фреймворк", "Бағдарламалау тілі", "Мәліметтер базасы", "Браузер"],
    answer: 2,
    category: "Backend",
  },
];

const safeStorage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.error(`localStorage оқу қатесі: ${key}`, error);
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.error(`localStorage сақтау қатесі: ${key}`, error);
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`localStorage өшіру қатесі: ${key}`, error);
    }
  },
};

const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

const App = () => {
  const [user, setUser] = useState(() => {
    const savedUser = safeStorage.get(USER_STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [games, setGames] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverAvailable, setServerAvailable] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  useEffect(() => {
    if (user) {
      safeStorage.set(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      safeStorage.remove(USER_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/questions`);
        if (!response.ok) {
          throw new Error("Сұрақтарды жүктеу мүмкін болмады");
        }
        const data = await response.json();
        setQuestions(data);
        setServerAvailable(true);
      } catch (error) {
        console.error("Сұрақтарды жүктеу қатесі:", error);
        setQuestions(fallbackQuestions);
        setServerAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!user) {
      setUsers([]);
      setGames([]);
      setNotifications([]);
      setChatUsers([]);
      return undefined;
    }

    const fetchProtectedData = async () => {
      const authHeaders = getAuthHeaders(user);

      try {
        const chatUsersResponse = await fetch(`${API_BASE}/chat-users`, {
          headers: authHeaders,
        });
        if (chatUsersResponse.ok) {
          setChatUsers(await chatUsersResponse.json());
        }
      } catch (error) {
        console.error("Chat users жүктеу қатесі:", error);
      }

      try {
        const notificationsResponse = await fetch(`${API_BASE}/notifications`, {
          headers: authHeaders,
        });
        if (notificationsResponse.ok) {
          setNotifications(await notificationsResponse.json());
        }
      } catch (error) {
        console.error("Notifications жүктеу қатесі:", error);
      }

      if (user.role === "admin") {
        try {
          const [usersResponse, gamesResponse] = await Promise.all([
            fetch(`${API_BASE}/users`, { headers: authHeaders }),
            fetch(`${API_BASE}/games`, { headers: authHeaders }),
          ]);

          if (usersResponse.ok) {
            setUsers(await usersResponse.json());
          }

          if (gamesResponse.ok) {
            setGames(await gamesResponse.json());
          }
        } catch (error) {
          console.error("Admin деректерін жүктеу қатесі:", error);
        }
        return;
      }

      if (user.role === "moderator") {
        try {
          const gamesResponse = await fetch(`${API_BASE}/games`, {
            headers: authHeaders,
          });

          if (gamesResponse.ok) {
            setGames(await gamesResponse.json());
          }
        } catch (error) {
          console.error("Moderator статистикасын жүктеу қатесі:", error);
        }
      }
    };

    fetchProtectedData();
    const interval = window.setInterval(fetchProtectedData, 10000);
    return () => window.clearInterval(interval);
  }, [user]);

  const refreshUsers = async () => {
    if (!user || user.role !== "admin") {
      return;
    }
    const response = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(user),
    });
    if (response.ok) {
      setUsers(await response.json());
    }
  };

  const refreshQuestions = async () => {
    const response = await fetch(`${API_BASE}/questions`);
    if (response.ok) {
      setQuestions(await response.json());
    }
  };

  const refreshGames = async () => {
    if (!user || !["admin", "moderator"].includes(user.role)) {
      return;
    }
    const response = await fetch(`${API_BASE}/games`, {
      headers: getAuthHeaders(user),
    });
    if (response.ok) {
      setGames(await response.json());
    }
  };

  const refreshNotifications = async () => {
    if (!user) {
      return;
    }
    const response = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders(user),
    });
    if (response.ok) {
      setNotifications(await response.json());
    }
  };

  const refreshChatUsers = async () => {
    if (!user) {
      return;
    }
    const response = await fetch(`${API_BASE}/chat-users`, {
      headers: getAuthHeaders(user),
    });
    if (response.ok) {
      setChatUsers(await response.json());
    }
  };

  const clearNotificationsLocally = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const logout = () => {
    setUser(null);
    setUsers([]);
    setGames([]);
    setNotifications([]);
    setChatUsers([]);
  };

  return (
    <Router>
      <div style={styles.appShell}>
        <Header user={user} logout={logout} unreadCount={unreadCount} />
        <Routes>
          <Route path="/" element={<Home user={user} questions={questions} />} />
          <Route
            path="/login"
            element={!user ? <Login setUser={setUser} /> : <Navigate to={getDefaultRoute(user)} replace />}
          />
          <Route
            path="/register"
            element={!user ? <Register setUser={setUser} /> : <Navigate to={getDefaultRoute(user)} replace />}
          />
          <Route
            path="/cabinet"
            element={
              <ProtectedRoute user={user} allowedRoles={["player"]}>
                <Cabinet
                  user={user}
                  questions={questions}
                  loading={loading}
                  serverAvailable={serverAvailable}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moderator"
            element={
              <ProtectedRoute user={user} allowedRoles={["moderator", "admin"]}>
                <ModeratorPanel games={games} loading={loading} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} allowedRoles={["admin"]}>
                <AdminPanel
                  user={user}
                  users={users}
                  questions={questions}
                  games={games}
                  refreshUsers={refreshUsers}
                  refreshQuestions={refreshQuestions}
                  refreshGames={refreshGames}
                  loading={loading}
                  serverAvailable={serverAvailable}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inbox"
            element={
              <ProtectedRoute user={user} allowedRoles={["player", "moderator"]}>
                <Inbox
                  user={user}
                  chatUsers={chatUsers}
                  refreshChatUsers={refreshChatUsers}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute user={user} allowedRoles={["admin", "player", "moderator"]}>
                <Reviews
                  user={user}
                  refreshNotifications={refreshNotifications}
                  clearNotificationsLocally={clearNotificationsLocally}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/access-denied" element={<AccessDenied user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

const styles = {
  appShell: {
    minHeight: "100vh",
    color: "#f3efe7",
    background:
      "radial-gradient(circle at top, rgba(46, 101, 211, 0.16), transparent 30%), #040b15",
  },
};

export default App;
