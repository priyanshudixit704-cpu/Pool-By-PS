package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Leaderboard
import androidx.compose.material.icons.filled.MeetingRoom
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entities.UserEntity
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
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val gameConfig by viewModel.gameConfig.collectAsState()
    val pendingInvites by viewModel.pendingInvitations.collectAsState()
    val userMatches by viewModel.userMatches.collectAsState()
    val clipboardManager = LocalClipboardManager.current
    val coroutineScope = rememberCoroutineScope()

    val user = currentUser ?: return
    val scrollState = rememberScrollState()

    // Quick Play Configuration
    var selectedMode by remember { mutableStateOf("1v1") } // "1v1" or "2v2"
    var selectedDuration by remember { mutableIntStateOf(2) } // 1, 2, or 5
    var selectedEntryAmount by remember { mutableLongStateOf(2000L) }
    var isCustomEntry by remember { mutableStateOf(false) }
    var customEntryText by remember { mutableStateOf("") }

    // Dialog states
    var showConfirmationDialog by remember { mutableStateOf(false) }
    var showInviteDialog by remember { mutableStateOf(false) }
    var invitePlayerIdInput by remember { mutableStateOf("") }
    var searchedUser by remember { mutableStateOf<UserEntity?>(null) }
    var isSearchingUser by remember { mutableStateOf(false) }

    // Join Room Dialog
    var showJoinRoomDialog by remember { mutableStateOf(false) }
    var joinRoomIdInput by remember { mutableStateOf("") }

    val allowedEntries = gameConfig?.parseAllowedEntries() ?: listOf(1000L, 2000L, 5000L, 10000L)
    val availableDurations = gameConfig?.parseAvailableDurations() ?: listOf(1, 2, 5)

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PoolDark)
            .verticalScroll(scrollState)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        // Pending Invitations Banner
        if (pendingInvites.isNotEmpty()) {
            val invite = pendingInvites.first()
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E3A2B)),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, GoldYellow)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        PlayerAvatar(avatarId = invite.senderAvatar, username = invite.senderUsername, size = 38.dp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "${invite.senderUsername} invited you to play 8 Ball Pool",
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Text(
                                text = "${invite.mode} • Entry: ${formatCoins(invite.entryAmount)} Coins • ${invite.durationMinutes} Min",
                                color = GoldYellow,
                                fontSize = 12.sp
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(
                            onClick = { viewModel.respondToInvite(invite, accept = false) }
                        ) {
                            Text("Decline", color = TextSecondary)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = { viewModel.respondToInvite(invite, accept = true) },
                            colors = ButtonDefaults.buttonColors(containerColor = GoldYellow, contentColor = Color.Black)
                        ) {
                            Text("Accept & Play", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Top User Bar
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = PoolCard),
            border = androidx.compose.foundation.BorderStroke(1.dp, PoolCardBorder)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    PlayerAvatar(
                        avatarId = user.avatar,
                        username = user.username,
                        size = 54.dp,
                        showOnlineBadge = true,
                        isOnline = user.isOnline
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = user.username,
                            color = TextPrimary,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 18.sp
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
                                    viewModel.showToast("Copied Player ID: ${user.playerId}")
                                },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ContentCopy,
                                    contentDescription = "Copy ID",
                                    tint = GoldYellow,
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        }
                    }
                }

                // Coin Balance
                CoinBalanceChip(
                    balance = user.coinBalance,
                    onClick = { viewModel.currentScreen = Screen.Profile }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Quick Actions Row: Invite Player | Create Room | Join Room
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = {
                    showInviteDialog = true
                    searchedUser = null
                    invitePlayerIdInput = ""
                },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
                    .testTag("invite_player_button"),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF163E27), contentColor = EmeraldGreen)
            ) {
                Icon(Icons.Default.PersonAdd, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Invite ID", fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }

            Button(
                onClick = {
                    val entry = if (isCustomEntry) customEntryText.toLongOrNull() ?: 2000L else selectedEntryAmount
                    viewModel.startQuickPlay(selectedMode, entry, selectedDuration)
                },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
                    .testTag("create_room_button"),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF263D2E), contentColor = GoldYellow)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Create Room", fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }

            Button(
                onClick = { showJoinRoomDialog = true },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
                    .testTag("join_room_button"),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1A2B22), contentColor = TextPrimary)
            ) {
                Icon(Icons.Default.MeetingRoom, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Join Room", fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Match Setup Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = PoolCard),
            border = androidx.compose.foundation.BorderStroke(1.dp, PoolCardBorder)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(
                    text = "MATCH CONFIGURATION",
                    color = GoldYellow,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 1.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Mode Selector: 1v1 vs 2v2
                Text("Game Mode", color = TextSecondary, fontSize = 13.sp)
                Spacer(modifier = Modifier.height(6.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    listOf("1v1" to "1 vs 1 Solo", "2v2" to "2 vs 2 Teams").forEach { (mode, label) ->
                        val isSelected = selectedMode == mode
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isSelected) EmeraldGreen else Color(0xFF10251C),
                            border = androidx.compose.foundation.BorderStroke(
                                1.5.dp,
                                if (isSelected) GoldYellow else PoolCardBorder
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { selectedMode = mode }
                                .testTag("mode_${mode}")
                        ) {
                            Column(
                                modifier = Modifier.padding(vertical = 12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    imageVector = if (mode == "1v1") Icons.Default.Person else Icons.Default.Group,
                                    contentDescription = null,
                                    tint = if (isSelected) Color.White else TextSecondary
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = label,
                                    color = if (isSelected) Color.White else TextPrimary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Entry Coins Selector
                Text("Entry Coins", color = TextSecondary, fontSize = 13.sp)
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    allowedEntries.forEach { amount ->
                        val isSelected = !isCustomEntry && selectedEntryAmount == amount
                        FilterChip(
                            selected = isSelected,
                            onClick = {
                                isCustomEntry = false
                                selectedEntryAmount = amount
                            },
                            label = { Text(formatCoins(amount), fontSize = 12.sp, fontWeight = FontWeight.Bold) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = GoldYellow,
                                selectedLabelColor = Color.Black,
                                containerColor = Color(0xFF0D2218),
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

                    FilterChip(
                        selected = isCustomEntry,
                        onClick = { isCustomEntry = true },
                        label = { Text("Custom", fontSize = 12.sp, fontWeight = FontWeight.Bold) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = GoldYellow,
                            selectedLabelColor = Color.Black,
                            containerColor = Color(0xFF0D2218),
                            labelColor = TextPrimary
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = isCustomEntry,
                            borderColor = PoolCardBorder,
                            selectedBorderColor = GoldYellow
                        )
                    )
                }

                // Custom amount text field
                AnimatedVisibility(visible = isCustomEntry) {
                    Column(modifier = Modifier.padding(top = 10.dp)) {
                        OutlinedTextField(
                            value = customEntryText,
                            onValueChange = { customEntryText = it.filter { ch -> ch.isDigit() } },
                            label = { Text("Enter custom coins (${gameConfig?.customEntryMin ?: 500} - ${gameConfig?.customEntryMax ?: 500000})") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = GoldYellow,
                                unfocusedBorderColor = PoolCardBorder
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Duration Selector: 1 Min, 2 Min, 5 Min
                Text("Match Duration", color = TextSecondary, fontSize = 13.sp)
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    availableDurations.forEach { duration ->
                        val isSelected = selectedDuration == duration
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (isSelected) Color(0xFF1B4D33) else Color(0xFF10251C),
                            border = androidx.compose.foundation.BorderStroke(
                                1.5.dp,
                                if (isSelected) GoldYellow else PoolCardBorder
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { selectedDuration = duration }
                        ) {
                            Row(
                                modifier = Modifier.padding(vertical = 10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Icon(Icons.Default.Timer, contentDescription = null, tint = GoldYellow, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("$duration Min", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Large Play Now Button
                val finalEntryAmount = if (isCustomEntry) customEntryText.toLongOrNull() ?: 0L else selectedEntryAmount
                Button(
                    onClick = {
                        val min = gameConfig?.customEntryMin ?: 500L
                        val max = gameConfig?.customEntryMax ?: 500000L
                        if (isCustomEntry && (finalEntryAmount < min || finalEntryAmount > max)) {
                            viewModel.showToast("Custom amount must be between $min and $max coins")
                            return@Button
                        }
                        if (user.coinBalance < finalEntryAmount) {
                            viewModel.showToast("Insufficient coins! Required: $finalEntryAmount")
                            return@Button
                        }
                        showConfirmationDialog = true
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp)
                        .testTag("play_now_button"),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = GoldYellow, contentColor = Color(0xFF120C00))
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("PLAY NOW (${formatCoins(finalEntryAmount)} COINS)", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Recent Matches Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = PoolCard),
            border = androidx.compose.foundation.BorderStroke(1.dp, PoolCardBorder)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "RECENT MATCHES",
                        color = TextSecondary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    TextButton(onClick = { viewModel.currentScreen = Screen.MatchHistory }) {
                        Text("View All", color = EmeraldGreen, fontSize = 12.sp)
                    }
                }

                if (userMatches.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 20.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("No matches played yet. Tap PLAY NOW to begin!", color = TextMuted, fontSize = 13.sp)
                    }
                } else {
                    userMatches.take(3).forEach { match ->
                        val isWin = match.winnerPlayerId == user.playerId
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "${match.mode} • ${match.roomId}",
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary,
                                    fontSize = 14.sp
                                )
                                Text(
                                    text = if (isWin) "Defeated opponent" else "Lost against ${match.winnerName}",
                                    color = TextSecondary,
                                    fontSize = 12.sp
                                )
                            }
                            Text(
                                text = if (isWin) "+${formatCoins(match.coinsWonLost)}" else "-${formatCoins(match.entryAmount)}",
                                color = if (isWin) WinGreen else LossRed,
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }

    // Confirmation Dialog before joining match
    if (showConfirmationDialog) {
        val entry = if (isCustomEntry) customEntryText.toLongOrNull() ?: 0L else selectedEntryAmount
        val afterBalance = user.coinBalance - entry

        AlertDialog(
            onDismissRequest = { showConfirmationDialog = false },
            title = {
                Text(
                    text = "Confirm Match Entry",
                    color = GoldYellow,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column {
                    Text("Entry: ${formatCoins(entry)} coins", color = TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Your balance: ${formatCoins(user.coinBalance)} coins", color = TextSecondary, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("After entry: ${formatCoins(afterBalance)} coins", color = EmeraldGreen, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Duration: $selectedDuration Minutes • Mode: $selectedMode", color = TextMuted, fontSize = 12.sp)
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showConfirmationDialog = false
                        viewModel.startQuickPlay(selectedMode, entry, selectedDuration)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldYellow, contentColor = Color.Black)
                ) {
                    Text("Confirm & Start", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showConfirmationDialog = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = PoolCard
        )
    }

    // Invite Player by ID Dialog (Section 3)
    if (showInviteDialog) {
        val finalEntry = if (isCustomEntry) customEntryText.toLongOrNull() ?: 2000L else selectedEntryAmount
        AlertDialog(
            onDismissRequest = { showInviteDialog = false },
            title = {
                Text("Invite Player by ID", color = GoldYellow, fontWeight = FontWeight.Bold)
            },
            text = {
                Column {
                    Text("Enter another player's permanent Player ID to invite them to a match.", color = TextSecondary, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(10.dp))

                    Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                        OutlinedTextField(
                            value = invitePlayerIdInput,
                            onValueChange = { invitePlayerIdInput = it.trim().uppercase() },
                            placeholder = { Text("e.g. 8BP-104582") },
                            singleLine = true,
                            modifier = Modifier.weight(1f),
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldYellow)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        IconButton(
                            onClick = {
                                if (invitePlayerIdInput.isNotBlank()) {
                                    isSearchingUser = true
                                    coroutineScope.launch {
                                        val found = viewModel.repository.getUserByPlayerIdSync(invitePlayerIdInput)
                                        searchedUser = found
                                        isSearchingUser = false
                                        if (found == null) {
                                            viewModel.showToast("No player found with ID: $invitePlayerIdInput")
                                        }
                                    }
                                }
                            }
                        ) {
                            if (isSearchingUser) {
                                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = GoldYellow)
                            } else {
                                Icon(Icons.Default.Search, contentDescription = "Search", tint = GoldYellow)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Show searched player card
                    searchedUser?.let { target ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF163E27)),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                PlayerAvatar(avatarId = target.avatar, username = target.username, size = 44.dp, showOnlineBadge = true, isOnline = target.isOnline)
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(target.username, fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 15.sp)
                                    Text(target.playerId, color = TextSecondary, fontSize = 12.sp)
                                    Text(
                                        if (target.isOnline) "🟢 Online" else "⚪ Offline",
                                        color = if (target.isOnline) EmeraldGreen else TextMuted,
                                        fontSize = 11.sp
                                    )
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val target = searchedUser
                        if (target != null) {
                            viewModel.sendInvite(
                                targetPlayerId = target.playerId,
                                mode = selectedMode,
                                entryAmount = finalEntry,
                                durationMinutes = selectedDuration
                            )
                            showInviteDialog = false
                        } else {
                            viewModel.showToast("Please search and select a player first")
                        }
                    },
                    enabled = searchedUser != null,
                    colors = ButtonDefaults.buttonColors(containerColor = GoldYellow, contentColor = Color.Black)
                ) {
                    Text("Invite to Play", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showInviteDialog = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = PoolCard
        )
    }

    // Join Room Dialog
    if (showJoinRoomDialog) {
        AlertDialog(
            onDismissRequest = { showJoinRoomDialog = false },
            title = { Text("Join Match Room", color = GoldYellow, fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    Text("Enter Room ID (e.g. ROOM #A82F91)", color = TextSecondary, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = joinRoomIdInput,
                        onValueChange = { joinRoomIdInput = it.uppercase() },
                        placeholder = { Text("ROOM #A82F91") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        coroutineScope.launch {
                            val room = viewModel.repository.getRoomByIdSync(joinRoomIdInput)
                            if (room != null) {
                                showJoinRoomDialog = false
                                viewModel.currentScreen = Screen.MatchRoom(room)
                            } else {
                                viewModel.showToast("Room not found: $joinRoomIdInput")
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldYellow, contentColor = Color.Black)
                ) {
                    Text("Enter Room")
                }
            },
            dismissButton = {
                TextButton(onClick = { showJoinRoomDialog = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = PoolCard
        )
    }
}
