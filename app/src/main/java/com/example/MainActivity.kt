package com.example

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Leaderboard
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.ui.MainViewModel
import com.example.ui.Screen
import com.example.ui.screens.AdminDashboardScreen
import com.example.ui.screens.AuthScreen
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.LeaderboardScreen
import com.example.ui.screens.MatchHistoryScreen
import com.example.ui.screens.MatchRoomScreen
import com.example.ui.screens.PoolGameScreen
import com.example.ui.screens.ProfileScreen
import com.example.ui.theme.EmeraldGreen
import com.example.ui.theme.GoldYellow
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.PoolDark
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary

class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                MainApp(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun MainApp(viewModel: MainViewModel) {
    val currentScreen = viewModel.currentScreen
    val toastMessage = viewModel.toastMessage
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(toastMessage) {
        if (toastMessage != null) {
            snackbarHostState.showSnackbar(toastMessage)
            viewModel.clearToast()
        }
    }

    val showBottomBar = currentScreen is Screen.Home ||
            currentScreen is Screen.Leaderboard ||
            currentScreen is Screen.MatchHistory ||
            currentScreen is Screen.Profile

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = PoolDark,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = Color(0xFF0C1D15),
                    tonalElevation = 8.dp
                ) {
                    NavigationBarItem(
                        selected = currentScreen is Screen.Home,
                        onClick = { viewModel.currentScreen = Screen.Home },
                        icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                        label = { Text("Play") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = GoldYellow,
                            selectedTextColor = GoldYellow,
                            unselectedIconColor = TextMuted,
                            unselectedTextColor = TextMuted,
                            indicatorColor = Color(0xFF1B3D2B)
                        )
                    )
                    NavigationBarItem(
                        selected = currentScreen is Screen.Leaderboard,
                        onClick = { viewModel.currentScreen = Screen.Leaderboard },
                        icon = { Icon(Icons.Default.Leaderboard, contentDescription = "Leaderboard") },
                        label = { Text("Ranks") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = GoldYellow,
                            selectedTextColor = GoldYellow,
                            unselectedIconColor = TextMuted,
                            unselectedTextColor = TextMuted,
                            indicatorColor = Color(0xFF1B3D2B)
                        )
                    )
                    NavigationBarItem(
                        selected = currentScreen is Screen.MatchHistory,
                        onClick = { viewModel.currentScreen = Screen.MatchHistory },
                        icon = { Icon(Icons.Default.History, contentDescription = "History") },
                        label = { Text("Matches") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = GoldYellow,
                            selectedTextColor = GoldYellow,
                            unselectedIconColor = TextMuted,
                            unselectedTextColor = TextMuted,
                            indicatorColor = Color(0xFF1B3D2B)
                        )
                    )
                    NavigationBarItem(
                        selected = currentScreen is Screen.Profile,
                        onClick = { viewModel.currentScreen = Screen.Profile },
                        icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                        label = { Text("Profile") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = GoldYellow,
                            selectedTextColor = GoldYellow,
                            unselectedIconColor = TextMuted,
                            unselectedTextColor = TextMuted,
                            indicatorColor = Color(0xFF1B3D2B)
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (val screen = currentScreen) {
                is Screen.Auth -> AuthScreen(viewModel = viewModel)
                is Screen.Home -> HomeScreen(viewModel = viewModel)
                is Screen.MatchRoom -> MatchRoomScreen(room = screen.room, viewModel = viewModel)
                is Screen.ActiveGame -> PoolGameScreen(room = screen.room, players = screen.players, viewModel = viewModel)
                is Screen.Leaderboard -> LeaderboardScreen(viewModel = viewModel)
                is Screen.MatchHistory -> MatchHistoryScreen(viewModel = viewModel)
                is Screen.Profile -> ProfileScreen(viewModel = viewModel)
                is Screen.AdminDashboard -> AdminDashboardScreen(viewModel = viewModel)
            }
        }
    }
}
