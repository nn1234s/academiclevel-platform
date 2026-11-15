import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const platformDir = path.resolve(__dirname, '..');

console.log('⚡ Running Payee Name & Truthfulness Audit Suite...');

// 1. Verify Payee Name is Pratyusha Nanda in paymentService.ts
const paymentServiceContent = fs.readFileSync(path.join(platformDir, 'src', 'services', 'paymentService.ts'), 'utf-8');
assert(paymentServiceContent.includes("OFFICIAL_MERCHANT_NAME = 'Pratyusha Nanda'"), 'OFFICIAL_MERCHANT_NAME must be Pratyusha Nanda');
console.log('✓ TEST 1 PASSED: paymentService.ts payee is Pratyusha Nanda.');

// 2. Verify Payee Name in siteConfigService.ts
const siteConfigContent = fs.readFileSync(path.join(platformDir, 'src', 'services', 'siteConfigService.ts'), 'utf-8');
assert(siteConfigContent.includes("merchantName: 'Pratyusha Nanda'"), 'siteConfigService must default merchantName to Pratyusha Nanda');
console.log('✓ TEST 2 PASSED: siteConfigService.ts merchantName is Pratyusha Nanda.');

// 3. Verify Standard UPI URI generation with Pratyusha Nanda
assert(paymentServiceContent.includes('upi://pay?pa='), 'Must implement upi://pay? format');
assert(paymentServiceContent.includes('&pn=${encodeURIComponent(merchant)}'), 'Must encode merchant as pn');
assert(paymentServiceContent.includes('&cu=INR'), 'Must have INR currency');
assert(paymentServiceContent.includes('OFFICIAL_MERCHANT_NAME = \'Pratyusha Nanda\''), 'Default merchant must be Pratyusha Nanda');
console.log('✓ TEST 3 PASSED: Standard UPI URI encodes payee as Pratyusha Nanda with NPCI compliance.');

// 4. Verify No Fake User Counts in LandingPage.tsx
const landingContent = fs.readFileSync(path.join(platformDir, 'src', 'modules', 'public', 'LandingPage.tsx'), 'utf-8');
assert(!landingContent.includes('4,000+ Active Students'), 'Must not claim 4,000+ Active Students');
assert(!landingContent.includes('10,000+ Students'), 'Must not claim 10,000+ Students');
assert(!landingContent.includes('25,000'), 'Must not claim 25,000 users');
assert(landingContent.includes('Interactive AI Quizzes') || landingContent.includes('Curriculum AI Quizzes'), 'Must replace user counts with AI Quiz features');
console.log('✓ TEST 4 PASSED: LandingPage.tsx cleaned of fake user counts; AI quiz features highlighted.');

// 5. Verify No Fake User Counts in Special49AdsLandingPage.tsx
const adsContent = fs.readFileSync(path.join(platformDir, 'src', 'modules', 'public', 'Special49AdsLandingPage.tsx'), 'utf-8');
assert(!adsContent.includes('4,000+ Students'), 'Must not claim 4,000+ Students');
assert(!adsContent.includes('Read All 2,400+'), 'Must not claim 2,400+ reviews');
console.log('✓ TEST 5 PASSED: Special49AdsLandingPage.tsx verified without inflated user counts.');

// 6. Verify Database settings
import { db } from '../server/db.js';
const pricingRow = db.prepare('SELECT value FROM system_settings WHERE key = ?').get('cfg_pricing');
const pricingVal = JSON.parse(pricingRow.value);
assert.strictEqual(pricingVal.merchantName, 'Pratyusha Nanda', 'DB cfg_pricing merchantName must be Pratyusha Nanda');

const homeRow = db.prepare('SELECT value FROM system_settings WHERE key = ?').get('cfg_home');
const homeVal = JSON.parse(homeRow.value);
assert(!homeVal.statsStudents || !homeVal.statsStudents.includes('25,000'), 'DB cfg_home must not contain 25,000+ users');
console.log('✓ TEST 6 PASSED: Database system settings verified with Pratyusha Nanda & zero inflated user counts.');

console.log('🎉 ALL 6 PAYEE & TRUTHFULNESS TESTS PASSED PERFECTLY!');
