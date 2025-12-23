-- Database Backup
-- Generated: 2025-12-23T11:38:01.153Z

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `admin_log`;
CREATE TABLE `admin_log` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `admin` varchar(16) NOT NULL,
  `action` varchar(500) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` int(11) unsigned DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_admin` (`admin`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_target` (`target_type`,`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admin_log` VALUES
('1','admin','IP banned: 62.250.14.217 (Reason: test) [RCON: Failed - getaddrinfo ENOTFOUND play.example.com]','ban','1','::1','Tue Dec 23 2025 12:21:36 GMT+0100 (Midden-Europese standaardtijd)');

DROP TABLE IF EXISTS `appeals`;
CREATE TABLE `appeals` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `ban_id` int(11) unsigned DEFAULT NULL,
  `player_username` varchar(16) NOT NULL,
  `player_email` varchar(255) DEFAULT NULL,
  `appeal_text` text NOT NULL,
  `status` enum('pending','accepted','denied') DEFAULT 'pending',
  `reviewed_by` varchar(16) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ban_id` (`ban_id`),
  KEY `idx_status` (`status`),
  KEY `idx_player_username` (`player_username`),
  CONSTRAINT `appeals_ibfk_1` FOREIGN KEY (`ban_id`) REFERENCES `bans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `application_roles`;
CREATE TABLE `application_roles` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `role` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `status` enum('open','closed','coming_soon') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `applications_pending`;
CREATE TABLE `applications_pending` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `role` varchar(100) NOT NULL,
  `username` varchar(16) NOT NULL,
  `email` varchar(255) NOT NULL,
  `discord` varchar(100) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `experience` text DEFAULT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `reviewed_by` varchar(16) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_role` (`role`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `bans`;
CREATE TABLE `bans` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `ban_type` varchar(20) DEFAULT 'player',
  `player_username` varchar(16) DEFAULT NULL,
  `player_uuid` varchar(36) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `banned_by` varchar(16) NOT NULL,
  `reason` text NOT NULL,
  `ban_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_player_username` (`player_username`),
  KEY `idx_active` (`active`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_ban_type` (`ban_type`),
  KEY `idx_ip_address` (`ip_address`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `bans` VALUES
('1','ip',NULL,NULL,'62.250.14.217','admin','test','Tue Dec 23 2025 11:21:36 GMT+0100 (Midden-Europese standaardtijd)',NULL,'1');

DROP TABLE IF EXISTS `changelog_entries`;
CREATE TABLE `changelog_entries` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `version` varchar(50) NOT NULL,
  `release_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_release_date` (`release_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `changelog_items`;
CREATE TABLE `changelog_items` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `changelog_entry_id` int(11) unsigned NOT NULL,
  `type` enum('New','Fixed','Changed','Removed') NOT NULL,
  `text` text NOT NULL,
  `order_index` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_entry_id` (`changelog_entry_id`),
  KEY `idx_order` (`changelog_entry_id`,`order_index`),
  CONSTRAINT `changelog_items_ibfk_1` FOREIGN KEY (`changelog_entry_id`) REFERENCES `changelog_entries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `config`;
CREATE TABLE `config` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `config` VALUES
('1','player_tracker_last_update','1766489792','Tue Dec 23 2025 12:36:32 GMT+0100 (Midden-Europese standaardtijd)'),
('8','rcon_host','play.example.com','Tue Dec 23 2025 12:21:36 GMT+0100 (Midden-Europese standaardtijd)'),
('9','rcon_port','2755','Tue Dec 23 2025 12:21:36 GMT+0100 (Midden-Europese standaardtijd)'),
('10','rcon_password','cheese','Tue Dec 23 2025 12:21:36 GMT+0100 (Midden-Europese standaardtijd)');

DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` datetime NOT NULL,
  `event_type` varchar(50) DEFAULT 'general',
  `status` enum('upcoming','active','completed','cancelled') DEFAULT 'upcoming',
  `max_participants` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_event_date` (`event_date`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `faqs`;
CREATE TABLE `faqs` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `question` varchar(500) NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(100) DEFAULT 'general',
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `features`;
CREATE TABLE `features` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT 'general',
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `gallery`;
CREATE TABLE `gallery` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `image_url` varchar(500) NOT NULL,
  `caption` text DEFAULT NULL,
  `category` varchar(100) DEFAULT 'general',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `news`;
CREATE TABLE `news` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `author` varchar(16) NOT NULL,
  `published` tinyint(1) DEFAULT 0,
  `publish_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_published` (`published`),
  KEY `idx_publish_date` (`publish_date`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `news` VALUES
('1','test','testtesttesttest','admin','1','Tue Dec 23 2025 11:05:32 GMT+0100 (Midden-Europese standaardtijd)','Tue Dec 23 2025 12:05:32 GMT+0100 (Midden-Europese standaardtijd)','Tue Dec 23 2025 12:05:32 GMT+0100 (Midden-Europese standaardtijd)');

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('announcement','planned','downtime','unexpected','maintenance') DEFAULT 'announcement',
  `priority` enum('urgent','high','normal','low') DEFAULT 'normal',
  `active` tinyint(1) DEFAULT 1,
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_active` (`active`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `players`;
CREATE TABLE `players` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(16) NOT NULL,
  `uuid` varchar(36) DEFAULT NULL,
  `first_seen` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_seen` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `playtime` int(11) unsigned DEFAULT 0,
  `rank` varchar(50) DEFAULT 'member',
  `banned` tinyint(1) DEFAULT 0,
  `ban_reason` text DEFAULT NULL,
  `muted` tinyint(1) DEFAULT 0,
  `mute_reason` text DEFAULT NULL,
  `total_deaths` int(11) unsigned DEFAULT 0,
  `total_kills` int(11) unsigned DEFAULT 0,
  `level` int(11) unsigned DEFAULT 0,
  `balance` decimal(10,2) DEFAULT 0.00,
  `join_count` int(11) unsigned DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `idx_rank` (`rank`),
  KEY `idx_banned` (`banned`),
  KEY `idx_last_seen` (`last_seen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `rate_limits`;
CREATE TABLE `rate_limits` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `identifier` varchar(100) NOT NULL,
  `attempts` int(11) DEFAULT 1,
  `first_attempt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_identifier` (`key`,`identifier`),
  KEY `idx_identifier` (`identifier`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `rate_limits` VALUES
('1','login','::1','2','Tue Dec 23 2025 12:08:43 GMT+0100 (Midden-Europese standaardtijd)','Tue Dec 23 2025 12:17:34 GMT+0100 (Midden-Europese standaardtijd)');

DROP TABLE IF EXISTS `rules`;
CREATE TABLE `rules` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `category` varchar(100) NOT NULL,
  `rule_text` text NOT NULL,
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_order` (`category`,`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `server_settings`;
CREATE TABLE `server_settings` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `server_name` varchar(255) NOT NULL,
  `server_ip` varchar(255) NOT NULL,
  `server_port` int(11) DEFAULT 25565,
  `server_version` varchar(50) DEFAULT NULL,
  `server_type` varchar(50) DEFAULT 'survival',
  `max_players` int(11) DEFAULT 100,
  `motd` text DEFAULT NULL,
  `status_message` varchar(255) DEFAULT 'Server Online',
  `maintenance_mode` tinyint(1) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `server_settings` VALUES
('1','Minecraft Server','play.example.com','25565',NULL,'survival','100',NULL,'Server Online','0','Tue Dec 23 2025 11:46:30 GMT+0100 (Midden-Europese standaardtijd)');

DROP TABLE IF EXISTS `server_stats`;
CREATE TABLE `server_stats` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `stat_date` date NOT NULL,
  `online_players` int(11) unsigned DEFAULT 0,
  `total_players` int(11) unsigned DEFAULT 0,
  `unique_joins` int(11) unsigned DEFAULT 0,
  `peak_players` int(11) unsigned DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `stat_date` (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `social_links`;
CREATE TABLE `social_links` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `platform` varchar(50) NOT NULL,
  `url` varchar(500) NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `platform` (`platform`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(16) NOT NULL,
  `role` varchar(50) NOT NULL,
  `discord` varchar(100) DEFAULT NULL,
  `permissions` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `store_categories`;
CREATE TABLE `store_categories` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `store_items`;
CREATE TABLE `store_items` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(11) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'USD',
  `command` text DEFAULT NULL,
  `icon_url` varchar(500) DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_active` (`active`),
  KEY `idx_featured` (`featured`),
  CONSTRAINT `store_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `store_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'admin',
  `active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` VALUES
('1','admin','$2b$10$cUHyNPORu0HezbgUyRI6sOTBhhgQWXWAxwxYY9GPJue/NG2sqEG3e','admin','1','Tue Dec 23 2025 11:17:34 GMT+0100 (Midden-Europese standaardtijd)','Tue Dec 23 2025 11:52:25 GMT+0100 (Midden-Europese standaardtijd)','Tue Dec 23 2025 12:17:34 GMT+0100 (Midden-Europese standaardtijd)');

DROP TABLE IF EXISTS `webhooks`;
CREATE TABLE `webhooks` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `url` varchar(500) NOT NULL,
  `events` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
