const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

router.get('/', async (req, res) => {
    try {
        const files = [];
        if (fs.existsSync(uploadDir)) {
            const fileList = fs.readdirSync(uploadDir);
            for (const file of fileList) {
                const filePath = path.join(uploadDir, file);
                if (fs.statSync(filePath).isFile()) {
                    files.push({
                        name: file,
                        size: fs.statSync(filePath).size,
                        type: require('mime-types').lookup(filePath) || 'application/octet-stream',
                        modified: fs.statSync(filePath).mtime,
                        url: `/uploads/${file}`
                    });
                }
            }
        }
        files.sort((a, b) => b.modified - a.modified);
        
        res.render('admin/files', {
            pageName: 'files',
            pageTitle: 'File Manager',
            pageSubtitle: 'Upload and manage files',
            files,
            message: req.query.message,
            error: req.query.error
        });
    } catch (error) {
        console.error('Files page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', upload.single('file'), async (req, res) => {
    try {
        const { action, filename } = req.body;
        
        if (action === 'upload' && req.file) {
            res.redirect(`/admin/files?message=File uploaded: ${req.file.filename}`);
        } else if (action === 'delete') {
            const filepath = path.join(uploadDir, filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
                res.redirect('/admin/files?message=File deleted');
            } else {
                res.redirect('/admin/files?error=File not found');
            }
        } else {
            res.redirect('/admin/files');
        }
    } catch (error) {
        console.error('File action error:', error);
        res.redirect(`/admin/files?error=${encodeURIComponent(error.message)}`);
    }
});

module.exports = router;

