document.addEventListener('DOMContentLoaded', () => {
    (async () => {
        await loadComponents();        // load header/footer fragments
        initializeBootstrap();        // add bootstrap + icons scripts
        // After header is injected, update UI pieces that rely on it
        checkAuthStatus();
        updateCartCount();
        setActiveNav();
    })();
});

async function loadComponents() {
    // Inject header/footer partials into pages that have #header / #footer
    const headerEl = document.getElementById('header');
    const footerEl = document.getElementById('footer');

    async function fetchAndInsert(path, el) {
        try {
            const res = await fetch(path, { cache: 'no-store' });
            if (!res.ok) return;
            const html = await res.text();
            el.innerHTML = html;
        } catch (err) {
            console.error('Component load error', path, err);
        }
    }

    if (headerEl) await fetchAndInsert('components/header.html', headerEl);
    if (footerEl) await fetchAndInsert('components/footer.html', footerEl);
}

function initializeBootstrap() {
    // Add Bootstrap JavaScript dependencies (only once)
    const urls = [
        'https://code.jquery.com/jquery-3.5.1.slim.min.js',
        'https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js',
        'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js',
        'https://kit.fontawesome.com/your-kit-code.js'
    ];
    urls.forEach(src => {
        if (!document.querySelector(`script[src="${src}"]`)) {
            const s = document.createElement('script');
            s.src = src;
            s.defer = true;
            document.body.appendChild(s);
        }
    });
}

function checkAuthStatus() {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    const accountNav = document.getElementById('accountNav');

    if (token && accountNav) {
        accountNav.innerHTML = `
            <div class="dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown">
                    My Account
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                    <a class="dropdown-item" href="account.html">Profile</a>
                    <a class="dropdown-item" href="#" onclick="logout()">Logout</a>
                </div>
            </div>
        `;
    }
}

function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = cartItems.length;
    }
}

function logout() {
    localStorage.removeItem('userToken');
    sessionStorage.removeItem('userToken');
    window.location.href = 'index.html';
}

function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        if (href === currentPage) link.classList.add('active');
        else link.classList.remove('active');
    });
}

// Keep the navbar toggler visual active class (works after header injection)
document.addEventListener('click', (e) => {
    if (e.target.closest('.navbar-toggler')) {
        e.target.closest('.navbar-toggler').classList.toggle('active');
    }
});