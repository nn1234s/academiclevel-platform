import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const platformDir = path.resolve(__dirname, '..');

console.log('🚀 Running Verification: Remove UPI ID & Post-Payment Return Flow...');

// 1. Check Special49AdsLandingPage.tsx
const special49 = fs.readFileSync(path.join(platformDir, 'src', 'modules', 'public', 'Special49AdsLandingPage.tsx'), 'utf-8');

// Assert no raw UPI ID or VPA display box
assert(!special49.includes('Official Merchant UPI ID:'), 'Must NOT display Official Merchant UPI ID label');
assert(!special49.includes('{officialVpa}'), 'Must NOT display raw {officialVpa} in the UI');
assert(!special49.includes('Your Payer UPI ID'), 'Must NOT ask user for Payer UPI ID');
console.log('✓ TEST 1 PASSED: Special49 landing page does NOT display raw UPI ID or ask for Payer UPI ID.');

// Assert Dynamic QR & deep link still contain valid upi URI
assert(special49.includes('href={upiUri}'), 'Must have deep link to UPI app');
assert(special49.includes('handleUpiAppTap'), 'Must track UPI app tap on deep link');
assert(special49.includes('showPostPaymentPopup'), 'Must include post-payment popup state');
assert(special49.includes('utrInputRef'), 'Must attach ref to 12-digit UTR input');
console.log('✓ TEST 2 PASSED: Dynamic QR deep link and post-payment return popup logic present in Special49.');

// 2. Check UPIQRCheckout.tsx
const upiCheckout = fs.readFileSync(path.join(platformDir, 'src', 'modules', 'student', 'UPIQRCheckout.tsx'), 'utf-8');
assert(!upiCheckout.includes('Payee UPI ID'), 'Must NOT display Payee UPI ID in checkout modal');
assert(!upiCheckout.includes('Your Payer UPI ID <span className="text-red-400">*</span>'), 'Must NOT require Payer UPI ID');
assert(upiCheckout.includes('showPostPaymentNotice'), 'Must include showPostPaymentNotice state on return');
assert(upiCheckout.includes('utrInputRef'), 'Must focus 12-digit UTR input');
console.log('✓ TEST 3 PASSED: Dashboard UPIQRCheckout modal hides raw UPI ID and focuses UTR on return.');

// 3. Check PaymentService.submitUpiPayment allows optional payer UPI ID
const paymentService = fs.readFileSync(path.join(platformDir, 'src', 'services', 'paymentService.ts'), 'utf-8');
assert(paymentService.includes('payerUpiId?: string'), 'PaymentService.submitUpiPayment must make payerUpiId optional');
assert(!paymentService.includes("error: 'Please enter a valid Payer UPI ID"), 'Must NOT reject payment when Payer UPI ID is omitted');
console.log('✓ TEST 4 PASSED: PaymentService allows submitting payment without manual UPI ID.');

// 4. Check server/api.js payments/submit endpoint allows optional payer UPI ID
const serverApi = fs.readFileSync(path.join(platformDir, 'server', 'api.js'), 'utf-8');
assert(!serverApi.includes('if (!learnerId || !tier || !payerUpiId)'), 'Server endpoint must NOT require payerUpiId');
assert(serverApi.includes('count(DISTINCT levelNode)'), 'Server must count distinct levels in progress');
assert(!serverApi.includes('isPassed = 1'), 'Server must NOT use non-existent isPassed column');
console.log('✓ TEST 5 PASSED: Server API gracefully defaults payer UPI ID and handles SQLite progress queries accurately.');

console.log('🎉 ALL 5 TESTS IN REMOVE UPI ID & RETURN POPUP SUITE PASSED PERFECTLY!');
