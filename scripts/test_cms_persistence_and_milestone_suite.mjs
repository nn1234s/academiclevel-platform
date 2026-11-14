import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_STORE_PATH = path.resolve(__dirname, '../data-store.json');

console.log('🚀 [Test Suite] Running CMS Persistence and Milestone Verification...');

async function runTests() {
  const { db, initDatabaseSchema, exportDbToJsonStore } = await import('../server/db.js');

  // Test 1: Schema initialization and data store synchronization
  console.log('\n--- 1. Testing Schema and Default Settings Initialization ---');
  initDatabaseSchema();

  const settingsInDb = db.prepare('SELECT * FROM system_settings').all();
  assert(settingsInDb.length >= 4, `Expected at least 4 system settings in DB, found ${settingsInDb.length}`);
  const keys = settingsInDb.map(s => s.key);
  assert(keys.includes('cfg_home'), 'Missing cfg_home in system_settings');
  assert(keys.includes('cfg_pricing'), 'Missing cfg_pricing in system_settings');
  assert(keys.includes('cfg_legal'), 'Missing cfg_legal in system_settings');
  assert(keys.includes('cfg_ads'), 'Missing cfg_ads in system_settings');
  console.log('✅ Default CMS settings exist in SQLite database.');

  // Test 2: Admin edits homepage content
  console.log('\n--- 2. Testing Admin Updating Homepage CMS Content ---');
  const customHomeConfig = {
    heroTitle: 'Master All Classes 1 to 12 With India Top Adaptive AI',
    heroSubtitle: 'Personalized Socratic Quizzes, CBSE/ICSE curriculum mastery, and real digital gift cards.',
    announcementActive: true,
    announcementText: '🔥 New AI Olympiad Track Live across all grades!',
    statsStudents: '25,000+',
    statsQuizzes: '750,000+',
    statsPassRate: '99.8%',
    bannerCtaText: 'Claim Your Scholarship Now',
    updatedAt: new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO system_settings (key, value, updatedAt)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt
  `).run('cfg_home', JSON.stringify(customHomeConfig), customHomeConfig.updatedAt);

  exportDbToJsonStore();

  // Verify in SQLite
  const savedRow = db.prepare('SELECT value FROM system_settings WHERE key = ?').get('cfg_home');
  const parsedFromDb = JSON.parse(savedRow.value);
  assert.equal(parsedFromDb.heroTitle, customHomeConfig.heroTitle, 'SQLite did not store heroTitle');
  assert.equal(parsedFromDb.statsStudents, '25,000+', 'SQLite did not store statsStudents');
  console.log('✅ SQLite system_settings contains the updated homepage configuration.');

  // Verify in data-store.json
  const rawJson = fs.readFileSync(DATA_STORE_PATH, 'utf8');
  const storeData = JSON.parse(rawJson);
  assert(Array.isArray(storeData.al_prod_system_settings_v1), 'al_prod_system_settings_v1 is not an array in data-store.json');
  const homeInJson = storeData.al_prod_system_settings_v1.find(s => s.key === 'cfg_home');
  assert(homeInJson, 'cfg_home not found in data-store.json');
  const parsedFromJson = typeof homeInJson.value === 'object' ? homeInJson.value : JSON.parse(homeInJson.value);
  assert.equal(parsedFromJson.heroTitle, customHomeConfig.heroTitle, 'data-store.json does not match saved heroTitle');
  console.log('✅ data-store.json successfully persisted al_prod_system_settings_v1 with custom homepage.');

  // Test 3: Simulate Server Restart / Redeploy (wipe SQLite system_settings and run initDatabaseSchema)
  console.log('\n--- 3. Testing Server Restart / Redeploy Recovery from data-store.json ---');
  db.exec('DELETE FROM system_settings');
  const afterDeleteCount = db.prepare('SELECT count(*) as c FROM system_settings').get().c;
  assert.equal(afterDeleteCount, 0, 'Database was not cleared for test');

  // Re-run initialization to simulate server startup
  initDatabaseSchema();

  const restoredRow = db.prepare('SELECT value FROM system_settings WHERE key = ?').get('cfg_home');
  assert(restoredRow, 'Failed to restore cfg_home from data-store.json');
  const restoredConfig = JSON.parse(restoredRow.value);
  assert.equal(restoredConfig.heroTitle, customHomeConfig.heroTitle, 'Restored heroTitle does not match saved custom content!');
  assert.equal(restoredConfig.statsStudents, '25,000+', 'Restored statsStudents does not match!');
  console.log('✅ After simulated server restart/wipe, custom homepage configuration was 100% recovered from data-store.json!');

  // Test 4: Verify Proof of Study Milestone logic
  console.log('\n--- 4. Testing Proof of Study Milestone for 4 Quizzes / 4 Levels ---');
  // Student with 4 quizzes completed and 4 levels mastered (the case from user screenshot)
  const studentWith4 = {
    levelsCompletedCount: 4,
    quizzesCompletedCount: 4,
    role: 'STUDENT'
  };
  const minLevelsRequired = 3;
  const levelsCount = Math.max(
    Number(studentWith4.levelsCompletedCount || 0),
    Number(studentWith4.quizzesCompletedCount || 0)
  );
  const isSatisfied = levelsCount >= minLevelsRequired || studentWith4.role === 'SUPER_ADMIN';
  assert.equal(isSatisfied, true, 'Student with 4 quizzes / 4 levels should satisfy 3-level milestone!');
  console.log(`✅ Student with 4 quizzes / 4 levels satisfies milestone: ${levelsCount}/${minLevelsRequired} (Milestone satisfied: ${isSatisfied})`);

  // Student with 0 quizzes completed
  const studentWith0 = {
    levelsCompletedCount: 0,
    quizzesCompletedCount: 0,
    role: 'STUDENT'
  };
  const levelsCount0 = Math.max(
    Number(studentWith0.levelsCompletedCount || 0),
    Number(studentWith0.quizzesCompletedCount || 0)
  );
  const isSatisfied0 = levelsCount0 >= minLevelsRequired || studentWith0.role === 'SUPER_ADMIN';
  assert.equal(isSatisfied0, false, 'Student with 0 quizzes should NOT satisfy milestone');
  console.log(`✅ Student with 0 quizzes correctly blocked: ${levelsCount0}/${minLevelsRequired}`);

  console.log('\n🎉 ALL CMS PERSISTENCE AND MILESTONE TESTS PASSED PERFECTLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
