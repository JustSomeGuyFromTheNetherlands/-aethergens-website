const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const bcrypt = require('bcrypt');
const { sendWelcomeEmail } = require('../../utils/mailjet');
const { validateEmail, sanitizeString } = require('../../utils/validation');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const editId = req.query.edit;
        let editUser = null;
        
        if (editId) {
            editUser = await db.fetchOne("SELECT * FROM users WHERE id = ?", [parseInt(editId)]);
        }
        
        const users = await db.fetchAll("SELECT * FROM users ORDER BY created_at DESC");
        
        res.render('admin/users', {
            pageName: 'users',
            pageTitle: 'User Management',
            pageSubtitle: 'Manage admin users and permissions',
            editUser,
            users,
            message: req.query.message,
            error: req.query.error
        });
    } catch (error) {
        console.error('Users page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const { getCurrentAdmin } = require('../../middleware/auth');
        const currentAdmin = getCurrentAdmin(req);
        const { action, user_id, username, email, password, role, active } = req.body;
        
        if (action === 'add') {
            const usernameTrimmed = sanitizeString(username);
            const emailTrimmed = email ? sanitizeString(email) : null;
            
            if (!usernameTrimmed || usernameTrimmed.length < 3) {
                return res.redirect('/admin/users?error=Username must be at least 3 characters');
            }
            
            if (emailTrimmed && !validateEmail(emailTrimmed)) {
                return res.redirect('/admin/users?error=Invalid email format');
            }
            
            if (!password || password.length < 8) {
                return res.redirect('/admin/users?error=Password must be at least 8 characters');
            }
            
            const exists = await db.fetchOne("SELECT id FROM users WHERE username = ?", [usernameTrimmed]);
            if (exists) {
                return res.redirect('/admin/users?error=username_exists');
            }
            
            const passwordHash = await bcrypt.hash(password, 10);
            const insertData = {
                username: usernameTrimmed,
                password_hash: passwordHash,
                role: sanitizeString(role || 'admin'),
                active: 1
            };
            
            // Add email if column exists and email provided
            try {
                if (emailTrimmed) {
                    insertData.email = emailTrimmed;
                }
            } catch (e) {
                // Email column might not exist, continue without it
            }
            
            const userId = await db.insert('users', insertData);
            
            // Log action
            await db.insert('admin_log', {
                admin: currentAdmin,
                action: `Added user: ${usernameTrimmed}`,
                target_type: 'user',
                target_id: userId,
                ip: req.ip
            });
            
            if (userId && emailTrimmed) {
                try {
                    await sendWelcomeEmail(emailTrimmed, usernameTrimmed, password);
                } catch (e) {
                    console.error('Failed to send welcome email:', e.message);
                }
            }
            
            res.redirect('/admin/users?message=added');
        } else if (action === 'update') {
            const updateData = {
                role: sanitizeString(role || 'admin'),
                active: active === 'on' || active === '1' || active === true ? 1 : 0
            };
            
            // Add email if provided and column exists
            if (email) {
                const emailTrimmed = sanitizeString(email);
                if (emailTrimmed && validateEmail(emailTrimmed)) {
                    try {
                        updateData.email = emailTrimmed;
                    } catch (e) {
                        // Email column might not exist
                    }
                } else if (emailTrimmed) {
                    return res.redirect('/admin/users?error=Invalid email format');
                }
            }
            
            if (password && password.length >= 8) {
                updateData.password_hash = await bcrypt.hash(password, 10);
            }
            
            await db.update('users', updateData, 'id = ?', [parseInt(user_id)]);
            
            // Log action
            await db.insert('admin_log', {
                admin: currentAdmin,
                action: `Updated user: ${user_id}`,
                target_type: 'user',
                target_id: parseInt(user_id),
                ip: req.ip
            });
            
            res.redirect('/admin/users?message=updated');
        } else if (action === 'delete') {
            const userToDelete = await db.fetchOne("SELECT username FROM users WHERE id = ?", [parseInt(user_id)]);
            
            if (!userToDelete) {
                return res.redirect('/admin/users?error=User not found');
            }
            
            // Prevent deleting yourself
            if (userToDelete.username === currentAdmin) {
                return res.redirect('/admin/users?error=Cannot delete your own account');
            }
            
            await db.delete('users', 'id = ?', [parseInt(user_id)]);
            
            // Log action
            await db.insert('admin_log', {
                admin: currentAdmin,
                action: `Deleted user: ${userToDelete.username}`,
                target_type: 'user',
                ip: req.ip
            });
            
            res.redirect('/admin/users?message=deleted');
        } else {
            res.redirect('/admin/users');
        }
    } catch (error) {
        console.error('User action error:', error);
        res.redirect('/admin/users?error=' + encodeURIComponent(error.message));
    }
});

module.exports = router;

