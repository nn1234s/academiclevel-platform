import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT_DIR, 'server', 'data', 'academiclevel_prod.db');
const BACKUPS_DIR = path.join(ROOT_DIR, 'server', 'backups');

const MAX_BACKUPS_RETAINED = 10;

function runBackup() {
  console.log('====================================================');
  console.log('📦 ACADEMICLEVEL DATABASE BACKUP & INTEGRITY SERVICE');
  console.log('====================================================');

  if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ Source database not found at: ${DB_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    console.log(`📁 Created backup directory: ${BACKUPS_DIR}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `academiclevel_backup_${timestamp}.db`;
  const backupFilePath = path.join(BACKUPS_DIR, backupFileName);

  console.log(`🔄 Initiating atomic hot backup from: ${DB_PATH}`);
  const startTime = Date.now();

  try {
    // Open connection to primary DB
    const liveDb = new DatabaseSync(DB_PATH);

    // Use SQLite's VACUUM INTO for atomic snapshot
    // In node:sqlite, run VACUUM INTO
    const normalizedBackupPath = backupFilePath.replace(/\\/g, '/');
    liveDb.exec(`VACUUM INTO '${normalizedBackupPath}'`);
    liveDb.close();

    const durationMs = Date.now() - startTime;
    const stats = fs.statSync(backupFilePath);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ Backup file generated: ${backupFileName} (${sizeMb} MB) in ${durationMs}ms`);

    // Verify backup integrity
    console.log(`🔍 Verifying integrity of backup file...`);
    const backupDb = new DatabaseSync(backupFilePath);
    const integrity = backupDb.prepare('PRAGMA integrity_check').get();

    if (integrity.integrity_check !== 'ok') {
      backupDb.close();
      throw new Error(`Integrity check failed: ${JSON.stringify(integrity)}`);
    }

    const learnerCount = backupDb.prepare('SELECT count(*) as c FROM learners').get().c;
    const qbCount = backupDb.prepare('SELECT count(*) as c FROM question_bank').get().c;
    const ledgerCount = backupDb.prepare('SELECT count(*) as c FROM coin_ledger').get().c;

    backupDb.close();

    console.log(`🛡️ Integrity Check: PASS (PRAGMA integrity_check: ok)`);
    console.log(`📊 Snapshot Counts: ${learnerCount} learners, ${qbCount} questions, ${ledgerCount} ledger entries.`);

    // Enforce retention policy
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith('academiclevel_backup_') && f.endsWith('.db'))
      .map(f => ({ name: f, path: path.join(BACKUPS_DIR, f), time: fs.statSync(path.join(BACKUPS_DIR, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time);

    if (files.length > MAX_BACKUPS_RETAINED) {
      console.log(`🧹 Rotating older backups (retaining top ${MAX_BACKUPS_RETAINED})...`);
      for (let i = MAX_BACKUPS_RETAINED; i < files.length; i++) {
        fs.unlinkSync(files[i].path);
        console.log(`   - Removed old archive: ${files[i].name}`);
      }
    }

    console.log('====================================================');
    console.log('🎉 BACKUP COMPLETED & VERIFIED SUCCESSFULLY');
    console.log('====================================================');
    return { success: true, backupFilePath, sizeMb, durationMs };
  } catch (err) {
    console.error('❌ Backup operation failed:', err);
    process.exit(1);
  }
}

runBackup();
