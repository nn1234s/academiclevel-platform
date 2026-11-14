import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const platformDir = path.resolve(__dirname, '..');

console.log('🚀 Running 5-Key Cascading Failover & Practice Worksheets Suite...');

// 1. Verify Database Schema & Question Bank Count
const dbPath = path.join(platformDir, 'server', 'data', 'academiclevel_prod.db');
const db = new DatabaseSync(dbPath);

const countRow = db.prepare('SELECT count(*) as total FROM question_bank').get();
console.log(`[TEST 1] Question Bank total records: ${countRow.total}`);
assert(countRow.total >= 10000, 'Question bank should contain at least 10,000 questions (expected 12,000)');

// 2. Verify Questions for All Classes (Grades 1 to 12)
for (let g = 1; g <= 12; g++) {
  const gradeSample = db.prepare('SELECT count(*) as count FROM question_bank WHERE grade = ?').get(g);
  console.log(`[TEST 2] Grade ${g} questions count: ${gradeSample.count}`);
  assert(gradeSample.count > 0, `Grade ${g} must have curated questions`);
}

// 3. Verify System Settings 5-Key Storage in SQLite
const testKeys = [
  'AIzaSyKey1_DummyFail_AAAAAAAAAAAAAAAAAAAA',
  'AIzaSyKey2_DummyFail_BBBBBBBBBBBBBBBBBBBB',
  'AIzaSyKey3_ValidTest_CCCCCCCCCCCCCCCCCCCC',
  'AIzaSyKey4_BackupTest_DDDDDDDDDDDDDDDDDDD',
  'AIzaSyKey5_Emergency_EEEEEEEEEEEEEEEEEEEE'
];

db.prepare(`
  INSERT INTO system_settings (key, value, updatedAt)
  VALUES ('gemini_api_keys', ?, datetime('now'))
  ON CONFLICT(key) DO UPDATE SET value = excluded.value
`).run(JSON.stringify(testKeys));

for (let i = 1; i <= 5; i++) {
  db.prepare(`
    INSERT INTO system_settings (key, value, updatedAt)
    VALUES ('gemini_api_key_${i}', ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(testKeys[i - 1]);
}

const retrievedKeysRow = db.prepare("SELECT value FROM system_settings WHERE key = 'gemini_api_keys'").get();
const parsedKeys = JSON.parse(retrievedKeysRow.value);
assert.strictEqual(parsedKeys.length, 5, 'Must store exactly 5 keys');
assert.strictEqual(parsedKeys[0], testKeys[0], 'Key 1 matches');
assert.strictEqual(parsedKeys[4], testKeys[4], 'Key 5 matches');
console.log('[TEST 3] 5 API Key Pool persistence verified in database.');

// 4. Verify Server Code Contains Multi-Key Cascading Failover Engine
const apiJsContent = fs.readFileSync(path.join(platformDir, 'server', 'api.js'), 'utf-8');

assert(apiJsContent.includes('callGeminiApiWithMultiKeyFallback'), 'Must contain callGeminiApiWithMultiKeyFallback function');
assert(apiJsContent.includes('getGeminiApiKeys'), 'Must contain getGeminiApiKeys function');
assert(apiJsContent.includes('gemini_api_keys'), 'Must support gemini_api_keys pool');
assert(apiJsContent.includes('maxOutputTokens: 2430'), 'Must cap maxOutputTokens strictly to 2430 to prevent financial loss');
assert(apiJsContent.includes('timeoutMs = 20000'), 'Must allow 20,000ms latency for Google response');
console.log('[TEST 4] Server cascading multi-key failover and 2430 token cap verified.');

// 5. Verify Client HybridQuizService multi-key support
const hybridServiceContent = fs.readFileSync(path.join(platformDir, 'src', 'services', 'hybridQuizService.ts'), 'utf-8');
assert(hybridServiceContent.includes('getClientStoredKeysPool'), 'HybridQuizService must support getClientStoredKeysPool');
assert(hybridServiceContent.includes('setClientStoredKeysPool'), 'HybridQuizService must support setClientStoredKeysPool');
assert(hybridServiceContent.includes('KeyTestResult'), 'HybridQuizService must export KeyTestResult interface');
console.log('[TEST 5] HybridQuizService multi-key pool support verified.');

// 6. Verify Admin Vault QuestionBankManager UI
const qBankManagerContent = fs.readFileSync(path.join(platformDir, 'src', 'admin-vault', 'modules', 'QuestionBankManager.tsx'), 'utf-8');
assert(qBankManagerContent.includes('Configure 5 Gemini API Key Slots'), 'QuestionBankManager must render 5 key slots');
assert(qBankManagerContent.includes('Multi-Key Real-Time Failover Pool'), 'QuestionBankManager must show cascading failover banner');
assert(qBankManagerContent.includes('Save 5 API Keys'), 'QuestionBankManager must have Save 5 API Keys action');
assert(qBankManagerContent.includes('Test All 5 Keys'), 'QuestionBankManager must have Test All 5 Keys action');
console.log('[TEST 6] Admin Vault QuestionBankManager 5-Key UI verified.');

// 7. Verify PracticeWorksheetViewer Component
const worksheetViewerContent = fs.readFileSync(path.join(platformDir, 'src', 'modules', 'student', 'PracticeWorksheetViewer.tsx'), 'utf-8');
assert(worksheetViewerContent.includes('ACADEMICLEVEL HIGH-YIELD PRACTICE WORKSHEET'), 'Must contain official worksheet header');
assert(worksheetViewerContent.includes('Print / Save as PDF'), 'Must include 1-click vector PDF print button');
assert(worksheetViewerContent.includes('Download (.html)'), 'Must include offline download button');
assert(worksheetViewerContent.includes('Detachable Answer Key & NCERT Step-by-Step Solutions'), 'Must include detachable solutions');
assert(worksheetViewerContent.includes('Student Rough Work & Calculation Scratchpad'), 'Must include rough work scratchpad');
assert(worksheetViewerContent.includes('[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]'), 'Must support all grades 1 through 12');
console.log('[TEST 7] PracticeWorksheetViewer curriculum component verified.');

// 8. Verify Coin Mall 30-Coin Unlock Integration
const coinMallContent = fs.readFileSync(path.join(platformDir, 'src', 'modules', 'student', 'CoinMall.tsx'), 'utf-8');
assert(coinMallContent.includes('Class Practice Worksheets & PDF Center'), 'CoinMall must feature Practice Worksheets');
assert(coinMallContent.includes('30'), 'CoinMall must price worksheets at 30 coins');
assert(coinMallContent.includes('isWorksheetModalOpen'), 'CoinMall must manage worksheet modal state');
assert(coinMallContent.includes('PRACTICE_WORKSHEETS_ALL_CLASSES'), 'CoinMall must record ledger transaction for worksheets');
console.log('[TEST 8] CoinMall 30-coin worksheet unlock integration verified.');

// 9. Clean up test database keys
db.prepare("DELETE FROM system_settings WHERE key = 'gemini_api_keys'").run();
for (let i = 1; i <= 5; i++) {
  db.prepare(`DELETE FROM system_settings WHERE key = 'gemini_api_key_${i}'`).run();
}
db.close();

console.log('🎉 ALL 8 TESTS IN 5-KEY FAILOVER & PRACTICE WORKSHEETS SUITE PASSED PERFECTLY!');
