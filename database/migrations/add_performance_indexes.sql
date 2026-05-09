-- Add indexes for common query patterns to improve performance
-- Run this migration to add missing indexes

-- Index for trades by close time (common in analytics queries)
CREATE INDEX IF NOT EXISTS idx_trades_closed_at ON trades(closed_at DESC);

-- Index for trades by account and close time
CREATE INDEX IF NOT EXISTS idx_trades_account_closed ON trades(account_id, closed_at DESC);

-- Index for conversations by user and updated_at (chat list)
CREATE INDEX IF NOT EXISTS idx_conversations_user_updated ON conversations(user_id, updated_at DESC);

-- Index for trade screenshots by trade_id
CREATE INDEX IF NOT EXISTS idx_trade_screenshots_trade ON trade_screenshots(trade_id);

-- Index for notifications by user and read status
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Composite index for user plan active subscriptions
CREATE INDEX IF NOT EXISTS idx_user_plans_active ON user_plans(user_id, status) WHERE status = 'active';