-- Insert or update initial plan data with English names
INSERT INTO plans (name, price, generation_limit, storage_months, features, stripe_price_id)
VALUES 
  ('Free Plan', 0, 3, 0, '{"customer_pages": 3, "image_storage_days": 7}', NULL),
  ('Light Plan', 2980, 30, 1, '{"customer_pages": "unlimited", "image_storage_days": 30}', NULL),
  ('Standard Plan', 5980, 100, 3, '{"customer_pages": "unlimited", "image_storage_days": 90}', NULL),
  ('Pro Plan', 9980, 300, 6, '{"customer_pages": "unlimited", "image_storage_days": 180}', NULL),
  ('Business Plan', 19800, 1000, 12, '{"customer_pages": "unlimited", "image_storage_days": 365}', NULL)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  generation_limit = EXCLUDED.generation_limit,
  storage_months = EXCLUDED.storage_months,
  features = EXCLUDED.features,
  stripe_price_id = EXCLUDED.stripe_price_id,
  updated_at = timezone('utc'::text, now());
