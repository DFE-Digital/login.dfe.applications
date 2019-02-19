IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'service' AND COLUMN_NAME = 'parentId')
  BEGIN
    ALTER TABLE service
      ADD parentId uniqueidentifier NULL CONSTRAINT [FK_service_parent] REFERENCES service(id)
  END