package com.example.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "admin_audit_logs")
data class AdminAuditLogEntity(
    @PrimaryKey
    val logId: String, // e.g. "LOG-192834"
    val adminId: String, // Admin username or ID
    val action: String, // "COIN_ADJUSTMENT", "STATUS_CHANGE", "PASSWORD_RESET", "CONFIG_UPDATE"
    val targetUserId: String, // Player ID or Username
    val amount: Long? = null,
    val reason: String,
    val createdAt: Long = System.currentTimeMillis()
)
