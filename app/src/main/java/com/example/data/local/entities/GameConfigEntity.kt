package com.example.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "game_config")
data class GameConfigEntity(
    @PrimaryKey
    val id: Int = 1,
    val allowedEntryAmountsCsv: String = "1000,2000,5000,10000",
    val customEntryMin: Long = 500L,
    val customEntryMax: Long = 500000L,
    val availableDurationsCsv: String = "1,2,5",
    val is1v1Enabled: Boolean = true,
    val is2v2Enabled: Boolean = true,
    val isMaintenanceMode: Boolean = false,
    val maxActiveRooms: Int = 100
) {
    fun parseAllowedEntries(): List<Long> {
        return allowedEntryAmountsCsv.split(",").mapNotNull { it.trim().toLongOrNull() }
    }

    fun parseAvailableDurations(): List<Int> {
        return availableDurationsCsv.split(",").mapNotNull { it.trim().toIntOrNull() }
    }
}
