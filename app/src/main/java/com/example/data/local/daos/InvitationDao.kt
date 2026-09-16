package com.example.data.local.daos

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.data.local.entities.InvitationEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface InvitationDao {
    @Query("SELECT * FROM invitations WHERE receiverPlayerId = :receiverPlayerId AND status = 'PENDING' ORDER BY createdAt DESC")
    fun getPendingInvitations(receiverPlayerId: String): Flow<List<InvitationEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInvitation(invitation: InvitationEntity)

    @Query("UPDATE invitations SET status = :status WHERE invitationId = :invitationId")
    suspend fun updateInvitationStatus(invitationId: String, status: String)

    @Query("SELECT * FROM invitations WHERE invitationId = :invitationId")
    suspend fun getInvitationById(invitationId: String): InvitationEntity?
}
