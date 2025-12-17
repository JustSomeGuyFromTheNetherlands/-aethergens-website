<?php
// Database configuration
define('DB_FILE', __DIR__ . '/../data/aethergens.db');

// Initialize database
function initDatabase() {
    try {
        // Ensure data directory exists
        $dataDir = dirname(DB_FILE);
        if (!is_dir($dataDir)) {
            mkdir($dataDir, 0755, true);
        }

        $db = new PDO('sqlite:' . DB_FILE);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Create tables
        $db->exec("
            CREATE TABLE IF NOT EXISTS server_info (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                online_players INTEGER DEFAULT 0,
                version TEXT DEFAULT '1.20+',
                description TEXT,
                server_ip TEXT DEFAULT 'play.aethergens.com',
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        $db->exec("
            CREATE TABLE IF NOT EXISTS news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                author TEXT DEFAULT 'Admin',
                image_url TEXT,
                published INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        $db->exec("
            CREATE TABLE IF NOT EXISTS changelog (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version TEXT NOT NULL,
                changes TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        $db->exec("
            CREATE TABLE IF NOT EXISTS gallery (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                image_url TEXT NOT NULL,
                description TEXT,
                category TEXT DEFAULT 'general',
                featured INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        $db->exec("
            CREATE TABLE IF NOT EXISTS shop_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                category TEXT DEFAULT 'ranks',
                tebex_id TEXT,
                image_url TEXT,
                featured INTEGER DEFAULT 0,
                active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        $db->exec("
            CREATE TABLE IF NOT EXISTS features (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                icon TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                order_index INTEGER DEFAULT 0
            )
        ");

        $db->exec("
            CREATE TABLE IF NOT EXISTS rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rule_text TEXT NOT NULL,
                order_index INTEGER DEFAULT 0
            )
        ");

        $db->exec("
            CREATE TABLE IF NOT EXISTS staff (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                color TEXT DEFAULT '#1565C0',
                order_index INTEGER DEFAULT 0
            )
        ");

        $db->exec("
            CREATE TABLE IF NOT EXISTS faq (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                order_index INTEGER DEFAULT 0
            )
        ");

        $db->exec("
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                start_date DATETIME,
                end_date DATETIME,
                image_url TEXT,
                location TEXT,
                featured INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        $db->exec("
            CREATE TABLE IF NOT EXISTS staff_ranks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                questions TEXT, -- JSON string
                open INTEGER DEFAULT 1,
                order_index INTEGER DEFAULT 0
            )
        ");

        $db->exec("
            CREATE TABLE IF NOT EXISTS staff_applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                discord TEXT,
                age INTEGER,
                minecraft_username TEXT,
                previous_staff TEXT,
                experience TEXT,
                why TEXT,
                rank_id INTEGER,
                answers TEXT, -- JSON string
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (rank_id) REFERENCES staff_ranks(id)
            )
        ");

        // Insert default data if tables are empty
        $stmt = $db->query("SELECT COUNT(*) FROM server_info");
        if ($stmt->fetchColumn() == 0) {
            $db->exec("
                INSERT INTO server_info (online_players, version, description, server_ip)
                VALUES (0, '1.20+', 'Discover a new world full of adventure and possibilities on AetherGens. Build, explore, and enjoy the best Minecraft experience with our custom features, friendly community, and dedicated staff team.', 'play.aethergens.com')
            ");
        }

        $stmt = $db->query("SELECT COUNT(*) FROM features");
        if ($stmt->fetchColumn() == 0) {
            $db->exec("
                INSERT INTO features (icon, title, description, order_index) VALUES
                ('🏗️', 'Custom Generators', 'Advanced generator system for unique gameplay', 0),
                ('💰', 'Economy System', 'Trade, buy, and sell with our robust economy', 1),
                ('🎯', 'Quests & Rewards', 'Complete quests and earn amazing rewards', 2),
                ('🏠', 'Land Protection', 'Protect your builds with our land claim system', 3),
                ('🎨', 'Custom Items', 'Unique items and weapons to discover', 4),
                ('👥', 'Active Community', 'Join our friendly and welcoming community', 5)
            ");
        }

        $stmt = $db->query("SELECT COUNT(*) FROM rules");
        if ($stmt->fetchColumn() == 0) {
            $db->exec("
                INSERT INTO rules (rule_text, order_index) VALUES
                ('No griefing or stealing from other players', 0),
                ('Be respectful to all players and staff members', 1),
                ('No cheating, hacking, or exploiting glitches', 2),
                ('No spamming in chat or advertising other servers', 3),
                ('Keep chat appropriate and family-friendly', 4),
                ('Follow staff instructions and decisions', 5)
            ");
        }

        $stmt = $db->query("SELECT COUNT(*) FROM faq");
        if ($stmt->fetchColumn() == 0) {
            $db->exec("
                INSERT INTO faq (question, answer, order_index) VALUES
                ('How do I join the server?', 'Simply connect to play.aethergens.com using Minecraft version 1.20 or higher.', 0),
                ('Is the server free to play?', 'Yes! AetherGens is completely free to play with optional cosmetic donations.', 1),
                ('What makes AetherGens different?', 'Our custom generator system, active community, and dedicated staff make us unique.', 2),
                ('How do I report a player?', 'Use /report in-game or contact a staff member directly.', 3)
            ");
        }

        $stmt = $db->query("SELECT COUNT(*) FROM staff_ranks");
        if ($stmt->fetchColumn() == 0) {
            $db->exec("
                INSERT INTO staff_ranks (name, description, questions, open, order_index) VALUES
                ('Helper', 'Entry-level staff position. Help players and moderate chat.', '[{\"question\": \"Why do you want to be a Helper?\", \"required\": true}, {\"question\": \"Do you have any previous staff experience?\", \"required\": true}]', 1, 0),
                ('Moderator', 'Moderate the server and handle player disputes.', '[{\"question\": \"Why do you want to be a Moderator?\", \"required\": true}, {\"question\": \"Describe your moderation experience.\", \"required\": true}]', 1, 1)
            ");
        }

        return $db;
    } catch (Exception $e) {
        die("Database error: " . $e->getMessage());
    }
}

// Get database connection
function getDB() {
    static $db = null;
    static $initialized = false;

    if ($db === null && !$initialized) {
        try {
            $db = initDatabase();
            $initialized = true;
        } catch (Exception $e) {
            // If database fails, return null and don't try again
            error_log("Database initialization failed: " . $e->getMessage());
            $initialized = true; // Don't try again
            return null;
        }
    }
    return $db;
}
?>
