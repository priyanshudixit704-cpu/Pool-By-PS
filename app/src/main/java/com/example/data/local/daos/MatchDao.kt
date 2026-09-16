package com.example.data.local.daos

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entities.MatchEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MatchDao {
    @Query("SELECT * FROM matches ORDER BY endedAt DESC")
    fun getAllMatches(): Flow<List<MatchEntity>>

    @Query("SELECT * FROM matches WHERE playersJson LIKE '%' || :playerId || '%' ORDER BY endedAt DESC")
    fun getMatchesForUser(playerId: String): Flow<List<MatchEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMatch(match: MatchEntity)

    @Update
    suspend fun updateMatch(match: MatchEntity)

    @Query("SELECT COUNT(*) FROM matches")
    suspend fun getTotalMatchesCount(): Int

    @Query("SELECT COUNT(*) FROM matches WHERE status = 'IN_PROGRESS'")
    suspend fun getActiveMatchesCount(): Int

    @Query("SELECT COUNT(*) FROM matches WHERE startedAt >= :sinceTimestamp")
    suspend fun getMatchesCountSince(sinceTimestamp: Long): Int
}
