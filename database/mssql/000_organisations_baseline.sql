IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'service' AND TABLE_SCHEMA = 'dbo')
    BEGIN
        CREATE TABLE service
        (
            id uniqueidentifier NOT NULL,
            name varchar(500) NOT NULL,
            description varchar(max),
            CONSTRAINT [PK_service] PRIMARY KEY (id)
        )
    END
GO
