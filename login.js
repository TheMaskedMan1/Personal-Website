document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');

    // Demo credentials
    const demoCredentials = {
        username: 'BrianRey1',
        password: 'Kane_1243!'
    };

    loginBtn.addEventListener('click', function() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Clear previous error
        errorMessage.textContent = '';

        if (!username || !password) {
            errorMessage.textContent = 'Please enter both username and password';
            return;
        }

        if (username === demoCredentials.username && password === demoCredentials.password) {
            // Successful login
            const session = {
                loggedIn: true,
                username: username,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('userSession', JSON.stringify(session));
            localStorage.setItem('isLoggedIn', 'true');
            
            // Redirect to post page
            window.location.href = 'post.html';
        } else {
            errorMessage.textContent = 'Invalid username or password';
            passwordInput.value = '';
            
            // Add shake animation
            usernameInput.style.animation = 'shake 0.5s';
            passwordInput.style.animation = 'shake 0.5s';
            
            setTimeout(() => {
                usernameInput.style.animation = '';
                passwordInput.style.animation = '';
            }, 500);
        }
    });

    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            passwordInput.focus();
        }
    });

    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
});
