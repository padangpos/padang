import { NextResponse } from 'next/server';
import { createServerProduct, listServerProducts } from '@/lib/catalog/server-product-store';

export async function GET() {
  try {
    return NextResponse.json({ products: await listServerProducts() });
  } catch (error) {
    console.error('Product list failed:', error);
    return NextResponse.json({ error: 'ไม่สามารถโหลดรายการสินค้าได้' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const basePrice = Number(body.base_price);
    const costPrice = Number(body.cost_price || 0);
    if (!name || !Number.isFinite(basePrice) || basePrice < 0 || !Number.isFinite(costPrice) || costPrice < 0) {
      return NextResponse.json({ error: 'ข้อมูลสินค้าไม่ถูกต้อง' }, { status: 400 });
    }
    const product = await createServerProduct({
      name,
      base_price: basePrice,
      cost_price: costPrice,
      image_url: typeof body.image_url === 'string' ? body.image_url : undefined,
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Product create failed:', error);
    return NextResponse.json({ error: 'ไม่สามารถบันทึกสินค้าได้' }, { status: 500 });
  }
}
