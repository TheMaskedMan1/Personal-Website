document.addEventListener('DOMContentLoaded', function() {
    const emailTab = document.getElementById('emailTab');
    const phoneTab = document.getElementById('phoneTab');
    const emailForm = document.getElementById('emailForm');
    const phoneForm = document.getElementById('phoneForm');
    const subscribeBtn = document.getElementById('subscribeBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const emailSubscribers = document.getElementById('emailSubscribers');
    const phoneSubscribers = document.getElementById('phoneSubscribers');
    const currentSubscriptions = document.getElementById('currentSubscriptions');
    const manageSubBtn = document.getElementById('manageSubBtn');
    
    // Load subscriptions from localStorage
    let subscribers = JSON.parse(localStorage.getItem('subscribers')) || [];
    
    // Update subscriber counts
    function updateSubscriberCounts() {
        const emailCount = subscribers.filter(s => s.type === 'email').length;
        const phoneCount = subscribers.filter(s => s.type === 'phone').length;
        
        emailSubscribers.textContent = emailCount;
        phoneSubscribers.textContent = phoneCount;
        
        // Update current user's subscriptions
        const userEmail = getCurrentUserEmail();
        const userPhone = getCurrentUserPhone();
        
        currentSubscriptions.innerHTML = '';
        
        if (userEmail || userPhone) {
            const userSubs = subscribers.filter(s => 
                (s.type === 'email' && s.value === userEmail) ||
                (s.type === 'phone' && s.value === userPhone)
            );
            
            if (userSubs.length > 0) {
                userSubs.forEach(sub => {
                    const subDiv = document.createElement('div');
                    subDiv.style.cssText = `
                        background: rgba(255,255,255,0.9);
                        padding: 10px;
                        border-radius: 8px;
                        margin-bottom: 10px;
                        font-size: 14px;
                    `;
                    subDiv.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${sub.type === 'email' ? '📧' : '📱'} ${sub.value}</strong>
                                <div style="font-size: 12px; opacity: 0.8;">Subscribed on ${formatDate(sub.timestamp)}</div>
                            </div>
                            <button class="unsubscribe-btn" data-id="${sub.id}" style="background: #ff5c8a; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                                Unsubscribe
                            </button>
                        </div>
                    `;
                    currentSubscriptions.appendChild(subDiv);
                });
                
                // Add unsubscribe button event listeners
                document.querySelectorAll('.unsubscribe-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        unsubscribe(id);
                    });
                });
            } else {
                currentSubscriptions.innerHTML = '<p style="opacity: 0.7; text-align: center;">No active subscriptions</p>';
            }
        } else {
            currentSubscriptions.innerHTML = '<p style="opacity: 0.7; text-align: center;">Log in to see your subscriptions</p>';
        }
    }
    
    // Tab switching
    emailTab.addEventListener('click', () => {
        emailTab.classList.add('active');
        phoneTab.classList.remove('active');
        emailForm.style.display = 'block';
        phoneForm.style.display = 'none';
        errorMessage.textContent = '';
        successMessage.textContent = '';
    });
    
    phoneTab.addEventListener('click', () => {
        phoneTab.classList.add('active');
        emailTab.classList.remove('active');
        phoneForm.style.display = 'block';
        emailForm.style.display = 'none';
        errorMessage.textContent = '';
        successMessage.textContent = '';
    });
    
    // Subscribe button click
    subscribeBtn.addEventListener('click', function() {
        errorMessage.textContent = '';
        successMessage.textContent = '';
        
        // Validate terms agreement
        if (!document.getElementById('agreeTerms').checked) {
            errorMessage.textContent = 'Please agree to the Terms of Service';
            return;
        }
        
        const isEmailTab = emailTab.classList.contains('active');
        
        if (isEmailTab) {
            const email = document.getElementById('emailInput').value.trim();
            
            // Email validation
            if (!email) {
                errorMessage.textContent = 'Please enter your email address';
                return;
            }
            
            if (!validateEmail(email)) {
                errorMessage.textContent = 'Please enter a valid email address';
                return;
            }
            
            // Check if already subscribed
            if (subscribers.some(s => s.type === 'email' && s.value === email)) {
                errorMessage.textContent = 'This email is already subscribed';
                return;
            }
            
            // Get preferences
            const preferences = {
                newPosts: document.getElementById('emailNewPosts').checked,
                likes: document.getElementById('emailLikes').checked,
                comments: document.getElementById('emailComments').checked,
                weeklyDigest: document.getElementById('emailWeekly').checked
            };
            
            // Add subscriber
            const newSubscriber = {
                id: Date.now(),
                type: 'email',
                value: email,
                preferences: preferences,
                timestamp: new Date().toISOString(),
                active: true
            };
            
            subscribers.push(newSubscriber);
            localStorage.setItem('subscribers', JSON.stringify(subscribers));
            
            successMessage.textContent = `✅ Success! You've subscribed with ${email}`;
            document.getElementById('emailInput').value = '';
            
            // Send welcome notification
            addNotification(
                'Welcome to Email Updates!',
                `You've successfully subscribed to email notifications from Brian's Blog. You'll receive updates based on your preferences.`,
                'subscription'
            );
            
        } else {
            // Phone subscription
            const phone = document.getElementById('phoneInput').value.trim();
            
            if (!phone) {
                errorMessage.textContent = 'Please enter your phone number';
                return;
            }
            
            // Simple phone validation
            if (phone.replace(/\D/g, '').length < 10) {
                errorMessage.textContent = 'Please enter a valid phone number';
                return;
            }
            
            // Check if already subscribed
            if (subscribers.some(s => s.type === 'phone' && s.value === phone)) {
                errorMessage.textContent = 'This phone number is already subscribed';
                return;
            }
            
            // Get SMS preferences
            const preferences = {
                newPosts: document.getElementById('smsNewPosts').checked,
                likes: document.getElementById('smsLikes').checked,
                urgent: document.getElementById('smsUrgent').checked
            };
            
            // Add subscriber
            const newSubscriber = {
                id: Date.now(),
                type: 'phone',
                value: phone,
                preferences: preferences,
                timestamp: new Date().toISOString(),
                active: true
            };
            
            subscribers.push(newSubscriber);
            localStorage.setItem('subscribers', JSON.stringify(subscribers));
            
            successMessage.textContent = `✅ Success! You've subscribed for SMS updates`;
            document.getElementById('phoneInput').value = '';
            
            // Send welcome notification
            addNotification(
                'SMS Subscription Activated!',
                `You've successfully subscribed to SMS notifications. You'll receive important updates via text message.`,
                'subscription'
            );
        }
        
        // Update counts
        updateSubscriberCounts();
        
        // Clear messages after 5 seconds
        setTimeout(() => {
            successMessage.textContent = '';
        }, 5000);
    });
    
    // Manage subscriptions button
    manageSubBtn.addEventListener('click', function() {
        // Toggle showing all subscriptions for management
        const userEmail = getCurrentUserEmail();
        const userPhone = getCurrentUserPhone();
        
        if (!userEmail && !userPhone) {
            alert('Please log in to manage your subscriptions');
            window.location.href = 'login.html';
            return;
        }
        
        // Show unsubscribe confirmation
        if (confirm('Do you want to manage all your subscriptions?')) {
            // This would normally redirect to a management page
            alert('In a real application, this would redirect to a subscription management page.');
        }
    });
    
    // Helper functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }
    
    function getCurrentUserEmail() {
        const userSession = localStorage.getItem('userSession');
        if (userSession) {
            try {
                const session = JSON.parse(userSession);
                // Extract email from username or use a default
                return session.username ? session.username.toLowerCase() + '@example.com' : null;
            } catch (e) {
                return null;
            }
        }
        return null;
    }
    
    function getCurrentUserPhone() {
        return null;
    }
    
    function unsubscribe(id) {
        subscribers = subscribers.filter(s => s.id !== parseInt(id));
        localStorage.setItem('subscribers', JSON.stringify(subscribers));
        updateSubscriberCounts();
        successMessage.textContent = 'Successfully unsubscribed';
        
        setTimeout(() => {
            successMessage.textContent = '';
        }, 3000);
    }
    
    // Initialize
    updateSubscriberCounts();
});

// Function to send notifications to all subscribers
function sendNotificationToSubscribers(title, message, type = 'post') {
    const subscribers = JSON.parse(localStorage.getItem('subscribers')) || [];
    
    subscribers.forEach(subscriber => {
        if (subscriber.active) {
            // Check preferences based on notification type
            let shouldSend = false;
            
            if (type === 'post' && subscriber.preferences.newPosts) {
                shouldSend = true;
            } else if (type === 'like' && subscriber.preferences.likes) {
                shouldSend = true;
            } else if (type === 'subscription') {
                shouldSend = true;
            }
            
            if (shouldSend) {
                addNotification(
                    `${subscriber.type === 'email' ? '📧' : '📱'} ${title}`,
                    `${message}\n\nSent to: ${subscriber.value}`,
                    type
                );
            }
        }
    });
}