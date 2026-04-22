// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const { Pool } = require('pg');

// dotenv.config();

// const app = express();

// // 🔥 PostgreSQL Connection
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// pool.connect()
//   .then(() => console.log("✅ Database Connected Successfully"))
//   .catch((err) => console.error("❌ Database Connection Failed:", err));

// // middleware
// app.use(cors());
// app.use(express.json());

// // routes
// app.get('/', (req, res) => {
//   res.send('API is running');
// });

// // custom routes
// const userRoutes = require('./routes/userRoutes');
// app.use('/api/users', userRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");

// const authRoutes = require("./routes/auth");
// const userRoutes = require("./routes/users");
// const settingsRoutes = require("./routes/settings");
// const chatRoutes = require("./routes/chat");

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use("/uploads", express.static("uploads"));

// app.use("/api/settings", settingsRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api", authRoutes);

// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });


const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const authRoutes      = require("./routes/auth");
const userRoutes      = require("./routes/users");
const associateRoutes = require("./routes/associate");
const rolesRouter = require("./routes/roles");

const settingsRoutes = require("./routes/settings");
const chatRoutes = require("./routes/chat");
const enquiriesRoutes = require("./routes/enquiries");
const admissionsRoutes = require("./routes/admissions");
const attendanceRoutes = require("./routes/attendance");
// const pretestAdminRoutes = require('./routes/pretestAdmin');
const pretestRoutes = require('./routes/pretest');

const studentPretestRoutes = require('./routes/student-pretest');

// ── New routes ─────────────────────────────────────────────────────────────────
const coursesRoutes  = require("./routes/courses");
const bookingsRoutes = require("./routes/bookings");
const leadsRoutes    = require("./routes/leads");
const uploadRoutes = require("./routes/uploads");

const posttestRoutes = require('./routes/posttest');
const assessmentRoutes = require('./routes/assessments');
const practicalRoutes = require('./routes/practical');
const infrastructureRoutes = require("./routes/infrastructure");
const jobRoutes = require("./routes/jobs");
const apllied = require("./routes/apllied_jobs");
const contactInfoRoutes = require("./routes/contact_info");
const placementAuth = require("./routes/placementAuth");
const placementLogin = require("./routes/placementLogin");

// In index.js — add this if not already there
const path = require('path');
const app  = express();
const PORT = process.env.PORT || 5000;
// Add this with your other routes


// ── Middleware ─────────────────────────────────────────────────────────────────
// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));              // ← add limit
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // ← add limit
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ── Routes ─────────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);       // ✅ FIXED: was "/api" → now "/api/auth"
app.use("/api/users",     userRoutes);       // POST /api/users
app.use("/api/associate", associateRoutes);  // GET/POST /api/associate
app.use("/api/roles", rolesRouter);

// app.use("/api/popups", popupsRoutes);
app.use("/api/enquiries", enquiriesRoutes);
app.use("/api/admissions", admissionsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/chat", chatRoutes);
// app.use('/api/admin/pretest', pretestAdminRoutes);
app.use('/api/admin/pretest', pretestRoutes);
app.use('/api/student/pretest', studentPretestRoutes);
app.use("/api/courses",  coursesRoutes);   // GET /api/courses
                                           // GET /api/courses/slug/:slug
                                           // GET /api/courses/:id
app.use("/api/bookings", bookingsRoutes);  // POST /api/bookings
app.use("/api/leads",    leadsRoutes); 
app.use("/api/upload",   uploadRoutes);    // POST /api/upload/video
app.use('/api/admin/posttest', posttestRoutes);

app.use('/api/assessments', assessmentRoutes);

app.use('/api/practical', practicalRoutes);
app.use("/api/infrastructure", infrastructureRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/jobs", apllied);
app.use("/api/settings", contactInfoRoutes);
app.use("/api/placement", placementAuth);
app.use("/api/placement", placementLogin);


// app.use("/api", authRoutes);
// ── Health check ───────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "NTSC API is running" });
});

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Auth    → POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   Users   → http://localhost:${PORT}/api/users`);
  console.log(`   Assoc   → http://localhost:${PORT}/api/associate`);
});
