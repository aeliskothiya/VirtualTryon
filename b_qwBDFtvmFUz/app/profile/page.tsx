"use client";

import { motion } from "framer-motion";
import { Camera, Settings, Heart, Package, LogOut, ChevronRight, Shirt, Palette } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userProfile, outfits, storeProducts } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";

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

const purchaseHistory = [
  {
    id: "order-1",
    date: "Jan 15, 2024",
    items: 3,
    total: 1285,
    status: "Delivered",
  },
  {
    id: "order-2",
    date: "Dec 28, 2023",
    items: 2,
    total: 890,
    status: "Delivered",
  },
  {
    id: "order-3",
    date: "Nov 10, 2023",
    items: 1,
    total: 495,
    status: "Delivered",
  },
];

export default function ProfilePage() {
  return (
    <AppLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Profile Header */}
        <motion.div
          variants={item}
          className="glass rounded-3xl p-6 lg:p-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 lg:w-32 lg:h-32 border-4 border-background">
                <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                <AvatarFallback className="text-2xl">
                  {userProfile.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Camera className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-serif text-2xl lg:text-3xl font-semibold">
                {userProfile.name}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {userProfile.email}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <Badge variant="secondary">{userProfile.styleProfile}</Badge>
                <Badge variant="outline">Member since {userProfile.memberSince}</Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href="/settings">
                <Button variant="outline" size="icon" className="rounded-xl">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/profile/edit">
                <Button variant="outline" className="rounded-xl">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-semibold font-serif">
                <Shirt className="w-5 h-5 text-primary" />
                {userProfile.totalItems}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Items</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-semibold font-serif">
                <Palette className="w-5 h-5 text-primary" />
                {userProfile.totalOutfits}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Outfits</p>
            </div>
            <div className="text-center">
              <div className="flex flex-wrap items-center justify-center gap-1">
                {userProfile.favoriteColors.map((color) => (
                  <span
                    key={color}
                    className="text-xs px-2 py-0.5 rounded-full bg-secondary"
                  >
                    {color}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Favorite Colors</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={item}>
          <Tabs defaultValue="outfits" className="space-y-6">
            <TabsList className="glass border-0 p-1 rounded-xl">
              <TabsTrigger value="outfits" className="rounded-lg">
                Saved Outfits
              </TabsTrigger>
              <TabsTrigger value="purchases" className="rounded-lg">
                Purchase History
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="rounded-lg">
                Wishlist
              </TabsTrigger>
            </TabsList>

            {/* Saved Outfits */}
            <TabsContent value="outfits" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {outfits.map((outfit) => (
                  <motion.div
                    key={outfit.id}
                    whileHover={{ y: -4 }}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden glass relative">
                      <Image
                        src={outfit.image}
                        alt={outfit.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="font-medium text-sm">{outfit.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {outfit.occasion}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Purchase History */}
            <TabsContent value="purchases" className="space-y-4">
              <div className="glass rounded-2xl divide-y divide-border/50">
                {purchaseHistory.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.date} · {order.items} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.total}</p>
                      <Badge
                        variant="secondary"
                        className="text-xs text-green-500"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Wishlist */}
            <TabsContent value="wishlist" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {storeProducts.slice(0, 4).map((product) => (
                  <Link key={product.id} href={`/store/${product.id}`}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="group cursor-pointer"
                    >
                      <div className="aspect-[3/4] rounded-2xl overflow-hidden glass relative">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 flex items-center justify-center">
                          <Heart className="w-4 h-4 fill-primary text-primary" />
                        </button>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {product.brand}
                        </p>
                        <p className="text-sm font-medium truncate">
                          {product.name}
                        </p>
                        <p className="font-semibold">${product.price}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} className="glass rounded-2xl divide-y divide-border/50">
          <Link href="/profile/edit" className="w-full p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Preferences</p>
              <p className="text-sm text-muted-foreground">
                Update your style preferences
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link href="/settings" className="w-full p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Account Settings</p>
              <p className="text-sm text-muted-foreground">
                Manage your account details
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link href="/logout" className="w-full p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left text-destructive">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Sign Out</p>
              <p className="text-sm text-muted-foreground">
                Log out of your account
              </p>
            </div>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
