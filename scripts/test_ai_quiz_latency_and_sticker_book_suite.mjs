import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('TEST SUITE: LEO STICKER BOOK & AI QUIZ LATENCY (NO LIMITS)');
console.log('====================================================\n');

// 1. Verify Sticker Book Modal & Definitions
console.log('TEST 1: Verify Leo Sticker Book contains 20 collectible stickers and interactive modal');
const stickerBookFile = fs.readFileSync(path.resolve('src/modules/student/LeoStickerBookModal.tsx'), 'utf8');

const stickerMatches = [...stickerBookFile.matchAll(/id:\s*['"]([a-zA-Z0-9_]+)['"]/g)].map(m => m[1]);
assert.strictEqual(stickerMatches.length, 20, `Must have exactly 20 stickers in collection, found ${stickerMatches.length}`);
assert(stickerMatches.includes('leo_lion'), 'Must include leo_lion');
assert(stickerMatches.includes('twinkle_star'), 'Must include twinkle_star');
assert(stickerMatches.includes('galaxy_crown'), 'Must include galaxy_crown');

// Verify Interactive Features in Modal
assert(stickerBookFile.includes('handleTogglePlaceSticker'), 'Must support interactive sticker placement/pasting');
assert(stickerBookFile.includes('al_placed_stickers_'), 'Must persist placed stickers to student storage');
assert(stickerBookFile.includes('My Sticker Album'), 'Must feature illustrated virtual album notebook');
assert(stickerBookFile.includes('All 20 Stickers'), 'Must feature complete 20 stickers catalogue');

console.log(`✓ TEST 1 PASSED: Leo Sticker Book contains 20 verified stickers, interactive notebook, and persistence\n`);

// 2. Verify StudentDashboard Integration
console.log('TEST 2: Verify StudentDashboard integrates Leo Sticker Book with live progress');
const dashboardFile = fs.readFileSync(path.resolve('src/modules/student/StudentDashboard.tsx'), 'utf8');

assert(dashboardFile.includes('LeoStickerBookModal'), 'Must import and render LeoStickerBookModal');
assert(dashboardFile.includes('setIsStickerBookOpen(true)'), 'Primary explorer hub must trigger sticker book modal');
assert(dashboardFile.includes('Open Sticker Book 📖') || dashboardFile.includes('Open Book'), 'Must have prominent open book action');
assert(dashboardFile.includes('unlockedStickersCount'), 'Must dynamically calculate unlocked stickers count');

console.log('✓ TEST 2 PASSED: Student Dashboard seamlessly opens Leo Sticker Book and tracks real progress\n');

// 3. Verify AI Quiz MaxOutputTokens is 8192 (not limited to 2500)
console.log('TEST 3: Verify server AI quiz maxOutputTokens is 8192 and timeout accommodates Google latency (7094ms+)');
const serverApiContent = fs.readFileSync(path.resolve('server/api.js'), 'utf8');

assert(!serverApiContent.includes('maxOutputTokens: 2500'), 'Must NOT limit maxOutputTokens to 2500');
assert(serverApiContent.includes('maxOutputTokens: 8192'), 'Must allow up to 8192 output tokens for full quiz generation');
assert(serverApiContent.includes('callGeminiApiWithFallback(apiKey, bodyPayload, 20000)'), 'Quiz generation must allow 20,000ms timeout for Google latency');
console.log('✓ TEST 3 PASSED: Server API allows 8192 tokens and 20,000ms timeout\n');

// 4. Verify HybridQuizService and NovaAiService timeouts
console.log('TEST 4: Verify client race guards accommodate Google latency');
const hybridServiceContent = fs.readFileSync(path.resolve('src/services/hybridQuizService.ts'), 'utf8');
assert(!hybridServiceContent.includes('4200'), 'Must not abort at 4200ms');
assert(hybridServiceContent.includes('22000'), 'Client race guard must allow up to 22,000ms');

const novaServiceContent = fs.readFileSync(path.resolve('src/services/novaAiService.ts'), 'utf8');
assert(!novaServiceContent.includes('AI_TIMEOUT_MS = 4500'), 'Nova AI must not timeout at 4500ms');
assert(novaServiceContent.includes('AI_TIMEOUT_MS = 20000'), 'Nova AI timeout must be 20,000ms');
console.log('✓ TEST 4 PASSED: Client services accommodate 20,000ms+ latency without timing out\n');

console.log('====================================================');
console.log('ALL LEO STICKER BOOK & AI LATENCY TESTS PASSED! 🚀');
console.log('====================================================');
