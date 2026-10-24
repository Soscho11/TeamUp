/**
 * Migration runner for TeamUp V2 Features:
 * - Bookmarks (Watchlist)
 * - Project Discussions (Public Q&A & Team Internal)
 * - Project Tasks & Milestones (Kanban Board)
 */
const path = require('path');
const dotenv = require('../backend/node_modules/dotenv');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const mysql = require('../backend/node_modules/mysql2/promise');

async function runMigration() {
  const connectionUrl = process.env.DATABASE_URL || process.argv[2];

  let connection;
  if (connectionUrl) {
    console.log('Connecting to Cloud MySQL database...');
    const parsed = new URL(connectionUrl);
    connection = await mysql.createConnection({
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, '') || 'defaultdb',
      ssl: { rejectUnauthorized: false },
      multipleStatements: true,
    });
  } else {
    console.log('Connecting to Local MySQL database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'RootPassword123!',
      database: process.env.DB_NAME || 'teamup_db',
      multipleStatements: true,
    });
  }

  try {
    console.log('Executing V2 migration tables...');

    // 1. Bookmarks table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        user_id INT NOT NULL,
        project_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, project_id),
        INDEX idx_bookmarks_user (user_id),
        CONSTRAINT fk_bookmarks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_bookmarks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Created bookmarks table.');

    // 2. Project Discussions table (Public Q&A & Team Internal)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS project_discussions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        type ENUM('public_qa', 'team_internal') NOT NULL DEFAULT 'public_qa',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_discussions_project (project_id, type),
        CONSTRAINT fk_discussions_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT fk_discussions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Created project_discussions table.');

    // 3. Project Tasks table (Kanban Board)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS project_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NULL,
        status ENUM('todo', 'in_progress', 'completed') NOT NULL DEFAULT 'todo',
        priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
        assigned_to INT NULL,
        created_by INT NOT NULL,
        due_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tasks_project (project_id, status),
        CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT fk_tasks_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        CONSTRAINT fk_tasks_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Created project_tasks table.');

    console.log('V2 Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    throw err;
  } finally {
    await connection.end();
  }
}

runMigration().catch((err) => {
  console.error(err);
  process.exit(1);
});
