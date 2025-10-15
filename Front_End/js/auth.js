const API_URL = 'http://localhost:3001';

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
        showError(loginError, 'Username dan password harus diisi');
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
            showError(loginError, data.error || 'Login gagal');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(loginError, 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.');
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
        showError(registerError, 'Semua kolom harus diisi');
        return;
    }
    
    if (username.length < 3) {
        showError(registerError, 'Username minimal 3 karakter');
        return;
    }
    
    if (password.length < 6) {
        showError(registerError, 'Password minimal 6 karakter');
        return;
    }
    
    if (password !== confirmPassword) {
        showError(registerError, 'Password tidak sama');
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
            showSuccess(registerSuccess, 'Registrasi berhasil! Silakan login.');
            registerForm.reset();
            setTimeout(() => {
                showLoginLink.click();
            }, 2000);
        } else {
            showError(registerError, data.error || 'Registrasi gagal');
        }
    } catch (error) {
        console.error('Register error:', error);
        showError(registerError, 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.');
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
