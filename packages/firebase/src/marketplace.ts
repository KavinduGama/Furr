// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Marketplace Firestore helpers & seed data
// ─────────────────────────────────────────────────────────────

import type { Product, Order, ProductCategory, CartItem, ProductReview } from '@furr/core';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Royal Canin Maxi Adult Dry Dog Food',
    brand: 'Royal Canin',
    category: 'food',
    price: 8500,
    originalPrice: 9500,
    rating: 4.9,
    reviewCount: 42,
    imageUrls: ['https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=800&auto=format&fit=crop&q=60'],
    description: 'Complete feed for large breed adult dogs (from 26 to 44 kg) - from 15 months to 5 years old. Promotes optimal digestability and bone & joint support.',
    features: ['High digestibility', 'Bone & joint support', 'Omega 3: EPA - DHA', 'Enriched with antioxidants'],
    stock: 25,
    inStock: true,
    targetSpecies: ['dog'],
    targetLifeStage: ['adult'],
    sellerId: 'vendor-1',
    sellerName: 'Colombo Pet Mart',
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Hill\'s Science Diet Kitten Ocean Fish Recipe',
    brand: 'Hill\'s',
    category: 'food',
    price: 6200,
    originalPrice: 7000,
    rating: 4.8,
    reviewCount: 28,
    imageUrls: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop&q=60'],
    description: 'Specially formulated for the developmental needs of kittens, so they get the best start in life & grow to their full potential.',
    features: ['DHA from fish oil for healthy brain & eye development', 'High-quality protein for building lean muscles', 'Balanced minerals for strong bones & teeth'],
    stock: 18,
    inStock: true,
    targetSpecies: ['cat'],
    targetLifeStage: ['kitten'],
    sellerId: 'vendor-1',
    sellerName: 'Colombo Pet Mart',
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Simparica Trio Chewable Tablets for Dogs',
    brand: 'Zoetis',
    category: 'medicine',
    price: 4800,
    rating: 5.0,
    reviewCount: 65,
    imageUrls: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60'],
    description: 'Triple protection against fleas, ticks, heartworm disease and intestinal worms in one convenient, liver-flavored monthly chewable.',
    features: ['Protects against heartworm disease', 'Kills 5 types of ticks', 'Treats and controls roundworms and hookworms', 'FDA approved safe for puppies 8 weeks+'],
    stock: 40,
    inStock: true,
    targetSpecies: ['dog'],
    sellerId: 'vendor-2',
    sellerName: 'Central Vet Pharmacy',
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'KONG Classic Dog Toy - Durable Rubber',
    brand: 'KONG',
    category: 'toys',
    price: 2800,
    originalPrice: 3200,
    rating: 4.9,
    reviewCount: 89,
    imageUrls: ['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=60'],
    description: 'Mentally stimulating toy; offering enrichment by helping satisfy dogs\' instinctual needs. Unpredictable bounce for games of fetch.',
    features: ['Ultra-durable natural rubber', 'Stuffable with treats or peanut butter', 'Recommended by veterinarians worldwide'],
    stock: 30,
    inStock: true,
    targetSpecies: ['dog'],
    sellerId: 'vendor-1',
    sellerName: 'Colombo Pet Mart',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Organic Aloe Vera & Oatmeal Pet Shampoo',
    brand: 'Earthbath',
    category: 'hygiene',
    price: 3400,
    rating: 4.7,
    reviewCount: 31,
    imageUrls: ['https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&auto=format&fit=crop&q=60'],
    description: 'Soap-free, natural shampoo specifically formulated for dry, itchy and sensitive skin. Promotes soft, shiny coat.',
    features: ['100% biodegradable and cruelty-free', 'Relieves skin itching and irritation', 'Leaves coat clean, plush and fragrant'],
    stock: 15,
    inStock: true,
    targetSpecies: ['dog', 'cat', 'all'],
    sellerId: 'vendor-3',
    sellerName: 'Lanka Pet Groomers Supply',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    name: 'Orthopedic Memory Foam Pet Bed',
    brand: 'Furr Comfort',
    category: 'beds',
    price: 11500,
    originalPrice: 13500,
    rating: 4.9,
    reviewCount: 19,
    imageUrls: ['https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=800&auto=format&fit=crop&q=60'],
    description: 'Premium orthopedic grade memory foam relief for aging pets, joints, and ultimate sleeping luxury.',
    features: ['Waterproof inner liner', 'Removable, machine-washable plush cover', 'Non-skid bottom'],
    stock: 10,
    inStock: true,
    targetSpecies: ['dog', 'cat', 'all'],
    sellerId: 'vendor-1',
    sellerName: 'Colombo Pet Mart',
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
];

export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  categoryFilter?: ProductCategory
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const colRef = collection(db, 'marketplace_products');

      unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (snapshot.empty) {
            // Return fallback seed products if Firestore collection not yet populated
            const filtered = categoryFilter
              ? INITIAL_PRODUCTS.filter((p) => p.category === categoryFilter)
              : INITIAL_PRODUCTS;
            onUpdate(filtered);
            return;
          }
          const prods: Product[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Product;
            if (!categoryFilter || data.category === categoryFilter) {
              prods.push({ ...data, id: docSnap.id });
            }
          });
          onUpdate(prods.length > 0 ? prods : INITIAL_PRODUCTS);
        },
        (error) => {
          console.warn('Firestore products subscribe fallback:', error);
          const filtered = categoryFilter
            ? INITIAL_PRODUCTS.filter((p) => p.category === categoryFilter)
            : INITIAL_PRODUCTS;
          onUpdate(filtered);
        }
      );

      if (!active && unsubscribe) {
        unsubscribe();
      }
    } catch (e) {
      console.warn('Falling back to local product catalogue:', e);
      const filtered = categoryFilter
        ? INITIAL_PRODUCTS.filter((p) => p.category === categoryFilter)
        : INITIAL_PRODUCTS;
      onUpdate(filtered);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export function subscribeToOrders(
  ownerUid: string,
  onUpdate: (orders: Order[]) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, 'marketplace_orders'),
        where('ownerUid', '==', ownerUid)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const orders: Order[] = [];
          snapshot.forEach((docSnap) => {
            orders.push(docSnap.data() as Order);
          });
          orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(orders);
        },
        (error) => {
          console.warn('Orders subscription failed:', error);
          onUpdate([]);
        }
      );

      if (!active && unsubscribe) {
        unsubscribe();
      }
    } catch (e) {
      console.warn('Failed to subscribe to orders:', e);
      onUpdate([]);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  try {
    const { getFirestore, collection, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const newRef = doc(collection(db, 'marketplace_orders'));
    const order: Order = {
      ...orderData,
      id: newRef.id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(newRef, order);
    return order;
  } catch (e) {
    console.warn('Local fallback for createOrder:', e);
    const mockOrder: Order = {
      ...orderData,
      id: 'order-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    return mockOrder;
  }
}
