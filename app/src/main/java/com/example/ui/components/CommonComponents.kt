package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.EmeraldGreen
import com.example.ui.theme.GoldYellow
import com.example.ui.theme.PoolCard
import com.example.ui.theme.PoolCardBorder
import java.text.NumberFormat
import java.util.Locale

fun formatCoins(amount: Long): String {
    return NumberFormat.getNumberInstance(Locale.US).format(amount)
}

val AvatarColors = listOf(
    listOf(Color(0xFF2E7D32), Color(0xFF1B5E20)),
    listOf(Color(0xFF1565C0), Color(0xFF0D47A1)),
    listOf(Color(0xFFC62828), Color(0xFF8E0000)),
    listOf(Color(0xFF6A1B9A), Color(0xFF4A148C)),
    listOf(Color(0xFFEF6C00), Color(0xFFE65100)),
    listOf(Color(0xFF00838F), Color(0xFF006064)),
    listOf(Color(0xFF4E342E), Color(0xFF3E2723)),
    listOf(Color(0xFF37474F), Color(0xFF263238))
)

@Composable
fun PlayerAvatar(
    avatarId: String,
    username: String,
    size: Dp = 48.dp,
    showOnlineBadge: Boolean = false,
    isOnline: Boolean = true,
    modifier: Modifier = Modifier
) {
    val index = (avatarId.hashCode().let { if (it < 0) -it else it }) % AvatarColors.size
    val gradient = AvatarColors[index]

    Box(
        modifier = modifier.size(size),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .size(size)
                .clip(CircleShape)
                .background(Brush.linearGradient(gradient))
                .border(2.dp, GoldYellow.copy(alpha = 0.8f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = username.take(2).uppercase().ifEmpty { "8B" },
                color = Color.White,
                fontWeight = FontWeight.ExtraBold,
                fontSize = (size.value * 0.4f).sp
            )
        }

        if (showOnlineBadge) {
            Box(
                modifier = Modifier
                    .size(size * 0.32f)
                    .align(Alignment.BottomEnd)
                    .clip(CircleShape)
                    .background(if (isOnline) EmeraldGreen else Color(0xFF757575))
                    .border(2.dp, Color(0xFF09120E), CircleShape)
            )
        }
    }
}

@Composable
fun CoinBalanceChip(
    balance: Long,
    modifier: Modifier = Modifier,
    size: Dp = 38.dp,
    onClick: (() -> Unit)? = null
) {
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = Color(0xFF132A20),
        border = androidx.compose.foundation.BorderStroke(1.5.dp, GoldYellow),
        modifier = modifier
            .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = Icons.Default.MonetizationOn,
                contentDescription = "Coins",
                tint = GoldYellow,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "${formatCoins(balance)} Coins",
                fontWeight = FontWeight.Bold,
                color = GoldYellow,
                fontSize = 14.sp
            )
        }
    }
}
