package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.game.BallType
import com.example.game.MatchPlayer
import com.example.game.PoolGameEngine
import com.example.game.PoolTable
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

    @Test
    fun `read string from context`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val appName = context.getString(R.string.app_name)
        assertEquals("8 Ball Pool", appName)
    }

    @Test
    fun `pool table creates 16 balls with standard 8-ball rack`() {
        val table = PoolTable()
        val balls = table.createStandardBalls()

        assertEquals(16, balls.size)

        // Ball 0 must be Cue ball
        val cue = balls.firstOrNull { it.id == 0 }
        assertNotNull(cue)
        assertEquals(BallType.CUE, cue?.type)

        // 7 Solids, 7 Stripes, 1 Eight ball
        val solids = balls.filter { it.type == BallType.SOLID }
        val stripes = balls.filter { it.type == BallType.STRIPE }
        val eightBall = balls.firstOrNull { it.type == BallType.EIGHT }

        assertEquals(7, solids.size)
        assertEquals(7, stripes.size)
        assertNotNull(eightBall)
        assertEquals(8, eightBall?.id)
    }

    @Test
    fun `game engine initializes players and shot physics`() {
        val table = PoolTable()
        val players = listOf(
            MatchPlayer(playerId = "8BP-100001", username = "Player1", avatar = "avatar_1", team = 1),
            MatchPlayer(playerId = "8BP-100002", username = "Player2", avatar = "avatar_2", team = 2)
        )

        var matchEnded = false
        val engine = PoolGameEngine(
            table = table,
            players = players,
            mode = "1v1",
            durationMinutes = 2,
            entryAmount = 2000L,
            onMatchEnded = { _, _, _ -> matchEnded = true }
        )

        assertEquals("Player1", engine.activePlayer.username)
        assertTrue(engine.cueBall() != null)
        assertEquals(120, engine.timeRemainingSeconds)

        // Shoot cue ball
        engine.shoot(power = 0.5f)
        assertTrue(engine.isMoving)
        assertTrue(engine.cueBall()!!.speed > 0f)
    }
}
