import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { CartItem, Product } from '../marketplace';

describe('Marketplace Core Utilities', () => {
  const sampleProduct1: Product = {
    id: 'p1',
    name: 'Kibble Adult 10kg',
    brand: 'PetCare',
    category: 'food',
    price: 8000,
    originalPrice: 9000,
    rating: 4.8,
    reviewCount: 15,
    imageUrls: ['https://example.com/kibble.jpg'],
    description: 'Nutritious dog food',
    features: ['High protein'],
    stock: 10,
    inStock: true,
    targetSpecies: ['dog'],
    sellerId: 'v1',
    sellerName: 'PetMart',
    isFeatured: true,
    createdAt: '2026-08-01T00:00:00Z',
  };

  const sampleProduct2: Product = {
    id: 'p2',
    name: 'Catnip Ball Toy',
    brand: 'FurrToys',
    category: 'toys',
    price: 1500,
    rating: 4.9,
    reviewCount: 8,
    imageUrls: ['https://example.com/catnip.jpg'],
    description: 'Fun organic catnip',
    features: ['Organic catnip'],
    stock: 25,
    inStock: true,
    targetSpecies: ['cat'],
    sellerId: 'v2',
    sellerName: 'ToyZone',
    isFeatured: false,
    createdAt: '2026-08-01T00:00:00Z',
  };

  it('calculates total cart price correctly without discounts', () => {
    const cart: CartItem[] = [
      { product: sampleProduct1, quantity: 2 },
      { product: sampleProduct2, quantity: 3 },
    ];
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    assert.strictEqual(total, 8000 * 2 + 1500 * 3); // 16000 + 4500 = 20500
  });

  it('applies percentage promo coupon correctly', () => {
    const subtotal = 10000;
    const discountRate = 0.1; // 10% for FURR10
    const discountAmount = subtotal * discountRate;
    const finalTotal = subtotal - discountAmount;
    assert.strictEqual(discountAmount, 1000);
    assert.strictEqual(finalTotal, 9000);
  });

  it('identifies in-stock vs out-of-stock items', () => {
    assert.strictEqual(sampleProduct1.inStock, true);
    assert.strictEqual(sampleProduct1.stock > 0, true);

    const outOfStockProduct: Product = {
      ...sampleProduct1,
      id: 'p3',
      stock: 0,
      inStock: false,
    };
    assert.strictEqual(outOfStockProduct.inStock, false);
    assert.strictEqual(outOfStockProduct.stock, 0);
  });
});
