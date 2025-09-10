-- Fix plans table schema
ALTER TABLE plans ADD COLUMN IF NOT EXISTS price INTEGER NOT NULL DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS generation_limit INTEGER NOT NULL DEFAULT 3;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS storage_months INTEGER NOT NULL DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS features JSONB;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Add unique constraint to name column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'plans_name_unique' 
        AND table_name = 'plans'
    ) THEN
        ALTER TABLE plans ADD CONSTRAINT plans_name_unique UNIQUE (name);
    END IF;
END $$;

-- Create customer_pages table
CREATE TABLE IF NOT EXISTS customer_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_page_id UUID REFERENCES customer_pages(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  generated_image_url TEXT,
  side_image_url TEXT,
  wall_color TEXT,
  roof_color TEXT,
  door_color TEXT,
  weather TEXT,
  other_instructions TEXT,
  prompt TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customer_pages_user_id ON customer_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_customer_page_id ON generations(customer_page_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);

-- Enable RLS
ALTER TABLE customer_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Customer pages policies
DROP POLICY IF EXISTS "Users can view own customer pages" ON customer_pages;
CREATE POLICY "Users can view own customer pages" ON customer_pages
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create customer pages" ON customer_pages;
CREATE POLICY "Users can create customer pages" ON customer_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own customer pages" ON customer_pages;
CREATE POLICY "Users can update own customer pages" ON customer_pages
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own customer pages" ON customer_pages;
CREATE POLICY "Users can delete own customer pages" ON customer_pages
  FOR DELETE USING (auth.uid() = user_id);

-- Generations policies
DROP POLICY IF EXISTS "Users can view own generations" ON generations;
CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create generations" ON generations;
CREATE POLICY "Users can create generations" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own generations" ON generations;
CREATE POLICY "Users can update own generations" ON generations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own generations" ON generations;
CREATE POLICY "Users can delete own generations" ON generations
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_pages_updated_at ON customer_pages;
CREATE TRIGGER update_customer_pages_updated_at BEFORE UPDATE ON customer_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_generations_updated_at ON generations;
CREATE TRIGGER update_generations_updated_at BEFORE UPDATE ON generations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial plan data will be inserted by the second migration file