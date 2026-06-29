CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(160) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(160) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(160),
    city VARCHAR(100),
    address VARCHAR(255),
    degree VARCHAR(120),
    university VARCHAR(160),
    graduation_year INTEGER,
    experience_years INTEGER,
    current_company VARCHAR(160),
    current_position VARCHAR(160),
    industry VARCHAR(120),
    english_level VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    cv_file_path VARCHAR(255),
    extracted_text TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    job_name VARCHAR(160) NOT NULL,
    department VARCHAR(120),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id),
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    application_date TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    score FLOAT
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    skill_name VARCHAR(120) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS candidate_skills (
    candidate_id INTEGER NOT NULL REFERENCES candidates(id),
    skill_id INTEGER NOT NULL REFERENCES skills(id),
    level VARCHAR(50),
    PRIMARY KEY (candidate_id, skill_id)
);
