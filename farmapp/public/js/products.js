// Products data table
let productsTable;

// DOM Ready
$(document).ready(function() {
    // Initialize DataTable
    initDataTable();
    
    // Load categories for dropdown
    loadCategories();
    
    // Form submission handler
    $('#productForm').on('submit', handleFormSubmit);
    
    // Search functionality
    $('#searchButton').on('click', function() {
        productsTable.search($('#searchInput').val()).draw();
    });
    
    $('#searchInput').on('keyup', function(e) {
        if (e.key === 'Enter') {
            productsTable.search(this.value).draw();
        }
    });
    
    // Delete button click handler
    $(document).on('click', '.btn-delete', function() {
        const productId = $(this).data('id');
        const productName = $(this).data('name');
        
        // Set up the delete confirmation modal
        $('#deleteModal .modal-body').html(
            `¿Está seguro que desea eliminar el producto <strong>${escapeHtml(productName)}</strong>? ` +
            'Esta acción no se puede deshacer.'
        );
        
        // Show the modal
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        deleteModal.show();
        
        // Handle delete confirmation
        $('#confirmDelete').off('click').on('click', function() {
            deleteProduct(productId, deleteModal);
        });
    });
    
    // Edit button click handler
    $(document).on('click', '.btn-edit', function() {
        const productId = $(this).data('id');
        loadProductData(productId);
    });
    
    // Show add product modal
    $('[data-bs-target="#productModal"]').on('click', function() {
        resetForm();
        $('#productModalLabel').text('Nuevo Producto');
        $('#productModal').modal('show');
    });
});

// Initialize DataTable
function initDataTable() {
    productsTable = $('#productsTable').DataTable({
        ajax: {
            url: '/api/products',
            dataSrc: '',
            error: function(xhr, error, thrown) {
                console.error('Error loading products:', error);
                showAlert('Error al cargar los productos', 'danger');
            }
        },
        columns: [
            { data: 'code' },
            { data: 'name' },
            { data: 'category_name' },
            { 
                data: 'sale_price',
                render: function(data) {
                    return formatCurrency(data);
                }
            },
            { 
                data: 'stock',
                className: 'text-center',
                render: function(data, type, row) {
                    const stockClass = data <= row.min_stock ? 'bg-danger' : '';
                    return `<span class="badge ${stockClass}">${data} ${row.unit || ''}</span>`;
                }
            },
            {
                data: 'status',
                className: 'text-center',
                render: function(data) {
                    return data === 1 
                        ? '<span class="badge bg-success">Activo</span>'
                        : '<span class="badge bg-secondary">Inactivo</span>';
                }
            },
            {
                data: 'id',
                className: 'text-end',
                orderable: false,
                render: function(data, type, row) {
                    return `
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${data}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-delete" 
                                    data-id="${data}" 
                                    data-name="${escapeHtml(row.name)}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    `;
                }
            }
        ],
        order: [[1, 'asc']],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-MX.json'
        },
        responsive: true
    });
}

// Load categories for dropdown
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Error loading categories');
        
        const categories = await response.json();
        const categorySelect = $('#category');
        
        // Clear existing options except the first one
        categorySelect.find('option:not(:first)').remove();
        
        // Add categories to dropdown
        categories.forEach(category => {
            categorySelect.append(`<option value="${category.id}">${escapeHtml(category.name)}</option>`);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        showAlert('Error al cargar las categorías', 'warning');
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
        id: $('#productId').val() || null,
        code: $('#code').val(),
        name: $('#name').val(),
        category_id: $('#category').val(),
        description: $('#description').val(),
        unit: $('#unit').val(),
        purchase_price: parseFloat($('#purchasePrice').val()),
        sale_price: parseFloat($('#salePrice').val()),
        stock: parseInt($('#stock').val()),
        min_stock: parseInt($('#minStock').val()),
        max_stock: $('#maxStock').val() ? parseInt($('#maxStock').val()) : null,
        status: $('#status').val() === '1' ? 1 : 0
    };
    
    const isNew = !formData.id;
    const url = isNew ? '/api/products' : `/api/products/${formData.id}`;
    const method = isNew ? 'POST' : 'PUT';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al guardar el producto');
        }
        
        // Refresh the table
        productsTable.ajax.reload();
        
        // Show success message
        showAlert(
            `Producto ${isNew ? 'agregado' : 'actualizado'} correctamente`, 
            'success'
        );
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
        
    } catch (error) {
        console.error('Error saving product:', error);
        showAlert(error.message || 'Error al guardar el producto', 'danger');
    }
}

// Load product data for editing
async function loadProductData(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error('Error loading product');
        
        const product = await response.json();
        
        // Fill the form with product data
        $('#productId').val(product.id);
        $('#code').val(product.code);
        $('#name').val(product.name);
        $('#category').val(product.category_id);
        $('#description').val(product.description || '');
        $('#unit').val(product.unit || '');
        $('#purchasePrice').val(product.purchase_price);
        $('#salePrice').val(product.sale_price);
        $('#stock').val(product.stock);
        $('#minStock').val(product.min_stock || 0);
        $('#maxStock').val(product.max_stock || '');
        $('#status').val(product.status ? '1' : '0');
        
        // Update modal title
        $('#productModalLabel').text('Editar Producto');
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading product:', error);
        showAlert('Error al cargar el producto', 'danger');
    }
}

// Delete a product
async function deleteProduct(productId, modal) {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar el producto');
        }
        
        // Refresh the table
        productsTable.ajax.reload();
        
        // Show success message
        showAlert('Producto eliminado correctamente', 'success');
        
        // Hide the modal
        if (modal) modal.hide();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showAlert(error.message || 'Error al eliminar el producto', 'danger');
    }
}

// Reset form
function resetForm() {
    const form = document.getElementById('productForm');
    form.reset();
    form.classList.remove('was-validated');
    $('#productId').val('');
    $('#status').val('1');
    $('#stock').val('0');
    $('#minStock').val('5');
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

// Show alert message
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
