/*
# Add increment_product_views function

1. Functions
- `increment_product_views(product_id uuid)` — atomically increments the views column of a product by 1.
  Uses UPDATE ... RETURNING for atomicity. Safe to call concurrently.
*/

CREATE OR REPLACE FUNCTION increment_product_views(product_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE products SET views = views + 1 WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
