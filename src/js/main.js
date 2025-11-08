import apiClient from './api-client.js';
import { showAlert } from './utils.js';
import auth from './auth.js';

// Make logout globally accessible for onclick attributes
window.logout = () => {
    auth.logout();
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadComponents();
    // These must run AFTER components are loaded, as they interact with header/footer elements
    checkAuthStatus();
    updateCartCount();
    setActiveNav();

    // Load page-specific content
    const pageLoaders = {
        'index.html': loadHomePage,
        'products.html': loadProducts,
        'cart.html': loadCart,
        'admin.html': loadAdmin
    };

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (pageLoaders[currentPage]) {
        await pageLoaders[currentPage]();
    }
});

async function loadHomePage() {
    try {
        const [featured, newArrivals, categories] = await Promise.all([
            apiClient.getProducts({ featured: true }),
            apiClient.getProducts({ new: true }),
            apiClient.getCategories()
        ]);

        renderProducts('featured-products', featured);
        renderProducts('new-arrivals', newArrivals);
        renderCategories(categories);
    } catch (error) {
        console.error('Error loading home page:', error);
    }
}

async function loadProducts() {
    try {
        const products = await apiClient.getProducts();
        renderProducts('product-list', products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadCart() {
    try {
        const cart = await apiClient.getCart();
        renderCart(cart);
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function renderProducts(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = products.map(product => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="card-text">₹${product.price.toFixed(2)}</p>
                    <button class="btn btn-primary add-to-cart" data-id="${product.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners for add to cart buttons
    container.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', async (e) => {
            const productId = e.target.dataset.id;
            try {
                await apiClient.addToCart(productId, 1);
                updateCartCount();
                showAlert('Product added to cart!', 'success');
            } catch (error) {
                showAlert('Failed to add product to cart', 'danger');
            }
        });
    });
}

async function loadComponents() {
    const headerEl = document.querySelector('header');
    const footerEl = document.querySelector('footer');

    try {
        const [headerHtml, footerHtml] = await Promise.all([
            fetch('/components/header.html').then(r => r.text()),
            fetch('/components/footer.html').then(r => r.text())
        ]);

        if (headerEl) headerEl.innerHTML = headerHtml;
        if (footerEl) footerEl.innerHTML = footerHtml;

        // Initialize Bootstrap components that might be in the header/footer
        // This is a simplified approach; a more robust solution might use Bootstrap's JS directly.
        initializeBootstrap();
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

function checkAuthStatus() {
    const token = localStorage.getItem('accessToken');
    const authNavContainer = document.getElementById('auth-nav-container');
    const adminLinkContainer = document.getElementById('admin-link-container');

    if (!authNavContainer || !adminLinkContainer) {
        // This can happen briefly while the header is loading.
        return;
    }

    if (token) {
        let payload;
        try {
            // In a real app, this would be a proper JWT verification.
            payload = JSON.parse(atob(token));
        } catch (e) {
            console.error("Invalid token found, logging out.", e);
            auth.logout(); // Log out if token is malformed
            return;
        }

        // Show admin link if user is admin
        if (payload.role === 'admin') {
            adminLinkContainer.style.display = 'block';
        } else {
            adminLinkContainer.style.display = 'none';
        }

        // Update nav to show Account dropdown
        authNavContainer.innerHTML = `
            <div class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="accountDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-user-circle"></i> My Account
                </a>
                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="accountDropdown">
                    <a class="dropdown-item" href="account.html">Profile</a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item" href="#" onclick="logout()">Logout</a>
                </div>
            </div>
        `;
    } else {
        // Not logged in: show Login link and hide admin link
        adminLinkContainer.style.display = 'none';
        authNavContainer.innerHTML = `
            <a class="nav-link" href="login.html">
                <i class="fas fa-sign-in-alt"></i> Login
            </a>
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

function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    // Use the new nav-link class from Bootstrap navbar
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
            // Also add active to the parent li for some styling cases
            link.closest('.nav-item').classList.add('active');
        } else {
            link.classList.remove('active');
            link.closest('.nav-item').classList.remove('active');
        }
    });
} async function loadAdmin() {
    const isAdmin = await auth.verifyAdmin();
    if (!isAdmin) {
        window.location.href = 'login.html'; // Redirect if not admin
        return;
    }

    const adminContent = document.getElementById('admin-content');
    if (!adminContent) return;
}