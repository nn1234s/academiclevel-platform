import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToUpdate = [
  'docs/00-governance/system-overview-and-scope.md',
  'docs/03-architecture/system-and-software-architecture.md',
  'docs/04-runtime/behavioral-and-runtime-architecture.md',
  'docs/05-data-integrations/data-dictionary-and-api-specifications.md',
  'docs/06-engineering/development-handoff.md',
  'docs/07-quality/master-test-strategy-and-verification.md',
  'docs/09-operations/operations-sre-and-continuity-runbook.md',
  'docs/11-grc/compliance-applicability-and-risk-register.md',
  'docs/12-third-party/vendor-and-subprocessor-inventory.md',
  'docs/14-research-evidence/claim-evidence-matrix.md',
  'docs/14-research-evidence/initial-repository-baseline.md',
  'docs/adr/0001-hybrid-quiz-and-offline-bank-architecture.md',
  'docs/CHANGELOG.md'
];

for (const rel of filesToUpdate) {
  const full = path.resolve(__dirname, '..', rel);
  if (fs.existsSync(full)) {
    let content = fs.readFileSync(full, 'utf8');
    content = content
      .replace(/12[,.]?000\s*\+\s*question/gi, '3,600+ question')
      .replace(/12[,.]?000\s*question/gi, '3,600 question')
      .replace(/12[,.]?000\s*verified/gi, '3,600 verified')
      .replace(/12[,.]?000\s*curriculum/gi, '3,600 curriculum')
      .replace(/12k question bank/gi, '3,600 master question bank')
      .replace(/12k bank/gi, '3,600 bank')
      .replace(/12k Database/gi, '3,600 Database')
      .replace(/"questionBankCount":\s*12000/g, '"questionBankCount": 3600')
      .replace(/12k SQLite Question Bank/gi, '3,600 SQLite Question Bank')
      .replace(/12[,.]?000 distinct/gi, '3,600 distinct')
      .replace(/12[,.]?000 rows/gi, '3,600 rows')
      .replace(/12[,.]?000 Question Curriculum Bank/gi, '3,600 Master Question Curriculum Bank');
    fs.writeFileSync(full, content, 'utf8');
    console.log('Updated:', rel);
  }
}
console.log('Docs replacement complete.');
