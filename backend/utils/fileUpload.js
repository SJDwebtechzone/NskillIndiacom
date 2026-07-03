const multer = require("multer");
const path = require("path");
const fs = require("fs");

const FILE_TYPES = {
    image: {
        mimes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        exts: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
        maxSize: 200 * 1024,
        errorMsg: "Image size exceeds the maximum limit of 200 KB. Please upload a smaller image."
    },
    pdf: {
        mimes: ["application/pdf"],
        exts: [".pdf"],
        maxSize: 5 * 1024 * 1024,
        errorMsg: "PDF size exceeds the maximum limit of 5 MB."
    },
    word: {
        mimes: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        exts: [".doc", ".docx"],
        maxSize: 5 * 1024 * 1024,
        errorMsg: "Document size exceeds the maximum limit of 5 MB."
    },
    excel: {
        mimes: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
        exts: [".xls", ".xlsx"],
        maxSize: 5 * 1024 * 1024,
        errorMsg: "Excel file size exceeds the maximum limit of 5 MB."
    },
    powerpoint: {
        mimes: ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
        exts: [".ppt", ".pptx"],
        maxSize: 10 * 1024 * 1024,
        errorMsg: "PowerPoint file size exceeds the maximum limit of 10 MB."
    },
    text: {
        mimes: ["text/plain"],
        exts: [".txt"],
        maxSize: 1024 * 1024,
        errorMsg: "Upload failed. Please upload a supported file within the allowed size limit."
    },
    csv: {
        mimes: ["text/csv"],
        exts: [".csv"],
        maxSize: 5 * 1024 * 1024,
        errorMsg: "Upload failed. Please upload a supported file within the allowed size limit."
    },
    audio: {
        mimes: ["audio/mpeg", "audio/wav", "audio/aac", "audio/ogg"],
        exts: [".mp3", ".wav", ".aac", ".ogg"],
        maxSize: 20 * 1024 * 1024,
        errorMsg: "Audio file size exceeds the maximum limit of 20 MB."
    },
    video: {
        mimes: ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska", "video/webm"],
        exts: [".mp4", ".mov", ".avi", ".mkv", ".webm"],
        maxSize: 100 * 1024 * 1024,
        errorMsg: "Video file size exceeds the maximum limit of 100 MB."
    },
    zip: {
        mimes: ["application/zip", "application/x-rar-compressed", "application/x-7z-compressed"],
        exts: [".zip", ".rar", ".7z"],
        maxSize: 50 * 1024 * 1024,
        errorMsg: "Archive file size exceeds the maximum limit of 50 MB."
    }
};

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
    }
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    let foundCategory = null;
    for (const key of Object.keys(FILE_TYPES)) {
        if (FILE_TYPES[key].mimes.includes(mime) || FILE_TYPES[key].exts.includes(ext)) {
            foundCategory = FILE_TYPES[key];
            break;
        }
    }

    if (!foundCategory) {
        req.fileValidationError = "Unsupported file format. Allowed formats: JPG, JPEG, PNG, WEBP, GIF.";
        return cb(null, false, new Error(req.fileValidationError));
    }

    // Attach limit dynamically for size checking in middleware
    file.categoryLimit = foundCategory.maxSize;
    file.categoryErrorMsg = foundCategory.errorMsg;

    cb(null, true);
};

const uploadDisk = multer({ storage: diskStorage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });
const uploadMemory = multer({ storage: memoryStorage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });

const createHandler = (uploaderInstance) => {
    return (req, res, next) => {
        uploaderInstance(req, res, function (err) {
            if (req.fileValidationError) {
                return res.status(400).json({ error: req.fileValidationError });
            }
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ error: "File exceeds the maximum limit." });
                return res.status(400).json({ error: err.message });
            } else if (err) {
                return res.status(400).json({ error: err.message });
            }

            // Post-upload size validation per file type
            if (req.files && typeof req.files === 'object') {
                for (const fieldName in req.files) {
                    for (const file of req.files[fieldName]) {
                        if (file.size > file.categoryLimit) {
                            Object.values(req.files).flat().forEach(f => {
                                if (f.path && fs.existsSync(f.path)) fs.unlinkSync(f.path);
                            });
                            return res.status(400).json({ error: file.categoryErrorMsg });
                        }
                    }
                }
            }
            if (req.file) {
                if (req.file.size > req.file.categoryLimit) {
                    if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                    return res.status(400).json({ error: req.file.categoryErrorMsg });
                }
            }
            next();
        });
    };
};

const handleFileUpload = (fieldsConfig, useMemory = false) => {
    return createHandler((useMemory ? uploadMemory : uploadDisk).fields(fieldsConfig));
};

const handleSingleUpload = (fieldName, useMemory = false) => {
    return createHandler((useMemory ? uploadMemory : uploadDisk).single(fieldName));
};

const handleArrayUpload = (fieldName, maxCount, useMemory = false) => {
    return createHandler((useMemory ? uploadMemory : uploadDisk).array(fieldName, maxCount));
};

module.exports = { handleFileUpload, handleSingleUpload, handleArrayUpload, FILE_TYPES };
