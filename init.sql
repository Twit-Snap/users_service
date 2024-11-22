-- Connect to the default 'postgres' database
\c postgres;

-- Check if the database exists, if not, create it
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'twitsnap_users') THEN
      CREATE DATABASE twitsnap_users;

   END IF;
END
$do$;

-- Connect to the twitsnap_users database
\c twitsnap_users;

-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    birthdate DATE NOT NULL,
    profile_picture VARCHAR(255) NULL,
    password VARCHAR(255) NULL, -- NULL for social login users
    sso_uid VARCHAR(255) NULL,
    provider_id VARCHAR(50) NULL,
    is_private BOOLEAN NOT NULL DEFAULT false,
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    expo_token VARCHAR(100) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    latitude FLOAT,
    longitude FLOAT,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false
);
-- Create a unique partial index on sso_uid
CREATE UNIQUE INDEX idx_unique_sso_uid ON users (sso_uid) WHERE sso_uid IS NOT NULL;


-- Create the admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS admins (
    username VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS follows (
    userId INT NOT NULL,
    followedId INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, followedId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (followedId) REFERENCES users(id) ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS interests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT NULL,
    FOREIGN KEY (parent_id) REFERENCES interests(id) ON DELETE SET NULL
);

CREATE TABLE user_interests (
    user_id INT NOT NULL,
    interest_id INT NOT NULL,
    PRIMARY KEY (user_id, interest_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);

INSERT INTO interests (id, name, parent_id) VALUES
(1, 'Sports', NULL),
(2, 'Soccer', 1),
(3, 'Swimming', 1),
(4, 'Basketball', 1),
(5, 'Tennis', 1),
(6, 'Volleyball', 1),
(7, 'Baseball', 1),
(8, 'Athletics', 1),
(9, 'Rugby', 1),
(10, 'Cricket', 1),
(11, 'Tech', NULL),
(12, 'Programming', 11),
(13, 'Web Development', 11),
(14, 'Mobile Development', 11),
(15, 'AI & Machine Learning', 11),
(16, 'Cybersecurity', 11),
(17, 'Cloud Computing', 11),
(18, 'Data Science', 11),
(19, 'DevOps', 11),
(20, 'Blockchain', 11),
(21, 'Arts', NULL),
(22, 'Painting', 21),
(23, 'Drawing', 21),
(24, 'Photography', 21),
(25, 'Sculpture', 21),
(26, 'Digital Art', 21),
(27, 'Animation', 21),
(28, 'Graphic Design', 21),
(29, 'Film Making', 21),
(30, 'Music', 21),
(31, 'Science', NULL),
(32, 'Physics', 31),
(33, 'Chemistry', 31),
(34, 'Biology', 31),
(35, 'Astronomy', 31),
(36, 'Mathematics', 31),
(37, 'Environmental Science', 31),
(38, 'Geology', 31),
(39, 'Robotics', 31),
(40, 'Genetics', 31),
(41, 'Languages', NULL),
(42, 'English', 41),
(43, 'Spanish', 41),
(44, 'French', 41),
(45, 'German', 41),
(46, 'Chinese', 41),
(47, 'Japanese', 41),
(48, 'Korean', 41),
(49, 'Italian', 41),
(50, 'Portuguese', 41);
