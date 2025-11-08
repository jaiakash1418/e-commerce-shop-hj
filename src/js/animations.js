// animations.js

// Function to fade in an element
function fadeIn(element, duration) {
    element.style.opacity = 0;
    element.style.display = "block";

    let start = performance.now();

    function animate(time) {
        let progress = (time - start) / duration;
        if (progress > 1) progress = 1;

        element.style.opacity = progress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

// Function to fade out an element
function fadeOut(element, duration) {
    element.style.opacity = 1;

    let start = performance.now();

    function animate(time) {
        let progress = (time - start) / duration;
        if (progress > 1) progress = 1;

        element.style.opacity = 1 - progress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = "none";
        }
    }

    requestAnimationFrame(animate);
}

// Example usage
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const loginButton = document.getElementById("login-button");

    loginButton.addEventListener("click", function () {
        fadeOut(loginForm, 500);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
        const dropdown = document.querySelector('.fancy-dropdown');
        const isClickInside = dropdown.contains(event.target);

        if (!isClickInside && document.body.classList.contains('menu-expanded')) {
            document.body.classList.remove('menu-expanded');
        }
    });

    // Handle menu item clicks
    document.querySelectorAll('.menu-row').forEach(item => {
        item.addEventListener('click', () => {
            document.body.classList.remove('menu-expanded');
        });
    });

    // Add active state to current page menu item
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.menu-row').forEach(item => {
        const href = item.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (href === currentPage) {
            item.classList.add('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Remove click handler since we're using hover
    const dropdownButton = document.querySelector('.dropdown-button');
    if (dropdownButton) {
        dropdownButton.removeAttribute('onclick');
    }

    // Add active state to current page menu item
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.menu-row').forEach(item => {
        const href = item.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (href === currentPage) {
            item.classList.add('active');
        }
    });

    // Add smooth fade transition for menu items
    const menuRows = document.querySelectorAll('.menu-row');
    menuRows.forEach((row, index) => {
        row.style.transitionDelay = `${index * 0.05}s`;
    });
});