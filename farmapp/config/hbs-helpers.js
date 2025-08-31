const moment = require('moment');

const helpers = {
  // Equality helper
  eq: function(a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  },
  // Format date using moment.js
  formatDate: function(date, format) {
    return moment(date).format(format || 'DD/MM/YYYY');
  },
  
  // Format currency
  formatCurrency: function(amount) {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN' 
    }).format(amount);
  },
  
  // Check if a value is equal to another
  isEqual: function(a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  },
  
  // Check if stock is low
  isLowStock: function(stock, minStock, options) {
    return stock <= (minStock || 10) ? options.fn(this) : options.inverse(this);
  },
  
  // Check if product is expired
  isExpired: function(expirationDate, options) {
    if (!expirationDate) return options.inverse(this);
    const today = new Date();
    const expDate = new Date(expirationDate);
    return expDate < today ? options.fn(this) : options.inverse(this);
  },
  
  // Get stock status class
  getStockStatus: function(stock, minStock) {
    if (stock <= 0) return 'danger';
    if (stock <= (minStock || 10)) return 'warning';
    return 'success';
  },
  
  // Format date for input field
  formatDateForInput: function(date) {
    if (!date) return '';
    return moment(date).format('YYYY-MM-DD');
  },
  
  // Truncate text
  truncate: function(str, len) {
    if (str.length > len && str.length > 0) {
      let newStr = str + " ";
      newStr = str.substr(0, len);
      newStr = str.substr(0, newStr.lastIndexOf(" "));
      newStr = newStr.length > 0 ? newStr : str.substr(0, len);
      return newStr + '...';
    }
    return str;
  },
  
  // Check if user has role
  hasRole: function(userRole, requiredRole, options) {
    if (userRole === requiredRole) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  
  // Multiply two numbers
  multiply: function(a, b) {
    return a * b;
  },
  
  // Add two numbers
  add: function(a, b) {
    return a + b;
  },
  
  // Subtract two numbers
  subtract: function(a, b) {
    return a - b;
  },
  
  // Check if a value is in an array
  inArray: function(value, array, options) {
    if (array && array.indexOf) {
      return array.indexOf(value) !== -1 ? options.fn(this) : options.inverse(this);
    }
    return options.inverse(this);
  },
  
  // Convert to JSON
  toJSON: function(obj) {
    return JSON.stringify(obj);
  },
  
  // Format date time
  formatDateTime: function(date) {
    return moment(date).format('DD/MM/YYYY HH:mm');
  },
  
  // Format time ago
  timeAgo: function(date) {
    return moment(date).fromNow();
  }
};

module.exports = helpers;
