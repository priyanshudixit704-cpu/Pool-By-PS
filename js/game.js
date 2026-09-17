// ==========================================
// 8 BALL POOL - GAME ENGINE & PHYSICS
// ==========================================

function renderGameView() {
  const container = document.getElementById("main-view");
  container.className = "view-content no-bottom-pad";

  const p1 = currentRoom.players[0];
  const p2 = currentRoom.players[1];

  container.innerHTML = `
    <!-- Top Match Header & HUD -->
    <div class="card" style="padding: 10px 14px; margin-bottom: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <button id="btn-leave-match" class="btn btn-dark btn-sm" style="padding: 4px 8px; font-size: 11px;">✕ Forfeit</button>
          <span style="font-size: 11px; font-weight: 700; color: var(--gold);">${currentRoom.mode} • Entry: ${formatNumber(currentRoom.entryAmount)} Coins</span>
        </div>
        <div id="match-timer-badge" style="display: flex; align-items: center; gap: 4px; background: #0c1d15; padding: 4px 10px; border-radius: 14px; border: 1px solid var(--gold);">
          <span style="font-size: 11px;">⏱️</span>
          <span id="game-timer" style="font-weight: 800; font-size: 12px; color: var(--gold); font-variant-numeric: tabular-nums;">02:00</span>
        </div>
      </div>

      <!-- Player 1 vs Player 2 Status -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <!-- Player 1 -->
        <div id="hud-p1" style="display: flex; align-items: center; gap: 8px; transition: opacity 0.3s ease;">
          <div class="avatar avatar-sm" style="background: ${getAvatarGradient(p1.name)}; position: relative;">
            ${p1.name.slice(0, 2).toUpperCase()}
            <div id="p1-turn-dot" style="position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; border-radius: 50%; background: var(--emerald); border: 2px solid #000;"></div>
          </div>
          <div>
            <p style="font-weight: 800; font-size: 13px;">${p1.name}</p>
            <p id="p1-group" style="font-size: 10px; color: var(--gold); font-weight: 700;">OPEN TABLE</p>
          </div>
        </div>

        <div style="text-align: center;">
          <div id="turn-banner" style="background: #19452b; border: 1px solid var(--gold); padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 800; color: var(--gold); letter-spacing: 0.5px;">
            YOUR TURN
          </div>
        </div>

        <!-- Player 2 -->
        <div id="hud-p2" style="display: flex; align-items: center; gap: 8px; opacity: 0.5; transition: opacity 0.3s ease; text-align: right;">
          <div>
            <p style="font-weight: 800; font-size: 13px;">${p2.name}</p>
            <p id="p2-group" style="font-size: 10px; color: var(--gold); font-weight: 700;">OPEN TABLE</p>
          </div>
          <div class="avatar avatar-sm" style="background: ${getAvatarGradient(p2.name)}; position: relative;">
            ${p2.name.slice(0, 2).toUpperCase()}
            <div id="p2-turn-dot" style="position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; border-radius: 50%; background: #6b7280; border: 2px solid #000;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gameplay Status Bar -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding: 0 4px;">
      <p id="game-status-ticker" style="color: var(--emerald); font-size: 12px; font-weight: 700;">
        Touch table to aim • Pull power & shoot!
      </p>
      <span id="shot-result-pill" style="display: none; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 800;"></span>
    </div>

    <!-- Center Table Canvas & Power Meter -->
    <div style="flex: 1; display: flex; gap: 8px; align-items: center; justify-content: center; position: relative;">
      <!-- Table Container -->
      <div id="canvas-wrap" style="position: relative; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8); border: 2px solid #5a3418;">
        <canvas id="pool-canvas" width="340" height="540" style="display: block; touch-action: none;"></canvas>
      </div>

      <!-- Power Control Column -->
      <div class="card" style="width: 58px; height: 540px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 8px 4px; margin-bottom: 0;">
        <span style="color: var(--gold); font-size: 11px; font-weight: 800;">PWR</span>
        <span id="power-zone-label" style="font-size: 10px; font-weight: 800; color: #10b981;">MED</span>
        <span id="power-display" style="font-size: 12px; font-weight: 800; color: var(--text-primary);">50%</span>
        
        <!-- Vertical Range Slider -->
        <input type="range" id="power-slider" min="10" max="100" value="50" style="writing-mode: bt-lr; -webkit-appearance: slider-vertical; width: 28px; height: 320px; cursor: pointer;" />
        
        <button id="btn-shoot-ball" class="btn btn-gold" style="width: 46px; height: 46px; border-radius: 50%; padding: 0; font-size: 20px; box-shadow: 0 0 12px rgba(255,213,79,0.5);">
          ⚡
        </button>
      </div>
    </div>

    <!-- Bottom Fine Tuning Aim Controls -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding: 0 4px;">
      <div style="display: flex; gap: 6px;">
        <button id="btn-fine-left" class="btn btn-dark btn-sm" style="padding: 6px 12px; font-size: 13px; font-weight: 800;">‹ -2°</button>
        <button id="btn-fine-right" class="btn btn-dark btn-sm" style="padding: 6px 12px; font-size: 13px; font-weight: 800;">+2° ›</button>
      </div>
      <div style="font-size: 11px; color: var(--text-secondary);">
        Aim Angle: <strong id="angle-degrees" style="color: var(--gold);">270°</strong>
      </div>
    </div>
  `;

  initGameEngine();
}

function initGameEngine() {
  const canvas = document.getElementById("pool-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const width = 340;
  const height = 540;
  const cushion = 24;
  const playMinX = cushion;
  const playMaxX = width - cushion;
  const playMinY = cushion;
  const playMaxY = height - cushion;

  const pockets = [
    { x: playMinX + 2, y: playMinY + 2, r: 22 },
    { x: width / 2, y: playMinY - 2, r: 20 },
    { x: playMaxX - 2, y: playMinY + 2, r: 22 },
    { x: playMinX + 2, y: playMaxY - 2, r: 22 },
    { x: width / 2, y: playMaxY + 2, r: 20 },
    { x: playMaxX - 2, y: playMaxY - 2, r: 22 }
  ];

  // Exact 8-Ball pool colors per requirement 6
  const ballRadius = 11.5;
  const BALL_CONFIGS = [
    { id: 0, name: "Cue Ball", color: "#F9FAFB", type: "CUE" },
    { id: 1, name: "Solid Yellow", color: "#FACC15", type: "SOLID" },
    { id: 2, name: "Solid Blue", color: "#2563EB", type: "SOLID" },
    { id: 3, name: "Solid Red", color: "#DC2626", type: "SOLID" },
    { id: 4, name: "Solid Purple", color: "#7C3AED", type: "SOLID" },
    { id: 5, name: "Solid Orange", color: "#EA580C", type: "SOLID" },
    { id: 6, name: "Solid Green", color: "#16A34A", type: "SOLID" },
    { id: 7, name: "Solid Maroon", color: "#991B1B", type: "SOLID" },
    { id: 8, name: "Eight Black", color: "#111827", type: "EIGHT" },
    { id: 9, name: "Stripe Yellow", color: "#FACC15", type: "STRIPE" },
    { id: 10, name: "Stripe Blue", color: "#2563EB", type: "STRIPE" },
    { id: 11, name: "Stripe Red", color: "#DC2626", type: "STRIPE" },
    { id: 12, name: "Stripe Purple", color: "#7C3AED", type: "STRIPE" },
    { id: 13, name: "Stripe Orange", color: "#EA580C", type: "STRIPE" },
    { id: 14, name: "Stripe Green", color: "#16A34A", type: "STRIPE" },
    { id: 15, name: "Stripe Maroon", color: "#991B1B", type: "STRIPE" }
  ];

  let balls = [];
  function rackBalls() {
    balls = [];
    // Cue Ball at head position
    balls.push({
      id: 0,
      x: width / 2,
      y: playMaxY - 110,
      vx: 0,
      vy: 0,
      r: ballRadius,
      color: BALL_CONFIGS[0].color,
      type: "CUE",
      pocketed: false,
      sinking: 0
    });

    // Triangle rack at top
    const apexY = playMinY + 125;
    const rowSpacing = ballRadius * 1.732;
    const colSpacing = ballRadius * 2.05;
    const order = [1, 9, 2, 10, 8, 3, 4, 11, 12, 5, 13, 6, 14, 7, 15];

    let idx = 0;
    for (let row = 0; row <= 4; row++) {
      const startX = width / 2 - (row * colSpacing / 2);
      const y = apexY + row * rowSpacing;
      for (let col = 0; col <= row; col++) {
        if (idx < order.length) {
          const ballId = order[idx];
          const cfg = BALL_CONFIGS[ballId];
          balls.push({
            id: ballId,
            x: startX + col * colSpacing,
            y: y,
            vx: 0,
            vy: 0,
            r: ballRadius,
            color: cfg.color,
            type: cfg.type,
            pocketed: false,
            sinking: 0
          });
          idx++;
        }
      }
    }
  }

  rackBalls();

  let isMoving = false;
  let aimAngle = -Math.PI / 2; // Aiming towards apex
  let power = 0.5;
  let turnIndex = 0; // 0 = Player 1, 1 = Player 2
  let gameOver = false;
  let matchHandled = false; // Prevent double payouts
  let sunkSolids = [];
  let sunkStripes = [];
  let p1Group = "OPEN";
  let p2Group = "OPEN";
  let timeRemaining = currentRoom.durationMinutes * 60;

  // Shot tracking metrics for Turn & 8-Ball rules
  let firstContactBall = null;
  let ballsPocketedThisShot = [];
  let scratchedThisShot = false;
  let stickStrikeOffset = 0; // Animation offset
  let isStrikingAnimation = false;

  // Timer interval
  const timerInterval = setInterval(() => {
    if (gameOver) return clearInterval(timerInterval);
    timeRemaining--;
    const m = Math.floor(timeRemaining / 60);
    const s = timeRemaining % 60;
    const timeEl = document.getElementById("game-timer");
    if (timeEl) {
      timeEl.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      if (timeRemaining < 30) {
        document.getElementById("match-timer-badge").style.borderColor = "var(--loss-red)";
      }
    }
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      finishMatch(currentRoom.players[0], "Match timer expired! Victory on score.");
    }
  }, 1000);

  // Aiming input handler - real-time angle updates
  function updateAimFromEvent(e) {
    if (isMoving || gameOver || turnIndex !== 0) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (width / rect.width);
    const y = (clientY - rect.top) * (height / rect.height);
    const cue = balls[0];
    if (cue && !cue.pocketed) {
      aimAngle = Math.atan2(y - cue.y, x - cue.x);
      updateAngleDisplay();
    }
  }

  function updateAngleDisplay() {
    let deg = Math.round((aimAngle * 180 / Math.PI + 360) % 360);
    const el = document.getElementById("angle-degrees");
    if (el) el.textContent = `${deg}°`;
  }

  canvas.addEventListener("mousedown", updateAimFromEvent);
  canvas.addEventListener("mousemove", (e) => { if (e.buttons === 1) updateAimFromEvent(e); });
  canvas.addEventListener("touchstart", (e) => { e.preventDefault(); updateAimFromEvent(e); }, { passive: false });
  canvas.addEventListener("touchmove", (e) => { e.preventDefault(); updateAimFromEvent(e); }, { passive: false });

  // Fine-tuning buttons
  document.getElementById("btn-fine-left").onclick = () => {
    if (!isMoving && !gameOver) {
      aimAngle -= 0.035;
      updateAngleDisplay();
    }
  };
  document.getElementById("btn-fine-right").onclick = () => {
    if (!isMoving && !gameOver) {
      aimAngle += 0.035;
      updateAngleDisplay();
    }
  };

  // Power slider handling
  const slider = document.getElementById("power-slider");
  const powerDisp = document.getElementById("power-display");
  const powerZoneLabel = document.getElementById("power-zone-label");

  function updatePowerDisplay(val) {
    power = val / 100;
    powerDisp.textContent = `${val}%`;
    if (val < 35) {
      powerZoneLabel.textContent = "LOW";
      powerZoneLabel.style.color = "#10b981";
    } else if (val < 70) {
      powerZoneLabel.textContent = "MED";
      powerZoneLabel.style.color = "#facc15";
    } else {
      powerZoneLabel.textContent = "HIGH";
      powerZoneLabel.style.color = "#ef4444";
    }
  }

  slider.oninput = () => updatePowerDisplay(parseInt(slider.value));
  updatePowerDisplay(50);

  // Shoot button click
  document.getElementById("btn-shoot-ball").onclick = () => {
    if (!isMoving && !gameOver && turnIndex === 0) {
      executeShot(power);
    }
  };

  function executeShot(pwr) {
    const cue = balls[0];
    if (!cue || cue.pocketed) return;

    // Trigger cue stick strike animation
    isStrikingAnimation = true;
    stickStrikeOffset = 25;

    setTimeout(() => {
      isStrikingAnimation = false;
      stickStrikeOffset = 0;
      const speed = 10 + pwr * 26;
      cue.vx = Math.cos(aimAngle) * speed;
      cue.vy = Math.sin(aimAngle) * speed;
      isMoving = true;
      firstContactBall = null;
      ballsPocketedThisShot = [];
      scratchedThisShot = false;

      const ticker = document.getElementById("game-status-ticker");
      if (ticker) ticker.textContent = "Shot executed with " + Math.round(pwr * 100) + "% power!";
    }, 120);
  }

  // Raycast Aiming Guide: Finds first collision along aim line
  function calculateAimPrediction() {
    const cue = balls[0];
    if (!cue || cue.pocketed) return null;

    const maxDist = 320;
    let hitBall = null;
    let minT = maxDist;

    // Raycast against all object balls
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
      // Normal vector from ghost cue ball to target ball center
      const normDx = hitBall.x - ghostCueX;
      const normDy = hitBall.y - ghostCueY;
      const normLen = Math.sqrt(normDx * normDx + normDy * normDy) || 1;
      const nx = normDx / normLen;
      const ny = normDy / normLen;

      // Predicted target ball direction
      targetTrajectory = {
        startX: hitBall.x,
        startY: hitBall.y,
        endX: hitBall.x + nx * 90,
        endY: hitBall.y + ny * 90
      };

      // Deflected cue trajectory (tangent)
      const tangentX = -ny;
      const tangentY = nx;
      const dotTangent = dirX * tangentX + dirY * tangentY;
      deflectedCueTrajectory = {
        startX: ghostCueX,
        startY: ghostCueY,
        endX: ghostCueX + tangentX * Math.sign(dotTangent || 1) * 45,
        endY: ghostCueY + tangentY * Math.sign(dotTangent || 1) * 45
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

  // Physics Simulation Loop
  function updatePhysics() {
    let anyMoving = false;
    const friction = 0.986;
    const stopSpeed = 0.12;

    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      if (b.pocketed) continue;

      if (b.sinking > 0) {
        b.sinking += 0.06;
        b.vx *= 0.45;
        b.vy *= 0.45;
        if (b.sinking >= 1) {
          b.pocketed = true;
          handlePocketedBall(b);
        }
        anyMoving = true;
        continue;
      }

      b.x += b.vx;
      b.y += b.vy;
      b.vx *= friction;
      b.vy *= friction;

      const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      if (spd < stopSpeed) {
        b.vx = 0;
        b.vy = 0;
      } else {
        anyMoving = true;
      }

      // Cushion collisions with damping
      if (b.x - b.r < playMinX) { b.x = playMinX + b.r; b.vx = -b.vx * 0.85; }
      else if (b.x + b.r > playMaxX) { b.x = playMaxX - b.r; b.vx = -b.vx * 0.85; }

      if (b.y - b.r < playMinY) { b.y = playMinY + b.r; b.vy = -b.vy * 0.85; }
      else if (b.y + b.r > playMaxY) { b.y = playMaxY - b.r; b.vy = -b.vy * 0.85; }

      // Pocket entry check
      for (let p of pockets) {
        const dx = b.x - p.x;
        const dy = b.y - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < p.r + 3) {
          b.sinking = 0.05;
          anyMoving = true;
          break;
        }
      }
    }

    // Ball-to-ball elastic collisions
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
          // Record first object ball hit by cue ball
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

          b1.vx -= impulse * nx * 0.96;
          b1.vy -= impulse * ny * 0.96;
          b2.vx += impulse * nx * 0.96;
          b2.vy += impulse * ny * 0.96;
          anyMoving = true;
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

  // Shot Settled: Evaluate Rules, Turn Switching, & 8-Ball
  function onShotSettled() {
    if (gameOver) return;

    const activePlayer = currentRoom.players[turnIndex];
    const opponentPlayer = currentRoom.players[turnIndex === 0 ? 1 : 0];
    const ownGroup = turnIndex === 0 ? p1Group : p2Group;

    let isFoul = false;
    let isMiss = false;
    let continueTurn = false;
    let statusMessage = "";

    // 1. Cue Ball Scratch
    if (scratchedThisShot) {
      isFoul = true;
      const cue = balls[0];
      cue.pocketed = false;
      cue.sinking = 0;
      cue.x = width / 2;
      cue.y = playMaxY - 110;
      cue.vx = 0;
      cue.vy = 0;
      statusMessage = "FOUL: Cue ball scratch! Turn to opponent.";
    }

    // 2. 8-Ball Pocketed Check
    const eightPocketed = ballsPocketedThisShot.some(b => b.id === 8);
    if (eightPocketed) {
      const ownCleared = ownGroup === "SOLIDS" ? sunkSolids.length >= 7 : (ownGroup === "STRIPES" ? sunkStripes.length >= 7 : false);
      if (ownCleared && !scratchedThisShot && !isFoul) {
        finishMatch(activePlayer, `8-BALL POCKETED! ${activePlayer.name} takes the victory!`);
        return;
      } else {
        finishMatch(opponentPlayer, `8-BALL FOUL! Potted illegally by ${activePlayer.name}.`);
        return;
      }
    }

    // 3. Check for Miss (no ball hit)
    if (!firstContactBall && !scratchedThisShot) {
      isMiss = true;
      statusMessage = "MISS: No target ball contacted. Opponent's turn.";
    }

    // 4. Group Assignment on first legal pocket
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
        document.getElementById("p1-group").textContent = p1Group;
        document.getElementById("p2-group").textContent = p2Group;
      }
    }

    // 5. Wrong Ball First Contact Foul (if groups already assigned)
    if (!isFoul && !isMiss && ownGroup !== "OPEN" && firstContactBall) {
      const ownCleared = ownGroup === "SOLIDS" ? sunkSolids.length >= 7 : sunkStripes.length >= 7;
      if (ownGroup === "SOLIDS" && firstContactBall.type === "STRIPE") {
        isFoul = true;
        statusMessage = "FOUL: Hit opponent's stripe first!";
      } else if (ownGroup === "STRIPES" && firstContactBall.type === "SOLID") {
        isFoul = true;
        statusMessage = "FOUL: Hit opponent's solid first!";
      } else if (firstContactBall.id === 8 && !ownCleared) {
        isFoul = true;
        statusMessage = "FOUL: Hit 8-Ball before clearing assigned group!";
      }
    }

    // 6. Evaluate Turn Continuation:
    // If player made a valid shot and legally pocketed at least one of their assigned balls without foul
    if (!isFoul && !isMiss) {
      let legallyPocketed = false;
      if (ownGroup === "OPEN") {
        legallyPocketed = ballsPocketedThisShot.some(b => b.id !== 0 && b.id !== 8);
      } else {
        legallyPocketed = ballsPocketedThisShot.some(b => b.type === (ownGroup === "SOLIDS" ? "SOLID" : "STRIPE"));
      }

      if (legallyPocketed) {
        continueTurn = true;
        statusMessage = "GOOD SHOT! " + activePlayer.name + " continues.";
      } else {
        statusMessage = "Turn completed. Switching to opponent.";
      }
    }

    // Update UI Status Ticker
    const ticker = document.getElementById("game-status-ticker");
    if (ticker) ticker.textContent = statusMessage;

    // Show Shot Result Pill
    const pill = document.getElementById("shot-result-pill");
    if (pill) {
      pill.style.display = "inline-block";
      if (continueTurn) {
        pill.textContent = "GOOD SHOT";
        pill.style.background = "#1b4d30";
        pill.style.color = "var(--gold)";
      } else if (isFoul) {
        pill.textContent = "FOUL";
        pill.style.background = "#4d1b1b";
        pill.style.color = "var(--loss-red)";
      } else {
        pill.textContent = "MISS / PASS";
        pill.style.background = "#374151";
        pill.style.color = "#d1d5db";
      }
      setTimeout(() => { if (pill) pill.style.display = "none"; }, 2500);
    }

    // Turn Passing logic
    if (!continueTurn) {
      turnIndex = turnIndex === 0 ? 1 : 0;
    }

    // Update Player HUD Active Highlighting
    const isP1Active = turnIndex === 0;
    document.getElementById("turn-banner").textContent = isP1Active ? "YOUR TURN" : `${currentRoom.players[1].name.toUpperCase()}'S TURN`;
    document.getElementById("hud-p1").style.opacity = isP1Active ? "1" : "0.45";
    document.getElementById("hud-p2").style.opacity = !isP1Active ? "1" : "0.45";
    document.getElementById("p1-turn-dot").style.background = isP1Active ? "var(--emerald)" : "#6b7280";
    document.getElementById("p2-turn-dot").style.background = !isP1Active ? "var(--emerald)" : "#6b7280";

    // Opponent AI Auto-shot
    if (turnIndex === 1 && !gameOver) {
      setTimeout(() => {
        if (!gameOver) {
          const cue = balls[0];
          // Find target ball
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
            executeShot(0.48 + Math.random() * 0.15);
          }
        }
      }, 1400);
    }
  }

  // Complete Match & Record Result with Single-credit safety
  function finishMatch(winner, reason) {
    if (gameOver || matchHandled) return;
    gameOver = true;
    matchHandled = true;
    clearInterval(timerInterval);

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
      u.matchesPlayed++;
      const prevBal = u.coinBalance;
      if (isUserWinner) {
        u.coinBalance += pot;
        u.matchesWon++;
        recordTransaction(u.id, u.playerId, "MATCH_RESULT", pot, prevBal, u.coinBalance, `Won match in ${currentRoom.roomId}`);
      } else {
        u.matchesLost++;
      }
      setStorage("users", users);
      currentUser.coinBalance = u.coinBalance;
      currentUser.matchesPlayed = u.matchesPlayed;
      currentUser.matchesWon = u.matchesWon;
      currentUser.matchesLost = u.matchesLost;
      setStorage("current_user", currentUser);
    }

    // Show Match Result Dialog (Requirement 13)
    const modal = document.createElement("div");
    modal.className = "modal-backdrop";
    modal.innerHTML = `
      <div class="modal-card" style="text-align: center; border: 2px solid ${isUserWinner ? 'var(--gold)' : 'var(--bg-card-border)'};">
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

        <button id="btn-finish-lobby" class="btn btn-gold btn-block" style="height: 48px; font-size: 15px;">
          RETURN TO LOBBY
        </button>
      </div>
    `;
    document.getElementById("app-container").appendChild(modal);

    modal.querySelector("#btn-finish-lobby").onclick = () => {
      modal.remove();
      currentRoom = null;
      navigateTo("/play");
    };
  }

  // Forfeit handler
  document.getElementById("btn-leave-match").onclick = () => {
    if (confirm("Forfeit match? Entry coins will be lost.")) {
      finishMatch(currentRoom.players[1], `${currentUser.username} forfeited the match.`);
    }
  };

  // Drawing Engine - High Fidelity Billiards Table
  function drawTable() {
    ctx.clearRect(0, 0, width, height);

    // 1. Solid Hardwood Border Rails
    const railGrad = ctx.createLinearGradient(0, 0, width, height);
    railGrad.addColorStop(0, "#4a2810");
    railGrad.addColorStop(0.5, "#2f1708");
    railGrad.addColorStop(1, "#1c0c04");
    ctx.fillStyle = railGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Premium Emerald Felt Cloth
    const feltGrad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, height * 0.7);
    feltGrad.addColorStop(0, "#0e693f");
    feltGrad.addColorStop(0.7, "#094e2e");
    feltGrad.addColorStop(1, "#063c22");
    ctx.fillStyle = feltGrad;
    ctx.fillRect(playMinX, playMinY, playMaxX - playMinX, playMaxY - playMinY);

    // Head String Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(playMinX, playMaxY - 110);
    ctx.lineTo(playMaxX, playMaxY - 110);
    ctx.stroke();

    // 3. Six Pockets with Gold Rim Accents
    for (let p of pockets) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#1e140c";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "#090909";
      ctx.fill();

      ctx.strokeStyle = "#c5a059";
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    // 4. Aiming Direction Line, Collision Guide & Trajectories (Requirement 7)
    const cue = balls[0];
    if (cue && !cue.pocketed && !isMoving && !gameOver && turnIndex === 0) {
      const pred = calculateAimPrediction();
      if (pred) {
        // Aim line to contact point
        ctx.beginPath();
        ctx.moveTo(cue.x, cue.y);
        ctx.lineTo(pred.ghostX, pred.ghostY);
        ctx.strokeStyle = "rgba(255, 213, 79, 0.85)";
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ghost Cue Ball at predicted collision point
        ctx.beginPath();
        ctx.arc(pred.ghostX, pred.ghostY, cue.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Predicted Target Ball Trajectory
        if (pred.hasHit && pred.targetTrajectory) {
          ctx.beginPath();
          ctx.moveTo(pred.targetTrajectory.startX, pred.targetTrajectory.startY);
          ctx.lineTo(pred.targetTrajectory.endX, pred.targetTrajectory.endY);
          ctx.strokeStyle = "rgba(16, 185, 129, 0.9)";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Arrow head at target end
          const angle = Math.atan2(pred.targetTrajectory.endY - pred.targetTrajectory.startY, pred.targetTrajectory.endX - pred.targetTrajectory.startX);
          ctx.beginPath();
          ctx.moveTo(pred.targetTrajectory.endX, pred.targetTrajectory.endY);
          ctx.lineTo(pred.targetTrajectory.endX - Math.cos(angle - Math.PI / 6) * 7, pred.targetTrajectory.endY - Math.sin(angle - Math.PI / 6) * 7);
          ctx.lineTo(pred.targetTrajectory.endX - Math.cos(angle + Math.PI / 6) * 7, pred.targetTrajectory.endY - Math.sin(angle + Math.PI / 6) * 7);
          ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
          ctx.fill();
        }

        // Predicted Cue Ball Deflection Trajectory
        if (pred.hasHit && pred.deflectedTrajectory) {
          ctx.beginPath();
          ctx.moveTo(pred.deflectedTrajectory.startX, pred.deflectedTrajectory.startY);
          ctx.lineTo(pred.deflectedTrajectory.endX, pred.deflectedTrajectory.endY);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 1.2;
          ctx.setLineDash([2, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Cue Stick with Rotation & Pullback Animation
      const pullback = 12 + power * 35 - stickStrikeOffset;
      const stickStart = cue.r + pullback;
      const stickEnd = stickStart + 150;
      const cosA = Math.cos(aimAngle);
      const sinA = Math.sin(aimAngle);

      ctx.beginPath();
      ctx.moveTo(cue.x - cosA * stickStart, cue.y - sinA * stickStart);
      ctx.lineTo(cue.x - cosA * stickEnd, cue.y - sinA * stickEnd);
      ctx.strokeStyle = "#8d5b4c";
      ctx.lineWidth = 5.5;
      ctx.lineCap = "round";
      ctx.stroke();

      // Cue tip highlight
      ctx.beginPath();
      ctx.moveTo(cue.x - cosA * stickStart, cue.y - sinA * stickStart);
      ctx.lineTo(cue.x - cosA * (stickStart + 10), cue.y - sinA * (stickStart + 10));
      ctx.strokeStyle = "#ffd54f";
      ctx.lineWidth = 5.5;
      ctx.stroke();
    }

    // 5. Draw All Colorful 3D Pool Balls (Requirement 6)
    for (let b of balls) {
      if (b.pocketed) continue;
      const r = b.r * (1 - b.sinking * 0.7);

      // Realistic Drop Shadow
      ctx.beginPath();
      ctx.arc(b.x + 2, b.y + 2.5, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fill();

      // Base Ball Sphere
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();

      // Striped Ball Equatorial Stripe Band
      if (b.type === "STRIPE") {
        ctx.beginPath();
        ctx.arc(b.x, b.y, r * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }

      // Central White Number Badge
      if (b.id !== 0) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        ctx.fillStyle = "#111827";
        ctx.font = `bold ${Math.round(r * 0.65)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(b.id, b.x, b.y + 0.5);
      }

      // Glossy 3D Specular Highlight
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
