// Inicialización de componentes de la interfaz de categorías
document.addEventListener('DOMContentLoaded', function() {
    // Asegurarse de que Bootstrap esté disponible globalmente
    window.bootstrap = bootstrap || {};

    // Inicializar tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Alternar barra lateral en dispositivos móviles
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }

    // Función global para eliminar categorías
    window.deleteCategory = function(categoryId, categoryName) {
        if (categoryId && categoryName) {
            const modal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'));
            const nameSpan = document.getElementById('categoryToDeleteName');
            if (nameSpan) {
                nameSpan.textContent = categoryName;
            }
            
            const confirmBtn = document.getElementById('confirmDelete');
            if (confirmBtn) {
                // Remover cualquier manejador de eventos anterior
                const newConfirmBtn = confirmBtn.cloneNode(true);
                confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
                
                // Agregar nuevo manejador de eventos
                newConfirmBtn.addEventListener('click', function() {
                    // Aquí se manejará la lógica de eliminación desde categories.js
                    console.log('Eliminando categoría:', categoryId);
                    modal.hide();
                });
            }
            
            modal.show();
        }
    };

    // Inicializar DataTable
    const categoriesTable = document.getElementById('categoriesTable');
    if (categoriesTable) {
        $(categoriesTable).DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
            },
            responsive: true,
            order: [[1, 'asc']] // Ordenar por nombre por defecto
        });
    }
});
