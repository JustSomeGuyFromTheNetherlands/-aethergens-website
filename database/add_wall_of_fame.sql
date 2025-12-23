-- Create wall_of_fame table
CREATE TABLE IF NOT EXISTS `wall_of_fame` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_username` VARCHAR(16) NOT NULL,
    `achievement` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `featured` TINYINT(1) DEFAULT 0,
    `created_by` VARCHAR(16) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_player_username` (`player_username`),
    KEY `idx_featured` (`featured`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

