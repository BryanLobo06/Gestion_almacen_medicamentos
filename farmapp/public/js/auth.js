document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                // Show loading state
                const submitButton = loginForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Iniciando sesión...';
                
                // Use the correct login endpoint
                const host = window.location.host;
                const apiUrl = `http://${host}/auth/login`;
                
                console.log('Sending login request to:', apiUrl);
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data),
                    credentials: 'include'  // Important for session cookies
                });

                console.log('Login response status:', response.status);
                
                if (response.redirected) {
                    // If we got redirected, it's probably to the dashboard
                    window.location.href = '/dashboard.html';
                    return;
                }

                let result;
                try {
                    result = await response.json();
                } catch (e) {
                    console.error('Error parsing JSON response:', e);
                    throw new Error('Error en la respuesta del servidor');
                }

                if (response.ok) {
                    // Redirect to dashboard on successful login
                    window.location.href = '/dashboard.html';
                } else {
                    // Show error message
                    errorMessage.textContent = result.message || 'Usuario o contraseña incorrectos';
                    errorMessage.classList.remove('d-none');
                    // Reset button state
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
            } catch (error) {
                console.error('Error:', error);
                errorMessage.textContent = error.message || 'Error de conexión. Intenta de nuevo más tarde.';
                errorMessage.classList.remove('d-none');
                // Reset button state in case of error
                const submitButton = loginForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Iniciar Sesión';
                }
            }
        });
    }
});
