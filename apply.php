<?php
require_once 'includes/database.php';

$pageTitle = 'Apply for Staff';
$db = getDB();

// Get open ranks
$ranks = [];
if ($db) {
    try {
        $ranks = $db->query("SELECT * FROM staff_ranks WHERE open = 1 ORDER BY order_index")->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log("Error fetching ranks: " . $e->getMessage());
    }
}

// Handle form submission
$message = '';
$messageType = '';
$submitted = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $db) {
    try {
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $discord = trim($_POST['discord'] ?? '');
        $age = intval($_POST['age'] ?? 0);
        $minecraftUsername = trim($_POST['minecraft_username'] ?? '');
        $previousStaff = trim($_POST['previous_staff'] ?? '');
        $experience = trim($_POST['experience'] ?? '');
        $why = trim($_POST['why'] ?? '');
        $rankId = intval($_POST['rank_id'] ?? 0);

        // Validate required fields
        if (empty($name) || empty($email) || empty($age) || empty($minecraftUsername) || empty($experience) || empty($why) || !$rankId) {
            $message = 'Please fill in all required fields.';
            $messageType = 'error';
        } else {
            // Get rank questions
            $stmt = $db->prepare("SELECT questions FROM staff_ranks WHERE id = ?");
            $stmt->execute([$rankId]);
            $rank = $stmt->fetch(PDO::FETCH_ASSOC);

            $answers = [];
            if ($rank && $rank['questions']) {
                $questions = json_decode($rank['questions'], true);
                if (is_array($questions)) {
                    foreach ($questions as $index => $question) {
                        $answerKey = 'answer_' . $index;
                        $answers[$index] = trim($_POST[$answerKey] ?? '');
                    }
                }
            }

            // Insert application
            $stmt = $db->prepare("INSERT INTO staff_applications (name, email, discord, age, minecraft_username, previous_staff, experience, why, rank_id, answers, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
            $stmt->execute([$name, $email, $discord, $age, $minecraftUsername, $previousStaff, $experience, $why, $rankId, json_encode($answers)]);

            $submitted = true;
        }
    } catch (Exception $e) {
        $message = 'Error submitting application: ' . $e->getMessage();
        $messageType = 'error';
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && !$db) {
    $message = 'Database connection failed. Please contact an administrator.';
    $messageType = 'error';
}

include 'includes/header.php';
?>

<?php if ($submitted): ?>
<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
        <div class="bg-white rounded-lg shadow-lg p-8 text-center">
            <div class="text-5xl mb-4">✅</div>
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p class="text-gray-600 mb-6">Thank you for your interest in joining our staff team. We will review your application and contact you soon.</p>
            <a href="index.php" class="bg-aether-blue text-white px-6 py-2 rounded-md hover:bg-deep-blue transition-colors font-medium inline-block">
                Back to Home
            </a>
        </div>
    </div>
</div>
<?php else: ?>
<div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <a href="index.php" class="text-2xl font-bold text-aether-blue">AetherGens</a>
                <a href="index.php" class="text-gray-700 hover:text-aether-blue transition-colors font-medium text-sm">
                    Back to Home
                </a>
            </div>
        </div>
    </nav>

    <div class="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <div class="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <h1 class="text-4xl font-bold text-center text-gray-900 mb-4">Apply for Staff</h1>
            <p class="text-center text-gray-600 mb-8">Choose a position and fill out the application form</p>

            <?php if ($message): ?>
            <div class="mb-6 p-4 rounded-md <?php echo $messageType === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'; ?>">
                <?php echo htmlspecialchars($message); ?>
            </div>
            <?php endif; ?>

            <?php if (empty($ranks)): ?>
            <div class="text-center py-12">
                <p class="text-gray-500 text-lg">No positions are currently open for applications.</p>
                <a href="index.php" class="mt-4 bg-aether-blue text-white px-6 py-2 rounded-md hover:bg-deep-blue transition-colors font-medium inline-block">
                    Back to Home
                </a>
            </div>
            <?php else: ?>
            <!-- Rank Selection -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Available Positions</h2>
                <div class="grid md:grid-cols-2 gap-6">
                    <?php foreach ($ranks as $rank): ?>
                    <div class="border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-aether-blue transition-colors rank-card" data-rank-id="<?php echo $rank['id']; ?>">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="text-xl font-bold text-gray-900"><?php echo htmlspecialchars($rank['name']); ?></h3>
                            <span class="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800">Open</span>
                        </div>
                        <p class="text-gray-600 text-sm mb-4"><?php echo htmlspecialchars($rank['description']); ?></p>
                        <?php
                        $questions = json_decode($rank['questions'], true);
                        $questionCount = is_array($questions) ? count($questions) : 0;
                        ?>
                        <p class="text-xs text-gray-500"><?php echo $questionCount; ?> question<?php echo $questionCount !== 1 ? 's' : ''; ?></p>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Application Form -->
            <?php foreach ($ranks as $rank): ?>
            <form method="POST" class="application-form space-y-6" id="form-<?php echo $rank['id']; ?>" style="display: none;">
                <input type="hidden" name="rank_id" value="<?php echo $rank['id']; ?>">

                <div class="bg-aether-blue text-white p-4 rounded-lg mb-6">
                    <h3 class="text-xl font-bold">Applying for: <?php echo htmlspecialchars($rank['name']); ?></h3>
                    <p><?php echo htmlspecialchars($rank['description']); ?></p>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Full Name *</label>
                        <input type="text" name="name" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aether-blue">
                    </div>
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Email Address *</label>
                        <input type="email" name="email" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aether-blue">
                    </div>
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Discord Username</label>
                        <input type="text" name="discord" placeholder="username#1234" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aether-blue">
                    </div>
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Age *</label>
                        <input type="number" name="age" min="13" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aether-blue">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-gray-700 font-medium mb-2">Minecraft Username *</label>
                        <input type="text" name="minecraft_username" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aether-blue">
                    </div>
                </div>

                <div>
                    <label class="block text-gray-700 font-medium mb-2">Previous Staff Experience</label>
                    <textarea name="previous_staff" rows="3" placeholder="List any previous staff experience (optional)" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aether-blue"></textarea>
                </div>

                <div>
                    <label class="block text-gray-700 font-medium mb-2">Experience & Skills *</label>
                    <textarea name="experience" rows="4" required placeholder="Tell us about your experience and skills that would make you a good staff member" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aether-blue"></textarea>
                </div>

                <div>
                    <label class="block text-gray-700 font-medium mb-2">Why do you want to be staff? *</label>
                    <textarea name="why" rows="4" required placeholder="Explain why you're interested in joining our staff team" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aether-blue"></textarea>
                </div>

                <?php
                $questions = json_decode($rank['questions'], true);
                if (is_array($questions) && !empty($questions)):
                ?>
                <div class="bg-gray-50 p-6 rounded-lg">
                    <h4 class="text-lg font-bold text-gray-900 mb-4">Additional Questions</h4>
                    <?php foreach ($questions as $index => $question): ?>
                    <div class="mb-4">
                        <label class="block text-gray-700 font-medium mb-2">
                            <?php echo htmlspecialchars($question['question']); ?>
                            <?php if (isset($question['required']) && $question['required']): ?>*<?php endif; ?>
                        </label>
                        <textarea name="answer_<?php echo $index; ?>"
                                  rows="3"
                                  <?php if (isset($question['required']) && $question['required']): ?>required<?php endif; ?>
                                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aether-blue"></textarea>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>

                <div class="flex gap-4">
                    <button type="submit" class="bg-aether-blue text-white px-8 py-3 rounded-md hover:bg-deep-blue transition-colors font-medium">
                        Submit Application
                    </button>
                    <button type="button" class="border border-gray-300 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium back-to-ranks">
                        Back to Positions
                    </button>
                </div>
            </form>
            <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const rankCards = document.querySelectorAll('.rank-card');
    const forms = document.querySelectorAll('.application-form');
    const backButtons = document.querySelectorAll('.back-to-ranks');

    rankCards.forEach(card => {
        card.addEventListener('click', function() {
            const rankId = this.dataset.rankId;
            forms.forEach(form => form.style.display = 'none');
            document.getElementById('form-' + rankId).style.display = 'block';
            this.scrollIntoView({ behavior: 'smooth' });
        });
    });

    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            forms.forEach(form => form.style.display = 'none');
        });
    });
});
</script>
<?php endif; ?>

<?php include 'includes/footer.php'; ?>
