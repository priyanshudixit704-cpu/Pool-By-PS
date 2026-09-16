package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entities.RoomEntity
import com.example.game.MatchPlayer
import com.example.game.PlayerGroup
import com.example.game.PoolGameCanvas
import com.example.ui.MainViewModel
import com.example.ui.components.PlayerAvatar
import com.example.ui.components.formatCoins
import com.example.ui.theme.EmeraldGreen
import com.example.ui.theme.GoldYellow
import com.example.ui.theme.LossRed
import com.example.ui.theme.PoolCard
import com.example.ui.theme.PoolCardBorder
import com.example.ui.theme.PoolDark
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.WinGreen

@Composable
fun PoolGameScreen(
    room: RoomEntity,
    players: List<MatchPlayer>,
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val engine = viewModel.activeEngine ?: return
    var showForfeitConfirm by remember { mutableStateOf(false) }

    val minRemaining = engine.timeRemainingSeconds / 60
    val secRemaining = engine.timeRemainingSeconds % 60
    val timerText = String.format("%02d:%02d", minRemaining, secRemaining)

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(PoolDark)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 10.dp, vertical = 6.dp)
        ) {
            // Match Header Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Exit / Forfeit Button
                IconButton(
                    onClick = { showForfeitConfirm = true },
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Leave Match",
                        tint = Color.White
                    )
                }

                // Timer Pill
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF142C20),
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (engine.timeRemainingSeconds < 30) LossRed else EmeraldGreen)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.Timer,
                            contentDescription = null,
                            tint = if (engine.timeRemainingSeconds < 30) LossRed else GoldYellow,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = timerText,
                            color = if (engine.timeRemainingSeconds < 30) LossRed else Color.White,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 14.sp
                        )
                    }
                }

                // Pot Total
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF261E08),
                    border = androidx.compose.foundation.BorderStroke(1.dp, GoldYellow)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.MonetizationOn, contentDescription = null, tint = GoldYellow, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Pot: ${formatCoins(room.entryAmount * 2)}",
                            color = GoldYellow,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Player Turn HUD
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = PoolCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, PoolCardBorder)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Player 1 (or Team 1)
                    val p1 = players.first()
                    val isP1Turn = engine.activePlayer.team == p1.team
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isP1Turn) Color(0xFF1E4030) else Color.Transparent)
                            .padding(4.dp)
                    ) {
                        PlayerAvatar(avatarId = p1.avatar, username = p1.username, size = 32.dp)
                        Spacer(modifier = Modifier.width(6.dp))
                        Column {
                            Text(
                                text = p1.username,
                                color = if (isP1Turn) GoldYellow else TextPrimary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                            val grpText = when (p1.group) {
                                PlayerGroup.SOLIDS -> "Solids (${engine.sunkSolids.size}/7)"
                                PlayerGroup.STRIPES -> "Stripes (${engine.sunkStripes.size}/7)"
                                PlayerGroup.UNASSIGNED -> "Open Table"
                            }
                            Text(grpText, color = TextSecondary, fontSize = 10.sp)
                        }
                    }

                    // Turn indicator
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color(0xFF0F2218))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = if (engine.activePlayer.playerId == p1.playerId) "YOUR SHOT" else "${engine.activePlayer.username.take(6).uppercase()}'S SHOT",
                            color = GoldYellow,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 11.sp
                        )
                    }

                    // Opponent
                    val p2 = players.last()
                    val isP2Turn = engine.activePlayer.team == p2.team
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isP2Turn) Color(0xFF1E4030) else Color.Transparent)
                            .padding(4.dp)
                    ) {
                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = p2.username,
                                color = if (isP2Turn) GoldYellow else TextPrimary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                            val grpText2 = when (p2.group) {
                                PlayerGroup.SOLIDS -> "Solids (${engine.sunkSolids.size}/7)"
                                PlayerGroup.STRIPES -> "Stripes (${engine.sunkStripes.size}/7)"
                                PlayerGroup.UNASSIGNED -> "Open Table"
                            }
                            Text(grpText2, color = TextSecondary, fontSize = 10.sp)
                        }
                        Spacer(modifier = Modifier.width(6.dp))
                        PlayerAvatar(avatarId = p2.avatar, username = p2.username, size = 32.dp)
                    }
                }
            }

            // Live Action Status Ticker
            Text(
                text = engine.statusMessage,
                color = if (engine.statusMessage.contains("Foul")) LossRed else EmeraldGreen,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier
                    .padding(vertical = 4.dp)
                    .align(Alignment.CenterHorizontally)
            )

            // Interactive Table Canvas
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                PoolGameCanvas(engine = engine)
            }
        }

        // Forfeit Confirm Dialog
        if (showForfeitConfirm) {
            AlertDialog(
                onDismissRequest = { showForfeitConfirm = false },
                title = { Text("Forfeit Match?", color = LossRed, fontWeight = FontWeight.Bold) },
                text = {
                    Text(
                        "Leaving will forfeit the match and your entry fee of ${formatCoins(room.entryAmount)} coins will not be refunded.",
                        color = TextSecondary
                    )
                },
                confirmButton = {
                    Button(
                        onClick = {
                            showForfeitConfirm = false
                            engine.forfeitMatch(players.first())
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = LossRed, contentColor = Color.White)
                    ) {
                        Text("Forfeit & Leave")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showForfeitConfirm = false }) {
                        Text("Keep Playing", color = TextPrimary)
                    }
                },
                containerColor = PoolCard
            )
        }

        // Match Game Over Dialog
        if (engine.isGameOver) {
            val winner = engine.winnerPlayer ?: players.first()
            val isCurrentUserWinner = winner.playerId == players.first().playerId

            AlertDialog(
                onDismissRequest = { /* Require button tap */ },
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.EmojiEvents,
                            contentDescription = null,
                            tint = if (isCurrentUserWinner) GoldYellow else TextSecondary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (isCurrentUserWinner) "VICTORY!" else "MATCH FINISHED",
                            color = if (isCurrentUserWinner) GoldYellow else Color.White,
                            fontWeight = FontWeight.ExtraBold
                        )
                    }
                },
                text = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = engine.winReason,
                            color = TextPrimary,
                            fontWeight = FontWeight.Medium,
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.height(14.dp))
                        PlayerAvatar(avatarId = winner.avatar, username = winner.username, size = 64.dp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Winner: ${winner.username}",
                            fontWeight = FontWeight.ExtraBold,
                            color = TextPrimary,
                            fontSize = 16.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = if (isCurrentUserWinner)
                                "You won the Pot: +${formatCoins(room.entryAmount * 2)} Coins!"
                            else
                                "Result: -${formatCoins(room.entryAmount)} Coins",
                            color = if (isCurrentUserWinner) WinGreen else LossRed,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = { viewModel.leaveGame() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("match_game_over_continue_button"),
                        colors = ButtonDefaults.buttonColors(containerColor = GoldYellow, contentColor = Color.Black)
                    ) {
                        Text("BACK TO LOBBY", fontWeight = FontWeight.Bold)
                    }
                },
                containerColor = PoolCard
            )
        }
    }
}
