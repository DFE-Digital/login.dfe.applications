IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'service' AND TABLE_SCHEMA = 'dbo' AND COLUMN_NAME = 'isExternalService')
    BEGIN
        ALTER TABLE service
        ADD isExternalService BIT DEFAULT 0 NOT NULL
    END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'service' AND TABLE_SCHEMA = 'dbo' AND COLUMN_NAME = 'isMigrated')
    BEGIN
        ALTER TABLE service
        ADD isMigrated BIT DEFAULT 0 NOT NULL
    END
GO