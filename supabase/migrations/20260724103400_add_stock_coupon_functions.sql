/*
# Add stock decrement and coupon increment functions

1. Functions
- `decrement_stock(product_id uuid, quantity int)` — atomically decrements product stock by the given quantity. Prevents going below zero.
- `increment_coupon_usage(coupon_code text)` — atomically increments the used_count of a coupon by 1.
*/

CREATE OR REPLACE FUNCTION decrement_stock(product_id uuid, qty int)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - qty),
      sold = sold + qty
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code text)
RETURNS void AS $$
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE code = coupon_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
