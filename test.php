<?php
echo "<h1>PHP Test</h1>";
echo "<p>PHP is working!</p>";

// Test database
try {
    require_once 'includes/database.php';
    $db = getDB();
    echo "<p>Database connection successful!</p>";

    // Test query
    $stmt = $db->query("SELECT COUNT(*) FROM server_info");
    $count = $stmt->fetchColumn();
    echo "<p>Server info records: " . $count . "</p>";

} catch (Exception $e) {
    echo "<p style='color: red;'>Database error: " . $e->getMessage() . "</p>";
}

// Test includes
echo "<p>Testing includes...</p>";
if (file_exists('includes/header.php')) {
    echo "<p>Header file exists</p>";
} else {
    echo "<p style='color: red;'>Header file missing</p>";
}

if (file_exists('includes/footer.php')) {
    echo "<p>Footer file exists</p>";
} else {
    echo "<p style='color: red;'>Footer file missing</p>";
}
?>
