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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.MainViewModel
import com.example.ui.Screen
import com.example.ui.components.CoinBalanceChip
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
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun ProfileScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val transactions by viewModel.userTransactions.collectAsState()
    val clipboardManager = LocalClipboardManager.current
    val dateFormat = remember { SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault()) }

    val user = currentUser ?: return
    val winPercent = if (user.matchesPlayed > 0) {
        String.format("%.1f%%", (user.matchesWon.toFloat() / user.matchesPlayed.toFloat()) * 100f)
    } else {
        "0.0%"
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PoolDark)
            .padding(16.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { viewModel.currentScreen = Screen.Home }) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = GoldYellow
                    )
                }
                Text(
                    text = "PLAYER PROFILE",
                    style = MaterialTheme.typography.titleLarge,
                    color = GoldYellow,
                    fontWeight = FontWeight.ExtraBold
                )
            }

            IconButton(
                onClick = { viewModel.logout() },
                modifier = Modifier.testTag("logout_button")
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.Logout,
                    contentDescription = "Logout",
                    tint = LossRed
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Profile Identity Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = PoolCard),
            border = androidx.compose.foundation.BorderStroke(1.dp, PoolCardBorder)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    PlayerAvatar(
                        avatarId = user.avatar,
                        username = user.username,
                        size = 64.dp,
                        showOnlineBadge = true,
                        isOnline = user.isOnline
                    )

                    Spacer(modifier = Modifier.width(14.dp))

                    Column {
                        Text(
                            text = user.username,
                            color = TextPrimary,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 20.sp
                        )

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Player ID: ${user.playerId}",
                                color = TextSecondary,
                                fontSize = 13.sp
                            )
                            IconButton(
                                onClick = {
                                    clipboardManager.setText(AnnotatedString(user.playerId))
                                    viewModel.showToast("Copied Player ID")
                                },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ContentCopy,
                                    contentDescription = "Copy",
                                    tint = GoldYellow,
                                    modifier = Modifier.size(13.dp)
                                )
                            }
                        }

                        Text(
                            text = "Email/Phone: ${user.emailOrPhone}",
                            color = TextMuted,
                            fontSize = 12.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Online status toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (user.isOnline) "🟢 Online Status: Available" else "⚪ Online Status: Invisible",
                        color = if (user.isOnline) EmeraldGreen else TextMuted,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Switch(
                        checked = user.isOnline,
                        onCheckedChange = { viewModel.toggleOnline(it) },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = EmeraldGreen,
                            checkedTrackColor = Color(0xFF1B402B)
                        )
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Stats Row: Total Coins | Matches | Won | Win %
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = PoolCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, PoolCardBorder)
            ) {
                Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Total Coins", color = TextSecondary, fontSize = 11.sp)
                    Text(formatCoins(user.coinBalance), color = GoldYellow, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }

            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = PoolCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, PoolCardBorder)
            ) {
                Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Matches", color = TextSecondary, fontSize = 11.sp)
                    Text("${user.matchesPlayed}", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }

            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = PoolCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, PoolCardBorder)
            ) {
                Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Won / Lost", color = TextSecondary, fontSize = 11.sp)
                    Text("${user.matchesWon} / ${user.matchesLost}", color = EmeraldGreen, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }

            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = PoolCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, PoolCardBorder)
            ) {
                Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Win Rate", color = TextSecondary, fontSize = 11.sp)
                    Text(winPercent, color = GoldYellow, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Transaction Ledger Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.ReceiptLong, contentDescription = null, tint = GoldYellow, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "COIN TRANSACTION HISTORY",
                    color = GoldYellow,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    letterSpacing = 1.sp
                )
            }
            Text(
                text = "${transactions.size} records",
                color = TextMuted,
                fontSize = 11.sp
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Transaction List
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(transactions) { txn ->
                val isPositive = txn.amount > 0
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = PoolCard),
                    border = androidx.compose.foundation.BorderStroke(1.dp, PoolCardBorder)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = txn.type.replace("_", " "),
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary,
                                fontSize = 13.sp
                            )
                            Text(
                                text = "${if (isPositive) "+" else ""}${formatCoins(txn.amount)} Coins",
                                fontWeight = FontWeight.ExtraBold,
                                color = if (isPositive) WinGreen else LossRed,
                                fontSize = 13.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = txn.description,
                            color = TextSecondary,
                            fontSize = 12.sp
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Balance: ${formatCoins(txn.previousBalance)} → ${formatCoins(txn.newBalance)}",
                                color = TextMuted,
                                fontSize = 11.sp
                            )
                            Text(
                                text = dateFormat.format(Date(txn.createdAt)),
                                color = TextMuted,
                                fontSize = 11.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
