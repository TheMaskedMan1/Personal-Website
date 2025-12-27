// Update notification badge
function updateNotificationBadge() {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const unreadCount = notifications.filter(n => !n.read).length;
    const navDot = document.getElementById('navNotificationDot');
    
    if (navDot) {
        if (unreadCount > 0) {
            navDot.style.display = 'block';
            navDot.textContent = unreadCount > 9 ? '9+' : unreadCount;
            navDot.style.width = unreadCount > 9 ? '20px' : '18px';
            navDot.style.height = unreadCount > 9 ? '20px' : '18px';
            navDot.style.fontSize = '10px';
        } else {
            navDot.style.display = 'none';
        }
    }
}

// Check notifications on page load
document.addEventListener('DOMContentLoaded', function() {
    updateNotificationBadge();
    
    // Update every 30 seconds
    setInterval(updateNotificationBadge, 30000);
});