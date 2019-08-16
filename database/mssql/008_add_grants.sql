IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'grants' AND TABLE_SCHEMA = 'dbo')
    BEGIN
        CREATE TABLE grants
        (
            id UNIQUEIDENTIFIER NOT NULL,
            userId varchar(500) NOT NULL,
            email varchar(max) NOT NULL,
            jti varchar(max) NOT NULL,
            serviceId UNIQUEIDENTIFIER NOT NULL,
            scope varchar(max) NOT NULL,
            organisationId UNIQUEIDENTIFIER NULL,
            organisationName varChar(max) NULL,
            createdAt DATETIME2 NOT NULL,
            updatedAt DATETIME2 NOT NULL,
            CONSTRAINT PK_grants PRIMARY KEY (id),
            CONSTRAINT FK_grants FOREIGN KEY (serviceId) REFERENCES [service](id),
        )
    END
GO
