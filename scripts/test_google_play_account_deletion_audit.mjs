import fs from 'fs';
import path from 'path';
import assert from 'assert';

const ROOT_DIR = process.cwd();

console.log('🧪 Starting Google Play Account Deletion & Legal Compliance Audit...');

// 1. Audit LegalPages.tsx
const legalPagesPath = path.join(ROOT_DIR, 'src', 'modules', 'public', 'LegalPages.tsx');
const legalPagesContent = fs.readFileSync(legalPagesPath, 'utf8');

const forbiddenDisclaimerFragment = "not a certification of legal compliance";
const forbiddenDisclaimerFull = "Important for parents and guardians: AcademicLevel is designed for school-age learners. A parent or guardian should review these policies, supervise account use and any purchase, and contact us with questions about a child's information. This page describes our current product practices; it is not a certification of legal compliance.";

assert(!legalPagesContent.includes(forbiddenDisclaimerFragment), 'FAIL: LegalPages.tsx still contains legal disclaimer snippet "not a certification of legal compliance"');
assert(!legalPagesContent.includes(forbiddenDisclaimerFull), 'FAIL: LegalPages.tsx still contains full legal disclaimer');
assert(legalPagesContent.includes('/delacc') || legalPagesContent.includes('academiclevel.in/delacc'), 'FAIL: LegalPages.tsx must link to /delacc for Google Play compliance');
console.log('✅ 1. LegalPages.tsx disclaimer removed and deletion link confirmed.');

// 2. Audit App.tsx routing
const appPath = path.join(ROOT_DIR, 'src', 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

assert(appContent.includes("'ACCOUNT_DELETION'"), 'FAIL: App.tsx missing ACCOUNT_DELETION route');
assert(appContent.includes("'/delacc'"), 'FAIL: App.tsx missing /delacc route');
assert(appContent.includes("'/delete-account'"), 'FAIL: App.tsx missing /delete-account route');
assert(appContent.includes('<AccountDeletionPage'), 'FAIL: App.tsx missing AccountDeletionPage component mount');
assert(appContent.includes("navigateTo('ACCOUNT_DELETION')"), 'FAIL: App.tsx footer missing Delete Account navigation');
console.log('✅ 2. App.tsx routes /delacc and /delete-account correctly with footer link.');

// 3. Audit AccountDeletionPage.tsx
const delPagePath = path.join(ROOT_DIR, 'src', 'modules', 'public', 'AccountDeletionPage.tsx');
assert(fs.existsSync(delPagePath), 'FAIL: AccountDeletionPage.tsx does not exist');
const delPageContent = fs.readFileSync(delPagePath, 'utf8');

assert(delPageContent.includes('Google Play'), 'FAIL: Missing Google Play reference in AccountDeletionPage.tsx');
assert(delPageContent.includes('Account Deletion Policy'), 'FAIL: Missing Account Deletion Policy reference');
assert(delPageContent.includes('requestPublicAccountDeletion'), 'FAIL: Missing requestPublicAccountDeletion call');
assert(delPageContent.includes('deleteMyAccount'), 'FAIL: Missing deleteMyAccount call');
console.log('✅ 3. AccountDeletionPage.tsx satisfies Google Play web deletion portal requirements.');

// 4. Audit StudentProfile.tsx
const profilePath = path.join(ROOT_DIR, 'src', 'modules', 'student', 'StudentProfile.tsx');
const profileContent = fs.readFileSync(profilePath, 'utf8');

assert(profileContent.includes('Danger Zone: Delete Account'), 'FAIL: StudentProfile.tsx missing Danger Zone: Delete Account');
assert(profileContent.includes('deleteMyAccount'), 'FAIL: StudentProfile.tsx missing deleteMyAccount call');
console.log('✅ 4. StudentProfile.tsx in-app Delete Account option confirmed.');

// 5. Audit apiClient.ts
const clientPath = path.join(ROOT_DIR, 'src', 'core', 'api', 'apiClient.ts');
const clientContent = fs.readFileSync(clientPath, 'utf8');

assert(clientContent.includes('deleteMyAccount('), 'FAIL: apiClient.ts missing deleteMyAccount method');
assert(clientContent.includes('requestPublicAccountDeletion('), 'FAIL: apiClient.ts missing requestPublicAccountDeletion method');
console.log('✅ 5. apiClient.ts deletion endpoints confirmed.');

// 6. Audit server/api.js
const serverPath = path.join(ROOT_DIR, 'server', 'api.js');
const serverContent = fs.readFileSync(serverPath, 'utf8');

assert(serverContent.includes("executePermanentLearnerPurge"), 'FAIL: server/api.js missing executePermanentLearnerPurge helper');
assert(serverContent.includes("/auth/delete-account"), 'FAIL: server/api.js missing /auth/delete-account route');
assert(serverContent.includes("/public/request-account-deletion"), 'FAIL: server/api.js missing /public/request-account-deletion route');
console.log('✅ 6. server/api.js backend purge endpoints confirmed.');

console.log('\n🎉 ALL GOOGLE PLAY ACCOUNT DELETION AUDIT CHECKS PASSED!\n');
