// Database Schema & Seed Migration Runner for Cloud MySQL (e.g. Aiven, Railway, Render)
const mysql = require('../backend/node_modules/mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const connectionUrl = process.env.DATABASE_URL || process.argv[2];

  if (!connectionUrl) {
    console.error('Error: Please provide DATABASE_URL environment variable or as an argument.');
    console.error('Usage: node database/migrate.js "mysql://user:pass@host:port/database?ssl-mode=REQUIRED"');
    process.exit(1);
  }

  console.log('Connecting to Cloud MySQL database...');
  const parsed = new URL(connectionUrl);

  const connection = await mysql.createConnection({
    host: parsed.hostname,
    port: parseInt(parsed.port, 10) || 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, '') || 'defaultdb',
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
  });

  try {
    const [dbInfo] = await connection.execute('SELECT DATABASE() AS current_db, VERSION() AS version');
    console.log(`Connected to database "${dbInfo[0].current_db}" on MySQL ${dbInfo[0].version}`);

    console.log('Creating database tables...');

    // 1. Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        university VARCHAR(150) NOT NULL,
        department VARCHAR(150) NOT NULL,
        bio TEXT NULL,
        github_url VARCHAR(255) NULL,
        portfolio_url VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_email (email),
        INDEX idx_users_university (university)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Skills master table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        normalized_name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_skills_normalized (normalized_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. User skills table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_skills (
        user_id INT NOT NULL,
        skill_id INT NOT NULL,
        proficiency_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'intermediate',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, skill_id),
        CONSTRAINT fk_user_skills_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_user_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Projects table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        summary VARCHAR(300) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        desired_team_size INT NOT NULL DEFAULT 4,
        collaboration_type ENUM('academic', 'hackathon', 'open_source', 'startup', 'hobby') NOT NULL DEFAULT 'academic',
        repository_url VARCHAR(255) NULL,
        status ENUM('recruiting', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'recruiting',
        goals TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_projects_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_projects_category (category),
        INDEX idx_projects_status (status),
        INDEX idx_projects_created_at (created_at),
        INDEX idx_projects_owner (owner_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Project skills
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS project_skills (
        project_id INT NOT NULL,
        skill_id INT NOT NULL,
        PRIMARY KEY (project_id, skill_id),
        CONSTRAINT fk_project_skills_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT fk_project_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Project members
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS project_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        role VARCHAR(100) NOT NULL DEFAULT 'Member',
        membership_status ENUM('active', 'inactive', 'left', 'removed') NOT NULL DEFAULT 'active',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_project_user (project_id, user_id),
        CONSTRAINT fk_project_members_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT fk_project_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_project_members_status (membership_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Join requests
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS join_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NULL,
        status ENUM('pending', 'accepted', 'rejected', 'withdrawn') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_join_requests_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT fk_join_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_join_requests_status (status),
        INDEX idx_join_requests_lookup (project_id, user_id, status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Notifications
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('join_request_received', 'join_request_accepted', 'join_request_rejected', 'member_added', 'member_removed', 'project_status_changed') NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        related_project_id INT NULL,
        related_request_id INT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_notifications_project FOREIGN KEY (related_project_id) REFERENCES projects(id) ON DELETE SET NULL,
        CONSTRAINT fk_notifications_request FOREIGN KEY (related_request_id) REFERENCES join_requests(id) ON DELETE SET NULL,
        INDEX idx_notifications_user_read (user_id, is_read, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Tables verified and created successfully.');

    // Check if users exist before inserting seed data
    const [userCount] = await connection.execute('SELECT COUNT(*) AS count FROM users');
    if (userCount[0].count === 0) {
      console.log('Populating seed students, skills, and projects...');

      // Skills
      await connection.execute(`
        INSERT INTO skills (id, name, normalized_name) VALUES
        (1, 'React', 'react'),
        (2, 'Node.js', 'node.js'),
        (3, 'Express.js', 'express.js'),
        (4, 'MySQL', 'mysql'),
        (5, 'Python', 'python'),
        (6, 'Machine Learning', 'machine learning'),
        (7, 'TensorFlow', 'tensorflow'),
        (8, 'CSS3', 'css3'),
        (9, 'Docker', 'docker'),
        (10, 'Cybersecurity', 'cybersecurity'),
        (11, 'Flutter', 'flutter'),
        (12, 'Git', 'git'),
        (13, 'REST APIs', 'rest apis'),
        (14, 'Figma', 'figma'),
        (15, 'Data Science', 'data science')
        ON DUPLICATE KEY UPDATE name=VALUES(name);
      `);

      // Users
      await connection.execute(`
        INSERT INTO users (id, name, email, password_hash, university, department, bio, github_url, portfolio_url) VALUES
        (1, 'Rahim Ahmed', 'rahim.ahmed@example.edu', '$2b$10$y0O4kCvp4plcrgmgJcfBm.ZlmsyW.QLUFn8WnAK9Zmq1aJ1QON2BG', 'BUET', 'Computer Science and Engineering', 'Full-stack software engineer interested in distributed systems, clean REST APIs, and scalable web apps.', 'https://github.com/rahimahmed', 'https://rahimahmed.dev'),
        (2, 'Fatima Zaman', 'fatima.zaman@example.edu', '$2b$10$y0O4kCvp4plcrgmgJcfBm.ZlmsyW.QLUFn8WnAK9Zmq1aJ1QON2BG', 'Dhaka University', 'Computer Science', 'Machine learning enthusiast and Python developer focusing on computer vision and healthcare analytics.', 'https://github.com/fatimazaman', 'https://fatimazaman.me'),
        (3, 'Tanvir Hasan', 'tanvir.hasan@example.edu', '$2b$10$y0O4kCvp4plcrgmgJcfBm.ZlmsyW.QLUFn8WnAK9Zmq1aJ1QON2BG', 'NSU', 'Electrical and Computer Engineering', 'Frontend engineer passionate about modern UI design systems, performance optimization, and accessibility.', 'https://github.com/tanvirhasan', 'https://tanvir.dev'),
        (4, 'Anika Tabassum', 'anika.tabassum@example.edu', '$2b$10$y0O4kCvp4plcrgmgJcfBm.ZlmsyW.QLUFn8WnAK9Zmq1aJ1QON2BG', 'BRAC University', 'Computer Science', 'Application security researcher and backend engineer with an interest in penetration testing and secure coding.', 'https://github.com/anikatabassum', 'https://anika-sec.net'),
        (5, 'Siam Chowdhury', 'siam.chowdhury@example.edu', '$2b$10$y0O4kCvp4plcrgmgJcfBm.ZlmsyW.QLUFn8WnAK9Zmq1aJ1QON2BG', 'IUT', 'Software Engineering', 'Cross-platform mobile developer and cloud enthusiast experienced in Flutter and React ecosystem.', 'https://github.com/siamchowdhury', 'https://siamdev.io')
        ON DUPLICATE KEY UPDATE name=VALUES(name);
      `);

      // User skills
      await connection.execute(`
        INSERT INTO user_skills (user_id, skill_id, proficiency_level) VALUES
        (1, 1, 'advanced'), (1, 2, 'advanced'), (1, 3, 'advanced'), (1, 4, 'intermediate'),
        (2, 5, 'advanced'), (2, 6, 'advanced'), (2, 7, 'intermediate'), (2, 15, 'advanced'),
        (3, 1, 'advanced'), (3, 8, 'advanced'), (3, 14, 'advanced'),
        (4, 5, 'intermediate'), (4, 9, 'intermediate'), (4, 10, 'advanced'),
        (5, 11, 'advanced'), (5, 1, 'intermediate'), (5, 12, 'advanced')
        ON DUPLICATE KEY UPDATE proficiency_level=VALUES(proficiency_level);
      `);

      // Projects
      await connection.execute(`
        INSERT INTO projects (id, owner_id, title, summary, description, category, desired_team_size, collaboration_type, repository_url, status, goals) VALUES
        (1, 1, 'CampusRide — Student Carpooling Platform', 'A centralized carpooling and route-matching service for university students living in the same vicinity.', 'CampusRide connects students commuting from similar neighborhoods to share rides, split transport costs, and reduce campus traffic congestion.', 'Web Development', 4, 'academic', 'https://github.com/teamup-projects/campus-ride', 'recruiting', 'Deliver a functional prototype with responsive frontend, secure route queries, and student verification.'),
        (2, 2, 'AgroSense — AI Powered Plant Disease Diagnostic', 'Real-time crop leaf disease detection using lightweight convolutional neural networks on mobile devices.', 'AgroSense targets smallholder farmers and agricultural students by allowing them to photograph infected plant leaves and receive instant diagnoses.', 'AI & Machine Learning', 3, 'hackathon', 'https://github.com/teamup-projects/agro-sense', 'recruiting', 'Build the computer vision pipeline and an Express-based dashboard before the upcoming hackathon.'),
        (3, 4, 'ShieldAudit — Web Application Vulnerability Scanner', 'Automated scanning utility checking for OWASP Top 10 vulnerabilities in student project repositories.', 'ShieldAudit runs static and dynamic security checks on student web projects to detect vulnerabilities.', 'Cybersecurity', 3, 'open_source', 'https://github.com/teamup-projects/shield-audit', 'recruiting', 'Create an open-source command line tool and web dashboard.'),
        (4, 3, 'UniBookSwap — Peer to Peer Textbook Exchange', 'Digital marketplace for university students to exchange, rent, and donate used course textbooks.', 'UniBookSwap simplifies finding semester course materials within campus.', 'Web Development', 4, 'academic', 'https://github.com/teamup-projects/unibookswap', 'in_progress', 'Deploy the web platform for the upcoming semester.')
        ON DUPLICATE KEY UPDATE title=VALUES(title);
      `);

      // Project skills
      await connection.execute(`
        INSERT INTO project_skills (project_id, skill_id) VALUES
        (1, 1), (1, 2), (1, 4), (1, 13),
        (2, 5), (2, 6), (2, 7), (2, 3),
        (3, 10), (3, 2), (3, 9),
        (4, 1), (4, 8), (4, 14)
        ON DUPLICATE KEY UPDATE project_id=VALUES(project_id);
      `);

      // Project members
      await connection.execute(`
        INSERT INTO project_members (id, project_id, user_id, role, membership_status) VALUES
        (1, 1, 1, 'Owner', 'active'),
        (2, 2, 2, 'Owner', 'active'),
        (3, 3, 4, 'Owner', 'active'),
        (4, 4, 3, 'Owner', 'active'),
        (5, 4, 5, 'Frontend Developer', 'active'),
        (6, 2, 1, 'Backend Developer', 'active')
        ON DUPLICATE KEY UPDATE role=VALUES(role);
      `);

      // Join requests
      await connection.execute(`
        INSERT INTO join_requests (id, project_id, user_id, message, status) VALUES
        (1, 1, 3, 'Hello Rahim, I have strong experience building responsive React components and would love to design the CampusRide frontend.', 'pending'),
        (2, 1, 5, 'Hi, I can help integrate maps and location coordinates into the application.', 'pending'),
        (3, 2, 1, 'I can build the Express.js and MySQL backend endpoints to serve predictions from the ML model.', 'accepted'),
        (4, 2, 4, 'I am interested in securing the model inference endpoints and running penetration tests.', 'pending')
        ON DUPLICATE KEY UPDATE message=VALUES(message);
      `);

      // Notifications
      await connection.execute(`
        INSERT INTO notifications (id, user_id, type, title, message, related_project_id, related_request_id, is_read) VALUES
        (1, 1, 'join_request_received', 'New join request received', 'Tanvir Hasan requested to join CampusRide.', 1, 1, FALSE),
        (2, 1, 'join_request_received', 'New join request received', 'Siam Chowdhury requested to join CampusRide.', 1, 2, FALSE),
        (3, 1, 'join_request_accepted', 'Join request accepted', 'Your request to join AgroSense was accepted.', 2, 3, TRUE),
        (4, 2, 'join_request_received', 'New join request received', 'Anika Tabassum requested to join AgroSense.', 2, 4, FALSE)
        ON DUPLICATE KEY UPDATE title=VALUES(title);
      `);

      console.log('Seed data successfully populated.');
    } else {
      console.log(`Database already contains ${userCount[0].count} users; skipping seed insert.`);
    }

    console.log('\nDatabase migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
