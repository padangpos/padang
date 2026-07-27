export const seedDemoStore = {
  store: {
    id: "d0a8e1b2-3c4d-5e6f-7a8b-9c0d1e2f3a4b",
    name: "ร้านกาแฟป้าแดง (สาขาหลัก)",
    business_type: "cafe",
    phone: "081-234-5678",
    address: "123/45 ถนนสุขุมวิท กรุงเทพฯ",
  },
  categories: [
    { id: "cat-1", name: "เครื่องดื่มร้อน", sort_order: 1 },
    { id: "cat-2", name: "เครื่องดื่มเย็น", sort_order: 2 },
    { id: "cat-3", name: "เบเกอรี & ขนม", sort_order: 3 },
  ],
  products: [
    { id: "prod-1", category_id: "cat-1", name: "เอสเพรสโซ ร้อน", base_price: 45, cost_price: 15 },
    { id: "prod-2", category_id: "cat-2", name: "ชาไทย เย็น", base_price: 50, cost_price: 18 },
    { id: "prod-3", category_id: "cat-2", name: "กาแฟลาเต้ เย็น", base_price: 60, cost_price: 22 },
    { id: "prod-4", category_id: "cat-3", name: "ครัวซองต์เนยสด", base_price: 65, cost_price: 25 },
  ],
  stock: [
    { product_id: "prod-1", quantity: 100, min_stock_alert: 10 },
    { product_id: "prod-2", quantity: 80, min_stock_alert: 15 },
    { product_id: "prod-3", quantity: 60, min_stock_alert: 10 },
    { product_id: "prod-4", quantity: 15, min_stock_alert: 5 },
  ],
};

console.log("✅ Seed data generator structure loaded successfully.");
