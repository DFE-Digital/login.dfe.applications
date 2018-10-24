IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'serviceAssertions' AND TABLE_SCHEMA = 'dbo')
    BEGIN
        CREATE TABLE serviceAssertions (
            id uniqueidentifier NOT NULL,
            serviceId uniqueidentifier NOT NULL,
            typeUrn varchar(255) NOT NULL,
            value varchar(512) NOT NULL,
            friendlyName varchar(255) NULL,

            CONSTRAINT [PK_serviceAssertions] PRIMARY KEY (id),
            CONSTRAINT [FK_serviceAssertions_service] FOREIGN KEY (serviceId) REFERENCES [service](id)
        )
    END
GO