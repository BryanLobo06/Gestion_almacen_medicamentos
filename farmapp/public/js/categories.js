// Categories Management Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize modals
    const addCategoryModal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
    const editCategoryModal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
    const deleteCategoryModal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'));

    // Toast initialization
    const toastEl = document.getElementById('toast');
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });

    // Show toast notification
    function showToast(message, type = 'success') {
        const toastBody = toastEl.querySelector('.toast-body');
        toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
        toastBody.textContent = message;
        toast.show();
    }

    // Load categories
    function loadCategories() {
        fetch('/api/categories')
            .then(response => response.json())
            .then(data => {
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
        
        const categoryData = {
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value,
            status: document.getElementById('categoryStatus').checked ? 1 : 0
        };

        fetch('/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
        
        const id = document.getElementById('editCategoryId').value;
        const categoryData = {
            name: document.getElementById('editCategoryName').value,
            description: document.getElementById('editCategoryDescription').value,
            status: document.getElementById('editCategoryStatus').checked ? 1 : 0
        };

        fetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
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
        fetch(`/api/categories/${id}`, {
            method: 'DELETE'
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
    document.getElementById('searchInput').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const cards = document.querySelectorAll('.category-card');
        
        cards.forEach(card => {
            const name = card.querySelector('.card-title').textContent.toLowerCase();
            const description = card.querySelector('.card-text').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });

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
});
