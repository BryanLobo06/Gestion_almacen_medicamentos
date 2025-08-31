document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    // Redirect to dashboard on successful login
                    window.location.href = '/dashboard.html';
                } else {
                    // Show error message
                    errorMessage.textContent = result.message || 'Error al iniciar sesión';
                    errorMessage.classList.remove('d-none');
                }
            } catch (error) {
                console.error('Error:', error);
                errorMessage.textContent = 'Error de conexión. Intenta de nuevo más tarde.';
                errorMessage.classList.remove('d-none');
            }
        });
    }
});
