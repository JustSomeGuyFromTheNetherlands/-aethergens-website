-- Add IP ban support to bans table
ALTER TABLE `bans` 
ADD COLUMN IF NOT EXISTS `ban_type` VARCHAR(20) DEFAULT 'player' AFTER `id`,
ADD COLUMN IF NOT EXISTS `ip_address` VARCHAR(45) NULL AFTER `player_uuid`,
ADD INDEX IF NOT EXISTS `idx_ban_type` (`ban_type`),
ADD INDEX IF NOT EXISTS `idx_ip_address` (`ip_address`);

-- Create IP bans view for easier querying
CREATE OR REPLACE VIEW `ip_bans_view` AS
SELECT * FROM `bans` WHERE `ban_type` = 'ip';


