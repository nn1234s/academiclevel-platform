import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Safely load local .env file if running in local environment
try {
  if (process.loadEnvFile) {
    process.loadEnvFile();
  }
} catch {}

export const TURSO_CONFIG = {
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || ''
};

function getPipelineUrl(rawUrl) {
  let u = (rawUrl || '').trim();
  if (u.startsWith('libsql://')) {
    u = u.replace('libsql://', 'https://');
  }
  if (!u.endsWith('/v2/pipeline')) {
    u = u.replace(/\/+$/, '') + '/v2/pipeline';
  }
  return u;
}

export async function executeTurso(sql, args = []) {
  if (!TURSO_CONFIG.url || !TURSO_CONFIG.authToken) return null;

  const pipelineUrl = getPipelineUrl(TURSO_CONFIG.url);
  const formattedArgs = (args || []).map(val => {
    if (val === null || val === undefined) return { type: 'null' };
    if (typeof val === 'number') {
      return Number.isInteger(val) ? { type: 'integer', value: String(val) } : { type: 'float', value: val };
    }
    return { type: 'text', value: String(val) };
  });

  try {
    const res = await fetch(pipelineUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURSO_CONFIG.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          { type: 'execute', stmt: { sql, args: formattedArgs } },
          { type: 'close' }
        ]
      })
    });

    if (!res.ok) {
      console.warn(`[Turso HTTP ${res.status}]`, await res.text());
      return null;
    }

    const data = await res.json();
    const result = data.results?.[0];
    if (result?.type === 'ok') {
      return result.response?.result;
    } else if (result?.type === 'error') {
      console.warn('[Turso Execute Error]', result.error?.message);
    }
    return null;
  } catch (err) {
    console.warn('[Turso Network Error]', err.message);
    return null;
  }
}

export async function queryTurso(sql, args = []) {
  const result = await executeTurso(sql, args);
  if (!result || !result.cols || !result.rows) return [];

  const cols = result.cols.map(c => c.name);
  return result.rows.map(row => {
    const obj = {};
    row.forEach((cell, idx) => {
      const colName = cols[idx];
      if (cell.type === 'null') {
        obj[colName] = null;
      } else if (cell.type === 'integer') {
        obj[colName] = Number(cell.value);
      } else if (cell.type === 'float') {
        obj[colName] = Number(cell.value);
      } else {
        obj[colName] = cell.value;
      }
    });
    return obj;
  });
}

export async function executeTursoBatch(statements) {
  if (!TURSO_CONFIG.url || !TURSO_CONFIG.authToken) return [];
  if (!statements || statements.length === 0) return [];

  const pipelineUrl = getPipelineUrl(TURSO_CONFIG.url);
  const requests = statements.map(s => {
    if (typeof s === 'string') {
      return { type: 'execute', stmt: { sql: s } };
    }
    const formattedArgs = (s.args || []).map(val => {
      if (val === null || val === undefined) return { type: 'null' };
      if (typeof val === 'number') {
        return Number.isInteger(val) ? { type: 'integer', value: String(val) } : { type: 'float', value: val };
      }
      return { type: 'text', value: String(val) };
    });
    return { type: 'execute', stmt: { sql: s.sql, args: formattedArgs } };
  });

  requests.push({ type: 'close' });

  try {
    const res = await fetch(pipelineUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURSO_CONFIG.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    if (!res.ok) {
      console.warn(`[Turso Batch HTTP ${res.status}]`, await res.text());
      return [];
    }

    const json = await res.json();
    return json.results || [];
  } catch (err) {
    console.warn('[Turso Batch Network Error]', err.message);
    return [];
  }
}

// =========================================================================
// ZERO-WRITE-AMPLIFICATION DIRTY TRACKING ENGINE
// Tracks exact content hashes of every synced row to completely eliminate
// redundant database writes and prevent Turso free tier exhaustion.
// =========================================================================

export const syncedRowHashes = new Map();

export function getRowKey(table, row) {
  if (!row || typeof row !== 'object') return '';
  if (table === 'coin_ledger') return String(row.entryId || row.id || '');
  if (table === 'acodes') return String(row.code || row.id || '');
  if (table === 'sessions') return String(row.token || row.id || '');
  if (table === 'system_settings') return String(row.key || row.id || '');
  return String(row.id || row.entryId || row.code || row.token || row.key || '');
}

export function computeRowHash(row) {
  if (!row || typeof row !== 'object') return '';
  const sortedKeys = Object.keys(row).sort();
  const sortedObj = {};
  for (const k of sortedKeys) {
    sortedObj[k] = row[k];
  }
  return crypto.createHash('md5').update(JSON.stringify(sortedObj)).digest('hex');
}

// In-memory write buffer for debounced batch persistence
const writeBuffer = new Map();
let flushTimer = null;
let isFlushing = false;

export async function flushTursoWriteBuffer() {
  if (writeBuffer.size === 0 || isFlushing) return 0;
  if (!TURSO_CONFIG.url || !TURSO_CONFIG.authToken) {
    writeBuffer.clear();
    return 0;
  }

  isFlushing = true;
  const entries = Array.from(writeBuffer.values());
  writeBuffer.clear();

  try {
    const chunkSize = 50;
    let totalFlushed = 0;
    for (let i = 0; i < entries.length; i += chunkSize) {
      const chunk = entries.slice(i, i + chunkSize);
      const batch = chunk.map(item => ({ sql: item.sql, args: item.args }));
      await executeTursoBatch(batch);
      for (const item of chunk) {
        const key = `${item.table}:${getRowKey(item.table, item.record)}`;
        syncedRowHashes.set(key, computeRowHash(item.record));
      }
      totalFlushed += chunk.length;
    }
    return totalFlushed;
  } catch (err) {
    console.warn('[Turso Buffer Flush Error]:', err.message);
    return 0;
  } finally {
    isFlushing = false;
  }
}

// Replicate single record upsert to Turso asynchronously with zero-write dirty checking
export function replicateUpsertAsync(table, record, { immediate = false } = {}) {
  if (!record || typeof record !== 'object') return;
  if (!TURSO_CONFIG.url || !TURSO_CONFIG.authToken) return;

  const key = `${table}:${getRowKey(table, record)}`;
  const currentHash = computeRowHash(record);

  // If the record in Turso already has the exact same content, skip completely
  if (syncedRowHashes.get(key) === currentHash) {
    return;
  }

  const cols = Object.keys(record);
  if (cols.length === 0) return;

  const placeholders = cols.map(() => '?').join(', ');
  const sql = `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders});`;
  const args = cols.map(c => record[c]);

  if (immediate) {
    executeTurso(sql, args).then(() => {
      syncedRowHashes.set(key, currentHash);
    }).catch(err => {
      console.warn(`[Turso Replication Error: ${table}]`, err.message);
    });
    return;
  }

  // Queue into write buffer (debounced flush within 1.5s or max 50 items)
  writeBuffer.set(key, { table, record, sql, args });

  if (writeBuffer.size >= 50) {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = null;
    flushTursoWriteBuffer();
  } else if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushTursoWriteBuffer();
    }, 1500);
    if (flushTimer.unref) flushTimer.unref();
  }
}

// Delete single record in Turso asynchronously
export function deleteTursoRecordAsync(table, idColumn, idValue) {
  if (!idValue || !TURSO_CONFIG.url || !TURSO_CONFIG.authToken) return;
  const sql = `DELETE FROM ${table} WHERE ${idColumn} = ?;`;
  executeTurso(sql, [idValue]).catch(err => {
    console.warn(`[Turso Delete Error: ${table}]`, err.message);
  });
  syncedRowHashes.delete(`${table}:${idValue}`);
}

// Pull all dynamic user records from Turso into the local SQLite database on boot
export async function pullAllFromTurso(localDb) {
  if (!TURSO_CONFIG.url || !TURSO_CONFIG.authToken) return false;

  console.log('[Turso] Checking cloud database for stored learner records...');

  // Enforce zero-tolerance purge of dummy test accounts on boot
  const DUMMY_DELETE_SQL = `
    DELETE FROM learners WHERE 
      email LIKE '%@example.com' OR 
      email LIKE '%@academiclevel.test' OR 
      email LIKE '%@test.com' OR 
      email LIKE '%friend%@gmail.com' OR 
      email = 'user@gmail.com' OR 
      email LIKE 'audit_%@academiclevel.in'
  `;
  try {
    localDb.prepare(DUMMY_DELETE_SQL).run();
    await executeTurso(DUMMY_DELETE_SQL);
  } catch {}

  const tables = [
    'learners', 'subscriptions', 'coin_ledger', 'gift_requests',
    'quiz_attempts', 'course_progress', 'certificates', 'acodes',
    'security_audit_logs', 'sessions', 'friendships', 'student_messages',
    'scholarships', 'scholarship_claims', 'weekly_challenges', 'system_settings'
  ];

  let totalRestored = 0;
  for (const table of tables) {
    try {
      let rows = await queryTurso(`SELECT * FROM ${table};`);
      if (table === 'learners' && Array.isArray(rows)) {
        rows = rows.filter(r => {
          const em = (r.email || '').toLowerCase();
          return !em.includes('@example.com') && 
                 !em.includes('@academiclevel.test') && 
                 !em.includes('@test.com') && 
                 !em.includes('friend@gmail.com') && 
                 em !== 'user@gmail.com' && 
                 !em.startsWith('audit_');
        });
      }

      if (rows && rows.length > 0) {
        const cols = Object.keys(rows[0]);
        const placeholders = cols.map(() => '?').join(', ');
        const insertStmt = localDb.prepare(`INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`);

        localDb.exec('BEGIN TRANSACTION');
        for (const row of rows) {
          insertStmt.run(...cols.map(c => row[c]));
          // Register pulled row into synced cache so periodic checks know it's already in Turso
          const key = `${table}:${getRowKey(table, row)}`;
          syncedRowHashes.set(key, computeRowHash(row));
        }
        localDb.exec('COMMIT');
        totalRestored += rows.length;
        console.log(`[Turso] Restored ${rows.length} rows for '${table}' into local SQLite.`);
      }
    } catch (tblErr) {
      console.warn(`[Turso Pull Table Warning: ${table}]`, tblErr.message);
    }
  }

  console.log(`[Turso] Cloud synchronization complete! Restored ${totalRestored} total records.`);
  return true;
}

// Push local SQLite data to Turso with dirty checking (ONLY modified or new rows are sent)
export async function pushAllToTurso(localDb, { forceAll = false } = {}) {
  if (!TURSO_CONFIG.url || !TURSO_CONFIG.authToken) return false;

  // Flush any in-flight buffered writes first
  await flushTursoWriteBuffer();

  // Only purge dummy accounts if any actually exist in local database
  try {
    const dummyCount = localDb.prepare(`
      SELECT count(*) as count FROM learners WHERE 
        email LIKE '%@example.com' OR 
        email LIKE '%@academiclevel.test' OR 
        email LIKE '%@test.com' OR 
        email LIKE '%friend%@gmail.com' OR 
        email = 'user@gmail.com' OR 
        email LIKE 'audit_%@academiclevel.in'
    `).get().count;

    if (dummyCount > 0) {
      const DUMMY_DELETE_SQL = `
        DELETE FROM learners WHERE 
          email LIKE '%@example.com' OR 
          email LIKE '%@academiclevel.test' OR 
          email LIKE '%@test.com' OR 
          email LIKE '%friend%@gmail.com' OR 
          email = 'user@gmail.com' OR 
          email LIKE 'audit_%@academiclevel.in'
      `;
      localDb.prepare(DUMMY_DELETE_SQL).run();
      await executeTurso(DUMMY_DELETE_SQL);
    }
  } catch {}

  const tables = [
    'learners', 'subscriptions', 'coin_ledger', 'gift_requests',
    'quiz_attempts', 'course_progress', 'certificates', 'acodes',
    'security_audit_logs', 'sessions', 'friendships', 'student_messages',
    'scholarships', 'scholarship_claims', 'weekly_challenges', 'system_settings'
  ];

  let totalDirtySynced = 0;

  for (const table of tables) {
    try {
      let rows = localDb.prepare(`SELECT * FROM ${table}`).all();
      if (!rows || rows.length === 0) continue;

      if (table === 'learners') {
        rows = rows.filter(r => {
          const em = (r.email || '').toLowerCase();
          return !em.includes('@example.com') && 
                 !em.includes('@academiclevel.test') && 
                 !em.includes('@test.com') && 
                 !em.includes('friend@gmail.com') && 
                 em !== 'user@gmail.com' && 
                 !em.startsWith('audit_');
        });
      }
      if (rows.length === 0) continue;

      // Filter rows that are genuinely dirty (hash mismatch or missing in synced cache)
      const dirtyRows = forceAll ? rows : rows.filter(r => {
        const key = `${table}:${getRowKey(table, r)}`;
        const currentHash = computeRowHash(r);
        return syncedRowHashes.get(key) !== currentHash;
      });

      if (dirtyRows.length === 0) {
        // Zero rows changed for this table — SKIPPED! ZERO writes!
        continue;
      }

      const cols = Object.keys(dirtyRows[0]);
      const placeholders = cols.map(() => '?').join(', ');
      const sql = `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders});`;

      const chunkSize = 50;
      for (let i = 0; i < dirtyRows.length; i += chunkSize) {
        const slice = dirtyRows.slice(i, i + chunkSize);
        const batch = slice.map(r => ({ sql, args: cols.map(c => r[c]) }));
        await executeTursoBatch(batch);
        for (const r of slice) {
          const key = `${table}:${getRowKey(table, r)}`;
          syncedRowHashes.set(key, computeRowHash(r));
        }
      }

      totalDirtySynced += dirtyRows.length;
      console.log(`[Turso] Synced ${dirtyRows.length} dirty/modified rows for '${table}' to cloud.`);
    } catch (err) {
      console.warn(`[Turso Push Error: ${table}]`, err.message);
    }
  }

  if (totalDirtySynced > 0) {
    console.log(`[Turso] Delta push complete: ${totalDirtySynced} dirty rows synchronized to cloud.`);
  }
  return true;
}

// Start background periodic safety synchronization to Turso (default: every 5 minutes with zero-write delta checks)
export function startPeriodicSync(localDb, intervalMs = 300000) {
  if (!TURSO_CONFIG.url || !TURSO_CONFIG.authToken) return null;

  console.log(`[Turso] Starting background safety sync (every ${intervalMs / 1000}s with zero-write delta checking)...`);
  const timer = setInterval(async () => {
    try {
      await pushAllToTurso(localDb);
    } catch (err) {
      console.warn('[Turso Periodic Sync Error]', err.message);
    }
  }, intervalMs);

  // Daily automated zero-cost housekeeping (pruning expired sessions and old logs)
  const maintenanceTimer = setInterval(() => {
    runAutomatedMaintenance(localDb);
  }, 24 * 60 * 60 * 1000);

  // Unref timers so they don't block process exit
  if (timer.unref) timer.unref();
  if (maintenanceTimer.unref) maintenanceTimer.unref();

  return timer;
}

// Automated zero-cost database maintenance to keep Turso storage permanently lean
export function runAutomatedMaintenance(localDb) {
  try {
    // 1. Purge expired auth sessions in local DB and Turso
    const expiredRes = localDb.prepare("DELETE FROM sessions WHERE datetime(expiresAt) < datetime('now')").run();
    if (expiredRes && expiredRes.changes > 0) {
      console.log(`[Maintenance] Purged ${expiredRes.changes} expired session tokens.`);
      executeTurso("DELETE FROM sessions WHERE datetime(expiresAt) < datetime('now');").catch(() => {});
    }

    // 2. Retain 90 days of security audit logs
    const auditRes = localDb.prepare("DELETE FROM security_audit_logs WHERE datetime(timestampUtc) < datetime('now', '-90 days')").run();
    if (auditRes && auditRes.changes > 0) {
      console.log(`[Maintenance] Purged ${auditRes.changes} historical audit logs older than 90 days.`);
      executeTurso("DELETE FROM security_audit_logs WHERE datetime(timestampUtc) < datetime('now', '-90 days');").catch(() => {});
    }

    // 3. Keep local SQLite WAL file compact
    localDb.exec('PRAGMA wal_checkpoint(PASSIVE);');
  } catch (err) {
    console.warn('[Maintenance Non-fatal Warning]:', err.message);
  }
}
