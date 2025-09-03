// Categories Management Script - ES Module
import { Modal, Tooltip, Toast } from 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize modals
    const addCategoryModal = document.getElementById('addCategoryModal') ? 
        new bootstrap.Modal(document.getElementById('addCategoryModal')) : null;
        
    const editCategoryModal = document.getElementById('editCategoryModal') ? 
        new bootstrap.Modal(document.getElementById('editCategoryModal')) : null;
        
    const deleteCategoryModal = document.getElementById('deleteCategoryModal') ? 
        new bootstrap.Modal(document.getElementById('deleteCategoryModal')) : null;
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Toast initialization
    let toast = null;
    const toastEl = document.getElementById('toast');
    if (toastEl) {
        toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    }

    // Initial load of categories
    loadCategories();


    // Show toast notification
    function showToast(message, type = 'success') {
        if (!toastEl) return;
        
        const toastBody = toastEl.querySelector('.toast-body');
        if (toastBody) {
            toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
            toastBody.textContent = message;
            if (toast) {
                toast.show();
            }
        }
    }

    // Get base API URL - force HTTP for local development
    function getApiUrl(path) {
        const host = window.location.host;
        return `http://${host}${path}`;
    }

    // Load categories
    function loadCategories() {
        console.log('Cargando categorías...');
        fetch(getApiUrl('/api/categories'))
            .then(response => {
                console.log('Respuesta recibida:', response);
                if (!response.ok) {
                    throw new Error('Error al cargar las categorías');
                }
                return response.json();
            })
            .then(data => {
                console.log('Datos recibidos:', data);
                const container = document.getElementById('categoriesContainer');
                if (data.length === 0) {
                    container.innerHTML = `
                        <div class="col-12 text-center py-5">
                            <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                            <h5>No hay categorías registradas</h5>
                            <p class="text-muted">Comienza agregando una nueva categoría</p>
                        </div>`;
                    return;
                }

                container.innerHTML = '';
                data.forEach(category => {
                    const card = document.createElement('div');
                    card.className = 'col-md-4 mb-4';
                    card.innerHTML = `
                        <div class="card h-100 category-card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <h5 class="card-title mb-0">${category.name}</h5>
                                    <span class="badge ${category.status ? 'bg-success' : 'bg-secondary'}">
                                        ${category.status ? 'Activa' : 'Inactiva'}
                                    </span>
                                </div>
                                <p class="card-text text-muted">${category.description || 'Sin descripción'}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="text-muted">
                                        <i class="fas fa-boxes me-1"></i> ${category.productCount || 0} productos
                                    </small>
                                    <div class="action-buttons">
                                        <button class="btn btn-sm btn-outline-primary edit-category" 
                                                data-id="${category.id}" 
                                                data-name="${category.name}"
                                                data-description="${category.description || ''}"
                                                data-status="${category.status}">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger delete-category" 
                                                data-id="${category.id}"
                                                data-name="${category.name}">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    container.appendChild(card);
                });

                // Add event listeners to edit and delete buttons
                document.querySelectorAll('.edit-category').forEach(button => {
                    button.addEventListener('click', handleEditClick);
                });

                document.querySelectorAll('.delete-category').forEach(button => {
                    button.addEventListener('click', handleDeleteClick);
                });
            })
            .catch(error => {
                console.error('Error loading categories:', error);
                const container = document.getElementById('categoriesContainer');
                container.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                        <h5>Error al cargar las categorías</h5>
                        <p class="text-muted">${error.message}</p>
                        <button class="btn btn-primary mt-3" onclick="window.location.reload()">
                            <i class="fas fa-sync-alt me-2"></i>Reintentar
                        </button>
                    </div>`;
                showToast('Error al cargar las categorías', 'danger');
            });
    }

    // Handle edit button click
    function handleEditClick(event) {
        const button = event.currentTarget;
        const id = button.dataset.id;
        const name = button.dataset.name;
        const description = button.dataset.description;
        const status = button.dataset.status === 'true';

        document.getElementById('editCategoryId').value = id;
        document.getElementById('editCategoryName').value = name;
        document.getElementById('editCategoryDescription').value = description || '';
        document.getElementById('editCategoryStatus').checked = status;

        editCategoryModal.show();
    }

    // Handle delete button click
    function handleDeleteClick(event) {
        const button = event.currentTarget;
        const id = button.dataset.id;
        const name = button.dataset.name;

        document.getElementById('categoryToDeleteName').textContent = name;
        
        const confirmButton = document.getElementById('confirmDelete');
        const newConfirmButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
        
        newConfirmButton.addEventListener('click', () => deleteCategory(id));
        deleteCategoryModal.show();
    }

    // Add new category
    document.getElementById('addCategoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        
        const categoryData = {
            name: document.getElementById('categoryName').value.trim(),
            description: document.getElementById('categoryDescription').value.trim(),
            status: document.getElementById('categoryStatus').checked
        };

        fetch(getApiUrl('/api/categories'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin',
            body: JSON.stringify(categoryData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Categoría creada correctamente');
                addCategoryModal.hide();
                this.reset();
                loadCategories();
            } else {
                throw new Error(data.message || 'Error al crear la categoría');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast(error.message || 'Error al crear la categoría', 'danger');
        });
    });

    // Edit category
    document.getElementById('editCategoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Actualizando...';
        
        const id = document.getElementById('editCategoryId').value;
        const categoryData = {
            name: document.getElementById('editCategoryName').value.trim(),
            description: document.getElementById('editCategoryDescription').value.trim(),
            status: document.getElementById('editCategoryStatus').checked
        };

        fetch(getApiUrl(`/api/categories/${id}`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin',
            body: JSON.stringify(categoryData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Categoría actualizada correctamente');
                editCategoryModal.hide();
                loadCategories();
            } else {
                throw new Error(data.message || 'Error al actualizar la categoría');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast(error.message || 'Error al actualizar la categoría', 'danger');
        });
    });

    // Delete category
    function deleteCategory(id) {
        const deleteButton = document.getElementById('confirmDelete');
        const originalButtonText = deleteButton.innerHTML;
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Eliminando...';
        
        fetch(getApiUrl(`/api/categories/${id}`), {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Categoría eliminada correctamente');
                deleteCategoryModal.hide();
                loadCategories();
            } else {
                throw new Error(data.message || 'Error al eliminar la categoría');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast(error.message || 'Error al eliminar la categoría', 'danger');
        });
    }

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', debounce(function(e) {
        const searchTerm = this.value.trim().toLowerCase();
        if (searchTerm.length === 0) {
            loadCategories();
            return;
        }
        
        // Show loading state
        const container = document.getElementById('categoriesContainer');
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Buscando...</span>
                </div>
                <p class="mt-2 text-muted">Buscando categorías...</p>
            </div>`;
            
        // Search API call
        fetch(getApiUrl(`/api/categories/search?q=${encodeURIComponent(searchTerm)}`))
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById('categoriesContainer');
                if (data.length === 0) {
                    container.innerHTML = `
                        <div class="col-12 text-center py-5">
                            <i class="fas fa-search fa-3x text-muted mb-3"></i>
                            <h5>No se encontraron categorías</h5>
                            <p class="text-muted">No hay resultados para "${searchTerm}"</p>
                        </div>`;
                    return;
                }
                
                container.innerHTML = '';
                // Render search results
                data.forEach(category => {
                    const card = createCategoryCard(category);
                    container.appendChild(card);
                });
                
                // Re-attach event listeners
                attachEventListeners();
            })
            .catch(error => {
                console.error('Error searching categories:', error);
                showToast('Error al buscar categorías', 'danger');
            });
    }, 300));
    
    // Debounce function to limit API calls
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Create category card element
    function createCategoryCard(category) {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
            <div class="card h-100 category-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="card-title mb-0">${escapeHtml(category.name)}</h5>
                        <span class="badge ${category.status ? 'bg-success' : 'bg-secondary'}">
                            ${category.status ? 'Activa' : 'Inactiva'}
                        </span>
                    </div>
                    <p class="card-text text-muted">${category.description ? escapeHtml(category.description) : 'Sin descripción'}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            <i class="fas fa-boxes me-1"></i> ${category.productCount || 0} productos
                        </small>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-outline-primary edit-category" 
                                    data-id="${category.id}" 
                                    data-name="${escapeHtml(category.name)}"
                                    data-description="${escapeHtml(category.description || '')}"
                                    data-status="${category.status}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-category" 
                                    data-id="${category.id}"
                                    data-name="${escapeHtml(category.name)}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        return card;
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Attach event listeners to category cards
    function attachEventListeners() {
        document.querySelectorAll('.edit-category').forEach(button => {
            button.addEventListener('click', handleEditClick);
        });

        document.querySelectorAll('.delete-category').forEach(button => {
            button.addEventListener('click', handleDeleteClick);
        });
    }

    // Filter by status
    document.getElementById('statusFilter').addEventListener('change', function() {
        const status = this.value;
        const cards = document.querySelectorAll('.category-card');
        
        cards.forEach(card => {
            const statusBadge = card.querySelector('.badge').textContent.trim();
            
            if (status === '' || 
                (status === 'active' && statusBadge === 'Activa') ||
                (status === 'inactive' && statusBadge === 'Inactiva')) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Reset filters
    document.getElementById('resetFilters').addEventListener('click', function() {
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        
        const cards = document.querySelectorAll('.category-card');
        cards.forEach(card => {
            card.style.display = '';
        });
    });

    // Load initial data
    loadCategories();

    // Export functions that need to be called from HTML
    window.deleteCategory = function(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;
        
        fetch(getApiUrl(`/api/categories/${id}`), {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Categoría eliminada correctamente');
                loadCategories();
            } else {
                throw new Error(data.message || 'Error al eliminar la categoría');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast(error.message || 'Error al eliminar la categoría', 'danger');
        });
    };
});
