// =======================================================
// 8 BALL POOL - COMPLETE PERMANENT ADMIN MANAGEMENT SYSTEM
// =======================================================

// Global Admin State
let adminDrawerOpen = false;

// ==========================================
// 1. ADMIN LOGIN VIEW (/admin/login)
// ==========================================
function renderAdminLogin() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  // Hide bottom navigation
  const bottomBar = document.getElementById("bottom-bar");
  if (bottomBar) bottomBar.style.display = "none";

  container.innerHTML = `
    <div style="min-height: 80vh; display: flex; flex-direction: column; justify-content: center;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 76px; height: 76px; border-radius: 50%; background: #0c2317; border: 2.5px solid var(--gold); margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: 0 0 24px rgba(255,213,79,0.3);">
          🛡️
        </div>
        <h1 class="gold-title" style="font-size: 24px; letter-spacing: 1.5px;">ADMIN PORTAL</h1>
        <p style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">Authorized Administrative Management System</p>
      </div>

      <div class="card card-gold" style="padding: 22px 18px; box-shadow: 0 10px 30px rgba(0,0,0,0.7);">
        <form id="form-admin-auth">
          <label style="display: block; font-size: 11px; font-weight: 800; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
            ADMIN USERNAME
          </label>
          <input type="text" id="admin-login-user" class="input-field" placeholder="Enter admin username" autocomplete="off" required />

          <label style="display: block; font-size: 11px; font-weight: 800; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
            SECURITY KEY / PASSWORD
          </label>
          <input type="password" id="admin-login-pass" class="input-field" placeholder="Enter admin password" autocomplete="off" required />

          <button type="submit" class="btn btn-gold btn-block" style="height: 48px; font-size: 14px; font-weight: 800; margin-top: 6px; box-shadow: 0 4px 14px rgba(255,213,79,0.35);">
            LOGIN TO ADMIN DASHBOARD
          </button>
        </form>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <button id="btn-admin-to-player-app" class="btn btn-dark btn-sm" style="padding: 8px 16px; font-size: 12px;">
          ← Return to Player Application
        </button>
      </div>
    </div>
  `;

  document.getElementById("btn-admin-to-player-app").onclick = () => {
    navigateTo("/play");
  };

  document.getElementById("form-admin-auth").onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById("admin-login-user").value.trim();
    const p = document.getElementById("admin-login-pass").value.trim();

    // Verification against permanent credentials: 789895 / 020203
    if (u === "789895" && p === "020203") {
      const users = getStorage("users", []);
      let adminRecord = users.find(x => x.username === "789895" && x.role === "ADMIN");
      if (!adminRecord) {
        adminRecord = {
          id: 1,
          playerId: "8BP-000001",
          username: "789895",
          role: "ADMIN",
          coinBalance: 10000000,
          status: "ACTIVE"
        };
      }

      adminSession = adminRecord;
      setStorage("admin_session", adminSession);

      recordAuditLog("789895", "LOGIN", "SYSTEM", 0, "Admin logged into portal successfully");
      showToast("Welcome, Admin 789895!");
      navigateTo("/admin/dashboard");
    } else {
      recordAuditLog("ANONYMOUS", "LOGIN_FAILED", u, 0, "Invalid admin credential attempt");
      showToast("Access Denied: Invalid admin credentials");
    }
  };
}

// ==========================================
// 2. PERMANENT ADMIN NAVIGATION & FRAME
// ==========================================
function getAdminFrameHtml(activeRoute, title, contentHtml) {
  const currentAdminName = adminSession ? adminSession.username : "789895";
  const coinRequests = getStorage("coin_requests", []);
  const pendingCount = coinRequests.filter(r => r.status === "PENDING").length;

  const navItems = [
    { route: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
    { route: "/admin/users", label: "Users", icon: "👥" },
    { route: "/admin/live-games", label: "Live Games", icon: "🎮" },
    { route: "/admin/rooms", label: "Rooms", icon: "🏠" },
    { route: "/admin/coin-requests", label: "Coin Requests", icon: "💰", badge: pendingCount },
    { route: "/admin/transactions", label: "Transactions", icon: "💳" },
    { route: "/admin/matches", label: "Matches", icon: "⚔️" },
    { route: "/admin/invitations", label: "Invitations", icon: "📨" },
    { route: "/admin/leaderboard", label: "Leaderboard", icon: "🏆" },
    { route: "/admin/reports", label: "Reports", icon: "📊" },
    { route: "/admin/settings", label: "Game Settings", icon: "⚙️" },
    { route: "/admin/audit-logs", label: "Audit Logs", icon: "🔐" }
  ];

  return `
    <!-- ADMIN TOP NAVIGATION BAR -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #0b1a13; border-bottom: 1.5px solid var(--gold); padding: 10px 14px; margin: -16px -16px 14px -16px; position: sticky; top: -16px; z-index: 90;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <button id="admin-hamburger-btn" style="background: none; border: none; font-size: 22px; color: var(--gold); cursor: pointer; padding: 2px 4px; display: flex; align-items: center;" title="Open Menu">
          ☰
        </button>
        <div>
          <h2 style="font-size: 13px; font-weight: 800; color: var(--gold); letter-spacing: 0.5px; margin: 0; line-height: 1.2;">
            ${title}
          </h2>
          <span style="font-size: 10px; color: var(--text-secondary);">Admin: <strong>${currentAdminName}</strong></span>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 6px;">
        <button id="admin-refresh-btn" class="btn btn-dark btn-sm" style="padding: 5px 9px; font-size: 12px;" title="Refresh Data">
          🔄
        </button>
        <button id="admin-logout-btn" class="btn btn-dark btn-sm" style="color: var(--loss-red); padding: 5px 9px; font-size: 11px; font-weight: 800;" title="Logout">
          LOGOUT ⎋
        </button>
      </div>
    </div>

    <!-- ADMIN SLIDING DRAWER / SIDEBAR (Mobile & Desktop) -->
    <div id="admin-drawer-overlay" style="display: ${adminDrawerOpen ? 'block' : 'none'}; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 150;"></div>
    <div id="admin-sidebar" style="position: fixed; top: 0; bottom: 0; left: 0; width: 280px; max-width: 85%; background: #071710; border-right: 2px solid var(--gold); z-index: 160; display: flex; flex-direction: column; transform: translateX(${adminDrawerOpen ? '0' : '-100%'}); transition: transform 0.25s ease-in-out; box-shadow: 4px 0 25px rgba(0,0,0,0.8);">
      
      <!-- Drawer Header -->
      <div style="padding: 16px; background: #0c2419; border-bottom: 1px solid var(--bg-card-border); display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 22px;">🛡️</span>
          <div>
            <h3 class="gold-title" style="font-size: 14px; margin: 0;">ADMIN PANEL</h3>
            <span style="font-size: 10px; color: var(--text-muted);">8 Ball Pool Management</span>
          </div>
        </div>
        <button id="admin-drawer-close" style="background: none; border: none; color: var(--text-secondary); font-size: 20px; cursor: pointer; padding: 4px;">✕</button>
      </div>

      <!-- Navigation List -->
      <div style="flex: 1; overflow-y: auto; padding: 10px 8px; display: flex; flex-direction: column; gap: 4px;">
        ${navItems.map(item => {
          const isActive = activeRoute === item.route;
          return `
            <button class="admin-nav-link" data-route="${item.route}" style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid ${isActive ? 'var(--gold)' : 'transparent'}; background: ${isActive ? '#133524' : 'transparent'}; color: ${isActive ? 'var(--gold)' : 'var(--text-primary)'}; font-size: 13px; font-weight: 700; text-align: left; cursor: pointer; transition: all 0.15s;">
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 16px;">${item.icon}</span>
                <span>${item.label}</span>
              </span>
              ${item.badge && item.badge > 0 ? `
                <span style="background: var(--loss-red); color: white; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 10px;">
                  ${item.badge}
                </span>
              ` : ''}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Drawer Footer -->
      <div style="padding: 12px; background: #05100b; border-top: 1px solid var(--bg-card-border); display: flex; flex-direction: column; gap: 6px;">
        <button id="btn-switch-to-player-view" class="btn btn-dark btn-sm btn-block" style="font-size: 11px;">
          🎮 Open Player View
        </button>
        <button id="btn-drawer-logout" class="btn btn-dark btn-sm btn-block" style="color: var(--loss-red); font-size: 11px; font-weight: 800;">
          Logout ⎋
        </button>
      </div>
    </div>

    <!-- MAIN BODY CONTENT -->
    <div id="admin-view-body" style="padding-bottom: 24px;">
      ${contentHtml}
    </div>
  `;
}

function bindAdminFrameEvents(currentRoute, refreshFn) {
  // Hamburger Toggle
  const burger = document.getElementById("admin-hamburger-btn");
  const closeBtn = document.getElementById("admin-drawer-close");
  const overlay = document.getElementById("admin-drawer-overlay");

  const openDrawer = () => {
    adminDrawerOpen = true;
    const sidebar = document.getElementById("admin-sidebar");
    if (sidebar) sidebar.style.transform = "translateX(0)";
    if (overlay) overlay.style.display = "block";
  };

  const closeDrawer = () => {
    adminDrawerOpen = false;
    const sidebar = document.getElementById("admin-sidebar");
    if (sidebar) sidebar.style.transform = "translateX(-100%)";
    if (overlay) overlay.style.display = "none";
  };

  if (burger) burger.onclick = openDrawer;
  if (closeBtn) closeBtn.onclick = closeDrawer;
  if (overlay) overlay.onclick = closeDrawer;

  // Nav links
  document.querySelectorAll(".admin-nav-link").forEach(btn => {
    btn.onclick = () => {
      closeDrawer();
      const r = btn.getAttribute("data-route");
      navigateTo(r);
    };
  });

  // Refresh
  const refBtn = document.getElementById("admin-refresh-btn");
  if (refBtn) {
    refBtn.onclick = () => {
      showToast("Refreshing admin data...");
      refreshFn();
    };
  }

  // Logout
  const logout = () => {
    recordAuditLog(adminSession ? adminSession.username : "789895", "LOGOUT", "SYSTEM", 0, "Admin logged out");
    adminSession = null;
    setStorage("admin_session", null);
    showToast("Logged out of Admin Portal");
    navigateTo("/admin/login");
  };

  const topLogout = document.getElementById("admin-logout-btn");
  if (topLogout) topLogout.onclick = logout;

  const drawerLogout = document.getElementById("btn-drawer-logout");
  if (drawerLogout) drawerLogout.onclick = logout;

  // Switch to player view
  const switchToPlayer = document.getElementById("btn-switch-to-player-view");
  if (switchToPlayer) {
    switchToPlayer.onclick = () => {
      closeDrawer();
      navigateTo("/play");
    };
  }
}

// ==========================================
// 3. ADMIN DASHBOARD (/admin/dashboard)
// ==========================================
function renderAdminDashboard() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  // Data queries
  const users = getStorage("users", []);
  const realUsers = users.filter(u => u.role !== "ADMIN");
  const totalUsers = realUsers.length;
  const onlineUsers = realUsers.filter(u => u.isOnline).length;
  const offlineUsers = totalUsers - onlineUsers;

  const activeGames = getStorage("active_games", []);
  const liveMatchesRunning = activeGames.filter(g => g.status === "PLAYING").length;

  const rooms = getStorage("rooms", []);
  const waitingRooms = rooms.filter(r => r.status === "WAITING").length;

  const matches = getStorage("matches", []);
  const completedMatches = matches.filter(m => m.status === "COMPLETED" || !m.status).length;

  const coinRequests = getStorage("coin_requests", []);
  const pendingRequests = coinRequests.filter(r => r.status === "PENDING").length;

  const totalVirtualCoins = realUsers.reduce((sum, u) => sum + (u.coinBalance || 0), 0);

  // Today's metrics (midnight timestamp)
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayNewUsers = realUsers.filter(u => (u.createdAt || 0) >= todayStart).length;
  const todayMatches = matches.filter(m => (m.endedAt || m.startedAt || 0) >= todayStart).length;

  // Recents
  const recentUsers = [...realUsers].reverse().slice(0, 4);
  const recentMatches = [...matches].slice(0, 4);
  const txns = getStorage("transactions", []);
  const recentTxns = [...txns].slice(0, 4);
  const recentRequests = [...coinRequests].slice(0, 4);
  const auditLogs = getStorage("audit_logs", []);
  const recentAudits = [...auditLogs].slice(0, 4);

  const html = `
    <!-- Top Stats Metric Grid (Requirement 3) -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div class="card" style="padding: 12px; border-left: 3px solid var(--gold);">
        <p style="font-size: 10px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">Total Users</p>
        <h3 style="font-size: 20px; font-weight: 800; color: var(--gold); margin-top: 2px;">${formatNumber(totalUsers)}</h3>
        <p style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">🟢 ${onlineUsers} Online • ⚪ ${offlineUsers} Offline</p>
      </div>

      <div class="card" style="padding: 12px; border-left: 3px solid var(--emerald);">
        <p style="font-size: 10px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">Active Games</p>
        <h3 style="font-size: 20px; font-weight: 800; color: var(--emerald); margin-top: 2px;">${liveMatchesRunning}</h3>
        <p style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">${waitingRooms} Waiting Rooms</p>
      </div>

      <div class="card" style="padding: 12px; border-left: 3px solid #38bdf8;">
        <p style="font-size: 10px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">Completed Matches</p>
        <h3 style="font-size: 20px; font-weight: 800; color: #38bdf8; margin-top: 2px;">${formatNumber(completedMatches)}</h3>
        <p style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Today: ${todayMatches}</p>
      </div>

      <div class="card" style="padding: 12px; border-left: 3px solid ${pendingRequests > 0 ? 'var(--loss-red)' : 'var(--gold)'};">
        <p style="font-size: 10px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">Coin Requests</p>
        <h3 style="font-size: 20px; font-weight: 800; color: ${pendingRequests > 0 ? 'var(--loss-red)' : 'var(--gold)'}; margin-top: 2px;">${pendingRequests}</h3>
        <p style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Pending Review</p>
      </div>
    </div>

    <!-- Full Width Coins Banner -->
    <div class="card card-gold" style="padding: 14px; margin-bottom: 14px; background: linear-gradient(135deg, #112d1f, #07160f);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 10px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">Total Virtual Coins in Circulation</span>
          <h2 style="font-size: 22px; font-weight: 800; color: var(--gold); margin-top: 2px;">🪙 ${formatNumber(totalVirtualCoins)} Coins</h2>
          <p style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Today's New Registered Users: <strong>+${todayNewUsers}</strong></p>
        </div>
        <button id="dash-quick-requests-btn" class="btn btn-gold btn-sm" style="font-weight: 800; padding: 6px 10px; font-size: 11px;">
          REVIEW COINS →
        </button>
      </div>
    </div>

    <!-- Quick Navigation Shortcuts -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 14px;">
      <button class="btn btn-dark btn-sm adm-quick" data-route="/admin/users" style="padding: 8px 4px; font-size: 10px; font-weight: 700;">👥 Users</button>
      <button class="btn btn-dark btn-sm adm-quick" data-route="/admin/live-games" style="padding: 8px 4px; font-size: 10px; font-weight: 700;">🎮 Live</button>
      <button class="btn btn-dark btn-sm adm-quick" data-route="/admin/coin-requests" style="padding: 8px 4px; font-size: 10px; font-weight: 700;">💰 Requests</button>
      <button class="btn btn-dark btn-sm adm-quick" data-route="/admin/audit-logs" style="padding: 8px 4px; font-size: 10px; font-weight: 700;">🔐 Audit</button>
    </div>

    <!-- Recent Coin Requests -->
    <div class="card" style="padding: 12px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h4 style="font-size: 12px; font-weight: 800; color: var(--gold);">RECENT COIN REQUESTS</h4>
        <a href="#" class="adm-quick" data-route="/admin/coin-requests" style="color: var(--text-secondary); font-size: 11px; text-decoration: none;">View All →</a>
      </div>
      ${recentRequests.length === 0 ? `
        <p style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 8px 0;">No coin requests yet.</p>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${recentRequests.map(r => `
            <div style="background: #091711; padding: 8px 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
              <div>
                <strong style="color: var(--text-primary);">${r.username}</strong>
                <span style="color: var(--text-muted); font-size: 10px;"> (${r.playerId})</span>
                <p style="color: var(--text-secondary); font-size: 10px;">${r.reason || 'No reason'}</p>
              </div>
              <div style="text-align: right;">
                <span style="color: var(--gold); font-weight: 800;">+${formatNumber(r.requestedAmount)}</span>
                <div>
                  <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px; background: ${r.status === 'APPROVED' ? '#143c22' : (r.status === 'REJECTED' ? '#3c1414' : '#47360e')}; color: ${r.status === 'APPROVED' ? 'var(--emerald)' : (r.status === 'REJECTED' ? 'var(--loss-red)' : 'var(--gold)')};">
                    ${r.status}
                  </span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>

    <!-- Recent Users -->
    <div class="card" style="padding: 12px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h4 style="font-size: 12px; font-weight: 800; color: var(--gold);">RECENT REGISTERED USERS</h4>
        <a href="#" class="adm-quick" data-route="/admin/users" style="color: var(--text-secondary); font-size: 11px; text-decoration: none;">View All →</a>
      </div>
      ${recentUsers.length === 0 ? `
        <p style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 8px 0;">No users registered yet.</p>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${recentUsers.map(u => `
            <div style="background: #091711; padding: 8px 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div class="avatar avatar-sm" style="background: ${getAvatarGradient(u.username)}; width: 28px; height: 28px; font-size: 10px;">
                  ${u.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <strong style="color: var(--text-primary);">${u.username}</strong>
                  <p style="color: var(--text-muted); font-size: 10px;">${u.playerId} • ${new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span style="color: var(--gold); font-weight: 800;">${formatNumber(u.coinBalance)} Coins</span>
            </div>
          `).join('')}
        </div>
      `}
    </div>

    <!-- Recent Admin Actions -->
    <div class="card" style="padding: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h4 style="font-size: 12px; font-weight: 800; color: var(--gold);">RECENT ADMIN ACTIONS</h4>
        <a href="#" class="adm-quick" data-route="/admin/audit-logs" style="color: var(--text-secondary); font-size: 11px; text-decoration: none;">View All →</a>
      </div>
      ${recentAudits.length === 0 ? `
        <p style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 8px 0;">No admin actions logged yet.</p>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${recentAudits.map(a => `
            <div style="background: #091711; padding: 8px 10px; border-radius: 8px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between;">
                <strong style="color: var(--gold); font-size: 10px;">${a.action}</strong>
                <span style="color: var(--text-muted); font-size: 9px;">${new Date(a.createdAt).toLocaleTimeString()}</span>
              </div>
              <p style="color: var(--text-secondary); font-size: 10px; margin-top: 2px;">
                Target: ${a.targetUserId} ${a.reason ? '• ' + a.reason : ''}
              </p>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  container.innerHTML = getAdminFrameHtml("/admin/dashboard", "ADMIN DASHBOARD", html);
  bindAdminFrameEvents("/admin/dashboard", renderAdminDashboard);

  document.querySelectorAll(".adm-quick").forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      navigateTo(btn.getAttribute("data-route"));
    };
  });

  const reqBtn = document.getElementById("dash-quick-requests-btn");
  if (reqBtn) reqBtn.onclick = () => navigateTo("/admin/coin-requests");
}

// ==========================================
// 4 & 5. USER MANAGEMENT & USER DETAIL (/admin/users)
// ==========================================
let userFilterState = "ALL"; // ALL, ONLINE, OFFLINE, ACTIVE, SUSPENDED, LOW, ZERO
let userSearchQuery = "";

function renderAdminUsers() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  const allUsers = getStorage("users", []).filter(u => u.role !== "ADMIN");

  // Filter application
  let filtered = allUsers.filter(u => {
    // Search check
    if (userSearchQuery) {
      const q = userSearchQuery.toLowerCase();
      const matchName = (u.username || "").toLowerCase().includes(q);
      const matchId = (u.playerId || "").toLowerCase().includes(q);
      const matchContact = (u.emailOrPhone || "").toLowerCase().includes(q);
      if (!matchName && !matchId && !matchContact) return false;
    }

    if (userFilterState === "ONLINE") return !!u.isOnline;
    if (userFilterState === "OFFLINE") return !u.isOnline;
    if (userFilterState === "ACTIVE") return u.status !== "BLOCKED" && u.status !== "SUSPENDED";
    if (userFilterState === "SUSPENDED") return u.status === "BLOCKED" || u.status === "SUSPENDED";
    if (userFilterState === "LOW") return (u.coinBalance || 0) < 2000 && (u.coinBalance || 0) > 0;
    if (userFilterState === "ZERO") return (u.coinBalance || 0) === 0;
    return true;
  });

  const filterChips = [
    { id: "ALL", label: `All (${allUsers.length})` },
    { id: "ONLINE", label: `Online (${allUsers.filter(u => u.isOnline).length})` },
    { id: "OFFLINE", label: `Offline` },
    { id: "ACTIVE", label: `Active` },
    { id: "SUSPENDED", label: `Suspended` },
    { id: "LOW", label: `Low Coins` },
    { id: "ZERO", label: `Zero Coins (${allUsers.filter(u => (u.coinBalance || 0) === 0).length})` }
  ];

  const html = `
    <!-- Search Bar -->
    <div style="margin-bottom: 10px;">
      <input type="text" id="admin-user-search-input" class="input-field" placeholder="🔍 Search Username, Player ID, or Email..." value="${userSearchQuery}" style="margin-bottom: 8px;" />
      
      <!-- Filter Chips -->
      <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px;">
        ${filterChips.map(c => `
          <button class="chip user-filter-chip ${userFilterState === c.id ? 'active' : ''}" data-filter="${c.id}" style="padding: 4px 10px; font-size: 11px; white-space: nowrap;">
            ${c.label}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Users List Cards -->
    ${filtered.length === 0 ? `
      <div class="card" style="text-align: center; padding: 32px 16px;">
        <p style="font-size: 24px; margin-bottom: 6px;">👥</p>
        <h4 style="font-size: 14px; font-weight: 700; color: var(--gold);">No users match your query</h4>
        <p style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">Try modifying the search term or filters.</p>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${filtered.map(u => {
          const isSuspended = u.status === "BLOCKED" || u.status === "SUSPENDED";
          const winRate = u.matchesPlayed > 0 ? Math.round((u.matchesWon / u.matchesPlayed) * 100) : 0;
          return `
            <div class="card admin-user-item-card" data-uid="${u.id}" style="padding: 12px; cursor: pointer; transition: border-color 0.15s; border-left: 3px solid ${isSuspended ? 'var(--loss-red)' : 'var(--gold)'};">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div class="avatar avatar-sm" style="background: ${getAvatarGradient(u.username)};">
                    ${u.username.slice(0, 2).toUpperCase()}
                    <div class="online-indicator ${u.isOnline ? '' : 'offline'}"></div>
                  </div>
                  <div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <strong style="font-size: 14px; color: var(--text-primary);">${u.username}</strong>
                      <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px; background: ${isSuspended ? '#3c1414' : '#143c22'}; color: ${isSuspended ? 'var(--loss-red)' : 'var(--emerald)'};">
                        ${isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                      </span>
                    </div>
                    <p style="font-size: 11px; color: var(--gold); font-weight: 700; margin-top: 1px;">${u.playerId}</p>
                  </div>
                </div>

                <div style="text-align: right;">
                  <span style="font-size: 14px; font-weight: 800; color: var(--gold);">🪙 ${formatNumber(u.coinBalance)}</span>
                  <p style="font-size: 10px; color: var(--text-muted); margin-top: 1px;">Win: ${winRate}% (${u.matchesWon || 0}W/${u.matchesLost || 0}L)</p>
                </div>
              </div>

              <!-- Quick action footer -->
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.06); margin-top: 8px; padding-top: 6px;">
                <span>Registered: ${new Date(u.createdAt || Date.now()).toLocaleDateString()}</span>
                <span style="color: var(--gold); font-weight: 700;">Tap for full details →</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;

  container.innerHTML = getAdminFrameHtml("/admin/users", "USER MANAGEMENT", html);
  bindAdminFrameEvents("/admin/users", renderAdminUsers);

  // Bind Search
  const searchInput = document.getElementById("admin-user-search-input");
  if (searchInput) {
    searchInput.oninput = () => {
      userSearchQuery = searchInput.value.trim();
      renderAdminUsers();
      // Refocus cursor
      const el = document.getElementById("admin-user-search-input");
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    };
  }

  // Bind Filter Chips
  document.querySelectorAll(".user-filter-chip").forEach(chip => {
    chip.onclick = () => {
      userFilterState = chip.getAttribute("data-filter");
      renderAdminUsers();
    };
  });

  // Bind User Cards -> Opens User Detail Page
  document.querySelectorAll(".admin-user-item-card").forEach(card => {
    card.onclick = () => {
      const uid = parseInt(card.getAttribute("data-uid"));
      openUserDetailModal(uid);
    };
  });
}

// User Detail Modal (Requirement 5)
function openUserDetailModal(userId) {
  const users = getStorage("users", []);
  const user = users.find(u => u.id === userId);
  if (!user) return showToast("User not found");

  let activeUserTab = "PROFILE"; // PROFILE, MATCHES, COINS, INVITATIONS, ACTIVITY, ACTIONS

  const modal = document.createElement("div");
  modal.className = "modal-backdrop";

  const renderModalContent = () => {
    const isSuspended = user.status === "BLOCKED" || user.status === "SUSPENDED";
    const winRate = user.matchesPlayed > 0 ? Math.round((user.matchesWon / user.matchesPlayed) * 100) : 0;

    // Sub-data for user
    const userMatches = getStorage("matches", []).filter(m => (m.playersJson || "").includes(user.username));
    const userTxns = getStorage("transactions", []).filter(t => t.userId === user.id || t.userPlayerId === user.playerId);
    const userInvites = getStorage("invitations", []).filter(i => i.senderPlayerId === user.playerId || i.receiverPlayerId === user.playerId);
    const userActs = getStorage("activity_logs", []).filter(a => a.userId === user.id || a.playerId === user.playerId);

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 440px; max-height: 90vh; display: flex; flex-direction: column; padding: 16px;">
        
        <!-- Modal Top Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--bg-card-border); padding-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="avatar avatar-sm" style="background: ${getAvatarGradient(user.username)};">
              ${user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 style="font-size: 15px; font-weight: 800; color: var(--gold); margin: 0;">${user.username}</h3>
              <p style="font-size: 11px; color: var(--text-secondary); margin: 0;">${user.playerId}</p>
            </div>
          </div>
          <button id="user-modal-close-btn" style="background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; padding: 4px;">✕</button>
        </div>

        <!-- Metric summary chips -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 12px; background: #071710; padding: 8px; border-radius: 10px;">
          <div style="text-align: center;">
            <span style="font-size: 9px; color: var(--text-muted); font-weight: 700;">BALANCE</span>
            <p style="font-size: 12px; font-weight: 800; color: var(--gold); margin-top: 1px;">${formatNumber(user.coinBalance)}</p>
          </div>
          <div style="text-align: center;">
            <span style="font-size: 9px; color: var(--text-muted); font-weight: 700;">MATCHES</span>
            <p style="font-size: 12px; font-weight: 800; margin-top: 1px;">${user.matchesPlayed || 0}</p>
          </div>
          <div style="text-align: center;">
            <span style="font-size: 9px; color: var(--text-muted); font-weight: 700;">WIN RATE</span>
            <p style="font-size: 12px; font-weight: 800; color: var(--emerald); margin-top: 1px;">${winRate}%</p>
          </div>
        </div>

        <!-- Navigation Tabs (Requirement 5) -->
        <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06);">
          <button class="chip u-tab-btn ${activeUserTab === 'PROFILE' ? 'active' : ''}" data-tab="PROFILE" style="padding: 4px 8px; font-size: 10px;">Profile</button>
          <button class="chip u-tab-btn ${activeUserTab === 'MATCHES' ? 'active' : ''}" data-tab="MATCHES" style="padding: 4px 8px; font-size: 10px;">Matches (${userMatches.length})</button>
          <button class="chip u-tab-btn ${activeUserTab === 'COINS' ? 'active' : ''}" data-tab="COINS" style="padding: 4px 8px; font-size: 10px;">Coins (${userTxns.length})</button>
          <button class="chip u-tab-btn ${activeUserTab === 'INVITATIONS' ? 'active' : ''}" data-tab="INVITATIONS" style="padding: 4px 8px; font-size: 10px;">Invites (${userInvites.length})</button>
          <button class="chip u-tab-btn ${activeUserTab === 'ACTIVITY' ? 'active' : ''}" data-tab="ACTIVITY" style="padding: 4px 8px; font-size: 10px;">Activity (${userActs.length})</button>
          <button class="chip u-tab-btn ${activeUserTab === 'ACTIONS' ? 'active' : ''}" data-tab="ACTIONS" style="padding: 4px 8px; font-size: 10px; font-weight: 800; color: var(--gold);">Actions</button>
        </div>

        <!-- Tab Body Content -->
        <div style="flex: 1; overflow-y: auto; padding-right: 4px;">
          ${activeUserTab === 'PROFILE' ? `
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="color: var(--text-secondary);">Username:</span>
                <strong>${user.username}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="color: var(--text-secondary);">Player ID:</span>
                <strong style="color: var(--gold);">${user.playerId}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="color: var(--text-secondary);">Email / Contact:</span>
                <span>${user.emailOrPhone || 'None'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="color: var(--text-secondary);">Account Status:</span>
                <strong style="color: ${isSuspended ? 'var(--loss-red)' : 'var(--emerald)'};">${user.status || 'ACTIVE'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="color: var(--text-secondary);">Registered Date:</span>
                <span>${new Date(user.createdAt || Date.now()).toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="color: var(--text-secondary);">Wins / Losses:</span>
                <span>${user.matchesWon || 0} Wins / ${user.matchesLost || 0} Losses</span>
              </div>
            </div>
          ` : activeUserTab === 'MATCHES' ? `
            ${userMatches.length === 0 ? `
              <p style="color: var(--text-muted); font-size: 11px; text-align: center; padding: 16px 0;">No matches found for this user.</p>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${userMatches.map(m => `
                  <div style="background: #091711; padding: 8px 10px; border-radius: 8px; font-size: 11px;">
                    <div style="display: flex; justify-content: space-between;">
                      <strong style="color: var(--gold);">${m.roomId}</strong>
                      <span style="color: ${m.winnerPlayerId === user.playerId ? 'var(--emerald)' : 'var(--loss-red)'}; font-weight: 800;">
                        ${m.winnerPlayerId === user.playerId ? 'WIN' : 'LOSS'}
                      </span>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 10px; margin-top: 2px;">${m.mode} • Entry: ${formatNumber(m.entryAmount)} Coins</p>
                    <span style="color: var(--text-muted); font-size: 9px;">${new Date(m.endedAt).toLocaleString()}</span>
                  </div>
                `).join('')}
              </div>
            `}
          ` : activeUserTab === 'COINS' ? `
            ${userTxns.length === 0 ? `
              <p style="color: var(--text-muted); font-size: 11px; text-align: center; padding: 16px 0;">No transactions recorded for this user.</p>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${userTxns.map(t => `
                  <div style="background: #091711; padding: 8px 10px; border-radius: 8px; font-size: 11px;">
                    <div style="display: flex; justify-content: space-between;">
                      <strong style="color: var(--text-primary); font-size: 10px;">${t.type}</strong>
                      <span style="color: ${t.amount >= 0 ? 'var(--emerald)' : 'var(--loss-red)'}; font-weight: 800;">
                        ${t.amount >= 0 ? '+' : ''}${formatNumber(t.amount)}
                      </span>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 10px;">${t.description}</p>
                    <p style="color: var(--text-muted); font-size: 9px;">Bal: ${formatNumber(t.previousBalance)} → ${formatNumber(t.newBalance)} • ${new Date(t.createdAt).toLocaleTimeString()}</p>
                  </div>
                `).join('')}
              </div>
            `}
          ` : activeUserTab === 'INVITATIONS' ? `
            ${userInvites.length === 0 ? `
              <p style="color: var(--text-muted); font-size: 11px; text-align: center; padding: 16px 0;">No invitations recorded for this user.</p>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${userInvites.map(i => `
                  <div style="background: #091711; padding: 8px 10px; border-radius: 8px; font-size: 11px;">
                    <div style="display: flex; justify-content: space-between;">
                      <span>From: <strong>${i.senderUsername}</strong> → ${i.receiverPlayerId}</span>
                      <strong style="color: var(--gold);">${i.status}</strong>
                    </div>
                    <p style="color: var(--text-muted); font-size: 9px; margin-top: 2px;">${i.roomId} • ${new Date(i.createdAt).toLocaleString()}</p>
                  </div>
                `).join('')}
              </div>
            `}
          ` : activeUserTab === 'ACTIVITY' ? `
            ${userActs.length === 0 ? `
              <p style="color: var(--text-muted); font-size: 11px; text-align: center; padding: 16px 0;">No logged activity yet.</p>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${userActs.map(a => `
                  <div style="background: #091711; padding: 8px 10px; border-radius: 8px; font-size: 11px;">
                    <div style="display: flex; justify-content: space-between;">
                      <strong style="color: var(--gold); font-size: 10px;">${a.action}</strong>
                      <span style="color: var(--text-muted); font-size: 9px;">${new Date(a.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 10px; margin-top: 2px;">${a.details || a.relatedId || ''}</p>
                  </div>
                `).join('')}
              </div>
            `}
          ` : `
            <!-- ADMIN ACTIONS TAB -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button id="act-toggle-status" class="btn ${isSuspended ? 'btn-gold' : 'btn-dark'} btn-block" style="font-size: 12px; height: 42px;">
                ${isSuspended ? '✓ ACTIVATE USER ACCOUNT' : '⛔ SUSPEND USER ACCOUNT'}
              </button>

              <button id="act-adjust-coins-btn" class="btn btn-gold btn-block" style="font-size: 12px; height: 42px; font-weight: 800;">
                🪙 ADJUST USER COIN BALANCE
              </button>

              <button id="act-send-notif-btn" class="btn btn-dark btn-block" style="font-size: 12px; height: 42px;">
                🔔 SEND DIRECT NOTIFICATION
              </button>
            </div>
          `}
        </div>
      </div>
    `;

    // Bind Close
    modal.querySelector("#user-modal-close-btn").onclick = () => modal.remove();

    // Bind Tabs
    modal.querySelectorAll(".u-tab-btn").forEach(btn => {
      btn.onclick = () => {
        activeUserTab = btn.getAttribute("data-tab");
        renderModalContent();
      };
    });

    // Bind Action Buttons
    const statusBtn = modal.querySelector("#act-toggle-status");
    if (statusBtn) {
      statusBtn.onclick = () => {
        user.status = isSuspended ? "ACTIVE" : "SUSPENDED";
        setStorage("users", users);

        recordAuditLog(
          adminSession ? adminSession.username : "789895",
          user.status === "ACTIVE" ? "ACTIVATE_USER" : "SUSPENDED_USER",
          user.username + " (" + user.playerId + ")",
          0,
          `Admin toggled account status to ${user.status}`
        );

        createNotification(
          user.id,
          user.playerId,
          "STATUS_CHANGE",
          `Account ${user.status}`,
          `Your 8 Ball Pool player account was marked ${user.status} by Admin.`
        );

        showToast(`User status updated to ${user.status}`);
        renderModalContent();
        renderAdminUsers();
      };
    }

    const adjustBtn = modal.querySelector("#act-adjust-coins-btn");
    if (adjustBtn) {
      adjustBtn.onclick = () => {
        openCoinAdjustModal(user, () => {
          renderModalContent();
          renderAdminUsers();
        });
      };
    }

    const notifBtn = modal.querySelector("#act-send-notif-btn");
    if (notifBtn) {
      notifBtn.onclick = () => {
        const msg = prompt(`Enter notification message for ${user.username}:`);
        if (msg && msg.trim()) {
          createNotification(user.id, user.playerId, "ADMIN_ALERT", "Admin Notice", msg.trim());
          recordAuditLog(adminSession ? adminSession.username : "789895", "ADMIN_NOTIFICATION", user.playerId, 0, msg.trim());
          showToast("Notification delivered to user.");
        }
      };
    }
  };

  renderModalContent();
  document.getElementById("app-container").appendChild(modal);
}

// ==========================================
// 10. COIN MANAGEMENT MODAL
// ==========================================
function openCoinAdjustModal(targetUser, onComplete) {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card">
      <h3 class="gold-title" style="font-size: 16px; margin-bottom: 6px;">Adjust Coins: ${targetUser.username}</h3>
      <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 12px;">
        Player ID: <strong>${targetUser.playerId}</strong> • Current Balance: <strong style="color: var(--gold);">${formatNumber(targetUser.coinBalance)} Coins</strong>
      </p>

      <form id="form-adjust-coin-balance">
        <label style="display: block; font-size: 11px; font-weight: 800; color: var(--text-secondary); margin-bottom: 4px;">
          ADJUSTMENT TYPE
        </label>
        <select id="adj-type-select" class="input-field" style="margin-bottom: 8px;">
          <option value="ADMIN_ADD">Add Coins (+)</option>
          <option value="ADMIN_DEDUCT">Deduct Coins (-)</option>
          <option value="REFUND">Refund Coins (+)</option>
          <option value="BONUS">Bonus Coins (+)</option>
        </select>

        <label style="display: block; font-size: 11px; font-weight: 800; color: var(--text-secondary); margin-bottom: 4px;">
          AMOUNT (VIRTUAL COINS)
        </label>
        <input type="number" id="adj-amount-input" class="input-field" placeholder="e.g. 10000" min="1" required />

        <label style="display: block; font-size: 11px; font-weight: 800; color: var(--text-secondary); margin-bottom: 4px;">
          MANDATORY AUDIT REASON
        </label>
        <input type="text" id="adj-reason-input" class="input-field" placeholder="e.g. Promotional bonus, Compensation, etc." required />

        <div style="background: #091711; padding: 10px; border-radius: 8px; margin-bottom: 14px; font-size: 11px; color: var(--text-muted);">
          Every adjustment is immediately saved in the transaction ledger, user notifications, and admin audit trail.
        </div>

        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button type="button" id="adj-cancel-btn" class="btn btn-dark">Cancel</button>
          <button type="submit" class="btn btn-gold">CONFIRM & SAVE</button>
        </div>
      </form>
    </div>
  `;
  document.getElementById("app-container").appendChild(modal);

  modal.querySelector("#adj-cancel-btn").onclick = () => modal.remove();

  modal.querySelector("#form-adjust-coin-balance").onsubmit = (e) => {
    e.preventDefault();
    const type = modal.querySelector("#adj-type-select").value;
    const amountVal = parseInt(modal.querySelector("#adj-amount-input").value);
    const reason = modal.querySelector("#adj-reason-input").value.trim();

    if (!amountVal || amountVal <= 0) return showToast("Enter a positive coin amount");
    if (!reason) return showToast("Mandatory audit reason required");

    const users = getStorage("users", []);
    const userToUpdate = users.find(u => u.id === targetUser.id);
    if (!userToUpdate) return showToast("User not found");

    const prevBal = userToUpdate.coinBalance || 0;
    const isDeduct = type === "ADMIN_DEDUCT";
    const delta = isDeduct ? -amountVal : amountVal;
    const newBal = Math.max(0, prevBal + delta);

    userToUpdate.coinBalance = newBal;
    setStorage("users", users);

    // Record Transaction
    recordTransaction(
      userToUpdate.id,
      userToUpdate.playerId,
      type,
      delta,
      prevBal,
      newBal,
      `Admin adjustment: ${reason}`
    );

    // Record Immutable Audit Log
    recordAuditLog(
      adminSession ? adminSession.username : "789895",
      type,
      userToUpdate.username + " (" + userToUpdate.playerId + ")",
      delta,
      reason
    );

    // Notify User
    createNotification(
      userToUpdate.id,
      userToUpdate.playerId,
      "ADMIN_COINS",
      "Coin Balance Adjusted",
      `Admin has ${isDeduct ? 'deducted' : 'added'} ${formatNumber(amountVal)} virtual coins. Reason: ${reason}`
    );

    modal.remove();
    showToast(`Coins adjusted! New Balance: ${formatNumber(newBal)}`);
    if (onComplete) onComplete();
  };
}

// ==========================================
// 7. LIVE GAMES MONITORING (/admin/live-games)
// ==========================================
function renderAdminLiveGames() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  const liveGames = getStorage("active_games", []);

  const html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <div>
        <h3 class="gold-title" style="font-size: 15px;">LIVE RUNNING GAMES</h3>
        <p style="color: var(--text-secondary); font-size: 11px;">Real-time monitoring of currently active billiards tables</p>
      </div>
      <span style="font-size: 12px; font-weight: 800; color: var(--emerald);">
        🟢 ${liveGames.filter(g => g.status === 'PLAYING').length} Active
      </span>
    </div>

    ${liveGames.length === 0 ? `
      <div class="card" style="text-align: center; padding: 36px 16px;">
        <p style="font-size: 26px; margin-bottom: 6px;">🎮</p>
        <h4 style="font-size: 14px; font-weight: 700; color: var(--gold);">No active games</h4>
        <p style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">There are no live billiards matches in progress right now.</p>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${liveGames.map(g => `
          <div class="card" style="padding: 12px; border-left: 3px solid var(--emerald);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: var(--gold); font-size: 13px;">${g.roomId || 'ROOM'}</strong>
              <span style="background: #143c22; color: var(--emerald); font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px;">
                ${g.status || 'PLAYING'}
              </span>
            </div>
            
            <p style="font-size: 12px; color: var(--text-primary); margin-bottom: 4px;">
              Mode: <strong>${g.gameMode || '1v1'}</strong> • Entry: <strong>${formatNumber(g.entryAmount)} Coins</strong>
            </p>

            <div style="background: #091711; padding: 8px; border-radius: 8px; margin: 6px 0; font-size: 11px;">
              <div style="display: flex; justify-content: space-between;">
                <span>Players: <strong>${(g.players || []).map(p => p.name || p).join(' vs ')}</strong></span>
                <span style="color: var(--gold);">Turn: ${g.currentTurn === 0 ? 'P1' : 'P2'}</span>
              </div>
              <p style="color: var(--text-muted); font-size: 10px; margin-top: 2px;">Started: ${new Date(g.startedAt || Date.now()).toLocaleTimeString()}</p>
            </div>

            <div style="display: flex; justify-content: flex-end;">
              <button class="btn btn-dark btn-sm btn-inspect-live" data-gid="${g.roomId}" style="font-size: 11px; padding: 4px 10px;">
                👁️ Inspect Match Status
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;

  container.innerHTML = getAdminFrameHtml("/admin/live-games", "LIVE GAMES", html);
  bindAdminFrameEvents("/admin/live-games", renderAdminLiveGames);

  document.querySelectorAll(".btn-inspect-live").forEach(b => {
    b.onclick = () => {
      const gid = b.getAttribute("data-gid");
      showToast(`Monitoring Room: ${gid}. Admin monitoring mode active.`);
    };
  });
}

// ==========================================
// 8. ROOMS MANAGEMENT (/admin/rooms)
// ==========================================
let roomFilterState = "ALL";

function renderAdminRooms() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  const allRooms = getStorage("rooms", []);
  let filtered = allRooms;
  if (roomFilterState !== "ALL") {
    filtered = allRooms.filter(r => r.status === roomFilterState);
  }

  const html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h3 class="gold-title" style="font-size: 15px;">MATCH ROOMS</h3>
      <div style="display: flex; gap: 4px;">
        ${["ALL", "WAITING", "PLAYING", "FINISHED"].map(st => `
          <button class="chip room-chip ${roomFilterState === st ? 'active' : ''}" data-st="${st}" style="padding: 4px 8px; font-size: 10px;">
            ${st}
          </button>
        `).join('')}
      </div>
    </div>

    ${filtered.length === 0 ? `
      <div class="card" style="text-align: center; padding: 36px 16px;">
        <p style="font-size: 26px; margin-bottom: 6px;">🏠</p>
        <h4 style="font-size: 14px; font-weight: 700; color: var(--gold);">No rooms found</h4>
        <p style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">No match rooms recorded in this state.</p>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${filtered.map(r => `
          <div class="card" style="padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="color: var(--gold); font-size: 13px;">${r.roomId}</strong>
              <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; background: #132d1f; color: var(--gold);">
                ${r.status || 'WAITING'}
              </span>
            </div>
            <p style="font-size: 11px; color: var(--text-secondary);">Host: <strong>${r.hostUsername || 'Unknown'}</strong> • Mode: ${r.mode} • Entry: ${formatNumber(r.entryAmount)} Coins</p>
            <p style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Created: ${new Date(r.createdAt || Date.now()).toLocaleString()}</p>
          </div>
        `).join('')}
      </div>
    `}
  `;

  container.innerHTML = getAdminFrameHtml("/admin/rooms", "ROOMS MANAGEMENT", html);
  bindAdminFrameEvents("/admin/rooms", renderAdminRooms);

  document.querySelectorAll(".room-chip").forEach(c => {
    c.onclick = () => {
      roomFilterState = c.getAttribute("data-st");
      renderAdminRooms();
    };
  });
}

// ==========================================
// 9. COIN REQUEST MANAGEMENT (/admin/coin-requests)
// ==========================================
function renderAdminCoinRequests() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  const allRequests = getStorage("coin_requests", []);

  const html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <div>
        <h3 class="gold-title" style="font-size: 15px;">COIN REQUEST AUDIT</h3>
        <p style="color: var(--text-secondary); font-size: 11px;">Review and authorize user virtual coin allocations</p>
      </div>
      <span style="font-size: 11px; font-weight: 800; color: var(--gold);">
        Pending: ${allRequests.filter(r => r.status === 'PENDING').length}
      </span>
    </div>

    ${allRequests.length === 0 ? `
      <div class="card" style="text-align: center; padding: 36px 16px;">
        <p style="font-size: 26px; margin-bottom: 6px;">💰</p>
        <h4 style="font-size: 14px; font-weight: 700; color: var(--gold);">No coin requests</h4>
        <p style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">Players with zero or low balances will submit requests here.</p>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${allRequests.map(r => {
          const isPending = r.status === "PENDING";
          return `
            <div class="card" style="padding: 12px; border-left: 3px solid ${isPending ? 'var(--gold)' : (r.status === 'APPROVED' ? 'var(--emerald)' : 'var(--loss-red)')};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <div>
                  <strong style="color: var(--text-primary); font-size: 13px;">${r.username}</strong>
                  <span style="color: var(--gold); font-size: 11px; font-weight: 700;"> (${r.playerId})</span>
                </div>
                <span style="font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: ${r.status === 'APPROVED' ? '#143c22' : (r.status === 'REJECTED' ? '#3c1414' : '#47360e')}; color: ${r.status === 'APPROVED' ? 'var(--emerald)' : (r.status === 'REJECTED' ? 'var(--loss-red)' : 'var(--gold)')};">
                  ${r.status}
                </span>
              </div>

              <div style="background: #091711; padding: 8px 10px; border-radius: 8px; font-size: 11px; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                  <span style="color: var(--text-secondary);">Requested Amount:</span>
                  <strong style="color: var(--gold); font-size: 12px;">+${formatNumber(r.requestedAmount)} Coins</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                  <span style="color: var(--text-secondary);">Current User Balance:</span>
                  <span>${formatNumber(r.currentBalance)} Coins</span>
                </div>
                <div style="margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 4px;">
                  <span style="color: var(--text-muted); font-size: 10px;">Reason: <em>"${r.reason || 'No reason provided'}"</em></span>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-muted); font-size: 10px;">${new Date(r.createdAt).toLocaleString()}</span>
                ${isPending ? `
                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-dark btn-sm btn-reject-req" data-rid="${r.requestId}" style="color: var(--loss-red); padding: 5px 12px; font-size: 11px;">
                      REJECT
                    </button>
                    <button class="btn btn-gold btn-sm btn-approve-req" data-rid="${r.requestId}" style="font-weight: 800; padding: 5px 14px; font-size: 11px;">
                      APPROVE ✓
                    </button>
                  </div>
                ` : `
                  <span style="color: var(--text-muted); font-size: 10px;">Reviewed by ${r.reviewedBy || 'Admin'}</span>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;

  container.innerHTML = getAdminFrameHtml("/admin/coin-requests", "COIN REQUESTS", html);
  bindAdminFrameEvents("/admin/coin-requests", renderAdminCoinRequests);

  // Bind Approve
  document.querySelectorAll(".btn-approve-req").forEach(btn => {
    btn.onclick = () => {
      const rid = btn.getAttribute("data-rid");
      const requests = getStorage("coin_requests", []);
      const targetReq = requests.find(r => r.requestId === rid);

      if (!targetReq || targetReq.status !== "PENDING") {
        return showToast("Request already processed");
      }

      const users = getStorage("users", []);
      const targetUser = users.find(u => u.id === targetReq.userId || u.playerId === targetReq.playerId);

      if (!targetUser) return showToast("Target user not found");

      // Atomically add coins
      const prevBal = targetUser.coinBalance || 0;
      targetUser.coinBalance = prevBal + targetReq.requestedAmount;
      setStorage("users", users);

      targetReq.status = "APPROVED";
      targetReq.reviewedAt = Date.now();
      targetReq.reviewedBy = adminSession ? adminSession.username : "789895";
      setStorage("coin_requests", requests);

      // Record Transaction
      recordTransaction(
        targetUser.id,
        targetUser.playerId,
        "COIN_REQUEST",
        targetReq.requestedAmount,
        prevBal,
        targetUser.coinBalance,
        `Approved coin request: ${targetReq.requestId}`
      );

      // Record Audit
      recordAuditLog(
        adminSession ? adminSession.username : "789895",
        "APPROVE_COIN_REQUEST",
        targetUser.username + " (" + targetUser.playerId + ")",
        targetReq.requestedAmount,
        `Approved request ${targetReq.requestId}`
      );

      // Notify User
      createNotification(
        targetUser.id,
        targetUser.playerId,
        "COIN_REQUEST_APPROVED",
        "Coin Request Approved! 🎉",
        `Your request for ${formatNumber(targetReq.requestedAmount)} virtual coins was approved by admin.`
      );

      // User Activity
      recordUserActivity(
        targetUser.id,
        targetUser.playerId,
        targetUser.username,
        "COIN_REQUEST_APPROVED",
        targetReq.requestId,
        `Allocated ${formatNumber(targetReq.requestedAmount)} coins`
      );

      showToast(`Approved ${formatNumber(targetReq.requestedAmount)} coins for ${targetUser.username}`);
      renderAdminCoinRequests();
    };
  });

  // Bind Reject
  document.querySelectorAll(".btn-reject-req").forEach(btn => {
    btn.onclick = () => {
      const rid = btn.getAttribute("data-rid");
      const requests = getStorage("coin_requests", []);
      const targetReq = requests.find(r => r.requestId === rid);

      if (!targetReq || targetReq.status !== "PENDING") {
        return showToast("Request already processed");
      }

      targetReq.status = "REJECTED";
      targetReq.reviewedAt = Date.now();
      targetReq.reviewedBy = adminSession ? adminSession.username : "789895";
      setStorage("coin_requests", requests);

      // Record Audit
      recordAuditLog(
        adminSession ? adminSession.username : "789895",
        "REJECT_COIN_REQUEST",
        targetReq.username + " (" + targetReq.playerId + ")",
        0,
        `Rejected request ${targetReq.requestId}`
      );

      // Notify User
      createNotification(
        targetReq.userId,
        targetReq.playerId,
        "COIN_REQUEST_REJECTED",
        "Coin Request Rejected",
        `Your coin request for ${formatNumber(targetReq.requestedAmount)} coins could not be approved at this time.`
      );

      showToast(`Rejected coin request for ${targetReq.username}`);
      renderAdminCoinRequests();
    };
  });
}

// ==========================================
// 11. TRANSACTION MANAGEMENT (/admin/transactions)
// ==========================================
let txnSearchQuery = "";
let txnFilterPeriod = "ALL"; // ALL, TODAY, YESTERDAY, 7D, 30D

function renderAdminTransactions() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  const allTxns = getStorage("transactions", []);
  const now = Date.now();
  const todayStart = new Date().setHours(0,0,0,0);
  const yesterdayStart = todayStart - 86400000;

  let filtered = allTxns.filter(t => {
    if (txnSearchQuery) {
      const q = txnSearchQuery.toLowerCase();
      const matchId = (t.transactionId || "").toLowerCase().includes(q);
      const matchPid = (t.userPlayerId || "").toLowerCase().includes(q);
      const matchMid = (t.matchId || "").toLowerCase().includes(q);
      if (!matchId && !matchPid && !matchMid) return false;
    }

    if (txnFilterPeriod === "TODAY") return (t.createdAt || 0) >= todayStart;
    if (txnFilterPeriod === "YESTERDAY") return (t.createdAt || 0) >= yesterdayStart && (t.createdAt || 0) < todayStart;
    if (txnFilterPeriod === "7D") return (t.createdAt || 0) >= (now - 86400000 * 7);
    if (txnFilterPeriod === "30D") return (t.createdAt || 0) >= (now - 86400000 * 30);
    return true;
  });

  const html = `
    <div style="margin-bottom: 12px;">
      <input type="text" id="admin-txn-search" class="input-field" placeholder="🔍 Search Transaction ID, Player ID, Match ID..." value="${txnSearchQuery}" style="margin-bottom: 8px;" />
      
      <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 4px;">
        ${[
          { id: "ALL", label: `All (${allTxns.length})` },
          { id: "TODAY", label: "Today" },
          { id: "YESTERDAY", label: "Yesterday" },
          { id: "7D", label: "7 Days" },
          { id: "30D", label: "30 Days" }
        ].map(p => `
          <button class="chip txn-chip ${txnFilterPeriod === p.id ? 'active' : ''}" data-period="${p.id}" style="padding: 4px 8px; font-size: 10px;">
            ${p.label}
          </button>
        `).join('')}
      </div>
    </div>

    ${filtered.length === 0 ? `
      <div class="card" style="text-align: center; padding: 36px 16px;">
        <p style="font-size: 26px; margin-bottom: 6px;">💳</p>
        <h4 style="font-size: 14px; font-weight: 700; color: var(--gold);">No transactions recorded</h4>
        <p style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">Coin allocations and match fees will show up here.</p>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${filtered.map(t => {
          const isPositive = (t.amount || 0) >= 0;
          return `
            <div class="card" style="padding: 10px 12px; border-left: 3px solid ${isPositive ? 'var(--emerald)' : 'var(--loss-red)'};">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: var(--text-primary); font-size: 12px;">${t.type}</strong>
                  <span style="color: var(--gold); font-size: 10px; font-weight: 700;"> • ${t.userPlayerId}</span>
                </div>
                <strong style="color: ${isPositive ? 'var(--emerald)' : 'var(--loss-red)'}; font-size: 13px;">
                  ${isPositive ? '+' : ''}${formatNumber(t.amount)}
                </strong>
              </div>

              <p style="color: var(--text-secondary); font-size: 11px; margin-top: 2px;">${t.description || 'No description'}</p>

              <div style="display: flex; justify-content: space-between; font-size: 9px; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.05); margin-top: 6px; padding-top: 4px;">
                <span>Bal: ${formatNumber(t.previousBalance)} → ${formatNumber(t.newBalance)}</span>
                <span>${t.transactionId} • ${new Date(t.createdAt).toLocaleString()}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;

  container.innerHTML = getAdminFrameHtml("/admin/transactions", "TRANSACTIONS", html);
  bindAdminFrameEvents("/admin/transactions", renderAdminTransactions);

  const sInput = document.getElementById("admin-txn-search");
  if (sInput) {
    sInput.oninput = () => {
      txnSearchQuery = sInput.value.trim();
      renderAdminTransactions();
    };
  }

  document.querySelectorAll(".txn-chip").forEach(c => {
    c.onclick = () => {
      txnFilterPeriod = c.getAttribute("data-period");
      renderAdminTransactions();
    };
  });
}

// ==========================================
// 12. MATCH MANAGEMENT (/admin/matches)
// ==========================================
let matchFilterMode = "ALL"; // ALL, 1v1, 2v2

function renderAdminMatches() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  const allMatches = getStorage("matches", []);
  let filtered = allMatches;
  if (matchFilterMode !== "ALL") {
    filtered = allMatches.filter(m => m.mode === matchFilterMode);
  }

  const html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h3 class="gold-title" style="font-size: 15px;">MATCH ARCHIVES</h3>
      <div style="display: flex; gap: 4px;">
        ${["ALL", "1v1", "2v2"].map(m => `
          <button class="chip m-chip ${matchFilterMode === m ? 'active' : ''}" data-mode="${m}" style="padding: 4px 8px; font-size: 10px;">
            ${m}
          </button>
        `).join('')}
      </div>
    </div>

    ${filtered.length === 0 ? `
      <div class="card" style="text-align: center; padding: 36px 16px;">
        <p style="font-size: 26px; margin-bottom: 6px;">⚔️</p>
        <h4 style="font-size: 14px; font-weight: 700; color: var(--gold);">No matches recorded</h4>
        <p style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">Completed game history will be listed here.</p>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${filtered.map(m => `
          <div class="card" style="padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="color: var(--gold); font-size: 13px;">${m.roomId}</strong>
              <span style="font-size: 10px; color: var(--emerald); font-weight: 800; background: #143c22; padding: 2px 6px; border-radius: 6px;">
                COMPLETED
              </span>
            </div>
            <p style="font-size: 12px; color: var(--text-primary); margin-bottom: 2px;">
              Winner: <strong style="color: var(--emerald);">${m.winnerName || m.winnerPlayerId}</strong>
            </p>
            <p style="font-size: 11px; color: var(--text-secondary);">Players: ${m.playersJson || 'None'}</p>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.05); margin-top: 6px; padding-top: 4px;">
              <span>Entry: ${formatNumber(m.entryAmount)} Coins • ${m.mode}</span>
              <span>${new Date(m.endedAt || Date.now()).toLocaleString()}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;

  container.innerHTML = getAdminFrameHtml("/admin/matches", "MATCHES", html);
  bindAdminFrameEvents("/admin/matches", renderAdminMatches);

  document.querySelectorAll(".m-chip").forEach(c => {
    c.onclick = () => {
      matchFilterMode = c.getAttribute("data-mode");
      renderAdminMatches();
    };
  });
}

// ==========================================
// 13. INVITATION MANAGEMENT (/admin/invitations)
// ==========================================
function renderAdminInvitations() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  const invites = getStorage("invitations", []);

  const html = `
    <div style="margin-bottom: 12px;">
      <h3 class="gold-title" style="font-size: 15px;">CHALLENGE INVITATIONS</h3>
      <p style="color: var(--text-secondary); font-size: 11px;">Track peer-to-peer player match challenges</p>
    </div>

    ${invites.length === 0 ? `
      <div class="card" style="text-align: center; padding: 36px 16px;">
        <p style="font-size: 26px; margin-bottom: 6px;">📨</p>
        <h4 style="font-size: 14px; font-weight: 700; color: var(--gold);">No invitations</h4>
        <p style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">Player challenge invites will appear here.</p>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${invites.map(i => `
          <div class="card" style="padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="color: var(--gold); font-size: 12px;">${i.invitationId || 'INV'}</strong>
              <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; background: #0c2317; color: var(--gold);">
                ${i.status}
              </span>
            </div>
            <p style="font-size: 12px;">From: <strong>${i.senderUsername}</strong> (${i.senderPlayerId}) → To: <strong>${i.receiverPlayerId}</strong></p>
            <p style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Entry: ${formatNumber(i.entryAmount)} Coins • ${i.mode}</p>
            <p style="font-size: 9px; color: var(--text-muted); margin-top: 4px;">${new Date(i.createdAt).toLocaleString()}</p>
          </div>
        `).join('')}
      </div>
    `}
  `;

  container.innerHTML = getAdminFrameHtml("/admin/invitations", "INVITATIONS", html);
  bindAdminFrameEvents("/admin/invitations", renderAdminInvitations);
}

// ==========================================
// 14. LEADERBOARD MANAGEMENT (/admin/leaderboard)
// ==========================================
function renderAdminLeaderboard() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  const users = getStorage("users", []).filter(u => u.role !== "ADMIN");
  users.sort((a, b) => (b.coinBalance || 0) - (a.coinBalance || 0));

  const html = `
    <div style="margin-bottom: 12px;">
      <h3 class="gold-title" style="font-size: 15px;">GLOBAL LEADERBOARD RANKINGS</h3>
      <p style="color: var(--text-secondary); font-size: 11px;">Live standings computed from the virtual coin ledger</p>
    </div>

    ${users.length === 0 ? `
      <div class="card" style="text-align: center; padding: 36px 16px;">
        <p style="font-size: 26px; margin-bottom: 6px;">🏆</p>
        <h4 style="font-size: 14px; font-weight: 700; color: var(--gold);">No ranked users</h4>
        <p style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">Registered players will be automatically ranked.</p>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${users.map((u, idx) => `
          <div class="card" style="padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 14px; font-weight: 800; width: 24px; color: ${idx === 0 ? 'var(--gold)' : (idx === 1 ? '#e2e8f0' : (idx === 2 ? '#d97706' : 'var(--text-muted)'))};">
                #${idx + 1}
              </span>
              <div class="avatar avatar-sm" style="background: ${getAvatarGradient(u.username)}; width: 32px; height: 32px; font-size: 11px;">
                ${u.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <strong style="font-size: 13px;">${u.username}</strong>
                <p style="font-size: 10px; color: var(--text-muted);">${u.playerId} • ${u.matchesWon || 0} Wins</p>
              </div>
            </div>
            <strong style="color: var(--gold); font-size: 13px;">🪙 ${formatNumber(u.coinBalance)}</strong>
          </div>
        `).join('')}
      </div>
    `}
  `;

  container.innerHTML = getAdminFrameHtml("/admin/leaderboard", "LEADERBOARD", html);
  bindAdminFrameEvents("/admin/leaderboard", renderAdminLeaderboard);
}

// ==========================================
// 15. REPORTS & ANALYTICS (/admin/reports)
// ==========================================
function renderAdminReports() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  const users = getStorage("users", []).filter(u => u.role !== "ADMIN");
  const matches = getStorage("matches", []);
  const txns = getStorage("transactions", []);
  const requests = getStorage("coin_requests", []);

  const totalCoinsHeld = users.reduce((sum, u) => sum + (u.coinBalance || 0), 0);

  const matchEntriesTotal = txns
    .filter(t => t.type === "MATCH_ENTRY")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const approvedCoinsTotal = txns
    .filter(t => t.type === "COIN_REQUEST" && (t.amount || 0) > 0)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const adminAdjustmentsTotal = txns
    .filter(t => t.type === "ADMIN_ADD" || t.type === "BONUS" || t.type === "REFUND")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const m1v1 = matches.filter(m => m.mode === "1v1").length;
  const m2v2 = matches.filter(m => m.mode === "2v2").length;

  const html = `
    <div style="margin-bottom: 12px;">
      <h3 class="gold-title" style="font-size: 15px;">ANALYTICS & FINANCIAL REPORTS</h3>
      <p style="color: var(--text-secondary); font-size: 11px;">Real metrics aggregated from system ledgers</p>
    </div>

    <!-- Metric Breakdown Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div class="card" style="padding: 12px;">
        <span style="font-size: 9px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Circulating Coins</span>
        <h3 style="font-size: 17px; font-weight: 800; color: var(--gold); margin-top: 2px;">${formatNumber(totalCoinsHeld)}</h3>
        <span style="font-size: 9px; color: var(--text-secondary);">Held by active users</span>
      </div>

      <div class="card" style="padding: 12px;">
        <span style="font-size: 9px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Match Turn-in</span>
        <h3 style="font-size: 17px; font-weight: 800; color: var(--emerald); margin-top: 2px;">${formatNumber(matchEntriesTotal)}</h3>
        <span style="font-size: 9px; color: var(--text-secondary);">Fees entered into matches</span>
      </div>

      <div class="card" style="padding: 12px;">
        <span style="font-size: 9px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Approved Requests</span>
        <h3 style="font-size: 17px; font-weight: 800; color: #38bdf8; margin-top: 2px;">${formatNumber(approvedCoinsTotal)}</h3>
        <span style="font-size: 9px; color: var(--text-secondary);">${requests.filter(r => r.status === 'APPROVED').length} Approved</span>
      </div>

      <div class="card" style="padding: 12px;">
        <span style="font-size: 9px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Admin Grants</span>
        <h3 style="font-size: 17px; font-weight: 800; color: var(--gold); margin-top: 2px;">${formatNumber(adminAdjustmentsTotal)}</h3>
        <span style="font-size: 9px; color: var(--text-secondary);">Manual adjustments</span>
      </div>
    </div>

    <!-- Match Mode Distribution -->
    <div class="card" style="padding: 14px; margin-bottom: 12px;">
      <h4 style="font-size: 12px; font-weight: 800; color: var(--gold); margin-bottom: 8px;">MATCH MODE DISTRIBUTION</h4>
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
        <span>1 vs 1 Solo: <strong>${m1v1}</strong> matches</span>
        <span>2 vs 2 Teams: <strong>${m2v2}</strong> matches</span>
      </div>
      <div style="width: 100%; height: 8px; background: #0c1d15; border-radius: 4px; overflow: hidden; display: flex;">
        <div style="width: ${(m1v1 + m2v2) > 0 ? (m1v1 / (m1v1 + m2v2)) * 100 : 50}%; background: var(--gold);"></div>
        <div style="width: ${(m1v1 + m2v2) > 0 ? (m2v2 / (m1v1 + m2v2)) * 100 : 50}%; background: var(--emerald);"></div>
      </div>
    </div>

    <!-- Disclaimer -->
    <div class="card card-gold" style="padding: 12px; font-size: 11px; color: var(--text-secondary);">
      <strong style="color: var(--gold);">POLICY COMPLIANCE:</strong> All metrics represent purely in-game virtual entertainment currency. No real-currency withdrawal, cash-out, or payout functions exist in this software.
    </div>
  `;

  container.innerHTML = getAdminFrameHtml("/admin/reports", "REPORTS", html);
  bindAdminFrameEvents("/admin/reports", renderAdminReports);
}

// ==========================================
// 16. GAME SETTINGS (/admin/settings)
// ==========================================
function renderAdminSettings() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  const cfg = getStorage("game_settings", {
    mode1v1: true,
    mode2v2: true,
    durations: [1, 2, 5],
    entryAmounts: [1000, 2000, 5000, 10000],
    customEntryEnabled: true,
    customMin: 500,
    customMax: 500000
  });

  const html = `
    <div style="margin-bottom: 12px;">
      <h3 class="gold-title" style="font-size: 15px;">ENGINE & MATCH RULES CONFIGURATION</h3>
      <p style="color: var(--text-secondary); font-size: 11px;">Changes persist directly to the database and govern matchmaking</p>
    </div>

    <div class="card card-gold" style="padding: 16px;">
      <form id="form-admin-settings">
        <!-- Game Modes -->
        <label style="display: block; font-size: 11px; font-weight: 800; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase;">
          SUPPORTED MODES
        </label>
        <div style="display: flex; gap: 12px; margin-bottom: 14px;">
          <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; cursor: pointer;">
            <input type="checkbox" id="cfg-mode-1v1" ${cfg.mode1v1 ? 'checked' : ''} /> 1 vs 1 Mode
          </label>
          <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; cursor: pointer;">
            <input type="checkbox" id="cfg-mode-2v2" ${cfg.mode2v2 ? 'checked' : ''} /> 2 vs 2 Mode
          </label>
        </div>

        <!-- Allowed Entry Amounts -->
        <label style="display: block; font-size: 11px; font-weight: 800; color: var(--text-secondary); margin-bottom: 4px; text-transform: uppercase;">
          ENTRY AMOUNT TIERS (Comma separated)
        </label>
        <input type="text" id="cfg-entries-input" class="input-field" value="${(cfg.entryAmounts || [1000, 2000, 5000, 10000]).join(', ')}" required />

        <!-- Custom Entry Limits -->
        <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; margin-bottom: 8px; cursor: pointer;">
          <input type="checkbox" id="cfg-custom-entry-toggle" ${cfg.customEntryEnabled ? 'checked' : ''} />
          Allow Custom Coin Entries
        </label>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
          <div>
            <label style="display: block; font-size: 10px; font-weight: 700; color: var(--text-muted); margin-bottom: 2px;">MIN CUSTOM</label>
            <input type="number" id="cfg-min-custom" class="input-field" value="${cfg.customMin || 500}" min="100" />
          </div>
          <div>
            <label style="display: block; font-size: 10px; font-weight: 700; color: var(--text-muted); margin-bottom: 2px;">MAX CUSTOM</label>
            <input type="number" id="cfg-max-custom" class="input-field" value="${cfg.customMax || 500000}" min="1000" />
          </div>
        </div>

        <button type="submit" class="btn btn-gold btn-block" style="height: 46px; font-weight: 800;">
          SAVE GAME SETTINGS TO DATABASE
        </button>
      </form>
    </div>
  `;

  container.innerHTML = getAdminFrameHtml("/admin/settings", "SETTINGS", html);
  bindAdminFrameEvents("/admin/settings", renderAdminSettings);

  document.getElementById("form-admin-settings").onsubmit = (e) => {
    e.preventDefault();
    const mode1 = document.getElementById("cfg-mode-1v1").checked;
    const mode2 = document.getElementById("cfg-mode-2v2").checked;
    const customEnabled = document.getElementById("cfg-custom-entry-toggle").checked;
    const minVal = parseInt(document.getElementById("cfg-min-custom").value) || 500;
    const maxVal = parseInt(document.getElementById("cfg-max-custom").value) || 500000;

    const entries = document.getElementById("cfg-entries-input").value
      .split(",")
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n > 0);

    const updated = {
      mode1v1: mode1,
      mode2v2: mode2,
      durations: [1, 2, 5],
      entryAmounts: entries.length > 0 ? entries : [1000, 2000, 5000, 10000],
      customEntryEnabled: customEnabled,
      customMin: minVal,
      customMax: maxVal,
      updatedAt: Date.now()
    };

    setStorage("game_settings", updated);
    recordAuditLog(adminSession ? adminSession.username : "789895", "CHANGE_GAME_SETTING", "DATABASE", 0, "Updated match & engine configurations");
    showToast("Game settings saved to database!");
  };
}

// ==========================================
// 17. AUDIT LOGS (/admin/audit-logs)
// ==========================================
let auditSearchQuery = "";

function renderAdminAuditLogs() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  const allLogs = getStorage("audit_logs", []);
  let filtered = allLogs;
  if (auditSearchQuery) {
    const q = auditSearchQuery.toLowerCase();
    filtered = allLogs.filter(l => 
      (l.action || "").toLowerCase().includes(q) ||
      (l.targetUserId || "").toLowerCase().includes(q) ||
      (l.reason || "").toLowerCase().includes(q)
    );
  }

  const html = `
    <div style="margin-bottom: 10px;">
      <h3 class="gold-title" style="font-size: 15px;">SYSTEM AUDIT LOGS</h3>
      <p style="color: var(--text-secondary); font-size: 11px;">Immutable cryptographic audit trail of all administrative actions</p>
      
      <input type="text" id="admin-audit-search" class="input-field" placeholder="🔍 Search action, target user, or reason..." value="${auditSearchQuery}" style="margin-top: 8px; margin-bottom: 8px;" />
    </div>

    ${filtered.length === 0 ? `
      <div class="card" style="text-align: center; padding: 36px 16px;">
        <p style="font-size: 26px; margin-bottom: 6px;">🔐</p>
        <h4 style="font-size: 14px; font-weight: 700; color: var(--gold);">No audit records</h4>
        <p style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">Admin actions will be logged automatically.</p>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${filtered.map(l => `
          <div class="card" style="padding: 10px 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: var(--gold); font-size: 12px;">${l.action}</strong>
              <span style="color: var(--text-muted); font-size: 9px;">${new Date(l.createdAt).toLocaleString()}</span>
            </div>
            <p style="font-size: 11px; color: var(--text-primary); margin-top: 2px;">
              Target: <strong>${l.targetUserId || 'SYSTEM'}</strong>
              ${l.amount ? ` • Amount: <strong>${formatNumber(l.amount)}</strong>` : ''}
            </p>
            <p style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">
              Reason: <em>${l.reason || 'None'}</em>
            </p>
            <div style="display: flex; justify-content: space-between; font-size: 9px; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.05); margin-top: 4px; padding-top: 4px;">
              <span>Admin: ${l.adminId}</span>
              <span>${l.logId}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;

  container.innerHTML = getAdminFrameHtml("/admin/audit-logs", "AUDIT LOGS", html);
  bindAdminFrameEvents("/admin/audit-logs", renderAdminAuditLogs);

  const s = document.getElementById("admin-audit-search");
  if (s) {
    s.oninput = () => {
      auditSearchQuery = s.value.trim();
      renderAdminAuditLogs();
    };
  }
}
