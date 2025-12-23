const db = require('../database');

/**
 * Log an admin action to the database
 * @param {number} userId - The admin user ID
 * @param {string} actionType - The type of action (e.g., 'CREATE_BLOG_POST', 'DELETE_CHANGELOG')
 * @param {string} description - Description of the action
 * @param {string} targetType - Optional target type (e.g., 'blog_post', 'changelog')
 * @param {number} targetId - Optional target ID
 * @param {string} ipAddress - Optional IP address
 */
async function logAdminAction(userId, actionType, description, targetType = null, targetId = null, ipAddress = null) {
  try {
    // Get the username from the user ID
    const [users] = await db.query('SELECT username FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      console.error(`Admin user with ID ${userId} not found for logging action: ${actionType}`);
      return;
    }

    const username = users[0].username;

    // Insert the log entry
    await db.query(`
      INSERT INTO admin_log (admin, action, target_type, target_id, ip, timestamp)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [username, `${actionType}: ${description}`, targetType, targetId, ipAddress]);

  } catch (error) {
    console.error('Error logging admin action:', error);
    // Don't throw - logging failures shouldn't break the main functionality
  }
}

module.exports = {
  logAdminAction
};
