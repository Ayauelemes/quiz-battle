const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
const host = "127.0.0.1";

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "brain_battle",
  password: process.env.DB_PASSWORD || "1234",
  port: Number(process.env.DB_PORT) || 5432,
  connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const allowedRoles = ["admin", "player", "moderator"];
const maxMessageLength = 500;

const requestLogger = (req, _res, next) => {
  const role = req.headers["x-user-role"] || "guest";
  const userId = req.headers["x-user-id"] || "anonymous";
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} role=${role} user=${userId}`
  );
  next();
};

app.use(requestLogger);

const getRequestUser = (req) => ({
  id: req.headers["x-user-id"] || null,
  role: req.headers["x-user-role"] || null,
});

const requireAuth = (req, res, next) => {
  const actor = getRequestUser(req);
  if (!actor.id || !actor.role) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.actor = actor;
  return next();
};

const requireRole = (roles) => [
  requireAuth,
  (req, res, next) => {
    if (!roles.includes(req.actor.role)) {
      console.log(`[ACCESS DENIED] role=${req.actor.role} path=${req.originalUrl}`);
      return res.status(403).json({ error: "Access denied" });
    }
    return next();
  },
];

const mapQuestion = (row) => ({
  id: row.id,
  question: row.question_text,
  options: Array.isArray(row.options)
    ? row.options
    : typeof row.options === "string"
      ? JSON.parse(row.options)
      : [],
  answer: row.correct_answer,
  category: row.category,
});

const mapUser = (row) => ({
  id: row.id,
  name: row.username,
  email: row.email,
  role: row.role,
});

const mapGame = (row) => ({
  id: row.id,
  userId: row.user_id,
  score: row.score,
  playedAt: row.played_at,
  userName: row.username || null,
  role: row.role || null,
});

const mapNotification = (row) => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  message: row.message,
  isRead: row.is_read,
  createdAt: row.created_at,
});

const mapFeedback = (row) => ({
  id: row.id,
  userId: row.user_id,
  messageText: row.message_text,
  rating: Number(row.rating || 0),
  createdAt: row.created_at,
  userName: row.username || null,
});

const createNotification = async (userId, title, message) => {
  await pool.query(
    `INSERT INTO notifications (user_id, title, message, is_read, created_at)
     VALUES ($1, $2, $3, FALSE, NOW())`,
    [userId, title, message]
  );
};

const ensureSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message_text TEXT,
      rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE feedbacks
    ADD COLUMN IF NOT EXISTS rating INTEGER NOT NULL DEFAULT 5
  `);

  await pool.query(`
    ALTER TABLE feedbacks
    ALTER COLUMN message_text DROP NOT NULL
  `);
};

app.get("/", (_req, res) => {
  // Simple root route to make integration tests easier
  return res.status(200).send("OK");
});

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Дерекқорға қосылу қатесі" });
  }
});

app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  const normalizedRole = role === "moderator" ? "moderator" : "player";

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Барлық өрісті толтырыңыз" });
  }

  try {
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rowCount > 0) {
      return res.status(409).json({ error: "Бұл email бұрыннан тіркелген" });
    }

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role`,
      [name, email, password, normalizedRole]
    );

    const createdUser = mapUser(result.rows[0]);
    await createNotification(
      createdUser.id,
      "Қош келдіңіз",
      "Сіз Brain Battle жүйесіне сәтті тіркелдіңіз."
    );

    console.log(`[REGISTER] email=${email} role=${normalizedRole}`);
    return res.status(201).json(createdUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Тіркеу кезінде қате шықты" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email мен құпиясөзді енгізіңіз" });
  }

  try {
    const result = await pool.query(
      `SELECT id, username, email, password_hash, role
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Пайдаланушы табылмады" });
    }

    const user = result.rows[0];
    if (user.password_hash !== password) {
      return res.status(401).json({ error: "Құпиясөз қате" });
    }

    console.log(`[LOGIN] user=${user.id} role=${user.role}`);
    return res.json(mapUser(user));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Кіру кезінде қате шықты" });
  }
});

app.get("/api/questions", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, question_text, options, correct_answer, category
       FROM questions
       ORDER BY id ASC`
    );
    res.json(result.rows.map(mapQuestion));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Сұрақтарды алу кезінде қате шықты" });
  }
});

app.get("/api/public-feedbacks", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id, f.user_id, f.message_text, f.rating, f.created_at, u.username
       FROM feedbacks f
       LEFT JOIN users u ON u.id = f.user_id
       ORDER BY f.created_at DESC, f.id DESC
       LIMIT 6`
    );

    res.json(result.rows.map(mapFeedback));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Пікірлерді алу кезінде қате шықты" });
  }
});

app.get("/api/chat-users", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, role
       FROM users
       WHERE id <> $1
       ORDER BY username ASC`,
      [req.actor.id]
    );

    res.json(result.rows.map(mapUser));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Қолданушыларды алу кезінде қате шықты" });
  }
});

app.post("/api/questions", ...requireRole(["admin"]), async (req, res) => {
  const { question, options, answer, category } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO questions (question_text, options, correct_answer, category)
       VALUES ($1, $2, $3, $4)
       RETURNING id, question_text, options, correct_answer, category`,
      [question, options, answer, category]
    );
    console.log(`[QUESTION CREATE] by=${req.actor.id}`);
    res.status(201).json(mapQuestion(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Сұрақты қосу кезінде қате шықты" });
  }
});

app.put("/api/questions/:id", ...requireRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { question, options, answer, category } = req.body;

  try {
    const result = await pool.query(
      `UPDATE questions
       SET question_text = $1,
           options = $2,
           correct_answer = $3,
           category = $4
       WHERE id = $5
       RETURNING id, question_text, options, correct_answer, category`,
      [question, options, answer, category, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Сұрақ табылмады" });
    }

    console.log(`[QUESTION UPDATE] id=${id} by=${req.actor.id}`);
    return res.json(mapQuestion(result.rows[0]));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Сұрақты жаңарту кезінде қате шықты" });
  }
});

app.delete("/api/questions/:id", ...requireRole(["admin"]), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM questions WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Сұрақ табылмады" });
    }

    console.log(`[QUESTION DELETE] id=${id} by=${req.actor.id}`);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Сұрақты жою кезінде қате шықты" });
  }
});

app.get("/api/users", ...requireRole(["admin"]), async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, role
       FROM users
       ORDER BY id ASC`
    );
    res.json(result.rows.map(mapUser));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Пайдаланушыларды алу кезінде қате шықты" });
  }
});

app.post("/api/users", ...requireRole(["admin"]), async (req, res) => {
  const { name, email, password, role } = req.body;
  const normalizedRole = allowedRoles.includes(role) ? role : "player";

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Барлық өрісті толтырыңыз" });
  }

  try {
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rowCount > 0) {
      return res.status(409).json({ error: "Бұл email бұрыннан тіркелген" });
    }

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role`,
      [name, email, password, normalizedRole]
    );

    const createdUser = mapUser(result.rows[0]);
    await createNotification(
      createdUser.id,
      "Жаңа аккаунт құрылды",
      `Сіздің рөліңіз: ${normalizedRole}. Жүйеге кіріп, жұмысты бастай аласыз.`
    );

    console.log(`[USER CREATE] by=${req.actor.id} role=${normalizedRole}`);
    return res.status(201).json(createdUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Пайдаланушы қосу кезінде қате шықты" });
  }
});

app.put("/api/users/:id/role", ...requireRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: "Қолдау көрсетілмейтін рөл" });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET role = $1
       WHERE id = $2
       RETURNING id, username, email, role`,
      [role, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Пайдаланушы табылмады" });
    }

    await createNotification(
      id,
      "Рөліңіз өзгертілді",
      `Жаңа рөліңіз: ${role}. Қайта кіріп, жаңа мүмкіндіктерді пайдаланыңыз.`
    );

    console.log(`[USER ROLE UPDATE] id=${id} role=${role} by=${req.actor.id}`);
    return res.json(mapUser(result.rows[0]));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Рөлді өзгерту кезінде қате шықты" });
  }
});

app.delete("/api/users/:id", ...requireRole(["admin"]), async (req, res) => {
  const { id } = req.params;

  if (String(req.actor.id) === String(id)) {
    return res.status(400).json({ error: "Өзіңізді өшіруге болмайды" });
  }

  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Пайдаланушы табылмады" });
    }

    console.log(`[USER DELETE] id=${id} by=${req.actor.id}`);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Пайдаланушыны жою кезінде қате шықты" });
  }
});

app.get("/api/games", ...requireRole(["admin", "moderator"]), async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.id, g.user_id, g.score, g.played_at, u.username, u.role
       FROM games g
       LEFT JOIN users u ON u.id = g.user_id
       ORDER BY g.played_at DESC, g.id DESC`
    );
    res.json(result.rows.map(mapGame));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ойын статистикасын алу кезінде қате шықты" });
  }
});

app.post("/api/games", ...requireRole(["player", "moderator", "admin"]), async (req, res) => {
  const { score } = req.body;
  const numericScore = Number(score);

  if (Number.isNaN(numericScore)) {
    return res.status(400).json({ error: "Ұпай саны дұрыс емес" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO games (user_id, score, played_at)
       VALUES ($1, $2, NOW())
       RETURNING id, user_id, score, played_at`,
      [req.actor.id, numericScore]
    );

    const admins = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    await createNotification(
      req.actor.id,
      "Ойын нәтижесі",
      `Сіздің нәтижеңіз сақталды. Ұпай: ${numericScore}.`
    );

    await Promise.all(
      admins.rows.map((admin) =>
        createNotification(
          admin.id,
          "Жаңа ойын нәтижесі",
          `Пайдаланушы ${req.actor.id} ойынды аяқтады. Ұпай: ${numericScore}.`
        )
      )
    );

    console.log(`[GAME SAVE] user=${req.actor.id} score=${numericScore}`);
    return res.status(201).json(mapGame(result.rows[0]));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Ойын нәтижесін сақтау кезінде қате шықты" });
  }
});

app.get("/api/my-games", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, score, played_at
       FROM games
       WHERE user_id = $1
       ORDER BY played_at DESC, id DESC`,
      [req.actor.id]
    );
    res.json(result.rows.map(mapGame));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Жеке ойын нәтижелерін алу кезінде қате шықты" });
  }
});

app.get("/api/notifications", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, title, message, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC`,
      [req.actor.id]
    );
    res.json(result.rows.map(mapNotification));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Хабарламаларды алу кезінде қате шықты" });
  }
});

app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, title, message, is_read, created_at`,
      [id, req.actor.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Хабарлама табылмады" });
    }

    return res.json(mapNotification(result.rows[0]));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Хабарламаны жаңарту кезінде қате шықты" });
  }
});

app.patch("/api/notifications/read-all", requireAuth, async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE user_id = $1 AND is_read = FALSE`,
      [req.actor.id]
    );

    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Хабарламаларды жаңарту кезінде қате шықты" });
  }
});


app.get("/api/feedbacks", ...requireRole(["admin"]), async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id, f.user_id, f.message_text, f.rating, f.created_at, u.username
       FROM feedbacks f
       LEFT JOIN users u ON u.id = f.user_id
       ORDER BY f.created_at DESC, f.id DESC`
    );
    res.json(result.rows.map(mapFeedback));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Отзывтарды алу кезінде қате шықты" });
  }
});

app.get("/api/my-feedbacks", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, message_text, rating, created_at
       FROM feedbacks
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC`,
      [req.actor.id]
    );
    res.json(result.rows.map(mapFeedback));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Жеке пікірлерді алу кезінде қате шықты" });
  }
});

app.post("/api/feedbacks", requireAuth, async (req, res) => {
  const normalizedText = String(req.body.messageText || "").trim();
  const rating = Number(req.body.rating);

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Жұлдыз санын 1-ден 5-ке дейін таңдаңыз" });
  }
  if (normalizedText.length > maxMessageLength) {
    return res.status(400).json({ error: "Отзыв тым ұзын" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO feedbacks (user_id, message_text, rating, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, user_id, message_text, rating, created_at`,
      [req.actor.id, normalizedText || null, rating]
    );

    await createNotification(
      req.actor.id,
      "Пікір жіберілді",
      `Сіздің ${rating} жұлдызды пікіріңіз жіберілді.`
    );

    const admins = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    await Promise.all(
      admins.rows.map((admin) =>
        createNotification(
          admin.id,
          "Жаңа отзыв",
          `Пайдаланушы ${req.actor.id} ${rating} жұлдызды отзыв қалдырды.`
        )
      )
    );

    res.status(201).json(mapFeedback(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Отзыв сақтау кезінде қате шықты" });
  }
});

const startServer = async () => {
  try {
    await ensureSchema();
    const server = app.listen(port, host, () => {
      console.log(`Backend сервер http://${host}:${port} адресінде қосылды`);
    });

    server.on("error", (error) => {
      console.error("Backend іске қосылу қатесі:", error);
    });
    return server;
  } catch (error) {
    console.error("Schema дайындау қатесі:", error);
    process.exit(1);
  }
};

// If run directly, start the server. When required by tests, export the app
if (require.main === module) {
  startServer();
}

module.exports = app;

