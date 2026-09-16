package com.example.game

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.BrightFeltGreen
import com.example.ui.theme.CueWood
import com.example.ui.theme.EmeraldGreen
import com.example.ui.theme.GoldYellow
import com.example.ui.theme.PoolCard
import com.example.ui.theme.RailWood
import kotlinx.coroutines.delay
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

@Composable
fun PoolGameCanvas(
    engine: PoolGameEngine,
    modifier: Modifier = Modifier
) {
    val textMeasurer = rememberTextMeasurer()
    var powerInput by remember { mutableFloatStateOf(0.45f) }

    // Physics Loop: 60 FPS
    LaunchedEffect(engine.isGameOver) {
        while (!engine.isGameOver) {
            engine.updatePhysics(0.016f)
            delay(16L)
        }
    }

    // Bot Auto Shot Trigger
    LaunchedEffect(engine.activePlayerIndex, engine.isMoving, engine.isGameOver) {
        if (!engine.isGameOver && !engine.isMoving && engine.activePlayer.isBot) {
            delay(1200L) // Think time
            engine.triggerBotShot()
        }
    }

    // Second Tick Loop
    LaunchedEffect(engine.isGameOver) {
        while (!engine.isGameOver) {
            delay(1000L)
            engine.tickTimerOneSecond()
        }
    }

    BoxWithConstraints(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF07120C)),
        contentAlignment = Alignment.Center
    ) {
        val availableWidth = constraints.maxWidth.toFloat()
        val availableHeight = constraints.maxHeight.toFloat()

        // Maintain 1:1.6 table aspect ratio
        val scale = (availableWidth / engine.table.width).coerceAtMost(availableHeight / engine.table.height) * 0.94f
        val tableDrawWidth = engine.table.width * scale
        val tableDrawHeight = engine.table.height * scale

        Row(
            modifier = Modifier.fillMaxSize(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Main Pool Table Canvas
            Box(
                modifier = Modifier
                    .size(
                        width = (tableDrawWidth / 2.7f).dp,
                        height = (tableDrawHeight / 2.7f).dp
                    )
                    .clip(RoundedCornerShape(16.dp))
                    .border(3.dp, Color(0xFF5E3A1E), RoundedCornerShape(16.dp))
                    .pointerInput(engine.isMoving, engine.isGameOver) {
                        detectDragGestures { change, _ ->
                            if (!engine.isMoving && !engine.isGameOver) {
                                val touchX = change.position.x / (tableDrawWidth / 2.7f / engine.table.width)
                                val touchY = change.position.y / (tableDrawHeight / 2.7f / engine.table.height)
                                engine.setAimDirection(touchX, touchY)
                            }
                        }
                    }
                    .testTag("pool_table_canvas")
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val canvasScaleX = size.width / engine.table.width
                    val canvasScaleY = size.height / engine.table.height

                    // 1. Wood Rails
                    drawRect(
                        brush = Brush.radialGradient(
                            colors = listOf(Color(0xFF4A2810), Color(0xFF261205)),
                            center = Offset(size.width / 2f, size.height / 2f),
                            radius = size.height
                        ),
                        size = size
                    )

                    // 2. Green Felt Cloth
                    val feltX = engine.table.playMinX * canvasScaleX
                    val feltY = engine.table.playMinY * canvasScaleY
                    val feltW = (engine.table.playMaxX - engine.table.playMinX) * canvasScaleX
                    val feltH = (engine.table.playMaxY - engine.table.playMinY) * canvasScaleY

                    drawRect(
                        brush = Brush.verticalGradient(
                            colors = listOf(Color(0xFF0E693F), Color(0xFF094E2E), Color(0xFF0E693F))
                        ),
                        topLeft = Offset(feltX, feltY),
                        size = Size(feltW, feltH)
                    )

                    // Head String line & Foot spot markings
                    drawLine(
                        color = Color(0x33FFFFFF),
                        start = Offset(feltX, (engine.table.playMaxY - 120f) * canvasScaleY),
                        end = Offset(feltX + feltW, (engine.table.playMaxY - 120f) * canvasScaleY),
                        strokeWidth = 1.5f
                    )

                    // 3. Pockets
                    for (pocket in engine.table.pockets) {
                        val px = pocket.x * canvasScaleX
                        val py = pocket.y * canvasScaleY
                        val pr = pocket.radius * canvasScaleX

                        // Pocket Leather rim
                        drawCircle(
                            color = Color(0xFF1E140C),
                            radius = pr + 3f,
                            center = Offset(px, py)
                        )
                        // Pocket Drop Hole
                        drawCircle(
                            brush = Brush.radialGradient(
                                colors = listOf(Color(0xFF000000), Color(0xFF111111)),
                                center = Offset(px, py),
                                radius = pr
                            ),
                            radius = pr,
                            center = Offset(px, py)
                        )
                        // Metal Corner Rim
                        drawCircle(
                            color = Color(0xFFC5A059),
                            radius = pr + 3f,
                            center = Offset(px, py),
                            style = Stroke(width = 2.5f)
                        )
                    }

                    // 4. Aim Line & Ghost Ball (when cue ball is stopped)
                    val cue = engine.cueBall()
                    if (cue != null && !engine.isMoving && !engine.isGameOver) {
                        val cx = cue.x * canvasScaleX
                        val cy = cue.y * canvasScaleY
                        val aimLen = 280f * canvasScaleX

                        val endX = cx + cos(engine.aimAngle) * aimLen
                        val endY = cy + sin(engine.aimAngle) * aimLen

                        // Aim Guide Line
                        drawLine(
                            color = Color(0xCCFFFFFF),
                            start = Offset(cx, cy),
                            end = Offset(endX, endY),
                            strokeWidth = 2.5f,
                            cap = StrokeCap.Round
                        )

                        // Ghost Ball at aim line distance
                        val ghostDist = 70f * canvasScaleX
                        val gx = cx + cos(engine.aimAngle) * ghostDist
                        val gy = cy + sin(engine.aimAngle) * ghostDist
                        drawCircle(
                            color = Color(0x88FFFFFF),
                            radius = cue.radius * canvasScaleX,
                            center = Offset(gx, gy),
                            style = Stroke(width = 1.5f)
                        )

                        // Cue Stick Drawing (drawn behind cue ball along opposite angle)
                        val pullBackDist = (20f + powerInput * 45f) * canvasScaleX
                        val stickStartX = cx - cos(engine.aimAngle) * (cue.radius * canvasScaleX + pullBackDist)
                        val stickStartY = cy - sin(engine.aimAngle) * (cue.radius * canvasScaleX + pullBackDist)
                        val stickEndX = cx - cos(engine.aimAngle) * (cue.radius * canvasScaleX + pullBackDist + 160f * canvasScaleX)
                        val stickEndY = cy - sin(engine.aimAngle) * (cue.radius * canvasScaleX + pullBackDist + 160f * canvasScaleX)

                        // Cue shaft
                        drawLine(
                            color = CueWood,
                            start = Offset(stickStartX, stickStartY),
                            end = Offset(stickEndX, stickEndY),
                            strokeWidth = 5.5f,
                            cap = StrokeCap.Round
                        )
                        // Cue tip (leather)
                        val tipEndX = cx - cos(engine.aimAngle) * (cue.radius * canvasScaleX + pullBackDist + 8f * canvasScaleX)
                        val tipEndY = cy - sin(engine.aimAngle) * (cue.radius * canvasScaleX + pullBackDist + 8f * canvasScaleX)
                        drawLine(
                            color = Color(0xFF0088CC),
                            start = Offset(stickStartX, stickStartY),
                            end = Offset(tipEndX, tipEndY),
                            strokeWidth = 5.5f
                        )
                    }

                    // 5. Balls
                    for (ball in engine.balls) {
                        if (ball.isPocketed) continue

                        val bx = ball.x * canvasScaleX
                        val by = ball.y * canvasScaleY
                        val currentRadius = ball.radius * canvasScaleX * (1f - ball.pocketProgress * 0.7f)

                        // Ball Shadow
                        drawCircle(
                            color = Color(0x66000000),
                            radius = currentRadius + 1f,
                            center = Offset(bx + 2f, by + 2f)
                        )

                        // Base Ball Sphere
                        drawCircle(
                            color = ball.baseColor,
                            radius = currentRadius,
                            center = Offset(bx, by)
                        )

                        // Stripes Pattern (White band for stripes 9-15)
                        if (ball.type == BallType.STRIPE) {
                            drawCircle(
                                color = Color.White,
                                radius = currentRadius * 0.65f,
                                center = Offset(bx, by)
                            )
                        }

                        // Center White Circle for Number (for non-cue balls)
                        if (ball.id != 0) {
                            drawCircle(
                                color = Color.White,
                                radius = currentRadius * 0.42f,
                                center = Offset(bx, by)
                            )

                            // Number text
                            val numStr = ball.id.toString()
                            val textLayout = textMeasurer.measure(
                                text = numStr,
                                style = TextStyle(
                                    fontSize = (currentRadius * 0.6f).sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.Black
                                )
                            )
                            drawText(
                                textLayoutResult = textLayout,
                                topLeft = Offset(
                                    bx - textLayout.size.width / 2f,
                                    by - textLayout.size.height / 2f
                                )
                            )
                        }

                        // 3D Spherical Specular Highlight
                        drawCircle(
                            brush = Brush.radialGradient(
                                colors = listOf(Color(0x99FFFFFF), Color(0x00FFFFFF)),
                                center = Offset(bx - currentRadius * 0.35f, by - currentRadius * 0.35f),
                                radius = currentRadius * 0.65f
                            ),
                            radius = currentRadius,
                            center = Offset(bx, by)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Power Control Sidebar & Shoot Action
            Card(
                modifier = Modifier
                    .width(68.dp)
                    .height((tableDrawHeight / 2.7f).dp)
                    .padding(vertical = 4.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = PoolCard)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(vertical = 8.dp, horizontal = 4.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "PWR",
                        style = MaterialTheme.typography.labelSmall,
                        color = GoldYellow,
                        fontWeight = FontWeight.Bold
                    )

                    // Power Percentage Display
                    Text(
                        text = "${(powerInput * 100).toInt()}%",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White,
                        fontWeight = FontWeight.SemiBold
                    )

                    // Power Indicator Bar
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .width(28.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0xFF0B1912))
                            .border(1.dp, Color(0xFF1E4032), RoundedCornerShape(14.dp)),
                        contentAlignment = Alignment.BottomCenter
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .fillMaxHeight(powerInput)
                                .background(
                                    Brush.verticalGradient(
                                        listOf(
                                            Color(0xFFFF4D4D),
                                            GoldYellow,
                                            EmeraldGreen
                                        )
                                    )
                                )
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // Slider to set power
                    Slider(
                        value = powerInput,
                        onValueChange = { powerInput = it },
                        valueRange = 0.1f..1.0f,
                        modifier = Modifier.width(54.dp),
                        colors = SliderDefaults.colors(
                            thumbColor = GoldYellow,
                            activeTrackColor = EmeraldGreen,
                            inactiveTrackColor = Color(0xFF1B3D2B)
                        )
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    // Shoot Button
                    Button(
                        onClick = {
                            if (!engine.isMoving && !engine.isGameOver && !engine.activePlayer.isBot) {
                                engine.shoot(powerInput)
                            }
                        },
                        enabled = !engine.isMoving && !engine.isGameOver && !engine.activePlayer.isBot,
                        modifier = Modifier
                            .size(52.dp)
                            .testTag("shoot_button"),
                        shape = CircleShape,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = GoldYellow,
                            contentColor = Color(0xFF1B1202),
                            disabledContainerColor = Color(0xFF2C3E34),
                            disabledContentColor = Color(0xFF6B7E74)
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = "Shoot Ball",
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }
    }
}
