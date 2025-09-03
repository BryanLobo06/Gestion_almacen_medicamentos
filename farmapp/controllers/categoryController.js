const db = require('../config/database');

const categoryController = {
  // Search categories
  searchCategories: async (req, res) => {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, message: 'Término de búsqueda requerido' });
    }

    try {
      const searchTerm = `%${q}%`;
      const [categories] = await db.query(
        `SELECT c.*, COUNT(p.id) as productCount 
         FROM categories c
         LEFT JOIN products p ON c.id = p.category_id
         WHERE c.name LIKE ? OR c.description LIKE ?
         GROUP BY c.id
         ORDER BY c.name`,
        [searchTerm, searchTerm]
      );

      // Convert status to boolean for frontend
      const formattedCategories = categories.map(category => ({
        ...category,
        status: category.status === 1
      }));
      
      res.json(formattedCategories);
    } catch (error) {
      console.error('Error searching categories:', error);
      res.status(500).json({ success: false, message: 'Error al buscar categorías' });
    }
  },
  // Get all categories with product count
  getAllCategories: async (req, res) => {
    try {
      const [categories] = await db.query(`
        SELECT c.*, COUNT(p.id) as productCount 
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id
        ORDER BY c.name
      `);
      
      // Convert status to boolean for frontend
      const formattedCategories = categories.map(category => ({
        ...category,
        status: category.status === 1
      }));
      
      res.json(formattedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ success: false, message: 'Error al cargar las categorías' });
    }
  },

  // Create a new category
  createCategory: async (req, res) => {
    const { name, description, status } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'El nombre es requerido' });
    }

    try {
      const [result] = await db.query(
        'INSERT INTO categories (name, description, status) VALUES (?, ?, ?)',
        [name, description || null, status ? 1 : 0]
      );
      
      const [newCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
      
      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        category: {
          ...newCategory[0],
          status: newCategory[0].status === 1,
          productCount: 0
        }
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'Ya existe una categoría con este nombre' });
      }
      console.error('Error creating category:', error);
      res.status(500).json({ success: false, message: 'Error al crear la categoría' });
    }
  },

  // Update a category
  updateCategory: async (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'El nombre es requerido' });
    }

    try {
      // Check if category exists
      const [categories] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
      if (categories.length === 0) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      }

      // Check for duplicate name (excluding current category)
      const [existing] = await db.query(
        'SELECT id FROM categories WHERE name = ? AND id != ?',
        [name, id]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe una categoría con este nombre' });
      }

      // Update category
      await db.query(
        'UPDATE categories SET name = ?, description = ?, status = ? WHERE id = ?',
        [name, description || null, status ? 1 : 0, id]
      );

      // Get updated category
      const [updatedCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
      
      // Get product count
      const [[{ productCount }]] = await db.query(
        'SELECT COUNT(*) as productCount FROM products WHERE category_id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        category: {
          ...updatedCategory[0],
          status: updatedCategory[0].status === 1,
          productCount: parseInt(productCount)
        }
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar la categoría' });
    }
  },

  // Delete a category
  deleteCategory: async (req, res) => {
    const { id } = req.params;

    try {
      // Check if category exists
      const [categories] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
      if (categories.length === 0) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      }

      // Check if category has associated products
      const [[{ productCount }]] = await db.query(
        'SELECT COUNT(*) as productCount FROM products WHERE category_id = ?',
        [id]
      );

      if (parseInt(productCount) > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar la categoría porque tiene productos asociados'
        });
      }

      // Delete category
      await db.query('DELETE FROM categories WHERE id = ?', [id]);
      
      res.json({
        success: true,
        message: 'Categoría eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ success: false, message: 'Error al eliminar la categoría' });
    }
  }
};

module.exports = categoryController;
