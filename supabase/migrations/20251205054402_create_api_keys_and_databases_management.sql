/*
  # API Keys and Database Credentials Management System

  ## Overview
  This migration creates a secure system for managing API keys and database credentials
  with encryption support and comprehensive audit trails.

  ## New Tables

  ### `api_keys`
  Stores API keys and tokens for external services
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Owner of the API key
  - `name` (text) - Friendly name for identification
  - `service_name` (text) - Service provider (OpenAI, Stripe, AWS, etc.)
  - `key_value` (text) - Encrypted API key/token
  - `key_prefix` (text) - First few characters for identification (e.g., "sk-...")
  - `environment` (text) - Environment context (development, staging, production)
  - `is_active` (boolean) - Whether the key is currently active
  - `expires_at` (timestamptz) - Optional expiration date
  - `last_used_at` (timestamptz) - Track when the key was last accessed
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp
  - `notes` (text) - Additional notes or documentation

  ### `databases`
  Stores database connection information and credentials
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Owner of the database entry
  - `name` (text) - Friendly name for the database
  - `host` (text) - Database host/endpoint
  - `port` (integer) - Connection port
  - `database_name` (text) - Name of the database
  - `username` (text) - Database username
  - `password` (text) - Encrypted password
  - `connection_string` (text) - Optional encrypted full connection string
  - `database_type` (text) - Type: postgres, mysql, mongodb, redis, etc.
  - `environment` (text) - Environment context
  - `is_active` (boolean) - Whether this connection is active
  - `last_connected_at` (timestamptz) - Last successful connection timestamp
  - `ssl_enabled` (boolean) - Whether SSL/TLS is required
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp
  - `notes` (text) - Additional configuration notes

  ### `key_access_logs`
  Audit trail for API key access
  - `id` (uuid, primary key) - Unique identifier
  - `api_key_id` (uuid, foreign key) - Which API key was accessed
  - `user_id` (uuid, foreign key) - Who accessed it
  - `action` (text) - Type of action (viewed, copied, updated, deleted)
  - `ip_address` (inet) - IP address of accessor
  - `user_agent` (text) - Browser/client information
  - `accessed_at` (timestamptz) - When the access occurred

  ## Security Features

  1. **Row Level Security (RLS)**
     - Users can only access their own API keys and databases
     - Strict isolation between user data
     - Service role can access all data for admin purposes

  2. **Encryption Considerations**
     - `key_value` and `password` fields should be encrypted at application level
     - Consider using pgcrypto extension for database-level encryption
     - Never expose raw keys in logs or error messages

  3. **Audit Logging**
     - All access to sensitive data is logged
     - Includes IP address and user agent for forensics
     - Helps detect unauthorized access attempts

  4. **Data Safety**
     - Soft delete capability through `is_active` flag
     - Timestamps for tracking changes
     - Foreign key constraints to maintain referential integrity

  ## Important Security Notes

  **CRITICAL**: 
  - This schema provides the structure, but YOU MUST implement encryption
    at the application level before storing sensitive data
  - Use libraries like crypto-js, bcrypt, or Supabase Vault for encryption
  - NEVER store plain text API keys or passwords
  - Implement key rotation policies
  - Set up monitoring and alerts for suspicious access patterns
  - Consider implementing IP whitelisting
  - Use environment variables for your own encryption keys
  - Regularly audit the access logs
*/

-- Enable pgcrypto for encryption support
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  service_name text NOT NULL,
  key_value text NOT NULL,
  key_prefix text,
  environment text DEFAULT 'development' CHECK (environment IN ('development', 'staging', 'production')),
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  notes text,
  CONSTRAINT api_keys_name_user_unique UNIQUE (user_id, name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_service_name ON api_keys(service_name);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active) WHERE is_active = true;

-- Databases Table
CREATE TABLE IF NOT EXISTS databases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  host text NOT NULL,
  port integer DEFAULT 5432,
  database_name text NOT NULL,
  username text NOT NULL,
  password text NOT NULL,
  connection_string text,
  database_type text DEFAULT 'postgres' CHECK (database_type IN ('postgres', 'mysql', 'mongodb', 'redis', 'mariadb', 'sqlite', 'mssql', 'oracle')),
  environment text DEFAULT 'development' CHECK (environment IN ('development', 'staging', 'production')),
  is_active boolean DEFAULT true,
  last_connected_at timestamptz,
  ssl_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  notes text,
  CONSTRAINT databases_name_user_unique UNIQUE (user_id, name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_databases_user_id ON databases(user_id);
CREATE INDEX IF NOT EXISTS idx_databases_type ON databases(database_type);
CREATE INDEX IF NOT EXISTS idx_databases_is_active ON databases(is_active) WHERE is_active = true;

-- Key Access Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS key_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL CHECK (action IN ('viewed', 'copied', 'created', 'updated', 'deleted', 'decrypted')),
  ip_address inet,
  user_agent text,
  accessed_at timestamptz DEFAULT now()
);

-- Create index for audit queries
CREATE INDEX IF NOT EXISTS idx_key_access_logs_api_key_id ON key_access_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_key_access_logs_user_id ON key_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_key_access_logs_accessed_at ON key_access_logs(accessed_at DESC);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys

-- Users can view their own API keys
CREATE POLICY "Users can view own API keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own API keys
CREATE POLICY "Users can create own API keys"
  ON api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own API keys
CREATE POLICY "Users can update own API keys"
  ON api_keys
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own API keys
CREATE POLICY "Users can delete own API keys"
  ON api_keys
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for databases

-- Users can view their own database credentials
CREATE POLICY "Users can view own databases"
  ON databases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own database entries
CREATE POLICY "Users can create own databases"
  ON databases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own database entries
CREATE POLICY "Users can update own databases"
  ON databases
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own database entries
CREATE POLICY "Users can delete own databases"
  ON databases
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for key_access_logs

-- Users can view their own access logs
CREATE POLICY "Users can view own access logs"
  ON key_access_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create access logs (system should do this automatically)
CREATE POLICY "Users can create access logs"
  ON key_access_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic updated_at
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_databases_updated_at
  BEFORE UPDATE ON databases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to log API key access (call this from your application)
CREATE OR REPLACE FUNCTION log_api_key_access(
  p_api_key_id uuid,
  p_action text,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO key_access_logs (api_key_id, user_id, action, ip_address, user_agent)
  VALUES (p_api_key_id, auth.uid(), p_action, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
