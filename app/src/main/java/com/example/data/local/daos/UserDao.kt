package com.example.data.local.daos

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entities.UserEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE id = :id")
    fun getUserById(id: Long): Flow<UserEntity?>

    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getUserByIdSync(id: Long): UserEntity?

    @Query("SELECT * FROM users WHERE playerId = :playerId")
    fun getUserByPlayerId(playerId: String): Flow<UserEntity?>

    @Query("SELECT * FROM users WHERE playerId = :playerId")
    suspend fun getUserByPlayerIdSync(playerId: String): UserEntity?

    @Query("SELECT * FROM users WHERE username = :username")
    suspend fun getUserByUsernameSync(username: String): UserEntity?

    @Query("SELECT * FROM users WHERE username = :identifier OR playerId = :identifier")
    suspend fun findUserForLogin(identifier: String): UserEntity?

    @Query("SELECT * FROM users WHERE username LIKE '%' || :query || '%' OR playerId LIKE '%' || :query || '%' OR emailOrPhone LIKE '%' || :query || '%' ORDER BY createdAt DESC")
    fun searchUsers(query: String): Flow<List<UserEntity>>

    @Query("SELECT * FROM users ORDER BY createdAt DESC")
    fun getAllUsers(): Flow<List<UserEntity>>

    @Query("SELECT * FROM users ORDER BY createdAt DESC")
    suspend fun getAllUsersSync(): List<UserEntity>

    @Query("SELECT * FROM users WHERE role = 'USER' ORDER BY matchesWon DESC, coinBalance DESC LIMIT 50")
    fun getLeaderboard(): Flow<List<UserEntity>>

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insertUser(user: UserEntity): Long

    @Update
    suspend fun updateUser(user: UserEntity)

    @Query("UPDATE users SET coinBalance = :newBalance WHERE id = :userId")
    suspend fun updateCoinBalance(userId: Long, newBalance: Long)

    @Query("UPDATE users SET isOnline = :isOnline, lastActive = :lastActive WHERE id = :userId")
    suspend fun updateOnlineStatus(userId: Long, isOnline: Boolean, lastActive: Long)

    @Query("UPDATE users SET status = :status WHERE id = :userId")
    suspend fun updateUserStatus(userId: Long, status: String)

    @Query("UPDATE users SET isApproved = :approved WHERE id = :userId")
    suspend fun updateUserApproval(userId: Long, approved: Boolean)

    @Query("UPDATE users SET password = :newPassword WHERE id = :userId")
    suspend fun updatePassword(userId: Long, newPassword: String)

    @Query("UPDATE users SET matchesPlayed = matchesPlayed + 1, matchesWon = matchesWon + :wonInc, matchesLost = matchesLost + :lostInc WHERE id = :userId")
    suspend fun incrementMatchStats(userId: Long, wonInc: Int, lostInc: Int)

    @Query("SELECT COUNT(*) FROM users WHERE role = 'USER'")
    suspend fun getUserCount(): Int

    @Query("SELECT COUNT(*) FROM users WHERE role = 'USER' AND isOnline = 1")
    suspend fun getOnlineUserCount(): Int

    @Query("SELECT COUNT(*) FROM users WHERE role = 'USER' AND createdAt >= :sinceTimestamp")
    suspend fun getNewUsersCountSince(sinceTimestamp: Long): Int
}
