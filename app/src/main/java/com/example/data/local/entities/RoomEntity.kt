package com.example.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "rooms")
data class RoomEntity(
    @PrimaryKey
    val roomId: String, // e.g. "ROOM #A82F91"
    val hostPlayerId: String,
    val hostUsername: String,
    val playersJson: String, // list of players in room
    val mode: String, // "1v1" or "2v2"
    val entryAmount: Long,
    val durationMinutes: Int,
    val isPrivate: Boolean = false,
    val status: String = "WAITING", // "WAITING", "PLAYING", "FINISHED"
    val createdAt: Long = System.currentTimeMillis()
)
