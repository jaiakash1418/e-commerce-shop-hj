const Auth = {
    getAccessToken() {
        return sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    },
    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    },
    saveTokens({ accessToken, refreshToken, remember }) {
        if (remember) {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
        } else {
            sessionStorage.setItem('accessToken', accessToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken); // keep refresh in local for background refresh
        }
    },
    clear() {
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },
    async refreshAccessToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return null;
        try {
            const res = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });
            if (!res.ok) { this.clear(); return null; }
            const data = await res.json();
            // store new access token in session storage
            sessionStorage.setItem('accessToken', data.accessToken);
            return data.accessToken;
        } catch (err) {
            console.error('refresh failed', err);
            this.clear();
            return null;
        }
    },
    async fetchWithAuth(url, options = {}) {
        let token = this.getAccessToken();
        if (token) options.headers = { ...(options.headers || {}), 'Authorization': `Bearer ${token}` };
        let res = await fetch(url, options);
        if (res.status === 401) {
            // try refresh
            token = await this.refreshAccessToken();
            if (!token) throw new Error('Not authenticated');
            options.headers = { ...(options.headers || {}), 'Authorization': `Bearer ${token}` };
            res = await fetch(url, options);
        }
        return res;
    }
};

export default Auth;