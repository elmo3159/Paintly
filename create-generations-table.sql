-- Create generations table for storing simulation history
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  main_image_url TEXT NOT NULL,
  side_image_url TEXT,
  generated_image_url TEXT,
  wall_color TEXT,
  roof_color TEXT,
  door_color TEXT,
  weather TEXT,
  layout_side_by_side BOOLEAN DEFAULT false,
  background_color TEXT,
  other_instructions TEXT,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_generations_customer_id ON generations(customer_id);
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);

-- Enable RLS
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generations" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations" ON generations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations" ON generations
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
CREATE TRIGGER update_generations_updated_at
  BEFORE UPDATE ON generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE generations IS 'Stores painting simulation generation history';
COMMENT ON COLUMN generations.status IS 'pending, processing, completed, failed';