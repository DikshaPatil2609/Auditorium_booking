-- Oracle SQL implementation for Auditorium Booking System (11g Compatible)

-- Note: To avoid sequence/trigger errors if they already exist, we ignore "already exists" errors manually or you can cleanly drop them first.
-- In typical SQL clients, running these will report success or 'name already used'.

-- 1. USERS TABLE
CREATE TABLE users (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(255) NOT NULL,
    email VARCHAR2(255) UNIQUE NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    role VARCHAR2(20) DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin')),
    department VARCHAR2(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER users_bir 
BEFORE INSERT ON users 
FOR EACH ROW
BEGIN
  IF :new.id IS NULL THEN
    SELECT users_seq.NEXTVAL INTO :new.id FROM dual;
  END IF;
END;
/

-- 2. AUDITORIUMS TABLE
CREATE TABLE auditoriums (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(255) NOT NULL,
    capacity NUMBER NOT NULL,
    facilities CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE auditoriums_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER auditoriums_bir 
BEFORE INSERT ON auditoriums 
FOR EACH ROW
BEGIN
  IF :new.id IS NULL THEN
    SELECT auditoriums_seq.NEXTVAL INTO :new.id FROM dual;
  END IF;
END;
/

-- 3. BOOKINGS TABLE
CREATE TABLE bookings (
    id NUMBER PRIMARY KEY,
    user_id NUMBER NOT NULL,
    auditorium_id NUMBER NOT NULL,
    event_name VARCHAR2(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR2(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_auditorium FOREIGN KEY (auditorium_id) REFERENCES auditoriums(id) ON DELETE CASCADE
);

CREATE SEQUENCE bookings_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER bookings_bir 
BEFORE INSERT ON bookings 
FOR EACH ROW
BEGIN
  IF :new.id IS NULL THEN
    SELECT bookings_seq.NEXTVAL INTO :new.id FROM dual;
  END IF;
END;
/

-- 4. SEED DATA
MERGE INTO auditoriums a
USING (SELECT 'Main College Auditorium' AS name, 500 AS capacity, 'Projector, Sound System, AC, Stage Lighting' AS facilities FROM dual) src
ON (a.name = src.name)
WHEN MATCHED THEN
  UPDATE SET a.capacity = src.capacity, a.facilities = src.facilities
WHEN NOT MATCHED THEN
  INSERT (name, capacity, facilities) VALUES (src.name, src.capacity, src.facilities);

MERGE INTO users u
USING (SELECT 'System Admin' AS name, 'admin@college.edu' AS email, '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDI//5RxDBQCEBse' AS password_hash, 'admin' AS role, 'Administration' AS department FROM dual) src
ON (u.email = src.email)
WHEN MATCHED THEN
  UPDATE SET u.name = src.name, u.role = src.role, u.department = src.department
WHEN NOT MATCHED THEN
  INSERT (name, email, password_hash, role, department) 
  VALUES (src.name, src.email, src.password_hash, src.role, src.department);

COMMIT;
