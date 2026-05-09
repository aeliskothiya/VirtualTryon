"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Grid3X3, LayoutList, Search, Calendar, Heart, MoreVertical, Trash2, Edit, Share } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { outfits, Outfit } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";

type ViewMode = "grid" | "list";

const occasions = ["All", "Work", "Casual", "Evening", "Vacation", "Formal"];

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

export default function OutfitsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedOccasion, setSelectedOccasion] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(["o1", "o3"]);

  const filteredOutfits = outfits.filter((outfit) => {
    const matchesOccasion = selectedOccasion === "All" || outfit.occasion === selectedOccasion;
    const matchesSearch = outfit.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesOccasion && matchesSearch;
  });

  const toggleFavorite = (outfitId: string) => {
    setFavorites((prev) =>
      prev.includes(outfitId)
        ? prev.filter((id) => id !== outfitId)
        : [...prev, outfitId]
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight">My Outfits</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {outfits.length} saved outfits
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass rounded-xl p-1 flex">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-lg"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-lg"
              >
                <LayoutList className="w-4 h-4" />
              </Button>
            </div>
            <Link href="/outfit-builder">
              <Button className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Create Outfit
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search outfits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl glass border-0"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {occasions.map((occasion) => (
              <Button
                key={occasion}
                variant={selectedOccasion === occasion ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedOccasion(occasion)}
                className="rounded-full whitespace-nowrap"
              >
                {occasion}
              </Button>
            ))}
          </div>
        </div>

        {/* Outfits View */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {filteredOutfits.map((outfit) => (
                <OutfitGridCard
                  key={outfit.id}
                  outfit={outfit}
                  isFavorite={favorites.includes(outfit.id)}
                  onToggleFavorite={() => toggleFavorite(outfit.id)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {filteredOutfits.map((outfit) => (
                <OutfitListCard
                  key={outfit.id}
                  outfit={outfit}
                  isFavorite={favorites.includes(outfit.id)}
                  onToggleFavorite={() => toggleFavorite(outfit.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredOutfits.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No outfits found</p>
            <Link href="/outfit-builder">
              <Button className="mt-4 rounded-xl">Create Your First Outfit</Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function OutfitGridCard({
  outfit,
  isFavorite,
  onToggleFavorite,
}: {
  outfit: Outfit;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <motion.div
      variants={item}
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
        
        {/* Actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? "fill-primary text-primary" : "text-foreground"
              }`}
            />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="font-medium">{outfit.name}</p>
          <div className="flex items-center justify-between mt-1">
            <Badge variant="secondary" className="text-xs">
              {outfit.occasion}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {outfit.createdAt}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function OutfitListCard({
  outfit,
  isFavorite,
  onToggleFavorite,
}: {
  outfit: Outfit;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <motion.div
      variants={item}
      whileHover={{ x: 4 }}
      className="glass rounded-2xl p-4 flex items-center gap-4 cursor-pointer group"
    >
      <div className="w-24 h-32 rounded-xl overflow-hidden relative flex-shrink-0">
        <Image
          src={outfit.image}
          alt={outfit.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-lg">{outfit.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {outfit.occasion}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {outfit.items.length} items
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Created {outfit.createdAt}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? "fill-primary text-primary" : "text-foreground"
            }`}
          />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
