package com.example.data.local.daos

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.data.local.entities.TransactionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TransactionDao {
    @Query("SELECT * FROM transactions WHERE userId = :userId ORDER BY createdAt DESC")
    fun getTransactionsForUser(userId: Long): Flow<List<TransactionEntity>>

    @Query("SELECT * FROM transactions ORDER BY createdAt DESC")
    fun getAllTransactions(): Flow<List<TransactionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: TransactionEntity)

    @Query("SELECT SUM(coinBalance) FROM users WHERE role = 'USER'")
    suspend fun getTotalCoinsInCirculation(): Long?

    @Query("SELECT SUM(amount) FROM transactions WHERE amount > 0 AND type != 'STARTING_BONUS'")
    suspend fun getTotalCoinsAwarded(): Long?

    @Query("SELECT SUM(ABS(amount)) FROM transactions WHERE amount < 0")
    suspend fun getTotalCoinsDeducted(): Long?
}
