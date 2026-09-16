package com.example.ui

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.AppDatabase
import com.example.data.local.entities.AdminAuditLogEntity
import com.example.data.local.entities.GameConfigEntity
import com.example.data.local.entities.InvitationEntity
import com.example.data.local.entities.MatchEntity
import com.example.data.local.entities.RoomEntity
import com.example.data.local.entities.TransactionEntity
import com.example.data.local.entities.UserEntity
import com.example.data.repository.AdminStats
import com.example.data.repository.PoolRepository
import com.example.game.MatchPlayer
import com.example.game.PoolGameEngine
import com.example.game.PoolTable
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed class Screen {
    data object Auth : Screen()
    data object Home : Screen()
    data class MatchRoom(val room: RoomEntity) : Screen()
    data class ActiveGame(
        val room: RoomEntity,
        val players: List<MatchPlayer>
    ) : Screen()
    data object Leaderboard : Screen()
    data object MatchHistory : Screen()
    data object Profile : Screen()
    data object AdminDashboard : Screen()
}

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val db = AppDatabase.getDatabase(application)
    val repository = PoolRepository(db)

    // Current Navigation Destination
    var currentScreen by mutableStateOf<Screen>(Screen.Auth)

    // Logged in user
    private val _currentUser = MutableStateFlow<UserEntity?>(null)
    val currentUser: StateFlow<UserEntity?> = _currentUser.asStateFlow()

    // Admin user (if logged in as admin)
    private val _adminUser = MutableStateFlow<UserEntity?>(null)
    val adminUser: StateFlow<UserEntity?> = _adminUser.asStateFlow()

    // Config
    val gameConfig: StateFlow<GameConfigEntity?> = repository.gameConfig.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = GameConfigEntity()
    )

    // Leaderboard
    val leaderboard: StateFlow<List<UserEntity>> = repository.leaderboard.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    // Active rooms
    val activeRooms: StateFlow<List<RoomEntity>> = repository.activeRooms.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    // User Transactions
    private val _userTransactions = MutableStateFlow<List<TransactionEntity>>(emptyList())
    val userTransactions: StateFlow<List<TransactionEntity>> = _userTransactions.asStateFlow()

    // User Matches
    private val _userMatches = MutableStateFlow<List<MatchEntity>>(emptyList())
    val userMatches: StateFlow<List<MatchEntity>> = _userMatches.asStateFlow()

    // Pending Invitations
    private val _pendingInvitations = MutableStateFlow<List<InvitationEntity>>(emptyList())
    val pendingInvitations: StateFlow<List<InvitationEntity>> = _pendingInvitations.asStateFlow()

    // Admin State
    private val _adminStats = MutableStateFlow(AdminStats())
    val adminStats: StateFlow<AdminStats> = _adminStats.asStateFlow()

    val allUsers: StateFlow<List<UserEntity>> = repository.getAllUsers().stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val allTransactions: StateFlow<List<TransactionEntity>> = repository.allTransactions.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val allAuditLogs: StateFlow<List<AdminAuditLogEntity>> = repository.allAuditLogs.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val allMatches: StateFlow<List<MatchEntity>> = repository.allMatches.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    // UI Toast/Feedback message
    var toastMessage by mutableStateOf<String?>(null)
    var isOperating by mutableStateOf(false)

    // Active Pool Game Engine reference
    var activeEngine by mutableStateOf<PoolGameEngine?>(null)

    fun clearToast() {
        toastMessage = null
    }

    fun showToast(msg: String) {
        toastMessage = msg
    }

    // Refresh user's reactive streams
    private fun bindUserData(user: UserEntity) {
        viewModelScope.launch {
            repository.getUser(user.id).collect { updated ->
                if (updated != null) {
                    _currentUser.value = updated
                }
            }
        }
        viewModelScope.launch {
            repository.getUserTransactions(user.id).collect { txns ->
                _userTransactions.value = txns
            }
        }
        viewModelScope.launch {
            repository.getUserMatches(user.playerId).collect { matches ->
                _userMatches.value = matches
            }
        }
        viewModelScope.launch {
            repository.getPendingInvitations(user.playerId).collect { invites ->
                _pendingInvitations.value = invites
            }
        }
    }

    fun register(username: String, pass: String, emailOrPhone: String, avatar: String) {
        viewModelScope.launch {
            isOperating = true
            val res = repository.registerUser(username, pass, emailOrPhone, avatar)
            isOperating = false
            res.onSuccess { user ->
                _currentUser.value = user
                bindUserData(user)
                currentScreen = Screen.Home
                showToast("Welcome ${user.username}! You received 100,000 Coins!")
            }.onFailure { err ->
                showToast(err.message ?: "Registration failed")
            }
        }
    }

    fun login(identifier: String, pass: String) {
        viewModelScope.launch {
            isOperating = true
            val res = repository.loginUser(identifier, pass)
            isOperating = false
            res.onSuccess { user ->
                if (user.role == "ADMIN") {
                    _adminUser.value = user
                    loadAdminData()
                    currentScreen = Screen.AdminDashboard
                    showToast("Logged in as Admin")
                } else {
                    _currentUser.value = user
                    bindUserData(user)
                    currentScreen = Screen.Home
                    showToast("Welcome back, ${user.username}!")
                }
            }.onFailure { err ->
                showToast(err.message ?: "Login failed")
            }
        }
    }

    fun loginAdmin(identifier: String, pass: String) {
        viewModelScope.launch {
            isOperating = true
            val res = repository.loginUser(identifier, pass)
            isOperating = false
            res.onSuccess { user ->
                if (user.role == "ADMIN") {
                    _adminUser.value = user
                    loadAdminData()
                    currentScreen = Screen.AdminDashboard
                    showToast("Admin access granted")
                } else {
                    showToast("This account does not have Admin privileges")
                }
            }.onFailure { err ->
                showToast(err.message ?: "Admin login failed")
            }
        }
    }

    fun logout() {
        val user = _currentUser.value
        if (user != null) {
            viewModelScope.launch {
                repository.logoutUser(user.id)
            }
        }
        _currentUser.value = null
        currentScreen = Screen.Auth
        showToast("Logged out successfully")
    }

    fun logoutAdmin() {
        _adminUser.value = null
        currentScreen = Screen.Auth
        showToast("Admin session ended")
    }

    fun toggleOnline(isOnline: Boolean) {
        val user = _currentUser.value ?: return
        viewModelScope.launch {
            repository.toggleOnlineStatus(user.id, isOnline)
        }
    }

    fun resetPassword(identifier: String, newPass: String) {
        viewModelScope.launch {
            isOperating = true
            val res = repository.resetPasswordSelf(identifier, newPass)
            isOperating = false
            res.onSuccess {
                showToast("Password reset successfully. Please login.")
            }.onFailure { err ->
                showToast(err.message ?: "Password reset failed")
            }
        }
    }

    // Match & Room flow
    fun startQuickPlay(mode: String, entryAmount: Long, durationMinutes: Int) {
        val user = _currentUser.value ?: return
        if (user.coinBalance < entryAmount) {
            showToast("Insufficient balance! You need $entryAmount coins.")
            return
        }

        viewModelScope.launch {
            isOperating = true
            val room = repository.createRoom(user, mode, entryAmount, durationMinutes, isPrivate = false)
            isOperating = false
            currentScreen = Screen.MatchRoom(room)
        }
    }

    fun sendInvite(targetPlayerId: String, mode: String, entryAmount: Long, durationMinutes: Int) {
        val user = _currentUser.value ?: return
        viewModelScope.launch {
            isOperating = true
            val res = repository.sendInvitation(user, targetPlayerId, mode, entryAmount, durationMinutes)
            isOperating = false
            res.onSuccess { invite ->
                showToast("Invitation sent to $targetPlayerId!")
            }.onFailure { err ->
                showToast(err.message ?: "Failed to send invitation")
            }
        }
    }

    fun respondToInvite(invite: InvitationEntity, accept: Boolean) {
        viewModelScope.launch {
            isOperating = true
            val res = repository.respondToInvitation(invite.invitationId, accept)
            isOperating = false
            res.onSuccess { room ->
                if (accept && room != null) {
                    currentScreen = Screen.MatchRoom(room)
                    showToast("Invitation accepted! Entering room.")
                } else {
                    showToast("Invitation declined.")
                }
            }.onFailure { err ->
                showToast(err.message ?: "Failed to respond to invitation")
            }
        }
    }

    fun enterGameFromRoom(room: RoomEntity) {
        val user = _currentUser.value ?: return
        viewModelScope.launch {
            isOperating = true
            // Atomic coin deduction
            val deductRes = repository.deductMatchEntry(
                userId = user.id,
                entryAmount = room.entryAmount,
                matchId = "MTH-PENDING",
                roomId = room.roomId
            )
            isOperating = false

            deductRes.onSuccess {
                // Setup players
                val matchPlayers = mutableListOf<MatchPlayer>()
                if (room.mode == "2v2") {
                    matchPlayers.add(MatchPlayer(user.playerId, user.username, user.avatar, team = 1, isBot = false))
                    matchPlayers.add(MatchPlayer("8BP-BOT-A2", "Alex (P2)", "avatar_2", team = 1, isBot = true))
                    matchPlayers.add(MatchPlayer("8BP-BOT-B1", "Sam (P3)", "avatar_3", team = 2, isBot = true))
                    matchPlayers.add(MatchPlayer("8BP-BOT-B2", "Leo (P4)", "avatar_4", team = 2, isBot = true))
                } else {
                    matchPlayers.add(MatchPlayer(user.playerId, user.username, user.avatar, team = 1, isBot = false))
                    matchPlayers.add(MatchPlayer("8BP-OPP-99", "Challenger", "avatar_5", team = 2, isBot = true))
                }

                val table = PoolTable()
                val engine = PoolGameEngine(
                    table = table,
                    players = matchPlayers,
                    mode = room.mode,
                    durationMinutes = room.durationMinutes,
                    entryAmount = room.entryAmount,
                    onMatchEnded = { winner, loser, reason ->
                        handleMatchEnded(room, winner, loser, reason, matchPlayers)
                    }
                )
                activeEngine = engine
                currentScreen = Screen.ActiveGame(room, matchPlayers)
            }.onFailure { err ->
                showToast(err.message ?: "Failed to deduct entry coins")
            }
        }
    }

    private fun handleMatchEnded(
        room: RoomEntity,
        winner: MatchPlayer,
        loser: MatchPlayer,
        reason: String,
        players: List<MatchPlayer>
    ) {
        viewModelScope.launch {
            val playersJson = players.joinToString(",") { "${it.username} (${it.playerId})" }
            val teamsJson = if (room.mode == "2v2") "Team 1 vs Team 2" else "${players[0].username} vs ${players[1].username}"

            repository.recordMatchCompletion(
                roomId = room.roomId,
                mode = room.mode,
                durationMinutes = room.durationMinutes,
                entryAmount = room.entryAmount,
                winnerPlayerId = winner.playerId,
                winnerName = winner.username,
                loserPlayerId = loser.playerId,
                loserName = loser.username,
                playersListJson = playersJson,
                teamsJson = teamsJson
            )
            showToast("Match finished! ${winner.username} won the pot of ${room.entryAmount * 2} coins!")
        }
    }

    fun leaveGame() {
        activeEngine = null
        currentScreen = Screen.Home
    }

    // Admin Operations
    fun loadAdminData() {
        viewModelScope.launch {
            _adminStats.value = repository.getAdminStats()
        }
    }

    fun adminAdjustCoins(targetUserId: Long, amount: Long, type: String, reason: String) {
        val admin = _adminUser.value ?: return
        viewModelScope.launch {
            isOperating = true
            val res = repository.adminAdjustCoins(admin.username, targetUserId, amount, type, reason)
            isOperating = false
            res.onSuccess {
                loadAdminData()
                showToast("Coins adjusted successfully ($amount)")
            }.onFailure { err ->
                showToast(err.message ?: "Coin adjustment failed")
            }
        }
    }

    fun adminUpdateUserStatus(targetUserId: Long, status: String, reason: String) {
        val admin = _adminUser.value ?: return
        viewModelScope.launch {
            isOperating = true
            val res = repository.adminUpdateUserStatus(admin.username, targetUserId, status, reason)
            isOperating = false
            res.onSuccess {
                loadAdminData()
                showToast("User status updated to $status")
            }.onFailure { err ->
                showToast(err.message ?: "Failed to update user status")
            }
        }
    }

    fun adminResetPassword(targetUserId: Long, newPass: String, reason: String) {
        val admin = _adminUser.value ?: return
        viewModelScope.launch {
            isOperating = true
            val res = repository.adminResetUserPassword(admin.username, targetUserId, newPass, reason)
            isOperating = false
            res.onSuccess {
                showToast("Password reset successfully")
            }.onFailure { err ->
                showToast(err.message ?: "Failed to reset password")
            }
        }
    }

    fun adminUpdateGameConfig(config: GameConfigEntity, reason: String) {
        val admin = _adminUser.value ?: return
        viewModelScope.launch {
            isOperating = true
            val res = repository.adminUpdateGameConfig(admin.username, config, reason)
            isOperating = false
            res.onSuccess {
                showToast("Game configuration saved")
            }.onFailure { err ->
                showToast(err.message ?: "Failed to update config")
            }
        }
    }
}
