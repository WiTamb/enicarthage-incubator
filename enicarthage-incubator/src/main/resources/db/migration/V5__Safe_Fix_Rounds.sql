DROP PROCEDURE IF EXISTS FixRounds;
DELIMITER //
CREATE PROCEDURE FixRounds()
BEGIN
    -- Allow program_id to be null
    ALTER TABLE rounds MODIFY COLUMN program_id BIGINT NULL;

    -- Add session_id if not exists
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='rounds' AND COLUMN_NAME='session_id') THEN
        ALTER TABLE rounds ADD COLUMN session_id BIGINT NULL;
    END IF;

    -- Add order_index if not exists
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='rounds' AND COLUMN_NAME='order_index') THEN
        ALTER TABLE rounds ADD COLUMN order_index INT NOT NULL DEFAULT 1;
    END IF;

    -- Add status if not exists
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='rounds' AND COLUMN_NAME='status') THEN
        ALTER TABLE rounds ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING';
    END IF;

    -- Add foreign key if not exists
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME='rounds' AND CONSTRAINT_NAME='fk_rounds_session') THEN
        ALTER TABLE rounds ADD CONSTRAINT fk_rounds_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
    END IF;
END //
DELIMITER ;
CALL FixRounds();
DROP PROCEDURE IF EXISTS FixRounds;
