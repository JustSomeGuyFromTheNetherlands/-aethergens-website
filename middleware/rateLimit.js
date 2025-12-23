const { getDB } = require('../database');

const rateLimitStore = new Map();

async function checkRateLimit(key, maxAttempts, windowMs, identifier) {
  const storeKey = `${key}:${identifier}`;
  const now = Date.now();
  
  // Try database first
  try {
    const db = getDB();
    const record = await db.fetchOne(
      "SELECT attempts, first_attempt FROM rate_limits WHERE `key` = ? AND identifier = ?",
      [key, identifier]
    );
    
    if (record) {
      const elapsed = now - new Date(record.first_attempt).getTime();
      
      if (elapsed > windowMs) {
        // Reset window
        await db.query(
          "UPDATE rate_limits SET attempts = 1, first_attempt = NOW() WHERE `key` = ? AND identifier = ?",
          [key, identifier]
        );
        return { allowed: true, remaining: maxAttempts - 1 };
      }
      
      if (record.attempts >= maxAttempts) {
        return { allowed: false, remaining: 0 };
      }
      
      // Increment attempts
      await db.query(
        "UPDATE rate_limits SET attempts = attempts + 1 WHERE `key` = ? AND identifier = ?",
        [key, identifier]
      );
      return { allowed: true, remaining: maxAttempts - record.attempts - 1 };
    } else {
      // Create new record
      await db.query(
        "INSERT INTO rate_limits (`key`, identifier, attempts, first_attempt) VALUES (?, ?, 1, NOW())",
        [key, identifier]
      );
      return { allowed: true, remaining: maxAttempts - 1 };
    }
  } catch (error) {
    // Fallback to in-memory store
    const record = rateLimitStore.get(storeKey);
    
    if (!record) {
      rateLimitStore.set(storeKey, { attempts: 1, firstAttempt: now });
      return { allowed: true, remaining: maxAttempts - 1 };
    }
    
    const elapsed = now - record.firstAttempt;
    
    if (elapsed > windowMs) {
      rateLimitStore.set(storeKey, { attempts: 1, firstAttempt: now });
      return { allowed: true, remaining: maxAttempts - 1 };
    }
    
    if (record.attempts >= maxAttempts) {
      return { allowed: false, remaining: 0 };
    }
    
    record.attempts++;
    return { allowed: true, remaining: maxAttempts - record.attempts };
  }
}

module.exports = { checkRateLimit };

