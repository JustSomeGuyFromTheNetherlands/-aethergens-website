<?php
$pageTitle = 'Home - Simple Version';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?></title>
    <link href="https://cdn.tailwindcss.com" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .bg-aether-blue { background-color: #1565C0; }
        .text-aether-blue { color: #1565C0; }
        .border-aether-blue { border-color: #1565C0; }
        .bg-light-blue { background-color: #E3F2FD; }
        .bg-sky-blue { background-color: #2196F3; }
        .bg-deep-blue { background-color: #0D47A1; }
        .fade-in { animation: fadeIn 0.5s ease-in; }
        .slide-up { animation: slideUp 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { opacity: 1; } }
    </style>
</head>
<body class="bg-white">
    <!-- Navigation -->
    <nav class="fixed w-full z-50 transition-all duration-300 bg-white shadow-md">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <a href="index.php" class="text-2xl font-bold text-aether-blue">AetherGens</a>
                <div class="flex gap-6 items-center">
                    <a href="index.php" class="text-gray-700 hover:text-aether-blue transition-colors">Home</a>
                    <a href="#features" class="text-gray-700 hover:text-aether-blue transition-colors">Features</a>
                    <a href="#staff" class="text-gray-700 hover:text-aether-blue transition-colors">Staff</a>
                    <a href="#rules" class="text-gray-700 hover:text-aether-blue transition-colors">Rules</a>
                    <a href="apply.php" class="bg-aether-blue text-white px-4 py-2 rounded-md hover:bg-deep-blue transition-colors">Apply for Staff</a>
                </div>
            </div>
        </div>
    </nav>

    <div class="pt-16">
        <!-- Hero Section -->
        <section class="bg-gradient-to-br from-light-blue to-white py-20">
            <div class="max-w-7xl mx-auto px-6 lg:px-8">
                <div class="text-center">
                    <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6 fade-in">
                        Welcome to <span class="text-aether-blue">AetherGens</span>
                    </h1>
                    <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto slide-up">
                        Discover a new world full of adventure and possibilities on AetherGens. Build, explore, and enjoy the best Minecraft experience with our custom features, friendly community, and dedicated staff team.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <div class="bg-white rounded-lg shadow-md p-6 min-w-[200px]">
                            <div class="text-3xl font-bold text-aether-blue">0</div>
                            <div class="text-gray-600">Online Players</div>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-6 min-w-[200px]">
                            <div class="text-3xl font-bold text-aether-blue">1.20+</div>
                            <div class="text-gray-600">Server Version</div>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-6 min-w-[200px]">
                            <div class="text-3xl font-bold text-aether-blue" style="color: #0D47A1 !important;">play.aethergens.com</div>
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
                    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div class="text-4xl mb-4">🏗️</div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">Custom Generators</h3>
                        <p class="text-gray-600">Advanced generator system for unique gameplay</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div class="text-4xl mb-4">💰</div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">Economy System</h3>
                        <p class="text-gray-600">Trade, buy, and sell with our robust economy</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div class="text-4xl mb-4">🎯</div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">Quests & Rewards</h3>
                        <p class="text-gray-600">Complete quests and earn amazing rewards</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div class="text-4xl mb-4">🏠</div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">Land Protection</h3>
                        <p class="text-gray-600">Protect your builds with our land claim system</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div class="text-4xl mb-4">🎨</div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">Custom Items</h3>
                        <p class="text-gray-600">Unique items and weapons to discover</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div class="text-4xl mb-4">👥</div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">Active Community</h3>
                        <p class="text-gray-600">Join our friendly and welcoming community</p>
                    </div>
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
                    <div class="flex items-start gap-4">
                        <div class="bg-aether-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                            1
                        </div>
                        <div>
                            <p class="text-gray-700">No griefing or stealing from other players</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-4">
                        <div class="bg-aether-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                            2
                        </div>
                        <div>
                            <p class="text-gray-700">Be respectful to all players and staff members</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-4">
                        <div class="bg-aether-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                            3
                        </div>
                        <div>
                            <p class="text-gray-700">No cheating, hacking, or exploiting glitches</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-4">
                        <div class="bg-aether-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                            4
                        </div>
                        <div>
                            <p class="text-gray-700">No spamming in chat or advertising other servers</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-4">
                        <div class="bg-aether-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                            5
                        </div>
                        <div>
                            <p class="text-gray-700">Keep chat appropriate and family-friendly</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-4">
                        <div class="bg-aether-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                            6
                        </div>
                        <div>
                            <p class="text-gray-700">Follow staff instructions and decisions</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="grid md:grid-cols-4 gap-8">
                <div>
                    <h3 class="text-xl font-bold mb-4">AetherGens</h3>
                    <p class="text-gray-400">The ultimate Minecraft experience with custom generators, economy, and active community.</p>
                </div>
                <div>
                    <h4 class="font-bold mb-4">Quick Links</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="index.php" class="hover:text-white transition-colors">Home</a></li>
                        <li><a href="#features" class="hover:text-white transition-colors">Features</a></li>
                        <li><a href="#staff" class="hover:text-white transition-colors">Staff</a></li>
                        <li><a href="apply.php" class="hover:text-white transition-colors">Apply</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold mb-4">Server Info</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><strong>IP:</strong> play.aethergens.com</li>
                        <li><strong>Version:</strong> 1.20+</li>
                        <li><strong>Status:</strong> <span class="text-green-400">Online</span></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold mb-4">Connect</h4>
                    <div class="flex space-x-4">
                        <a href="#" class="text-gray-400 hover:text-white transition-colors">
                            <i class="fab fa-discord text-2xl"></i>
                        </a>
                        <a href="#" class="text-gray-400 hover:text-white transition-colors">
                            <i class="fab fa-twitter text-2xl"></i>
                        </a>
                        <a href="#" class="text-gray-400 hover:text-white transition-colors">
                            <i class="fab fa-youtube text-2xl"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2025 AetherGens. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Scroll effect for navbar
        window.addEventListener('scroll', function() {
            const nav = document.querySelector('nav');
            if (window.scrollY > 20) {
                nav.classList.add('shadow-lg');
            } else {
                nav.classList.remove('shadow-lg');
            }
        });
    </script>
</body>
</html>
