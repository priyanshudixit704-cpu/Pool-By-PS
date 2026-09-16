package com.example.ui.screens

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
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entities.RoomEntity
import com.example.ui.MainViewModel
import com.example.ui.Screen
import com.example.ui.components.PlayerAvatar
import com.example.ui.components.formatCoins
import com.example.ui.theme.EmeraldGreen
import com.example.ui.theme.GoldYellow
import com.example.ui.theme.PoolCard
import com.example.ui.theme.PoolCardBorder
import com.example.ui.theme.PoolDark
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun MatchRoomScreen(
    room: RoomEntity,
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val user = currentUser ?: return

    val playerList = room.playersJson.split(",").map { it.trim() }.filter { it.isNotEmpty() }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(PoolDark)
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Top Bar with Back Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { viewModel.currentScreen = Screen.Home }) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = GoldYellow
                    )
                }
                Text(
                    text = "MATCH LOBBY",
                    style = MaterialTheme.typography.titleMedium,
                    color = GoldYellow,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Room Info Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = PoolCard),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, GoldYellow)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = room.roomId,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = GoldYellow,
                        letterSpacing = 2.sp
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.MonetizationOn, contentDescription = null, tint = GoldYellow, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Entry: ${formatCoins(room.entryAmount)} Coins", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Timer, contentDescription = null, tint = EmeraldGreen, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Duration: ${room.durationMinutes} Min", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Player Lineup
                    Text(
                        text = "PLAYERS (${if (room.mode == "2v2") "2 vs 2" else "1 vs 1"})",
                        color = TextSecondary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    if (room.mode == "2v2") {
                        // 2v2 Teams View
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            // Team 1
                            Card(
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFF163E27)),
                                modifier = Modifier.weight(1f).padding(end = 6.dp)
                            ) {
                                Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("TEAM 1", color = GoldYellow, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    PlayerAvatar(avatarId = user.avatar, username = user.username, size = 40.dp)
                                    Text(user.username, color = TextPrimary, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                    Spacer(modifier = Modifier.height(6.dp))
                                    PlayerAvatar(avatarId = "avatar_2", username = "Alex (P2)", size = 40.dp)
                                    Text("Alex (P2)", color = TextSecondary, fontSize = 12.sp)
                                }
                            }

                            // Team 2
                            Card(
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFF261D15)),
                                modifier = Modifier.weight(1f).padding(start = 6.dp)
                            ) {
                                Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("TEAM 2", color = Color(0xFFFF9800), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    PlayerAvatar(avatarId = "avatar_3", username = "Sam (P3)", size = 40.dp)
                                    Text("Sam (P3)", color = TextPrimary, fontSize = 12.sp)
                                    Spacer(modifier = Modifier.height(6.dp))
                                    PlayerAvatar(avatarId = "avatar_4", username = "Leo (P4)", size = 40.dp)
                                    Text("Leo (P4)", color = TextSecondary, fontSize = 12.sp)
                                }
                            }
                        }
                    } else {
                        // 1v1 View
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                PlayerAvatar(avatarId = user.avatar, username = user.username, size = 56.dp)
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(user.username, color = TextPrimary, fontWeight = FontWeight.Bold)
                                Text("Host (Player 1)", color = EmeraldGreen, fontSize = 12.sp)
                            }

                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF261D15)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("VS", color = GoldYellow, fontWeight = FontWeight.ExtraBold, fontSize = 13.sp)
                            }

                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                val oppName = if (playerList.size > 1) playerList[1] else "Challenger"
                                PlayerAvatar(avatarId = "avatar_5", username = oppName, size = 56.dp)
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(oppName, color = TextPrimary, fontWeight = FontWeight.Bold)
                                Text("Ready", color = TextSecondary, fontSize = 12.sp)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Entry fee confirmation check
                    Text(
                        text = "Coins will be deducted atomically on match start.",
                        color = TextMuted,
                        fontSize = 12.sp
                    )
                    Text(
                        text = "Current Balance: ${formatCoins(user.coinBalance)} Coins",
                        color = GoldYellow,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // Start Game Button
                    Button(
                        onClick = { viewModel.enterGameFromRoom(room) },
                        enabled = !viewModel.isOperating,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .testTag("start_game_button"),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = GoldYellow, contentColor = Color.Black)
                    ) {
                        if (viewModel.isOperating) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.Black)
                        } else {
                            Icon(Icons.Default.PlayArrow, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("START GAME", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                        }
                    }
                }
            }
        }
    }
}
