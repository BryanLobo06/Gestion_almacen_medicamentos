    // Products data
let products = [];
let categories = [];

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadProducts();
    loadCategories();
    
    // Add event listeners
    document.getElementById('searchButton').addEventListener('click', filterProducts);
    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') filterProducts();
    });
    
    // Toggle sidebar
    document.getElementById('menuToggle').addEventListener('click', function() {
        document.body.classList.toggle('sidebar-collapsed');
    });
    
    // Form submission
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('productModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Get API base URL
function getApiBaseUrl() {
    const protocol = window.location.protocol;
    const host = window.location.host;
    // Si estamos en desarrollo (localhost), forzar http
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
        return `${protocol === 'https:' ? 'http:' : 'http:'}//${host}`;
    }
    return `${protocol}//${host}`;
}

// Load products from API
async function loadProducts() {
    try {
        showLoading(true);
        const apiUrl = `${getApiBaseUrl()}/api/products`;
        const response = await fetch(apiUrl, {
            credentials: 'include',  // Incluir credenciales para mantener la sesión
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error al cargar los productos');
        }
        
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showAlert(error.message || 'Error al cargar los productos', 'danger');
    } finally {
        showLoading(false);
    }
}

// Render products in the table
function renderProducts(productsToRender = products) {
    const tbody = document.querySelector('#productsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (productsToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No se encontraron productos</td>
            </tr>
        `;
        return;
    }
    
    productsToRender.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(product.code)}</td>
            <td>${escapeHtml(product.name)}</td>
            <td>${product.category_name || 'Sin categoría'}</td>
            <td>${formatCurrency(product.sale_price)}</td>
            <td class="text-center">
                <span class="${product.stock <= product.min_stock ? 'badge-error' : ''}">
                    ${product.stock} ${product.unit || ''}
                </span>
            </td>
            <td class="text-center">
                <span class="status-badge ${product.status ? 'status-active' : 'status-inactive'}">
                    ${product.status ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td class="text-end">
                <button class="btn btn-edit" data-id="${product.id}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-delete" data-id="${product.id}" data-name="${escapeHtml(product.name)}" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Add event listeners to the new buttons
        row.querySelector('.btn-edit').addEventListener('click', () => loadProductData(product.id));
        row.querySelector('.btn-delete').addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            const productName = e.currentTarget.dataset.name;
            showDeleteConfirmation(productId, productName);
        });
        
        tbody.appendChild(row);
    });
}

// Filter products based on search input
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        renderProducts();
        return;
    }
    
    const filteredProducts = products.filter(product => {
        return (
            (product.code && product.code.toString().toLowerCase().includes(searchTerm)) ||
            (product.name && product.name.toLowerCase().includes(searchTerm)) ||
            (product.category_name && product.category_name.toLowerCase().includes(searchTerm))
        );
    });
    
    renderProducts(filteredProducts);
}

// Load categories for dropdown
async function loadCategories() {
    try {
        showLoading(true);
        const apiUrl = '/api/categories';
        const response = await fetch(apiUrl, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error al cargar las categorías');
        }
        
        categories = await response.json();
        
        // Actualizar el dropdown de categorías
        const categorySelect = document.getElementById('category');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Seleccione una categoría</option>' + 
                categories.map(cat => 
                    `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`
                ).join('');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showAlert('Error al cargar las categorías', 'error');
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
    }
    
    const formData = {
        code: document.getElementById('code').value,
        name: document.getElementById('name').value,
        category_id: document.getElementById('category').value,
        description: document.getElementById('description')?.value || '',
        unit: document.getElementById('unit').value,
        purchase_price: parseFloat(document.getElementById('purchasePrice').value),
        sale_price: parseFloat(document.getElementById('salePrice').value),
        stock: parseInt(document.getElementById('stock').value),
        min_stock: parseInt(document.getElementById('minStock').value || 0),
        max_stock: document.getElementById('maxStock')?.value ? 
                 parseInt(document.getElementById('maxStock').value) : null,
        status: document.getElementById('status')?.value === '1' ? 1 : 0
    };
    
    const productId = document.getElementById('productId').value;
    const isNew = !productId;
    const url = isNew ? `//${window.location.host}/api/products` : `//${window.location.host}/api/products/${productId}`;
    const method = isNew ? 'POST' : 'PUT';
    
    try {
        showLoading(true);
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData),
            credentials: 'same-origin'
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Error al guardar el producto');
        }
        
        // Recargar la lista de productos
        await loadProducts();
        
        // Mostrar mensaje de éxito
        showAlert(
            result.message || `Producto ${isNew ? 'creado' : 'actualizado'} correctamente`,
            'success'
        );
        
        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
        
        // Resetear el formulario
        form.reset();
        form.classList.remove('was-validated');
        
    } catch (error) {
        console.error('Error saving product:', error);
        showAlert(error.message || 'Error al guardar el producto', 'danger');
    } finally {
        showLoading(false);
    }
}

// Load product data for editing
async function loadProductData(productId) {
    try {
        showLoading(true);
        const response = await fetch(`//${window.location.host}/api/products/${productId}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al cargar el producto');
        }
        
        const product = await response.json();
        
        // Populate the form
        document.getElementById('productId').value = product.id;
        document.getElementById('code').value = product.code || '';
        document.getElementById('name').value = product.name || '';
        document.getElementById('category').value = product.category_id || '';
        
        const description = document.getElementById('description');
        if (description) description.value = product.description || '';
        
        document.getElementById('unit').value = product.unit || '';
        document.getElementById('purchasePrice').value = product.purchase_price || '';
        document.getElementById('salePrice').value = product.sale_price || '';
        document.getElementById('stock').value = product.stock || 0;
        document.getElementById('minStock').value = product.min_stock || 0;
        
        const maxStock = document.getElementById('maxStock');
        if (maxStock) maxStock.value = product.max_stock || '';
        
        const status = document.getElementById('status');
        if (status) status.value = product.status ? '1' : '0';
        
        // Update modal title
        const modalTitle = document.getElementById('productModalLabel');
        if (modalTitle) modalTitle.textContent = 'Editar Producto';
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading product:', error);
        showAlert(error.message || 'Error al cargar el producto', 'danger');
    } finally {
        showLoading(false);
    }
}

// Show delete confirmation
function showDeleteConfirmation(productId, productName) {
    if (!confirm(`¿Está seguro que desea eliminar el producto "${productName}"?\nEsta acción no se puede deshacer.`)) {
        return;
    }
    
    deleteProduct(productId);
}

// Delete a product
async function deleteProduct(productId) {
    try {
        showLoading(true);
        const response = await fetch(`//${window.location.host}/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'same-origin'
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Error al eliminar el producto');
        }
        
        // Show success message
        showAlert(result.message || 'Producto eliminado correctamente', 'success');
        
        // Refresh the products list
        await loadProducts();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showAlert(error.message || 'Error al eliminar el producto', 'danger');
    } finally {
        showLoading(false);
    }
}

// Reset form
function resetForm() {
    const form = document.getElementById('productForm');
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
    }
    
    const productId = document.getElementById('productId');
    if (productId) productId.value = '';
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    const div = document.createElement('div');
    div.textContent = unsafe;
    return div.innerHTML;
}

// Helper function to format currency
function formatCurrency(amount) {
    if (isNaN(amount)) return '$0.00';
    return '$' + parseFloat(amount).toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Show/hide loading indicator
function showLoading(show = true) {
    // Create loading element if it doesn't exist
    let loadingElement = document.getElementById('loadingIndicator');
    
    if (!loadingElement) {
        loadingElement = document.createElement('div');
        loadingElement.id = 'loadingIndicator';
        loadingElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        loadingElement.innerHTML = `
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        `;
        document.body.appendChild(loadingElement);
    }
    
    loadingElement.style.display = show ? 'flex' : 'none';
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('.container.mt-4') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    // Add close button functionality
    const closeButton = alertDiv.querySelector('.btn-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            alertDiv.style.opacity = '0';
            setTimeout(() => alertDiv.remove(), 150);
        });
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.style.opacity = '0';
            setTimeout(() => alertDiv.remove(), 150);
        }
    }, 5000);
}
