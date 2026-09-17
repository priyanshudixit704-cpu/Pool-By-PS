// ==========================================
// 8 BALL POOL - MAIN CLIENT APPLICATION
// ==========================================

// Routing Controller
function navigateTo(path, replace = false) {
  if (replace) {
    window.history.replaceState({}, "", path);
  } else {
    window.history.pushState({}, "", path);
  }
  renderRoute();
}

window.addEventListener("popstate", () => {
  renderRoute();
});

function renderRoute() {
  const path = window.location.pathname || "/";
  const bottomBar = document.getElementById("bottom-bar");

  // Admin route check
  if (path === "/admin" || path.startsWith("/admin/")) {
    if (bottomBar) bottomBar.style.display = "none";
    if (path === "/admin/login") {
      if (adminSession) {
        navigateTo("/admin/dashboard", true);
      } else {
        renderAdminLogin();
      }
      return;
    }

    if (!adminSession) {
      navigateTo("/admin/login", true);
      return;
    }

    if (path === "/admin" || path === "/admin/dashboard") {
      renderAdminDashboard();
    } else if (path === "/admin/users") {
      renderAdminUsers();
    } else if (path === "/admin/live-games") {
      renderAdminLiveGames();
    } else if (path === "/admin/rooms") {
      renderAdminRooms();
    } else if (path === "/admin/coin-requests") {
      renderAdminCoinRequests();
    } else if (path === "/admin/transactions") {
      renderAdminTransactions();
    } else if (path === "/admin/matches") {
      renderAdminMatches();
    } else if (path === "/admin/invitations") {
      renderAdminInvitations();
    } else if (path === "/admin/leaderboard") {
      renderAdminLeaderboard();
    } else if (path === "/admin/reports") {
      renderAdminReports();
    } else if (path === "/admin/settings") {
      renderAdminSettings();
    } else if (path === "/admin/audit-logs") {
      renderAdminAuditLogs();
    } else {
      renderAdminDashboard();
    }
    return;
  }

  // Normal user auth check
  if (!currentUser) {
    if (bottomBar) bottomBar.style.display = "none";
    renderAuthView(path === "/register" ? 1 : 0);
    return;
  }

  // User is logged in
  const navRoutes = ["/", "/play", "/leaderboard", "/history", "/profile", "/notifications"];
  const isNavRoute = navRoutes.includes(path);
  if (bottomBar) bottomBar.style.display = isNavRoute ? "flex" : "none";

  // Active bottom nav icon styling
  document.querySelectorAll(".nav-item").forEach(item => {
    const itemRoute = item.getAttribute("data-route");
    if (itemRoute === path || (path === "/" && itemRoute === "/play")) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  if (path === "/" || path === "/play") {
    renderHomeView();
  } else if (path === "/room") {
    if (!currentRoom) {
      navigateTo("/play", true);
    } else {
      renderRoomView();
    }
  } else if (path === "/game") {
    if (!currentRoom) {
      navigateTo("/play", true);
    } else {
      renderGameView();
    }
  } else if (path === "/leaderboard") {
    renderLeaderboardView();
  } else if (path === "/history") {
    renderHistoryView();
  } else if (path === "/profile") {
    renderProfileView();
  } else if (path === "/notifications") {
    renderNotificationsView();
  } else {
    navigateTo("/play", true);
  }
}

// Bind bottom nav bar clicks
document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", () => {
    navigateTo(item.getAttribute("data-route"));
  });
});

// ==========================================
// USER AUTH VIEW (Login & Register ONLY)
// ==========================================
function renderAuthView(initialTab = 0) {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  container.innerHTML = `
    <div style="text-align: center; margin-top: 24px; margin-bottom: 20px;">
      <div style="width: 80px; height: 80px; border-radius: 50%; background: #0f3223; border: 3px solid var(--gold); margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 0 20px rgba(255,213,79,0.3);">
        <img src="/icons/icon-192.png" alt="8 Ball Pool" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='/public/img_app_icon.jpg';">
      </div>
      <h1 class="gold-title" style="font-size: 26px;">8 BALL POOL</h1>
      <p style="color: var(--text-secondary); font-size: 13px; margin-top: 4px;">Multiplayer Billiards Arena</p>
    </div>

    <!-- Toggle Tabs: Login / Register (No Admin Tab!) -->
    <div style="display: flex; background: #0c1d15; border-radius: 12px; padding: 4px; margin-bottom: 20px; border: 1px solid var(--bg-card-border);">
      <button id="tab-login" class="btn ${initialTab === 0 ? 'btn-gold' : 'btn-dark'}" style="flex: 1; border-radius: 8px;">Login</button>
      <button id="tab-register" class="btn ${initialTab === 1 ? 'btn-gold' : 'btn-dark'}" style="flex: 1; border-radius: 8px;">Register</button>
    </div>

    <div class="card card-gold">
      <!-- LOGIN FORM -->
      <form id="form-login" method="post" action="javascript:void(0);" autocomplete="on" style="${initialTab === 0 ? '' : 'display: none;'}">
        <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">
          USERNAME OR PLAYER ID
        </label>
        <input type="text" id="login-identifier" name="username" class="input-field" placeholder="e.g. Rahul or 8BP-104582" autocomplete="username" required />

        <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">
          PASSWORD
        </label>
        <input type="password" id="login-password" name="password" class="input-field" placeholder="Enter password" autocomplete="current-password" required />

        <div style="display: flex; justify-content: flex-end; margin-bottom: 14px;">
          <a href="#" id="link-forgot-pass" style="color: var(--gold); font-size: 11px; text-decoration: none;">Forgot Password?</a>
        </div>

        <button type="submit" class="btn btn-gold btn-block" style="height: 46px; font-size: 14px;">
          LOGIN & PLAY
        </button>
      </form>

      <!-- REGISTER FORM -->
      <form id="form-register" method="post" action="javascript:void(0);" autocomplete="on" style="${initialTab === 1 ? '' : 'display: none;'}">
        <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">
          USERNAME
        </label>
        <input type="text" id="reg-username" name="username" class="input-field" placeholder="Choose a username" autocomplete="username" required />

        <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">
          EMAIL OR PHONE
        </label>
        <input type="text" id="reg-contact" name="email" class="input-field" placeholder="For account recovery" autocomplete="email" required />

        <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">
          PASSWORD
        </label>
        <input type="password" id="reg-password" name="password" class="input-field" placeholder="Create strong password" autocomplete="new-password" required />

        <p style="color: var(--gold); font-size: 12px; margin-bottom: 14px;">
          🎁 <strong>100,000 Virtual Coins</strong> bonus on registration!
        </p>

        <button type="submit" class="btn btn-gold btn-block" style="height: 46px; font-size: 14px;">
          CREATE ACCOUNT
        </button>
      </form>
    </div>
  `;

  // Tab switching
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");

  tabLogin.onclick = () => {
    tabLogin.className = "btn btn-gold";
    tabRegister.className = "btn btn-dark";
    formLogin.style.display = "block";
    formRegister.style.display = "none";
  };

  tabRegister.onclick = () => {
    tabLogin.className = "btn btn-dark";
    tabRegister.className = "btn btn-gold";
    formLogin.style.display = "none";
    formRegister.style.display = "block";
  };

  // Forgot password
  document.getElementById("link-forgot-pass").onclick = (e) => {
    e.preventDefault();
    showToast("Password reset link sent to your registered contact.");
  };

  // Login submission
  formLogin.onsubmit = (e) => {
    e.preventDefault();
    const ident = document.getElementById("login-identifier").value.trim().toLowerCase();
    const pass = document.getElementById("login-password").value.trim();

    const users = getStorage("users", []);
    const user = users.find(u => 
      (u.username.toLowerCase() === ident || u.playerId.toLowerCase() === ident) && 
      verifyPassword(pass, u.password)
    );

    if (!user) {
      return showToast("Invalid credentials. Check username/password.");
    }

    if (user.status === "BLOCKED") {
      return showToast("Account suspended by Administrator.");
    }

    user.isOnline = true;
    setStorage("users", users);
    currentUser = user;
    setStorage("current_user", currentUser);

    recordUserActivity(user.id, user.playerId, user.username, "USER_LOGIN", "", "User logged into game");

    showToast(`Welcome back, ${user.username}!`);
    navigateTo("/play");
  };

  // Register submission
  formRegister.onsubmit = (e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value.trim();
    const contact = document.getElementById("reg-contact").value.trim();
    const pass = document.getElementById("reg-password").value.trim();

    if (username.length < 3) return showToast("Username must be at least 3 characters");
    if (pass.length < 4) return showToast("Password must be at least 4 characters");

    const users = getStorage("users", []);
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return showToast("Username is already taken");
    }

    // Unique Player ID: 8BP-XXXXXX
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const playerId = `8BP-${randomNum}`;

    const newUser = {
      id: Date.now(),
      playerId: playerId,
      username: username,
      password: hashPassword(pass),
      emailOrPhone: contact,
      avatar: "avatar_" + ((users.length % 6) + 1),
      coinBalance: 100000, // 100,000 starting coins
      role: "USER",
      status: "ACTIVE",
      isApproved: true,
      isOnline: true,
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      createdAt: Date.now()
    };

    users.push(newUser);
    setStorage("users", users);

    // Record welcome bonus transaction
    recordTransaction(
      newUser.id,
      newUser.playerId,
      "WELCOME_BONUS",
      100000,
      0,
      100000,
      "New player registration bonus"
    );

    recordUserActivity(newUser.id, newUser.playerId, newUser.username, "USER_REGISTER", "", "Created new player profile");

    currentUser = newUser;
    setStorage("current_user", currentUser);

    showToast(`Welcome! Player ID: ${playerId}`);
    navigateTo("/play");
  };
}

// ==========================================
// USER DASHBOARD (Requirement 14, 5, 3)
// ==========================================
let selectedMode = "1v1";
let selectedEntry = 5000;
let selectedDuration = 2;
let isCustom = false;

function renderHomeView() {
  const container = document.getElementById("main-view");
  container.className = "view-content";

  // Refresh latest user coin balance from storage
  const users = getStorage("users", []);
  const freshUser = users.find(u => u.id === currentUser.id);
  if (freshUser) {
    currentUser = freshUser;
    setStorage("current_user", currentUser);
  }

  const unreadNotifs = getUserNotifications(currentUser.id, currentUser.playerId).filter(n => !n.read).length;

  const gameConfig = getStorage("game_settings", {
    mode1v1: true,
    mode2v2: true,
    durations: [1, 2, 5],
    entryAmounts: [1000, 2000, 5000, 10000],
    customEntryEnabled: true,
    customMin: 500,
    customMax: 500000
  });

  const invites = getStorage("invitations", []).filter(i => 
    i.receiverPlayerId === currentUser.playerId && i.status === "PENDING"
  );

  container.innerHTML = `
    <!-- Top Player Header Card -->
    <div class="card" style="margin-bottom: 12px; padding: 12px 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="avatar avatar-md" style="background: ${getAvatarGradient(currentUser.username)};">
            ${currentUser.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <h2 style="font-weight: 800; font-size: 15px;">${currentUser.username}</h2>
              <span style="background: rgba(16,185,129,0.2); color: var(--emerald); font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 8px;">ACTIVE</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; margin-top: 2px;">
              <span id="player-id-label" style="color: var(--gold); font-weight: 800; font-size: 12px;">${currentUser.playerId}</span>
              <button id="btn-copy-id" style="background: none; border: none; cursor: pointer; font-size: 12px; color: var(--text-secondary);" title="Copy ID">📋</button>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <!-- Notification Bell -->
          <button id="btn-user-notifications" style="position: relative; background: #132a20; border: 1.5px solid var(--bg-card-border); border-radius: 12px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--gold); font-size: 16px;" title="Notifications">
            🔔
            ${unreadNotifs > 0 ? `
              <span style="position: absolute; top: -4px; right: -4px; background: var(--loss-red); color: white; font-size: 9px; font-weight: 800; border-radius: 10px; padding: 1px 5px; border: 1.5px solid #06150f;">
                ${unreadNotifs}
              </span>
            ` : ''}
          </button>

          <!-- Virtual Coins Badge -->
          <div style="text-align: right;">
            <span style="font-size: 10px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Game Balance</span>
            <div style="display: flex; align-items: center; gap: 4px; justify-content: flex-end; margin-top: 2px;">
              <span style="font-size: 16px;">🪙</span>
              <span id="dash-coins" style="color: var(--gold); font-weight: 800; font-size: 16px;">${formatNumber(currentUser.coinBalance)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Low Coin Warning Banner (Requirement 5) -->
    ${currentUser.coinBalance === 0 ? `
      <div class="card" style="background: linear-gradient(90deg, #3d1414, #240c0c); border: 1.5px solid var(--loss-red); padding: 12px; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="font-size: 20px;">⚠️</span>
          <strong style="color: var(--loss-red); font-size: 13px;">Your coin balance is 0.</strong>
        </div>
        <p style="color: var(--text-secondary); font-size: 11px; margin-bottom: 10px;">
          Request coins from admin to continue playing matches.
        </p>
        <button id="btn-warn-req-coins" class="btn btn-gold btn-sm" style="font-weight: 800; width: 100%;">
          REQUEST COINS FROM ADMIN
        </button>
      </div>
    ` : (currentUser.coinBalance < 1000 ? `
      <div class="card" style="background: linear-gradient(90deg, #382d0e, #211906); border: 1.5px solid var(--gold); padding: 12px; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">⚠️</span>
            <span style="color: var(--gold); font-size: 12px; font-weight: 700;">Your coin balance is low.</span>
          </div>
          <button id="btn-warn-req-coins" class="btn btn-gold btn-sm" style="padding: 4px 10px; font-size: 11px;">
            REQUEST COINS
          </button>
        </div>
      </div>
    ` : '')}

    <!-- Quick Action Navigation Row (Requirement 14) -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 14px;">
      <button id="btn-nav-invite" class="btn btn-dark btn-sm" style="padding: 8px 4px; font-size: 11px; font-weight: 700;">
        👥 INVITE PLAYER
      </button>
      <button id="btn-nav-request-coins" class="btn btn-gold btn-sm" style="padding: 8px 4px; font-size: 11px; font-weight: 800;">
        🪙 REQUEST COINS
      </button>
      <button id="btn-nav-history" class="btn btn-dark btn-sm" style="padding: 8px 4px; font-size: 11px; font-weight: 700;">
        📜 MATCH HISTORY
      </button>
    </div>

    <!-- Match Configuration Card -->
    <div class="card card-gold" style="padding: 14px; margin-bottom: 14px;">
      <!-- Mode Selection -->
      <div style="margin-bottom: 12px;">
        <label style="font-size: 11px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">Game Mode</label>
        <div style="display: flex; gap: 8px; margin-top: 6px;">
          ${gameConfig.mode1v1 !== false ? `
            <button id="mode-1v1" class="btn ${selectedMode === '1v1' ? 'btn-gold' : 'btn-dark'}" style="flex: 1; padding: 8px 0; font-size: 12px; font-weight: 800;">
              1 VS 1 SOLO
            </button>
          ` : ''}
          ${gameConfig.mode2v2 !== false ? `
            <button id="mode-2v2" class="btn ${selectedMode === '2v2' ? 'btn-gold' : 'btn-dark'}" style="flex: 1; padding: 8px 0; font-size: 12px; font-weight: 800;">
              2 VS 2 TEAMS
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Entry Amount Tiers -->
      <div style="margin-bottom: 12px;">
        <label style="font-size: 11px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">Entry Coins</label>
        <div id="entry-chips" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
          ${(gameConfig.entryAmounts || [1000, 2000, 5000, 10000]).map(amt => `
            <div class="chip ${!isCustom && selectedEntry === amt ? 'active' : ''}" data-entry="${amt}" style="flex: 1; min-width: 60px; text-align: center; justify-content: center;">
              ${formatNumber(amt)}
            </div>
          `).join('')}
          ${gameConfig.customEntryEnabled !== false ? `
            <div class="chip ${isCustom ? 'active' : ''}" id="chip-custom-entry" style="flex: 1; min-width: 70px; text-align: center; justify-content: center;">
              ${isCustom ? formatNumber(selectedEntry) : 'Custom...'}
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Match Duration -->
      <div style="margin-bottom: 16px;">
        <label style="font-size: 11px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">Match Time Limit</label>
        <div id="duration-chips" style="display: flex; gap: 8px; margin-top: 6px;">
          ${(gameConfig.durations || [1, 2, 5]).map(dur => `
            <div class="chip ${selectedDuration === dur ? 'active' : ''}" data-dur="${dur}" style="flex: 1; text-align: center; justify-content: center;">${dur} Min</div>
          `).join('')}
        </div>
      </div>

      <!-- FIND MATCH Button (Requirement 10 & 19) -->
      <button id="btn-play-now" class="btn btn-gold btn-block" style="height: 48px; font-size: 15px; font-weight: 800; box-shadow: 0 4px 16px rgba(255,213,79,0.35);">
        ⚡ FIND MATCH (${formatNumber(selectedEntry)} COINS)
      </button>
    </div>

    <!-- Incoming Invitations Banner -->
    ${invites.length > 0 ? `
      <div class="card card-gold" style="padding: 12px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="color: var(--gold); font-size: 12px;">CHALLENGE RECEIVED!</strong>
          <span style="font-size: 10px; color: var(--emerald);">New</span>
        </div>
        <p style="font-size: 12px; margin-bottom: 8px;">
          <strong>${invites[0].senderUsername}</strong> invited you to <strong>${invites[0].mode}</strong> (${formatNumber(invites[0].entryAmount)} Coins)
        </p>
        <div style="display: flex; gap: 8px;">
          <button id="btn-decline-invite" class="btn btn-dark btn-sm" style="flex: 1;">Decline</button>
          <button id="btn-accept-invite" class="btn btn-gold btn-sm" style="flex: 1;">Accept & Play</button>
        </div>
      </div>
    ` : ''}

    <!-- Quick Room Options -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
      <button id="btn-create-room" class="btn btn-dark" style="font-size: 12px; padding: 10px 0;">
        ➕ Create Private Room
      </button>
      <button id="btn-join-room" class="btn btn-dark" style="font-size: 12px; padding: 10px 0;">
        🔑 Join with Code
      </button>
    </div>

    <!-- Recent Match History Preview -->
    <div class="card" style="padding: 12px 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="font-size: 13px; font-weight: 800; color: var(--gold);">RECENT MATCHES</h3>
        <a href="#" id="link-all-matches" style="color: var(--text-secondary); font-size: 11px; text-decoration: none;">View All →</a>
      </div>
      <div id="recent-matches-list"></div>
    </div>
  `;

  // Notification Bell
  document.getElementById("btn-user-notifications")?.addEventListener("click", () => {
    showNotificationsModal();
  });

  // Copy Player ID
  document.getElementById("btn-copy-id").onclick = () => {
    navigator.clipboard.writeText(currentUser.playerId).then(() => {
      showToast("Player ID copied: " + currentUser.playerId);
    }).catch(() => {
      showToast("Player ID: " + currentUser.playerId);
    });
  };

  // Warning Banner button
  document.getElementById("btn-warn-req-coins")?.addEventListener("click", () => {
    showRequestCoinsDialog();
  });

  // Action Bar buttons
  document.getElementById("btn-nav-invite").onclick = () => showInvitePlayerDialog();
  document.getElementById("btn-nav-request-coins").onclick = () => showRequestCoinsDialog();
  document.getElementById("btn-nav-history").onclick = () => navigateTo("/history");
  document.getElementById("link-all-matches").onclick = (e) => { e.preventDefault(); navigateTo("/history"); };

  // Mode Toggles
  const btnMode1v1 = document.getElementById("mode-1v1");
  if (btnMode1v1) {
    btnMode1v1.onclick = () => {
      selectedMode = "1v1";
      renderHomeView();
    };
  }
  const btnMode2v2 = document.getElementById("mode-2v2");
  if (btnMode2v2) {
    btnMode2v2.onclick = () => {
      selectedMode = "2v2";
      renderHomeView();
    };
  }

  // Entry Chips
  document.querySelectorAll("#entry-chips .chip[data-entry]").forEach(chip => {
    chip.onclick = () => {
      isCustom = false;
      document.querySelectorAll("#entry-chips .chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      selectedEntry = parseInt(chip.getAttribute("data-entry"));
      document.getElementById("btn-play-now").textContent = `PLAY NOW (${formatNumber(selectedEntry)} COINS)`;
    };
  });

  // Custom Entry Chip
  const chipCustom = document.getElementById("chip-custom-entry");
  if (chipCustom) {
    chipCustom.onclick = () => {
      const inputVal = prompt(`Enter custom entry amount (${gameConfig.customMin || 500} - ${formatNumber(gameConfig.customMax || 500000)} Coins):`, selectedEntry);
      if (inputVal !== null) {
        const num = parseInt(inputVal, 10);
        const min = gameConfig.customMin || 500;
        const max = gameConfig.customMax || 500000;
        if (isNaN(num) || num < min || num > max) {
          showToast(`Please enter an amount between ${formatNumber(min)} and ${formatNumber(max)} coins.`);
          return;
        }
        isCustom = true;
        selectedEntry = num;
        document.querySelectorAll("#entry-chips .chip").forEach(c => c.classList.remove("active"));
        chipCustom.classList.add("active");
        chipCustom.textContent = formatNumber(num);
        document.getElementById("btn-play-now").textContent = `PLAY NOW (${formatNumber(selectedEntry)} COINS)`;
      }
    };
  }

  // Duration Chips
  document.querySelectorAll("#duration-chips .chip").forEach(chip => {
    chip.onclick = () => {
      document.querySelectorAll("#duration-chips .chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      selectedDuration = parseInt(chip.getAttribute("data-dur"));
    };
  });

  // Find Match (Requirement 10 & 19)
  document.getElementById("btn-play-now").onclick = () => {
    if (currentUser.coinBalance < selectedEntry) {
      showToast("Insufficient coins! Required: " + formatNumber(selectedEntry));
      showRequestCoinsDialog();
      return;
    }
    startMatchmakingFlow(selectedMode, selectedEntry, selectedDuration);
  };

  // Room Creation / Join
  document.getElementById("btn-create-room").onclick = () => createNewRoom(selectedMode, selectedEntry, selectedDuration);
  document.getElementById("btn-join-room").onclick = () => showJoinRoomDialog();

  // Invite actions
  if (invites.length > 0) {
    document.getElementById("btn-decline-invite").onclick = () => {
      invites[0].status = "DECLINED";
      const allInvs = getStorage("invitations", []);
      const idx = allInvs.findIndex(i => i.invitationId === invites[0].invitationId);
      if (idx >= 0) {
        allInvs[idx].status = "DECLINED";
        setStorage("invitations", allInvs);
      }
      recordUserActivity(currentUser.id, currentUser.playerId, currentUser.username, "DECLINE_INVITE", invites[0].roomId, `Declined challenge from ${invites[0].senderUsername}`);
      renderHomeView();
      showToast("Invitation declined");
    };
    document.getElementById("btn-accept-invite").onclick = () => {
      invites[0].status = "ACCEPTED";
      const allInvs = getStorage("invitations", []);
      const idx = allInvs.findIndex(i => i.invitationId === invites[0].invitationId);
      if (idx >= 0) {
        allInvs[idx].status = "ACCEPTED";
        setStorage("invitations", allInvs);
      }
      recordUserActivity(currentUser.id, currentUser.playerId, currentUser.username, "ACCEPT_INVITE", invites[0].roomId, `Accepted challenge from ${invites[0].senderUsername}`);
      createNewRoom(invites[0].mode, invites[0].entryAmount, invites[0].durationMinutes, invites[0].roomId);
    };
  }

  // Populate recent matches
  const userMatches = getStorage("matches", []).filter(m => m.playersJson.includes(currentUser.username)).slice(0, 3);
  const listEl = document.getElementById("recent-matches-list");
  if (userMatches.length === 0) {
    listEl.innerHTML = `<p style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 12px 0;">No matches played yet. Tap PLAY NOW to start!</p>`;
  } else {
    listEl.innerHTML = userMatches.map(m => {
      const isWin = m.winnerPlayerId === currentUser.playerId;
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div>
            <p style="font-weight: 700; font-size: 12px;">${m.mode} • ${m.roomId}</p>
            <p style="color: var(--text-muted); font-size: 10px;">${new Date(m.endedAt).toLocaleTimeString()}</p>
          </div>
          <span style="font-weight: 800; font-size: 12px; color: ${isWin ? 'var(--emerald)' : 'var(--loss-red)'};">
            ${isWin ? '+' + formatNumber(m.coinsWonLost) : '-' + formatNumber(m.entryAmount)} Coins
          </span>
        </div>
      `;
    }).join('');
  }
}

// ==========================================
// USER COIN REQUEST SYSTEM (Requirement 3)
// ==========================================
function showRequestCoinsDialog() {
  const requests = getStorage("coin_requests", []).filter(r => r.userId === currentUser.id || r.playerId === currentUser.playerId);

  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card" style="max-height: 90vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 class="gold-title" style="font-size: 16px;">Request Virtual Coins</h3>
        <button id="req-close-x" style="background: none; border: none; color: var(--text-secondary); font-size: 16px; cursor: pointer;">✕</button>
      </div>

      <div style="background: #091711; padding: 10px 12px; border-radius: 10px; margin-bottom: 14px; font-size: 13px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: var(--text-secondary);">Current Balance:</span>
          <strong style="color: var(--gold);">${formatNumber(currentUser.coinBalance)} Coins</strong>
        </div>
        <p style="color: var(--text-muted); font-size: 11px;">
          Send an official coin request directly to the administrator.
        </p>
      </div>

      <form id="form-user-coin-req">
        <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">
          REQUESTED COIN AMOUNT
        </label>
        <input type="number" id="user-req-amount" class="input-field" placeholder="e.g. 10000" min="1000" max="100000" value="10000" required />

        <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">
          REASON / MESSAGE
        </label>
        <textarea id="user-req-reason" class="input-field" rows="2" placeholder="e.g. I want to play more matches." style="resize: none;" required>I want to play more matches.</textarea>

        <button type="submit" class="btn btn-gold btn-block" style="height: 44px; font-size: 13px; font-weight: 800; margin-bottom: 16px;">
          SEND REQUEST
        </button>
      </form>

      <!-- User's Request History List -->
      <div style="border-top: 1px solid var(--bg-card-border); padding-top: 12px;">
        <h4 style="font-size: 12px; font-weight: 800; color: var(--gold); margin-bottom: 8px;">MY REQUEST HISTORY</h4>
        ${requests.length === 0 ? `
          <p style="color: var(--text-muted); font-size: 11px; text-align: center; padding: 8px 0;">No previous requests found.</p>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${requests.map(r => `
              <div style="background: #0c1c14; padding: 8px 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                <div>
                  <strong style="color: var(--text-primary);">+${formatNumber(r.requestedAmount)} Coins</strong>
                  <p style="color: var(--text-muted); font-size: 10px;">${new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <span style="padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 800; background: ${r.status === 'APPROVED' ? '#143c22' : (r.status === 'REJECTED' ? '#3c1414' : '#47360e')}; color: ${r.status === 'APPROVED' ? 'var(--emerald)' : (r.status === 'REJECTED' ? 'var(--loss-red)' : 'var(--gold)')};">
                  ${r.status}
                </span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
  document.getElementById("app-container").appendChild(modal);

  modal.querySelector("#req-close-x").onclick = () => modal.remove();

  modal.querySelector("#form-user-coin-req").onsubmit = (e) => {
    e.preventDefault();
    const amount = parseInt(modal.querySelector("#user-req-amount").value) || 0;
    const reason = modal.querySelector("#user-req-reason").value.trim();

    if (amount <= 0) return showToast("Please enter a valid coin amount");

    const allRequests = getStorage("coin_requests", []);
    const newReq = {
      requestId: "CRQ-" + Math.floor(10000 + Math.random() * 90000),
      userId: currentUser.id,
      username: currentUser.username,
      playerId: currentUser.playerId,
      currentBalance: currentUser.coinBalance,
      requestedAmount: amount,
      reason: reason,
      status: "PENDING",
      createdAt: Date.now()
    };

    allRequests.unshift(newReq);
    setStorage("coin_requests", allRequests);

    recordUserActivity(currentUser.id, currentUser.playerId, currentUser.username, "COIN_REQUEST", newReq.requestId, `Requested ${formatNumber(amount)} coins`);

    modal.remove();
    showToast("Coin request sent to admin.");
    renderHomeView();
  };
}

// ==========================================
// PRE-MATCH CONFIRMATION & ROOM MANAGEMENT
// ==========================================
function showConfirmEntryDialog(entry, mode, duration) {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card">
      <h3 class="gold-title" style="margin-bottom: 12px;">Confirm Match Entry</h3>
      <div style="background: #091711; padding: 12px; border-radius: 12px; margin-bottom: 16px;">
        <p style="font-size: 14px; font-weight: 700; margin-bottom: 4px;">Entry Fee: ${formatNumber(entry)} Coins</p>
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 4px;">Current Balance: ${formatNumber(currentUser.coinBalance)} Coins</p>
        <p style="color: var(--emerald); font-size: 13px; font-weight: 700;">Balance After Entry: ${formatNumber(currentUser.coinBalance - entry)} Coins</p>
        <p style="color: var(--text-muted); font-size: 11px; margin-top: 6px;">Mode: ${mode} • Duration: ${duration} Minutes</p>
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="conf-cancel" class="btn btn-dark">Cancel</button>
        <button id="conf-ok" class="btn btn-gold">Confirm & Start</button>
      </div>
    </div>
  `;
  document.getElementById("app-container").appendChild(modal);

  modal.querySelector("#conf-cancel").onclick = () => modal.remove();
  modal.querySelector("#conf-ok").onclick = () => {
    modal.remove();
    createNewRoom(mode, entry, duration);
  };
}

// ==========================================
// FULL MATCHMAKING & COUNTDOWN FLOW (Requirement 19)
// ==========================================
function startMatchmakingFlow(mode, entry, duration) {
  const users = getStorage("users", []);
  const u = users.find(x => x.id === currentUser.id);
  if (!u || u.coinBalance < entry) {
    showToast("Insufficient coin balance for this match");
    showRequestCoinsDialog();
    return;
  }

  // Deduct entry coins atomically
  const prevBal = u.coinBalance;
  u.coinBalance -= entry;
  setStorage("users", users);
  currentUser.coinBalance = u.coinBalance;
  setStorage("current_user", currentUser);

  const roomId = "ROOM #" + Math.random().toString(36).substring(2, 8).toUpperCase();
  recordTransaction(u.id, u.playerId, "MATCH_ENTRY", entry, prevBal, u.coinBalance, `Entry fee for ${roomId}`);

  // Create room in database
  const allRooms = getStorage("rooms", []);
  allRooms.unshift({
    roomId: roomId,
    hostPlayerId: currentUser.playerId,
    hostUsername: currentUser.username,
    mode: mode,
    entryAmount: entry,
    durationMinutes: duration,
    status: "WAITING",
    createdAt: Date.now()
  });
  setStorage("rooms", allRooms);

  recordUserActivity(currentUser.id, currentUser.playerId, currentUser.username, "CREATE_ROOM", roomId, `Created ${mode} room with entry ${formatNumber(entry)} coins`);

  const opponentNames = ["Alex (Pool Pro)", "Vikram (Master)", "Sam (Shark)", "Leo (Ace)", "Elena (Cueist)", "Marcus (Trickshot)"];
  const opponentName = opponentNames[Math.floor(Math.random() * opponentNames.length)];
  const opponentId = "8BP-" + Math.floor(100000 + Math.random() * 900000);

  currentRoom = {
    roomId: roomId,
    hostPlayerId: currentUser.playerId,
    hostUsername: currentUser.username,
    mode: mode,
    entryAmount: entry,
    durationMinutes: duration,
    players: mode === "2v2" ? [
      { id: currentUser.playerId, name: currentUser.username, avatar: currentUser.avatar, team: 1 },
      { id: "8BP-BOT-A2", name: "Alex (P2)", avatar: "avatar_2", team: 1 },
      { id: opponentId, name: opponentName, avatar: "avatar_3", team: 2 },
      { id: "8BP-BOT-B2", name: "Sam (P4)", avatar: "avatar_4", team: 2 }
    ] : [
      { id: currentUser.playerId, name: currentUser.username, avatar: currentUser.avatar, team: 1 },
      { id: opponentId, name: opponentName, avatar: "avatar_5", team: 2 }
    ]
  };

  // Matchmaking & 3-2-1 Countdown Modal
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card" style="text-align: center; border: 2px solid var(--gold); max-width: 360px;">
      <div id="mm-searching" style="padding: 16px 0;">
        <div class="splash-spinner" style="margin: 0 auto 16px; width: 40px; height: 40px; border-width: 4px;"></div>
        <h3 class="gold-title" style="font-size: 18px; margin-bottom: 6px;">FINDING OPPONENT...</h3>
        <p style="color: var(--text-secondary); font-size: 12px;">Matching with online player in ${mode} Arena</p>
        <p style="color: var(--gold); font-size: 13px; font-weight: 700; margin-top: 8px;">🪙 ${formatNumber(entry)} Coins Entry</p>
      </div>

      <div id="mm-found" style="display: none; padding: 12px 0;">
        <div style="font-size: 36px; margin-bottom: 8px;">🎯</div>
        <h3 class="gold-title" style="font-size: 18px; margin-bottom: 4px;">OPPONENT FOUND!</h3>
        <p style="font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 2px;">${opponentName}</p>
        <p style="color: var(--text-secondary); font-size: 11px; margin-bottom: 16px;">${opponentId} • ${roomId}</p>
        
        <div id="mm-countdown" style="font-size: 48px; font-weight: 900; color: var(--gold); font-variant-numeric: tabular-nums;">
          3
        </div>
      </div>
    </div>
  `;
  document.getElementById("app-container").appendChild(modal);

  setTimeout(() => {
    const searching = modal.querySelector("#mm-searching");
    const found = modal.querySelector("#mm-found");
    const countdown = modal.querySelector("#mm-countdown");
    if (!searching || !found) return;

    searching.style.display = "none";
    found.style.display = "block";

    let count = 3;
    const timer = setInterval(() => {
      count--;
      if (count === 2) {
        countdown.textContent = "2";
      } else if (count === 1) {
        countdown.textContent = "1";
      } else if (count === 0) {
        countdown.textContent = "BREAK! 🎱";
        clearInterval(timer);
        setTimeout(() => {
          modal.remove();
          navigateTo("/game");
        }, 500);
      }
    }, 700);
  }, 1000);
}

function createNewRoom(mode, entry, duration, presetRoomId) {
  // Deduct entry coins atomically
  const users = getStorage("users", []);
  const u = users.find(x => x.id === currentUser.id);
  if (!u || u.coinBalance < entry) {
    showToast("Insufficient coin balance for this match");
    return;
  }

  const prevBal = u.coinBalance;
  u.coinBalance -= entry;
  setStorage("users", users);
  currentUser.coinBalance = u.coinBalance;
  setStorage("current_user", currentUser);

  const roomId = presetRoomId || "ROOM #" + Math.random().toString(36).substring(2, 8).toUpperCase();
  recordTransaction(u.id, u.playerId, "MATCH_ENTRY", entry, prevBal, u.coinBalance, `Entry fee for ${roomId}`);

  // Save room to rooms table in database
  const allRooms = getStorage("rooms", []);
  const existingR = allRooms.find(r => r.roomId === roomId);
  if (!existingR) {
    allRooms.unshift({
      roomId: roomId,
      hostPlayerId: currentUser.playerId,
      hostUsername: currentUser.username,
      mode: mode,
      entryAmount: entry,
      durationMinutes: duration,
      status: "WAITING",
      createdAt: Date.now()
    });
    setStorage("rooms", allRooms);
  }

  recordUserActivity(currentUser.id, currentUser.playerId, currentUser.username, "CREATE_ROOM", roomId, `Created ${mode} room with entry ${formatNumber(entry)} coins`);

  currentRoom = {
    roomId: roomId,
    hostPlayerId: currentUser.playerId,
    hostUsername: currentUser.username,
    mode: mode,
    entryAmount: entry,
    durationMinutes: duration,
    players: mode === "2v2" ? [
      { id: currentUser.playerId, name: currentUser.username, avatar: currentUser.avatar, team: 1 },
      { id: "8BP-BOT-A2", name: "Alex (P2)", avatar: "avatar_2", team: 1 },
      { id: "8BP-BOT-B1", name: "Sam (P3)", avatar: "avatar_3", team: 2 },
      { id: "8BP-BOT-B2", name: "Leo (P4)", avatar: "avatar_4", team: 2 }
    ] : [
      { id: currentUser.playerId, name: currentUser.username, avatar: currentUser.avatar, team: 1 },
      { id: "8BP-OPP-99", name: "Challenger", avatar: "avatar_5", team: 2 }
    ]
  };
  navigateTo("/room");
}

function renderRoomView() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  container.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
      <button id="btn-room-back" class="btn btn-dark btn-sm">← Back</button>
      <h3 class="gold-title" style="font-size: 16px;">MATCH LOBBY</h3>
    </div>

    <div class="card card-gold" style="text-align: center; padding: 24px 16px;">
      <h2 class="gold-title" style="font-size: 22px; margin-bottom: 6px;">${currentRoom.roomId}</h2>
      <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 18px;">
        🪙 Entry: <strong>${formatNumber(currentRoom.entryAmount)} Coins</strong> &nbsp;•&nbsp; ⏱️ <strong>${currentRoom.durationMinutes} Min</strong>
      </p>

      <p style="color: var(--text-muted); font-size: 12px; font-weight: 700; margin-bottom: 14px;">
        LINEUP (${currentRoom.mode === '2v2' ? '2 VS 2 TEAMS' : '1 VS 1 HEAD TO HEAD'})
      </p>

      <div style="display: flex; justify-content: space-around; align-items: center; margin-bottom: 24px;">
        ${currentRoom.players.map(p => `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <div class="avatar avatar-lg" style="background: ${getAvatarGradient(p.name)};">
              ${p.name.slice(0, 2).toUpperCase()}
            </div>
            <p style="font-weight: 700; font-size: 13px;">${p.name}</p>
            <span style="font-size: 10px; color: var(--gold);">${p.team === 1 ? 'Team 1' : 'Team 2'}</span>
          </div>
        `).join('<span style="font-weight: 800; color: var(--gold); font-size: 18px;">VS</span>')}
      </div>

      <button id="btn-start-game" class="btn btn-gold btn-block" style="height: 48px; font-size: 15px; font-weight: 800;">
        ENTER TABLE & BREAK
      </button>
    </div>
  `;

  document.getElementById("btn-room-back").onclick = () => {
    currentRoom = null;
    navigateTo("/play");
  };

  document.getElementById("btn-start-game").onclick = () => {
    navigateTo("/game");
  };
}

function showInvitePlayerDialog() {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card">
      <h3 class="gold-title" style="margin-bottom: 8px;">Invite Player by ID</h3>
      <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 12px;">Enter another player's permanent Player ID to challenge them.</p>
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <input type="text" id="inv-player-id" class="input-field" placeholder="e.g. 8BP-882190" style="margin-bottom: 0;" />
        <button id="inv-search-btn" class="btn btn-gold btn-sm">Search</button>
      </div>
      <div id="inv-player-card" style="display: none; margin-bottom: 16px;"></div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="inv-close" class="btn btn-dark">Close</button>
        <button id="inv-send-btn" class="btn btn-gold" disabled>Send Invite</button>
      </div>
    </div>
  `;
  document.getElementById("app-container").appendChild(modal);

  let targetUser = null;
  modal.querySelector("#inv-close").onclick = () => modal.remove();

  modal.querySelector("#inv-search-btn").onclick = () => {
    const id = modal.querySelector("#inv-player-id").value.trim().toUpperCase();
    const users = getStorage("users", []);
    targetUser = users.find(u => u.playerId.toUpperCase() === id && u.id !== currentUser.id);

    const card = modal.querySelector("#inv-player-card");
    if (targetUser) {
      card.style.display = "block";
      card.innerHTML = `
        <div style="background: #163e27; padding: 10px; border-radius: 12px; display: flex; align-items: center; gap: 10px;">
          <div class="avatar avatar-sm" style="background: ${getAvatarGradient(targetUser.username)};">
            ${targetUser.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p style="font-weight: 700; font-size: 13px;">${targetUser.username}</p>
            <p style="color: var(--text-muted); font-size: 11px;">${targetUser.playerId} • ${targetUser.isOnline ? '🟢 Online' : '⚪ Offline'}</p>
          </div>
        </div>
      `;
      modal.querySelector("#inv-send-btn").disabled = false;
    } else {
      card.style.display = "block";
      card.innerHTML = `<p style="color: var(--loss-red); font-size: 12px;">No other player found with ID '${id}'</p>`;
      modal.querySelector("#inv-send-btn").disabled = true;
    }
  };

  modal.querySelector("#inv-send-btn").onclick = () => {
    if (!targetUser) return;
    const invites = getStorage("invitations", []);
    const invId = "INV-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    invites.push({
      invitationId: invId,
      senderPlayerId: currentUser.playerId,
      senderUsername: currentUser.username,
      receiverPlayerId: targetUser.playerId,
      roomId: "ROOM #" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      mode: selectedMode,
      entryAmount: selectedEntry,
      durationMinutes: selectedDuration,
      status: "PENDING",
      createdAt: Date.now()
    });
    setStorage("invitations", invites);

    recordUserActivity(currentUser.id, currentUser.playerId, currentUser.username, "SEND_INVITE", targetUser.playerId, `Challenged ${targetUser.username}`);
    createNotification(targetUser.id, targetUser.playerId, "INVITATION", "Match Challenge! 🎱", `${currentUser.username} challenged you to a ${selectedMode} match (${formatNumber(selectedEntry)} coins)!`);

    modal.remove();
    showToast("Invitation sent to " + targetUser.username + "!");
  };
}

function showJoinRoomDialog() {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card">
      <h3 class="gold-title" style="margin-bottom: 8px;">Join Match Room</h3>
      <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 12px;">Enter 6-character room code or full Room ID.</p>
      <input type="text" id="join-room-code" class="input-field" placeholder="e.g. ROOM #A82F91" />
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="join-cancel" class="btn btn-dark">Cancel</button>
        <button id="join-enter" class="btn btn-gold">Enter Room</button>
      </div>
    </div>
  `;
  document.getElementById("app-container").appendChild(modal);

  modal.querySelector("#join-cancel").onclick = () => modal.remove();
  modal.querySelector("#join-enter").onclick = () => {
    let code = modal.querySelector("#join-room-code").value.trim().toUpperCase();
    if (!code.startsWith("ROOM")) code = "ROOM #" + code.replace("#", "");
    modal.remove();
    createNewRoom("1v1", 2000, 2, code);
  };
}

// ==========================================
// LEADERBOARD, MATCH HISTORY, PROFILE VIEWS
// ==========================================
function renderLeaderboardView() {
  const container = document.getElementById("main-view");
  container.className = "view-content";

  const users = getStorage("users", []).filter(u => u.role !== "ADMIN");
  users.sort((a, b) => (b.coinBalance || 0) - (a.coinBalance || 0));

  container.innerHTML = `
    <h2 class="gold-title" style="font-size: 20px; margin-bottom: 4px;">GLOBAL LEADERBOARD</h2>
    <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 14px;">Rankings based on active virtual coin ledger</p>

    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${users.map((u, idx) => `
        <div class="card ${u.id === currentUser.id ? 'card-gold' : ''}" style="padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-weight: 800; font-size: 14px; width: 22px; color: ${idx === 0 ? 'var(--gold)' : (idx === 1 ? '#d1d5db' : (idx === 2 ? '#d97706' : 'var(--text-muted)'))};">
              #${idx + 1}
            </span>
            <div class="avatar avatar-sm" style="background: ${getAvatarGradient(u.username)};">
              ${u.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p style="font-weight: 800; font-size: 13px;">${u.username} ${u.id === currentUser.id ? '(You)' : ''}</p>
              <p style="color: var(--text-muted); font-size: 10px;">${u.playerId} • ${u.matchesWon || 0} Wins</p>
            </div>
          </div>
          <span style="font-weight: 800; font-size: 13px; color: var(--gold);">
            ${formatNumber(u.coinBalance)} Coins
          </span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderHistoryView() {
  const container = document.getElementById("main-view");
  container.className = "view-content";

  const matches = getStorage("matches", []).filter(m => m.playersJson.includes(currentUser.username));

  container.innerHTML = `
    <h2 class="gold-title" style="font-size: 20px; margin-bottom: 4px;">MATCH HISTORY</h2>
    <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 14px;">Your completed 8 Ball Pool match archives</p>

    ${matches.length === 0 ? `
      <div class="card" style="text-align: center; padding: 32px 16px;">
        <p style="font-size: 28px; margin-bottom: 8px;">🎱</p>
        <h4 style="font-size: 15px; font-weight: 700; color: var(--gold); margin-bottom: 4px;">No Matches Played Yet</h4>
        <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 16px;">Jump onto the table to log your first match victory!</p>
        <button id="btn-hist-play" class="btn btn-gold">PLAY NOW</button>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${matches.map(m => {
          const isWin = m.winnerPlayerId === currentUser.playerId;
          return `
            <div class="card" style="padding: 12px 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-weight: 800; font-size: 13px; color: var(--gold);">${m.roomId}</span>
                <span style="padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 800; background: ${isWin ? '#143c22' : '#3c1414'}; color: ${isWin ? 'var(--emerald)' : 'var(--loss-red)'};">
                  ${isWin ? 'VICTORY' : 'DEFEAT'}
                </span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;">Mode: ${m.mode} • ${m.playersJson}</p>
              <div style="display: flex; justify-content: space-between; font-size: 11px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px;">
                <span style="color: var(--text-muted);">${new Date(m.endedAt).toLocaleDateString()} ${new Date(m.endedAt).toLocaleTimeString()}</span>
                <strong style="color: ${isWin ? 'var(--emerald)' : 'var(--loss-red)'}; font-size: 12px;">
                  ${isWin ? '+' + formatNumber(m.coinsWonLost) : '-' + formatNumber(m.entryAmount)} Coins
                </strong>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;

  document.getElementById("btn-hist-play")?.addEventListener("click", () => {
    navigateTo("/play");
  });
}

function renderProfileView() {
  const container = document.getElementById("main-view");
  container.className = "view-content";

  const winRate = currentUser.matchesPlayed > 0 
    ? Math.round((currentUser.matchesWon / currentUser.matchesPlayed) * 100) 
    : 0;

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div class="avatar avatar-lg" style="background: ${getAvatarGradient(currentUser.username)}; margin: 0 auto 10px; width: 64px; height: 64px; font-size: 22px;">
        ${currentUser.username.slice(0, 2).toUpperCase()}
      </div>
      <h2 style="font-weight: 800; font-size: 18px;">${currentUser.username}</h2>
      <p style="color: var(--gold); font-size: 13px; font-weight: 700; margin-top: 2px;">${currentUser.playerId}</p>
    </div>

    <!-- Career Statistics -->
    <div class="card card-gold" style="padding: 14px; margin-bottom: 14px;">
      <h3 style="font-size: 13px; font-weight: 800; color: var(--gold); margin-bottom: 12px;">CAREER STATISTICS</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background: #091711; padding: 10px; border-radius: 8px;">
          <span style="font-size: 10px; color: var(--text-muted);">COIN BALANCE</span>
          <p style="font-size: 16px; font-weight: 800; color: var(--gold); margin-top: 2px;">${formatNumber(currentUser.coinBalance)}</p>
        </div>
        <div style="background: #091711; padding: 10px; border-radius: 8px;">
          <span style="font-size: 10px; color: var(--text-muted);">MATCHES PLAYED</span>
          <p style="font-size: 16px; font-weight: 800; margin-top: 2px;">${currentUser.matchesPlayed || 0}</p>
        </div>
        <div style="background: #091711; padding: 10px; border-radius: 8px;">
          <span style="font-size: 10px; color: var(--text-muted);">VICTORIES</span>
          <p style="font-size: 16px; font-weight: 800; color: var(--emerald); margin-top: 2px;">${currentUser.matchesWon || 0}</p>
        </div>
        <div style="background: #091711; padding: 10px; border-radius: 8px;">
          <span style="font-size: 10px; color: var(--text-muted);">WIN RATE</span>
          <p style="font-size: 16px; font-weight: 800; color: var(--gold); margin-top: 2px;">${winRate}%</p>
        </div>
      </div>
    </div>

    <button id="btn-prof-req-coins" class="btn btn-gold btn-block" style="margin-bottom: 10px; height: 46px; font-size: 14px; font-weight: 800;">
      🪙 REQUEST COINS
    </button>

    <button id="btn-user-logout" class="btn btn-dark btn-block" style="color: var(--loss-red); height: 46px; font-size: 14px;">
      Logout ⎋
    </button>
  `;

  document.getElementById("btn-prof-req-coins").onclick = () => showRequestCoinsDialog();

  document.getElementById("btn-user-logout").onclick = () => {
    recordUserActivity(currentUser.id, currentUser.playerId, currentUser.username, "USER_LOGOUT", "", "User logged out");
    const users = getStorage("users", []);
    const u = users.find(x => x.id === currentUser.id);
    if (u) {
      u.isOnline = false;
      setStorage("users", users);
    }
    currentUser = null;
    setStorage("current_user", null);
    showToast("Logged out successfully");
    navigateTo("/login");
  };
}

// ==========================================
// IN-APP NOTIFICATIONS MODAL (Requirement 18)
// ==========================================
function showNotificationsModal() {
  const notifs = getUserNotifications(currentUser.id, currentUser.playerId);
  markAllNotificationsRead(currentUser.id, currentUser.playerId);

  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card" style="max-height: 85vh; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--bg-card-border); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px;">🔔</span>
          <h3 class="gold-title" style="font-size: 16px; margin: 0;">NOTIFICATIONS</h3>
        </div>
        <button id="notif-close-btn" style="background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer;">✕</button>
      </div>

      <div style="flex: 1; overflow-y: auto; max-height: 60vh;">
        ${notifs.length === 0 ? `
          <div style="text-align: center; padding: 32px 16px; color: var(--text-muted);">
            <p style="font-size: 24px; margin-bottom: 6px;">📭</p>
            <p style="font-size: 13px;">No notifications yet.</p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${notifs.map(n => `
              <div style="background: #091711; border: 1px solid rgba(255,255,255,0.08); padding: 10px 12px; border-radius: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="color: var(--gold); font-size: 12px;">${n.title || 'Notification'}</strong>
                  <span style="font-size: 9px; color: var(--text-muted);">${new Date(n.createdAt).toLocaleTimeString()}</span>
                </div>
                <p style="color: var(--text-secondary); font-size: 11px; margin: 0; line-height: 1.4;">${n.message}</p>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
  document.getElementById("app-container").appendChild(modal);
  modal.querySelector("#notif-close-btn").onclick = () => {
    modal.remove();
    renderHomeView();
  };
}

// ==========================================
// DEDICATED NOTIFICATIONS / ALERTS VIEW
// ==========================================
function renderNotificationsView() {
  const container = document.getElementById("main-view");
  container.className = "view-content";

  const notifs = getUserNotifications(currentUser.id, currentUser.playerId);
  markAllNotificationsRead(currentUser.id, currentUser.playerId);

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 20px;">🔔</span>
        <h2 class="gold-title" style="font-size: 18px; margin: 0;">ALERTS & NOTIFICATIONS</h2>
      </div>
      <button id="btn-clear-notifs" class="btn btn-dark btn-sm" style="font-size: 11px; padding: 4px 8px;">
        Mark All Read
      </button>
    </div>

    ${notifs.length === 0 ? `
      <div class="card" style="text-align: center; padding: 40px 16px;">
        <p style="font-size: 36px; margin-bottom: 8px;">📭</p>
        <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">All caught up!</h4>
        <p style="color: var(--text-secondary); font-size: 12px;">You will receive match alerts, coin updates, and invites here.</p>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${notifs.map(n => `
          <div class="card" style="padding: 12px; border-left: 3px solid var(--gold);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="color: var(--gold); font-size: 13px;">${n.title || 'Notification'}</strong>
              <span style="font-size: 10px; color: var(--text-muted);">${new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <p style="color: var(--text-secondary); font-size: 12px; margin: 0; line-height: 1.4;">${n.message}</p>
          </div>
        `).join('')}
      </div>
    `}
  `;

  const clearBtn = document.getElementById("btn-clear-notifs");
  if (clearBtn) {
    clearBtn.onclick = () => {
      markAllNotificationsRead(currentUser.id, currentUser.playerId);
      showToast("All notifications marked as read");
      renderNotificationsView();
    };
  }
}

// Kick off initialization
initPWA();
renderRoute();
