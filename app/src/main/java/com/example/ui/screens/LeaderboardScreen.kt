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
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Leaderboard
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
fun LeaderboardScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val leaderboardUsers by viewModel.leaderboard.collectAsState()
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Global, 1: Weekly, 2: Monthly

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PoolDark)
            .padding(16.dp)
    ) {
        // Top Header
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
            Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = GoldYellow, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "LEADERBOARD",
                style = MaterialTheme.typography.titleLarge,
                color = GoldYellow,
                fontWeight = FontWeight.ExtraBold
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Tab Row
        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = Color(0xFF10251C),
            contentColor = GoldYellow,
            indicator = { tabPositions ->
                TabRowDefaults.SecondaryIndicator(
                    Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                    color = GoldYellow
                )
            },
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .border(1.dp, PoolCardBorder, RoundedCornerShape(12.dp))
        ) {
            listOf("Global", "Weekly", "Monthly").forEachIndexed { idx, label ->
                Tab(
                    selected = selectedTab == idx,
                    onClick = { selectedTab = idx },
                    text = { Text(label, fontWeight = FontWeight.Bold, fontSize = 13.sp) }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Podium for Top 3 (if available)
        if (leaderboardUsers.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.Bottom
            ) {
                // Rank 2 (Silver)
                if (leaderboardUsers.size > 1) {
                    val u2 = leaderboardUsers[1]
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("🥈 2nd", color = Color(0xFFC0C0C0), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        PlayerAvatar(avatarId = u2.avatar, username = u2.username, size = 50.dp)
                        Text(u2.username, color = TextPrimary, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                        Text("${u2.matchesWon} Wins", color = GoldYellow, fontSize = 11.sp)
                    }
                }

                // Rank 1 (Gold)
                val u1 = leaderboardUsers[0]
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("👑 1st", color = GoldYellow, fontWeight = FontWeight.ExtraBold, fontSize = 14.sp)
                    PlayerAvatar(avatarId = u1.avatar, username = u1.username, size = 64.dp)
                    Text(u1.username, color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text("${u1.matchesWon} Wins", color = GoldYellow, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                // Rank 3 (Bronze)
                if (leaderboardUsers.size > 2) {
                    val u3 = leaderboardUsers[2]
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("🥉 3rd", color = Color(0xFFCD7F32), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        PlayerAvatar(avatarId = u3.avatar, username = u3.username, size = 50.dp)
                        Text(u3.username, color = TextPrimary, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                        Text("${u3.matchesWon} Wins", color = GoldYellow, fontSize = 11.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }

        // Leaderboard List
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            itemsIndexed(leaderboardUsers) { index, user ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (index == 0) Color(0xFF1E3A28) else PoolCard
                    ),
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (index == 0) GoldYellow else PoolCardBorder
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            // Rank number
                            Box(
                                modifier = Modifier
                                    .size(28.dp)
                                    .clip(CircleShape)
                                    .background(
                                        when (index) {
                                            0 -> GoldYellow
                                            1 -> Color(0xFFC0C0C0)
                                            2 -> Color(0xFFCD7F32)
                                            else -> Color(0xFF1B3828)
                                        }
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "${index + 1}",
                                    color = if (index < 3) Color.Black else TextPrimary,
                                    fontWeight = FontWeight.ExtraBold,
                                    fontSize = 12.sp
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            PlayerAvatar(avatarId = user.avatar, username = user.username, size = 42.dp)

                            Spacer(modifier = Modifier.width(10.dp))

                            Column {
                                Text(user.username, color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(user.playerId, color = TextSecondary, fontSize = 11.sp)
                            }
                        }

                        // Stats: Wins & Coins
                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "${user.matchesWon} Won / ${user.matchesPlayed} Matches",
                                color = EmeraldGreen,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 12.sp
                            )
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.MonetizationOn, contentDescription = null, tint = GoldYellow, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(2.dp))
                                Text(
                                    text = formatCoins(user.coinBalance),
                                    color = GoldYellow,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
