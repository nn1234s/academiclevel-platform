import fs from 'fs';
import path from 'path';
import assert from 'assert';

const ROOT_DIR = process.cwd();

console.log('🧪 Starting "Developed by Student" & Hidden Class Audit...');

// 1. Audit KidFounderGlazeShowcase.tsx
const showcasePath = path.join(ROOT_DIR, 'src', 'modules', 'shared', 'KidFounderGlazeShowcase.tsx');
const showcaseContent = fs.readFileSync(showcasePath, 'utf8');

assert(!showcaseContent.toLowerCase().includes('grade 5'), 'FAIL: KidFounderGlazeShowcase.tsx must not contain "grade 5"');
assert(!showcaseContent.toLowerCase().includes('grade5'), 'FAIL: KidFounderGlazeShowcase.tsx must not contain "grade5"');
assert(!showcaseContent.toLowerCase().includes('class 5'), 'FAIL: KidFounderGlazeShowcase.tsx must not contain "class 5"');
assert(!showcaseContent.includes('Grade 5 Prodigy'), 'FAIL: KidFounderGlazeShowcase.tsx must not contain "Grade 5 Prodigy"');
assert(showcaseContent.includes('Developed by Student'), 'FAIL: KidFounderGlazeShowcase.tsx must state "Developed by Student"');
assert(showcaseContent.includes('Developed by a Student for Students'), 'FAIL: KidFounderGlazeShowcase.tsx must state "Developed by a Student for Students"');
assert(showcaseContent.includes('student developer'), 'FAIL: KidFounderGlazeShowcase.tsx must describe creator as "student developer"');

console.log('✅ 1. KidFounderGlazeShowcase.tsx verified: "Developed by Student" present, grade 5 and class hidden.');

// 2. Audit LandingPage.tsx
const landingPath = path.join(ROOT_DIR, 'src', 'modules', 'public', 'LandingPage.tsx');
const landingContent = fs.readFileSync(landingPath, 'utf8');

assert(!landingContent.includes('Class 5'), 'FAIL: LandingPage.tsx student reviews should not expose Class 5');
assert(!landingContent.includes('Grade 5'), 'FAIL: LandingPage.tsx should not contain Grade 5');

console.log('✅ 2. LandingPage.tsx verified: Class 5 and Grade 5 hidden.');

// 3. Audit Special49AdsLandingPage.tsx
const adsPath = path.join(ROOT_DIR, 'src', 'modules', 'public', 'Special49AdsLandingPage.tsx');
const adsContent = fs.readFileSync(adsPath, 'utf8');

assert(!adsContent.includes('Parent of Class 5 Student'), 'FAIL: Special49AdsLandingPage.tsx should not expose Parent of Class 5 Student');
assert(!adsContent.includes('Class 5 Scholar'), 'FAIL: Special49AdsLandingPage.tsx should not expose Class 5 Scholar');

console.log('✅ 3. Special49AdsLandingPage.tsx verified: Parent of Class 5 and Class 5 Scholar hidden.');

console.log('\n🎉 ALL "DEVELOPED BY STUDENT" & HIDDEN CLASS AUDIT CHECKS PASSED!\n');
