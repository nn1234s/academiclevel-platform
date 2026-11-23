import fs from 'fs';
import path from 'path';

console.log('=== TEST SUITE: Ads Pages Study Material Promotion Verification ===\n');

// 1. Verify AdsLandingPage.tsx and Special49AdsLandingPage.tsx files exist
const special49File = path.resolve('src/modules/public/Special49AdsLandingPage.tsx');
const adsLandingFile = path.resolve('src/modules/public/AdsLandingPage.tsx');
const ytAdsLandingFile = path.resolve('src/modules/public/YouTubeAdsLandingPage.tsx');

if (!fs.existsSync(special49File)) {
  throw new Error('Special49AdsLandingPage.tsx not found!');
}
if (!fs.existsSync(adsLandingFile)) {
  throw new Error('AdsLandingPage.tsx not found!');
}
if (!fs.existsSync(ytAdsLandingFile)) {
  throw new Error('YouTubeAdsLandingPage.tsx not found!');
}

console.log('✅ Core ad landing files confirmed present.');

// 2. Read Special49AdsLandingPage.tsx content
const content = fs.readFileSync(special49File, 'utf8');

// Check section ID
if (!content.includes('id="study-material-section"')) {
  throw new Error('Special49AdsLandingPage must have section with id="study-material-section"');
}
console.log('✅ Found dedicated #study-material-section anchor.');

// Check 4 Core Pillars
const pillars = [
  '1-Click Vector PDF Print',
  'Student Scratchpad Workspace',
  'Detachable NCERT Solutions',
  'Offline HTML Specimen'
];
for (const p of pillars) {
  if (!content.includes(p)) {
    throw new Error(`Missing pillar in study material section: ${p}`);
  }
}
console.log('✅ All 4 core study material pillars confirmed in ads page.');

// Check Rough work scratchpad & detachable solutions
if (!content.includes('Rough Work Scratchpad')) {
  throw new Error('Missing Rough Work Scratchpad highlight in ads page');
}
if (!content.includes('Detachable Answer Key')) {
  throw new Error('Missing Detachable Answer Key in ads page specimen');
}
console.log('✅ Authentic worksheet specimen structure (Scratchpad + Detachable Solution) verified.');

// Check Top bar navigation button
if (!content.includes('📚 Get Study Material') || !content.includes('handleScrollToStudyMaterial')) {
  throw new Error('Top sticky bar must include Get Study Material action');
}
console.log('✅ Top sticky bar contains "📚 Get Study Material" action.');

// Check Comparison table row
if (!content.includes('Study Material &amp; Worksheets') || !content.includes('Full Access to Class 1–12 Printable Worksheets')) {
  throw new Error('Comparison table must include Study Material row');
}
console.log('✅ Parent comparison table includes Study Material & Worksheets row.');

// Check FAQ entry
if (!content.includes('Do I get chapter study material and printable worksheets with this offer?')) {
  throw new Error('FAQ must include study material question');
}
console.log('✅ FAQ includes comprehensive Study Material explanation.');

// Check PracticeWorksheetViewer modal preview
if (!content.includes('PracticeWorksheetViewer') || !content.includes('showWorksheetPreviewModal')) {
  throw new Error('PracticeWorksheetViewer preview modal integration missing');
}
console.log('✅ Interactive PracticeWorksheetViewer preview modal verified.');

// 3. Verify App.tsx route handling for Ads pages
const appContent = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
const expectedRoutes = ['/special49', '/ads', '/special', '/offer', '/yt', '/ad'];
for (const r of expectedRoutes) {
  if (!appContent.includes(`'${r}': true`)) {
    throw new Error(`App.tsx ADS_ROUTES missing ${r}`);
  }
}
console.log('✅ App.tsx ADS_ROUTES confirms all ad paths route to the unified funnel.');

console.log('\n🎉 ALL ADS PAGES STUDY MATERIAL PROMOTION TESTS PASSED SUCCESSFULLY!');
