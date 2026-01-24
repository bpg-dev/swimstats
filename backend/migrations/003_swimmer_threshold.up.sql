-- Add configurable "almost there" threshold percentage to swimmers
ALTER TABLE swimmers
ADD COLUMN threshold_percent DECIMAL(5,2) NOT NULL DEFAULT 3.0
CHECK (threshold_percent >= 0 AND threshold_percent <= 100);
