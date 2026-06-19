-- Add 'currency' column to savings_accounts table
-- Sets the default value to 'GBP' so existing rows are handled correctly.

ALTER TABLE savings_accounts 
ADD COLUMN currency VARCHAR(3) DEFAULT 'GBP' NOT NULL;
