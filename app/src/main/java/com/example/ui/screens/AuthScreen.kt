package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.ui.MainViewModel
import com.example.ui.components.AvatarColors
import com.example.ui.theme.EmeraldGreen
import com.example.ui.theme.GoldYellow
import com.example.ui.theme.PoolCard
import com.example.ui.theme.PoolCardBorder
import com.example.ui.theme.PoolDark
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun AuthScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Login, 1: Register, 2: Admin Login
    val scrollState = rememberScrollState()

    var usernameOrId by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    // Register fields
    var regUsername by remember { mutableStateOf("") }
    var regPassword by remember { mutableStateOf("") }
    var regEmailOrPhone by remember { mutableStateOf("") }
    var selectedAvatarIndex by remember { mutableIntStateOf(0) }

    // Forgot password dialog
    var showForgotPasswordDialog by remember { mutableStateOf(false) }
    var forgotIdentifier by remember { mutableStateOf("") }
    var forgotNewPass by remember { mutableStateOf("") }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(
                        Color(0xFF040E0A),
                        Color(0xFF0A1F17),
                        Color(0xFF040E0A)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp)
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            // App Icon & Hero Title
            Box(
                modifier = Modifier
                    .size(90.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF0F3223))
                    .border(3.dp, GoldYellow, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.img_app_icon),
                    contentDescription = "8 Ball Pool",
                    modifier = Modifier
                        .size(76.dp)
                        .clip(CircleShape)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "8 BALL POOL",
                fontSize = 28.sp,
                fontWeight = FontWeight.ExtraBold,
                color = GoldYellow,
                letterSpacing = 2.sp
            )
            Text(
                text = "Multiplayer Billiards Arena",
                fontSize = 14.sp,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Tab Selector: Login | Register | Admin
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color(0xFF10251C),
                contentColor = GoldYellow,
                indicator = { tabPositions ->
                    TabRowDefaults.SecondaryIndicator(
                        Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                        color = GoldYellow
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .border(1.dp, PoolCardBorder, RoundedCornerShape(12.dp))
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Login", fontWeight = FontWeight.Bold) },
                    modifier = Modifier.testTag("tab_login")
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Register", fontWeight = FontWeight.Bold) },
                    modifier = Modifier.testTag("tab_register")
                )
                Tab(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    text = { Text("Admin", fontWeight = FontWeight.Bold) },
                    modifier = Modifier.testTag("tab_admin")
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Form Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = PoolCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, PoolCardBorder)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    when (selectedTab) {
                        0 -> {
                            // User Login
                            Text(
                                text = "Welcome Player",
                                style = MaterialTheme.typography.titleMedium,
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(16.dp))

                            OutlinedTextField(
                                value = usernameOrId,
                                onValueChange = { usernameOrId = it },
                                label = { Text("Username or Player ID") },
                                placeholder = { Text("e.g. 8BP-104582 or Rahul") },
                                leadingIcon = {
                                    Icon(Icons.Default.Person, contentDescription = null, tint = GoldYellow)
                                },
                                singleLine = true,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("login_identifier_input"),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = GoldYellow,
                                    unfocusedBorderColor = PoolCardBorder,
                                    focusedLabelColor = GoldYellow,
                                    cursorColor = GoldYellow
                                )
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            OutlinedTextField(
                                value = password,
                                onValueChange = { password = it },
                                label = { Text("Password") },
                                leadingIcon = {
                                    Icon(Icons.Default.Lock, contentDescription = null, tint = GoldYellow)
                                },
                                trailingIcon = {
                                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                        Icon(
                                            if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                            contentDescription = "Toggle password"
                                        )
                                    }
                                },
                                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                singleLine = true,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("login_password_input"),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = GoldYellow,
                                    unfocusedBorderColor = PoolCardBorder,
                                    focusedLabelColor = GoldYellow,
                                    cursorColor = GoldYellow
                                )
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.End
                            ) {
                                TextButton(onClick = { showForgotPasswordDialog = true }) {
                                    Text("Forgot Password?", color = EmeraldGreen, fontSize = 13.sp)
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Button(
                                onClick = { viewModel.login(usernameOrId, password) },
                                enabled = usernameOrId.isNotBlank() && password.isNotBlank() && !viewModel.isOperating,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp)
                                    .testTag("login_submit_button"),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = GoldYellow, contentColor = Color.Black)
                            ) {
                                if (viewModel.isOperating) {
                                    CircularProgressIndicator(modifier = Modifier.size(22.dp), color = Color.Black)
                                } else {
                                    Text("LOGIN TO PLAY", fontWeight = FontWeight.ExtraBold)
                                }
                            }
                        }

                        1 -> {
                            // User Register
                            Text(
                                text = "Create Your Account",
                                style = MaterialTheme.typography.titleMedium,
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold
                            )

                            Spacer(modifier = Modifier.height(6.dp))

                            // Bonus Badge
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(Color(0xFF1B402B))
                                    .padding(horizontal = 12.dp, vertical = 5.dp)
                            ) {
                                Icon(Icons.Default.CardGiftcard, contentDescription = null, tint = GoldYellow, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Starting Bonus: 100,000 Coins", color = GoldYellow, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            OutlinedTextField(
                                value = regUsername,
                                onValueChange = { regUsername = it },
                                label = { Text("Username") },
                                leadingIcon = {
                                    Icon(Icons.Default.Person, contentDescription = null, tint = GoldYellow)
                                },
                                singleLine = true,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("reg_username_input"),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = GoldYellow,
                                    unfocusedBorderColor = PoolCardBorder,
                                    focusedLabelColor = GoldYellow,
                                    cursorColor = GoldYellow
                                )
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            OutlinedTextField(
                                value = regEmailOrPhone,
                                onValueChange = { regEmailOrPhone = it },
                                label = { Text("Email or Phone") },
                                leadingIcon = {
                                    Icon(Icons.Default.Email, contentDescription = null, tint = GoldYellow)
                                },
                                singleLine = true,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("reg_email_input"),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = GoldYellow,
                                    unfocusedBorderColor = PoolCardBorder,
                                    focusedLabelColor = GoldYellow,
                                    cursorColor = GoldYellow
                                )
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            OutlinedTextField(
                                value = regPassword,
                                onValueChange = { regPassword = it },
                                label = { Text("Password") },
                                leadingIcon = {
                                    Icon(Icons.Default.Lock, contentDescription = null, tint = GoldYellow)
                                },
                                visualTransformation = PasswordVisualTransformation(),
                                singleLine = true,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("reg_password_input"),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = GoldYellow,
                                    unfocusedBorderColor = PoolCardBorder,
                                    focusedLabelColor = GoldYellow,
                                    cursorColor = GoldYellow
                                )
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            // Avatar Picker
                            Text("Select Avatar", color = TextSecondary, fontSize = 13.sp, modifier = Modifier.align(Alignment.Start))
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                AvatarColors.take(6).forEachIndexed { idx, gradient ->
                                    val isSelected = selectedAvatarIndex == idx
                                    Box(
                                        modifier = Modifier
                                            .size(40.dp)
                                            .clip(CircleShape)
                                            .background(Brush.linearGradient(gradient))
                                            .border(
                                                if (isSelected) 3.dp else 1.dp,
                                                if (isSelected) GoldYellow else Color.Transparent,
                                                CircleShape
                                            )
                                            .clickable { selectedAvatarIndex = idx },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text("${idx + 1}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(18.dp))

                            Button(
                                onClick = {
                                    viewModel.register(
                                        username = regUsername,
                                        pass = regPassword,
                                        emailOrPhone = regEmailOrPhone,
                                        avatar = "avatar_${selectedAvatarIndex + 1}"
                                    )
                                },
                                enabled = regUsername.isNotBlank() && regPassword.isNotBlank() && !viewModel.isOperating,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp)
                                    .testTag("register_submit_button"),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen, contentColor = Color.White)
                            ) {
                                if (viewModel.isOperating) {
                                    CircularProgressIndicator(modifier = Modifier.size(22.dp), color = Color.White)
                                } else {
                                    Text("REGISTER & CLAIM 100K COINS", fontWeight = FontWeight.ExtraBold)
                                }
                            }
                        }

                        2 -> {
                            // Admin Login
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.AdminPanelSettings, contentDescription = null, tint = Color(0xFFFF6F00))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Administrator Portal",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = TextPrimary,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Text(
                                text = "Default Credentials: admin / admin123",
                                fontSize = 12.sp,
                                color = TextMuted,
                                modifier = Modifier.padding(top = 4.dp)
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            OutlinedTextField(
                                value = usernameOrId,
                                onValueChange = { usernameOrId = it },
                                label = { Text("Admin Username") },
                                leadingIcon = {
                                    Icon(Icons.Default.Person, contentDescription = null, tint = Color(0xFFFF6F00))
                                },
                                singleLine = true,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("admin_username_input"),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = Color(0xFFFF6F00),
                                    unfocusedBorderColor = PoolCardBorder,
                                    focusedLabelColor = Color(0xFFFF6F00),
                                    cursorColor = Color(0xFFFF6F00)
                                )
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            OutlinedTextField(
                                value = password,
                                onValueChange = { password = it },
                                label = { Text("Admin Password") },
                                leadingIcon = {
                                    Icon(Icons.Default.Lock, contentDescription = null, tint = Color(0xFFFF6F00))
                                },
                                visualTransformation = PasswordVisualTransformation(),
                                singleLine = true,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("admin_password_input"),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = Color(0xFFFF6F00),
                                    unfocusedBorderColor = PoolCardBorder,
                                    focusedLabelColor = Color(0xFFFF6F00),
                                    cursorColor = Color(0xFFFF6F00)
                                )
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            Button(
                                onClick = { viewModel.loginAdmin(usernameOrId, password) },
                                enabled = usernameOrId.isNotBlank() && password.isNotBlank() && !viewModel.isOperating,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp)
                                    .testTag("admin_login_submit_button"),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF6F00), contentColor = Color.White)
                            ) {
                                if (viewModel.isOperating) {
                                    CircularProgressIndicator(modifier = Modifier.size(22.dp), color = Color.White)
                                } else {
                                    Text("LOGIN TO ADMIN CONSOLE", fontWeight = FontWeight.ExtraBold)
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }

        // Forgot Password Dialog
        if (showForgotPasswordDialog) {
            AlertDialog(
                onDismissRequest = { showForgotPasswordDialog = false },
                title = { Text("Reset Password", color = GoldYellow) },
                text = {
                    Column {
                        Text("Enter your Username or Player ID and your new password.", color = TextSecondary, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(10.dp))
                        OutlinedTextField(
                            value = forgotIdentifier,
                            onValueChange = { forgotIdentifier = it },
                            label = { Text("Username or Player ID") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = forgotNewPass,
                            onValueChange = { forgotNewPass = it },
                            label = { Text("New Password") },
                            visualTransformation = PasswordVisualTransformation(),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            viewModel.resetPassword(forgotIdentifier, forgotNewPass)
                            showForgotPasswordDialog = false
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldYellow, contentColor = Color.Black)
                    ) {
                        Text("Reset")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showForgotPasswordDialog = false }) {
                        Text("Cancel", color = TextSecondary)
                    }
                },
                containerColor = PoolCard
            )
        }
    }
}
