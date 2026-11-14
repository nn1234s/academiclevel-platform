import fs from 'node:fs';
import path from 'node:path';

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

// Replicate single record upsert to Turso asynchronously
export function replicateUpsertAsync(table, record) {
  if (!record || typeof record !== 'object') return;
  const cols = Object.keys(record);
  if (cols.length === 0) return;

  const placeholders = cols.map(() => '?').join(', ');
  const sql = `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders});`;
  const args = cols.map(c => record[c]);

  // Fire and forget, logged on failure
  executeTurso(sql, args).catch(err => {
    console.warn(`[Turso Replication Error: ${table}]`, err.message);
  });
}

// Pull all dynamic user records from Turso into the local SQLite database
export async function pullAllFromTurso(localDb) {
  if (!TURSO_CONFIG.url || !TURSO_CONFIG.authToken) return false;

  console.log('[Turso] Checking cloud database for stored learner records...');

  // Enforce zero-tolerance purge of dummy test accounts across local and cloud
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
    'scholarships', 'scholarship_claims', 'weekly_challenges'
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

// Push all local SQLite data to Turso
export async function pushAllToTurso(localDb) {
  if (!TURSO_CONFIG.url || !TURSO_CONFIG.authToken) return false;

  console.log('[Turso] Pushing local SQLite data to Turso cloud...');

  // Ensure cloud database does not receive or keep dummy test accounts
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
    await executeTurso(DUMMY_DELETE_SQL);
  } catch {}

  const tables = [
    'learners', 'subscriptions', 'coin_ledger', 'gift_requests',
    'quiz_attempts', 'course_progress', 'certificates', 'acodes',
    'security_audit_logs', 'sessions', 'friendships', 'student_messages',
    'scholarships', 'scholarship_claims', 'weekly_challenges'
  ];

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

      const cols = Object.keys(rows[0]);
      const placeholders = cols.map(() => '?').join(', ');
      const sql = `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders});`;

      const chunkSize = 50;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const slice = rows.slice(i, i + chunkSize);
        const batch = slice.map(r => ({ sql, args: cols.map(c => r[c]) }));
        await executeTursoBatch(batch);
      }
      console.log(`[Turso] Synced ${rows.length} rows for '${table}' to cloud.`);
    } catch (err) {
      console.warn(`[Turso Push Error: ${table}]`, err.message);
    }
  }
  return true;
}

// Start background periodic synchronization to Turso
export function startPeriodicSync(localDb, intervalMs = 60000) {
  if (!TURSO_CONFIG.url || !TURSO_CONFIG.authToken) return null;

  console.log(`[Turso] Starting background cloud persistence sync (every ${intervalMs / 1000}s)...`);
  const timer = setInterval(async () => {
    try {
      await pushAllToTurso(localDb);
    } catch (err) {
      console.warn('[Turso Periodic Sync Error]', err.message);
    }
  }, intervalMs);

  // Unref timer so it doesn't block process exit
  if (timer.unref) {
    timer.unref();
  }
  return timer;
}

