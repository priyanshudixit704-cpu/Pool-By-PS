package com.example.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "matches")
data class MatchEntity(
    @PrimaryKey
    val matchId: String, // e.g. "MTH-9824"
    val roomId: String, // e.g. "#A82F91"
    val mode: String, // "1v1" or "2v2"
    val playersJson: String, // JSON or comma-separated player names/ids
    val teamsJson: String = "", // Team 1 vs Team 2 mapping
    val entryAmount: Long,
    val durationMinutes: Int, // 1, 2, or 5
    val status: String, // "COMPLETED", "IN_PROGRESS", "FORFEIT"
    val winnerPlayerId: String,
    val winnerName: String,
    val coinsWonLost: Long,
    val startedAt: Long = System.currentTimeMillis(),
    val endedAt: Long = System.currentTimeMillis()
)
