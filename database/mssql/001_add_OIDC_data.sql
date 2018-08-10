IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'service' AND TABLE_SCHEMA = 'dbo' AND COLUMN_NAME = 'clientId')
    BEGIN
        EXEC('ALTER TABLE service
        ADD clientId varchar(50) NULL')

        EXEC('UPDATE [service] SET clientId = id')

        EXEC('ALTER TABLE service
        ALTER COLUMN clientId varchar(50) NOT NULL')

        EXEC('ALTER TABLE service
        ADD CONSTRAINT [UQ_service_clientid] UNIQUE(clientId)')
    END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'service' AND TABLE_SCHEMA = 'dbo' AND COLUMN_NAME = 'clientSecret')
    BEGIN
        EXEC('ALTER TABLE service
        ADD clientSecret varchar(255) NULL')

        EXEC('UPDATE [service] SET clientSecret = '''' ')

        EXEC('ALTER TABLE service
        ALTER COLUMN clientSecret varchar(255) NOT NULL')
    END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'service' AND TABLE_SCHEMA = 'dbo' AND COLUMN_NAME = 'apiSecret')
    BEGIN
        ALTER TABLE service
        ADD apiSecret varchar(255) NULL
    END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'service' AND TABLE_SCHEMA = 'dbo' AND COLUMN_NAME = 'tokenEndpointAuthMethod')
    BEGIN
        ALTER TABLE service
        ADD tokenEndpointAuthMethod varchar(50) NULL
    END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'service' AND TABLE_SCHEMA = 'dbo' AND COLUMN_NAME = 'serviceHome')
    BEGIN
        ALTER TABLE service
        ADD serviceHome varchar(1024) NULL
    END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'service' AND TABLE_SCHEMA = 'dbo' AND COLUMN_NAME = 'postResetUrl')
    BEGIN
        ALTER TABLE service
        ADD postResetUrl varchar(1024) NULL
    END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'serviceRedirectUris' AND TABLE_SCHEMA = 'dbo')
    BEGIN
        CREATE TABLE serviceRedirectUris (
            serviceId uniqueidentifier NOT NULL,
            redirectUrl varchar(1024) NOT NULL,
            CONSTRAINT UQ_serviceRedirectUris_serviceurl UNIQUE (serviceId, redirectUrl),
            CONSTRAINT FK_serviceRedirectUris_service FOREIGN KEY (serviceId) REFERENCES [service](id),
        )

        CREATE CLUSTERED INDEX IX_serviceRedirectUris_serviceId ON serviceRedirectUris(serviceId)
    END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'servicePostLogoutRedirectUris' AND TABLE_SCHEMA = 'dbo')
    BEGIN
        CREATE TABLE servicePostLogoutRedirectUris (
            serviceId uniqueidentifier NOT NULL,
            redirectUrl varchar(1024) NOT NULL,
            CONSTRAINT UQ_servicePostLogoutRedirectUris_serviceurl UNIQUE (serviceId, redirectUrl),
            CONSTRAINT FK_servicePostLogoutRedirectUris_service FOREIGN KEY (serviceId) REFERENCES [service](id),
        )

        CREATE CLUSTERED INDEX IX_servicePostLogoutRedirectUris_serviceId ON servicePostLogoutRedirectUris(serviceId)
    END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'serviceGrantTypes' AND TABLE_SCHEMA = 'dbo')
    BEGIN
        CREATE TABLE serviceGrantTypes (
            serviceId uniqueidentifier NOT NULL,
            grantType varchar(255) NOT NULL,
            CONSTRAINT UQ_serviceGrantTypes_servicegrant UNIQUE (serviceId, grantType),
            CONSTRAINT FK_serviceGrantTypes_service FOREIGN KEY (serviceId) REFERENCES [service](id),
        )

        CREATE CLUSTERED INDEX IX_serviceGrantTypes_serviceId ON serviceGrantTypes(serviceId)
    END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'serviceResponseTypes' AND TABLE_SCHEMA = 'dbo')
    BEGIN
        CREATE TABLE serviceResponseTypes (
            serviceId uniqueidentifier NOT NULL,
            responseType varchar(255) NOT NULL,
            CONSTRAINT UQ_serviceResponseTypes_serviceresponse UNIQUE (serviceId, responseType),
            CONSTRAINT FK_serviceResponseTypes_service FOREIGN KEY (serviceId) REFERENCES [service](id),
        )

        CREATE CLUSTERED INDEX IX_serviceResponseTypes_serviceId ON serviceResponseTypes(serviceId)
    END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'serviceParams' AND TABLE_SCHEMA = 'dbo')
    BEGIN
        CREATE TABLE serviceParams (
            serviceId uniqueidentifier NOT NULL,
            paramName varchar(255) NOT NULL,
            paramValue varchar(max) NOT NULL,
            CONSTRAINT PK_serviceParams PRIMARY KEY (serviceId, paramName)
        )
    END
GO