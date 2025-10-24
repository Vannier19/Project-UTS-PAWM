const API_URL = 'https://project-uts-pawm-production.up.railway.app';

const loginFormContainer = document.getElementById('login-form');
const registerFormContainer = document.getElementById('register-form');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const registerSuccess = document.getElementById('register-success');

showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.style.display = 'none';
    registerFormContainer.style.display = 'block';
    clearMessages();
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerFormContainer.style.display = 'none';
    loginFormContainer.style.display = 'block';
    clearMessages();
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showError(loginError, 'Username and password are required');
        return;
    }
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    clearMessages();
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            window.location.href = 'index.html';
        } else {
            showError(loginError, data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(loginError, 'Cannot connect to server. Please make sure the backend is running.');
    } finally {
        submitBtn.classList.remove('loading');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (!username || !password || !confirmPassword) {
        showError(registerError, 'All fields are required');
        return;
    }
    
    if (username.length < 3) {
        showError(registerError, 'Username must be at least 3 characters');
        return;
    }
    
    if (password.length < 6) {
        showError(registerError, 'Password must be at least 6 characters');
        return;
    }
    
    if (password !== confirmPassword) {
        showError(registerError, 'Passwords do not match');
        return;
    }
    
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    clearMessages();
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess(registerSuccess, 'Registration successful! Please login.');
            registerForm.reset();
            setTimeout(() => {
                showLoginLink.click();
            }, 2000);
        } else {
            showError(registerError, data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Register error:', error);
        showError(registerError, 'Cannot connect to server. Please make sure the backend is running.');
    } finally {
        submitBtn.classList.remove('loading');
    }
});

function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

function showSuccess(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

function clearMessages() {
    loginError.classList.remove('show');
    registerError.classList.remove('show');
    registerSuccess.classList.remove('show');
    loginError.textContent = '';
    registerError.textContent = '';
    registerSuccess.textContent = '';
}

if (localStorage.getItem('token')) {
    window.location.href = 'index.html';
}
