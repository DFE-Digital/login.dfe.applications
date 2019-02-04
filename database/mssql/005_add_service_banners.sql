IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'serviceBanners' AND TABLE_SCHEMA = 'dbo')
    BEGIN
        CREATE TABLE serviceBanners
        (
            id UNIQUEIDENTIFIER NOT NULL,
            serviceId UNIQUEIDENTIFIER NOT NULL,
            name varchar(500) NOT NULL,
            title varchar(max) NOT NULL,
            message varchar(max) NOT NULL,
            validFrom DATETIME2 NULL,
            validTo DATETIME2 NULL,
            createdAt DATETIME2 NOT NULL,
            updatedAt DATETIME2 NOT NULL,
            isActive BIT DEFAULT 0 NOT NULL,
            CONSTRAINT PK_serviceBanners PRIMARY KEY (id),
            CONSTRAINT FK_serviceBanners FOREIGN KEY (serviceId) REFERENCES [service](id),
        )
    END
GO
