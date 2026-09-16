package com.example.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "users",
    indices = [
        Index(value = ["playerId"], unique = true),
        Index(value = ["username"], unique = true)
    ]
)
data class UserEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val playerId: String, // e.g. "8BP-104582"
    val username: String,
    val password: String, // In real app hashed; here stored safely locally
    val emailOrPhone: String,
    val avatar: String = "avatar_1", // avatar identifier
    val coinBalance: Long = 100000L, // Each new user starts with 100,000 virtual coins
    val role: String = "USER", // "USER" or "ADMIN"
    val status: String = "ACTIVE", // "ACTIVE" or "SUSPENDED"
    val isApproved: Boolean = true,
    val isOnline: Boolean = true,
    val matchesPlayed: Int = 0,
    val matchesWon: Int = 0,
    val matchesLost: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val lastActive: Long = System.currentTimeMillis()
) {
    val winPercentage: Float
        get() = if (matchesPlayed > 0) (matchesWon.toFloat() / matchesPlayed.toFloat()) * 100f else 0f
}
