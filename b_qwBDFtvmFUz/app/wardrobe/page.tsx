"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, LayoutList, Plus, X, Search, Filter } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { wardrobeItems, ClothingItem } from "@/lib/mock-data";
import Image from "next/image";
import { AddItemForm } from "@/components/wardrobe/add-item-form";
import { ItemDetailPanel } from "@/components/wardrobe/item-detail-panel";

type ViewMode = "closet" | "grid";
type Category = "all" | "tops" | "bottoms" | "shoes" | "accessories" | "outerwear";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function WardrobePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("closet");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredItems = wardrobeItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const tops = filteredItems.filter((i) => i.category === "tops" || i.category === "outerwear");
  const bottoms = filteredItems.filter((i) => i.category === "bottoms");
  const shoes = filteredItems.filter((i) => i.category === "shoes");
  const accessories = filteredItems.filter((i) => i.category === "accessories");

  const categories: { value: Category; label: string }[] = [
    { value: "all", label: "All" },
    { value: "tops", label: "Tops" },
    { value: "bottoms", label: "Bottoms" },
    { value: "shoes", label: "Shoes" },
    { value: "accessories", label: "Accessories" },
    { value: "outerwear", label: "Outerwear" },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight">My Wardrobe</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {wardrobeItems.length} items in your collection
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass rounded-xl p-1 flex">
                <Button
                  variant={viewMode === "closet" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("closet")}
                  className="rounded-lg"
                >
                  <LayoutList className="w-4 h-4 mr-2" />
                  Closet
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-lg"
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Grid
                </Button>
              </div>
              <Sheet open={showAddForm} onOpenChange={setShowAddForm}>
                <SheetTrigger asChild>
                  <Button className="rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="font-serif text-2xl">Add New Item</SheetTitle>
                  </SheetHeader>
                  <AddItemForm onClose={() => setShowAddForm(false)} />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl glass border-0"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className="rounded-full whitespace-nowrap"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Wardrobe View */}
          <AnimatePresence mode="wait">
            {viewMode === "closet" ? (
              <motion.div
                key="closet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Hanging Section - Tops */}
                {(selectedCategory === "all" || selectedCategory === "tops" || selectedCategory === "outerwear") && tops.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-full bg-border/50 rounded-full" />
                      <span className="text-sm text-muted-foreground whitespace-nowrap px-3">
                        Hanging
                      </span>
                      <div className="h-1 w-full bg-border/50 rounded-full" />
                    </div>
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4"
                    >
                      {tops.map((item, index) => (
                        <HangingItem
                          key={item.id}
                          item={item}
                          index={index}
                          onClick={() => setSelectedItem(item)}
                          isSelected={selectedItem?.id === item.id}
                        />
                      ))}
                    </motion.div>
                  </div>
                )}

                {/* Folded Section - Bottoms */}
                {(selectedCategory === "all" || selectedCategory === "bottoms") && bottoms.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-full bg-border/50 rounded-full" />
                      <span className="text-sm text-muted-foreground whitespace-nowrap px-3">
                        Folded
                      </span>
                      <div className="h-1 w-full bg-border/50 rounded-full" />
                    </div>
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                    >
                      {bottoms.map((item, index) => (
                        <FoldedItem
                          key={item.id}
                          item={item}
                          index={index}
                          onClick={() => setSelectedItem(item)}
                          isSelected={selectedItem?.id === item.id}
                        />
                      ))}
                    </motion.div>
                  </div>
                )}

                {/* Shoes Section */}
                {(selectedCategory === "all" || selectedCategory === "shoes") && shoes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-full bg-border/50 rounded-full" />
                      <span className="text-sm text-muted-foreground whitespace-nowrap px-3">
                        Shoes
                      </span>
                      <div className="h-1 w-full bg-border/50 rounded-full" />
                    </div>
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4"
                    >
                      {shoes.map((item, index) => (
                        <ShoeItem
                          key={item.id}
                          item={item}
                          index={index}
                          onClick={() => setSelectedItem(item)}
                          isSelected={selectedItem?.id === item.id}
                        />
                      ))}
                    </motion.div>
                  </div>
                )}

                {/* Accessories Section */}
                {(selectedCategory === "all" || selectedCategory === "accessories") && accessories.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-full bg-border/50 rounded-full" />
                      <span className="text-sm text-muted-foreground whitespace-nowrap px-3">
                        Accessories
                      </span>
                      <div className="h-1 w-full bg-border/50 rounded-full" />
                    </div>
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4"
                    >
                      {accessories.map((item, index) => (
                        <AccessoryItem
                          key={item.id}
                          item={item}
                          index={index}
                          onClick={() => setSelectedItem(item)}
                          isSelected={selectedItem?.id === item.id}
                        />
                      ))}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              >
                {filteredItems.map((item) => (
                  <GridItem
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedItem(item)}
                    isSelected={selectedItem?.id === item.id}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedItem && (
            <ItemDetailPanel
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

function HangingItem({
  item,
  index,
  onClick,
  isSelected,
}: {
  item: ClothingItem;
  index: number;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <motion.div
      variants={itemAnim}
      whileHover={{ scale: 1.05, rotateZ: -2, y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex-shrink-0 cursor-pointer group relative ${
        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-2xl" : ""
      }`}
      style={{
        transformOrigin: "top center",
        transform: `rotateZ(${index % 2 === 0 ? -2 : 2}deg)`,
      }}
    >
      {/* Hanger */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-3 bg-border rounded-t-full z-10" />
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-4 bg-border z-10" />
      
      <div className="w-36 aspect-[3/4] rounded-2xl overflow-hidden glass relative">
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
      </div>
    </motion.div>
  );
}

function FoldedItem({
  item,
  index,
  onClick,
  isSelected,
}: {
  item: ClothingItem;
  index: number;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <motion.div
      variants={itemAnim}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer group ${
        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-2xl" : ""
      }`}
    >
      <div className="aspect-square rounded-2xl overflow-hidden glass relative">
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
        <div
          className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-background"
          style={{ backgroundColor: item.colorHex }}
        />
      </div>
    </motion.div>
  );
}

function ShoeItem({
  item,
  index,
  onClick,
  isSelected,
}: {
  item: ClothingItem;
  index: number;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <motion.div
      variants={itemAnim}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex-shrink-0 cursor-pointer group ${
        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-2xl" : ""
      }`}
    >
      <div className="w-28 aspect-square rounded-2xl overflow-hidden glass relative">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
          <p className="text-[10px] font-medium truncate">{item.name}</p>
        </div>
      </div>
    </motion.div>
  );
}

function AccessoryItem({
  item,
  index,
  onClick,
  isSelected,
}: {
  item: ClothingItem;
  index: number;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <motion.div
      variants={itemAnim}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex-shrink-0 cursor-pointer group ${
        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-full" : ""
      }`}
    >
      <div className="w-20 h-20 rounded-full overflow-hidden glass relative">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
    </motion.div>
  );
}

function GridItem({
  item,
  onClick,
  isSelected,
}: {
  item: ClothingItem;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <motion.div
      variants={itemAnim}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer group ${
        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-2xl" : ""
      }`}
    >
      <div className="aspect-[3/4] rounded-2xl overflow-hidden glass relative">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">{item.brand}</p>
            <div
              className="w-3 h-3 rounded-full border border-background"
              style={{ backgroundColor: item.colorHex }}
            />
          </div>
        </div>
        <Badge
          variant="secondary"
          className="absolute top-2 left-2 text-[10px] capitalize"
        >
          {item.category}
        </Badge>
      </div>
    </motion.div>
  );
}
