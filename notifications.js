document.addEventListener('DOMContentLoaded', function() {
    const notificationsContainer = document.getElementById('notificationsContainer');
    const unreadCount = document.getElementById('unreadCount');
    const markAllReadBtn = document.getElementById('markAllRead');
    const simulateEmailBtn = document.getElementById('simulateEmail');
    const emailNotifications = document.getElementById('emailNotifications');
    const emailLikes = document.getElementById('emailLikes');
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    
    const emailSettings = JSON.parse(localStorage.getItem('emailSettings')) || {
        notifications: true,
        likes: true
    };
    
    emailNotifications.checked = emailSettings.notifications;
    emailLikes.checked = emailSettings.likes;
    
    // Load notifications from localStorage
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    
    // Update notification count display
    function updateUnreadCount() {
        const unread = notifications.filter(n => !n.read).length;
        unreadCount.textContent = `${unread} unread`;
        
        updateNavNotificationBadge();
    }
    
    // Render notifications
    function renderNotifications() {
        notificationsContainer.innerHTML = '';
        
        if (notifications.length === 0) {
            notificationsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; opacity: 0.7;">
                    <p>📭 No notifications yet.</p>
                    <p>Subscribe to receive updates!</p>
                    <a href="subscribe.html" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #4CAF50; color: white; border-radius: 8px; text-decoration: none;">
                        Subscribe Now
                    </a>
                </div>
            `;
            return;
        }
        
        // Sort by date (newest first)
        notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        notifications.forEach(notification => {
            const notifDiv = document.createElement('div');
            notifDiv.className = 'notification-card';
            notifDiv.style.cssText = `
                background: ${notification.read ? 'rgba(255,255,255,0.8)' : 'rgba(255, 255, 255, 0.95)'};
                border-left: 5px solid ${notification.read ? '#ccc' : getNotificationColor(notification.type)};
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                margin-bottom: 15px;
            `;
            
            notifDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1; margin-right: 60px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <span style="font-size: 20px;">${getNotificationIcon(notification.type)}</span>
                            <h4 style="margin: 0 0 10px 0; color: ${notification.read ? '#666' : '#222'};">
                                ${notification.title}
                            </h4>
                        </div>
                        <p style="margin: 0 0 10px 0; color: ${notification.read ? '#888' : '#555'};">
                            ${notification.message}
                        </p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <small style="color: #888;">${formatDate(notification.timestamp)}</small>
                            <span class="notification-type" style="font-size: 12px; background: ${getNotificationColor(notification.type)}20; color: ${getNotificationColor(notification.type)}; padding: 2px 8px; border-radius: 10px;">
                                ${notification.type}
                            </span>
                        </div>
                    </div>
                    <div style="position: absolute; right: 15px; top: 15px; display: flex; gap: 10px;">
                        ${!notification.read ? `
                            <button class="mark-read-btn" data-id="${notification.id}" title="Mark as read" style="background: none; border: none; cursor: pointer; font-size: 20px; color: #4CAF50;">
                                ✓
                            </button>
                        ` : ''}
                        <button class="delete-notification-btn" data-id="${notification.id}" title="Delete" style="background: none; border: none; cursor: pointer; font-size: 20px; color: #ff5c8a;">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
            
            // Mark as read when clicked
            notifDiv.addEventListener('click', (e) => {
                if (!e.target.closest('button')) { // Don't mark as read if clicking delete button
                    if (!notification.read) {
                        notification.read = true;
                        localStorage.setItem('notifications', JSON.stringify(notifications));
                        renderNotifications();
                        updateUnreadCount();
                    }
                }
            });
            
            // Delete button
            const deleteBtn = notifDiv.querySelector('.delete-notification-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the div click
                if (confirm('Are you sure you want to delete this notification?')) {
                    deleteNotification(notification.id);
                }
            });
            
            // Mark as read button
            const markReadBtn = notifDiv.querySelector('.mark-read-btn');
            if (markReadBtn) {
                markReadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    notification.read = true;
                    localStorage.setItem('notifications', JSON.stringify(notifications));
                    renderNotifications();
                    updateUnreadCount();
                });
            }
            
            notificationsContainer.appendChild(notifDiv);
        });
    }
    
    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    // Mark all as read
    markAllReadBtn.addEventListener('click', () => {
        notifications.forEach(n => n.read = true);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        renderNotifications();
        updateUnreadCount();
    });
    
    // Save email settings
    emailNotifications.addEventListener('change', () => {
        emailSettings.notifications = emailNotifications.checked;
        localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
    });
    
    emailLikes.addEventListener('change', () => {
        emailSettings.likes = emailLikes.checked;
        localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
    });
    
    simulateEmailBtn.addEventListener('click', () => {
        const testNotifications = [
            {
                title: 'Your Post Got a Like!',
                message: 'Someone just liked your post "My Journey in Computer Science".',
                type: 'like'
            }
        ];
        
        const randomNotif = testNotifications[Math.floor(Math.random() * testNotifications.length)];
        addNotification(randomNotif.title, randomNotif.message, randomNotif.type);
        
        // Also send to subscribers
        sendNotificationToSubscribers(randomNotif.title, randomNotif.message, randomNotif.type);
    });
    
    // Helper functions
    function getNotificationColor(type) {
        const colors = {
            post: '#4CAF50',
            like: '#ff5c8a',
            subscription: '#2196F3',
            welcome: '#9C27B0',
            announcement: '#FF9800',
            comment: '#00BCD4'
        };
        return colors[type] || '#666';
    }
    
    function getNotificationIcon(type) {
        const icons = {
            post: '📝',
            like: '❤️',
            subscription: '📧',
            welcome: '👋',
            announcement: '📢',
            comment: '💬'
        };
        return icons[type] || '📨';
    }
    
    function deleteNotification(id) {
        notifications = notifications.filter(n => n.id !== id);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        renderNotifications();
        updateUnreadCount();
    }
    
    // Initialize
    renderNotifications();
    updateUnreadCount();
    
    // Add delete all button functionality
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete ALL notifications? This cannot be undone.')) {
                notifications = [];
                localStorage.setItem('notifications', JSON.stringify(notifications));
                renderNotifications();
                updateUnreadCount();
            }
        });
    }
});

// Function to add notification
function addNotification(title, message, type = 'post') {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    
    const newNotification = {
        id: Date.now(),
        title,
        message,
        type,
        read: false,
        timestamp: new Date().toISOString()
    };
    
    notifications.unshift(newNotification);
    
    // Keep only last 100 notifications
    if (notifications.length > 10) {
        notifications = notifications.slice(0, 10);
    }
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Update nav badge immediately
    updateNavNotificationBadge();
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: 'https://cdn-icons-png.flaticon.com/512/732/732200.png'
        });
    }
    
    return newNotification;
}

// Update nav notification badge
function updateNavNotificationBadge() {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const unreadCount = notifications.filter(n => !n.read).length;
    const navDot = document.getElementById('navNotificationDot');
    
    if (navDot) {
        if (unreadCount > 0) {
            navDot.style.display = 'flex';
            navDot.textContent = unreadCount > 9 ? '9+' : unreadCount;
            navDot.style.width = unreadCount > 9 ? '22px' : '20px';
            navDot.style.height = unreadCount > 9 ? '22px' : '20px';
            navDot.style.fontSize = '12px';
            navDot.style.alignItems = 'center';
            navDot.style.justifyContent = 'center';
        } else {
            navDot.style.display = 'none';
        }
    }
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                addNotification(
                    'Browser Notifications Enabled',
                    'You will now receive desktop notifications for new updates.',
                    'announcement'
                );
            }
        });
    }
}