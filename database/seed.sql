-- TeamUp Seed Data
USE teamup_db;

-- 1. Insert Skills
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

-- 2. Insert Users (Password is 'Password123!' for all seed users)
INSERT INTO users (id, name, email, password_hash, university, department, bio, github_url, portfolio_url) VALUES
(1, 'Rahim Ahmed', 'rahim.ahmed@example.edu', '$2b$10$y0O4kCvp4plcrgmgJcfBm.ZlmsyW.QLUFn8WnAK9Zmq1aJ1QON2BG', 'BUET', 'Computer Science and Engineering', 'Full-stack software engineer interested in distributed systems, clean REST APIs, and scalable web apps.', 'https://github.com/rahimahmed', 'https://rahimahmed.dev'),
(2, 'Fatima Zaman', 'fatima.zaman@example.edu', '$2b$10$y0O4kCvp4plcrgmgJcfBm.ZlmsyW.QLUFn8WnAK9Zmq1aJ1QON2BG', 'Dhaka University', 'Computer Science', 'Machine learning enthusiast and Python developer focusing on computer vision and healthcare analytics.', 'https://github.com/fatimazaman', 'https://fatimazaman.me'),
(3, 'Tanvir Hasan', 'tanvir.hasan@example.edu', '$2b$10$y0O4kCvp4plcrgmgJcfBm.ZlmsyW.QLUFn8WnAK9Zmq1aJ1QON2BG', 'NSU', 'Electrical and Computer Engineering', 'Frontend engineer passionate about modern UI design systems, performance optimization, and accessibility.', 'https://github.com/tanvirhasan', 'https://tanvir.dev'),
(4, 'Anika Tabassum', 'anika.tabassum@example.edu', '$2b$10$y0O4kCvp4plcrgmgJcfBm.ZlmsyW.QLUFn8WnAK9Zmq1aJ1QON2BG', 'BRAC University', 'Computer Science', 'Application security researcher and backend engineer with an interest in penetration testing and secure coding.', 'https://github.com/anikatabassum', 'https://anika-sec.net'),
(5, 'Siam Chowdhury', 'siam.chowdhury@example.edu', '$2b$10$y0O4kCvp4plcrgmgJcfBm.ZlmsyW.QLUFn8WnAK9Zmq1aJ1QON2BG', 'IUT', 'Software Engineering', 'Cross-platform mobile developer and cloud enthusiast experienced in Flutter and React ecosystem.', 'https://github.com/siamchowdhury', 'https://siamdev.io')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Insert User Skills
INSERT INTO user_skills (user_id, skill_id, proficiency_level) VALUES
(1, 1, 'advanced'),
(1, 2, 'advanced'),
(1, 3, 'advanced'),
(1, 4, 'intermediate'),
(2, 5, 'advanced'),
(2, 6, 'advanced'),
(2, 7, 'intermediate'),
(2, 15, 'advanced'),
(3, 1, 'advanced'),
(3, 8, 'advanced'),
(3, 14, 'advanced'),
(4, 5, 'intermediate'),
(4, 9, 'intermediate'),
(4, 10, 'advanced'),
(5, 11, 'advanced'),
(5, 1, 'intermediate'),
(5, 12, 'advanced')
ON DUPLICATE KEY UPDATE proficiency_level=VALUES(proficiency_level);

-- 4. Insert Projects
INSERT INTO projects (id, owner_id, title, summary, description, category, desired_team_size, collaboration_type, repository_url, status, goals) VALUES
(1, 1, 'CampusRide — Student Carpooling Platform', 'A centralized carpooling and route-matching service for university students living in the same vicinity.', 'CampusRide connects students commuting from similar neighborhoods to share rides, split transport costs, and reduce campus traffic congestion. The system includes route scheduling, student identity verification, and automated team chat integrations.', 'Web Development', 4, 'academic', 'https://github.com/teamup-projects/campus-ride', 'recruiting', 'Deliver a functional prototype with responsive frontend, secure route queries, and student verification.'),
(2, 2, 'AgroSense — AI Powered Plant Disease Diagnostic', 'Real-time crop leaf disease detection using lightweight convolutional neural networks on mobile devices.', 'AgroSense targets smallholder farmers and agricultural students by allowing them to photograph infected plant leaves and receive instant diagnoses with preventive recommendations. We need full-stack engineers to build the web dashboard and REST API.', 'AI & Machine Learning', 3, 'hackathon', 'https://github.com/teamup-projects/agro-sense', 'recruiting', 'Build the computer vision pipeline and an Express-based dashboard before the upcoming national hackathon.'),
(3, 4, 'ShieldAudit — Web Application Vulnerability Scanner', 'Automated scanning utility checking for OWASP Top 10 vulnerabilities in student project repositories.', 'ShieldAudit runs static and dynamic security checks on student web projects to detect SQL injection vulnerabilities, exposed secrets, and outdated dependencies before deployment.', 'Cybersecurity', 3, 'open_source', 'https://github.com/teamup-projects/shield-audit', 'recruiting', 'Create an open-source command line tool and web dashboard for security reporting.'),
(4, 3, 'UniBookSwap — Peer to Peer Textbook Exchange', 'Digital marketplace for university students to exchange, rent, and donate used course textbooks.', 'UniBookSwap simplifies the process of finding semester course materials within the campus community. Students can list unused books, request trades, and rate transactions safely.', 'Web Development', 4, 'academic', 'https://github.com/teamup-projects/unibookswap', 'in_progress', 'Deploy the web platform for the upcoming fall semester across three departments.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 5. Insert Project Skills
INSERT INTO project_skills (project_id, skill_id) VALUES
(1, 1),
(1, 2),
(1, 4),
(1, 13),
(2, 5),
(2, 6),
(2, 7),
(2, 3),
(3, 10),
(3, 2),
(3, 9),
(4, 1),
(4, 8),
(4, 14)
ON DUPLICATE KEY UPDATE project_id=VALUES(project_id);

-- 6. Insert Project Members (Project Owners are enrolled as Active Owner members)
INSERT INTO project_members (id, project_id, user_id, role, membership_status) VALUES
(1, 1, 1, 'Owner', 'active'),
(2, 2, 2, 'Owner', 'active'),
(3, 3, 4, 'Owner', 'active'),
(4, 4, 3, 'Owner', 'active'),
(5, 4, 5, 'Frontend Developer', 'active')
ON DUPLICATE KEY UPDATE role=VALUES(role);

-- 7. Insert Join Requests
INSERT INTO join_requests (id, project_id, user_id, message, status) VALUES
(1, 1, 3, 'Hello Rahim, I have strong experience building responsive React component libraries and would love to design the CampusRide frontend.', 'pending'),
(2, 1, 5, 'Hi, I can help integrate maps and location coordinates into the application.', 'pending'),
(3, 2, 1, 'I can build the Express.js and MySQL backend endpoints to serve predictions from the ML model.', 'accepted'),
(4, 2, 4, 'I am interested in securing the model inference endpoints and running penetration tests.', 'pending')
ON DUPLICATE KEY UPDATE message=VALUES(message);

-- Project Member for accepted request (Rahim on AgroSense)
INSERT INTO project_members (id, project_id, user_id, role, membership_status) VALUES
(6, 2, 1, 'Backend Developer', 'active')
ON DUPLICATE KEY UPDATE role=VALUES(role);

-- 8. Insert Notifications
INSERT INTO notifications (id, user_id, type, title, message, related_project_id, related_request_id, is_read) VALUES
(1, 1, 'join_request_received', 'New join request received', 'Tanvir Hasan requested to join CampusRide.', 1, 1, FALSE),
(2, 1, 'join_request_received', 'New join request received', 'Siam Chowdhury requested to join CampusRide.', 1, 2, FALSE),
(3, 1, 'join_request_accepted', 'Join request accepted', 'Your request to join AgroSense was accepted.', 2, 3, TRUE),
(4, 2, 'join_request_received', 'New join request received', 'Anika Tabassum requested to join AgroSense.', 2, 4, FALSE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

