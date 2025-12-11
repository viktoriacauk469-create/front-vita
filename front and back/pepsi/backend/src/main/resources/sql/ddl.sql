-- ============================================
-- DDL: family-tree
-- Author: Andrii Kachmar
-- ============================================

-- ============================================
-- 1️⃣ USERS
-- ============================================
CREATE TABLE users
(
    id       BIGSERIAL PRIMARY KEY,
    email    VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255)        NOT NULL,
    role     VARCHAR(20)         NOT NULL
);

-- ============================================
-- 2️⃣ USER_VERIFICATIONS
-- ============================================
CREATE TABLE user_verifications
(
    id                        BIGSERIAL PRIMARY KEY,
    user_id                   BIGINT  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    verification_token        VARCHAR(512),
    verification_token_expiry TIMESTAMP,
    is_verified               BOOLEAN NOT NULL
);

-- ============================================
-- 3️⃣ PERSONAL_INFORMATION
-- ============================================
CREATE TABLE personal_information
(
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users (id) ON DELETE CASCADE,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    age             INT,
    gender          VARCHAR(20),
    blood_type      VARCHAR(20),
    rhesus_factor   VARCHAR(10),
    is_main_profile BOOLEAN DEFAULT FALSE,
    photo_file_name VARCHAR(255),
    photo_file_path VARCHAR(500)
);

-- ============================================
-- 4️⃣ RELATIVES (Self-referencing many-to-many)
-- ============================================
CREATE TABLE relatives
(
    person_id   BIGINT NOT NULL REFERENCES personal_information (id) ON DELETE CASCADE,
    relative_id BIGINT NOT NULL REFERENCES personal_information (id) ON DELETE CASCADE,
    PRIMARY KEY (person_id, relative_id)
);

