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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
