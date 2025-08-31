const db = require('../config/database');

const productController = {
  // List all products
  listProducts: async (req, res) => {
    try {
      const [products] = await db.query(`
        SELECT p.*, c.name as category_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.name
      `);
      
      res.render('products/list', {
        title: 'Inventario de Productos',
        products,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error al cargar el inventario de productos.'
      });
    }
  },

  // Show add product form
  showAddForm: async (req, res) => {
    try {
      const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
      const [suppliers] = await db.query('SELECT * FROM suppliers ORDER BY name');
      
      res.render('products/form', {
        title: 'Agregar Producto',
        product: {},
        categories,
        suppliers,
        isEdit: false
      });
    } catch (error) {
      console.error('Error loading product form:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error al cargar el formulario de producto.'
      });
    }
  },

  // Add new product
  addProduct: async (req, res) => {
    const {
      name, description, category_id, barcode,
      price, cost_price, stock_quantity, min_stock_level,
      supplier_id, expiration_date
    } = req.body;

    try {
      await db.query(
        `INSERT INTO products 
         (name, description, category_id, barcode, price, cost_price, 
          stock_quantity, min_stock_level, supplier_id, expiration_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, description, category_id || null, barcode, price, cost_price,
         stock_quantity, min_stock_level, supplier_id || null, expiration_date || null]
      );

      req.flash('success', 'Producto agregado exitosamente');
      res.redirect('/products');
    } catch (error) {
      console.error('Error adding product:', error);
      
      // Get categories and suppliers again for the form
      const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
      const [suppliers] = await db.query('SELECT * FROM suppliers ORDER BY name');
      
      res.status(500).render('products/form', {
        title: 'Agregar Producto',
        product: req.body,
        categories,
        suppliers,
        isEdit: false,
        error: 'Error al agregar el producto. Por favor, intente nuevamente.'
      });
    }
  },

  // Show edit product form
  showEditForm: async (req, res) => {
    try {
      const [products] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
      
      if (products.length === 0) {
        return res.status(404).render('error', {
          title: 'No encontrado',
          message: 'El producto solicitado no existe.'
        });
      }
      
      const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
      const [suppliers] = await db.query('SELECT * FROM suppliers ORDER BY name');
      
      res.render('products/form', {
        title: 'Editar Producto',
        product: products[0],
        categories,
        suppliers,
        isEdit: true
      });
    } catch (error) {
      console.error('Error loading edit form:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error al cargar el formulario de edición.'
      });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    const {
      name, description, category_id, barcode,
      price, cost_price, stock_quantity, min_stock_level,
      supplier_id, expiration_date
    } = req.body;

    try {
      await db.query(
        `UPDATE products 
         SET name = ?, description = ?, category_id = ?, barcode = ?, 
             price = ?, cost_price = ?, stock_quantity = ?, min_stock_level = ?,
             supplier_id = ?, expiration_date = ?, updated_at = NOW()
         WHERE id = ?`,
        [name, description, category_id || null, barcode, price, cost_price,
         stock_quantity, min_stock_level, supplier_id || null, expiration_date || null,
         req.params.id]
      );

      req.flash('success', 'Producto actualizado exitosamente');
      res.redirect('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      
      // Get categories and suppliers again for the form
      const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
      const [suppliers] = await db.query('SELECT * FROM suppliers ORDER BY name');
      
      res.status(500).render('products/form', {
        title: 'Editar Producto',
        product: { ...req.body, id: req.params.id },
        categories,
        suppliers,
        isEdit: true,
        error: 'Error al actualizar el producto. Por favor, intente nuevamente.'
      });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
      req.flash('success', 'Producto eliminado exitosamente');
      res.redirect('/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      req.flash('error', 'No se pudo eliminar el producto. Asegúrese de que no esté relacionado con ventas.');
      res.redirect('/products');
    }
  },

  // Search products
  searchProducts: async (req, res) => {
    const { q } = req.query;
    
    try {
      const [products] = await db.query(
        `SELECT p.*, c.name as category_name 
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.name LIKE ? OR p.barcode = ?
         ORDER BY p.name`,
        [`%${q}%`, q]
      );
      
      res.json(products);
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: 'Error al buscar productos' });
    }
  }
};

module.exports = productController;
