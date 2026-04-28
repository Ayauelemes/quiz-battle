import React, { useEffect, useMemo, useRef, useState } from "react";

const CHAT_STORAGE_KEY = "brain-battle-local-chat-v1";

const formatDateTime = (value) =>
  new Date(value).toLocaleString("kk-KZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const getAvatarText = (name) =>
  String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2) || "?";

const getAvatarTheme = (name) => {
  const palette = [
    ["#7db4ff", "#b5d0ff"],
    ["#65d6ce", "#95f0e0"],
    ["#ffb86b", "#ffd6a3"],
    ["#ff8aa5", "#ffc1d0"],
    ["#9d8cff", "#c5bcff"],
    ["#8ee06f", "#c8f2aa"],
  ];

  const seed = String(name || "user")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const [from, to] = palette[seed % palette.length];

  return {
    background: `linear-gradient(135deg, ${from}, ${to})`,
    shadow: `${from}33`,
    textColor: "#071327",
  };
};

const getPresenceState = (lastMessageAt) => {
  const lastTime = lastMessageAt ? new Date(lastMessageAt).getTime() : 0;
  const minutesAgo = lastTime ? (Date.now() - lastTime) / 60000 : Number.POSITIVE_INFINITY;

  if (minutesAgo <= 5) {
    return {
      label: "Қазір белсенді",
      color: "#55e6a5",
      glow: "rgba(85, 230, 165, 0.35)",
    };
  }

  if (minutesAgo <= 60) {
    return {
      label: "Жақында болды",
      color: "#f8c15c",
      glow: "rgba(248, 193, 92, 0.24)",
    };
  }

  return {
    label: "Офлайн",
    color: "#7b8dab",
    glow: "rgba(123, 141, 171, 0.16)",
  };
};

const getConversationKey = (userId, otherUserId) =>
  [Number(userId), Number(otherUserId)].sort((a, b) => a - b).join(":");

const readChatStore = () => {
  try {
    return JSON.parse(window.localStorage.getItem(CHAT_STORAGE_KEY) || "{}");
  } catch (_error) {
    return {};
  }
};

const writeChatStore = (store) => {
  try {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(store));
  } catch (_error) {
    // ignore localStorage failures
  }
};

const Inbox = ({ user, chatUsers = [], refreshChatUsers }) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState("");
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth
  );
  const messageHistoryRef = useRef(null);

  const isTablet = windowWidth <= 980;
  const isMobile = windowWidth <= 720;

  useEffect(() => {
    refreshChatUsers();
  }, [refreshChatUsers]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }

    const store = readChatStore();
    const key = getConversationKey(user.id, selectedUserId);
    setMessages(store[key] || []);
  }, [selectedUserId, user.id]);

  useEffect(() => {
    if (!messageHistoryRef.current) {
      return;
    }
    messageHistoryRef.current.scrollTop = messageHistoryRef.current.scrollHeight;
  }, [messages]);

  const chatUsersWithMeta = useMemo(() => {
    const store = readChatStore();

    return [...chatUsers]
      .map((chatUser) => {
        const conversation = store[getConversationKey(user.id, chatUser.id)] || [];
        const lastMessage = conversation[conversation.length - 1] || null;

        return {
          ...chatUser,
          lastMessageText: lastMessage?.messageText || "",
          lastMessageAt: lastMessage?.createdAt || null,
          lastMessageSenderId: lastMessage?.senderId || null,
        };
      })
      .sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        if (timeB !== timeA) {
          return timeB - timeA;
        }
        return a.name.localeCompare(b.name, "kk");
      });
  }, [chatUsers, user.id]);

  const selectedChatUser =
    chatUsersWithMeta.find((item) => String(item.id) === String(selectedUserId)) || null;
  const showSidebar = !isMobile || !selectedUserId;
  const showChatPanel = !isMobile || Boolean(selectedUserId);

  const sendMessage = (e) => {
    e.preventDefault();
    setError("");

    const normalizedText = messageText.trim();
    if (!selectedUserId) {
      setError("Қолданушыны таңдаңыз");
      return;
    }
    if (!normalizedText) {
      setError("Бос хабарлама жіберуге болмайды");
      return;
    }

    const newMessage = {
      id: Date.now(),
      senderId: Number(user.id),
      receiverId: Number(selectedUserId),
      messageText: normalizedText,
      createdAt: new Date().toISOString(),
      senderName: user.name,
    };

    const store = readChatStore();
    const key = getConversationKey(user.id, selectedUserId);
    const updatedConversation = [...(store[key] || []), newMessage];
    store[key] = updatedConversation;
    writeChatStore(store);

    setMessages(updatedConversation);
    setMessageText("");
  };

  return (
    <section style={styles.page}>
      <div style={styles.hero}>
        <p style={styles.eyebrow}>Local Messenger</p>
        <h1 style={styles.title}>Чат</h1>
      </div>

      <div
        style={{
          ...styles.chatOnlyLayout,
          gridTemplateColumns: isTablet ? "1fr" : "320px minmax(0,1fr)",
        }}
      >
        {showSidebar && (
          <div
            style={{
              ...styles.sidebar,
              position: isTablet ? "static" : "sticky",
              top: isTablet ? "auto" : 100,
            }}
          >
            <h2 style={styles.sectionTitle}>Қолданушылар</h2>

            <div style={styles.userList}>
              {chatUsersWithMeta.map((chatUser) => {
                const presence = getPresenceState(chatUser.lastMessageAt);
                const avatarTheme = getAvatarTheme(chatUser.name);

                return (
                  <button
                    key={chatUser.id}
                    style={{
                      ...(selectedUserId === String(chatUser.id)
                        ? styles.userButtonActive
                        : styles.userButton),
                    }}
                    onClick={() => setSelectedUserId(String(chatUser.id))}
                  >
                    <div style={styles.avatarWrap}>
                      <div
                        style={{
                          ...styles.userAvatar,
                          background: avatarTheme.background,
                          color: avatarTheme.textColor,
                          boxShadow: `0 16px 36px ${avatarTheme.shadow}`,
                        }}
                      >
                        {getAvatarText(chatUser.name)}
                      </div>
                      <span
                        style={{
                          ...styles.presenceDot,
                          background: presence.color,
                          boxShadow: `0 0 0 4px ${presence.glow}`,
                        }}
                      />
                    </div>

                    <div style={styles.userInfoCol}>
                      <div style={styles.userRow}>
                        <strong>{chatUser.name}</strong>
                      </div>
                      <div style={styles.userMetaRow}>
                        <span style={styles.roleText}>{chatUser.role}</span>
                        <span style={styles.statusText}>{presence.label}</span>
                      </div>
                      <div style={styles.userMetaRow}>
                        {chatUser.lastMessageSenderId && (
                          <span style={styles.lastSenderChip}>
                            {Number(chatUser.lastMessageSenderId) === Number(chatUser.id)
                              ? "Ол жазды"
                              : "Сіз жаздыңыз"}
                          </span>
                        )}
                        {chatUser.lastMessageAt && (
                          <span style={styles.microDate}>
                            {formatDateTime(chatUser.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <span style={styles.previewText}>
                        {chatUser.lastMessageText || "Әзірге хабарлама жоқ"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showChatPanel && (
          <div style={{ ...styles.chatCard, minHeight: isMobile ? 560 : 700 }}>
            <div style={styles.chatHeader}>
              {selectedChatUser ? (
                (() => {
                  const presence = getPresenceState(selectedChatUser.lastMessageAt);
                  const avatarTheme = getAvatarTheme(selectedChatUser.name);

                  return (
                    <div style={styles.activeChatHead}>
                      {isMobile && (
                        <button style={styles.backButton} onClick={() => setSelectedUserId("")}>
                          Артқа
                        </button>
                      )}

                      <div style={styles.activeAvatarWrap}>
                        <div
                          style={{
                            ...styles.activeAvatar,
                            background: avatarTheme.background,
                            color: avatarTheme.textColor,
                            boxShadow: `0 20px 40px ${avatarTheme.shadow}`,
                          }}
                        >
                          {getAvatarText(selectedChatUser.name)}
                        </div>
                        <span
                          style={{
                            ...styles.presenceDot,
                            background: presence.color,
                            boxShadow: `0 0 0 4px ${presence.glow}`,
                          }}
                        />
                      </div>

                      <div>
                        <h2 style={styles.sectionTitle}>{selectedChatUser.name}</h2>
                        <span style={styles.smallMuted}>
                          {presence.label} · {selectedChatUser.role}
                        </span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <>
                  <h2 style={styles.sectionTitle}>Чат терезесі</h2>
                  <span style={styles.smallMuted}>Қолданушыны таңдаңыз</span>
                </>
              )}
            </div>

            <div ref={messageHistoryRef} style={styles.messageHistory}>
              {!selectedChatUser ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>✦</div>
                  <h3 style={styles.emptyTitle}>Диалогты таңдаңыз</h3>
                  <p style={styles.text}>Хабарламалар локалды жұмыс істейді. Бұл бөлім енді базаға тәуелді емес.</p>
                </div>
              ) : messages.length === 0 ? (
                <p style={styles.text}>Хабарлама тарихы жоқ.</p>
              ) : (
                messages.map((item) => {
                  const avatarTheme = getAvatarTheme(
                    item.senderId === user.id ? user.name : item.senderName
                  );

                  return (
                    <div
                      key={item.id}
                      style={item.senderId === user.id ? styles.messageOwn : styles.messageOther}
                    >
                      <div style={styles.messageTopRow}>
                        <div style={styles.messageHeadInline}>
                          <div
                            style={{
                              ...(item.senderId === user.id
                                ? styles.messageAvatarOwn
                                : styles.messageAvatarOther),
                              background: avatarTheme.background,
                              color: avatarTheme.textColor,
                            }}
                          >
                            {getAvatarText(
                              item.senderId === user.id ? user.name : item.senderName
                            )}
                          </div>
                          <span
                            style={
                              item.senderId === user.id
                                ? styles.senderChipOwn
                                : styles.senderChipOther
                            }
                          >
                            {item.senderId === user.id ? "Сіз" : item.senderName || "Қолданушы"}
                          </span>
                        </div>
                      </div>

                      <p style={styles.messageText}>{item.messageText}</p>
                      <span style={styles.dateText}>{formatDateTime(item.createdAt)}</span>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={sendMessage} style={styles.messageForm}>
              <textarea
                style={{ ...styles.textarea, minHeight: isMobile ? 92 : 120 }}
                placeholder="Хабарлама жазыңыз..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                maxLength={500}
              />

              <div
                style={{
                  ...styles.formFooter,
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "stretch" : "center",
                }}
              >
                {error && <p style={styles.error}>{error}</p>}
                <button
                  style={{ ...styles.primaryButton, width: isMobile ? "100%" : "auto" }}
                  type="submit"
                  disabled={!selectedUserId}
                >
                  Жіберу
                </button>
              </div>
            </form>
          </div>
        )}
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
  hero: { ...card, padding: 32 },
  eyebrow: {
    color: "#8ab4ff",
    textTransform: "uppercase",
    letterSpacing: "0.24em",
    fontSize: 12,
    marginBottom: 12,
  },
  title: { fontSize: "clamp(2rem, 4vw, 3.4rem)", marginBottom: 12 },
  text: { color: "#b7c7e7", lineHeight: 1.7 },
  chatOnlyLayout: { display: "grid", gridTemplateColumns: "320px minmax(0,1fr)", gap: 22, alignItems: "start" },
  sidebar: { ...card, padding: 20, display: "grid", gap: 14 },
  chatCard: { ...card, padding: 24, display: "grid", gap: 16, minHeight: 700 },
  sectionTitle: { fontSize: 24 },
  userList: { display: "grid", gap: 10 },
  avatarWrap: { position: "relative", width: 56, height: 56, alignSelf: "start" },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(125, 180, 255, 0.18)",
    fontWeight: 900,
    letterSpacing: "0.04em",
  },
  activeAvatarWrap: { position: "relative", width: 64, height: 64 },
  activeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(125, 180, 255, 0.2)",
    fontWeight: 900,
    fontSize: 20,
  },
  presenceDot: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 10,
    height: 10,
    borderRadius: 999,
    border: "2px solid #09152d",
  },
  userInfoCol: { minWidth: 0, display: "grid", gap: 8 },
  userRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  userMetaRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  userButton: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(126, 171, 255, 0.1)",
    borderRadius: 18,
    padding: "14px 16px",
    color: "#eef5ff",
    textAlign: "left",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "56px minmax(0,1fr)",
    gap: 14,
    alignItems: "start",
  },
  userButtonActive: {
    background: "rgba(125, 180, 255, 0.12)",
    border: "1px solid rgba(125, 180, 255, 0.22)",
    borderRadius: 18,
    padding: "14px 16px",
    color: "#eef5ff",
    textAlign: "left",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "56px minmax(0,1fr)",
    gap: 14,
    alignItems: "start",
  },
  roleText: { color: "#9fb4d7", fontSize: 13 },
  statusText: { color: "#d9e6ff", fontSize: 12, fontWeight: 700 },
  microDate: { color: "#7f96ba", fontSize: 11 },
  lastSenderChip: {
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(125, 180, 255, 0.14)",
    border: "1px solid rgba(125, 180, 255, 0.2)",
    color: "#dceaff",
    fontSize: 12,
    fontWeight: 700,
  },
  previewText: {
    color: "#d3e2ff",
    fontSize: 13,
    opacity: 0.9,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  activeChatHead: { display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" },
  backButton: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(126, 171, 255, 0.14)",
    color: "#eef5ff",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },
  smallMuted: { color: "#9fb4d7", fontSize: 13 },
  messageHistory: {
    minHeight: 420,
    maxHeight: 560,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: "14px 0",
    justifyContent: "flex-end",
    borderTop: "1px solid rgba(126, 171, 255, 0.08)",
    borderBottom: "1px solid rgba(126, 171, 255, 0.08)",
  },
  emptyState: {
    minHeight: 280,
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    gap: 10,
    padding: "28px 18px",
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, rgba(125, 180, 255, 0.22), rgba(181, 208, 255, 0.08))",
    color: "#9dc5ff",
    fontSize: 30,
    fontWeight: 900,
  },
  emptyTitle: { color: "#eef5ff", fontSize: 24 },
  messageOwn: {
    padding: "14px 16px",
    borderRadius: 20,
    background: "rgba(125, 180, 255, 0.12)",
    border: "1px solid rgba(125, 180, 255, 0.18)",
    marginLeft: "auto",
    maxWidth: "78%",
  },
  messageOther: {
    padding: "14px 16px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(126, 171, 255, 0.1)",
    marginRight: "auto",
    maxWidth: "78%",
  },
  messageTopRow: { display: "flex", marginBottom: 8 },
  messageHeadInline: { display: "flex", alignItems: "center", gap: 10 },
  messageAvatarOwn: {
    width: 30,
    height: 30,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 800,
  },
  messageAvatarOther: {
    width: 30,
    height: 30,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 800,
  },
  senderChipOwn: {
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(7, 19, 39, 0.55)",
    color: "#d8e8ff",
    fontSize: 12,
    fontWeight: 800,
  },
  senderChipOther: {
    padding: "4px 10px",
    borderRadius: 999,
    background: "linear-gradient(135deg, #7db4ff, #b5d0ff)",
    color: "#071327",
    fontSize: 12,
    fontWeight: 800,
  },
  messageText: { color: "#eef5ff", lineHeight: 1.6, marginBottom: 6 },
  dateText: { color: "#9fb4d7", fontSize: 12 },
  messageForm: { display: "grid", gap: 12, marginTop: "auto" },
  formFooter: { display: "flex", justifyContent: "space-between", gap: 12 },
  textarea: { ...inputBase, minHeight: 120, resize: "vertical" },
  primaryButton: {
    background: "linear-gradient(135deg, #7db4ff, #b5d0ff)",
    color: "#071327",
    border: "none",
    padding: "12px 18px",
    borderRadius: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
  error: { color: "#ff9a9a" },
};

export default Inbox;
