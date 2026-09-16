package com.example.data.local.daos

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.data.local.entities.GameConfigEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface GameConfigDao {
    @Query("SELECT * FROM game_config WHERE id = 1")
    fun getConfig(): Flow<GameConfigEntity?>

    @Query("SELECT * FROM game_config WHERE id = 1")
    suspend fun getConfigSync(): GameConfigEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateConfig(config: GameConfigEntity)
}
