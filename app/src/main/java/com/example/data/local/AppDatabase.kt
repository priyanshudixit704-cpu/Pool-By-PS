package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.data.local.daos.AdminAuditLogDao
import com.example.data.local.daos.GameConfigDao
import com.example.data.local.daos.InvitationDao
import com.example.data.local.daos.MatchDao
import com.example.data.local.daos.RoomDao
import com.example.data.local.daos.TransactionDao
import com.example.data.local.daos.UserDao
import com.example.data.local.entities.AdminAuditLogEntity
import com.example.data.local.entities.GameConfigEntity
import com.example.data.local.entities.InvitationEntity
import com.example.data.local.entities.MatchEntity
import com.example.data.local.entities.RoomEntity
import com.example.data.local.entities.TransactionEntity
import com.example.data.local.entities.UserEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        UserEntity::class,
        TransactionEntity::class,
        MatchEntity::class,
        InvitationEntity::class,
        RoomEntity::class,
        AdminAuditLogEntity::class,
        GameConfigEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun transactionDao(): TransactionDao
    abstract fun matchDao(): MatchDao
    abstract fun invitationDao(): InvitationDao
    abstract fun roomDao(): RoomDao
    abstract fun adminAuditLogDao(): AdminAuditLogDao
    abstract fun gameConfigDao(): GameConfigDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "eight_ball_pool.db"
                ).addCallback(object : RoomDatabase.Callback() {
                    override fun onCreate(db: SupportSQLiteDatabase) {
                        super.onCreate(db)
                        // Seed required default admin account and default game config
                        INSTANCE?.let { database ->
                            CoroutineScope(Dispatchers.IO).launch {
                                seedInitialData(database)
                            }
                        }
                    }
                }).build()
                INSTANCE = instance
                instance
            }
        }

        private suspend fun seedInitialData(database: AppDatabase) {
            // Check if admin exists
            val existingAdmin = database.userDao().getUserByUsernameSync("admin")
            if (existingAdmin == null) {
                val adminUser = UserEntity(
                    id = 1L,
                    playerId = "8BP-000001",
                    username = "admin",
                    password = "admin123", // Pre-configured secure admin login
                    emailOrPhone = "admin@8ballpool.app",
                    avatar = "avatar_admin",
                    coinBalance = 1000000L,
                    role = "ADMIN",
                    status = "ACTIVE",
                    isApproved = true,
                    isOnline = true,
                    createdAt = System.currentTimeMillis(),
                    lastActive = System.currentTimeMillis()
                )
                database.userDao().insertUser(adminUser)

                database.transactionDao().insertTransaction(
                    TransactionEntity(
                        transactionId = "TXN-ADMIN-INIT",
                        userId = 1L,
                        userPlayerId = "8BP-000001",
                        type = "STARTING_BONUS",
                        amount = 1000000L,
                        previousBalance = 0L,
                        newBalance = 1000000L,
                        description = "Admin master system account initial allocation"
                    )
                )

                database.adminAuditLogDao().insertAuditLog(
                    AdminAuditLogEntity(
                        logId = "LOG-INIT",
                        adminId = "SYSTEM",
                        action = "SYSTEM_INITIALIZATION",
                        targetUserId = "8BP-000001",
                        amount = 1000000L,
                        reason = "Initial database configuration & admin account creation"
                    )
                )
            }

            // Seed Game Config
            val existingConfig = database.gameConfigDao().getConfigSync()
            if (existingConfig == null) {
                database.gameConfigDao().insertOrUpdateConfig(GameConfigEntity())
            }
        }
    }
}
