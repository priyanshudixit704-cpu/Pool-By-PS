package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val PoolDarkColorScheme = darkColorScheme(
  primary = GoldYellow,
  onPrimary = Color(0xFF1E1400),
  primaryContainer = PoolSurfaceVariant,
  onPrimaryContainer = GoldYellow,
  secondary = EmeraldGreen,
  onSecondary = Color.White,
  secondaryContainer = Color(0xFF163E27),
  onSecondaryContainer = Color(0xFF74E59C),
  tertiary = AmberGold,
  background = PoolDark,
  onBackground = TextPrimary,
  surface = PoolSurface,
  onSurface = TextPrimary,
  surfaceVariant = PoolSurfaceVariant,
  onSurfaceVariant = TextSecondary,
  outline = PoolCardBorder,
  outlineVariant = Color(0xFF1E4032)
)

@Composable
fun MyApplicationTheme(
  content: @Composable () -> Unit,
) {
  MaterialTheme(
    colorScheme = PoolDarkColorScheme,
    typography = Typography,
    content = content
  )
}
