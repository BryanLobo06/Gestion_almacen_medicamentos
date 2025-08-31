// Check authentication status on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    const response = await fetch('/api/auth/check', {
        credentials: 'same-origin'
    });

    if (!response.ok) {
        window.location.href = '/login.html';
        return;
    }

    const user = await response.json();
    updateUI(user);
    loadDashboardData();
});

// Update UI based on user role
function updateUI(user) {
    // Update user info
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        document.getElementById('username').textContent = `${user.fullName} (${user.role})`;
    }

    // Show/hide admin elements
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
        if (user.role === 'admin') {
            el.classList.remove('d-none');
        } else {
            el.classList.add('d-none');
        }
    });

    // Set up logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'same-origin'
            });
            window.location.href = '/login.html';
        });
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const [salesRes, productsRes] = await Promise.all([
            fetch('/api/sales/recent'),
            fetch('/api/products/low-stock')
        ]);

        if (!salesRes.ok || !productsRes.ok) {
            throw new Error('Error loading dashboard data');
        }

        const [sales, products] = await Promise.all([
            salesRes.json(),
            productsRes.json()
        ]);

        updateDashboardCards(sales, products);
        updateRecentSales(sales);
        updateLowStock(products);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar los datos del panel', 'danger');
    }
}

// Update dashboard cards
function updateDashboardCards(sales, products) {
    const cardsContainer = document.getElementById('dashboard-cards');
    if (!cardsContainer) return;

    const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const lowStockCount = products.length;

    cardsContainer.innerHTML = `
        <div class="col-md-3 mb-4">
            <div class="card text-white bg-primary">
                <div class="card-body">
                    <h5 class="card-title">Ventas Hoy</h5>
                    <h2 class="mb-0">${formatCurrency(totalSales)}</h2>
                    <p class="mb-0">${sales.length} transacciones</p>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-4">
            <div class="card text-white bg-success">
                <div class="card-body">
                    <h5 class="card-title">Productos con Stock Bajo</h5>
                    <h2 class="mb-0">${lowStockCount}</h2>
                    <p class="mb-0">Necesitan reabastecimiento</p>
                </div>
            </div>
        </div>
        <!-- Add more cards as needed -->
    `;
}

// Update recent sales table
function updateRecentSales(sales) {
    const tbody = document.querySelector('#recent-sales tbody');
    if (!tbody) return;

    tbody.innerHTML = sales.map(sale => `
        <tr>
            <td>${sale.id}</td>
            <td>${formatDate(sale.date)}</td>
            <td>${sale.customer || 'Cliente no especificado'}</td>
            <td>${formatCurrency(sale.total)}</td>
            <td>
                <a href="/sale-details.html?id=${sale.id}" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-eye"></i>
                </a>
            </td>
        </tr>
    `).join('');
}

// Update low stock table
function updateLowStock(products) {
    const tbody = document.querySelector('#low-stock tbody');
    if (!tbody) return;

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>
                <span class="badge bg-${product.stock <= product.minStock ? 'danger' : 'warning'}">
                    ${product.stock} ${product.unit || 'unidades'}
                </span>
            </td>
        </tr>
    `).join('');
}

// Helper functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-MX', options);
}

function showAlert(message, type = 'info') {
    const alertsContainer = document.getElementById('alerts-container');
    if (!alertsContainer) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertsContainer.appendChild(alert);
    
    // Auto-remove alert after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}
