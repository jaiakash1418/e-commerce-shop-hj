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
document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("login-form");
    const loginButton = document.getElementById("login-button");

    loginButton.addEventListener("click", function() {
        fadeOut(loginForm, 500);
    });
});