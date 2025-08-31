// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    // Enable tooltips everywhere
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Enable popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });

    // Initialize form validation
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Handle delete confirmations
    document.querySelectorAll('[data-confirm]').forEach(element => {
        element.addEventListener('click', event => {
            if (!confirm(element.getAttribute('data-confirm'))) {
                event.preventDefault();
            }
        });
    });
});

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-MX', options);
}

// Handle AJAX forms
document.querySelectorAll('.ajax-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        try {
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
            
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const result = await response.json();
            
            if (result.redirect) {
                window.location.href = result.redirect;
            } else if (result.success) {
                showToast('¡Éxito!', result.message || 'Operación completada correctamente.', 'success');
                if (form.dataset.resetOnSuccess === 'true') {
                    form.reset();
                }
                if (form.dataset.reloadOnSuccess === 'true') {
                    setTimeout(() => window.location.reload(), 1500);
                }
            } else {
                showToast('Error', result.message || 'Ocurrió un error al procesar la solicitud.', 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error', 'Ocurrió un error inesperado. Por favor, intente nuevamente.', 'danger');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
});

// Show toast notification
function showToast(title, message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast show align-items-center text-white bg-${type} border-0`;
    toast.role = 'alert';
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.id = toastId;
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <strong>${title}</strong><br>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
        const bsToast = new bootstrap.Toast(toast);
        bsToast.hide();
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }, 5000);
}

// Handle print buttons
document.querySelectorAll('.print-trigger').forEach(button => {
    button.addEventListener('click', () => {
        const printSection = document.querySelector(button.dataset.printSection);
        if (printSection) {
            const printContents = printSection.innerHTML;
            const originalContents = document.body.innerHTML;
            
            document.body.innerHTML = `
                <div class="container py-4">
                    <div class="text-center mb-4">
                        <h2>${document.title}</h2>
                        <p class="text-muted">Generado el ${new Date().toLocaleString('es-MX')}</p>
                    </div>
                    ${printContents}
                </div>
                <button class="btn btn-primary d-print-none" onclick="window.print()" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
                    <i class="bi bi-printer"></i> Imprimir
                </button>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => { window.close(); }, 100);
                    };
                <\/script>
            `;
            
            window.onafterprint = function() {
                document.body.innerHTML = originalContents;
                window.onafterprint = null;
            };
        }
    });
});

// Handle number inputs to format as currency
const currencyInputs = document.querySelectorAll('input[data-type="currency"]');
currencyInputs.forEach(input => {
    input.addEventListener('input', function(e) {
        // Remove all non-digit characters
        let value = this.value.replace(/[^\d]/g, '');
        
        // Convert to number and format as currency
        const number = parseFloat(value) / 100;
        
        if (!isNaN(number)) {
            this.value = formatCurrency(number);
        } else {
            this.value = '';
        }
    });
});

// Handle numeric inputs
const numericInputs = document.querySelectorAll('input[type="number"]');
numericInputs.forEach(input => {
    input.addEventListener('input', function() {
        // Remove any non-numeric characters
        this.value = this.value.replace(/[^\d]/g, '');
    });
});

// Handle stock level indicators
document.querySelectorAll('.stock-level').forEach(element => {
    const current = parseInt(element.dataset.current);
    const min = parseInt(element.dataset.min) || 0;
    
    if (current <= 0) {
        element.classList.add('text-danger', 'fw-bold');
    } else if (current <= min) {
        element.classList.add('text-warning', 'fw-bold');
    } else {
        element.classList.add('text-success');
    }
});
