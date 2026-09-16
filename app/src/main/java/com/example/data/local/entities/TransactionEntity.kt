package com.example.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey
    val transactionId: String, // e.g. "TXN-1726000000-1234"
    val userId: Long,
    val userPlayerId: String,
    val type: String, // "STARTING_BONUS", "MATCH_ENTRY", "MATCH_RESULT", "ADMIN_ADJUSTMENT", "BONUS", "REFUND", "OTHER"
    val amount: Long, // e.g. -5000 or +10000
    val previousBalance: Long,
    val newBalance: Long,
    val matchId: String? = null,
    val description: String,
    val createdAt: Long = System.currentTimeMillis()
)
