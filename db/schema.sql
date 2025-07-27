-- Coaching Application Database Schema
-- MySQL 9 compatible schema

CREATE DATABASE IF NOT EXISTS coaching_db;
USE coaching_db;

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    logo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_teams_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- People table
CREATE TABLE IF NOT EXISTS people (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    picture TEXT,
    team_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY idx_people_email (email),
    INDEX idx_people_name (name),
    INDEX idx_people_team_id (team_id),
    CONSTRAINT fk_people_team_id FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    content TEXT NOT NULL,
    target_type ENUM('person', 'team') NOT NULL,
    target_id BIGINT UNSIGNED NOT NULL,
    target_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_feedbacks_target (target_type, target_id),
    INDEX idx_feedbacks_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for development
INSERT IGNORE INTO teams (id, name, logo) VALUES
(1, 'Development Team', 'https://via.placeholder.com/100/007bff/ffffff?text=DEV'),
(2, 'Design Team', 'https://via.placeholder.com/100/28a745/ffffff?text=DES'),
(3, 'Product Team', 'https://via.placeholder.com/100/ffc107/000000?text=PROD');

INSERT IGNORE INTO people (id, name, email, picture, team_id) VALUES
(1, 'John Doe', 'john.doe@example.com', 'https://via.placeholder.com/150/007bff/ffffff?text=JD', 1),
(2, 'Jane Smith', 'jane.smith@example.com', 'https://via.placeholder.com/150/28a745/ffffff?text=JS', 2),
(3, 'Bob Johnson', 'bob.johnson@example.com', 'https://via.placeholder.com/150/dc3545/ffffff?text=BJ', 1),
(4, 'Alice Brown', 'alice.brown@example.com', 'https://via.placeholder.com/150/ffc107/000000?text=AB', 3),
(5, 'Charlie Wilson', 'charlie.wilson@example.com', 'https://via.placeholder.com/150/6f42c1/ffffff?text=CW', NULL);

INSERT IGNORE INTO feedbacks (id, content, target_type, target_id, target_name) VALUES
(1, 'Excellent work on the new feature implementation. The code quality is outstanding!', 'person', 1, 'John Doe'),
(2, 'Great collaboration and communication skills. Keep up the good work!', 'person', 2, 'Jane Smith'),
(3, 'The team has shown remarkable improvement in delivery speed and quality.', 'team', 1, 'Development Team'),
(4, 'Outstanding design work on the user interface. Very user-friendly!', 'team', 2, 'Design Team'),
(5, 'Needs to improve time management and meeting deadlines.', 'person', 3, 'Bob Johnson'),
(6, 'Excellent leadership and strategic thinking in product planning.', 'person', 4, 'Alice Brown');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_people_team_name ON people(team_id, name);
CREATE INDEX IF NOT EXISTS idx_feedbacks_target_created ON feedbacks(target_type, target_id, created_at DESC);

-- Show table information
SHOW TABLES;
SELECT 'Schema created successfully' AS status;
