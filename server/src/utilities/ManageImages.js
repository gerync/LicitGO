import multer from 'multer';
import path from 'path';
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
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
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

const uploadMultipleCarImages = uploadCarImages.array('carImages', Configs.images.maximumFilesUpload);


const PfpImageDir = path.join(__dirname, '../../media/users');
if (!fs.existsSync(PfpImageDir)) {
    fs.mkdirSync(PfpImageDir, { recursive: true });
}
const pfpStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, PfpImageDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
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