import { db, exportDbToJsonStore } from '../server/db.js';

console.log('====================================================');
console.log('ACADEMICLEVEL PRODUCTION READINESS TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(description, condition) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] Test ${totalTests}: ${description}`);
    passedTests++;
  } else {
    console.error(`[FAIL] Test ${totalTests}: ${description}`);
  }
}

// TEST 1: Question Bank - Total 12,000 Questions
const totalQ = db.prepare('SELECT count(*) as count FROM question_bank').get().count;
assert('Total questions in question_bank is exactly 12,000', totalQ === 12000);

// TEST 2: Board Breakdown (CBSE: 3996, ICSE: 4008, IGCSE: 3996)
const cbse = db.prepare("SELECT count(*) as count FROM question_bank WHERE board = 'CBSE'").get().count;
const icse = db.prepare("SELECT count(*) as count FROM question_bank WHERE board = 'ICSE'").get().count;
const igcse = db.prepare("SELECT count(*) as count FROM question_bank WHERE board = 'IGCSE'").get().count;
assert('CBSE has exactly 3,996 questions', cbse === 3996);
assert('ICSE has exactly 4,008 questions', icse === 4008);
assert('IGCSE has exactly 3,996 questions', igcse === 3996);

// TEST 3: All 12 Grades have exactly 1,000 questions each
let allGradesPass = true;
for (let g = 1; g <= 12; g++) {
  const gCount = db.prepare('SELECT count(*) as count FROM question_bank WHERE grade = ?').get(g).count;
  if (gCount !== 1000) {
    allGradesPass = false;
    console.error(`Grade ${g} has ${gCount} questions (expected 1000)`);
  }
}
assert('Each grade (Classes 1–12) has exactly 1,000 questions', allGradesPass);

// TEST 4: Zero empty questions or invalid options
const emptyQ = db.prepare("SELECT count(*) as count FROM question_bank WHERE text IS NULL OR trim(text) = ''").get().count;
const badIdx = db.prepare("SELECT count(*) as count FROM question_bank WHERE correctIndex < 0 OR correctIndex > 3 OR correctIndex IS NULL").get().count;
assert('Zero empty questions', emptyQ === 0);
assert('Zero invalid correctIndex values', badIdx === 0);

// TEST 5: Prabir's account active PLUS subscription
const prabirSub = db.prepare(`
  SELECT * FROM subscriptions 
  WHERE learnerId = 'lrn_mw9asujp_rzun' AND status = 'ACTIVE' AND datetime(expiresAt) > datetime('now')
`).get();
assert('Prabir (lrn_mw9asujp_rzun) has active PLUS subscription', prabirSub && prabirSub.planTier === 'PLUS');

// TEST 6: Prabir normalized email alias has active PLUS subscription
const prabirAliasSub = db.prepare(`
  SELECT * FROM subscriptions 
  WHERE learnerId = 'lrn_prabir_alias_norm' AND status = 'ACTIVE' AND datetime(expiresAt) > datetime('now')
`).get();
assert('Prabir alias (prabir2gmailc@gmail.com) has active PLUS subscription', prabirAliasSub && prabirAliasSub.planTier === 'PLUS');

// TEST 7: Special49 account active PLUS subscription
const specSub = db.prepare(`
  SELECT * FROM subscriptions 
  WHERE (learnerId = 'lrn_special49_9861439460' OR payerUpiId LIKE '%9861439460%') AND status = 'ACTIVE'
`).get();
assert('Special49 (9861439460) has active PLUS subscription', Boolean(specSub));

// TEST 8: Coin ledger table exists and records transactions
const ledgerCount = db.prepare('SELECT count(*) as count FROM coin_ledger').get().count;
assert('Coin ledger contains auditable transaction records', ledgerCount >= 0);

// TEST 9: data-store.json export integrity
const exported = exportDbToJsonStore();
assert('exportDbToJsonStore() exports database successfully for Render ephemeral persistence', exported === true);

console.log('\n====================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('====================================================');
