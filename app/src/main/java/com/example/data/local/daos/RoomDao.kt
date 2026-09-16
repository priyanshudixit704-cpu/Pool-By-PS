package com.example.data.local.daos

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entities.RoomEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface RoomDao {
    @Query("SELECT * FROM rooms WHERE roomId = :roomId")
    fun getRoomById(roomId: String): Flow<RoomEntity?>

    @Query("SELECT * FROM rooms WHERE roomId = :roomId")
    suspend fun getRoomByIdSync(roomId: String): RoomEntity?

    @Query("SELECT * FROM rooms WHERE status = 'WAITING' ORDER BY createdAt DESC")
    fun getOpenRooms(): Flow<List<RoomEntity>>

    @Query("SELECT * FROM rooms WHERE status != 'FINISHED' ORDER BY createdAt DESC")
    fun getActiveRooms(): Flow<List<RoomEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRoom(room: RoomEntity)

    @Update
    suspend fun updateRoom(room: RoomEntity)

    @Query("DELETE FROM rooms WHERE roomId = :roomId")
    suspend fun deleteRoom(roomId: String)

    @Query("SELECT COUNT(*) FROM rooms WHERE status = 'PLAYING'")
    suspend fun getActivePlayingRoomsCount(): Int
}
