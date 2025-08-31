const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Middleware for handling single file upload
const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading
                return res.status(400).json({ 
                    success: false, 
                    message: err.message 
                });
            } else if (err) {
                // An unknown error occurred
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error al subir el archivo' 
                });
            }
            
            // File uploaded successfully
            if (req.file) {
                req.file.path = req.file.path.replace(/\\/g, '/'); // Normalize path
                req.file.url = '/uploads/' + path.basename(req.file.path);
            }
            
            next();
        });
    };
};

// Middleware for handling multiple file uploads
const uploadMultiple = (fieldName, maxCount = 5) => {
    return (req, res, next) => {
        upload.array(fieldName, maxCount)(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ 
                    success: false, 
                    message: err.message 
                });
            } else if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error al subir los archivos' 
                });
            }
            
            // Files uploaded successfully
            if (req.files && req.files.length > 0) {
                req.files = req.files.map(file => {
                    file.path = file.path.replace(/\\/g, '/'); // Normalize path
                    file.url = '/uploads/' + path.basename(file.path);
                    return file;
                });
            }
            
            next();
        });
    };
};

// Delete file from the filesystem
const deleteFile = (filePath) => {
    const fullPath = path.join(__dirname, '../public', filePath);
    
    return new Promise((resolve, reject) => {
        fs.unlink(fullPath, (err) => {
            if (err && err.code !== 'ENOENT') {
                console.error('Error deleting file:', err);
                return reject(err);
            }
            resolve(true);
        });
    });
};

// Generate a unique filename
const generateUniqueFilename = (originalname) => {
    const ext = path.extname(originalname).toLowerCase();
    return `${uuidv4()}${ext}`;
};

module.exports = {
    uploadSingle,
    uploadMultiple,
    deleteFile,
    generateUniqueFilename
};
