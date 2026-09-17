// ==========================================
// 8 BALL POOL - CORE PERSISTENCE & DATABASE
// ==========================================

const STORAGE_PREFIX = "8bp_";

function getStorage(key, fallback) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item !== null ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn("Storage read error:", e);
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage write error:", e);
  }
}

function formatNumber(num) {
  return (num || 0).toLocaleString();
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

// Avatar Gradient generator
const AVATAR_COLORS = [
  ["#2E7D32", "#1B5E20"],
  ["#1565C0", "#0D47A1"],
  ["#C62828", "#8E0000"],
  ["#6A1B9A", "#4A148C"],
  ["#EF6C00", "#E65100"],
  ["#00838F", "#006064"]
];

function getAvatarGradient(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash += name.charCodeAt(i);
  const pair = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
}

// ==========================================
// DATABASE SCHEMA INITIALIZATION
// Real records only, no fake data counters!
// ==========================================
function initDatabase() {
  // 1. Admins Table
  let admins = getStorage("admins", null);
  if (!admins) {
    admins = [
      {
        username: "789895",
        password: "020203",
        role: "ADMIN",
        name: "Master Admin",
        createdAt: Date.now()
      }
    ];
    setStorage("admins", admins);
  }

  // 2. Users Table
  let users = getStorage("users", null);
  const ADMIN_RECORD = {
    id: 1,
    playerId: "8BP-000001",
    username: "789895",
    password: "020203",
    emailOrPhone: "admin@8ballpool.internal",
    avatar: "avatar_1",
    coinBalance: 10000000,
    role: "ADMIN",
    status: "ACTIVE",
    isApproved: true,
    isOnline: true,
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    createdAt: Date.now(),
    lastActive: Date.now()
  };

  if (!users) {
    // Seed the permanent admin and user Rahul
    users = [
      ADMIN_RECORD,
      {
        id: 2,
        playerId: "8BP-104582",
        username: "Rahul",
        password: "user123",
        emailOrPhone: "rahul@pool.com",
        avatar: "avatar_2",
        coinBalance: 0, // Starts at 0 to test coin request system
        role: "USER",
        status: "ACTIVE",
        isApproved: true,
        isOnline: true,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        createdAt: Date.now() - 86400000 * 2,
        lastActive: Date.now()
      }
    ];
    setStorage("users", users);
  } else {
    // Ensure admin user 789895 is always present with correct credentials
    const adminIdx = users.findIndex(u => u.username === "789895" || u.role === "ADMIN");
    if (adminIdx !== -1) {
      users[adminIdx].username = "789895";
      users[adminIdx].password = "020203";
      users[adminIdx].role = "ADMIN";
      users[adminIdx].status = "ACTIVE";
    } else {
      users.unshift(ADMIN_RECORD);
    }
    setStorage("users", users);
  }

  // 3. Game Settings Table (Persisted in DB)
  let settings = getStorage("game_settings", null);
  if (!settings) {
    settings = {
      mode1v1: true,
      mode2v2: true,
      durations: [1, 2, 5],
      entryAmounts: [1000, 2000, 5000, 10000],
      customEntryEnabled: true,
      customMin: 500,
      customMax: 500000,
      maintenance: false,
      updatedAt: Date.now()
    };
    setStorage("game_settings", settings);
  }

  // 4. Coin Requests Table
  if (!getStorage("coin_requests", null)) {
    setStorage("coin_requests", []);
  }

  // 5. Transactions Table
  if (!getStorage("transactions", null)) {
    setStorage("transactions", []);
  }

  // 6. Matches Table
  if (!getStorage("matches", null)) {
    setStorage("matches", []);
  }

  // 7. Active Games Table (Live currently running matches)
  if (!getStorage("active_games", null)) {
    setStorage("active_games", []);
  }

  // 8. Rooms Table
  if (!getStorage("rooms", null)) {
    setStorage("rooms", []);
  }

  // 9. Invitations Table
  if (!getStorage("invitations", null)) {
    setStorage("invitations", []);
  }

  // 10. Notifications Table
  if (!getStorage("notifications", null)) {
    setStorage("notifications", []);
  }

  // 11. Activity Logs Table (User action tracking)
  if (!getStorage("activity_logs", null)) {
    setStorage("activity_logs", []);
  }

  // 12. Admin Audit Logs Table (Immutable audit trail)
  if (!getStorage("audit_logs", null)) {
    setStorage("audit_logs", [
      {
        logId: "LOG-INIT",
        adminId: "789895",
        action: "SYSTEM_INIT",
        targetUserId: "SYSTEM",
        amount: 0,
        reason: "Admin management system initialized with credentials 789895",
        createdAt: Date.now()
      }
    ]);
  }
}

// Active session objects in memory
let currentUser = getStorage("current_user", null);
let adminSession = getStorage("admin_session", null);
let currentRoom = null;
let activeMatchEngine = null;

// ==========================================
// CORE AUDITING & LOGGING SYSTEM
// ==========================================

// Transaction Recording
function recordTransaction(userId, userPlayerId, type, amount, prevBal, newBal, description, matchId = "") {
  const txns = getStorage("transactions", []);
  const txn = {
    transactionId: "TXN-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    userId: userId,
    userPlayerId: userPlayerId,
    type: type, // STARTING_BALANCE, MATCH_ENTRY, MATCH_RESULT, COIN_REQUEST, ADMIN_ADD, ADMIN_DEDUCT, REFUND, BONUS
    amount: amount,
    previousBalance: prevBal,
    newBalance: newBal,
    matchId: matchId,
    description: description,
    createdAt: Date.now()
  };
  txns.unshift(txn);
  setStorage("transactions", txns);
  return txn;
}

// Admin Audit Log Recording (Strictly non-editable)
function recordAuditLog(adminId, action, targetUser, amount, reason, details = {}) {
  const audit = getStorage("audit_logs", []);
  const log = {
    logId: "LOG-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    adminId: adminId || (adminSession ? adminSession.username : "789895"),
    action: action, // LOGIN, LOGOUT, APPROVE_COIN_REQUEST, REJECT_COIN_REQUEST, ADD_COINS, DEDUCT_COINS, REFUND, BONUS_COINS, SUSPEND_USER, ACTIVATE_USER, CHANGE_GAME_SETTING
    targetUserId: targetUser,
    amount: amount || 0,
    reason: reason || "",
    details: details,
    createdAt: Date.now()
  };
  audit.unshift(log);
  setStorage("audit_logs", audit);
  return log;
}

// User Activity Event Recording
function recordUserActivity(userId, playerId, username, action, relatedId = "", details = "") {
  const activities = getStorage("activity_logs", []);
  const act = {
    activityId: "ACT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    userId: userId,
    playerId: playerId,
    username: username,
    action: action,
    relatedId: relatedId,
    details: details,
    createdAt: Date.now()
  };
  activities.unshift(act);
  // Cap to last 500 for storage efficiency
  if (activities.length > 500) activities.length = 500;
  setStorage("activity_logs", activities);
  return act;
}

// Notification Dispatcher
function createNotification(userId, playerId, type, title, message) {
  const notifs = getStorage("notifications", []);
  const notif = {
    notificationId: "NTF-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    userId: userId,
    playerId: playerId,
    type: type, // COIN_REQUEST_APPROVED, COIN_REQUEST_REJECTED, ADMIN_COINS, INVITATION, MATCH_RESULT, STATUS_CHANGE
    title: title,
    message: message,
    read: false,
    createdAt: Date.now()
  };
  notifs.unshift(notif);
  setStorage("notifications", notifs);
  return notif;
}

// Execute initial database seed
initDatabase();
