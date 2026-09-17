// ==========================================
// 8 BALL POOL - ADVANCED GAME ENGINE & PHYSICS
// Professional Horizontal Landscape Pool Game
// ==========================================

// Web Audio Procedural Sound Effects Engine (No external sound files required)
let poolAudioCtx = null;
function getPoolAudioCtx() {
  if (!poolAudioCtx) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) poolAudioCtx = new AudioContextClass();
    } catch (e) {}
  }
  if (poolAudioCtx && poolAudioCtx.state === "suspended") {
    poolAudioCtx.resume().catch(() => {});
  }
  return poolAudioCtx;
}

function playPoolSound(type, volume = 0.5) {
  try {
    const ctx = getPoolAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === "strike") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);
      gain.gain.setValueAtTime(Math.min(0.9, volume * 0.8), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "hit") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(520 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.05);
      gain.gain.setValueAtTime(Math.min(0.8, volume * 0.7), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "cushion") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.09);
      gain.gain.setValueAtTime(Math.min(0.6, volume * 0.5), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === "pocket") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);
      gain.gain.setValueAtTime(volume * 0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  } catch (e) {}
}

function renderGameView() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";
  const appContainer = document.getElementById("app-container");
  if (appContainer) appContainer.classList.add("in-game");

  // Ensure currentRoom is available
  if (!currentRoom) {
    currentRoom = getStorage("current_room", null);
  }
  if (!currentRoom) {
    currentRoom = {
      roomId: "PRACTICE-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
      hostPlayerId: currentUser ? currentUser.playerId : "8BP-104582",
      hostUsername: currentUser ? currentUser.username : "Player",
      mode: "practice",
      entryAmount: 0,
      durationMinutes: 5,
      players: [
        { id: currentUser ? currentUser.playerId : "8BP-104582", name: currentUser ? currentUser.username : "Player", avatar: "avatar_2", team: 1 },
        { id: "PRACTICE-BOT", name: "Practice Opponent", avatar: "avatar_3", team: 2 }
      ]
    };
    setStorage("current_room", currentRoom);
  }

  const p1 = currentRoom.players[0] || { name: "Player 1", avatar: "avatar_1" };
  const p2 = currentRoom.players[1] || { name: "Practice Bot", avatar: "avatar_2" };
  const is2v2 = currentRoom.mode === "2v2";
  const isPractice = currentRoom.mode === "practice";

  const p1Grad = typeof getAvatarGradient === "function" ? getAvatarGradient(p1.name) : "linear-gradient(135deg, #10b981, #047857)";
  const p2Grad = typeof getAvatarGradient === "function" ? getAvatarGradient(p2.name) : "linear-gradient(135deg, #3b82f6, #1d4ed8)";

  container.innerHTML = `
    <!-- ROTATE DEVICE NOTICE FOR NARROW PORTRAIT PHONES -->
    <div id="rotate-prompt-overlay" style="display: none; position: fixed; inset: 0; background: rgba(4, 14, 10, 0.96); z-index: 1000; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px;">
      <div class="rotate-phone-icon" style="font-size: 44px; animation: bounce 1.5s infinite;">📱</div>
      <h2 class="gold-title" style="font-size: 20px; margin-top: 16px; margin-bottom: 8px;">ROTATE TO LANDSCAPE</h2>
      <p style="color: var(--text-secondary); font-size: 13px; max-width: 320px; line-height: 1.5;">
        Please rotate your phone horizontally (landscape) for the full 8 Ball Pool experience.
      </p>
      <button id="btn-force-landscape" class="btn btn-gold btn-sm" style="margin-top: 20px; font-weight: 800; padding: 10px 20px;">
        CONTINUE IN HORIZONTAL FIT 🔄
      </button>
    </div>

    <!-- IN-GAME LANDSCAPE ARENA -->
    <div id="game-arena-wrapper" style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; position: relative;">
      
      <!-- TOP HUD: PLAYERS, SCORE & TIMERS -->
      <div id="game-top-bar" style="display: flex; justify-content: space-between; align-items: center; padding: 6px 14px; background: rgba(9, 23, 17, 0.95); border-bottom: 1.5px solid var(--bg-card-border); z-index: 10;">
        
        <!-- P1 / Team 1 HUD -->
        <div id="hud-p1" style="display: flex; align-items: center; gap: 8px; transition: all 0.3s ease;">
          <div class="avatar avatar-sm" style="background: ${p1Grad}; position: relative; border-color: var(--gold);">
            ${(p1.name || "P1").slice(0, 2).toUpperCase()}
            <div id="p1-turn-dot" style="position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; border-radius: 50%; background: var(--emerald); border: 2px solid #000;"></div>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <strong style="font-size: 13px; color: #fff;">${p1.name}</strong>
              <span id="p1-team-badge" style="font-size: 9px; padding: 1px 5px; border-radius: 6px; background: rgba(255,213,79,0.15); color: var(--gold); font-weight: 800;">
                ${isPractice ? 'SOLO' : (is2v2 ? 'TEAM 1' : 'P1')}
              </span>
            </div>
            <p id="p1-group" style="font-size: 10px; color: var(--gold); font-weight: 800; letter-spacing: 0.5px; margin: 0;">OPEN TABLE</p>
          </div>
        </div>

        <!-- CENTER MATCH STATUS & TURN BANNER -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <div id="turn-banner" style="background: #144026; border: 1.5px solid var(--gold); padding: 3px 14px; border-radius: 14px; font-size: 11px; font-weight: 800; color: var(--gold); letter-spacing: 0.8px; box-shadow: 0 0 10px rgba(255,213,79,0.25);">
            ${isPractice ? 'PRACTICE MODE • YOUR TURN' : 'YOUR TURN'}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 1px;">
            <span id="shot-result-pill" style="display: none; padding: 1px 8px; border-radius: 8px; font-size: 10px; font-weight: 800;"></span>
            <div id="match-timer-badge" style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--gold); font-weight: 800;">
              <span>⏱️</span>
              <span id="game-timer" style="font-variant-numeric: tabular-nums;">05:00</span>
            </div>
          </div>
        </div>

        <!-- P2 / Team 2 HUD -->
        <div id="hud-p2" style="display: flex; align-items: center; gap: 8px; opacity: 0.5; transition: all 0.3s ease; text-align: right;">
          <div>
            <div style="display: flex; align-items: center; gap: 6px; justify-content: flex-end;">
              <span id="p2-team-badge" style="font-size: 9px; padding: 1px 5px; border-radius: 6px; background: rgba(255,255,255,0.1); color: var(--text-secondary); font-weight: 800;">
                ${isPractice ? 'PRACTICE' : (is2v2 ? 'TEAM 2' : 'P2')}
              </span>
              <strong style="font-size: 13px; color: #fff;">${p2.name}</strong>
            </div>
            <p id="p2-group" style="font-size: 10px; color: var(--gold); font-weight: 800; letter-spacing: 0.5px; margin: 0;">OPEN TABLE</p>
          </div>
          <div class="avatar avatar-sm" style="background: ${p2Grad}; position: relative; border-color: var(--bg-card-border);">
            ${(p2.name || "P2").slice(0, 2).toUpperCase()}
            <div id="p2-turn-dot" style="position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; border-radius: 50%; background: #6b7280; border: 2px solid #000;"></div>
          </div>
        </div>

      </div>

      <!-- MAIN HORIZONTAL POOL TABLE & CONTROLS -->
      <div id="table-canvas-container" style="flex: 1; display: flex; align-items: center; justify-content: center; position: relative; padding: 6px 12px; gap: 12px; min-height: 0;">
        
        <!-- Table Canvas Wrapper (Maintains Strict 2:1 Landscape Aspect Ratio) -->
        <div id="pool-canvas-wrapper" style="position: relative; max-width: 100%; max-height: calc(100vh - 116px); aspect-ratio: 2 / 1; display: flex; align-items: center; justify-content: center; flex: 1;">
          <canvas id="pool-canvas" width="840" height="420" style="width: 100%; height: 100%; display: block; border-radius: 14px; box-shadow: 0 12px 36px rgba(0,0,0,0.9); touch-action: none; cursor: crosshair;"></canvas>
        </div>

        <!-- Integrated Power Meter Column -->
        <div id="power-control-dock" style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; background: #0c1e16; border: 1.5px solid var(--bg-card-border); border-radius: 14px; padding: 10px 8px; width: 62px; height: 90%; max-height: 380px;">
          <span style="font-size: 10px; font-weight: 800; color: var(--gold); letter-spacing: 0.5px;">POWER</span>
          <span id="power-zone-label" style="font-size: 10px; font-weight: 900; color: #10b981;">MED</span>
          <span id="power-display" style="font-size: 12px; font-weight: 900; color: #fff;">50%</span>

          <!-- Power Slider -->
          <input type="range" id="power-slider" min="10" max="100" value="50" style="writing-mode: bt-lr; -webkit-appearance: slider-vertical; width: 28px; height: 170px; cursor: pointer; accent-color: var(--gold);" />

          <!-- Shoot Button -->
          <button id="btn-shoot-ball" class="btn btn-gold" style="width: 48px; height: 48px; border-radius: 50%; padding: 0; font-size: 22px; box-shadow: 0 0 14px rgba(255,213,79,0.5); border: 2px solid #fff; display: flex; align-items: center; justify-content: center;" title="Release / Shoot">
            ⚡
          </button>
        </div>

      </div>

      <!-- BOTTOM UTILITY BAR -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 14px; background: rgba(6, 21, 15, 0.95); border-top: 1px solid var(--bg-card-border); font-size: 11px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="btn-leave-match" class="btn btn-dark btn-sm" style="padding: 4px 12px; font-size: 11px; color: var(--loss-red); font-weight: 800;">
            ✕ ${isPractice ? 'Exit Practice' : 'Forfeit'}
          </button>
          <span id="game-status-ticker" style="color: var(--emerald); font-weight: 700; font-size: 11px;">
            Touch & drag table to aim • Pull cue stick back & release or tap ⚡ to shoot
          </span>
        </div>
        
        <!-- Aim Fine Adjustment -->
        <div style="display: flex; align-items: center; gap: 6px;">
          <button id="btn-fine-left" class="btn btn-dark btn-sm" style="padding: 4px 10px; font-size: 11px; font-weight: 800;">‹ -1°</button>
          <button id="btn-fine-right" class="btn btn-dark btn-sm" style="padding: 4px 10px; font-size: 11px; font-weight: 800;">+1° ›</button>
          <span style="color: var(--text-secondary); margin-left: 4px; font-size: 11px;">Angle: <strong id="angle-degrees" style="color: var(--gold);">0°</strong></span>
        </div>
      </div>

    </div>
  `;

  // Orientation Watcher
  function checkOrientation() {
    const isPortrait = window.innerHeight > window.innerWidth && window.innerWidth < 640;
    const overlay = document.getElementById("rotate-prompt-overlay");
    if (overlay) {
      overlay.style.display = isPortrait ? "flex" : "none";
    }
  }

  window.addEventListener("resize", checkOrientation);
  window.addEventListener("orientationchange", checkOrientation);
  checkOrientation();

  // Force Landscape button for devices with locked portrait
  const btnForceLand = document.getElementById("btn-force-landscape");
  if (btnForceLand) {
    btnForceLand.onclick = () => {
      const overlay = document.getElementById("rotate-prompt-overlay");
      if (overlay) overlay.style.display = "none";
    };
  }

  // Attempt orientation lock if available in browser/PWA
  try {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock("landscape").catch(() => {});
    }
  } catch (e) {}

  initGameEngine();
}

// ==========================================
// GAME ENGINE & 2D RIGID-BODY SIMULATION
// ==========================================
function initGameEngine() {
  const canvas = document.getElementById("pool-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const isPractice = currentRoom.mode === "practice";

  // Register in active_games table
  const activeGames = getStorage("active_games", []);
  const existingIdx = activeGames.findIndex(g => g.roomId === currentRoom.roomId);
  const liveGameObj = {
    roomId: currentRoom.roomId,
    gameMode: currentRoom.mode,
    entryAmount: currentRoom.entryAmount,
    players: currentRoom.players,
    currentTurn: 0,
    status: "PLAYING",
    startedAt: Date.now()
  };
  if (existingIdx >= 0) {
    activeGames[existingIdx] = liveGameObj;
  } else {
    activeGames.push(liveGameObj);
  }
  setStorage("active_games", activeGames);

  // Update room status
  const allRooms = getStorage("rooms", []);
  const rIdx = allRooms.findIndex(r => r.roomId === currentRoom.roomId);
  if (rIdx >= 0) {
    allRooms[rIdx].status = "PLAYING";
    setStorage("rooms", allRooms);
  }

  // LOGICAL DIMENSIONS: 840 x 420 (Strict 2:1 horizontal ratio)
  const width = 840;
  const height = 420;
  const cushion = 28;
  const playMinX = cushion;
  const playMaxX = width - cushion;
  const playMinY = cushion;
  const playMaxY = height - cushion;

  // Six Pockets (Horizontal orientation)
  const pockets = [
    { x: playMinX + 2, y: playMinY + 2, r: 24, name: "TOP_LEFT" },
    { x: width / 2, y: playMinY - 3, r: 21, name: "TOP_CENTER" },
    { x: playMaxX - 2, y: playMinY + 2, r: 24, name: "TOP_RIGHT" },
    { x: playMinX + 2, y: playMaxY - 2, r: 24, name: "BOTTOM_LEFT" },
    { x: width / 2, y: playMaxY + 3, r: 21, name: "BOTTOM_CENTER" },
    { x: playMaxX - 2, y: playMaxY - 2, r: 24, name: "BOTTOM_RIGHT" }
  ];

  // Standard Ball Configs (Official 8-ball colors)
  const ballRadius = 11.5;
  const BALL_CONFIGS = [
    { id: 0, name: "Cue Ball", color: "#F9FAFB", type: "CUE" },
    { id: 1, name: "1 Yellow", color: "#FACC15", type: "SOLID" },
    { id: 2, name: "2 Blue", color: "#2563EB", type: "SOLID" },
    { id: 3, name: "3 Red", color: "#DC2626", type: "SOLID" },
    { id: 4, name: "4 Purple", color: "#7C3AED", type: "SOLID" },
    { id: 5, name: "5 Orange", color: "#EA580C", type: "SOLID" },
    { id: 6, name: "6 Green", color: "#16A34A", type: "SOLID" },
    { id: 7, name: "7 Maroon", color: "#991B1B", type: "SOLID" },
    { id: 8, name: "8 Black", color: "#111827", type: "EIGHT" },
    { id: 9, name: "9 Yellow Stripe", color: "#FACC15", type: "STRIPE" },
    { id: 10, name: "10 Blue Stripe", color: "#2563EB", type: "STRIPE" },
    { id: 11, name: "11 Red Stripe", color: "#DC2626", type: "STRIPE" },
    { id: 12, name: "12 Purple Stripe", color: "#7C3AED", type: "STRIPE" },
    { id: 13, name: "13 Orange Stripe", color: "#EA580C", type: "STRIPE" },
    { id: 14, name: "14 Green Stripe", color: "#16A34A", type: "STRIPE" },
    { id: 15, name: "15 Maroon Stripe", color: "#991B1B", type: "STRIPE" }
  ];

  let balls = [];

  // Triangle Rack on right side, Cue ball on left side
  function rackBalls() {
    balls = [];

    // Cue Ball at Head String (Left side)
    const headStringX = playMinX + (playMaxX - playMinX) * 0.25; // x = 224
    balls.push({
      id: 0,
      x: headStringX,
      y: height / 2,
      vx: 0,
      vy: 0,
      r: ballRadius,
      color: BALL_CONFIGS[0].color,
      type: "CUE",
      pocketed: false,
      sinking: 0
    });

    // 15-Ball Triangle Rack pointing Left towards Cue Ball
    const apexX = playMinX + (playMaxX - playMinX) * 0.72; // x ~ 592
    const apexY = height / 2;
    const colSpacing = ballRadius * 1.732;
    const rowSpacing = ballRadius * 2.05;

    // Official 8-ball triangle rack placement
    const order = [
      [1],
      [9, 2],
      [10, 8, 3], // 8-Ball in center
      [4, 11, 12, 5],
      [13, 6, 14, 7, 15]
    ];

    for (let col = 0; col < order.length; col++) {
      const colBalls = order[col];
      const count = colBalls.length;
      const x = apexX + col * colSpacing;
      const startY = apexY - ((count - 1) * rowSpacing / 2);

      for (let row = 0; row < count; row++) {
        const ballId = colBalls[row];
        const cfg = BALL_CONFIGS[ballId];
        balls.push({
          id: ballId,
          x: x,
          y: startY + row * rowSpacing,
          vx: 0,
          vy: 0,
          r: ballRadius,
          color: cfg.color,
          type: cfg.type,
          pocketed: false,
          sinking: 0
        });
      }
    }
  }

  rackBalls();

  let isMoving = false;
  let aimAngle = 0; // Pointing right towards apex
  let power = 0.5;
  let turnIndex = 0; // 0 = Player 1 (User), 1 = Player 2 (Challenger/Opponent)
  let gameOver = false;
  let matchHandled = false;
  let sunkSolids = [];
  let sunkStripes = [];
  let p1Group = "OPEN";
  let p2Group = "OPEN";
  let timeRemaining = (currentRoom.durationMinutes || 5) * 60;

  // Shot metrics
  let firstContactBall = null;
  let ballsPocketedThisShot = [];
  let scratchedThisShot = false;
  let stickStrikeOffset = 0;
  let isStrikingAnimation = false;

  // Touch tracking
  let isTouching = false;
  let isPullingCue = false;

  // Match countdown timer
  const timerInterval = setInterval(() => {
    if (gameOver) return clearInterval(timerInterval);
    timeRemaining--;
    const m = Math.floor(timeRemaining / 60);
    const s = timeRemaining % 60;
    const timeEl = document.getElementById("game-timer");
    if (timeEl) {
      timeEl.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      if (timeRemaining < 30) {
        document.getElementById("match-timer-badge").style.color = "var(--loss-red)";
      }
    }
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      if (isPractice) {
        showToast("Practice session concluded!");
        navigateTo("/play");
      } else {
        finishMatch(currentRoom.players[0], "Match timer expired! Victory on score.");
      }
    }
  }, 1000);

  // Helper to convert screen touch/mouse to canvas logical coords (840x420)
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : (e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0].clientX : e.clientX);
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : (e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0].clientY : e.clientY);
    const touchX = (clientX - rect.left) * (width / rect.width);
    const touchY = (clientY - rect.top) * (height / rect.height);
    return { x: touchX, y: touchY };
  }

  function updateAngleDisplay() {
    let deg = Math.round((aimAngle * 180 / Math.PI + 360) % 360);
    const el = document.getElementById("angle-degrees");
    if (el) el.textContent = `${deg}°`;
  }

  // Power controls
  const slider = document.getElementById("power-slider");
  const powerDisp = document.getElementById("power-display");
  const powerZoneLabel = document.getElementById("power-zone-label");

  function updatePowerDisplay(val) {
    power = Math.max(0.1, Math.min(1.0, val / 100));
    const pct = Math.round(power * 100);
    if (powerDisp) powerDisp.textContent = `${pct}%`;
    if (slider) slider.value = pct;
    if (powerZoneLabel) {
      if (pct < 35) {
        powerZoneLabel.textContent = "LOW";
        powerZoneLabel.style.color = "#10b981";
      } else if (pct < 70) {
        powerZoneLabel.textContent = "MED";
        powerZoneLabel.style.color = "#facc15";
      } else {
        powerZoneLabel.textContent = "HIGH";
        powerZoneLabel.style.color = "#ef4444";
      }
    }
  }

  if (slider) {
    slider.oninput = () => updatePowerDisplay(parseInt(slider.value, 10));
    updatePowerDisplay(50);
  }

  // Fine-tuning angle buttons
  const btnFineLeft = document.getElementById("btn-fine-left");
  if (btnFineLeft) {
    btnFineLeft.onclick = () => {
      if (!isMoving && !gameOver) {
        aimAngle -= (Math.PI / 180);
        updateAngleDisplay();
      }
    };
  }
  const btnFineRight = document.getElementById("btn-fine-right");
  if (btnFineRight) {
    btnFineRight.onclick = () => {
      if (!isMoving && !gameOver) {
        aimAngle += (Math.PI / 180);
        updateAngleDisplay();
      }
    };
  }

  // Touch Interaction: Aiming & Pull-Back Cue Shooting
  function handleTouchStart(e) {
    if (isMoving || gameOver || (turnIndex !== 0 && !isPractice)) return;
    const pos = getCanvasCoords(e);
    const cue = balls[0];
    if (!cue || cue.pocketed) return;

    isTouching = true;
    const dx = pos.x - cue.x;
    const dy = pos.y - cue.y;

    // Vector along backwards cue stick line (opposite to aimAngle)
    const stickDirX = -Math.cos(aimAngle);
    const stickDirY = -Math.sin(aimAngle);
    const projAlongStick = dx * stickDirX + dy * stickDirY;
    const perpDist = Math.abs(dx * (-stickDirY) + dy * stickDirX);

    // If touching on or behind the cue stick, enter pull-back power mode
    if (projAlongStick > 15 && projAlongStick < 260 && perpDist < 65) {
      isPullingCue = true;
      const pull = Math.min(1.0, Math.max(0.1, (projAlongStick - 20) / 120));
      updatePowerDisplay(Math.round(pull * 100));
    } else {
      // Direct Aiming: Point aim towards touch location
      isPullingCue = false;
      aimAngle = Math.atan2(pos.y - cue.y, pos.x - cue.x);
      updateAngleDisplay();
    }
  }

  function handleTouchMove(e) {
    if (!isTouching || isMoving || gameOver || (turnIndex !== 0 && !isPractice)) return;
    const pos = getCanvasCoords(e);
    const cue = balls[0];
    if (!cue || cue.pocketed) return;

    const dx = pos.x - cue.x;
    const dy = pos.y - cue.y;

    if (isPullingCue) {
      const stickDirX = -Math.cos(aimAngle);
      const stickDirY = -Math.sin(aimAngle);
      const projAlongStick = dx * stickDirX + dy * stickDirY;
      const pull = Math.min(1.0, Math.max(0.1, (projAlongStick - 15) / 130));
      updatePowerDisplay(Math.round(pull * 100));
    } else {
      // Rotate aim smoothly around cue ball
      aimAngle = Math.atan2(pos.y - cue.y, pos.x - cue.x);
      updateAngleDisplay();
    }
  }

  function handleTouchEnd(e) {
    if (!isTouching) return;
    isTouching = false;
    if (isPullingCue) {
      isPullingCue = false;
      // If user pulled back and released, fire the shot!
      if (!isMoving && !gameOver && (turnIndex === 0 || isPractice) && power >= 0.15) {
        executeShot(power);
      }
    }
  }

  canvas.addEventListener("mousedown", (e) => { handleTouchStart(e); });
  canvas.addEventListener("mousemove", (e) => { if (e.buttons === 1) handleTouchMove(e); });
  canvas.addEventListener("mouseup", (e) => { handleTouchEnd(e); });

  canvas.addEventListener("touchstart", (e) => { e.preventDefault(); handleTouchStart(e); }, { passive: false });
  canvas.addEventListener("touchmove", (e) => { e.preventDefault(); handleTouchMove(e); }, { passive: false });
  canvas.addEventListener("touchend", (e) => { e.preventDefault(); handleTouchEnd(e); }, { passive: false });

  // Shoot button on the right dock
  const btnShoot = document.getElementById("btn-shoot-ball");
  if (btnShoot) {
    btnShoot.onclick = () => {
      if (!isMoving && !gameOver && (turnIndex === 0 || isPractice)) {
        executeShot(power);
      }
    };
  }

  function executeShot(pwr) {
    const cue = balls[0];
    if (!cue || cue.pocketed) return;

    // Play strike sound
    playPoolSound("strike", pwr);

    // Cue strike animation
    isStrikingAnimation = true;
    stickStrikeOffset = 25;

    setTimeout(() => {
      isStrikingAnimation = false;
      stickStrikeOffset = 0;
      const speed = 12 + pwr * 28;
      cue.vx = Math.cos(aimAngle) * speed;
      cue.vy = Math.sin(aimAngle) * speed;
      isMoving = true;
      firstContactBall = null;
      ballsPocketedThisShot = [];
      scratchedThisShot = false;

      const ticker = document.getElementById("game-status-ticker");
      if (ticker) ticker.textContent = `Shot fired with ${Math.round(pwr * 100)}% power!`;
    }, 100);
  }

  // Dynamic Raycast: Collision prediction & trajectory line
  function calculateAimPrediction() {
    const cue = balls[0];
    if (!cue || cue.pocketed) return null;

    const maxDist = 580;
    let hitBall = null;
    let minT = maxDist;

    const dirX = Math.cos(aimAngle);
    const dirY = Math.sin(aimAngle);

    for (let b of balls) {
      if (b.id === 0 || b.pocketed || b.sinking > 0) continue;

      const ocX = b.x - cue.x;
      const ocY = b.y - cue.y;
      const proj = ocX * dirX + ocY * dirY;

      if (proj > 0) {
        const perpSq = (ocX * ocX + ocY * ocY) - (proj * proj);
        const touchDist = (cue.r + b.r);
        if (perpSq <= touchDist * touchDist) {
          const d = proj - Math.sqrt(Math.max(0, touchDist * touchDist - perpSq));
          if (d > 0 && d < minT) {
            minT = d;
            hitBall = b;
          }
        }
      }
    }

    const ghostCueX = cue.x + dirX * minT;
    const ghostCueY = cue.y + dirY * minT;

    let targetTrajectory = null;
    let deflectedCueTrajectory = null;

    if (hitBall) {
      const normDx = hitBall.x - ghostCueX;
      const normDy = hitBall.y - ghostCueY;
      const normLen = Math.sqrt(normDx * normDx + normDy * normDy) || 1;
      const nx = normDx / normLen;
      const ny = normDy / normLen;

      targetTrajectory = {
        startX: hitBall.x,
        startY: hitBall.y,
        endX: hitBall.x + nx * 130,
        endY: hitBall.y + ny * 130
      };

      const tangentX = -ny;
      const tangentY = nx;
      const dotTangent = dirX * tangentX + dirY * tangentY;
      deflectedCueTrajectory = {
        startX: ghostCueX,
        startY: ghostCueY,
        endX: ghostCueX + tangentX * Math.sign(dotTangent || 1) * 70,
        endY: ghostCueY + tangentY * Math.sign(dotTangent || 1) * 70
      };
    }

    return {
      ghostX: ghostCueX,
      ghostY: ghostCueY,
      hasHit: hitBall !== null,
      hitBall: hitBall,
      targetTrajectory: targetTrajectory,
      deflectedTrajectory: deflectedCueTrajectory
    };
  }

  // High-Precision Continuous Physics Simulation (5 sub-steps per frame)
  function updatePhysics() {
    let anyMoving = false;
    const friction = 0.988;
    const stopSpeed = 0.10;
    const subSteps = 5;
    const subFriction = Math.pow(friction, 1 / subSteps);

    for (let step = 0; step < subSteps; step++) {
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        if (b.pocketed) continue;

        if (b.sinking > 0) {
          b.sinking += 0.07 / subSteps;
          b.vx *= 0.85;
          b.vy *= 0.85;
          if (b.sinking >= 1) {
            b.pocketed = true;
            handlePocketedBall(b);
            playPoolSound("pocket", 0.85);
          }
          anyMoving = true;
          continue;
        }

        b.x += b.vx / subSteps;
        b.y += b.vy / subSteps;
        b.vx *= subFriction;
        b.vy *= subFriction;

        const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (spd < stopSpeed) {
          b.vx = 0;
          b.vy = 0;
        } else {
          anyMoving = true;
        }

        // Pocket Entry Check
        for (let p of pockets) {
          const dx = b.x - p.x;
          const dy = b.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < p.r + 3) {
            b.sinking = 0.05;
            // Draw towards pocket center
            b.vx += (p.x - b.x) * 0.15;
            b.vy += (p.y - b.y) * 0.15;
            anyMoving = true;
            break;
          }
        }

        if (b.sinking > 0) continue;

        // Cushion Collisions (outside pocket openings)
        const pocketOpening = 36;
        const isNearTopPocket = Math.abs(b.x - (width / 2)) < pocketOpening || b.x < playMinX + pocketOpening || b.x > playMaxX - pocketOpening;
        const isNearBottomPocket = Math.abs(b.x - (width / 2)) < pocketOpening || b.x < playMinX + pocketOpening || b.x > playMaxX - pocketOpening;
        const isNearSidePocket = b.y < playMinY + pocketOpening || b.y > playMaxY - pocketOpening;

        // Left Cushion
        if (b.x - b.r < playMinX) {
          if (!isNearSidePocket) {
            b.x = playMinX + b.r;
            b.vx = -b.vx * 0.88;
            playPoolSound("cushion", Math.min(1, Math.abs(b.vx) / 8));
          }
        }
        // Right Cushion
        else if (b.x + b.r > playMaxX) {
          if (!isNearSidePocket) {
            b.x = playMaxX - b.r;
            b.vx = -b.vx * 0.88;
            playPoolSound("cushion", Math.min(1, Math.abs(b.vx) / 8));
          }
        }

        // Top Cushion
        if (b.y - b.r < playMinY) {
          if (!isNearTopPocket) {
            b.y = playMinY + b.r;
            b.vy = -b.vy * 0.88;
            playPoolSound("cushion", Math.min(1, Math.abs(b.vy) / 8));
          }
        }
        // Bottom Cushion
        else if (b.y + b.r > playMaxY) {
          if (!isNearBottomPocket) {
            b.y = playMaxY - b.r;
            b.vy = -b.vy * 0.88;
            playPoolSound("cushion", Math.min(1, Math.abs(b.vy) / 8));
          }
        }
      }

      // Ball-to-Ball Collisions
      for (let i = 0; i < balls.length; i++) {
        const b1 = balls[i];
        if (b1.pocketed || b1.sinking > 0) continue;

        for (let j = i + 1; j < balls.length; j++) {
          const b2 = balls[j];
          if (b2.pocketed || b2.sinking > 0) continue;

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b1.r + b2.r;

          if (dist < minDist && dist > 0) {
            if ((b1.id === 0 || b2.id === 0) && !firstContactBall) {
              firstContactBall = b1.id === 0 ? b2 : b1;
            }

            const overlap = 0.5 * (minDist - dist);
            const nx = dx / dist;
            const ny = dy / dist;

            b1.x -= nx * overlap;
            b1.y -= ny * overlap;
            b2.x += nx * overlap;
            b2.y += ny * overlap;

            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const impulse = nx * kx + ny * ky;

            if (impulse > 0) {
              b1.vx -= impulse * nx * 0.97;
              b1.vy -= impulse * ny * 0.97;
              b2.vx += impulse * nx * 0.97;
              b2.vy += impulse * ny * 0.97;

              playPoolSound("hit", Math.min(1, impulse / 12));
              anyMoving = true;
            }
          }
        }
      }
    }

    if (isMoving && !anyMoving) {
      isMoving = false;
      onShotSettled();
    }
  }

  function handlePocketedBall(b) {
    if (b.type === "CUE") {
      scratchedThisShot = true;
    } else {
      ballsPocketedThisShot.push(b);
      if (b.type === "SOLID") sunkSolids.push(b.id);
      if (b.type === "STRIPE") sunkStripes.push(b.id);
    }
  }

  // ==========================================
  // TURN SYSTEM & 8-BALL RULES (Requirements 17 & 18)
  // ==========================================
  function onShotSettled() {
    if (gameOver) return;

    const activePlayer = currentRoom.players[turnIndex];
    const opponentPlayer = currentRoom.players[turnIndex === 0 ? 1 : 0];
    const ownGroup = turnIndex === 0 ? p1Group : p2Group;

    let isFoul = false;
    let isMiss = false;
    let continueTurn = false;
    let statusMessage = "";

    // 1. Cue Scratch Foul
    if (scratchedThisShot) {
      isFoul = true;
      const cue = balls[0];
      cue.pocketed = false;
      cue.sinking = 0;
      cue.x = playMinX + (playMaxX - playMinX) * 0.25;
      cue.y = height / 2;
      cue.vx = 0;
      cue.vy = 0;
      statusMessage = isPractice ? "CUE SCRATCH: Placed back on head string." : "FOUL: Cue scratch! Opponent's turn.";
    }

    // 2. 8-Ball Pocketed Check
    const eightPocketed = ballsPocketedThisShot.some(b => b.id === 8);
    if (eightPocketed) {
      if (isPractice) {
        showToast("🎱 8-Ball Potted! Reracking table...");
        setTimeout(() => rackBalls(), 1000);
        return;
      }
      const ownCleared = ownGroup === "SOLIDS" ? sunkSolids.length >= 7 : (ownGroup === "STRIPES" ? sunkStripes.length >= 7 : false);
      if (ownCleared && !scratchedThisShot && !isFoul) {
        finishMatch(activePlayer, `8-BALL LEGAL WIN! ${activePlayer.name} takes the victory!`);
        return;
      } else {
        finishMatch(opponentPlayer, `8-BALL FOUL! Illegally potted by ${activePlayer.name}. Opponent wins!`);
        return;
      }
    }

    // 3. Check for Miss (no ball contacted)
    if (!firstContactBall && !scratchedThisShot) {
      isMiss = true;
      statusMessage = isPractice ? "MISS: No ball contacted." : "MISS: No ball contacted. Opponent's turn.";
    }

    // 4. Assign Groups on first valid pocket
    if (p1Group === "OPEN" && ballsPocketedThisShot.length > 0 && !isFoul && !isMiss) {
      const firstValidObj = ballsPocketedThisShot.find(b => b.id !== 0 && b.id !== 8);
      if (firstValidObj) {
        if (turnIndex === 0) {
          p1Group = firstValidObj.type === "SOLID" ? "SOLIDS" : "STRIPES";
          p2Group = p1Group === "SOLIDS" ? "STRIPES" : "SOLIDS";
        } else {
          p2Group = firstValidObj.type === "SOLID" ? "SOLIDS" : "STRIPES";
          p1Group = p2Group === "SOLIDS" ? "STRIPES" : "SOLIDS";
        }
        const g1 = document.getElementById("p1-group");
        const g2 = document.getElementById("p2-group");
        if (g1) g1.textContent = p1Group;
        if (g2) g2.textContent = p2Group;
      }
    }

    // 5. Wrong Ball Contact Foul (Only in 1v1 match play)
    if (!isPractice && !isFoul && !isMiss && ownGroup !== "OPEN" && firstContactBall) {
      const ownCleared = ownGroup === "SOLIDS" ? sunkSolids.length >= 7 : sunkStripes.length >= 7;
      if (ownGroup === "SOLIDS" && firstContactBall.type === "STRIPE") {
        isFoul = true;
        statusMessage = "FOUL: Contacted opponent's stripe first!";
      } else if (ownGroup === "STRIPES" && firstContactBall.type === "SOLID") {
        isFoul = true;
        statusMessage = "FOUL: Contacted opponent's solid first!";
      } else if (firstContactBall.id === 8 && !ownCleared) {
        isFoul = true;
        statusMessage = "FOUL: Contacted 8-ball before clearing assigned group!";
      }
    }

    // 6. TURN SYSTEM RULE:
    // If player successfully pockets a valid ball: SAME PLAYER GETS ANOTHER TURN!
    if (!isFoul && !isMiss) {
      let legallyPocketed = false;
      if (ownGroup === "OPEN" || isPractice) {
        legallyPocketed = ballsPocketedThisShot.some(b => b.id !== 0 && b.id !== 8);
      } else {
        legallyPocketed = ballsPocketedThisShot.some(b => b.type === (ownGroup === "SOLIDS" ? "SOLID" : "STRIPE"));
      }

      if (legallyPocketed) {
        continueTurn = true;
        statusMessage = `GOOD SHOT! ${activePlayer.name} CONTINUES`;
      } else {
        statusMessage = isPractice ? "MISS: No ball pocketed." : `MISS: No ball pocketed. ${opponentPlayer.name}'S TURN`;
      }
    }

    // Update Status Ticker
    const ticker = document.getElementById("game-status-ticker");
    if (ticker) ticker.textContent = statusMessage;

    // Shot Result Pill Banner
    const pill = document.getElementById("shot-result-pill");
    if (pill) {
      pill.style.display = "inline-block";
      if (continueTurn) {
        pill.textContent = "GOOD SHOT! CONTINUES";
        pill.style.background = "#1b4d30";
        pill.style.color = "var(--gold)";
      } else if (isFoul) {
        pill.textContent = "FOUL!";
        pill.style.background = "#4d1b1b";
        pill.style.color = "var(--loss-red)";
      } else {
        pill.textContent = "MISS";
        pill.style.background = "#374151";
        pill.style.color = "#d1d5db";
      }
      setTimeout(() => { if (pill) pill.style.display = "none"; }, 3000);
    }

    // In Practice Mode: Player stays on turn to practice continuously!
    if (isPractice) {
      turnIndex = 0;
      const banner = document.getElementById("turn-banner");
      if (banner) banner.textContent = "PRACTICE MODE • YOUR TURN";
      return;
    }

    // Switch turn if didn't score
    if (!continueTurn) {
      turnIndex = turnIndex === 0 ? 1 : 0;
    }

    // Update UI HUD indicators
    const isP1Active = turnIndex === 0;
    const banner = document.getElementById("turn-banner");
    if (banner) {
      banner.textContent = isP1Active ? "YOUR TURN" : `${currentRoom.players[1].name.toUpperCase()}'S TURN`;
    }
    const hp1 = document.getElementById("hud-p1");
    const hp2 = document.getElementById("hud-p2");
    if (hp1) hp1.style.opacity = isP1Active ? "1" : "0.45";
    if (hp2) hp2.style.opacity = !isP1Active ? "1" : "0.45";
    const d1 = document.getElementById("p1-turn-dot");
    const d2 = document.getElementById("p2-turn-dot");
    if (d1) d1.style.background = isP1Active ? "var(--emerald)" : "#6b7280";
    if (d2) d2.style.background = !isP1Active ? "var(--emerald)" : "#6b7280";

    // Opponent Bot AI Turn Execution (1v1 mode)
    if (turnIndex === 1 && !gameOver) {
      setTimeout(() => {
        if (!gameOver) {
          const cue = balls[0];
          let target = null;
          if (p2Group === "STRIPES") {
            target = balls.find(b => !b.pocketed && b.type === "STRIPE") || balls.find(b => !b.pocketed && b.id === 8);
          } else if (p2Group === "SOLIDS") {
            target = balls.find(b => !b.pocketed && b.type === "SOLID") || balls.find(b => !b.pocketed && b.id === 8);
          } else {
            target = balls.find(b => !b.pocketed && b.id !== 0);
          }

          if (target && cue) {
            aimAngle = Math.atan2(target.y - cue.y, target.x - cue.x);
            updateAngleDisplay();
            executeShot(0.45 + Math.random() * 0.22);
          }
        }
      }, 1300);
    }
  }

  // Finish Match & Record in Database
  function finishMatch(winner, reason) {
    if (gameOver || matchHandled) return;
    gameOver = true;
    matchHandled = true;
    clearInterval(timerInterval);

    if (isPractice) {
      const modal = document.createElement("div");
      modal.className = "modal-backdrop";
      modal.innerHTML = `
        <div class="modal-card" style="text-align: center; border: 2px solid var(--gold); max-width: 380px;">
          <h2 class="gold-title" style="font-size: 24px; margin-bottom: 8px;">PRACTICE SESSION COMPLETE</h2>
          <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 20px;">${reason}</p>
          <button id="btn-finish-lobby" class="btn btn-gold btn-block" style="height: 48px; font-size: 15px; font-weight: 800;">
            RETURN TO ARENA LOBBY
          </button>
        </div>
      `;
      document.getElementById("app-container").appendChild(modal);
      modal.querySelector("#btn-finish-lobby").onclick = () => {
        modal.remove();
        const appContainer = document.getElementById("app-container");
        if (appContainer) appContainer.classList.remove("in-game");
        currentRoom = null;
        setStorage("current_room", null);
        navigateTo("/play");
      };
      return;
    }

    const isUserWinner = winner.id === currentUser.playerId;
    const pot = currentRoom.entryAmount * 2;
    const netChange = isUserWinner ? (pot - currentRoom.entryAmount) : -currentRoom.entryAmount;

    // Record Match in database
    const matches = getStorage("matches", []);
    const matchRecord = {
      matchId: "MTH-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      roomId: currentRoom.roomId,
      mode: currentRoom.mode,
      playersJson: currentRoom.players.map(p => p.name).join(", "),
      entryAmount: currentRoom.entryAmount,
      durationMinutes: currentRoom.durationMinutes,
      winnerPlayerId: winner.id,
      winnerName: winner.name,
      coinsWonLost: netChange,
      endedAt: Date.now()
    };
    matches.unshift(matchRecord);
    setStorage("matches", matches);

    // Update user balance atomically
    const users = getStorage("users", []);
    const u = users.find(x => x.id === currentUser.id);
    if (u) {
      u.matchesPlayed = (u.matchesPlayed || 0) + 1;
      const prevBal = u.coinBalance;
      if (isUserWinner) {
        u.coinBalance += pot;
        u.matchesWon = (u.matchesWon || 0) + 1;
        recordTransaction(u.id, u.playerId, "MATCH_RESULT", pot, prevBal, u.coinBalance, `Won match in ${currentRoom.roomId}`);
      } else {
        u.matchesLost = (u.matchesLost || 0) + 1;
      }
      setStorage("users", users);
      currentUser.coinBalance = u.coinBalance;
      currentUser.matchesPlayed = u.matchesPlayed;
      currentUser.matchesWon = u.matchesWon;
      currentUser.matchesLost = u.matchesLost;
      setStorage("current_user", currentUser);
    }

    // Clean up active_games and room status
    const activeGames = getStorage("active_games", []);
    setStorage("active_games", activeGames.filter(g => g.roomId !== currentRoom.roomId));

    const allRooms = getStorage("rooms", []);
    const rIdx = allRooms.findIndex(r => r.roomId === currentRoom.roomId);
    if (rIdx >= 0) {
      allRooms[rIdx].status = "FINISHED";
      allRooms[rIdx].endedAt = Date.now();
      setStorage("rooms", allRooms);
    }

    // Notification
    createNotification(
      currentUser.id,
      currentUser.playerId,
      isUserWinner ? "MATCH_WON" : "MATCH_LOST",
      isUserWinner ? "Match Victory! 🏆" : "Match Defeat",
      isUserWinner
        ? `You won ${formatNumber(pot)} coins in ${currentRoom.roomId}!`
        : `You lost ${formatNumber(currentRoom.entryAmount)} coins in ${currentRoom.roomId}.`
    );

    // User Activity Logging
    recordUserActivity(
      currentUser.id,
      currentUser.playerId,
      currentUser.username,
      isUserWinner ? "MATCH_WON" : "MATCH_LOST",
      currentRoom.roomId,
      isUserWinner ? `Won ${formatNumber(pot)} coins (${reason})` : `Lost match (${reason})`
    );

    // Show Match Result Dialog
    const modal = document.createElement("div");
    modal.className = "modal-backdrop";
    modal.innerHTML = `
      <div class="modal-card" style="text-align: center; border: 2px solid ${isUserWinner ? 'var(--gold)' : 'var(--loss-red)'}; max-width: 380px;">
        <h2 class="gold-title" style="font-size: 26px; margin-bottom: 6px;">
          ${isUserWinner ? '🏆 YOU WIN' : 'YOU LOSE'}
        </h2>
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">${reason}</p>

        <div class="card" style="background: #091711; padding: 14px; text-align: left; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
            <span style="color: var(--text-secondary);">Winner:</span>
            <strong style="color: var(--gold);">${winner.name}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
            <span style="color: var(--text-secondary);">Entry Fee:</span>
            <span>${formatNumber(currentRoom.entryAmount)} Coins</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
            <span style="color: var(--text-secondary);">Result:</span>
            <strong style="color: ${isUserWinner ? 'var(--emerald)' : 'var(--loss-red)'};">${isUserWinner ? 'WIN' : 'LOSE'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--bg-card-border); padding-top: 8px; font-size: 14px;">
            <span style="font-weight: 700;">Updated Balance:</span>
            <strong style="color: var(--gold); font-size: 15px;">${formatNumber(currentUser.coinBalance)} Coins</strong>
          </div>
        </div>

        <button id="btn-finish-lobby" class="btn btn-gold btn-block" style="height: 48px; font-size: 15px; font-weight: 800;">
          RETURN TO ARENA LOBBY
        </button>
      </div>
    `;
    document.getElementById("app-container").appendChild(modal);

    modal.querySelector("#btn-finish-lobby").onclick = () => {
      modal.remove();
      const appContainer = document.getElementById("app-container");
      if (appContainer) appContainer.classList.remove("in-game");
      currentRoom = null;
      setStorage("current_room", null);
      navigateTo("/play");
    };
  }

  // Leave / Forfeit handler
  const btnLeave = document.getElementById("btn-leave-match");
  if (btnLeave) {
    btnLeave.onclick = () => {
      if (isPractice) {
        clearInterval(timerInterval);
        const appContainer = document.getElementById("app-container");
        if (appContainer) appContainer.classList.remove("in-game");
        currentRoom = null;
        setStorage("current_room", null);
        navigateTo("/play");
        return;
      }
      if (confirm("Forfeit match? Entry coins will be lost.")) {
        finishMatch(currentRoom.players[1], `${currentUser.username} forfeited the match.`);
      }
    };
  }

  // ==========================================
  // CANVAS DRAWING ENGINE (Horizontal Landscape)
  // ==========================================
  function drawTable() {
    ctx.clearRect(0, 0, width, height);

    // 1. Solid Hardwood Outer Rails
    const railGrad = ctx.createLinearGradient(0, 0, width, height);
    railGrad.addColorStop(0, "#4a2810");
    railGrad.addColorStop(0.5, "#2f1708");
    railGrad.addColorStop(1, "#1c0c04");
    ctx.fillStyle = railGrad;
    ctx.fillRect(0, 0, width, height);

    // Sight Diamonds on rails (Billiards Markers)
    ctx.fillStyle = "rgba(255, 213, 79, 0.45)";
    // Top & Bottom Rail Diamonds
    for (let x of [160, 280, 420, 560, 680]) {
      ctx.beginPath();
      ctx.arc(x, 12, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, height - 12, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Left & Right Rail Diamonds
    for (let y of [140, 210, 280]) {
      ctx.beginPath();
      ctx.arc(12, y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(width - 12, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Premium Emerald Felt Cloth with Radial Lighting
    const feltGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.55);
    feltGrad.addColorStop(0, "#0e693f");
    feltGrad.addColorStop(0.7, "#094e2e");
    feltGrad.addColorStop(1, "#05331c");
    ctx.fillStyle = feltGrad;
    ctx.fillRect(playMinX, playMinY, playMaxX - playMinX, playMaxY - playMinY);

    // Inner Cushion Shadow
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 3;
    ctx.strokeRect(playMinX, playMinY, playMaxX - playMinX, playMaxY - playMinY);

    // Head String Line & Spot (Left side)
    const headStringX = playMinX + (playMaxX - playMinX) * 0.25;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(headStringX, playMinY);
    ctx.lineTo(headStringX, playMaxY);
    ctx.stroke();

    // Head Spot
    ctx.beginPath();
    ctx.arc(headStringX, height / 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fill();

    // Foot Spot (Right side)
    const footSpotX = playMinX + (playMaxX - playMinX) * 0.72;
    ctx.beginPath();
    ctx.arc(footSpotX, height / 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fill();

    // 3. Six Pockets with Gold Rim Accents
    for (let p of pockets) {
      // Outer brass ring
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + 3, 0, Math.PI * 2);
      ctx.fillStyle = "#1e140c";
      ctx.fill();

      // Deep Black Drop Pocket
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "#090909";
      ctx.fill();

      // Golden Rim Highlight
      ctx.strokeStyle = "#c5a059";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 4. Aiming Direction Line, Collision Guide & Trajectories
    const cue = balls[0];
    if (cue && !cue.pocketed && !isMoving && !gameOver && (turnIndex === 0 || isPractice)) {
      const pred = calculateAimPrediction();
      if (pred) {
        // Dotted aim line from cue ball to ghost cue ball
        ctx.beginPath();
        ctx.moveTo(cue.x, cue.y);
        ctx.lineTo(pred.ghostX, pred.ghostY);
        ctx.strokeStyle = "rgba(255, 213, 79, 0.9)";
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ghost Cue Ball at predicted collision point
        ctx.beginPath();
        ctx.arc(pred.ghostX, pred.ghostY, cue.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Predicted Target Ball Trajectory
        if (pred.hasHit && pred.targetTrajectory) {
          ctx.beginPath();
          ctx.moveTo(pred.targetTrajectory.startX, pred.targetTrajectory.startY);
          ctx.lineTo(pred.targetTrajectory.endX, pred.targetTrajectory.endY);
          ctx.strokeStyle = "rgba(16, 185, 129, 0.95)";
          ctx.lineWidth = 2.2;
          ctx.stroke();

          // Arrow head at target trajectory end
          const angle = Math.atan2(pred.targetTrajectory.endY - pred.targetTrajectory.startY, pred.targetTrajectory.endX - pred.targetTrajectory.startX);
          ctx.beginPath();
          ctx.moveTo(pred.targetTrajectory.endX, pred.targetTrajectory.endY);
          ctx.lineTo(pred.targetTrajectory.endX - Math.cos(angle - Math.PI / 6) * 8, pred.targetTrajectory.endY - Math.sin(angle - Math.PI / 6) * 8);
          ctx.lineTo(pred.targetTrajectory.endX - Math.cos(angle + Math.PI / 6) * 8, pred.targetTrajectory.endY - Math.sin(angle + Math.PI / 6) * 8);
          ctx.fillStyle = "rgba(16, 185, 129, 0.95)";
          ctx.fill();
        }

        // Predicted Cue Ball Deflection
        if (pred.hasHit && pred.deflectedTrajectory) {
          ctx.beginPath();
          ctx.moveTo(pred.deflectedTrajectory.startX, pred.deflectedTrajectory.startY);
          ctx.lineTo(pred.deflectedTrajectory.endX, pred.deflectedTrajectory.endY);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Cue Stick with Rotation & Pullback Animation
      const pullback = 14 + power * 45 - stickStrikeOffset;
      const stickStart = cue.r + pullback;
      const stickEnd = stickStart + 175;
      const cosA = Math.cos(aimAngle);
      const sinA = Math.sin(aimAngle);

      // Cue Stick Shaft
      ctx.beginPath();
      ctx.moveTo(cue.x - cosA * stickStart, cue.y - sinA * stickStart);
      ctx.lineTo(cue.x - cosA * stickEnd, cue.y - sinA * stickEnd);
      ctx.strokeStyle = "#8d5b4c";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.stroke();

      // Cue Ferrule & Chalked Tip
      ctx.beginPath();
      ctx.moveTo(cue.x - cosA * stickStart, cue.y - sinA * stickStart);
      ctx.lineTo(cue.x - cosA * (stickStart + 12), cue.y - sinA * (stickStart + 12));
      ctx.strokeStyle = "#ffd54f";
      ctx.lineWidth = 6;
      ctx.stroke();

      // Chalk tip
      ctx.beginPath();
      ctx.moveTo(cue.x - cosA * stickStart, cue.y - sinA * stickStart);
      ctx.lineTo(cue.x - cosA * (stickStart + 4), cue.y - sinA * (stickStart + 4));
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 6;
      ctx.stroke();
    }

    // 5. Draw All 3D Colorful Balls
    for (let b of balls) {
      if (b.pocketed) continue;
      const r = b.r * (1 - b.sinking * 0.7);

      // Drop Shadow
      ctx.beginPath();
      ctx.arc(b.x + 2, b.y + 2.5, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fill();

      // Base Ball Sphere
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fillStyle = b.type === "STRIPE" ? "#ffffff" : b.color;
      ctx.fill();

      // Striped Ball Colored Equator Band
      if (b.type === "STRIPE") {
        ctx.beginPath();
        ctx.rect(b.x - r, b.y - r * 0.55, r * 2, r * 1.1);
        ctx.save();
        ctx.clip();
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.restore();
      }

      // Central White Number Badge
      if (b.id !== 0) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        ctx.fillStyle = "#111827";
        ctx.font = `bold ${Math.round(r * 0.68)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(b.id, b.x, b.y + 0.5);
      }

      // 3D Specular Highlight
      const spec = ctx.createRadialGradient(b.x - r * 0.35, b.y - r * 0.35, 1, b.x, b.y, r);
      spec.addColorStop(0, "rgba(255, 255, 255, 0.75)");
      spec.addColorStop(0.3, "rgba(255, 255, 255, 0.15)");
      spec.addColorStop(1, "rgba(0, 0, 0, 0.3)");
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fillStyle = spec;
      ctx.fill();
    }

    updatePhysics();
    if (!gameOver) requestAnimationFrame(drawTable);
  }

  requestAnimationFrame(drawTable);
}
