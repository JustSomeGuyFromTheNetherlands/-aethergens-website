<?php
require_once 'includes/database.php';

$pageTitle = 'Home';
$db = getDB();

// Get data from database
$serverInfo = $db->query("SELECT * FROM server_info LIMIT 1")->fetch(PDO::FETCH_ASSOC);
$features = $db->query("SELECT * FROM features ORDER BY order_index")->fetchAll(PDO::FETCH_ASSOC);
$rules = $db->query("SELECT * FROM rules ORDER BY order_index")->fetchAll(PDO::FETCH_ASSOC);
$staff = $db->query("SELECT * FROM staff ORDER BY order_index")->fetchAll(PDO::FETCH_ASSOC);
$faq = $db->query("SELECT * FROM faq ORDER BY order_index")->fetchAll(PDO::FETCH_ASSOC);
$news = $db->query("SELECT * FROM news WHERE published = 1 ORDER BY created_at DESC LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);
$events = $db->query("SELECT * FROM events ORDER BY created_at DESC LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);

include 'includes/header.php';
?>

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-light-blue to-white py-20">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="text-center">
                <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6 fade-in">
                    Welcome to <span class="text-aether-blue">AetherGens</span>
                </h1>
                <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto slide-up">
                    <?php echo htmlspecialchars($serverInfo['description'] ?? 'Discover a new world full of adventure and possibilities.'); ?>
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                    <div class="bg-white rounded-lg shadow-md p-6 min-w-[200px]">
                        <div class="text-3xl font-bold text-aether-blue"><?php echo htmlspecialchars($serverInfo['online_players'] ?? '0'); ?></div>
                        <div class="text-gray-600">Online Players</div>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6 min-w-[200px]">
                        <div class="text-3xl font-bold text-aether-blue"><?php echo htmlspecialchars($serverInfo['version'] ?? '1.20+'); ?></div>
                        <div class="text-gray-600">Server Version</div>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6 min-w-[200px]">
                        <div class="text-3xl font-bold text-aether-blue" style="color: #0D47A1 !important;"><?php echo htmlspecialchars($serverInfo['server_ip'] ?? 'play.aethergens.com'); ?></div>
                        <div class="text-gray-600">Server IP</div>
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="https://www.minecraft.net/" target="_blank" class="bg-aether-blue text-white px-8 py-3 rounded-md hover:bg-deep-blue transition-colors font-medium">
                        <i class="fas fa-download mr-2"></i>Download Minecraft
                    </a>
                    <a href="#features" class="border-2 border-aether-blue text-aether-blue px-8 py-3 rounded-md hover:bg-aether-blue hover:text-white transition-colors font-medium">
                        <i class="fas fa-info-circle mr-2"></i>Learn More
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold text-gray-900 mb-4">Server Features</h2>
                <p class="text-xl text-gray-600">What makes AetherGens special</p>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <?php foreach ($features as $feature): ?>
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div class="text-4xl mb-4"><?php echo htmlspecialchars($feature['icon']); ?></div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2"><?php echo htmlspecialchars($feature['title']); ?></h3>
                    <p class="text-gray-600"><?php echo htmlspecialchars($feature['description']); ?></p>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-aether-blue text-white">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="grid md:grid-cols-4 gap-8 text-center">
                <div>
                    <div class="text-4xl font-bold mb-2">500+</div>
                    <div class="text-blue-100">Active Players</div>
                </div>
                <div>
                    <div class="text-4xl font-bold mb-2">24/7</div>
                    <div class="text-blue-100">Uptime</div>
                </div>
                <div>
                    <div class="text-4xl font-bold mb-2">10+</div>
                    <div class="text-blue-100">Staff Members</div>
                </div>
                <div>
                    <div class="text-4xl font-bold mb-2">5+</div>
                    <div class="text-blue-100">Years Online</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Rules Section -->
    <section id="rules" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold text-gray-900 mb-4">Server Rules</h2>
                <p class="text-xl text-gray-600">Keep the server fun and fair for everyone</p>
            </div>
            <div class="grid md:grid-cols-2 gap-6">
                <?php foreach ($rules as $index => $rule): ?>
                <div class="flex items-start gap-4">
                    <div class="bg-aether-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                        <?php echo $index + 1; ?>
                    </div>
                    <div>
                        <p class="text-gray-700"><?php echo htmlspecialchars($rule['rule_text']); ?></p>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- Staff Section -->
    <section id="staff" class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold text-gray-900 mb-4">Meet Our Staff</h2>
                <p class="text-xl text-gray-600">Dedicated team keeping the server running smoothly</p>
            </div>
            <?php if (empty($staff)): ?>
            <div class="text-center py-12">
                <p class="text-gray-500 text-lg">No staff members added yet.</p>
            </div>
            <?php else: ?>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <?php foreach ($staff as $member): ?>
                <div class="bg-white rounded-lg shadow-md p-6 text-center">
                    <div class="w-20 h-20 bg-aether-blue rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                        <?php echo strtoupper(substr($member['name'], 0, 1)); ?>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-1"><?php echo htmlspecialchars($member['name']); ?></h3>
                    <p class="text-gray-600" style="color: <?php echo htmlspecialchars($member['color']); ?> !important;">
                        <?php echo htmlspecialchars($member['role']); ?>
                    </p>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- News Section -->
    <section class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold text-gray-900 mb-4">Latest News</h2>
                <p class="text-xl text-gray-600">Stay updated with the latest server news</p>
            </div>
            <?php if (empty($news)): ?>
            <div class="text-center py-12">
                <p class="text-gray-500 text-lg">No news posts yet.</p>
            </div>
            <?php else: ?>
            <div class="grid md:grid-cols-3 gap-8">
                <?php foreach ($news as $item): ?>
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <?php if ($item['image_url']): ?>
                    <img src="<?php echo htmlspecialchars($item['image_url']); ?>" alt="<?php echo htmlspecialchars($item['title']); ?>" class="w-full h-48 object-cover">
                    <?php endif; ?>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-2"><?php echo htmlspecialchars($item['title']); ?></h3>
                        <p class="text-gray-600 mb-4"><?php echo htmlspecialchars(substr($item['content'], 0, 150)) . (strlen($item['content']) > 150 ? '...' : ''); ?></p>
                        <div class="text-sm text-gray-500">
                            By <?php echo htmlspecialchars($item['author']); ?> • <?php echo date('M j, Y', strtotime($item['created_at'])); ?>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- Events Section -->
    <section class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
                <p class="text-xl text-gray-600">Join us for exciting server events</p>
            </div>
            <?php if (empty($events)): ?>
            <div class="text-center py-12">
                <p class="text-gray-500 text-lg">No upcoming events.</p>
            </div>
            <?php else: ?>
            <div class="grid md:grid-cols-3 gap-8">
                <?php foreach ($events as $event): ?>
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <?php if ($event['image_url']): ?>
                    <img src="<?php echo htmlspecialchars($event['image_url']); ?>" alt="<?php echo htmlspecialchars($event['title']); ?>" class="w-full h-48 object-cover">
                    <?php endif; ?>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-2"><?php echo htmlspecialchars($event['title']); ?></h3>
                        <p class="text-gray-600 mb-4"><?php echo htmlspecialchars(substr($event['description'], 0, 150)) . (strlen($event['description']) > 150 ? '...' : ''); ?></p>
                        <?php if ($event['start_date']): ?>
                        <div class="text-sm text-gray-500 mb-2">
                            <i class="fas fa-calendar mr-1"></i><?php echo date('M j, Y g:i A', strtotime($event['start_date'])); ?>
                        </div>
                        <?php endif; ?>
                        <?php if ($event['location']): ?>
                        <div class="text-sm text-gray-500">
                            <i class="fas fa-map-marker-alt mr-1"></i><?php echo htmlspecialchars($event['location']); ?>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-20 bg-white">
        <div class="max-w-4xl mx-auto px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <p class="text-xl text-gray-600">Common questions about AetherGens</p>
            </div>
            <div class="space-y-6">
                <?php foreach ($faq as $item): ?>
                <div class="bg-gray-50 rounded-lg p-6">
                    <h3 class="text-lg font-bold text-gray-900 mb-2"><?php echo htmlspecialchars($item['question']); ?></h3>
                    <p class="text-gray-600"><?php echo htmlspecialchars($item['answer']); ?></p>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

<?php include 'includes/footer.php'; ?>
