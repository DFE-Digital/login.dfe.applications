IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'tokens' AND TABLE_SCHEMA = 'dbo')
    BEGIN
        CREATE TABLE tokens
        (
            id UNIQUEIDENTIFIER NOT NULL,
            grantId UNIQUEIDENTIFIER NOT NULL,
            sid UNIQUEIDENTIFIER NOT NULL,
            jti varchar(max) NOT NULL,
            kind varchar(max) NOT NULL,
            exp int NULL,
            active bit NULL,
            createdAt DATETIME2 NOT NULL,
            updatedAt DATETIME2 NOT NULL,
            CONSTRAINT PK_tokens PRIMARY KEY (id),
            CONSTRAINT FK_tokens FOREIGN KEY (grantId) REFERENCES [grants](id),
        )
    END
GO

