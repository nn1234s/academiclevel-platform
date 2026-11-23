# ADR 0002: Synchronous SQLite WAL Engine with Asynchronous Turso Cloud Sync

**Status:** ACCEPTED  
**Date:** 2026-11-23  
**Deciders:** Lead Systems Architect, Database Architect  
**Document ID:** AL-ADR-0002  

---

## Context
AcademicLevel serves thousands of concurrent student quiz submissions, coin ledger transactions, and question queries. Heavy external client-server databases (e.g. multi-region PostgreSQL) add latency (50–150ms per query), connection pool overhead, and substantial hosting expense for high-read assessment workloads.

Conversely, purely in-memory databases risk catastrophic data loss on server restarts.

## Decision
We implemented a **Synchronous Embedded SQLite with Cloud Replica Sync** architecture in `server/db.js` and `server/tursoClient.js`:
1. **Node 22 Built-in SQLite:** Utilizes Node.js LTS native `node:sqlite` (`DatabaseSync`), eliminating C++ native add-on build dependencies (`better-sqlite3`).
2. **High-Performance WAL Pragmas:**
   ```sql
   PRAGMA journal_mode = WAL;
   PRAGMA synchronous = NORMAL;
   PRAGMA foreign_keys = ON;
   PRAGMA busy_timeout = 5000;
   PRAGMA cache_size = -64000;
   PRAGMA temp_store = MEMORY;
   ```
   WAL mode allows concurrent readers to operate without blocking writers.
3. **Asynchronous Turso Cloud Sync:** Writes are queued in an in-memory buffer and synchronized to remote Turso cloud LibSQL instances every 5 minutes and flushed immediately on SIGTERM/SIGINT process shutdown.

## Consequences
* **Positive:** Sub-millisecond local reads (< 1ms); immune to connection pool exhaustion; zero-downtime persistence across cloud container redeployments.
* **Negative:** Single-writer concurrency boundary (adequately managed via 5000ms busy timeout and WAL mode).
