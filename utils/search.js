const { getDB } = require('../database');

/**
 * Search across all content types
 */
async function searchAll(query, limit = 50) {
    const db = getDB();
    const results = {
        news: [],
        players: [],
        bans: [],
        appeals: [],
        applications: []
    };
    
    if (!query || query.length < 2) {
        return results;
    }
    
    const searchTerm = `%${query}%`;
    
    try {
        // Search news
        results.news = await db.fetchAll(
            "SELECT id, title, content, author, created_at, 'news' as type FROM news WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC LIMIT ?",
            [searchTerm, searchTerm, limit]
        );
        
        // Search players
        results.players = await db.fetchAll(
            "SELECT id, username, rank, last_seen, 'player' as type FROM players WHERE username LIKE ? OR uuid LIKE ? ORDER BY last_seen DESC LIMIT ?",
            [searchTerm, searchTerm, limit]
        );
        
        // Search bans
        results.bans = await db.fetchAll(
            "SELECT id, player_username, reason, banned_by, ban_date, 'ban' as type FROM bans WHERE player_username LIKE ? OR reason LIKE ? OR banned_by LIKE ? ORDER BY ban_date DESC LIMIT ?",
            [searchTerm, searchTerm, searchTerm, limit]
        );
        
        // Search appeals
        results.appeals = await db.fetchAll(
            "SELECT id, player_username, appeal_text, status, created_at, 'appeal' as type FROM appeals WHERE player_username LIKE ? OR appeal_text LIKE ? ORDER BY created_at DESC LIMIT ?",
            [searchTerm, searchTerm, limit]
        );
        
        // Search applications
        results.applications = await db.fetchAll(
            "SELECT id, username, role, email, discord, status, created_at, 'application' as type FROM applications_pending WHERE username LIKE ? OR email LIKE ? OR discord LIKE ? OR role LIKE ? ORDER BY created_at DESC LIMIT ?",
            [searchTerm, searchTerm, searchTerm, searchTerm, limit]
        );
    } catch (error) {
        console.error('Search error:', error);
    }
    
    return results;
}

/**
 * Get search suggestions (autocomplete)
 */
async function getSearchSuggestions(query, limit = 10) {
    const suggestions = [];
    
    if (!query || query.length < 2) {
        return suggestions;
    }
    
    const searchTerm = `%${query}%`;
    
    try {
        const db = getDB();
        
        // Get player usernames
        const players = await db.fetchAll(
            "SELECT DISTINCT username FROM players WHERE username LIKE ? LIMIT ?",
            [searchTerm, limit]
        );
        for (const player of players) {
            suggestions.push({ text: player.username, type: 'player' });
        }
        
        // Get news titles
        const news = await db.fetchAll(
            "SELECT DISTINCT title FROM news WHERE title LIKE ? LIMIT ?",
            [searchTerm, limit]
        );
        for (const item of news) {
            suggestions.push({ text: item.title, type: 'news' });
        }
    } catch (error) {
        console.error('Search suggestions error:', error);
    }
    
    return suggestions;
}

module.exports = { searchAll, getSearchSuggestions };


