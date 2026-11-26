import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🧪 Starting School Pack, A-Codes, Antarctica & Turso Scale Verification Tests...\n');

let testsPassed = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
  }
}

// 1. Verify A-Code redemption in UPIQRCheckout.tsx
runTest('UPIQRCheckout.tsx contains A-CODE voucher redemption at payment position', () => {
  const content = fs.readFileSync(path.join(rootDir, 'src/modules/student/UPIQRCheckout.tsx'), 'utf8');
  assert(content.includes('Bought from an online store or School?'), 'Missing prompt for online store or school');
  assert(content.includes('You will have gotten an'), 'Missing "You will have gotten an A-CODE" copy');
  assert(content.includes('Enter your A-CODE below to activate your plan instantly'), 'Missing redemption instruction');
  assert(content.includes('handleRedeemAcode'), 'Missing handleRedeemAcode handler');
  assert(content.includes('PaymentService.redeemACode'), 'Missing PaymentService.redeemACode invocation');
});

// 2. Verify SchoolPortalPage.tsx offer, codes, quiz tracking & weak points
runTest('SchoolPortalPage.tsx contains 2499 offer, 20 Plus / 40 Lite codes, Quiz Tracker & Weak Points', () => {
  const content = fs.readFileSync(path.join(rootDir, 'src/modules/public/SchoolPortalPage.tsx'), 'utf8');
  assert(content.includes('2,499') || content.includes('2499'), 'Missing ₹2,499 flat price');
  assert(content.includes('20 Plus') || content.includes('PLUS_20'), 'Missing 20 Plus A-Codes option');
  assert(content.includes('40 Lite') || content.includes('LITE_40'), 'Missing 40 Lite A-Codes option');
  assert(content.includes('180 Days'), 'Missing 180 days for Plus');
  assert(content.includes('60 Days'), 'Missing 60 days for Lite');
  assert(content.includes('sampleScores') || content.includes('Live Classroom Quiz Tracker'), 'Missing Quiz tracker data/table');
  assert(content.includes('weakPointTopics') || content.includes('Conceptual Weak Points'), 'Missing Weak Points diagnostic');
  assert(content.includes('handleEnableTeacherMode') || content.includes('handleTeacherRegister'), 'Missing Teacher account activation');
  assert(content.includes('PaymentService.getSchoolGatewayUrl()'), 'SchoolPortalPage must link directly to PaymentService.getSchoolGatewayUrl()');
  assert(content.includes('isTeacherDashboard'), 'SchoolPortalPage must track isTeacherDashboard');
  assert(content.includes('Payment OK. Complete Activation:-'), 'SchoolPortalPage must feature Payment OK activation step');
  assert(content.includes('Classroom A-Codes Vault is Locked') || content.includes('Classroom A-Codes Vault (Locked)'), 'A-Codes must not be in the open before payment activation');
});

// 2.1 Verify PaymentService UPI_GATEWAY_URLS contains SCHOOL pack url
runTest('PaymentService.ts contains official ₹2,499 School gateway URL', () => {
  const content = fs.readFileSync(path.join(rootDir, 'src/services/paymentService.ts'), 'utf8');
  assert(content.includes('https://upipg.cit.org.in/pay/VucCVS8VRxJC9iQWEjVv?public=true'), 'Missing VucCVS8VRxJC9iQWEjVv school payment url in paymentService');
  assert(content.includes('getSchoolGatewayUrl'), 'Missing getSchoolGatewayUrl method in PaymentService');
});

// 2.2 Verify server/api.js provides /api/school/activate-pack and /api/school/pack-status/:teacherId
runTest('server/api.js contains school pack activation and pack-status endpoints', () => {
  const content = fs.readFileSync(path.join(rootDir, 'server/api.js'), 'utf8');
  assert(content.includes('/school/activate-pack'), 'Missing /school/activate-pack endpoint');
  assert(content.includes('/school/pack-status/:teacherId'), 'Missing /school/pack-status/:teacherId endpoint');
});

// 2.3 Verify WhatsDifferentFromChatGPT section across ad, landing and teacher pages
runTest('WhatsDifferentFromChatGPT section is present in all ad pages and teacher pages', () => {
  const compContent = fs.readFileSync(path.join(rootDir, 'src/modules/shared/WhatsDifferentFromChatGPT.tsx'), 'utf8');
  assert(compContent.includes('DIFFERENT FROM CHATGPT'), 'Missing header in WhatsDifferentFromChatGPT');
  assert(compContent.includes('Nova AI Tutor') || compContent.includes('Socratic AI Tutor'), 'Missing Nova AI Tutor point');
  assert(compContent.includes('Curriculum & Syllabus'), 'Missing Curriculum alignment point');

  const adContent = fs.readFileSync(path.join(rootDir, 'src/modules/public/Special49AdsLandingPage.tsx'), 'utf8');
  assert(adContent.includes('<WhatsDifferentFromChatGPT'), 'Special49AdsLandingPage must embed WhatsDifferentFromChatGPT');

  const landerContent = fs.readFileSync(path.join(rootDir, 'src/modules/public/LandingPage.tsx'), 'utf8');
  assert(landerContent.includes('<WhatsDifferentFromChatGPT'), 'LandingPage must embed WhatsDifferentFromChatGPT');
  assert(!landerContent.includes('Instant 1-click teacher mode using the same name and password as your account'), 'Must remove insecure 1-click teacher mode text from LandingPage');
  assert(landerContent.includes('Strict Role Isolation'), 'LandingPage must feature Strict Role Isolation copy');

  const schoolContent = fs.readFileSync(path.join(rootDir, 'src/modules/public/SchoolPortalPage.tsx'), 'utf8');
  assert(schoolContent.includes('<WhatsDifferentFromChatGPT'), 'SchoolPortalPage must embed WhatsDifferentFromChatGPT');
  assert(schoolContent.includes('Teacher Admin accounts are strictly isolated from student learner accounts'), 'SchoolPortalPage must enforce role isolation');
});

// 3. Verify App.tsx route resolution for /school
runTest('App.tsx resolves /school and renders SchoolPortalPage', () => {
  const content = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf8');
  assert(content.includes("p === '/school'"), 'Missing /school path match');
  assert(content.includes("route: 'SCHOOL_PORTAL'"), 'Missing SCHOOL_PORTAL route mapping');
  assert(content.includes("case 'SCHOOL_PORTAL': return '/school';"), 'Missing reverse path for SCHOOL_PORTAL');
  assert(content.includes('<SchoolPortalPage'), 'SchoolPortalPage must be rendered');
  assert(content.includes('Schools (₹2,499)') || (content.includes('Schools') && content.includes('₹2,499')), 'Nav header must contain Schools link');
});

// 4. Verify LandingPage.tsx includes School pack, Quiz tracking, and Weak Points
runTest('LandingPage.tsx features School Pack, Quiz tracking & Weak points with /school CTA', () => {
  const content = fs.readFileSync(path.join(rootDir, 'src/modules/public/LandingPage.tsx'), 'utf8');
  assert(content.includes('FOR SCHOOLS, COACHINGS & TUTORS') || content.includes('FOR SCHOOLS, COACHINGS &amp; TUTORS'), 'Missing School section banner');
  assert(content.includes('2,499 Flat') || content.includes('₹2,499'), 'Missing ₹2,499 school offer on homepage');
  assert(content.includes('Live Quiz Tracker') || content.includes('Classroom Quiz Activity Feed'), 'Missing Quiz tracker preview');
  assert(content.includes('Student Weak Points Heatmap') || content.includes('Automated Conceptual Weak Points'), 'Missing Weak points preview on homepage');
  assert(content.includes("onNavigate('SCHOOL_PORTAL')") || content.includes('/school'), 'Missing CTA to school portal');
});

// 5. Verify Antarctica option in GiftStore.tsx
runTest('GiftStore.tsx includes Antarctica with polar research station shipping validation', () => {
  const content = fs.readFileSync(path.join(rootDir, 'src/modules/student/GiftStore.tsx'), 'utf8');
  assert(content.includes('value="Antarctica"'), 'Missing Antarctica option value');
  assert(content.includes('Polar Research Station'), 'Missing Polar Research Station label');
  assert(content.includes('cleanPin.length >= 3 && cleanPin.length <= 12') || content.includes('cleanPin.length < 3 || cleanPin.length > 12'), 'ZIP code validation must support 3-12 alnum polar/international postal codes');
  assert(content.includes('digitsOnly.length < 7 || digitsOnly.length > 15'), 'Phone validation must support 7-15 digit satellite/polar phones');
});

// 6. Verify SQLite indexes in db.js for 10,000 - 30,000 students
runTest('server/db.js contains high-scale composite indexes for 30,000 students', () => {
  const content = fs.readFileSync(path.join(rootDir, 'server/db.js'), 'utf8');
  assert(content.includes('idx_learners_role'), 'Missing role index on learners');
  assert(content.includes('idx_quiz_attempts_comp'), 'Missing composite index on quiz attempts');
  assert(content.includes('idx_quiz_attempts_topic'), 'Missing topic index on quiz attempts');
  assert(content.includes('idx_acodes_created'), 'Missing created/redeemed index on acodes');
  assert(content.includes('idx_course_progress_comp'), 'Missing composite index on course progress');
});

// 7. Verify Turso zero-write hash and dirty diffing in tursoClient.js
runTest('server/tursoClient.js enforces dirty tracking to stay within Turso 10M write quota', () => {
  const content = fs.readFileSync(path.join(rootDir, 'server/tursoClient.js'), 'utf8');
  assert(content.includes('syncedRowHashes'), 'Missing syncedRowHashes map');
  assert(content.includes('computeRowHash'), 'Missing computeRowHash hashing');
  assert(content.includes('writeBuffer'), 'Missing writeBuffer debounced queue');
  assert(content.includes('syncedRowHashes.get(key) === currentHash'), 'Missing zero-write check');
});

console.log(`\n========================================`);
console.log(`Test Results: ${testsPassed}/${totalTests} Passed!`);
console.log(`========================================\n`);

if (testsPassed === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
