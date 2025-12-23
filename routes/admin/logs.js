const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { getCurrentAdmin } = require('../../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const filter = req.query.filter || 'all';
        const search = req.query.search || '';
        const adminFilter = req.query.admin || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const offset = (page - 1) * limit;
        
        let query = "SELECT * FROM admin_log WHERE 1=1";
        const params = [];
        
        if (search) {
            query += " AND action LIKE ?";
            params.push(`%${search}%`);
        }
        
        if (adminFilter) {
            query += " AND admin = ?";
            params.push(adminFilter);
        }
        
        if (filter === 'today') {
            query += " AND DATE(timestamp) = CURDATE()";
        } else if (filter === 'week') {
            query += " AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        } else if (filter === 'month') {
            query += " AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        }
        
        // Get total count
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
        const totalCount = (await db.fetchOne(countQuery, params))?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);
        
        query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);
        
        const logs = await db.fetchAll(query, params);
        
        // Get unique admins for filter
        const admins = await db.fetchAll("SELECT DISTINCT admin FROM admin_log ORDER BY admin ASC");
        
        // Get stats
        const stats = {
            total: (await db.fetchOne("SELECT COUNT(*) as count FROM admin_log"))?.count || 0,
            today: (await db.fetchOne("SELECT COUNT(*) as count FROM admin_log WHERE DATE(timestamp) = CURDATE()"))?.count || 0,
            week: (await db.fetchOne("SELECT COUNT(*) as count FROM admin_log WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)"))?.count || 0,
            month: (await db.fetchOne("SELECT COUNT(*) as count FROM admin_log WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)"))?.count || 0
        };
        
        res.render('admin/logs', {
            pageName: 'logs',
            pageTitle: 'Activity Logs',
            pageSubtitle: 'View all admin actions and system events',
            logs,
            stats,
            filter,
            search,
            adminFilter,
            admins,
            page,
            totalPages,
            totalCount
        });
    } catch (error) {
        console.error('Logs page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/export', async (req, res) => {
    try {
        const db = getDB();
        const { format = 'csv', filter = 'all', search = '', admin = '' } = req.body;
        
        let query = "SELECT * FROM admin_log WHERE 1=1";
        const params = [];
        
        if (search) {
            query += " AND action LIKE ?";
            params.push(`%${search}%`);
        }
        
        if (admin) {
            query += " AND admin = ?";
            params.push(admin);
        }
        
        if (filter === 'today') {
            query += " AND DATE(timestamp) = CURDATE()";
        } else if (filter === 'week') {
            query += " AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        } else if (filter === 'month') {
            query += " AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        }
        
        query += " ORDER BY timestamp DESC";
        const logs = await db.fetchAll(query, params);
        
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=admin_logs_${Date.now()}.csv`);
            
            let csv = 'ID,Admin,Action,Target Type,Target ID,IP,Timestamp\n';
            logs.forEach(log => {
                csv += `${log.id},"${log.admin}","${log.action.replace(/"/g, '""')}","${log.target_type || ''}","${log.target_id || ''}","${log.ip || ''}","${log.timestamp}"\n`;
            });
            
            res.send(csv);
        } else {
            res.json({ success: true, logs });
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

