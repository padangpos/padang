-- Prevent a sale from creating a negative balance when inventory is tracked.
CREATE OR REPLACE FUNCTION public.complete_pos_sale(
  p_store_id UUID, p_branch_id UUID, p_order_number TEXT, p_payment_method TEXT,
  p_tendered NUMERIC, p_change NUMERIC, p_grand_total NUMERIC, p_items JSONB,
  p_customer_id UUID DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_order_id UUID; v_payment_id UUID; v_existing RECORD; v_item RECORD; v_points INTEGER; v_available NUMERIC;
BEGIN
  SELECT id, order_id INTO v_existing FROM payments WHERE idempotency_key = 'pos:' || p_order_number LIMIT 1;
  IF v_existing.id IS NOT NULL THEN RETURN jsonb_build_object('orderId', v_existing.order_id, 'paymentId', v_existing.id, 'alreadyApplied', TRUE); END IF;
  INSERT INTO orders(store_id, branch_id, order_number, status, customer_id, subtotal, grand_total)
  VALUES (p_store_id, p_branch_id, p_order_number, 'completed', p_customer_id, (SELECT COALESCE(SUM((x.quantity::numeric) * (x.unit_price::numeric)), 0) FROM jsonb_to_recordset(p_items) AS x(quantity numeric, unit_price numeric)), p_grand_total) RETURNING id INTO v_order_id;
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, name text, quantity numeric, unit_price numeric, unit_cost numeric) LOOP
    IF v_item.quantity <= 0 THEN RAISE EXCEPTION 'Invalid item quantity'; END IF;
    SELECT quantity INTO v_available FROM inventory_balances WHERE store_id = p_store_id AND branch_id = p_branch_id AND product_id = v_item.product_id AND variant_id IS NULL FOR UPDATE;
    IF FOUND AND v_available < v_item.quantity THEN RAISE EXCEPTION 'Insufficient stock'; END IF;
    INSERT INTO order_items(order_id, product_id, product_name, unit_price, unit_cost, quantity, total_price) VALUES(v_order_id, v_item.product_id, v_item.name, v_item.unit_price, COALESCE(v_item.unit_cost,0), v_item.quantity, v_item.quantity * v_item.unit_price);
    UPDATE inventory_balances SET quantity = quantity - v_item.quantity, updated_at = NOW() WHERE store_id = p_store_id AND branch_id = p_branch_id AND product_id = v_item.product_id AND variant_id IS NULL;
    IF FOUND THEN INSERT INTO stock_movements(store_id, branch_id, product_id, movement_type, quantity_change, reference_id, note) VALUES(p_store_id, p_branch_id, v_item.product_id, 'sale', -v_item.quantity, v_order_id, 'POS sale'); END IF;
  END LOOP;
  INSERT INTO payments(store_id, order_id, payment_method, amount, tendered_amount, change_amount, idempotency_key) VALUES(p_store_id, v_order_id, p_payment_method, p_grand_total, p_tendered, p_change, 'pos:' || p_order_number) RETURNING id INTO v_payment_id;
  IF p_customer_id IS NOT NULL THEN v_points := FLOOR(p_grand_total / 10); IF v_points > 0 THEN INSERT INTO loyalty_transactions(store_id, customer_id, order_id, points_delta, reason) VALUES(p_store_id, p_customer_id, v_order_id, v_points, 'sale_reward'); UPDATE customers SET points = points + v_points WHERE id = p_customer_id AND store_id = p_store_id; END IF; END IF;
  INSERT INTO audit_logs(store_id, action, target_entity, entity_id, changes, reason) VALUES(p_store_id, 'complete_sale', 'order', v_order_id, jsonb_build_object('total',p_grand_total,'paymentMethod',p_payment_method), 'POS sale');
  RETURN jsonb_build_object('orderId', v_order_id, 'paymentId', v_payment_id, 'alreadyApplied', FALSE);
END; $$;
