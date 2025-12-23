const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { getCurrentAdmin } = require('../../middleware/auth');
const { getRCON } = require('../../utils/rcon');
const { sanitizeString } = require('../../utils/validation');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        
        const rconHostResult = await db.fetchOne("SELECT value FROM config WHERE `key` = 'rcon_host'");
        const rconPortResult = await db.fetchOne("SELECT value FROM config WHERE `key` = 'rcon_port'");
        const rconPasswordResult = await db.fetchOne("SELECT value FROM config WHERE `key` = 'rcon_password'");
        
        let rconHost = rconHostResult?.value || '';
        let rconPort = rconPortResult ? parseInt(rconPortResult.value) : 2755;
        let rconPassword = rconPasswordResult?.value || 'cheese';
        
        const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
        if (!rconHost && serverSettings) {
            rconHost = serverSettings.server_ip;
        }
        
        res.render('admin/console', {
            pageName: 'console',
            pageTitle: 'Server Console',
            pageSubtitle: 'Execute server commands via RCON',
            rconHost,
            rconPort,
            rconPassword,
            message: req.query.message,
            error: req.query.error,
            commandOutput: req.query.output
        });
    } catch (error) {
        console.error('Console page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const currentAdmin = getCurrentAdmin(req);
        const { action, rcon_host, rcon_port, rcon_password, command, test_host, test_port, test_password } = req.body;
        
        if (action === 'update_settings') {
            await db.query(
                "INSERT INTO config (`key`, `value`, updated_at) VALUES ('rcon_host', ?, NOW()) ON DUPLICATE KEY UPDATE `value` = ?, updated_at = NOW()",
                [sanitizeString(rcon_host || ''), sanitizeString(rcon_host || '')]
            );
            await db.query(
                "INSERT INTO config (`key`, `value`, updated_at) VALUES ('rcon_port', ?, NOW()) ON DUPLICATE KEY UPDATE `value` = ?, updated_at = NOW()",
                [rcon_port.toString(), rcon_port.toString()]
            );
            await db.query(
                "INSERT INTO config (`key`, `value`, updated_at) VALUES ('rcon_password', ?, NOW()) ON DUPLICATE KEY UPDATE `value` = ?, updated_at = NOW()",
                [sanitizeString(rcon_password || ''), sanitizeString(rcon_password || '')]
            );
            res.redirect('/admin/console?message=Settings updated');
        } else if (action === 'test_connection') {
            try {
                const RCON = require('../../utils/rcon').RCON;
                const testHost = sanitizeString(test_host || rcon_host);
                const testPort = parseInt(test_port || rcon_port);
                const testPass = sanitizeString(test_password || rcon_password);
                
                const rcon = new RCON(testHost, testPort, testPass);
                await rcon.connect();
                const output = await rcon.execute("list");
                rcon.disconnect();
                res.redirect(`/admin/console?message=Connection successful! Output: ${encodeURIComponent(output)}`);
            } catch (error) {
                res.redirect(`/admin/console?error=${encodeURIComponent(error.message)}`);
            }
        } else if (action === 'execute') {
            const commandTrimmed = sanitizeString(command);
            if (!commandTrimmed) {
                return res.redirect('/admin/console?error=Command cannot be empty');
            }
            
            try {
                const rcon = await getRCON();
                await rcon.connect();
                const output = await rcon.execute(commandTrimmed);
                rcon.disconnect();
                
                await db.insert('admin_log', {
                    admin: currentAdmin,
                    action: `Executed RCON command: ${commandTrimmed}`,
                    target_type: 'console',
                    ip: req.ip
                });
                
                res.redirect(`/admin/console?message=Command executed&output=${encodeURIComponent(output)}`);
            } catch (error) {
                await db.insert('admin_log', {
                    admin: currentAdmin,
                    action: `Failed RCON command: ${commandTrimmed} - Error: ${error.message}`,
                    target_type: 'console',
                    ip: req.ip
                });
                res.redirect(`/admin/console?error=${encodeURIComponent(error.message)}`);
            }
        } else {
            res.redirect('/admin/console');
        }
    } catch (error) {
        console.error('Console action error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;

