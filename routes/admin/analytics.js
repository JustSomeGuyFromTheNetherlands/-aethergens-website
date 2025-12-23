const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        const totalPlayers = (await db.fetchOne("SELECT COUNT(*) as count FROM players"))?.count || 0;
        const newPlayersToday = (await db.fetchOne("SELECT COUNT(*) as count FROM players WHERE DATE(first_seen) = CURDATE()"))?.count || 0;
        const newPlayersWeek = (await db.fetchOne("SELECT COUNT(*) as count FROM players WHERE first_seen >= DATE_SUB(NOW(), INTERVAL 7 DAY)"))?.count || 0;
        const newPlayersMonth = (await db.fetchOne("SELECT COUNT(*) as count FROM players WHERE first_seen >= DATE_SUB(NOW(), INTERVAL 30 DAY)"))?.count || 0;
        
        const playerGrowth = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = (await db.fetchOne("SELECT COUNT(*) as count FROM players WHERE DATE(first_seen) <= ?", [dateStr]))?.count || 0;
            playerGrowth.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count
            });
        }
        
        const totalBans = (await db.fetchOne("SELECT COUNT(*) as count FROM bans WHERE active = 1"))?.count || 0;
        const bansToday = (await db.fetchOne("SELECT COUNT(*) as count FROM bans WHERE DATE(ban_date) = CURDATE()"))?.count || 0;
        const bansWeek = (await db.fetchOne("SELECT COUNT(*) as count FROM bans WHERE ban_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)"))?.count || 0;
        const bansMonth = (await db.fetchOne("SELECT COUNT(*) as count FROM bans WHERE ban_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)"))?.count || 0;
        
        const banTrend = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = (await db.fetchOne("SELECT COUNT(*) as count FROM bans WHERE DATE(ban_date) = ?", [dateStr]))?.count || 0;
            banTrend.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count
            });
        }
        
        const totalAppeals = (await db.fetchOne("SELECT COUNT(*) as count FROM appeals"))?.count || 0;
        const pendingAppeals = (await db.fetchOne("SELECT COUNT(*) as count FROM appeals WHERE status = 'pending'"))?.count || 0;
        const acceptedAppeals = (await db.fetchOne("SELECT COUNT(*) as count FROM appeals WHERE status = 'accepted'"))?.count || 0;
        const deniedAppeals = (await db.fetchOne("SELECT COUNT(*) as count FROM appeals WHERE status = 'denied'"))?.count || 0;
        
        const totalApplications = (await db.fetchOne("SELECT COUNT(*) as count FROM applications_pending"))?.count || 0;
        const pendingApplications = (await db.fetchOne("SELECT COUNT(*) as count FROM applications_pending WHERE status = 'pending'"))?.count || 0;
        const acceptedApplications = (await db.fetchOne("SELECT COUNT(*) as count FROM applications_pending WHERE status = 'accepted'"))?.count || 0;
        const rejectedApplications = (await db.fetchOne("SELECT COUNT(*) as count FROM applications_pending WHERE status = 'rejected'"))?.count || 0;
        
        const totalNews = (await db.fetchOne("SELECT COUNT(*) as count FROM news"))?.count || 0;
        const publishedNews = (await db.fetchOne("SELECT COUNT(*) as count FROM news WHERE published = 1"))?.count || 0;
        
        res.render('admin/analytics', {
            pageName: 'analytics',
            pageTitle: 'Analytics',
            pageSubtitle: 'Server statistics and trends',
            days,
            totalPlayers,
            newPlayersToday,
            newPlayersWeek,
            newPlayersMonth,
            playerGrowth,
            totalBans,
            bansToday,
            bansWeek,
            bansMonth,
            banTrend,
            totalAppeals,
            pendingAppeals,
            acceptedAppeals,
            deniedAppeals,
            totalApplications,
            pendingApplications,
            acceptedApplications,
            rejectedApplications,
            totalNews,
            publishedNews
        });
    } catch (error) {
        console.error('Analytics page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;

