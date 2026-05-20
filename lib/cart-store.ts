/**
 * Cart store — Zustand persistent cart.
 *
 * Replaces the Phase-03 stub (useCartCount() → 0).
 * Persists to localStorage under key "upaec-cart" so cart
 * survives page refreshes.
 *
 * Exported hooks:
 *   useCartStore()   — full store (add, remove, clear, items, count)
 *   useCartCount()   — lightweight count-only subscriber (header badge)
 *
 * Task: UPAEC-T-272-03
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  /** Square variation ID or fallback display id */
  id: string;
  /** Human-readable name */
  name: string;
  /** Size description (e.g. "Starter Box") */
  variation?: string;
  /** Price in cents */
  priceCents: number;
  /** Display price (e.g. "$45") */
  priceDisplay: string;
  /** Quantity — typically 1 for boxes */
  qty: number;
}

export interface DeliveryMode {
  mode: "delivery" | "pickup";
  /** ZIP code entered by the customer */
  zip?: string;
}

export interface CartStore {
  items: CartItem[];
  delivery: DeliveryMode;

  /** Add an item; if it already exists, increment qty */
  addItem: (item: Omit<CartItem, "qty">) => void;
  /** Remove all instances of an item by id */
  removeItem: (id: string) => void;
  /** Increment qty by 1 */
  incrementItem: (id: string) => void;
  /** Decrement qty by 1; removes when qty reaches 0 */
  decrementItem: (id: string) => void;
  /** Empty the cart */
  clearCart: () => void;

  /** Set delivery vs pickup mode */
  setDeliveryMode: (mode: "delivery" | "pickup") => void;
  /** Set the delivery ZIP */
  setDeliveryZip: (zip: string) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      delivery: { mode: "pickup" },

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, qty: 1 }] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      incrementItem: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, qty: i.qty + 1 } : i
          ),
        })),

      decrementItem: (id) =>
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (!item) return state;
          if (item.qty <= 1) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, qty: i.qty - 1 } : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      setDeliveryMode: (mode) =>
        set((state) => ({ delivery: { ...state.delivery, mode } })),

      setDeliveryZip: (zip) =>
        set((state) => ({ delivery: { ...state.delivery, zip } })),
    }),
    {
      name: "upaec-cart",
      // Only persist items + delivery preference (not callbacks)
      partialize: (state) => ({ items: state.items, delivery: state.delivery }),
    }
  )
);

// ── Convenience hook (SiteHeader badge) ───────────────────────────────────────

export function useCartCount(): number {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.qty, 0)
  );
}

/** Total price in cents */
export function useCartTotal(): number {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.priceCents * item.qty, 0)
  );
}
