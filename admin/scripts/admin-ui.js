// admin-ui.js

document.addEventListener('DOMContentLoaded', function() {
    const adminForm = document.getElementById('admin-form');
    
    if (adminForm) {
        adminForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(adminForm);
            const data = Object.fromEntries(formData.entries());

            // Example API call to save admin settings
            fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                alert('Settings saved successfully!');
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Error saving settings. Please try again.');
            });
        });
    }

    // Additional admin functionalities can be added here
});