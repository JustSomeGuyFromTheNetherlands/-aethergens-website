CREATE TABLE IF NOT EXISTS `changelog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `version` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `release_date` datetime NOT NULL,
  `is_major` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_version` (`version`),
  KEY `idx_release_date` (`release_date`),
  KEY `idx_major` (`is_major`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `changelog` (`version`, `title`, `description`, `release_date`, `is_major`) VALUES
('1.0.0', 'Initial Release', 'Complete rewrite of AetherGens CMS in Node.js with modern features and improved performance.', '2024-12-23 00:00:00', 1),
('1.0.1', 'Bug Fixes & Improvements', 'Fixed various UI bugs, improved error handling, and enhanced security features.', '2024-12-23 00:00:00', 0);
