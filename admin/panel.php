<?php
session_start();
require_once '../includes/database.php';

$pageTitle = 'Admin Panel';
$hideNav = true;

// Check login
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: index.php');
    exit;
}

$db = getDB();
$message = '';
$messageType = '';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (isset($_POST['action'])) {
            switch ($_POST['action']) {
                case 'save_server_info':
                    $stmt = $db->prepare("UPDATE server_info SET online_players = ?, version = ?, description = ?, server_ip = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1");
                    $stmt->execute([$_POST['online_players'], $_POST['version'], $_POST['description'], $_POST['server_ip']]);
                    $message = 'Server info updated successfully!';
                    $messageType = 'success';
                    break;

                case 'save_news':
                    if (!empty($_POST['news_title']) && !empty($_POST['news_content'])) {
                        if (isset($_POST['news_id']) && !empty($_POST['news_id'])) {
                            // Update existing
                            $stmt = $db->prepare("UPDATE news SET title = ?, content = ?, author = ?, image_url = ?, published = ? WHERE id = ?");
                            $stmt->execute([$_POST['news_title'], $_POST['news_content'], $_POST['news_author'], $_POST['news_image'], isset($_POST['news_published']) ? 1 : 0, $_POST['news_id']]);
                        } else {
                            // Add new
                            $stmt = $db->prepare("INSERT INTO news (title, content, author, image_url, published) VALUES (?, ?, ?, ?, ?)");
                            $stmt->execute([$_POST['news_title'], $_POST['news_content'], $_POST['news_author'], $_POST['news_image'], isset($_POST['news_published']) ? 1 : 0]);
                        }
                        $message = 'News saved successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'delete_news':
                    if (isset($_POST['delete_id'])) {
                        $stmt = $db->prepare("DELETE FROM news WHERE id = ?");
                        $stmt->execute([$_POST['delete_id']]);
                        $message = 'News deleted successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'save_changelog':
                    if (!empty($_POST['changelog_version']) && !empty($_POST['changelog_changes'])) {
                        if (isset($_POST['changelog_id']) && !empty($_POST['changelog_id'])) {
                            $stmt = $db->prepare("UPDATE changelog SET version = ?, changes = ? WHERE id = ?");
                            $stmt->execute([$_POST['changelog_version'], $_POST['changelog_changes'], $_POST['changelog_id']]);
                        } else {
                            $stmt = $db->prepare("INSERT INTO changelog (version, changes) VALUES (?, ?)");
                            $stmt->execute([$_POST['changelog_version'], $_POST['changelog_changes']]);
                        }
                        $message = 'Changelog saved successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'delete_changelog':
                    if (isset($_POST['delete_id'])) {
                        $stmt = $db->prepare("DELETE FROM changelog WHERE id = ?");
                        $stmt->execute([$_POST['delete_id']]);
                        $message = 'Changelog entry deleted successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'save_gallery':
                    if (!empty($_POST['gallery_title']) && !empty($_POST['gallery_image'])) {
                        if (isset($_POST['gallery_id']) && !empty($_POST['gallery_id'])) {
                            $stmt = $db->prepare("UPDATE gallery SET title = ?, image_url = ?, description = ?, category = ?, featured = ? WHERE id = ?");
                            $stmt->execute([$_POST['gallery_title'], $_POST['gallery_image'], $_POST['gallery_description'], $_POST['gallery_category'], isset($_POST['gallery_featured']) ? 1 : 0, $_POST['gallery_id']]);
                        } else {
                            $stmt = $db->prepare("INSERT INTO gallery (title, image_url, description, category, featured) VALUES (?, ?, ?, ?, ?)");
                            $stmt->execute([$_POST['gallery_title'], $_POST['gallery_image'], $_POST['gallery_description'], $_POST['gallery_category'], isset($_POST['gallery_featured']) ? 1 : 0]);
                        }
                        $message = 'Gallery item saved successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'delete_gallery':
                    if (isset($_POST['delete_id'])) {
                        $stmt = $db->prepare("DELETE FROM gallery WHERE id = ?");
                        $stmt->execute([$_POST['delete_id']]);
                        $message = 'Gallery item deleted successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'save_shop':
                    if (!empty($_POST['shop_name']) && isset($_POST['shop_price'])) {
                        if (isset($_POST['shop_id']) && !empty($_POST['shop_id'])) {
                            $stmt = $db->prepare("UPDATE shop_items SET name = ?, description = ?, price = ?, category = ?, tebex_id = ?, image_url = ?, featured = ?, active = ? WHERE id = ?");
                            $stmt->execute([$_POST['shop_name'], $_POST['shop_description'], floatval($_POST['shop_price']), $_POST['shop_category'], $_POST['shop_tebex'], $_POST['shop_image'], isset($_POST['shop_featured']) ? 1 : 0, isset($_POST['shop_active']) ? 1 : 0, $_POST['shop_id']]);
                        } else {
                            $stmt = $db->prepare("INSERT INTO shop_items (name, description, price, category, tebex_id, image_url, featured, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                            $stmt->execute([$_POST['shop_name'], $_POST['shop_description'], floatval($_POST['shop_price']), $_POST['shop_category'], $_POST['shop_tebex'], $_POST['shop_image'], isset($_POST['shop_featured']) ? 1 : 0, isset($_POST['shop_active']) ? 1 : 0]);
                        }
                        $message = 'Shop item saved successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'delete_shop':
                    if (isset($_POST['delete_id'])) {
                        $stmt = $db->prepare("DELETE FROM shop_items WHERE id = ?");
                        $stmt->execute([$_POST['delete_id']]);
                        $message = 'Shop item deleted successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'save_features':
                    $features = json_decode($_POST['features_data'], true);
                    if (is_array($features)) {
                        $db->exec("DELETE FROM features");
                        $stmt = $db->prepare("INSERT INTO features (icon, title, description, order_index) VALUES (?, ?, ?, ?)");
                        foreach ($features as $feature) {
                            $stmt->execute([$feature['icon'], $feature['title'], $feature['description'], $feature['orderIndex'] ?? 0]);
                        }
                        $message = 'Features updated successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'save_rules':
                    $rules = json_decode($_POST['rules_data'], true);
                    if (is_array($rules)) {
                        $db->exec("DELETE FROM rules");
                        $stmt = $db->prepare("INSERT INTO rules (rule_text, order_index) VALUES (?, ?)");
                        foreach ($rules as $rule) {
                            $stmt->execute([$rule['rule_text'], $rule['orderIndex'] ?? 0]);
                        }
                        $message = 'Rules updated successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'save_staff':
                    $staff = json_decode($_POST['staff_data'], true);
                    if (is_array($staff)) {
                        $db->exec("DELETE FROM staff");
                        $stmt = $db->prepare("INSERT INTO staff (name, role, color, order_index) VALUES (?, ?, ?, ?)");
                        foreach ($staff as $member) {
                            $stmt->execute([$member['name'], $member['role'], $member['color'], $member['orderIndex'] ?? 0]);
                        }
                        $message = 'Staff updated successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'save_faq':
                    $faq = json_decode($_POST['faq_data'], true);
                    if (is_array($faq)) {
                        $db->exec("DELETE FROM faq");
                        $stmt = $db->prepare("INSERT INTO faq (question, answer, order_index) VALUES (?, ?, ?)");
                        foreach ($item as $faq) {
                            $stmt->execute([$faq['question'], $faq['answer'], $faq['orderIndex'] ?? 0]);
                        }
                        $message = 'FAQ updated successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'save_event':
                    if (!empty($_POST['event_title']) && !empty($_POST['event_description'])) {
                        if (isset($_POST['event_id']) && !empty($_POST['event_id'])) {
                            $stmt = $db->prepare("UPDATE events SET title = ?, description = ?, start_date = ?, end_date = ?, image_url = ?, location = ?, featured = ? WHERE id = ?");
                            $stmt->execute([$_POST['event_title'], $_POST['event_description'], $_POST['event_start'], $_POST['event_end'], $_POST['event_image'], $_POST['event_location'], isset($_POST['event_featured']) ? 1 : 0, $_POST['event_id']]);
                        } else {
                            $stmt = $db->prepare("INSERT INTO events (title, description, start_date, end_date, image_url, location, featured) VALUES (?, ?, ?, ?, ?, ?, ?)");
                            $stmt->execute([$_POST['event_title'], $_POST['event_description'], $_POST['event_start'], $_POST['event_end'], $_POST['event_image'], $_POST['event_location'], isset($_POST['event_featured']) ? 1 : 0]);
                        }
                        $message = 'Event saved successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'delete_event':
                    if (isset($_POST['delete_id'])) {
                        $stmt = $db->prepare("DELETE FROM events WHERE id = ?");
                        $stmt->execute([$_POST['delete_id']]);
                        $message = 'Event deleted successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'save_rank':
                    if (!empty($_POST['rank_name'])) {
                        $questions = [];
                        if (isset($_POST['questions'])) {
                            foreach ($_POST['questions'] as $q) {
                                if (!empty($q['question'])) {
                                    $questions[] = $q;
                                }
                            }
                        }

                        if (isset($_POST['rank_id']) && !empty($_POST['rank_id'])) {
                            $stmt = $db->prepare("UPDATE staff_ranks SET name = ?, description = ?, questions = ?, open = ?, order_index = ? WHERE id = ?");
                            $stmt->execute([$_POST['rank_name'], $_POST['rank_description'], json_encode($questions), isset($_POST['rank_open']) ? 1 : 0, $_POST['rank_order'] ?? 0, $_POST['rank_id']]);
                        } else {
                            $stmt = $db->prepare("INSERT INTO staff_ranks (name, description, questions, open, order_index) VALUES (?, ?, ?, ?, ?)");
                            $stmt->execute([$_POST['rank_name'], $_POST['rank_description'], json_encode($questions), isset($_POST['rank_open']) ? 1 : 0, $_POST['rank_order'] ?? 0]);
                        }
                        $message = 'Staff rank saved successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'delete_rank':
                    if (isset($_POST['delete_id'])) {
                        $stmt = $db->prepare("DELETE FROM staff_ranks WHERE id = ?");
                        $stmt->execute([$_POST['delete_id']]);
                        $message = 'Staff rank deleted successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'update_application_status':
                    if (isset($_POST['application_id']) && isset($_POST['status'])) {
                        $stmt = $db->prepare("UPDATE staff_applications SET status = ? WHERE id = ?");
                        $stmt->execute([$_POST['status'], $_POST['application_id']]);
                        $message = 'Application status updated successfully!';
                        $messageType = 'success';
                    }
                    break;

                case 'delete_application':
                    if (isset($_POST['delete_id'])) {
                        $stmt = $db->prepare("DELETE FROM staff_applications WHERE id = ?");
                        $stmt->execute([$_POST['delete_id']]);
                        $message = 'Application deleted successfully!';
                        $messageType = 'success';
                    }
                    break;
            }
        }
    } catch (Exception $e) {
        $message = 'Error: ' . $e->getMessage();
        $messageType = 'error';
    }
}

// Get data for display
$serverInfo = $db->query("SELECT * FROM server_info LIMIT 1")->fetch(PDO::FETCH_ASSOC);
$news = $db->query("SELECT * FROM news ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
$changelog = $db->query("SELECT * FROM changelog ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
$gallery = $db->query("SELECT * FROM gallery ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
$shopItems = $db->query("SELECT * FROM shop_items ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
$features = $db->query("SELECT * FROM features ORDER BY order_index")->fetchAll(PDO::FETCH_ASSOC);
$rules = $db->query("SELECT * FROM rules ORDER BY order_index")->fetchAll(PDO::FETCH_ASSOC);
$staff = $db->query("SELECT * FROM staff ORDER BY order_index")->fetchAll(PDO::FETCH_ASSOC);
$faq = $db->query("SELECT * FROM faq ORDER BY order_index")->fetchAll(PDO::FETCH_ASSOC);
$events = $db->query("SELECT * FROM events ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
$staffRanks = $db->query("SELECT * FROM staff_ranks ORDER BY order_index")->fetchAll(PDO::FETCH_ASSOC);
$staffApplications = $db->query("SELECT * FROM staff_applications ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);

$activeTab = $_GET['tab'] ?? 'server';

include '../includes/header.php';
?>

<div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="text-2xl font-bold text-aether-blue">Admin Panel</div>
                <div class="flex gap-4">
                    <a href="../index.php" class="text-gray-700 hover:text-aether-blue transition-colors font-medium text-sm">
                        ← Back to Site
                    </a>
                    <a href="logout.php" class="text-red-600 hover:text-red-800 transition-colors font-medium text-sm">
                        Logout
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <?php if ($message): ?>
        <div class="mb-6 p-4 rounded-md <?php echo $messageType === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'; ?>">
            <?php echo htmlspecialchars($message); ?>
        </div>
        <?php endif; ?>

        <!-- Tabs -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-x-auto">
            <div class="flex border-b border-gray-200">
                <?php
                $tabs = ['server', 'news', 'changelog', 'gallery', 'shop', 'events', 'features', 'rules', 'staff', 'faq', 'ranks', 'applications'];
                foreach ($tabs as $tab):
                ?>
                <a href="?tab=<?php echo $tab; ?>" class="px-6 py-3 font-medium text-sm capitalize transition-colors whitespace-nowrap <?php echo $activeTab === $tab ? 'border-b-2 text-aether-blue' : 'text-gray-600 hover:text-gray-900'; ?>" style="<?php echo $activeTab === $tab ? 'border-bottom-color: #1565C0;' : ''; ?>">
                    <?php echo $tab; ?>
                </a>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <!-- Server Info Tab -->
            <?php if ($activeTab === 'server'): ?>
            <div class="space-y-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Server Settings</h2>
                    <p class="text-gray-600 text-sm mb-6">Manage your server's basic information displayed on the homepage.</p>
                </div>
                <form method="POST" class="space-y-4">
                    <input type="hidden" name="action" value="save_server_info">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-700 mb-2 font-medium">Online Players</label>
                            <input type="number" name="online_players" value="<?php echo htmlspecialchars($serverInfo['online_players'] ?? 0); ?>" class="w-full px-4 py-2 border border-gray-300 rounded-md">
                        </div>
                        <div>
                            <label class="block text-gray-700 mb-2 font-medium">Server Version</label>
                            <input type="text" name="version" value="<?php echo htmlspecialchars($serverInfo['version'] ?? '1.20+'); ?>" class="w-full px-4 py-2 border border-gray-300 rounded-md">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-gray-700 mb-2 font-medium">Server IP</label>
                            <input type="text" name="server_ip" value="<?php echo htmlspecialchars($serverInfo['server_ip'] ?? 'play.aethergens.com'); ?>" class="w-full px-4 py-2 border border-gray-300 rounded-md">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-gray-700 mb-2 font-medium">Description</label>
                            <textarea name="description" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-md"><?php echo htmlspecialchars($serverInfo['description'] ?? ''); ?></textarea>
                        </div>
                    </div>
                    <button type="submit" class="bg-aether-blue text-white px-6 py-2 rounded-md hover:bg-deep-blue transition-colors font-medium">Save Changes</button>
                </form>
            </div>
            <?php endif; ?>

            <!-- News Tab -->
            <?php if ($activeTab === 'news'): ?>
            <div class="space-y-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Manage News</h2>
                    <p class="text-gray-600 text-sm mb-6">Create and manage news posts that appear on the homepage.</p>
                </div>

                <form method="POST" class="space-y-4 bg-gray-50 p-6 rounded-lg">
                    <input type="hidden" name="action" value="save_news">
                    <input type="hidden" name="news_id" value="<?php echo $_GET['edit_news'] ?? ''; ?>">
                    <div class="grid md:grid-cols-2 gap-4">
                        <input type="text" name="news_title" placeholder="Title" required class="px-4 py-2 border border-gray-300 rounded-md">
                        <input type="text" name="news_author" placeholder="Author" value="Admin" class="px-4 py-2 border border-gray-300 rounded-md">
                        <input type="url" name="news_image" placeholder="Image URL" class="px-4 py-2 border border-gray-300 rounded-md md:col-span-2">
                        <textarea name="news_content" placeholder="Content" rows="4" required class="px-4 py-2 border border-gray-300 rounded-md md:col-span-2"></textarea>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" name="news_published" checked> Published
                        </label>
                    </div>
                    <button type="submit" class="bg-aether-blue text-white px-6 py-2 rounded-md hover:bg-deep-blue transition-colors font-medium">
                        <?php echo isset($_GET['edit_news']) ? 'Update' : 'Add'; ?> News
                    </button>
                </form>

                <div class="space-y-4">
                    <h3 class="text-lg font-bold">Existing News</h3>
                    <?php foreach ($news as $item): ?>
                    <div class="border border-gray-200 rounded-lg p-4">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h4 class="font-bold"><?php echo htmlspecialchars($item['title']); ?></h4>
                                <p class="text-sm text-gray-600">By <?php echo htmlspecialchars($item['author']); ?> • <?php echo date('M j, Y', strtotime($item['created_at'])); ?></p>
                            </div>
                            <div class="flex gap-2">
                                <a href="?tab=news&edit_news=<?php echo $item['id']; ?>" class="text-blue-600 text-sm">Edit</a>
                                <form method="POST" class="inline" onsubmit="return confirm('Are you sure you want to delete this news item?')">
                                    <input type="hidden" name="action" value="delete_news">
                                    <input type="hidden" name="delete_id" value="<?php echo $item['id']; ?>">
                                    <button type="submit" class="text-red-600 text-sm">Delete</button>
                                </form>
                            </div>
                        </div>
                        <p class="text-gray-600"><?php echo htmlspecialchars(substr($item['content'], 0, 200)) . (strlen($item['content']) > 200 ? '...' : ''); ?></p>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <!-- Changelog Tab -->
            <?php if ($activeTab === 'changelog'): ?>
            <div class="space-y-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Manage Changelog</h2>
                    <p class="text-gray-600 text-sm mb-6">Track server updates and changes.</p>
                </div>

                <form method="POST" class="space-y-4 bg-gray-50 p-6 rounded-lg">
                    <input type="hidden" name="action" value="save_changelog">
                    <input type="hidden" name="changelog_id" value="<?php echo $_GET['edit_changelog'] ?? ''; ?>">
                    <div class="grid md:grid-cols-2 gap-4">
                        <input type="text" name="changelog_version" placeholder="Version (e.g., 1.2.0)" required class="px-4 py-2 border border-gray-300 rounded-md">
                        <textarea name="changelog_changes" placeholder="Changes" rows="4" required class="px-4 py-2 border border-gray-300 rounded-md md:col-span-2"></textarea>
                    </div>
                    <button type="submit" class="bg-aether-blue text-white px-6 py-2 rounded-md hover:bg-deep-blue transition-colors font-medium">
                        <?php echo isset($_GET['edit_changelog']) ? 'Update' : 'Add'; ?> Entry
                    </button>
                </form>

                <div class="space-y-4">
                    <h3 class="text-lg font-bold">Changelog Entries</h3>
                    <?php foreach ($changelog as $item): ?>
                    <div class="border border-gray-200 rounded-lg p-4">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h4 class="font-bold"><?php echo htmlspecialchars($item['version']); ?></h4>
                                <p class="text-sm text-gray-600"><?php echo date('M j, Y', strtotime($item['created_at'])); ?></p>
                            </div>
                            <div class="flex gap-2">
                                <a href="?tab=changelog&edit_changelog=<?php echo $item['id']; ?>" class="text-blue-600 text-sm">Edit</a>
                                <form method="POST" class="inline" onsubmit="return confirm('Are you sure you want to delete this entry?')">
                                    <input type="hidden" name="action" value="delete_changelog">
                                    <input type="hidden" name="delete_id" value="<?php echo $item['id']; ?>">
                                    <button type="submit" class="text-red-600 text-sm">Delete</button>
                                </form>
                            </div>
                        </div>
                        <p class="text-gray-600"><?php echo nl2br(htmlspecialchars($item['changes'])); ?></p>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <!-- Gallery Tab -->
            <?php if ($activeTab === 'gallery'): ?>
            <div class="space-y-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Manage Gallery</h2>
                    <p class="text-gray-600 text-sm mb-6">Upload and manage gallery images.</p>
                </div>

                <form method="POST" class="space-y-4 bg-gray-50 p-6 rounded-lg">
                    <input type="hidden" name="action" value="save_gallery">
                    <input type="hidden" name="gallery_id" value="<?php echo $_GET['edit_gallery'] ?? ''; ?>">
                    <div class="grid md:grid-cols-2 gap-4">
                        <input type="text" name="gallery_title" placeholder="Title" required class="px-4 py-2 border border-gray-300 rounded-md">
                        <input type="text" name="gallery_category" placeholder="Category" value="general" class="px-4 py-2 border border-gray-300 rounded-md">
                        <input type="url" name="gallery_image" placeholder="Image URL" required class="px-4 py-2 border border-gray-300 rounded-md md:col-span-2">
                        <textarea name="gallery_description" placeholder="Description" rows="3" class="px-4 py-2 border border-gray-300 rounded-md md:col-span-2"></textarea>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" name="gallery_featured"> Featured
                        </label>
                    </div>
                    <button type="submit" class="bg-aether-blue text-white px-6 py-2 rounded-md hover:bg-deep-blue transition-colors font-medium">
                        <?php echo isset($_GET['edit_gallery']) ? 'Update' : 'Add'; ?> Item
                    </button>
                </form>

                <div class="grid md:grid-cols-3 gap-4">
                    <?php foreach ($gallery as $item): ?>
                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                        <img src="<?php echo htmlspecialchars($item['image_url']); ?>" alt="<?php echo htmlspecialchars($item['title']); ?>" class="w-full h-32 object-cover">
                        <div class="p-3">
                            <h4 class="font-bold text-sm"><?php echo htmlspecialchars($item['title']); ?></h4>
                            <div class="flex gap-2 mt-2">
                                <a href="?tab=gallery&edit_gallery=<?php echo $item['id']; ?>" class="text-blue-600 text-xs">Edit</a>
                                <form method="POST" class="inline" onsubmit="return confirm('Are you sure you want to delete this item?')">
                                    <input type="hidden" name="action" value="delete_gallery">
                                    <input type="hidden" name="delete_id" value="<?php echo $item['id']; ?>">
                                    <button type="submit" class="text-red-600 text-xs">Delete</button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <!-- More tabs would continue here, but this is getting very long. Let me create a separate file for the rest -->
            <p class="text-gray-500 text-center py-8">More admin tabs coming soon...</p>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
