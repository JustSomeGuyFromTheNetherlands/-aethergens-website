<?php
session_start();

$pageTitle = 'Admin Login';
$hideNav = true;

// Check if already logged in
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: panel.php');
    exit;
}

// Handle login
$loginError = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';

    if ($password === 'ik hou van kaas') {
        $_SESSION['admin_logged_in'] = true;
        header('Location: panel.php');
        exit;
    } else {
        $loginError = 'Invalid password';
    }
}

include '../includes/header.php';
?>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
                <p class="text-gray-600">Enter the admin password to access the control panel</p>
            </div>

            <?php if ($loginError): ?>
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <?php echo htmlspecialchars($loginError); ?>
            </div>
            <?php endif; ?>

            <form method="POST" class="space-y-6">
                <div>
                    <label for="password" class="block text-gray-700 font-medium mb-2">Password</label>
                    <input type="password" id="password" name="password" required
                           class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>

                <button type="submit" class="w-full bg-aether-blue text-white py-3 px-4 rounded-md hover:bg-deep-blue transition-colors font-medium">
                    Login
                </button>
            </form>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
