-- Minecraft Server CMS MySQL Database Schema
-- Production-ready with proper indexes and constraints

-- MySQL Schema for Minecraft Server CMS
-- Note: Database must already exist, this script only creates tables

-- Configuration
CREATE TABLE IF NOT EXISTS `config` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(255) NOT NULL,
    `value` TEXT,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rate Limits (for rate limiting middleware)
CREATE TABLE IF NOT EXISTS `rate_limits` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(100) NOT NULL,
    `identifier` VARCHAR(100) NOT NULL,
    `attempts` INT(11) DEFAULT 1,
    `first_attempt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `key_identifier` (`key`, `identifier`),
    KEY `idx_identifier` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users (for admin authentication)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) DEFAULT 'admin',
    `active` TINYINT(1) DEFAULT 1,
    `last_login` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `username` (`username`),
    KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Server Settings
CREATE TABLE IF NOT EXISTS `server_settings` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `server_name` VARCHAR(255) NOT NULL,
    `server_ip` VARCHAR(255) NOT NULL,
    `server_port` INT(11) DEFAULT 25565,
    `server_version` VARCHAR(50),
    `server_type` VARCHAR(50) DEFAULT 'survival',
    `max_players` INT(11) DEFAULT 100,
    `motd` TEXT,
    `status_message` VARCHAR(255) DEFAULT 'Server Online',
    `maintenance_mode` TINYINT(1) DEFAULT 0,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Players
CREATE TABLE IF NOT EXISTS `players` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(16) NOT NULL,
    `uuid` VARCHAR(36),
    `first_seen` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `last_seen` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `playtime` INT(11) UNSIGNED DEFAULT 0,
    `rank` VARCHAR(50) DEFAULT 'member',
    `banned` TINYINT(1) DEFAULT 0,
    `ban_reason` TEXT,
    `muted` TINYINT(1) DEFAULT 0,
    `mute_reason` TEXT,
    `total_deaths` INT(11) UNSIGNED DEFAULT 0,
    `total_kills` INT(11) UNSIGNED DEFAULT 0,
    `level` INT(11) UNSIGNED DEFAULT 0,
    `balance` DECIMAL(10,2) DEFAULT 0.00,
    `join_count` INT(11) UNSIGNED DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `username` (`username`),
    UNIQUE KEY `uuid` (`uuid`),
    KEY `idx_rank` (`rank`),
    KEY `idx_banned` (`banned`),
    KEY `idx_last_seen` (`last_seen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Staff
CREATE TABLE IF NOT EXISTS `staff` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(16) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `discord` VARCHAR(100),
    `permissions` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bans
CREATE TABLE IF NOT EXISTS `bans` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `ban_type` VARCHAR(20) DEFAULT 'player',
    `player_username` VARCHAR(16),
    `player_uuid` VARCHAR(36),
    `ip_address` VARCHAR(45),
    `banned_by` VARCHAR(16) NOT NULL,
    `reason` TEXT NOT NULL,
    `ban_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `expires_at` TIMESTAMP NULL,
    `active` TINYINT(1) DEFAULT 1,
    PRIMARY KEY (`id`),
    KEY `idx_player_username` (`player_username`),
    KEY `idx_active` (`active`),
    KEY `idx_expires_at` (`expires_at`),
    KEY `idx_ban_type` (`ban_type`),
    KEY `idx_ip_address` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Appeals
CREATE TABLE IF NOT EXISTS `appeals` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `ban_id` INT(11) UNSIGNED,
    `player_username` VARCHAR(16) NOT NULL,
    `player_email` VARCHAR(255),
    `appeal_text` TEXT NOT NULL,
    `status` ENUM('pending', 'accepted', 'denied') DEFAULT 'pending',
    `reviewed_by` VARCHAR(16),
    `reviewed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_ban_id` (`ban_id`),
    KEY `idx_status` (`status`),
    KEY `idx_player_username` (`player_username`),
    FOREIGN KEY (`ban_id`) REFERENCES `bans`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- News/Announcements
CREATE TABLE IF NOT EXISTS `news` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `author` VARCHAR(16) NOT NULL,
    `published` TINYINT(1) DEFAULT 0,
    `publish_date` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_published` (`published`),
    KEY `idx_publish_date` (`publish_date`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Events
CREATE TABLE IF NOT EXISTS `events` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `event_date` DATETIME NOT NULL,
    `event_type` VARCHAR(50) DEFAULT 'general',
    `status` ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'upcoming',
    `max_participants` INT(11),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_event_date` (`event_date`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Store Categories
CREATE TABLE IF NOT EXISTS `store_categories` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `icon` VARCHAR(100),
    `order_index` INT(11) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`),
    KEY `idx_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Store Items
CREATE TABLE IF NOT EXISTS `store_items` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_id` INT(11) UNSIGNED,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(10,2) NOT NULL,
    `currency` VARCHAR(10) DEFAULT 'USD',
    `command` TEXT,
    `icon_url` VARCHAR(500),
    `featured` TINYINT(1) DEFAULT 0,
    `active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_active` (`active`),
    KEY `idx_featured` (`featured`),
    FOREIGN KEY (`category_id`) REFERENCES `store_categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rules
CREATE TABLE IF NOT EXISTS `rules` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(100) NOT NULL,
    `rule_text` TEXT NOT NULL,
    `order_index` INT(11) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category`),
    KEY `idx_order` (`category`, `order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FAQs
CREATE TABLE IF NOT EXISTS `faqs` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `question` VARCHAR(500) NOT NULL,
    `answer` TEXT NOT NULL,
    `category` VARCHAR(100) DEFAULT 'general',
    `order_index` INT(11) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category`),
    KEY `idx_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Server Features
CREATE TABLE IF NOT EXISTS `features` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `icon` VARCHAR(100),
    `category` VARCHAR(100) DEFAULT 'general',
    `order_index` INT(11) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category`),
    KEY `idx_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gallery
CREATE TABLE IF NOT EXISTS `gallery` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `image_url` VARCHAR(500) NOT NULL,
    `caption` TEXT,
    `category` VARCHAR(100) DEFAULT 'general',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application Roles
CREATE TABLE IF NOT EXISTS `application_roles` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `requirements` TEXT,
    `status` ENUM('open', 'closed', 'coming_soon') DEFAULT 'open',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `role` (`role`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pending Applications
CREATE TABLE IF NOT EXISTS `applications_pending` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(100) NOT NULL,
    `username` VARCHAR(16) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `discord` VARCHAR(100) NOT NULL,
    `age` INT(11),
    `experience` TEXT,
    `status` ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    `reviewed_by` VARCHAR(16),
    `reviewed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`),
    KEY `idx_role` (`role`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Changelog Entries
CREATE TABLE IF NOT EXISTS `changelog_entries` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `version` VARCHAR(50) NOT NULL,
    `release_date` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_release_date` (`release_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Changelog Items
CREATE TABLE IF NOT EXISTS `changelog_items` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `changelog_entry_id` INT(11) UNSIGNED NOT NULL,
    `type` ENUM('New', 'Fixed', 'Changed', 'Removed') NOT NULL,
    `text` TEXT NOT NULL,
    `order_index` INT(11) DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_entry_id` (`changelog_entry_id`),
    KEY `idx_order` (`changelog_entry_id`, `order_index`),
    FOREIGN KEY (`changelog_entry_id`) REFERENCES `changelog_entries`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Server Statistics
CREATE TABLE IF NOT EXISTS `server_stats` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `stat_date` DATE NOT NULL,
    `online_players` INT(11) UNSIGNED DEFAULT 0,
    `total_players` INT(11) UNSIGNED DEFAULT 0,
    `unique_joins` INT(11) UNSIGNED DEFAULT 0,
    `peak_players` INT(11) UNSIGNED DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `stat_date` (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Log
CREATE TABLE IF NOT EXISTS `admin_log` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `admin` VARCHAR(16) NOT NULL,
    `action` VARCHAR(500) NOT NULL,
    `target_type` VARCHAR(50),
    `target_id` INT(11) UNSIGNED,
    `ip` VARCHAR(45),
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_admin` (`admin`),
    KEY `idx_timestamp` (`timestamp`),
    KEY `idx_target` (`target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Social Links
CREATE TABLE IF NOT EXISTS `social_links` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `platform` VARCHAR(50) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `active` TINYINT(1) DEFAULT 1,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `platform` (`platform`)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Discord Webhooks
CREATE TABLE IF NOT EXISTS `webhooks` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `events` TEXT,
    `active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('announcement', 'planned', 'downtime', 'unexpected', 'maintenance') DEFAULT 'announcement',
    `priority` ENUM('urgent', 'high', 'normal', 'low') DEFAULT 'normal',
    `active` TINYINT(1) DEFAULT 1,
    `start_date` TIMESTAMP NULL,
    `end_date` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_active` (`active`),
    KEY `idx_start_date` (`start_date`),
    KEY `idx_end_date` (`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

