import { createClient } from '@supabase/supabase-js';
import { Product } from '@/lib/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storeId = process.env.PADAENG_STORE_ID || '00000000-0000-0000-0000-000000000001';

const adminClient = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    store_id: String(row.store_id),
    category_id: row.category_id ? String(row.category_id) : undefined,
    name: String(row.name),
    sku: row.sku ? String(row.sku) : undefined,
    barcode: row.barcode ? String(row.barcode) : undefined,
    description: row.description ? String(row.description) : undefined,
    image_url: row.image_url ? String(row.image_url) : undefined,
    base_price: Number(row.base_price || 0),
    cost_price: Number(row.cost_price || 0),
    is_active: Boolean(row.is_active),
    track_inventory: Boolean(row.track_inventory),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export type NewProduct = Pick<Product, 'name' | 'base_price'> & Partial<Pick<Product, 'cost_price' | 'image_url' | 'category_id' | 'sku' | 'barcode'>>;

async function ensureStore() {
  if (!adminClient) return;
  const { error } = await adminClient.from('stores').upsert({
    id: storeId,
    name: 'PaDaeng POS',
    business_type: 'retail',
  });
  if (error) throw error;
}

export async function listServerProducts(): Promise<Product[]> {
  if (!adminClient) return [];
  const { data, error } = await adminClient
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => mapProduct(row as Record<string, unknown>));
}

export async function createServerProduct(input: NewProduct): Promise<Product> {
  if (!adminClient) throw new Error('Supabase server configuration is missing');
  await ensureStore();
  const { data, error } = await adminClient
    .from('products')
    .insert({
      store_id: storeId,
      name: input.name.trim(),
      base_price: input.base_price,
      cost_price: input.cost_price || 0,
      image_url: input.image_url || null,
      sku: input.sku || null,
      barcode: input.barcode || null,
      category_id: null,
      is_active: true,
      track_inventory: true,
    })
    .select('*')
    .single();
  if (error || !data) throw error || new Error('Product insert returned no data');
  await adminClient.from('catalog_sync_events').insert({ store_id: storeId, product_id: data.id, payload: { name: data.name, base_price: data.base_price, cost_price: data.cost_price }, event_type: 'upsert' });
  await adminClient.from('audit_logs').insert({ store_id: storeId, action: 'create_product', target_entity: 'product', entity_id: data.id, changes: { name: data.name, base_price: data.base_price, cost_price: data.cost_price }, reason: 'Catalog update' });
  return mapProduct(data as Record<string, unknown>);
}
