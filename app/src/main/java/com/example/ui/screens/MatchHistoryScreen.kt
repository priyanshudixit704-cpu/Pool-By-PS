package com.example.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.MainViewModel
import com.example.ui.Screen
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
fun MatchHistoryScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val userMatches by viewModel.userMatches.collectAsState()
    val currentUser by viewModel.currentUser.collectAsState()
    val user = currentUser ?: return

    var selectedFilter by remember { mutableStateOf("ALL") } // ALL, WON, LOST, TODAY, WEEK

    val dateFormat = remember { SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault()) }
    val now = System.currentTimeMillis()
    val oneDayAgo = now - 24 * 60 * 60 * 1000L
    val oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000L

    val filteredMatches = userMatches.filter { match ->
        val isWin = match.winnerPlayerId == user.playerId
        when (selectedFilter) {
            "WON" -> isWin
            "LOST" -> !isWin
            "TODAY" -> match.endedAt >= oneDayAgo
            "WEEK" -> match.endedAt >= oneWeekAgo
            else -> true
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PoolDark)
            .padding(16.dp)
    ) {
        // Top Bar
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
            Icon(Icons.Default.History, contentDescription = null, tint = GoldYellow, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "MATCH HISTORY",
                style = MaterialTheme.typography.titleLarge,
                color = GoldYellow,
                fontWeight = FontWeight.ExtraBold
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Filter Chips Row
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val filters = listOf(
                "ALL" to "All Matches",
                "WON" to "Won",
                "LOST" to "Lost",
                "TODAY" to "Today",
                "WEEK" to "This Week"
            )
            items(filters) { (key, label) ->
                val isSelected = selectedFilter == key
                FilterChip(
                    selected = isSelected,
                    onClick = { selectedFilter = key },
                    label = { Text(label, fontWeight = FontWeight.Bold, fontSize = 12.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = GoldYellow,
                        selectedLabelColor = Color.Black,
                        containerColor = Color(0xFF10251C),
                        labelColor = TextPrimary
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        enabled = true,
                        selected = isSelected,
                        borderColor = PoolCardBorder,
                        selectedBorderColor = GoldYellow
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (filteredMatches.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No matches found for selected filter",
                    color = TextMuted,
                    fontSize = 14.sp
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredMatches) { match ->
                    val isWin = match.winnerPlayerId == user.playerId
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = PoolCard),
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (isWin) WinGreen.copy(alpha = 0.5f) else LossRed.copy(alpha = 0.4f)
                        )
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = if (isWin) "VICTORY" else "DEFEAT",
                                        color = if (isWin) WinGreen else LossRed,
                                        fontWeight = FontWeight.ExtraBold,
                                        fontSize = 14.sp
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "•  ${match.mode}  •  ${match.roomId}",
                                        color = TextSecondary,
                                        fontSize = 12.sp
                                    )
                                }

                                Text(
                                    text = if (isWin) "+${formatCoins(match.coinsWonLost)} Coins" else "-${formatCoins(match.entryAmount)} Coins",
                                    color = if (isWin) WinGreen else LossRed,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            Text(
                                text = "Match ID: ${match.matchId}",
                                color = TextMuted,
                                fontSize = 11.sp
                            )
                            Text(
                                text = "Players: ${match.playersJson}",
                                color = TextPrimary,
                                fontSize = 12.sp
                            )

                            Spacer(modifier = Modifier.height(6.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Timer, contentDescription = null, tint = TextMuted, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("${match.durationMinutes} Min Duration", color = TextMuted, fontSize = 11.sp)
                                }
                                Text(
                                    text = dateFormat.format(Date(match.endedAt)),
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
}
