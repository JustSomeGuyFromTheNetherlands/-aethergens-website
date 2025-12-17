<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle . ' - ' : ''; ?>AetherGens</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff; color: #1f2937; line-height: 1.6; }
        
        /* Colors */
        .bg-aether-blue { background-color: #1565C0 !important; }
        .text-aether-blue { color: #1565C0 !important; }
        .border-aether-blue { border-color: #1565C0 !important; }
        .bg-light-blue { background-color: #E3F2FD !important; }
        .bg-sky-blue { background-color: #2196F3 !important; }
        .bg-deep-blue { background-color: #0D47A1 !important; }
        .bg-white { background-color: #ffffff !important; }
        .bg-gray-50 { background-color: #f9fafb !important; }
        .bg-gray-900 { background-color: #111827 !important; }
        .text-white { color: #ffffff !important; }
        .text-gray-400 { color: #9ca3af !important; }
        .text-gray-600 { color: #4b5563 !important; }
        .text-gray-700 { color: #374151 !important; }
        .text-gray-900 { color: #111827 !important; }
        .text-green-400 { color: #4ade80 !important; }
        
        /* Layout */
        .max-w-7xl { max-width: 1280px; margin: 0 auto; }
        .max-w-4xl { max-width: 896px; margin: 0 auto; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .px-8 { padding-left: 2rem; padding-right: 2rem; }
        .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
        .py-16 { padding-top: 4rem; padding-bottom: 4rem; }
        .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
        .pt-16 { padding-top: 4rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mb-12 { margin-bottom: 3rem; }
        .mb-16 { margin-bottom: 4rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-8 { margin-top: 2rem; }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-8 { gap: 2rem; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .space-x-4 > * + * { margin-left: 1rem; }
        
        /* Flexbox & Grid */
        .flex { display: flex; }
        .grid { display: grid; }
        .items-center { align-items: center; }
        .items-start { align-items: flex-start; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .flex-col { flex-direction: column; }
        .flex-shrink-0 { flex-shrink: 0; }
        .md\:grid-cols-2 { }
        .md\:grid-cols-3 { }
        .md\:grid-cols-4 { }
        .lg\:grid-cols-3 { }
        .md\:flex-row { }
        .md\:col-span-2 { }
        
        @media (min-width: 768px) {
            .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .md\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .md\:flex-row { flex-direction: row; }
            .md\:col-span-2 { grid-column: span 2 / span 2; }
            .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .lg\:px-8 { padding-left: 2rem; padding-right: 2rem; }
        }
        
        /* Typography */
        h1, h2, h3, h4, h5, h6 { font-weight: 700; line-height: 1.2; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; font-weight: 700; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; font-weight: 700; }
        .text-5xl { font-size: 3rem; line-height: 1.1; font-weight: 800; letter-spacing: -0.02em; }
        .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .text-center { text-align: center; }
        
        /* Better Text Colors */
        .text-gray-900 { color: #111827; }
        .text-gray-700 { color: #374151; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        
        /* Navigation */
        nav { 
            position: fixed; 
            width: 100%; 
            z-index: 50; 
            background-color: rgba(255, 255, 255, 0.98); 
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); 
            transition: all 0.3s ease;
            border-bottom: 1px solid rgba(21, 101, 192, 0.1);
        }
        nav.scrolled { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); }
        nav .flex { height: 4rem; }
        nav a { 
            text-decoration: none; 
            transition: all 0.2s ease;
            position: relative;
        }
        nav a:hover { color: #1565C0; transform: translateY(-1px); }
        nav a:not(.bg-aether-blue):hover::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            right: 0;
            height: 2px;
            background-color: #1565C0;
            border-radius: 2px;
        }
        
        /* Buttons */
        .bg-aether-blue { 
            background: linear-gradient(135deg, #1565C0 0%, #1976D2 100%);
            color: #ffffff; 
            padding: 0.625rem 1.5rem; 
            border-radius: 0.5rem; 
            display: inline-block; 
            text-decoration: none; 
            font-weight: 600; 
            transition: all 0.3s ease;
            border: none; 
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(21, 101, 192, 0.25);
            position: relative;
            overflow: hidden;
        }
        .bg-aether-blue::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }
        .bg-aether-blue:hover::before { left: 100%; }
        .bg-aether-blue:hover { 
            background: linear-gradient(135deg, #0D47A1 0%, #1565C0 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(21, 101, 192, 0.35);
        }
        .bg-aether-blue:active { transform: translateY(0); }
        button.bg-aether-blue { width: auto; }
        
        /* Cards & Sections */
        .rounded-lg { border-radius: 0.75rem; }
        .rounded-md { border-radius: 0.5rem; }
        .rounded-full { border-radius: 9999px; }
        .shadow-md { 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            transition: all 0.3s ease;
        }
        .shadow-lg { 
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
        }
        .border { border-width: 1px; border-style: solid; }
        .border-2 { border-width: 2px; border-style: solid; }
        .border-t { border-top-width: 1px; border-top-style: solid; }
        .border-gray-200 { border-color: #e5e7eb; }
        .border-gray-300 { border-color: #d1d5db; }
        .border-gray-800 { border-color: #1f2937; }
        
        /* Enhanced Cards */
        .bg-white.rounded-lg.shadow-md {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(21, 101, 192, 0.05);
        }
        .bg-white.rounded-lg.shadow-md:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
            border-color: rgba(21, 101, 192, 0.2);
        }
        
        /* Hero Section */
        .bg-gradient-to-br { 
            background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #ffffff 100%);
            position: relative;
            overflow: hidden;
        }
        .bg-gradient-to-br::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 50%, rgba(21, 101, 192, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(33, 150, 243, 0.1) 0%, transparent 50%);
            pointer-events: none;
        }
        
        /* Animations */
        .fade-in { animation: fadeIn 0.5s ease-in; }
        .slide-up { animation: slideUp 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { opacity: 1; } }
        
        /* Hover Effects */
        .hover\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .hover\:text-white:hover { color: #ffffff !important; }
        .transition-shadow { transition: box-shadow 0.2s; }
        .transition-colors { transition: color 0.2s, background-color 0.2s, border-color 0.2s; }
        
        /* Forms */
        input[type="text"], input[type="email"], input[type="number"], input[type="password"], input[type="url"], input[type="datetime-local"], textarea, select {
            width: 100%; 
            padding: 0.75rem 1rem; 
            border: 2px solid #e5e7eb; 
            border-radius: 0.5rem; 
            font-size: 1rem; 
            transition: all 0.3s ease;
            background-color: #ffffff;
        }
        input:focus, textarea:focus, select:focus { 
            outline: none; 
            border-color: #1565C0; 
            box-shadow: 0 0 0 4px rgba(21, 101, 192, 0.1);
            transform: translateY(-1px);
        }
        input:hover, textarea:hover, select:hover {
            border-color: #9ca3af;
        }
        
        /* Lists */
        ul { list-style: none; }
        .list-disc { list-style-type: disc; }
        .list-inside { list-style-position: inside; }
        
        /* Images */
        img { max-width: 100%; height: auto; }
        .object-cover { object-fit: cover; }
        
        /* Footer */
        footer { 
            background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
            color: #ffffff; 
            padding: 3rem 0;
            border-top: 3px solid #1565C0;
            position: relative;
        }
        footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #1565C0, #2196F3, #1565C0);
            background-size: 200% 100%;
            animation: gradientShift 3s ease infinite;
        }
        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        footer a { 
            color: #9ca3af; 
            text-decoration: none; 
            transition: all 0.2s ease;
            position: relative;
        }
        footer a:hover { 
            color: #ffffff;
            transform: translateX(4px);
        }
        footer .text-2xl { 
            font-size: 1.5rem;
            transition: transform 0.3s ease;
        }
        footer .text-2xl:hover {
            transform: scale(1.1) rotate(5deg);
        }
        
        /* Responsive */
        @media (max-width: 767px) {
            nav .flex { flex-direction: column; height: auto; padding: 1rem 0; }
            nav .flex > div { flex-direction: column; gap: 0.5rem; }
            .text-5xl { font-size: 2rem; }
            .text-4xl { font-size: 1.75rem; }
            .px-6 { padding-left: 1rem; padding-right: 1rem; }
        }
        
        /* Admin Panel Specific */
        .min-h-screen { min-height: 100vh; }
        .min-w-\[200px\] { min-width: 200px; }
        .w-full { width: 100%; }
        .h-16 { height: 4rem; }
        .h-32 { height: 8rem; }
        .h-48 { height: 12rem; }
        .w-8 { width: 2rem; }
        .h-8 { height: 2rem; }
        .w-20 { width: 5rem; }
        .h-20 { height: 5rem; }
        .overflow-hidden { overflow: hidden; }
        .overflow-x-auto { overflow-x: auto; }
        .whitespace-nowrap { white-space: nowrap; }
        .capitalize { text-transform: capitalize; }
        .inline-block { display: inline-block; }
        .inline { display: inline; }
        .block { display: block; }
        .hidden { display: none; }
        
        /* Utility Classes */
        .z-50 { z-index: 50; }
        .fixed { position: fixed; }
        .relative { position: relative; }
        .flex-1 { flex: 1 1 0%; }
        .flex-shrink-0 { flex-shrink: 0; }
        
        /* Additional Classes */
        .p-3 { padding: 0.75rem; }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .p-8 { padding: 2rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .mr-2 { margin-right: 0.5rem; }
        .ml-2 { margin-left: 0.5rem; }
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .text-blue-100 { color: #dbeafe; }
        .bg-green-100 { background-color: #dcfce7; }
        .bg-red-100 { background-color: #fee2e2; }
        .text-green-800 { color: #166534; }
        .text-red-600 { color: #dc2626; }
        .text-red-700 { color: #b91c1c; }
        .text-red-800 { color: #991b1b; }
        .border-green-400 { border-color: #4ade80; }
        .border-red-400 { border-color: #f87171; }
        .border-gray-300 { border-color: #d1d5db; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-gray-200 { background-color: #e5e7eb; }
        .text-yellow-600 { color: #ca8a04; }
        .cursor-pointer { cursor: pointer; }
        .resize-none { resize: none; }
        
        /* Button Variants */
        .border-2.border-aether-blue { border: 2px solid #1565C0; background: transparent; color: #1565C0; }
        .border-2.border-aether-blue:hover { background-color: #1565C0; color: #ffffff; }
        .border.border-gray-300 { border: 1px solid #d1d5db; background: transparent; color: #374151; }
        .border.border-gray-300:hover { background-color: #f9fafb; }
        
        /* Admin Panel Styles */
        .admin-form input, .admin-form textarea, .admin-form select { margin-bottom: 1rem; }
        .admin-tab { padding: 0.75rem 1.5rem; border-bottom: 2px solid transparent; cursor: pointer; }
        .admin-tab.active { border-bottom-color: #1565C0; color: #1565C0; }
        .admin-tab:hover { color: #111827; }
        
        /* Responsive Text */
        @media (min-width: 640px) {
            .sm\:flex-row { flex-direction: row; }
        }
        @media (min-width: 768px) {
            .md\:text-6xl { font-size: 3.75rem; line-height: 1; }
        }
        
        /* Improved Card Hover */
        .card-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        
        /* Better Form Styling */
        label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
        input[type="checkbox"] { width: auto; margin-right: 0.5rem; }
        
        /* Improved Navigation */
        nav a { padding: 0.5rem 0; }
        nav .bg-aether-blue { padding: 0.5rem 1rem; }
        
        /* Better Section Spacing */
        section { margin-bottom: 0; }
        
        /* Improved Footer */
        footer .text-2xl { font-size: 1.5rem; }
        
        /* Stats Section */
        .bg-aether-blue { 
            background: linear-gradient(135deg, #1565C0 0%, #0D47A1 100%);
            position: relative;
            overflow: hidden;
        }
        .bg-aether-blue::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
        }
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .bg-aether-blue .text-4xl { 
            font-size: 2.25rem; 
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            position: relative;
            z-index: 1;
        }
        .bg-aether-blue > div { position: relative; z-index: 1; }
        
        /* Rules Section Number Circles */
        .bg-aether-blue.rounded-full { 
            display: flex; 
            align-items: center; 
            justify-content: center;
            background: linear-gradient(135deg, #1565C0 0%, #1976D2 100%);
            box-shadow: 0 4px 6px rgba(21, 101, 192, 0.3);
            transition: all 0.3s ease;
        }
        .bg-aether-blue.rounded-full:hover {
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 6px 12px rgba(21, 101, 192, 0.4);
        }
        
        /* Feature Cards Enhancement */
        .bg-white.rounded-lg.shadow-md .text-4xl {
            transition: transform 0.3s ease;
        }
        .bg-white.rounded-lg.shadow-md:hover .text-4xl {
            transform: scale(1.2) rotate(5deg);
        }
        
        /* Section Headers */
        section h2 {
            position: relative;
            display: inline-block;
        }
        section h2::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 4px;
            background: linear-gradient(90deg, #1565C0, #2196F3);
            border-radius: 2px;
        }
        
        /* Max Width Classes */
        .max-w-md { max-width: 28rem; }
        .max-w-3xl { max-width: 48rem; }
        
        /* Focus States */
        input:focus, textarea:focus, select:focus { outline: none; border-color: #1565C0; box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1); }
        .focus\:outline-none:focus { outline: none; }
        .focus\:ring-2:focus { box-shadow: 0 0 0 2px rgba(21, 101, 192, 0.5); }
        .focus\:ring-blue-500:focus { box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); }
        
        /* Admin Panel Specific */
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .rounded { border-radius: 0.25rem; }
        .rounded-md { border-radius: 0.375rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        
        /* Admin Tabs */
        .admin-tab, nav a { transition: all 0.2s; }
        
        /* Better Button Styling */
        button, .bg-aether-blue { cursor: pointer; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        
        /* Improved Cards */
        .card-hover, .bg-white.rounded-lg { transition: all 0.2s; }
        
        /* Text Utilities */
        .uppercase { text-transform: uppercase; }
        .lowercase { text-transform: lowercase; }
        .capitalize { text-transform: capitalize; }
        
        /* Display Utilities */
        .hidden { display: none !important; }
        .block { display: block !important; }
        .inline-block { display: inline-block !important; }
        .inline { display: inline !important; }
        .flex { display: flex !important; }
        .grid { display: grid !important; }
        
        /* Position Utilities */
        .relative { position: relative; }
        .absolute { position: absolute; }
        .fixed { position: fixed; }
        .sticky { position: sticky; }
        
        /* Z-Index */
        .z-10 { z-index: 10; }
        .z-20 { z-index: 20; }
        .z-30 { z-index: 30; }
        .z-40 { z-index: 40; }
        .z-50 { z-index: 50; }
        
        /* Overflow */
        .overflow-hidden { overflow: hidden; }
        .overflow-auto { overflow: auto; }
        .overflow-x-auto { overflow-x: auto; }
        .overflow-y-auto { overflow-y: auto; }
        
        /* Admin Message Styles */
        .bg-green-100.border-green-400 { padding: 1rem; border-radius: 0.375rem; }
        .bg-red-100.border-red-400 { padding: 1rem; border-radius: 0.375rem; }
        
        /* Better Mobile Support */
        @media (max-width: 640px) {
            .text-5xl { font-size: 2rem; }
            .text-4xl { font-size: 1.75rem; }
            .text-3xl { font-size: 1.5rem; }
            nav .flex { flex-wrap: wrap; }
            nav a { font-size: 0.875rem; padding: 0.25rem 0.5rem; }
        }
    </style>
</head>
<body style="background-color: #ffffff;">
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
                    <a href="admin/index.php" class="text-gray-500 hover:text-aether-blue transition-colors text-sm" title="Admin Panel">
                        <i class="fas fa-cog"></i>
                    </a>
                </div>
            </div>
        </div>
    </nav>
    <?php endif; ?>

    <div class="<?php echo isset($hideNav) && $hideNav ? '' : 'pt-16'; ?>">
