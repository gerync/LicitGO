import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Configs from '../configs/Configs';

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

export { uploadPfpImage, uploadMultipleCarImages };