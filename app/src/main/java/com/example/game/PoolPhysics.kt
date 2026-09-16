package com.example.game

import androidx.compose.ui.graphics.Color
import com.example.ui.theme.BallBlack
import com.example.ui.theme.BallBlue
import com.example.ui.theme.BallCue
import com.example.ui.theme.BallGreen
import com.example.ui.theme.BallMaroon
import com.example.ui.theme.BallOrange
import com.example.ui.theme.BallPurple
import com.example.ui.theme.BallRed
import com.example.ui.theme.BallYellow
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

enum class BallType {
    CUE, SOLID, EIGHT, STRIPE
}

data class PoolBall(
    val id: Int, // 0 = Cue, 1-7 = Solids, 8 = Eight, 9-15 = Stripes
    var x: Float,
    var y: Float,
    var vx: Float = 0f,
    var vy: Float = 0f,
    val radius: Float = 14f,
    val type: BallType,
    val baseColor: Color,
    var isPocketed: Boolean = false,
    var pocketProgress: Float = 0f // 0f to 1f for sinking animation
) {
    val speed: Float get() = sqrt(vx * vx + vy * vy)
}

enum class PlayerGroup {
    UNASSIGNED, SOLIDS, STRIPES
}

data class Pocket(
    val x: Float,
    val y: Float,
    val radius: Float = 22f
)

class PoolTable(
    val width: Float = 360f,
    val height: Float = 600f,
    val cushionSize: Float = 28f
) {
    val playMinX get() = cushionSize
    val playMaxX get() = width - cushionSize
    val playMinY get() = cushionSize
    val playMaxY get() = height - cushionSize

    val pockets = listOf(
        Pocket(playMinX + 2f, playMinY + 2f, 26f), // Top Left
        Pocket(width / 2f, playMinY - 2f, 24f),     // Top Middle
        Pocket(playMaxX - 2f, playMinY + 2f, 26f), // Top Right
        Pocket(playMinX + 2f, playMaxY - 2f, 26f), // Bottom Left
        Pocket(width / 2f, playMaxY + 2f, 24f),     // Bottom Middle
        Pocket(playMaxX - 2f, playMaxY - 2f, 26f)  // Bottom Right
    )

    fun createStandardBalls(): MutableList<PoolBall> {
        val balls = mutableListOf<PoolBall>()
        val ballRadius = 13f

        // Ball 0: Cue Ball
        balls.add(
            PoolBall(
                id = 0,
                x = width / 2f,
                y = playMaxY - 120f,
                radius = ballRadius,
                type = BallType.CUE,
                baseColor = BallCue
            )
        )

        // Racked balls 1-15 in triangle
        val rackApexY = playMinY + 140f
        val rackApexX = width / 2f
        val rowSpacing = ballRadius * 1.732f // sqrt(3) * r
        val colSpacing = ballRadius * 2.05f

        val ballConfigs = listOf(
            // Row 0 (1 ball)
            Triple(1, BallType.SOLID, BallYellow),
            // Row 1 (2 balls)
            Triple(9, BallType.STRIPE, BallYellow),
            Triple(2, BallType.SOLID, BallBlue),
            // Row 2 (3 balls) - 8 ball in center!
            Triple(10, BallType.STRIPE, BallBlue),
            Triple(8, BallType.EIGHT, BallBlack),
            Triple(3, BallType.SOLID, BallRed),
            // Row 3 (4 balls)
            Triple(4, BallType.SOLID, BallPurple),
            Triple(11, BallType.STRIPE, BallRed),
            Triple(12, BallType.STRIPE, BallPurple),
            Triple(5, BallType.SOLID, BallOrange),
            // Row 4 (5 balls)
            Triple(13, BallType.STRIPE, BallOrange),
            Triple(6, BallType.SOLID, BallGreen),
            Triple(14, BallType.STRIPE, BallGreen),
            Triple(7, BallType.SOLID, BallMaroon),
            Triple(15, BallType.STRIPE, BallMaroon)
        )

        var configIndex = 0
        for (row in 0..4) {
            val startX = rackApexX - (row * colSpacing / 2f)
            val currentY = rackApexY + (row * rowSpacing)
            for (col in 0..row) {
                if (configIndex < ballConfigs.size) {
                    val (id, type, color) = ballConfigs[configIndex]
                    balls.add(
                        PoolBall(
                            id = id,
                            x = startX + (col * colSpacing),
                            y = currentY,
                            radius = ballRadius,
                            type = type,
                            baseColor = color
                        )
                    )
                    configIndex++
                }
            }
        }

        return balls
    }
}
