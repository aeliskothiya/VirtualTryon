"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, CreditCard } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { storeProducts } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";

interface CartItem {
  productId: string;
  quantity: number;
}

const initialCart: CartItem[] = [
  { productId: "p1", quantity: 1 },
  { productId: "p3", quantity: 2 },
  { productId: "p4", quantity: 1 },
];

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [promoCode, setPromoCode] = useState("");

  const cartProducts = cart.map((item) => ({
    ...item,
    product: storeProducts.find((p) => p.id === item.productId)!,
  })).filter((item) => item.product);

  const subtotal = cartProducts.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + shipping;

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/store">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-muted-foreground text-sm">
              {cart.length} {cart.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground text-sm mt-2">
              Explore our store to find something you love
            </p>
            <Link href="/store">
              <Button className="mt-6 rounded-xl">Browse Store</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartProducts.map(({ product, quantity }) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="glass rounded-2xl p-4 flex gap-4"
                  >
                    <div className="w-24 h-32 rounded-xl overflow-hidden relative flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          {product.brand}
                        </p>
                        <Link href={`/store/${product.id}`}>
                          <h3 className="font-medium hover:underline">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {product.category}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 glass rounded-xl p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-lg h-8 w-8"
                            onClick={() => updateQuantity(product.id, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-lg h-8 w-8"
                            onClick={() => updateQuantity(product.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="font-semibold">
                          ${product.price * quantity}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-muted-foreground hover:text-destructive self-start"
                      onClick={() => removeItem(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 space-y-4 sticky top-24">
                <h3 className="font-serif text-xl font-semibold">Order Summary</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
                  </div>
                  {subtotal < 500 && (
                    <p className="text-xs text-muted-foreground">
                      Add ${(500 - subtotal).toFixed(2)} more for free shipping
                    </p>
                  )}
                </div>

                <Separator />

                {/* Promo Code */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="rounded-xl"
                  />
                  <Button variant="outline" className="rounded-xl">
                    Apply
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button className="w-full rounded-xl h-12 text-base">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Checkout
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
