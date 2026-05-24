const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_PATH = path.resolve(process.env.DB_PATH || './freefile.db');

let db = null;

// Persist DB to disk on each write
function saveDb() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON;');
  initializeSchema();
  return db;
}

function initializeSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    );
  `);
  saveDb();
}

// sql.js uses a synchronous but different API — wrap it to look like better-sqlite3
function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return {
    prepare(sql) {
      return {
        get(...params) {
          const stmt = db.prepare(sql);
          stmt.bind(params);
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          }
          stmt.free();
          return undefined;
        },
        all(...params) {
          const rows = [];
          const stmt = db.prepare(sql);
          stmt.bind(params);
          while (stmt.step()) rows.push(stmt.getAsObject());
          stmt.free();
          return rows;
        },
        run(...params) {
          db.run(sql, params);
          const lastId = db.exec('SELECT last_insert_rowid()')[0]?.values[0][0];
          const changes = db.exec('SELECT changes()')[0]?.values[0][0];
          saveDb();
          return { lastInsertRowid: lastId, changes };
        }
      };
    },
    exec(sql) {
      const result = db.exec(sql);
      saveDb();
      return result;
    }
  };
}

module.exports = { initDb, getDb };
