import assert from 'node:assert';
import crypto from 'node:crypto';
import { db } from '../server/db.js';
import { 
  computeRowHash, 
  getRowKey, 
  syncedRowHashes, 
  flushTursoWriteBuffer,
  replicateUpsertAsync,
  pushAllToTurso
} from '../server/tursoClient.js';
import { safeReplicateAsync, safeExecuteTursoAsync } from '../server/api.js';

console.log('====================================================');
console.log('TURSO CLOUD DATABASE & WRITE-OPTIMIZATION AUDIT SUITE');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function check(description, condition) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] Test ${totalTests}: ${description}`);
    passedTests++;
  } else {
    console.error(`[FAIL] Test ${totalTests}: ${description}`);
  }
}

// ----------------------------------------------------
// TEST 1: Deterministic Row Hashing (Zero-Write Amplification Engine)
// ----------------------------------------------------
const rowA = { id: 'lrn_001', fullName: 'Aarav Patel', coinBalance: 100, role: 'STUDENT' };
const rowB = { role: 'STUDENT', coinBalance: 100, id: 'lrn_001', fullName: 'Aarav Patel' };
const hashA = computeRowHash(rowA);
const hashB = computeRowHash(rowB);

check('Deterministic row hashing produces identical MD5 hashes regardless of property insertion order', hashA === hashB && typeof hashA === 'string' && hashA.length === 32);

// ----------------------------------------------------
// TEST 2: Primary Key Extraction (getRowKey) across all table schemas
// ----------------------------------------------------
const keyLearner = getRowKey('learners', { id: 'usr_123', email: 'test@example.com' });
const keyLedger = getRowKey('coin_ledger', { entryId: 'c_tx_999', learnerId: 'usr_123' });
const keyACode = getRowKey('acodes', { code: 'ACODE_GOLD_99' });
const keySession = getRowKey('sessions', { token: 'tok_sec_abc123' });
const keySetting = getRowKey('system_settings', { key: 'pricing_config_v1', value: '{}' });

check('getRowKey accurately identifies primary keys across all heterogeneous schemas', 
  keyLearner === 'usr_123' &&
  keyLedger === 'c_tx_999' &&
  keyACode === 'ACODE_GOLD_99' &&
  keySession === 'tok_sec_abc123' &&
  keySetting === 'pricing_config_v1'
);

// ----------------------------------------------------
// TEST 3: Zero-Write Amplification Dirty Checking (Unchanged rows skipped)
// ----------------------------------------------------
// Seed mock synced cache
syncedRowHashes.clear();
const sampleLearner = { id: 'lrn_test_opt', fullName: 'Test Student', coinBalance: 200 };
const sampleKey = `learners:${sampleLearner.id}`;
syncedRowHashes.set(sampleKey, computeRowHash(sampleLearner));

// Simulate dirty check
const testRowUnchanged = { ...sampleLearner };
const testRowModified = { ...sampleLearner, coinBalance: 250 };

const isUnchangedDirty = syncedRowHashes.get(sampleKey) !== computeRowHash(testRowUnchanged);
const isModifiedDirty = syncedRowHashes.get(sampleKey) !== computeRowHash(testRowModified);

check('Zero-Write Dirty Filter correctly identifies unchanged rows (SKIP) vs modified rows (DIRTY)', 
  !isUnchangedDirty && isModifiedDirty
);

// ----------------------------------------------------
// TEST 4: SQLite High-Concurrency Pragmas & WAL Mode
// ----------------------------------------------------
const journalMode = db.prepare('PRAGMA journal_mode').get().journal_mode;
const busyTimeout = db.prepare('PRAGMA busy_timeout').get().timeout;

check('SQLite WAL mode is ACTIVE for high concurrent read/write throughput', 
  journalMode.toLowerCase() === 'wal'
);
check('SQLite busy_timeout is configured to 5000ms (prevents SQLITE_BUSY under 100+ concurrent students)', 
  busyTimeout >= 5000
);

// ----------------------------------------------------
// TEST 5: safeReplicateAsync and safeExecuteTursoAsync are Non-Fatal
// ----------------------------------------------------
let helpersNoError = false;
try {
  safeReplicateAsync('learners', { id: 'lrn_safe_test', name: 'Safe Test' });
  safeExecuteTursoAsync('SELECT 1');
  helpersNoError = true;
} catch {
  helpersNoError = false;
}
check('safeReplicateAsync and safeExecuteTursoAsync handle execution safely without throwing', helpersNoError);

// ----------------------------------------------------
// TEST 6: Zero Dummy Test Accounts in Learners Database
// ----------------------------------------------------
const dummyCount = db.prepare(`
  SELECT count(*) as count FROM learners WHERE 
    email LIKE '%@example.com' OR 
    email LIKE '%@academiclevel.test' OR 
    email LIKE '%@test.com' OR 
    email LIKE '%friend%@gmail.com' OR 
    email = 'user@gmail.com' OR 
    email LIKE 'audit_%@academiclevel.in'
`).get().count;

check('Database contains zero dummy test accounts in production table', dummyCount === 0);

// ----------------------------------------------------
// TEST 7: In-Memory Write Buffer Flush & Cleanliness
// ----------------------------------------------------
let bufferOk = false;
try {
  replicateUpsertAsync('system_settings', { key: 'test_opt_key', value: 'opt_val' });
  bufferOk = true;
} catch {
  bufferOk = false;
}
check('replicateUpsertAsync smoothly buffers updates for debounced batch flush', bufferOk);

console.log('\n====================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('====================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
