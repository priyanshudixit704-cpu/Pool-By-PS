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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LockReset
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import com.example.data.local.entities.GameConfigEntity
import com.example.data.local.entities.UserEntity
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
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun AdminDashboardScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val adminUser by viewModel.adminUser.collectAsState()
    val stats by viewModel.adminStats.collectAsState()
    val allUsers by viewModel.allUsers.collectAsState()
    val allTransactions by viewModel.allTransactions.collectAsState()
    val allAuditLogs by viewModel.allAuditLogs.collectAsState()
    val activeRooms by viewModel.activeRooms.collectAsState()
    val gameConfig by viewModel.gameConfig.collectAsState()

    var selectedSection by remember { mutableIntStateOf(0) } // 0: Overview, 1: Users, 2: Coin Ledger, 3: Game Config, 4: Monitoring, 5: Audit Logs
    var userSearchQuery by remember { mutableStateOf("") }
    val dateFormat = remember { SimpleDateFormat("MMM dd, HH:mm:ss", Locale.getDefault()) }

    // Dialog state for user actions
    var selectedUserForAction by remember { mutableStateOf<UserEntity?>(null) }
    var showAdjustCoinsDialog by remember { mutableStateOf(false) }
    var adjustAmountText by remember { mutableStateOf("") }
    var adjustReasonText by remember { mutableStateOf("") }
    var isDeductingCoins by remember { mutableStateOf(false) }

    var showResetPasswordDialog by remember { mutableStateOf(false) }
    var resetPassNewText by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        viewModel.loadAdminData()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PoolDark)
            .padding(16.dp)
    ) {
        // Admin Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.AdminPanelSettings,
                    contentDescription = "Admin",
                    tint = Color(0xFFFF9800),
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = "ADMIN CONSOLE",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color(0xFFFF9800),
                        fontWeight = FontWeight.ExtraBold
                    )
                    Text(
                        text = "Logged in as ${adminUser?.username ?: "Admin"}",
                        color = TextMuted,
                        fontSize = 11.sp
                    )
                }
            }

            Row {
                IconButton(onClick = { viewModel.loadAdminData() }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = GoldYellow)
                }
                IconButton(onClick = { viewModel.logoutAdmin() }) {
                    Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = "Logout Admin", tint = LossRed)
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Navigation Tabs
        ScrollableTabRow(
            selectedTabIndex = selectedSection,
            containerColor = Color(0xFF0C1F16),
            contentColor = GoldYellow,
            edgePadding = 0.dp,
            indicator = { tabPositions ->
                TabRowDefaults.SecondaryIndicator(
                    Modifier.tabIndicatorOffset(tabPositions[selectedSection]),
                    color = GoldYellow
                )
            },
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(10.dp))
                .border(1.dp, PoolCardBorder, RoundedCornerShape(10.dp))
        ) {
            listOf("Overview", "Users", "Coin Ledger", "Config", "Live Rooms", "Audit Logs").forEachIndexed { idx, label ->
                Tab(
                    selected = selectedSection == idx,
                    onClick = { selectedSection = idx },
                    text = { Text(label, fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Section Content
        when (selectedSection) {
            0 -> {
                // Overview Metrics Dashboard
                val scrollState = rememberScrollState()
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(scrollState),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text("GLOBAL METRICS & SYSTEM HEALTH", color = GoldYellow, fontWeight = FontWeight.Bold, fontSize = 12.sp)

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        MetricCard(
                            title = "Total Users",
                            value = "${stats.totalUsers}",
                            subtext = "${stats.onlineUsers} online right now",
                            modifier = Modifier.weight(1f)
                        )
                        MetricCard(
                            title = "Active Matches",
                            value = "${stats.activeMatches}",
                            subtext = "${stats.totalMatches} total played",
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        MetricCard(
                            title = "Coins in Circulation",
                            value = formatCoins(stats.totalCoinsInCirculation),
                            subtext = "Total virtual points",
                            modifier = Modifier.weight(1f)
                        )
                        MetricCard(
                            title = "Coins Awarded",
                            value = formatCoins(stats.totalCoinsAwarded),
                            subtext = "Via wins & bonuses",
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        MetricCard(
                            title = "Matches Today",
                            value = "${stats.todayMatches}",
                            subtext = "Past 24 hours",
                            modifier = Modifier.weight(1f)
                        )
                        MetricCard(
                            title = "New Users Today",
                            value = "${stats.todayNewUsers}",
                            subtext = "Past 24 hours",
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            1 -> {
                // User Management
                Column(modifier = Modifier.fillMaxSize()) {
                    OutlinedTextField(
                        value = userSearchQuery,
                        onValueChange = { userSearchQuery = it },
                        placeholder = { Text("Search by username, Player ID, phone, email...") },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = GoldYellow) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldYellow)
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    val filteredUsers = allUsers.filter {
                        it.role == "USER" && (
                            it.username.contains(userSearchQuery, ignoreCase = true) ||
                            it.playerId.contains(userSearchQuery, ignoreCase = true) ||
                            it.emailOrPhone.contains(userSearchQuery, ignoreCase = true)
                        )
                    }

                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(filteredUsers) { user ->
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
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            PlayerAvatar(avatarId = user.avatar, username = user.username, size = 40.dp)
                                            Spacer(modifier = Modifier.width(10.dp))
                                            Column {
                                                Text(user.username, color = TextPrimary, fontWeight = FontWeight.Bold)
                                                Text("${user.playerId} • ${user.emailOrPhone}", color = TextSecondary, fontSize = 11.sp)
                                            }
                                        }

                                        Text(
                                            text = "${formatCoins(user.coinBalance)} Coins",
                                            color = GoldYellow,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 13.sp
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(8.dp))

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "Status: ${user.status} • Approved: ${if (user.isApproved) "YES" else "NO"}",
                                            color = if (user.status == "ACTIVE") EmeraldGreen else LossRed,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.SemiBold
                                        )

                                        Row {
                                            // Action: Adjust Coins
                                            Button(
                                                onClick = {
                                                    selectedUserForAction = user
                                                    showAdjustCoinsDialog = true
                                                    adjustAmountText = ""
                                                    adjustReasonText = ""
                                                },
                                                modifier = Modifier.height(32.dp),
                                                colors = ButtonDefaults.buttonColors(containerColor = GoldYellow, contentColor = Color.Black)
                                            ) {
                                                Text("Coins", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                            }

                                            Spacer(modifier = Modifier.width(4.dp))

                                            // Action: Toggle Status
                                            Button(
                                                onClick = {
                                                    val newStatus = if (user.status == "ACTIVE") "SUSPENDED" else "ACTIVE"
                                                    viewModel.adminUpdateUserStatus(user.id, newStatus, "Admin toggled status to $newStatus")
                                                },
                                                modifier = Modifier.height(32.dp),
                                                colors = ButtonDefaults.buttonColors(
                                                    containerColor = if (user.status == "ACTIVE") LossRed else EmeraldGreen,
                                                    contentColor = Color.White
                                                )
                                            ) {
                                                Text(if (user.status == "ACTIVE") "Suspend" else "Activate", fontSize = 11.sp)
                                            }

                                            Spacer(modifier = Modifier.width(4.dp))

                                            // Action: Reset Password
                                            Button(
                                                onClick = {
                                                    selectedUserForAction = user
                                                    showResetPasswordDialog = true
                                                    resetPassNewText = ""
                                                },
                                                modifier = Modifier.height(32.dp),
                                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF37474F), contentColor = Color.White)
                                            ) {
                                                Text("Pass", fontSize = 11.sp)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            2 -> {
                // Coin Ledger (All transactions)
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(allTransactions) { txn ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = PoolCard),
                            border = androidx.compose.foundation.BorderStroke(1.dp, PoolCardBorder)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "${txn.type} (${txn.userPlayerId})",
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary,
                                        fontSize = 12.sp
                                    )
                                    Text(
                                        text = "${if (txn.amount > 0) "+" else ""}${formatCoins(txn.amount)} Coins",
                                        fontWeight = FontWeight.ExtraBold,
                                        color = if (txn.amount > 0) WinGreen else LossRed,
                                        fontSize = 12.sp
                                    )
                                }
                                Text(txn.description, color = TextSecondary, fontSize = 11.sp)
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Bal: ${formatCoins(txn.previousBalance)} → ${formatCoins(txn.newBalance)}", color = TextMuted, fontSize = 10.sp)
                                    Text(dateFormat.format(Date(txn.createdAt)), color = TextMuted, fontSize = 10.sp)
                                }
                            }
                        }
                    }
                }
            }

            3 -> {
                // Game Configuration
                val currentConf = gameConfig ?: GameConfigEntity()
                var allowedEntriesCsv by remember(currentConf) { mutableStateOf(currentConf.allowedEntryAmountsCsv) }
                var customMin by remember(currentConf) { mutableStateOf(currentConf.customEntryMin.toString()) }
                var customMax by remember(currentConf) { mutableStateOf(currentConf.customEntryMax.toString()) }
                var durationsCsv by remember(currentConf) { mutableStateOf(currentConf.availableDurationsCsv) }
                var is1v1 by remember(currentConf) { mutableStateOf(currentConf.is1v1Enabled) }
                var is2v2 by remember(currentConf) { mutableStateOf(currentConf.is2v2Enabled) }
                var maintenance by remember(currentConf) { mutableStateOf(currentConf.isMaintenanceMode) }

                val scrollState = rememberScrollState()
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(scrollState),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text("GLOBAL GAME PARAMETERS", color = GoldYellow, fontWeight = FontWeight.Bold, fontSize = 13.sp)

                    OutlinedTextField(
                        value = allowedEntriesCsv,
                        onValueChange = { allowedEntriesCsv = it },
                        label = { Text("Allowed Entry Amounts (CSV)") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = customMin,
                            onValueChange = { customMin = it },
                            label = { Text("Custom Min Coins") },
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = customMax,
                            onValueChange = { customMax = it },
                            label = { Text("Custom Max Coins") },
                            modifier = Modifier.weight(1f)
                        )
                    }

                    OutlinedTextField(
                        value = durationsCsv,
                        onValueChange = { durationsCsv = it },
                        label = { Text("Match Durations in Minutes (CSV)") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("1 vs 1 Mode Enabled", color = TextPrimary)
                        Switch(checked = is1v1, onCheckedChange = { is1v1 = it })
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("2 vs 2 Mode Enabled", color = TextPrimary)
                        Switch(checked = is2v2, onCheckedChange = { is2v2 = it })
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Maintenance Mode", color = TextPrimary)
                        Switch(
                            checked = maintenance,
                            onCheckedChange = { maintenance = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = LossRed)
                        )
                    }

                    Button(
                        onClick = {
                            val newConf = currentConf.copy(
                                allowedEntryAmountsCsv = allowedEntriesCsv,
                                customEntryMin = customMin.toLongOrNull() ?: 500L,
                                customEntryMax = customMax.toLongOrNull() ?: 500000L,
                                availableDurationsCsv = durationsCsv,
                                is1v1Enabled = is1v1,
                                is2v2Enabled = is2v2,
                                isMaintenanceMode = maintenance
                            )
                            viewModel.adminUpdateGameConfig(newConf, "Admin updated game parameters")
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = GoldYellow, contentColor = Color.Black)
                    ) {
                        Text("Save Configuration", fontWeight = FontWeight.Bold)
                    }
                }
            }

            4 -> {
                // Live Rooms & Match Monitoring
                if (activeRooms.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No active rooms currently open", color = TextMuted)
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(activeRooms) { room ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(10.dp),
                                colors = CardDefaults.cardColors(containerColor = PoolCard)
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text(room.roomId, color = GoldYellow, fontWeight = FontWeight.Bold)
                                    Text("Host: ${room.hostUsername} • Status: ${room.status}", color = TextPrimary, fontSize = 12.sp)
                                    Text("Mode: ${room.mode} • Entry: ${formatCoins(room.entryAmount)} Coins • ${room.durationMinutes} Min", color = TextSecondary, fontSize = 11.sp)
                                }
                            }
                        }
                    }
                }
            }

            5 -> {
                // Audit Logs
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(allAuditLogs) { log ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = PoolCard)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "${log.action} by ${log.adminId}",
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary,
                                        fontSize = 12.sp
                                    )
                                    Text(
                                        text = dateFormat.format(Date(log.createdAt)),
                                        color = TextMuted,
                                        fontSize = 10.sp
                                    )
                                }
                                Text("Target: ${log.targetUserId}", color = TextSecondary, fontSize = 11.sp)
                                Text("Reason: ${log.reason}", color = GoldYellow, fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }

        // Adjust Coins Dialog
        if (showAdjustCoinsDialog && selectedUserForAction != null) {
            val target = selectedUserForAction!!
            AlertDialog(
                onDismissRequest = { showAdjustCoinsDialog = false },
                title = { Text("Adjust Coins: ${target.username}", color = GoldYellow) },
                text = {
                    Column {
                        Text("Current balance: ${formatCoins(target.coinBalance)} Coins", color = TextSecondary)
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(modifier = Modifier.fillMaxWidth()) {
                            Button(
                                onClick = { isDeductingCoins = false },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (!isDeductingCoins) EmeraldGreen else Color(0xFF1B3D2B)
                                ),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("+ Add")
                            }
                            Spacer(modifier = Modifier.width(6.dp))
                            Button(
                                onClick = { isDeductingCoins = true },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isDeductingCoins) LossRed else Color(0xFF3D1B1B)
                                ),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("- Deduct")
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = adjustAmountText,
                            onValueChange = { adjustAmountText = it.filter { ch -> ch.isDigit() } },
                            label = { Text("Amount (Coins)") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = adjustReasonText,
                            onValueChange = { adjustReasonText = it },
                            label = { Text("Reason (Mandatory)") },
                            placeholder = { Text("e.g. Tournament reward or correction") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val amt = adjustAmountText.toLongOrNull() ?: 0L
                            val finalAmt = if (isDeductingCoins) -amt else amt
                            viewModel.adminAdjustCoins(
                                targetUserId = target.id,
                                amount = finalAmt,
                                type = if (finalAmt >= 0) "ADMIN_BONUS" else "ADMIN_DEDUCTION",
                                reason = adjustReasonText
                            )
                            showAdjustCoinsDialog = false
                        },
                        enabled = adjustAmountText.isNotBlank() && adjustReasonText.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(containerColor = GoldYellow, contentColor = Color.Black)
                    ) {
                        Text("Apply")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showAdjustCoinsDialog = false }) {
                        Text("Cancel", color = TextSecondary)
                    }
                },
                containerColor = PoolCard
            )
        }

        // Reset Password Dialog
        if (showResetPasswordDialog && selectedUserForAction != null) {
            val target = selectedUserForAction!!
            AlertDialog(
                onDismissRequest = { showResetPasswordDialog = false },
                title = { Text("Reset Password: ${target.username}", color = GoldYellow) },
                text = {
                    Column {
                        OutlinedTextField(
                            value = resetPassNewText,
                            onValueChange = { resetPassNewText = it },
                            label = { Text("New Password") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            viewModel.adminResetPassword(target.id, resetPassNewText, "Admin reset user password")
                            showResetPasswordDialog = false
                        },
                        enabled = resetPassNewText.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(containerColor = GoldYellow, contentColor = Color.Black)
                    ) {
                        Text("Reset")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showResetPasswordDialog = false }) {
                        Text("Cancel", color = TextSecondary)
                    }
                },
                containerColor = PoolCard
            )
        }
    }
}

@Composable
private fun MetricCard(
    title: String,
    value: String,
    subtext: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = PoolCard),
        border = androidx.compose.foundation.BorderStroke(1.dp, PoolCardBorder)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(title, color = TextSecondary, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(value, color = GoldYellow, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
            Spacer(modifier = Modifier.height(2.dp))
            Text(subtext, color = TextMuted, fontSize = 11.sp)
        }
    }
}
