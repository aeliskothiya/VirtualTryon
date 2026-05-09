"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2, ArrowLeft, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { storeProducts, Product } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<string[]>(["p1", "p2", "p3", "p4"]);

  const wishlistProducts = storeProducts.filter((p) => wishlistItems.includes(p.id));
  const totalValue = wishlistProducts.reduce((sum, p) => sum + p.price, 0);

  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prev) => prev.filter((id) => id !== productId));
  };

  return (
    <AppLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={item} className="flex items-center gap-4">
          <Link href="/store">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight">
              My Wishlist
            </h1>
            <p className="text-muted-foreground text-sm">
              {wishlistItems.length} items saved
            </p>
          </div>
        </motion.div>

        {wishlistItems.length === 0 ? (
          <motion.div
            variants={item}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl font-semibold">Your wishlist is empty</h3>
            <p className="text-muted-foreground text-sm mt-2">
              Save items you love to buy later
            </p>
            <Link href="/store">
              <Button className="mt-6 rounded-xl">Browse Store</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Wishlist Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {wishlistProducts.map((product) => (
                  <WishlistItem
                    key={product.id}
                    product={product}
                    onRemove={() => removeFromWishlist(product.id)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <motion.div variants={item} className="glass rounded-2xl p-6 space-y-4 sticky top-24">
                <h3 className="font-serif text-xl font-semibold">Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span>{wishlistItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Value</span>
                    <span className="font-semibold">${totalValue.toLocaleString()}</span>
                  </div>
                </div>

                <Button className="w-full rounded-xl h-12">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add All to Cart
                </Button>

                <Button variant="outline" className="w-full rounded-xl">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Share Wishlist
                </Button>
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}

function WishlistItem({
  product,
  onRemove,
}: {
  product: Product;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="glass rounded-2xl p-4 flex gap-4 group"
    >
      <Link href={`/store/${product.id}`}>
        <div className="w-24 h-32 rounded-xl overflow-hidden relative flex-shrink-0">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {product.brand}
          </p>
          <Link href={`/store/${product.id}`}>
            <h3 className="font-medium hover:underline">{product.name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <p className="font-semibold">${product.price}</p>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-xl">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="rounded-xl text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
