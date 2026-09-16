package com.example.data.repository

import com.example.data.local.AppDatabase
import com.example.data.local.entities.AdminAuditLogEntity
import com.example.data.local.entities.GameConfigEntity
import com.example.data.local.entities.InvitationEntity
import com.example.data.local.entities.MatchEntity
import com.example.data.local.entities.RoomEntity
import com.example.data.local.entities.TransactionEntity
import com.example.data.local.entities.UserEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import java.util.UUID
import kotlin.random.Random

data class AdminStats(
    val totalUsers: Int = 0,
    val onlineUsers: Int = 0,
    val totalMatches: Int = 0,
    val activeMatches: Int = 0,
    val totalCoinsInCirculation: Long = 0L,
    val totalCoinsAwarded: Long = 0L,
    val totalCoinsDeducted: Long = 0L,
    val todayMatches: Int = 0,
    val todayNewUsers: Int = 0
)

class PoolRepository(private val db: AppDatabase) {
    private val userDao = db.userDao()
    private val transactionDao = db.transactionDao()
    private val matchDao = db.matchDao()
    private val invitationDao = db.invitationDao()
    private val roomDao = db.roomDao()
    private val auditLogDao = db.adminAuditLogDao()
    private val gameConfigDao = db.gameConfigDao()

    val gameConfig: Flow<GameConfigEntity?> = gameConfigDao.getConfig()
    val leaderboard: Flow<List<UserEntity>> = userDao.getLeaderboard()
    val allTransactions: Flow<List<TransactionEntity>> = transactionDao.getAllTransactions()
    val allAuditLogs: Flow<List<AdminAuditLogEntity>> = auditLogDao.getAllAuditLogs()
    val allMatches: Flow<List<MatchEntity>> = matchDao.getAllMatches()
    val activeRooms: Flow<List<RoomEntity>> = roomDao.getActiveRooms()

    fun getUser(userId: Long): Flow<UserEntity?> = userDao.getUserById(userId)
    fun getUserTransactions(userId: Long): Flow<List<TransactionEntity>> = transactionDao.getTransactionsForUser(userId)
    fun getUserMatches(playerId: String): Flow<List<MatchEntity>> = matchDao.getMatchesForUser(playerId)
    fun getPendingInvitations(playerId: String): Flow<List<InvitationEntity>> = invitationDao.getPendingInvitations(playerId)
    fun searchUsers(query: String): Flow<List<UserEntity>> = userDao.searchUsers(query)
    fun getAllUsers(): Flow<List<UserEntity>> = userDao.getAllUsers()

    suspend fun getUserByPlayerIdSync(playerId: String): UserEntity? = withContext(Dispatchers.IO) {
        userDao.getUserByPlayerIdSync(playerId)
    }

    suspend fun getRoomByIdSync(roomId: String): RoomEntity? = withContext(Dispatchers.IO) {
        roomDao.getRoomByIdSync(roomId)
    }

    suspend fun registerUser(
        username: String,
        password: String,
        emailOrPhone: String,
        avatar: String
    ): Result<UserEntity> = withContext(Dispatchers.IO) {
        if (username.isBlank() || password.isBlank()) {
            return@withContext Result.failure(IllegalArgumentException("Username and password cannot be empty"))
        }

        val existingUser = userDao.getUserByUsernameSync(username.trim())
        if (existingUser != null) {
            return@withContext Result.failure(IllegalStateException("Username already taken. Please choose another."))
        }

        // Generate a guaranteed unique Player ID: "8BP-" + 6 digits
        var playerId: String
        do {
            val randomDigits = Random.nextInt(100000, 999999)
            playerId = "8BP-$randomDigits"
        } while (userDao.getUserByPlayerIdSync(playerId) != null)

        val startingBalance = 100000L // 100,000 starting virtual coins
        val newUser = UserEntity(
            playerId = playerId,
            username = username.trim(),
            password = password,
            emailOrPhone = emailOrPhone.trim(),
            avatar = avatar,
            coinBalance = startingBalance,
            role = "USER",
            status = "ACTIVE",
            isApproved = true,
            isOnline = true,
            createdAt = System.currentTimeMillis(),
            lastActive = System.currentTimeMillis()
        )

        val userId = userDao.insertUser(newUser)
        val createdUser = newUser.copy(id = userId)

        // Record starting bonus transaction
        val txn = TransactionEntity(
            transactionId = "TXN-${UUID.randomUUID().toString().take(8).uppercase()}",
            userId = userId,
            userPlayerId = playerId,
            type = "STARTING_BONUS",
            amount = startingBalance,
            previousBalance = 0L,
            newBalance = startingBalance,
            description = "Welcome bonus - 100,000 free virtual game coins"
        )
        transactionDao.insertTransaction(txn)

        Result.success(createdUser)
    }

    suspend fun loginUser(identifier: String, password: String): Result<UserEntity> = withContext(Dispatchers.IO) {
        val user = userDao.findUserForLogin(identifier.trim())
            ?: return@withContext Result.failure(IllegalArgumentException("User not found with '$identifier'"))

        if (user.password != password) {
            return@withContext Result.failure(IllegalArgumentException("Incorrect password"))
        }

        if (user.status == "SUSPENDED") {
            return@withContext Result.failure(IllegalStateException("Account suspended. Please contact admin."))
        }

        if (!user.isApproved) {
            return@withContext Result.failure(IllegalStateException("Account pending admin approval."))
        }

        // Mark online and update last active
        val now = System.currentTimeMillis()
        userDao.updateOnlineStatus(user.id, true, now)
        Result.success(user.copy(isOnline = true, lastActive = now))
    }

    suspend fun logoutUser(userId: Long) = withContext(Dispatchers.IO) {
        userDao.updateOnlineStatus(userId, false, System.currentTimeMillis())
    }

    suspend fun toggleOnlineStatus(userId: Long, isOnline: Boolean) = withContext(Dispatchers.IO) {
        userDao.updateOnlineStatus(userId, isOnline, System.currentTimeMillis())
    }

    suspend fun resetPasswordSelf(identifier: String, newPassword: String): Result<Unit> = withContext(Dispatchers.IO) {
        val user = userDao.findUserForLogin(identifier.trim())
            ?: return@withContext Result.failure(IllegalArgumentException("No user found with '$identifier'"))

        userDao.updatePassword(user.id, newPassword)
        Result.success(Unit)
    }

    suspend fun deductMatchEntry(
        userId: Long,
        entryAmount: Long,
        matchId: String,
        roomId: String
    ): Result<Long> = withContext(Dispatchers.IO) {
        val user = userDao.getUserByIdSync(userId)
            ?: return@withContext Result.failure(IllegalArgumentException("User not found"))

        if (user.coinBalance < entryAmount) {
            return@withContext Result.failure(IllegalStateException("Insufficient virtual coins. Required: $entryAmount, Balance: ${user.coinBalance}"))
        }

        val previousBalance = user.coinBalance
        val newBalance = previousBalance - entryAmount

        userDao.updateCoinBalance(userId, newBalance)

        val txn = TransactionEntity(
            transactionId = "TXN-${UUID.randomUUID().toString().take(8).uppercase()}",
            userId = userId,
            userPlayerId = user.playerId,
            type = "MATCH_ENTRY",
            amount = -entryAmount,
            previousBalance = previousBalance,
            newBalance = newBalance,
            matchId = matchId,
            description = "Entry fee for $roomId"
        )
        transactionDao.insertTransaction(txn)

        Result.success(newBalance)
    }

    suspend fun recordMatchCompletion(
        roomId: String,
        mode: String,
        durationMinutes: Int,
        entryAmount: Long,
        winnerPlayerId: String,
        winnerName: String,
        loserPlayerId: String,
        loserName: String,
        playersListJson: String,
        teamsJson: String
    ): Result<Unit> = withContext(Dispatchers.IO) {
        val matchId = "MTH-${UUID.randomUUID().toString().take(6).uppercase()}"
        val potReward = entryAmount * 2L // Winner takes pot

        // Winner reward
        val winnerUser = userDao.getUserByPlayerIdSync(winnerPlayerId)
        if (winnerUser != null) {
            val prevBalance = winnerUser.coinBalance
            val newBalance = prevBalance + potReward
            userDao.updateCoinBalance(winnerUser.id, newBalance)
            userDao.incrementMatchStats(winnerUser.id, wonInc = 1, lostInc = 0)

            val winTxn = TransactionEntity(
                transactionId = "TXN-${UUID.randomUUID().toString().take(8).uppercase()}",
                userId = winnerUser.id,
                userPlayerId = winnerUser.playerId,
                type = "MATCH_RESULT",
                amount = potReward,
                previousBalance = prevBalance,
                newBalance = newBalance,
                matchId = matchId,
                description = "Victory pot reward in $mode match $roomId"
            )
            transactionDao.insertTransaction(winTxn)
        }

        // Loser stats update
        val loserUser = userDao.getUserByPlayerIdSync(loserPlayerId)
        if (loserUser != null) {
            userDao.incrementMatchStats(loserUser.id, wonInc = 0, lostInc = 1)
        }

        // Insert Match Record
        val matchEntity = MatchEntity(
            matchId = matchId,
            roomId = roomId,
            mode = mode,
            playersJson = playersListJson,
            teamsJson = teamsJson,
            entryAmount = entryAmount,
            durationMinutes = durationMinutes,
            status = "COMPLETED",
            winnerPlayerId = winnerPlayerId,
            winnerName = winnerName,
            coinsWonLost = potReward - entryAmount,
            startedAt = System.currentTimeMillis() - (durationMinutes * 60 * 1000L),
            endedAt = System.currentTimeMillis()
        )
        matchDao.insertMatch(matchEntity)

        // Close room if exists
        val room = roomDao.getRoomByIdSync(roomId)
        if (room != null) {
            roomDao.updateRoom(room.copy(status = "FINISHED"))
        }

        Result.success(Unit)
    }

    suspend fun createRoom(
        host: UserEntity,
        mode: String,
        entryAmount: Long,
        durationMinutes: Int,
        isPrivate: Boolean = false
    ): RoomEntity = withContext(Dispatchers.IO) {
        val randomRoomCode = "#" + UUID.randomUUID().toString().take(6).uppercase()
        val roomId = "ROOM $randomRoomCode"
        val room = RoomEntity(
            roomId = roomId,
            hostPlayerId = host.playerId,
            hostUsername = host.username,
            playersJson = host.username,
            mode = mode,
            entryAmount = entryAmount,
            durationMinutes = durationMinutes,
            isPrivate = isPrivate,
            status = "WAITING",
            createdAt = System.currentTimeMillis()
        )
        roomDao.insertRoom(room)
        room
    }

    suspend fun sendInvitation(
        sender: UserEntity,
        targetPlayerId: String,
        mode: String,
        entryAmount: Long,
        durationMinutes: Int
    ): Result<InvitationEntity> = withContext(Dispatchers.IO) {
        if (sender.playerId.equals(targetPlayerId.trim(), ignoreCase = true)) {
            return@withContext Result.failure(IllegalArgumentException("You cannot invite yourself to play!"))
        }

        val targetUser = userDao.getUserByPlayerIdSync(targetPlayerId.trim())
            ?: return@withContext Result.failure(IllegalArgumentException("No player found with ID: $targetPlayerId"))

        if (targetUser.coinBalance < entryAmount) {
            return@withContext Result.failure(IllegalStateException("Player ${targetUser.username} does not have enough virtual coins ($entryAmount needed)"))
        }

        val roomId = "ROOM #" + UUID.randomUUID().toString().take(6).uppercase()
        val invitation = InvitationEntity(
            invitationId = "INV-${UUID.randomUUID().toString().take(8).uppercase()}",
            senderPlayerId = sender.playerId,
            senderUsername = sender.username,
            senderAvatar = sender.avatar,
            receiverPlayerId = targetUser.playerId,
            roomId = roomId,
            mode = mode,
            entryAmount = entryAmount,
            durationMinutes = durationMinutes,
            status = "PENDING",
            createdAt = System.currentTimeMillis()
        )
        invitationDao.insertInvitation(invitation)

        // Also pre-create the waiting private room
        val room = RoomEntity(
            roomId = roomId,
            hostPlayerId = sender.playerId,
            hostUsername = sender.username,
            playersJson = "${sender.username},${targetUser.username}",
            mode = mode,
            entryAmount = entryAmount,
            durationMinutes = durationMinutes,
            isPrivate = true,
            status = "WAITING"
        )
        roomDao.insertRoom(room)

        Result.success(invitation)
    }

    suspend fun respondToInvitation(
        invitationId: String,
        accepted: Boolean
    ): Result<RoomEntity?> = withContext(Dispatchers.IO) {
        val invitation = invitationDao.getInvitationById(invitationId)
            ?: return@withContext Result.failure(IllegalArgumentException("Invitation not found"))

        val newStatus = if (accepted) "ACCEPTED" else "DECLINED"
        invitationDao.updateInvitationStatus(invitationId, newStatus)

        if (accepted) {
            val room = roomDao.getRoomByIdSync(invitation.roomId)
            return@withContext Result.success(room)
        } else {
            return@withContext Result.success(null)
        }
    }

    // Admin Operations
    suspend fun adminAdjustCoins(
        adminId: String,
        targetUserId: Long,
        amount: Long,
        type: String, // "ADMIN_ADJUSTMENT", "BONUS", "REFUND"
        reason: String
    ): Result<Unit> = withContext(Dispatchers.IO) {
        if (reason.isBlank()) {
            return@withContext Result.failure(IllegalArgumentException("Reason is required for every manual coin adjustment!"))
        }

        val user = userDao.getUserByIdSync(targetUserId)
            ?: return@withContext Result.failure(IllegalArgumentException("Target user not found"))

        val prevBalance = user.coinBalance
        val newBalance = (prevBalance + amount).coerceAtLeast(0L)
        userDao.updateCoinBalance(targetUserId, newBalance)

        val txn = TransactionEntity(
            transactionId = "TXN-${UUID.randomUUID().toString().take(8).uppercase()}",
            userId = targetUserId,
            userPlayerId = user.playerId,
            type = type,
            amount = amount,
            previousBalance = prevBalance,
            newBalance = newBalance,
            description = "Admin ($adminId): $reason"
        )
        transactionDao.insertTransaction(txn)

        val log = AdminAuditLogEntity(
            logId = "LOG-${UUID.randomUUID().toString().take(8).uppercase()}",
            adminId = adminId,
            action = "COIN_ADJUSTMENT",
            targetUserId = "${user.username} (${user.playerId})",
            amount = amount,
            reason = reason
        )
        auditLogDao.insertAuditLog(log)

        Result.success(Unit)
    }

    suspend fun adminUpdateUserStatus(
        adminId: String,
        targetUserId: Long,
        status: String,
        reason: String
    ): Result<Unit> = withContext(Dispatchers.IO) {
        val user = userDao.getUserByIdSync(targetUserId)
            ?: return@withContext Result.failure(IllegalArgumentException("Target user not found"))

        userDao.updateUserStatus(targetUserId, status)

        val log = AdminAuditLogEntity(
            logId = "LOG-${UUID.randomUUID().toString().take(8).uppercase()}",
            adminId = adminId,
            action = "USER_STATUS_$status",
            targetUserId = "${user.username} (${user.playerId})",
            reason = reason
        )
        auditLogDao.insertAuditLog(log)

        Result.success(Unit)
    }

    suspend fun adminResetUserPassword(
        adminId: String,
        targetUserId: Long,
        newPass: String,
        reason: String
    ): Result<Unit> = withContext(Dispatchers.IO) {
        val user = userDao.getUserByIdSync(targetUserId)
            ?: return@withContext Result.failure(IllegalArgumentException("Target user not found"))

        userDao.updatePassword(targetUserId, newPass)

        val log = AdminAuditLogEntity(
            logId = "LOG-${UUID.randomUUID().toString().take(8).uppercase()}",
            adminId = adminId,
            action = "PASSWORD_RESET",
            targetUserId = "${user.username} (${user.playerId})",
            reason = reason
        )
        auditLogDao.insertAuditLog(log)

        Result.success(Unit)
    }

    suspend fun adminUpdateGameConfig(
        adminId: String,
        config: GameConfigEntity,
        reason: String
    ): Result<Unit> = withContext(Dispatchers.IO) {
        gameConfigDao.insertOrUpdateConfig(config)

        val log = AdminAuditLogEntity(
            logId = "LOG-${UUID.randomUUID().toString().take(8).uppercase()}",
            adminId = adminId,
            action = "CONFIG_UPDATE",
            targetUserId = "GLOBAL_SETTINGS",
            reason = reason
        )
        auditLogDao.insertAuditLog(log)

        Result.success(Unit)
    }

    suspend fun getAdminStats(): AdminStats = withContext(Dispatchers.IO) {
        val totalUsers = userDao.getUserCount()
        val onlineUsers = userDao.getOnlineUserCount()
        val totalMatches = matchDao.getTotalMatchesCount()
        val activeMatches = roomDao.getActivePlayingRoomsCount()
        val circulation = transactionDao.getTotalCoinsInCirculation() ?: 0L
        val awarded = transactionDao.getTotalCoinsAwarded() ?: 0L
        val deducted = transactionDao.getTotalCoinsDeducted() ?: 0L

        val todayMidnight = System.currentTimeMillis() - (24 * 60 * 60 * 1000L)
        val todayMatches = matchDao.getMatchesCountSince(todayMidnight)
        val todayNewUsers = userDao.getNewUsersCountSince(todayMidnight)

        AdminStats(
            totalUsers = totalUsers,
            onlineUsers = onlineUsers,
            totalMatches = totalMatches,
            activeMatches = activeMatches,
            totalCoinsInCirculation = circulation,
            totalCoinsAwarded = awarded,
            totalCoinsDeducted = deducted,
            todayMatches = todayMatches,
            todayNewUsers = todayNewUsers
        )
    }
}
