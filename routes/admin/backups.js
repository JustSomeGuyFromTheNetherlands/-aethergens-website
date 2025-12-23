const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getDB } = require('../../database');

const backupDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

router.get('/', async (req, res) => {
    try {
        const files = [];
        if (fs.existsSync(backupDir)) {
            const fileList = fs.readdirSync(backupDir);
            for (const file of fileList) {
                const filePath = path.join(backupDir, file);
                if (fs.statSync(filePath).isFile()) {
                    files.push({
                        name: file,
                        size: fs.statSync(filePath).size,
                        modified: fs.statSync(filePath).mtime,
                        url: `/backups/${file}`
                    });
                }
            }
        }
        files.sort((a, b) => b.modified - a.modified);
        
        res.render('admin/backups', {
            pageName: 'backups',
            pageTitle: 'Backups',
            pageSubtitle: 'Database backup and restore',
            files,
            message: req.query.message,
            error: req.query.error
        });
    } catch (error) {
        console.error('Backups page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const { action, filename } = req.body;
        
        if (action === 'create_backup') {
            const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.sql`;
            const filepath = path.join(backupDir, filename);
            
            const tables = await db.fetchAll("SHOW TABLES");
            let sql = `-- Database Backup\n-- Generated: ${new Date().toISOString()}\n\nSET FOREIGN_KEY_CHECKS=0;\n\n`;
            
            for (const table of tables) {
                const tableName = Object.values(table)[0];
                const createTable = await db.fetchOne(`SHOW CREATE TABLE \`${tableName}\``);
                sql += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
                sql += createTable[`Create Table`] + ';\n\n';
                
                const rows = await db.fetchAll(`SELECT * FROM \`${tableName}\``);
                if (rows.length > 0) {
                    sql += `INSERT INTO \`${tableName}\` VALUES\n`;
                    const values = rows.map(row => {
                        const rowValues = Object.values(row).map(v => v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
                        return `(${rowValues.join(',')})`;
                    });
                    sql += values.join(',\n') + ';\n\n';
                }
            }
            
            sql += 'SET FOREIGN_KEY_CHECKS=1;\n';
            fs.writeFileSync(filepath, sql);
            res.redirect(`/admin/backups?message=Backup created: ${filename}`);
        } else if (action === 'delete_backup') {
            const filepath = path.join(backupDir, filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
                res.redirect('/admin/backups?message=Backup deleted');
            } else {
                res.redirect('/admin/backups?error=File not found');
            }
        } else {
            res.redirect('/admin/backups');
        }
    } catch (error) {
        console.error('Backup action error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;


