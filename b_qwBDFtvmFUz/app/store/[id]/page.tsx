"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, ShoppingCart, Sparkles, Minus, Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { storeProducts } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = storeProducts.find((p) => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Product not found</p>
          <Link href="/store">
            <Button variant="outline" className="mt-4 rounded-xl">
              Back to Store
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const relatedProducts = storeProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Back Button */}
        <Link href="/store">
          <Button variant="ghost" className="rounded-xl -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Store
          </Button>
        </Link>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-[3/4] rounded-3xl overflow-hidden glass relative"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">
                {product.brand}
              </p>
              <h1 className="font-serif text-3xl lg:text-4xl font-semibold mt-2">
                {product.name}
              </h1>
              <p className="text-2xl font-semibold mt-4">${product.price}</p>
            </div>

            <Badge variant="secondary" className="text-sm">
              {product.category}
            </Badge>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center gap-2 glass rounded-xl p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg h-8 w-8"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg h-8 w-8"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl h-12 w-12"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWishlisted ? "fill-primary text-primary" : ""
                  }`}
                />
              </Button>
              <Button className="flex-1 rounded-xl h-12 text-base">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Buy Similar Look */}
            <div className="glass rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Buy Similar Look</p>
                <p className="text-xs text-muted-foreground">
                  Get AI-powered suggestions for complete outfits
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">
                Explore
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-border/50">
            <h2 className="font-serif text-xl font-semibold">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((related) => (
                <Link key={related.id} href={`/store/${related.id}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden glass relative">
                      <Image
                        src={related.image}
                        alt={related.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {related.brand}
                      </p>
                      <p className="text-sm font-medium truncate">
                        {related.name}
                      </p>
                      <p className="font-semibold">${related.price}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
