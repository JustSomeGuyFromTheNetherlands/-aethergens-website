<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle . ' - ' : ''; ?>AetherGens</title>
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
    <?php if (!isset($hideNav) || !$hideNav): ?>
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
    <?php endif; ?>

    <div class="<?php echo isset($hideNav) && $hideNav ? '' : 'pt-16'; ?>">
