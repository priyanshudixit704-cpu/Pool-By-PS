// ==========================================
// 8 BALL POOL - ADMIN PORTAL & MANAGEMENT
// ==========================================

function renderAdminLogin() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  container.innerHTML = `
    <div style="text-align: center; margin-top: 40px; margin-bottom: 24px;">
      <div style="width: 72px; height: 72px; border-radius: 50%; background: #132f22; border: 2px solid var(--gold); margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
        🛡️
      </div>
      <h1 class="gold-title" style="font-size: 24px;">ADMIN PORTAL</h1>
      <p style="color: var(--text-secondary); font-size: 13px; margin-top: 4px;">Restricted Access • Authorized Personnel Only</p>
    </div>

    <div class="card card-gold" style="padding: 20px;">
      <form id="form-admin-login">
        <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">
          ADMIN USERNAME
        </label>
        <input type="text" id="admin-user-input" class="input-field" placeholder="Enter admin username" autocomplete="off" required />

        <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">
          SECURITY KEY / PASSWORD
        </label>
        <input type="password" id="admin-pass-input" class="input-field" placeholder="Enter password" autocomplete="off" required />

        <button type="submit" class="btn btn-gold btn-block" style="height: 48px; font-size: 15px; margin-top: 8px;">
          LOGIN TO ADMIN PORTAL
        </button>
      </form>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <button id="btn-back-user-login" class="btn btn-dark btn-sm">
        ← Back to Game Login
      </button>
    </div>
  `;

  document.getElementById("btn-back-user-login").onclick = () => {
    navigateTo("/login");
  };

  document.getElementById("form-admin-login").onsubmit = (e) => {
    e.preventDefault();
    const uInput = document.getElementById("admin-user-input").value.trim();
    const pInput = document.getElementById("admin-pass-input").value.trim();

    // Verify against admin credentials: 789895 / 020203
    if (uInput === "789895" && pInput === "020203") {
      const users = getStorage("users", []);
      let adminUser = users.find(u => u.username === "789895" && u.role === "ADMIN");
      if (!adminUser) {
        adminUser = {
          id: 1,
          playerId: "8BP-000001",
          username: "789895",
          role: "ADMIN",
          coinBalance: 10000000,
          status: "ACTIVE"
        };
      }
      adminSession = adminUser;
      setStorage("admin_session", adminSession);
      recordAuditLog("ADMIN_LOGIN_SUCCESS", "SYSTEM", "Admin logged in successfully");
      showToast("Welcome to 8 Ball Pool Admin Portal");
      renderAdminDashboard();
    } else {
      recordAuditLog("ADMIN_LOGIN_FAILED", uInput, "Invalid admin credentials attempt");
      showToast("Access Denied: Invalid admin credentials");
    }
  };
}

let activeAdminTab = "dashboard";

function renderAdminDashboard() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  const users = getStorage("users", []);
  const matches = getStorage("matches", []);
  const txns = getStorage("transactions", []);
  const coinRequests = getStorage("coin_requests", []);
  const pendingRequests = coinRequests.filter(r => r.status === "PENDING");
  const auditLogs = getStorage("audit_logs", []);
  const config = getStorage("config", {});

  // Calculate stats
  const totalUsers = users.filter(u => u.role !== "ADMIN").length;
  const onlineUsers = users.filter(u => u.isOnline && u.role !== "ADMIN").length;
  const totalCoinsInSystem = users.reduce((acc, u) => acc + (u.coinBalance || 0), 0);
  
  const coinsAdded = txns
    .filter(t => t.type === "COIN_REQUEST_APPROVED" || t.type === "ADMIN_ADJUST_CREDIT" || t.type === "STARTING_BONUS")
    .reduce((acc, t) => acc + t.amount, 0);

  const coinsUsed = txns
    .filter(t => t.type === "MATCH_ENTRY")
    .reduce((acc, t) => acc + t.amount, 0);

  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayTxnsCount = txns.filter(t => t.createdAt >= todayStart).length;

  container.innerHTML = `
    <!-- Top Admin Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 4px 0;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 20px;">🛡️</span>
        <div>
          <h2 class="gold-title" style="font-size: 16px;">ADMIN DASHBOARD</h2>
          <span style="font-size: 11px; color: var(--text-secondary);">Logged in: ID ${adminSession.username}</span>
        </div>
      </div>
      <button id="btn-admin-logout" class="btn btn-dark btn-sm" style="color: var(--loss-red); font-size: 11px;">
        Logout ⎋
      </button>
    </div>

    <!-- Admin Navigation Tabs -->
    <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 14px; scrollbar-width: none;">
      <button class="btn ${activeAdminTab === 'dashboard' ? 'btn-gold' : 'btn-dark'} btn-sm adm-tab" data-tab="dashboard">Dashboard</button>
      <button class="btn ${activeAdminTab === 'users' ? 'btn-gold' : 'btn-dark'} btn-sm adm-tab" data-tab="users">Users (${totalUsers})</button>
      <button class="btn ${activeAdminTab === 'requests' ? 'btn-gold' : 'btn-dark'} btn-sm adm-tab" data-tab="requests" style="position: relative;">
        Coin Requests
        ${pendingRequests.length > 0 ? `<span style="background: var(--loss-red); color: white; border-radius: 50%; padding: 2px 6px; font-size: 10px; font-weight: 800; margin-left: 4px;">${pendingRequests.length}</span>` : ''}
      </button>
      <button class="btn ${activeAdminTab === 'coins' ? 'btn-gold' : 'btn-dark'} btn-sm adm-tab" data-tab="coins">Coins</button>
      <button class="btn ${activeAdminTab === 'matches' ? 'btn-gold' : 'btn-dark'} btn-sm adm-tab" data-tab="matches">Matches (${matches.length})</button>
      <button class="btn ${activeAdminTab === 'active' ? 'btn-gold' : 'btn-dark'} btn-sm adm-tab" data-tab="active">Active Games</button>
      <button class="btn ${activeAdminTab === 'txns' ? 'btn-gold' : 'btn-dark'} btn-sm adm-tab" data-tab="txns">Ledger</button>
      <button class="btn ${activeAdminTab === 'audit' ? 'btn-gold' : 'btn-dark'} btn-sm adm-tab" data-tab="audit">Audit Logs</button>
      <button class="btn ${activeAdminTab === 'config' ? 'btn-gold' : 'btn-dark'} btn-sm adm-tab" data-tab="config">Settings</button>
    </div>

    <!-- Tab Dynamic Content -->
    <div id="admin-tab-body"></div>
  `;

  // Bind Logout
  document.getElementById("btn-admin-logout").onclick = () => {
    recordAuditLog("ADMIN_LOGOUT", "SYSTEM", "Admin logged out");
    adminSession = null;
    setStorage("admin_session", null);
    showToast("Logged out of Admin Portal");
    navigateTo("/admin");
  };

  // Bind Tabs
  document.querySelectorAll(".adm-tab").forEach(btn => {
    btn.onclick = () => {
      activeAdminTab = btn.getAttribute("data-tab");
      renderAdminDashboard();
    };
  });

  const bodyEl = document.getElementById("admin-tab-body");

  // Tab 1: Dashboard
  if (activeAdminTab === "dashboard") {
    bodyEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
        <div class="card" style="padding: 12px;">
          <p style="color: var(--text-secondary); font-size: 11px; font-weight: 700;">TOTAL USERS</p>
          <h3 style="color: var(--gold); font-size: 20px; font-weight: 800; margin-top: 4px;">${formatNumber(totalUsers)}</h3>
          <span style="font-size: 10px; color: var(--emerald);">🟢 ${onlineUsers} Online</span>
        </div>

        <div class="card ${pendingRequests.length > 0 ? 'card-gold' : ''}" style="padding: 12px;">
          <p style="color: var(--text-secondary); font-size: 11px; font-weight: 700;">PENDING COIN REQ.</p>
          <h3 style="color: ${pendingRequests.length > 0 ? 'var(--loss-red)' : 'var(--text-primary)'}; font-size: 20px; font-weight: 800; margin-top: 4px;">
            ${pendingRequests.length}
          </h3>
          <span style="font-size: 10px; color: var(--text-muted);">${pendingRequests.length > 0 ? 'Requires action' : 'All cleared'}</span>
        </div>

        <div class="card" style="padding: 12px;">
          <p style="color: var(--text-secondary); font-size: 11px; font-weight: 700;">TOTAL VIRTUAL COINS</p>
          <h3 style="color: var(--gold); font-size: 18px; font-weight: 800; margin-top: 4px;">${formatNumber(totalCoinsInSystem)}</h3>
          <span style="font-size: 10px; color: var(--text-muted);">In circulation</span>
        </div>

        <div class="card" style="padding: 12px;">
          <p style="color: var(--text-secondary); font-size: 11px; font-weight: 700;">TODAY'S TXNS</p>
          <h3 style="color: var(--text-primary); font-size: 20px; font-weight: 800; margin-top: 4px;">${todayTxnsCount}</h3>
          <span style="font-size: 10px; color: var(--emerald);">Active ledger</span>
        </div>
      </div>

      <!-- Coin Overview Card -->
      <div class="card" style="padding: 14px; margin-bottom: 14px;">
        <h3 style="font-size: 13px; font-weight: 700; color: var(--gold); margin-bottom: 10px;">VIRTUAL COIN FLOW</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px;">
          <span style="color: var(--text-secondary);">Total Coins Added (Admin/Grants):</span>
          <strong style="color: var(--emerald);">+${formatNumber(coinsAdded)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px;">
          <span style="color: var(--text-secondary);">Total Coins Used (Matches):</span>
          <strong style="color: var(--loss-red);">${formatNumber(coinsUsed)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--bg-card-border); padding-top: 8px; font-size: 12px;">
          <span style="color: var(--text-secondary);">Total Matches Played:</span>
          <strong>${matches.length}</strong>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="display: flex; gap: 8px;">
        <button id="btn-quick-requests" class="btn btn-gold btn-block" style="font-size: 12px;">
          Manage Coin Requests (${pendingRequests.length})
        </button>
      </div>
    `;

    document.getElementById("btn-quick-requests").onclick = () => {
      activeAdminTab = "requests";
      renderAdminDashboard();
    };
  }

  // Tab 2: Users Management
  else if (activeAdminTab === "users") {
    bodyEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 class="gold-title" style="font-size: 14px;">REGISTERED PLAYERS</h3>
        <span style="font-size: 11px; color: var(--text-secondary);">${totalUsers} Total</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${users.filter(u => u.role !== "ADMIN").map(u => `
          <div class="card" style="padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div class="avatar avatar-sm" style="background: ${getAvatarGradient(u.username)};">
                  ${u.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p style="font-weight: 800; font-size: 13px;">${u.username}</p>
                  <p style="font-size: 11px; color: var(--gold); font-weight: 700;">${u.playerId}</p>
                </div>
              </div>
              <span style="font-weight: 800; font-size: 13px; color: var(--gold);">
                ${formatNumber(u.coinBalance)} Coins
              </span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; margin-top: 6px;">
              <span>Matches: ${u.matchesPlayed || 0} (W: ${u.matchesWon || 0} / L: ${u.matchesLost || 0})</span>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-dark btn-sm btn-adj-coin" data-uid="${u.id}" style="padding: 3px 8px; font-size: 10px;">Adjust Coins</button>
                <button class="btn ${u.status === 'BLOCKED' ? 'btn-gold' : 'btn-dark'} btn-sm btn-toggle-block" data-uid="${u.id}" style="padding: 3px 8px; font-size: 10px;">
                  ${u.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    document.querySelectorAll(".btn-adj-coin").forEach(b => {
      b.onclick = () => showAdjustCoinModal(parseInt(b.getAttribute("data-uid")));
    });

    document.querySelectorAll(".btn-toggle-block").forEach(b => {
      b.onclick = () => {
        const uid = parseInt(b.getAttribute("data-uid"));
        const u = users.find(x => x.id === uid);
        if (u) {
          u.status = u.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
          setStorage("users", users);
          recordAuditLog("USER_STATUS_CHANGE", u.playerId, `Changed status to ${u.status}`);
          showToast(`Player ${u.username} status set to ${u.status}`);
          renderAdminDashboard();
        }
      };
    });
  }

  // Tab 3: Coin Requests Management (Requirement 4)
  else if (activeAdminTab === "requests") {
    bodyEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 class="gold-title" style="font-size: 14px;">COIN REQUESTS</h3>
        <span style="font-size: 11px; color: var(--gold); font-weight: 700;">${pendingRequests.length} PENDING</span>
      </div>

      ${coinRequests.length === 0 ? `
        <div class="card" style="text-align: center; padding: 24px;">
          <p style="color: var(--text-muted); font-size: 13px;">No coin requests recorded.</p>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${coinRequests.map(r => `
            <div class="card ${r.status === 'PENDING' ? 'card-gold' : ''}" style="padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <div>
                  <span style="font-size: 10px; font-weight: 800; color: var(--text-muted);">${r.requestId}</span>
                  <h4 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">
                    ${r.username} (${r.playerId})
                  </h4>
                </div>
                <span style="padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 800; background: ${r.status === 'APPROVED' ? '#143c22' : (r.status === 'REJECTED' ? '#3c1414' : '#47360e')}; color: ${r.status === 'APPROVED' ? 'var(--emerald)' : (r.status === 'REJECTED' ? 'var(--loss-red)' : 'var(--gold)')};">
                  ${r.status}
                </span>
              </div>

              <div style="background: #091711; padding: 10px; border-radius: 8px; font-size: 12px; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: var(--text-secondary);">Current Balance:</span>
                  <strong>${formatNumber(r.currentBalance)} Coins</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: var(--text-secondary);">Requested Amount:</span>
                  <strong style="color: var(--gold); font-size: 13px;">+${formatNumber(r.requestedAmount)} Coins</strong>
                </div>
                <div style="margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px;">
                  <span style="color: var(--text-secondary);">Reason:</span>
                  <p style="color: var(--text-primary); margin-top: 2px; font-style: italic;">"${r.reason || 'No reason provided'}"</p>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 10px; color: var(--text-muted);">
                  ${new Date(r.createdAt).toLocaleString()}
                </span>
                ${r.status === 'PENDING' ? `
                  <div style="display: flex; gap: 8px;">
                    <button class="btn btn-dark btn-sm btn-reject-req" data-id="${r.requestId}" style="color: var(--loss-red); padding: 5px 12px; font-size: 11px;">
                      REJECT
                    </button>
                    <button class="btn btn-gold btn-sm btn-approve-req" data-id="${r.requestId}" style="padding: 5px 14px; font-size: 11px; font-weight: 800;">
                      APPROVE
                    </button>
                  </div>
                ` : `
                  <span style="font-size: 10px; color: var(--text-secondary);">Resolved by Admin</span>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;

    // Handle Approve (Requirement 4)
    document.querySelectorAll(".btn-approve-req").forEach(b => {
      b.onclick = () => {
        const reqId = b.getAttribute("data-id");
        const req = coinRequests.find(x => x.requestId === reqId);
        if (!req) return;

        const u = users.find(x => x.id === req.userId || x.playerId === req.playerId);
        if (!u) return showToast("User record not found");

        // 1. Add requested coins
        const prevBal = u.coinBalance;
        u.coinBalance += req.requestedAmount;

        // 2. Immediate user update
        setStorage("users", users);
        if (currentUser && currentUser.id === u.id) {
          currentUser.coinBalance = u.coinBalance;
          setStorage("current_user", currentUser);
        }

        // 3. Mark request APPROVED
        req.status = "APPROVED";
        req.resolvedAt = Date.now();
        req.resolvedBy = adminSession.username;
        setStorage("coin_requests", coinRequests);

        // 4. Create Transaction record (COIN_REQUEST_APPROVED)
        recordTransaction(
          u.id,
          u.playerId,
          "COIN_REQUEST_APPROVED",
          req.requestedAmount,
          prevBal,
          u.coinBalance,
          `Admin approved coin request ${req.requestId}`
        );

        // 5. Create Admin Audit Log
        recordAuditLog(
          "COIN_REQUEST_APPROVED",
          u.playerId,
          `Approved +${formatNumber(req.requestedAmount)} coins for ${u.username}`,
          { requestId: req.requestId, amount: req.requestedAmount }
        );

        showToast(`Approved +${formatNumber(req.requestedAmount)} coins for ${u.username}`);
        renderAdminDashboard();
      };
    });

    // Handle Reject
    document.querySelectorAll(".btn-reject-req").forEach(b => {
      b.onclick = () => {
        const reqId = b.getAttribute("data-id");
        const req = coinRequests.find(x => x.requestId === reqId);
        if (!req) return;

        req.status = "REJECTED";
        req.resolvedAt = Date.now();
        req.resolvedBy = adminSession.username;
        setStorage("coin_requests", coinRequests);

        recordAuditLog(
          "COIN_REQUEST_REJECTED",
          req.playerId,
          `Rejected coin request ${req.requestId}`
        );

        showToast(`Coin request ${req.requestId} rejected`);
        renderAdminDashboard();
      };
    });
  }

  // Tab 4: Coin Management
  else if (activeAdminTab === "coins") {
    bodyEl.innerHTML = `
      <div class="card card-gold" style="padding: 14px; margin-bottom: 14px;">
        <h3 style="font-size: 14px; font-weight: 800; color: var(--gold); margin-bottom: 12px;">SYSTEM COIN METRICS</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
          <span style="color: var(--text-secondary);">Total Virtual Coins in System:</span>
          <strong style="color: var(--gold); font-size: 15px;">${formatNumber(totalCoinsInSystem)} Coins</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
          <span style="color: var(--text-secondary);">Total Coins Added (Admin/Grants):</span>
          <strong style="color: var(--emerald);">+${formatNumber(coinsAdded)} Coins</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px;">
          <span style="color: var(--text-secondary);">Total Coins Used (Match Entries):</span>
          <strong style="color: var(--loss-red);">${formatNumber(coinsUsed)} Coins</strong>
        </div>
      </div>

      <div class="card" style="padding: 14px;">
        <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 8px; color: var(--gold);">MANUAL COIN ADJUSTMENT</h4>
        <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 12px;">Directly credit or debit a player's virtual balance with an audit log.</p>
        
        <label style="font-size: 11px; font-weight: 700; color: var(--text-muted);">SELECT PLAYER</label>
        <select id="adj-player-select" class="input-field" style="margin-top: 4px; margin-bottom: 10px;">
          ${users.filter(u => u.role !== 'ADMIN').map(u => `
            <option value="${u.id}">${u.username} (${u.playerId}) - ${formatNumber(u.coinBalance)} Coins</option>
          `).join('')}
        </select>

        <label style="font-size: 11px; font-weight: 700; color: var(--text-muted);">AMOUNT (+ to add, - to deduct)</label>
        <input type="number" id="adj-amount-input" class="input-field" placeholder="e.g. 50000 or -10000" style="margin-top: 4px; margin-bottom: 10px;" />

        <label style="font-size: 11px; font-weight: 700; color: var(--text-muted);">AUDIT REASON</label>
        <input type="text" id="adj-reason-input" class="input-field" placeholder="e.g. Tournament reward or adjustment" style="margin-top: 4px; margin-bottom: 14px;" />

        <button id="btn-submit-adj" class="btn btn-gold btn-block">APPLY COIN ADJUSTMENT</button>
      </div>
    `;

    document.getElementById("btn-submit-adj").onclick = () => {
      const uid = parseInt(document.getElementById("adj-player-select").value);
      const amt = parseInt(document.getElementById("adj-amount-input").value) || 0;
      const reason = document.getElementById("adj-reason-input").value.trim() || "Administrative adjustment";

      if (amt === 0) return showToast("Please specify a non-zero adjustment amount");

      const u = users.find(x => x.id === uid);
      if (!u) return showToast("User not found");

      const prevBal = u.coinBalance;
      u.coinBalance = Math.max(0, u.coinBalance + amt);
      setStorage("users", users);

      if (currentUser && currentUser.id === u.id) {
        currentUser.coinBalance = u.coinBalance;
        setStorage("current_user", currentUser);
      }

      recordTransaction(
        u.id,
        u.playerId,
        amt > 0 ? "ADMIN_ADJUST_CREDIT" : "ADMIN_ADJUST_DEBIT",
        Math.abs(amt),
        prevBal,
        u.coinBalance,
        reason
      );

      recordAuditLog(
        "ADMIN_COIN_ADJUSTMENT",
        u.playerId,
        `Adjusted ${amt > 0 ? '+' : ''}${formatNumber(amt)} coins. Reason: ${reason}`
      );

      showToast(`Adjusted ${u.username} coins by ${amt > 0 ? '+' : ''}${formatNumber(amt)}`);
      renderAdminDashboard();
    };
  }

  // Tab 5: Matches
  else if (activeAdminTab === "matches") {
    bodyEl.innerHTML = `
      <h3 class="gold-title" style="font-size: 14px; margin-bottom: 12px;">MATCH HISTORY ARCHIVE</h3>
      ${matches.length === 0 ? `
        <div class="card" style="text-align: center; padding: 24px;">
          <p style="color: var(--text-muted); font-size: 13px;">No completed matches yet.</p>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${matches.map(m => `
            <div class="card" style="padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-weight: 800; font-size: 13px; color: var(--gold);">${m.roomId}</span>
                <span style="font-size: 11px; color: var(--text-muted);">${new Date(m.endedAt).toLocaleTimeString()}</span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Players: ${m.playersJson}</p>
              <div style="display: flex; justify-content: space-between; font-size: 11px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px;">
                <span>Winner: <strong style="color: var(--emerald);">${m.winnerName}</strong></span>
                <span>Entry: ${formatNumber(m.entryAmount)} Coins</span>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;
  }

  // Tab 6: Active Games
  else if (activeAdminTab === "active") {
    bodyEl.innerHTML = `
      <h3 class="gold-title" style="font-size: 14px; margin-bottom: 12px;">CURRENT ACTIVE ROOMS</h3>
      ${currentRoom ? `
        <div class="card card-gold" style="padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: var(--gold); font-size: 14px;">${currentRoom.roomId}</strong>
            <span style="background: var(--emerald); color: #000; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 800;">LIVE</span>
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Mode: ${currentRoom.mode} • Entry: ${formatNumber(currentRoom.entryAmount)} Coins</p>
          <p style="font-size: 12px; color: var(--text-secondary);">Players: ${currentRoom.players.map(p => p.name).join(' vs ')}</p>
        </div>
      ` : `
        <div class="card" style="text-align: center; padding: 24px;">
          <p style="color: var(--text-muted); font-size: 13px;">No games currently in progress.</p>
        </div>
      `}
    `;
  }

  // Tab 7: Transactions Ledger
  else if (activeAdminTab === "txns") {
    bodyEl.innerHTML = `
      <h3 class="gold-title" style="font-size: 14px; margin-bottom: 12px;">VIRTUAL COIN TRANSACTION LEDGER</h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${txns.slice(0, 25).map(t => `
          <div class="card" style="padding: 10px 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 700; font-size: 12px; color: var(--text-primary);">${t.type}</span>
              <span style="font-weight: 800; font-size: 13px; color: ${t.amount >= 0 ? 'var(--emerald)' : 'var(--loss-red)'};">
                ${t.amount >= 0 ? '+' : ''}${formatNumber(t.amount)}
              </span>
            </div>
            <p style="font-size: 11px; color: var(--text-secondary);">${t.description}</p>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); margin-top: 4px;">
              <span>Target: ${t.userPlayerId}</span>
              <span>${new Date(t.createdAt).toLocaleString()}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Tab 8: Audit Logs
  else if (activeAdminTab === "audit") {
    bodyEl.innerHTML = `
      <h3 class="gold-title" style="font-size: 14px; margin-bottom: 12px;">ADMIN AUDIT LOGS</h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${auditLogs.slice(0, 25).map(a => `
          <div class="card" style="padding: 10px 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="color: var(--gold); font-size: 12px;">${a.action}</strong>
              <span style="font-size: 10px; color: var(--text-muted);">${new Date(a.createdAt).toLocaleTimeString()}</span>
            </div>
            <p style="font-size: 11px; color: var(--text-secondary);">${a.reason}</p>
            <span style="font-size: 10px; color: var(--text-muted);">Admin: ${a.adminId} • Target: ${a.targetUserId}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Tab 9: Game Settings
  else if (activeAdminTab === "config") {
    bodyEl.innerHTML = `
      <div class="card" style="padding: 14px;">
        <h3 class="gold-title" style="font-size: 14px; margin-bottom: 12px;">GAME ENGINE SETTINGS</h3>
        
        <label style="font-size: 11px; font-weight: 700; color: var(--text-muted);">ALLOWED ENTRY TIERS (Comma separated)</label>
        <input type="text" id="cfg-tiers" class="input-field" value="${config.allowedEntries.join(', ')}" style="margin-top: 4px; margin-bottom: 12px;" />

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--text-muted);">CUSTOM MIN COINS</label>
            <input type="number" id="cfg-min" class="input-field" value="${config.customMin}" style="margin-top: 4px;" />
          </div>
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--text-muted);">CUSTOM MAX COINS</label>
            <input type="number" id="cfg-max" class="input-field" value="${config.customMax}" style="margin-top: 4px;" />
          </div>
        </div>

        <button id="btn-save-cfg" class="btn btn-gold btn-block">SAVE SETTINGS</button>
      </div>
    `;

    document.getElementById("btn-save-cfg").onclick = () => {
      const tiersStr = document.getElementById("cfg-tiers").value;
      const tiers = tiersStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const minVal = parseInt(document.getElementById("cfg-min").value) || 500;
      const maxVal = parseInt(document.getElementById("cfg-max").value) || 500000;

      config.allowedEntries = tiers;
      config.customMin = minVal;
      config.customMax = maxVal;
      setStorage("config", config);

      recordAuditLog("CONFIG_UPDATE", "SYSTEM", "Updated game tiers & custom coin limits");
      showToast("Settings updated successfully");
      renderAdminDashboard();
    };
  }
}

function showAdjustCoinModal(userId) {
  const users = getStorage("users", []);
  const u = users.find(x => x.id === userId);
  if (!u) return;

  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card">
      <h3 class="gold-title" style="margin-bottom: 10px;">Adjust Coins: ${u.username}</h3>
      <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 12px;">
        Player ID: <strong>${u.playerId}</strong> • Balance: <strong>${formatNumber(u.coinBalance)} Coins</strong>
      </p>
      
      <label style="font-size: 11px; font-weight: 700; color: var(--text-muted);">AMOUNT (+ to add, - to deduct)</label>
      <input type="number" id="quick-adj-amount" class="input-field" placeholder="e.g. 10000" style="margin-top: 4px; margin-bottom: 10px;" />

      <label style="font-size: 11px; font-weight: 700; color: var(--text-muted);">REASON</label>
      <input type="text" id="quick-adj-reason" class="input-field" placeholder="e.g. Bonus reward" style="margin-top: 4px; margin-bottom: 16px;" />

      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="modal-adj-cancel" class="btn btn-dark">Cancel</button>
        <button id="modal-adj-apply" class="btn btn-gold">Apply</button>
      </div>
    </div>
  `;
  document.getElementById("app-container").appendChild(modal);

  modal.querySelector("#modal-adj-cancel").onclick = () => modal.remove();
  modal.querySelector("#modal-adj-apply").onclick = () => {
    const amt = parseInt(modal.querySelector("#quick-adj-amount").value) || 0;
    const reason = modal.querySelector("#quick-adj-reason").value.trim() || "Admin direct adjustment";
    if (amt === 0) return showToast("Amount cannot be 0");

    const prevBal = u.coinBalance;
    u.coinBalance = Math.max(0, u.coinBalance + amt);
    setStorage("users", users);

    if (currentUser && currentUser.id === u.id) {
      currentUser.coinBalance = u.coinBalance;
      setStorage("current_user", currentUser);
    }

    recordTransaction(
      u.id,
      u.playerId,
      amt > 0 ? "ADMIN_ADJUST_CREDIT" : "ADMIN_ADJUST_DEBIT",
      Math.abs(amt),
      prevBal,
      u.coinBalance,
      reason
    );

    recordAuditLog("ADMIN_COIN_ADJUSTMENT", u.playerId, `Quick adjustment: ${amt} coins (${reason})`);

    modal.remove();
    showToast(`Updated ${u.username} coins by ${amt > 0 ? '+' : ''}${formatNumber(amt)}`);
    renderAdminDashboard();
  };
}
