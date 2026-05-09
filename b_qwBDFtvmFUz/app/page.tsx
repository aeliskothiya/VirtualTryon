"use client";

import { motion } from "framer-motion";
import { Shirt, Palette, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { wardrobeItems, outfits } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";

const stats = [
  { label: "Total Items", value: 48, icon: Shirt, change: "+3 this week" },
  { label: "Outfits Created", value: 24, icon: Palette, change: "+2 this week" },
  { label: "Most Worn", value: "White Sneakers", icon: TrendingUp, change: "45 wears" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const recommendations = [
    "Perfect weather for your Cashmere Coat today",
    "Try pairing your new Silk Blouse with the Wool Trousers",
    "You haven&apos;t worn your Leather Jacket in 2 weeks",
  ];

  return (
    <AppLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={item} className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">
            Good Morning, Alexandra
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your wardrobe today.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="glass rounded-2xl p-6 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-semibold mt-1 font-serif">{stat.value}</p>
                  <p className="text-xs text-primary mt-2">{stat.change}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* What to Wear Button */}
        <motion.div variants={item}>
          <Link href="/outfit-builder">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 cursor-pointer group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent)]" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">What should I wear today?</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Get AI-powered outfit suggestions based on weather and your schedule
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Recent Outfits */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-semibold">Recent Outfits</h2>
            <Link href="/outfits" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {outfits.map((outfit, index) => (
              <motion.div
                key={outfit.id}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex-shrink-0 w-48 cursor-pointer group"
              >
                <div className="aspect-[3/4] rounded-2xl overflow-hidden relative glass">
                  <Image
                    src={outfit.image}
                    alt={outfit.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-medium text-sm">{outfit.name}</p>
                    <p className="text-xs text-muted-foreground">{outfit.occasion}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div variants={item}>
          <h2 className="font-serif text-xl font-semibold mb-4">Style Recommendations</h2>
          <div className="glass rounded-2xl divide-y divide-border/50">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                className="p-4 flex items-center gap-4 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <p className="text-sm">{rec}</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Access Items */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-semibold">Recently Added</h2>
            <Link href="/wardrobe" className="text-sm text-primary hover:underline">
              View Wardrobe
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {wardrobeItems.slice(0, 6).map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="aspect-square rounded-2xl overflow-hidden relative glass cursor-pointer group"
                style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-xs font-medium truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.brand}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
