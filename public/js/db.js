// ==========================================
// 8 BALL POOL - DATA & PERSISTENCE LAYER
// ==========================================
const STORAGE_PREFIX = "8bp_";

function getStorage(key, fallback) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage write error", e);
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

// Initialize Database & Seeds
function initDatabase() {
  let users = getStorage("users", null);
  
  // Mandatory Admin Credentials: Username: 789895, Password: 020203
  const ADMIN_USER = {
    id: 1,
    playerId: "8BP-000001",
    username: "789895",
    password: "020203",
    emailOrPhone: "admin@8ballpool.app",
    avatar: "avatar_1",
    coinBalance: 10000000,
    role: "ADMIN",
    status: "ACTIVE",
    isApproved: true,
    isOnline: true,
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    createdAt: Date.now()
  };

  if (!users) {
    users = [
      ADMIN_USER,
      {
        id: 2,
        playerId: "8BP-104582",
        username: "Rahul",
        password: "user123",
        emailOrPhone: "rahul@pool.com",
        avatar: "avatar_2",
        coinBalance: 0,
        role: "USER",
        status: "ACTIVE",
        isApproved: true,
        isOnline: true,
        matchesPlayed: 14,
        matchesWon: 10,
        matchesLost: 4,
        createdAt: Date.now() - 86400000 * 3
      },
      {
        id: 3,
        playerId: "8BP-882190",
        username: "CueMaster",
        password: "user123",
        emailOrPhone: "cue@pool.com",
        avatar: "avatar_3",
        coinBalance: 185000,
        role: "USER",
        status: "ACTIVE",
        isApproved: true,
        isOnline: true,
        matchesPlayed: 25,
        matchesWon: 19,
        matchesLost: 6,
        createdAt: Date.now() - 86400000 * 5
      }
    ];
    setStorage("users", users);
  } else {
    // Ensure admin user 789895 exists with credentials
    let adminIdx = users.findIndex(u => u.username === "789895" || u.role === "ADMIN");
    if (adminIdx !== -1) {
      users[adminIdx].username = "789895";
      users[adminIdx].password = "020203";
      users[adminIdx].role = "ADMIN";
    } else {
      users.unshift(ADMIN_USER);
    }
    setStorage("users", users);
  }

  // Coin Requests storage
  let requests = getStorage("coin_requests", null);
  if (!requests) {
    requests = [
      {
        requestId: "CRQ-99104",
        userId: 2,
        username: "Rahul",
        playerId: "8BP-104582",
        currentBalance: 0,
        requestedAmount: 10000,
        reason: "I want to play more matches.",
        status: "PENDING",
        createdAt: Date.now() - 3600000 * 2
      }
    ];
    setStorage("coin_requests", requests);
  }

  // Transactions
  let txns = getStorage("transactions", null);
  if (!txns) {
    txns = [
      {
        transactionId: "TXN-ADMIN-INIT",
        userId: 1,
        userPlayerId: "8BP-000001",
        type: "STARTING_BONUS",
        amount: 10000000,
        previousBalance: 0,
        newBalance: 10000000,
        description: "Admin master account allocation",
        createdAt: Date.now()
      }
    ];
    setStorage("transactions", txns);
  }

  // Matches
  if (!getStorage("matches", null)) {
    setStorage("matches", []);
  }

  // Active Games
  if (!getStorage("active_games", null)) {
    setStorage("active_games", []);
  }

  // Configuration
  let config = getStorage("config", null);
  if (!config) {
    config = {
      allowedEntries: [1000, 2000, 5000, 10000],
      customMin: 500,
      customMax: 500000,
      durations: [1, 2, 5],
      is1v1: true,
      is2v2: true,
      maintenance: false
    };
    setStorage("config", config);
  }

  // Audit Logs
  if (!getStorage("audit_logs", null)) {
    setStorage("audit_logs", [
      {
        logId: "LOG-INIT",
        adminId: "789895",
        action: "SYSTEM_INIT",
        targetUserId: "SYSTEM",
        reason: "System initialized with secure credentials",
        createdAt: Date.now()
      }
    ]);
  }
}

// Global active states
let currentUser = getStorage("current_user", null);
let adminSession = getStorage("admin_session", null);
let currentRoom = null;
let activeMatchEngine = null;

// Helper to record a coin transaction
function recordTransaction(userId, userPlayerId, type, amount, prevBal, newBal, description) {
  const txns = getStorage("transactions", []);
  const txn = {
    transactionId: "TXN-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    userId: userId,
    userPlayerId: userPlayerId,
    type: type,
    amount: amount,
    previousBalance: prevBal,
    newBalance: newBal,
    description: description,
    createdAt: Date.now()
  };
  txns.unshift(txn);
  setStorage("transactions", txns);
  return txn;
}

// Helper to record an admin audit log
function recordAuditLog(action, target, reason, details = {}) {
  const audit = getStorage("audit_logs", []);
  const log = {
    logId: "LOG-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    adminId: adminSession ? adminSession.username : "SYSTEM",
    action: action,
    targetUserId: target,
    reason: reason,
    details: details,
    createdAt: Date.now()
  };
  audit.unshift(log);
  setStorage("audit_logs", audit);
  return log;
}
