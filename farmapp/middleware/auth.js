const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// Verify JWT token
const verifyToken = async (token) => {
    try {
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        return { success: true, user: decoded };
    } catch (error) {
        return { success: false, error: 'Token inválido o expirado' };
    }
};

// Middleware to check if user is authenticated
const isAuthenticated = async (req, res, next) => {
    // Check if user is in session
    if (req.session && req.session.user) {
        return next();
    }
    
    // If no session, check for token
    let token = req.header('Authorization') || req.cookies.token;
    
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7);
        try {
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
            // Add user to session
            req.session.user = decoded;
            return next();
        } catch (err) {
            // Token verification failed
            console.error('Token verification failed:', err);
        }
    }
    
    // If we get here, user is not authenticated
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Redirect to login page for regular requests
    return res.redirect('/auth/login');

    // Verify token
    const verified = await verifyToken(token);
    if (!verified.success) {
        return res.status(401).render('error', {
            title: 'Sesión expirada',
            message: 'Su sesión ha expirado, por favor inicie sesión nuevamente'
        });
    }

    // Add user to request
    req.user = verified.user;
    next();
};

// Middleware to check if user has admin role
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).render('error', {
        title: 'Acceso denegado',
        message: 'No tiene permisos para acceder a esta sección'
    });
};

// Middleware to check if user has specific role
const hasRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.redirect('/auth/login');
        }
        
        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).render('error', {
                title: 'Acceso denegado',
                message: 'No tiene permisos suficientes para acceder a este recurso'
            });
        }
        
        next();
    };
};

// Middleware to check if user is the owner of the resource or admin
const isOwnerOrAdmin = (model, idParam = 'id') => {
    return async (req, res, next) => {
        try {
            if (req.user.role === 'admin') {
                return next();
            }
            
            const item = await model.findByPk(req.params[idParam]);
            
            if (!item) {
                return res.status(404).render('error', {
                    title: 'No encontrado',
                    message: 'El recurso solicitado no existe'
                });
            }
            
            if (item.userId !== req.user.id) {
                return res.status(403).render('error', {
                    title: 'Acceso denegado',
                    message: 'No tiene permisos para acceder a este recurso'
                });
            }
            
            next();
        } catch (error) {
            console.error('Error in isOwnerOrAdmin middleware:', error);
            res.status(500).render('error', {
                title: 'Error del servidor',
                message: 'Ocurrió un error al verificar los permisos'
            });
        }
    };
};

module.exports = {
    verifyToken,
    isAuthenticated,
    isAdmin,
    hasRole,
    isOwnerOrAdmin
};
