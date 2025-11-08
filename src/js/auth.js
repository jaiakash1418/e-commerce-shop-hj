import { adminCredentials } from './auth-config.js';

class Auth {
    async login(email, password) {
        // Check if admin
        if (email === adminCredentials.email && password === adminCredentials.password) {
            const token = this.generateToken({ role: 'admin', email });
            localStorage.setItem('accessToken', token);
            return { role: 'admin' };
        }

        // Regular user login
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) throw new Error('Login failed');

            const data = await response.json();
            localStorage.setItem('accessToken', data.token);
            return { role: 'user' };
        } catch (error) {
            throw new Error('Login failed');
        }
    }

    generateToken(payload) {
        // Simple token generation for demo
        return btoa(JSON.stringify(payload));
    }

    async verifyAdmin() {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return false;

            const decoded = JSON.parse(atob(token.split('.')[1]));
            const isAdmin = decoded.role === 'admin';

            if (isAdmin) {
                localStorage.setItem('adminAccess', 'true');
                this.setupAdminFeatures();
            }

            return isAdmin;
        } catch (error) {
            console.error('Admin verification failed:', error);
            return false;
        }
    }

    setupAdminFeatures() {
        // Add admin controls to cart page if present
        if (window.location.pathname.includes('cart.html')) {
            this.addCartAdminControls();
        }
    }

    addCartAdminControls() {
        const cartContainer = document.querySelector('.cart-items');
        if (!cartContainer) return;

        const adminControls = document.createElement('div');
        adminControls.className = 'admin-controls mt-4';
        adminControls.innerHTML = `
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">Admin Controls</h5>
                </div>
                <div class="card-body">
                    <button class="btn btn-success" onclick="window.location.href='admin.html'">
                        <i class="fas fa-cog mr-2"></i>Manage Products
                    </button>
                    <button class="btn btn-info ml-2" onclick="exportCartData()">
                        <i class="fas fa-download mr-2"></i>Export Cart Data
                    </button>
                </div>
            </div>
        `;

        cartContainer.appendChild(adminControls);
    }

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('adminAccess');
        // Redirect to login page for a clean state
        window.location.href = '/login.html';
    }

    handleAuthError(error) {
        console.error('Auth error:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('adminAccess');
        window.location.href = 'login.html';
    }
}

export default new Auth();
