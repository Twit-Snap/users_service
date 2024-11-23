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
-- Create a unique partial index on sso_uid if it does not exist
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_sso_uid ON users (sso_uid) WHERE sso_uid IS NOT NULL;


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
);

CREATE TABLE IF NOT EXISTS interests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    parent_id INT NULL,
    FOREIGN KEY (parent_id) REFERENCES interests(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS user_interests (
    user_id INT NOT NULL,
    interest_id INT NOT NULL,
    PRIMARY KEY (user_id, interest_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);

-- Insert interests only if the table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM interests) THEN
        INSERT INTO interests (name, parent_id) VALUES
        ('Sports', NULL),
        ('Soccer', 1),
        ('Swimming', 1),
        ('Basketball', 1),
        ('Tennis', 1),
        ('Volleyball', 1),
        ('Baseball', 1),
        ('Athletics', 1),
        ('Rugby', 1),
        ('Cricket', 1),
        ('Tech', NULL),
        ('Programming', 11),
        ('Web Development', 11),
        ('Mobile Development', 11),
        ('AI & Machine Learning', 11),
        ('Cybersecurity', 11),
        ('Cloud Computing', 11),
        ('Data Science', 11),
        ('DevOps', 11),
        ('Blockchain', 11),
        ('Arts', NULL),
        ('Painting', 21),
        ('Drawing', 21),
        ('Photography', 21),
        ('Sculpture', 21),
        ('Digital Art', 21),
        ('Animation', 21),
        ('Graphic Design', 21),
        ('Film Making', 21),
        ('Music', 21),
        ('Science', NULL),
        ('Physics', 31),
        ('Chemistry', 31),
        ('Biology', 31),
        ('Astronomy', 31),
        ('Mathematics', 31),
        ('Environmental Science', 31),
        ('Geology', 31),
        ('Robotics', 31),
        ('Genetics', 31),
        ('Languages', NULL),
        ('English', 41),
        ('Spanish', 41),
        ('French', 41),
        ('German', 41),
        ('Chinese', 41),
        ('Japanese', 41),
        ('Korean', 41),
        ('Italian', 41),
        ('Portuguese', 41);
    END IF;
END $$;
