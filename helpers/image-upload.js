const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Yalnızca belirli dosya türlerine izin ver
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Yalnızca JPEG, PNG ve GIF dosyalarına izin verilir.'));
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = './public/images';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Maksimum 5 MB
});

module.exports.upload = upload;