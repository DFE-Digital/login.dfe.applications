IF NOT EXISTS(SELECT 1
              FROM INFORMATION_SCHEMA.TABLES
              WHERE TABLE_NAME = 'ToggleFlags')
    BEGIN
        SET ANSI_NULLS ON
        SET QUOTED_IDENTIFIER ON
        CREATE TABLE [dbo].[ToggleFlags](
            [Type] [varchar](255) NOT NULL,
            [ServiceName] [varchar](255) NOT NULL,
            [Flag] [bit] NOT NULL,
        ) ON [PRIMARY]
        SET ANSI_PADDING ON
        CREATE UNIQUE INDEX IXU_ToggleFlags_Type_ServiceName
        ON ToggleFlags ([Type], ServiceName);
    END
GO