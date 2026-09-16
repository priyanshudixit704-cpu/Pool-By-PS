package com.example.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "invitations")
data class InvitationEntity(
    @PrimaryKey
    val invitationId: String, // e.g. "INV-109283"
    val senderPlayerId: String,
    val senderUsername: String,
    val senderAvatar: String,
    val receiverPlayerId: String,
    val roomId: String,
    val mode: String, // "1v1" or "2v2"
    val entryAmount: Long,
    val durationMinutes: Int,
    val status: String, // "PENDING", "ACCEPTED", "DECLINED", "EXPIRED"
    val createdAt: Long = System.currentTimeMillis()
)
