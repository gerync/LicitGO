import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Configs from '../configs/Configs.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const carImagesDir = path.join(__dirname, '../../media/cars');
if (!fs.existsSync(carImagesDir)) {
    fs.mkdirSync(carImagesDir, { recursive: true });
}
const carsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, carImagesDir);
    }
    ,
    filename: function (req, file, cb) {
        const safeName = path.basename(file.originalname);
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        const ext = path.extname(safeName);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const uploadCarImages = multer({
    storage: carsStorage,
    limits: { fileSize: Configs.images.maxsizeMB * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const allowedTypes = Configs.images.allowedFormats.map(format => {
            const mimeFormat = format === 'jpg' ? 'jpeg' : format.toLowerCase();
            return `image/${mimeFormat}`;
        });
        
        if (!allowedTypes.includes(file.mimetype)) {
            const formatsList = Configs.images.allowedFormats.join(', ').toUpperCase();
            return cb(new Error(req.lang === 'HU' ? `Csak kép fájlok engedélyezettek (${formatsList}).` : `Only image files are allowed (${formatsList}).`));
        }
        cb(null, true);
    }
});

const uploadMultipleCarImagesFields = uploadCarImages.fields([
    { name: 'images', maxCount: Configs.images.maximumFilesUpload },
    { name: 'carImages', maxCount: Configs.images.maximumFilesUpload }
]);

// Wrapper to normalize req.files to an array (older code expects an array)
const uploadMultipleCarImages = (req, res, next) => {
    uploadMultipleCarImagesFields(req, res, function (err) {
        if (!err) {
            // Normalize to array
            if (!req.files) req.files = [];
            else if (!Array.isArray(req.files)) {
                const combined = [];
                Object.keys(req.files).forEach((key) => {
                    const arr = req.files[key];
                    if (Array.isArray(arr)) combined.push(...arr);
                });
                req.files = combined;
            }
            return next();
        }

        // If multer rejected due to unexpected field names, accept any files as a fallback
        // Multer v2 uses error.code === 'LIMIT_UNEXPECTED_FILE' for this
        if (err && (err.code === 'LIMIT_UNEXPECTED_FILE' || err.message?.includes('Unexpected field'))) {
            // fallback to any() which accepts all file field names
            uploadCarImages.any()(req, res, function (err2) {
                if (err2) return next(err2);

                if (!req.files) req.files = [];
                else if (!Array.isArray(req.files)) {
                    const combined = [];
                    Object.keys(req.files).forEach((key) => {
                        const arr = req.files[key];
                        if (Array.isArray(arr)) combined.push(...arr);
                    });
                    req.files = combined;
                }
                return next();
            });
            return;
        }

        return next(err);
    });
};


const PfpImageDir = path.join(__dirname, '../../media/users');
if (!fs.existsSync(PfpImageDir)) {
    fs.mkdirSync(PfpImageDir, { recursive: true });
}
const pfpStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, PfpImageDir);
    },
    filename: function (req, file, cb) {
        const safeName = path.basename(file.originalname);
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        const ext = path.extname(safeName);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const uploadPfpImage = multer({
    storage: pfpStorage,
    limits: { fileSize: Configs.images.maxsizeMB * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const allowedTypes = Configs.images.allowedFormats.map(format => {
            const mimeFormat = format === 'jpg' ? 'jpeg' : format.toLowerCase();
            return `image/${mimeFormat}`;
        });
        
        if (!allowedTypes.includes(file.mimetype)) {
            const formatsList = Configs.images.allowedFormats.join(', ').toUpperCase();
            return cb(new Error(req.lang === 'HU' ? `Csak kép fájlok engedélyezettek (${formatsList}).` : `Only image files are allowed (${formatsList}).`));
        }
        cb(null, true);
    }
});

async function deletePfpFile(filename) {
    if (!filename) {
        return;
    }
    const filePath = path.join(PfpImageDir, filename);
    try {
        await fs.promises.unlink(filePath);
    }
    catch (error) {
        // Ignore already removed files
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
}

export { uploadPfpImage, uploadMultipleCarImages, deletePfpFile };
// Wrapper for single profile image that falls back to accepting any field name
const uploadPfpSingle = (req, res, next) => {
    const single = uploadPfpImage.single('pfp');
    single(req, res, function (err) {
        if (!err) return next();

        if (err && (err.code === 'LIMIT_UNEXPECTED_FILE' || err.message?.includes('Unexpected field'))) {
            // fallback to any
            uploadPfpImage.any()(req, res, function (err2) {
                if (err2) return next(err2);
                // if any produced req.files as array, but controllers expect req.file for single
                if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                    req.file = req.files[0];
                }
                return next();
            });
            return;
        }

        return next(err);
    });
};

export { uploadPfpSingle };