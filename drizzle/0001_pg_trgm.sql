CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS contacts_name_trgm_idx ON contacts USING GIN (name gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS contacts_email_trgm_idx ON contacts USING GIN (email gin_trgm_ops);
