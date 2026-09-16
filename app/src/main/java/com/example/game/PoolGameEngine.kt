package com.example.game

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

data class MatchPlayer(
    val playerId: String,
    val username: String,
    val avatar: String,
    val team: Int = 1, // 1 or 2
    var group: PlayerGroup = PlayerGroup.UNASSIGNED,
    val isBot: Boolean = false
)

class PoolGameEngine(
    val table: PoolTable,
    val players: List<MatchPlayer>,
    val mode: String, // "1v1" or "2v2"
    val durationMinutes: Int,
    val entryAmount: Long,
    val onMatchEnded: (winner: MatchPlayer, loser: MatchPlayer, reason: String) -> Unit
) {
    val balls = mutableStateListOf<PoolBall>()

    var activePlayerIndex by mutableIntStateOf(0)
    val activePlayer: MatchPlayer get() = players[activePlayerIndex % players.size]

    var isMoving by mutableStateOf(false)
    var aimAngle by mutableFloatStateOf(-1.5707963f) // -90 deg (upwards)
    var shotPower by mutableFloatStateOf(0f) // 0f to 1f

    var statusMessage by mutableStateOf("Break shot! Drag aim & pull power slider to shoot")
    var isGameOver by mutableStateOf(false)
    var winnerPlayer by mutableStateOf<MatchPlayer?>(null)
    var winReason by mutableStateOf("")

    // Sunk balls tracking
    val sunkSolids = mutableStateListOf<Int>()
    val sunkStripes = mutableStateListOf<Int>()
    var isEightBallSunk by mutableStateOf(false)

    // Shot evaluation state
    private var firstBallHit: PoolBall? = null
    private val ballsSunkInCurrentShot = mutableListOf<PoolBall>()
    private var isScratchThisShot = false

    // Countdown timer
    var timeRemainingSeconds by mutableIntStateOf(durationMinutes * 60)

    init {
        resetGame()
    }

    fun resetGame() {
        balls.clear()
        balls.addAll(table.createStandardBalls())
        sunkSolids.clear()
        sunkStripes.clear()
        isEightBallSunk = false
        isMoving = false
        activePlayerIndex = 0
        isGameOver = false
        winnerPlayer = null
        timeRemainingSeconds = durationMinutes * 60
        statusMessage = "${activePlayer.username}'s turn to break!"
    }

    fun cueBall(): PoolBall? = balls.firstOrNull { it.id == 0 && !it.isPocketed }

    fun setAimDirection(touchX: Float, touchY: Float) {
        if (isMoving || isGameOver) return
        val cue = cueBall() ?: return
        aimAngle = atan2(touchY - cue.y, touchX - cue.x)
    }

    fun shoot(power: Float) {
        if (isMoving || isGameOver) return
        val cue = cueBall() ?: return
        val clampedPower = power.coerceIn(0.1f, 1.0f)
        val maxSpeed = 38f
        val launchSpeed = clampedPower * maxSpeed

        cue.vx = cos(aimAngle) * launchSpeed
        cue.vy = sin(aimAngle) * launchSpeed

        firstBallHit = null
        ballsSunkInCurrentShot.clear()
        isScratchThisShot = false
        isMoving = true
        statusMessage = "${activePlayer.username} shot the cue ball!"
    }

    fun updatePhysics(dt: Float = 0.016f) {
        if (isGameOver) return

        var anyBallMoving = false
        val friction = 0.985f
        val stopThreshold = 0.18f

        // 1. Position update & friction
        for (ball in balls) {
            if (ball.isPocketed) continue

            // Pocket sinking animation progress
            if (ball.pocketProgress > 0f) {
                ball.pocketProgress += dt * 4f
                ball.vx *= 0.5f
                ball.vy *= 0.5f
                if (ball.pocketProgress >= 1f) {
                    ball.isPocketed = true
                    handleBallPocketed(ball)
                }
                anyBallMoving = true
                continue
            }

            ball.x += ball.vx
            ball.y += ball.vy

            ball.vx *= friction
            ball.vy *= friction

            if (ball.speed < stopThreshold) {
                ball.vx = 0f
                ball.vy = 0f
            } else {
                anyBallMoving = true
            }

            // Cushion collisions
            val r = ball.radius
            if (ball.x - r < table.playMinX) {
                ball.x = table.playMinX + r
                ball.vx = -ball.vx * 0.85f
            } else if (ball.x + r > table.playMaxX) {
                ball.x = table.playMaxX - r
                ball.vx = -ball.vx * 0.85f
            }

            if (ball.y - r < table.playMinY) {
                ball.y = table.playMinY + r
                ball.vy = -ball.vy * 0.85f
            } else if (ball.y + r > table.playMaxY) {
                ball.y = table.playMaxY - r
                ball.vy = -ball.vy * 0.85f
            }

            // Pocket check
            for (pocket in table.pockets) {
                val dx = ball.x - pocket.x
                val dy = ball.y - pocket.y
                val dist = sqrt(dx * dx + dy * dy)
                if (dist < pocket.radius + 4f) {
                    ball.pocketProgress = 0.01f
                    ball.vx *= 0.3f
                    ball.vy *= 0.3f
                    anyBallMoving = true
                    break
                }
            }
        }

        // 2. Ball-to-ball collisions
        val ballCount = balls.size
        for (i in 0 until ballCount) {
            val b1 = balls[i]
            if (b1.isPocketed || b1.pocketProgress > 0f) continue

            for (j in i + 1 until ballCount) {
                val b2 = balls[j]
                if (b2.isPocketed || b2.pocketProgress > 0f) continue

                val dx = b2.x - b1.x
                val dy = b2.y - b1.y
                val dist = sqrt(dx * dx + dy * dy)
                val minDist = b1.radius + b2.radius

                if (dist < minDist && dist > 0f) {
                    // Register first ball hit for cue ball
                    if ((b1.id == 0 || b2.id == 0) && firstBallHit == null) {
                        firstBallHit = if (b1.id == 0) b2 else b1
                    }

                    // Overlap resolution
                    val overlap = 0.5f * (minDist - dist)
                    val nx = dx / dist
                    val ny = dy / dist

                    b1.x -= nx * overlap
                    b1.y -= ny * overlap
                    b2.x += nx * overlap
                    b2.y += ny * overlap

                    // Elastic collision response
                    val kx = b1.vx - b2.vx
                    val ky = b1.vy - b2.vy
                    val p = 2f * (nx * kx + ny * ky) / 2f // Equal mass

                    b1.vx -= p * nx * 0.94f
                    b1.vy -= p * ny * 0.94f
                    b2.vx += p * nx * 0.94f
                    b2.vy += p * ny * 0.94f

                    anyBallMoving = true
                }
            }
        }

        // 3. State transition when motion completes
        if (isMoving && !anyBallMoving) {
            isMoving = false
            evaluateTurnAfterStop()
        }
    }

    private fun handleBallPocketed(ball: PoolBall) {
        ballsSunkInCurrentShot.add(ball)
        when (ball.type) {
            BallType.CUE -> {
                isScratchThisShot = true
            }
            BallType.SOLID -> {
                if (!sunkSolids.contains(ball.id)) sunkSolids.add(ball.id)
            }
            BallType.STRIPE -> {
                if (!sunkStripes.contains(ball.id)) sunkStripes.add(ball.id)
            }
            BallType.EIGHT -> {
                isEightBallSunk = true
            }
        }
    }

    private fun evaluateTurnAfterStop() {
        if (isGameOver) return

        val currentPlayer = activePlayer
        var keepTurn = false
        var foulOccurred = false
        var foulMsg = ""

        // Handle scratch
        if (isScratchThisShot) {
            foulOccurred = true
            foulMsg = "Foul: Cue ball scratched!"
            respawnCueBall()
        }

        // Handle 8-Ball pocketed
        if (isEightBallSunk) {
            val playerGroup = currentPlayer.group
            val allOwnSunk = when (playerGroup) {
                PlayerGroup.SOLIDS -> sunkSolids.size >= 7
                PlayerGroup.STRIPES -> sunkStripes.size >= 7
                PlayerGroup.UNASSIGNED -> false
            }

            if (allOwnSunk && !foulOccurred) {
                // Legitimate 8-ball sink -> WIN!
                endGame(currentPlayer, getOpponentPlayer(currentPlayer), "${currentPlayer.username} legally potted the 8-Ball!")
                return
            } else {
                // Early 8-ball sink or scratched on 8-ball -> LOSS!
                val opponent = getOpponentPlayer(currentPlayer)
                val reason = if (foulOccurred) "Scratched while potting the 8-Ball!" else "Early 8-Ball pocketed before clearing group!"
                endGame(opponent, currentPlayer, reason)
                return
            }
        }

        // Group assignment if unassigned
        val solidsSunkNow = ballsSunkInCurrentShot.count { it.type == BallType.SOLID }
        val stripesSunkNow = ballsSunkInCurrentShot.count { it.type == BallType.STRIPE }

        if (currentPlayer.group == PlayerGroup.UNASSIGNED && !foulOccurred) {
            if (solidsSunkNow > 0 && stripesSunkNow == 0) {
                assignGroups(currentPlayer, PlayerGroup.SOLIDS)
                statusMessage = "${currentPlayer.username} is SOLIDS! Opponent is STRIPES."
                keepTurn = true
            } else if (stripesSunkNow > 0 && solidsSunkNow == 0) {
                assignGroups(currentPlayer, PlayerGroup.STRIPES)
                statusMessage = "${currentPlayer.username} is STRIPES! Opponent is SOLIDS."
                keepTurn = true
            }
        } else if (!foulOccurred && currentPlayer.group != PlayerGroup.UNASSIGNED) {
            val ownBallsPotted = ballsSunkInCurrentShot.any {
                (currentPlayer.group == PlayerGroup.SOLIDS && it.type == BallType.SOLID) ||
                (currentPlayer.group == PlayerGroup.STRIPES && it.type == BallType.STRIPE)
            }
            if (ownBallsPotted) {
                keepTurn = true
                statusMessage = "Great pot! ${currentPlayer.username} shoots again."
            }
        }

        // Check if cue ball hit opponent's ball first or no ball
        if (firstBallHit == null) {
            foulOccurred = true
            foulMsg = "Foul: Cue ball did not contact any ball!"
        } else if (currentPlayer.group != PlayerGroup.UNASSIGNED) {
            val expectedType = if (currentPlayer.group == PlayerGroup.SOLIDS) BallType.SOLID else BallType.STRIPE
            val ownLeft = if (currentPlayer.group == PlayerGroup.SOLIDS) (7 - sunkSolids.size) else (7 - sunkStripes.size)
            if (ownLeft > 0 && firstBallHit?.type != expectedType) {
                foulOccurred = true
                foulMsg = "Foul: Did not strike own group ball first!"
            }
        }

        if (foulOccurred) {
            statusMessage = "$foulMsg Turn passes."
            nextTurn()
        } else if (!keepTurn) {
            statusMessage = "No ball potted. Turn passes."
            nextTurn()
        }

        // Default aim angle towards nearest remaining ball
        orientAimTowardsNearestBall()

        // Trigger bot shot if it's bot's turn
        if (activePlayer.isBot && !isGameOver) {
            scheduleBotTurn()
        }
    }

    private fun respawnCueBall() {
        val cue = balls.firstOrNull { it.id == 0 }
        if (cue != null) {
            cue.isPocketed = false
            cue.pocketProgress = 0f
            cue.x = table.width / 2f
            cue.y = table.playMaxY - 120f
            cue.vx = 0f
            cue.vy = 0f
        }
    }

    private fun assignGroups(player: MatchPlayer, group: PlayerGroup) {
        for (p in players) {
            if (p.team == player.team) {
                p.group = group
            } else {
                p.group = if (group == PlayerGroup.SOLIDS) PlayerGroup.STRIPES else PlayerGroup.SOLIDS
            }
        }
    }

    private fun getOpponentPlayer(player: MatchPlayer): MatchPlayer {
        return players.firstOrNull { it.team != player.team } ?: players.first()
    }

    private fun nextTurn() {
        activePlayerIndex = (activePlayerIndex + 1) % players.size
    }

    private fun orientAimTowardsNearestBall() {
        val cue = cueBall() ?: return
        val targetBalls = balls.filter { !it.isPocketed && it.id != 0 }
        val nearest = targetBalls.minByOrNull {
            val dx = it.x - cue.x
            val dy = it.y - cue.y
            dx * dx + dy * dy
        }
        if (nearest != null) {
            aimAngle = atan2(nearest.y - cue.y, nearest.x - cue.x)
        }
    }

    fun tickTimerOneSecond() {
        if (isGameOver) return
        timeRemainingSeconds--
        if (timeRemainingSeconds <= 0) {
            timeRemainingSeconds = 0
            // Timeout -> winner is player with more sunk balls
            val p1Sunk = if (players[0].group == PlayerGroup.SOLIDS) sunkSolids.size else sunkStripes.size
            val p2 = getOpponentPlayer(players[0])
            val p2Sunk = if (p2.group == PlayerGroup.SOLIDS) sunkSolids.size else sunkStripes.size

            if (p1Sunk >= p2Sunk) {
                endGame(players[0], p2, "Match timer expired! ${players[0].username} won on points ($p1Sunk vs $p2Sunk).")
            } else {
                endGame(p2, players[0], "Match timer expired! ${p2.username} won on points ($p2Sunk vs $p1Sunk).")
            }
        }
    }

    fun endGame(winner: MatchPlayer, loser: MatchPlayer, reason: String) {
        if (isGameOver) return
        isGameOver = true
        winnerPlayer = winner
        winReason = reason
        statusMessage = "Match Ended! ${winner.username} WINS!"
        onMatchEnded(winner, loser, reason)
    }

    fun forfeitMatch(forfeitingPlayer: MatchPlayer) {
        val winner = getOpponentPlayer(forfeitingPlayer)
        endGame(winner, forfeitingPlayer, "${forfeitingPlayer.username} forfeited the match.")
    }

    fun triggerBotShot() {
        if (isMoving || isGameOver || !activePlayer.isBot) return
        val cue = cueBall() ?: return
        orientAimTowardsNearestBall()
        shoot(power = 0.55f)
    }

    private fun scheduleBotTurn() {
        // Handled via UI coroutine or LaunchedEffect
    }
}
