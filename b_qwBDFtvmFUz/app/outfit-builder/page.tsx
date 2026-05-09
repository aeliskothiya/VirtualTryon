"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Trash2, Sparkles, Shuffle, ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { wardrobeItems, ClothingItem } from "@/lib/mock-data";
import Image from "next/image";

type SlotType = "top" | "bottom" | "shoes" | "accessory";

interface OutfitSlot {
  type: SlotType;
  item: ClothingItem | null;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemAnim = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

const suggestions = [
  "Try adding a statement accessory",
  "Consider layering with outerwear",
  "Balance proportions with wide-leg bottoms",
];

export default function OutfitBuilderPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("tops");
  const [outfitSlots, setOutfitSlots] = useState<OutfitSlot[]>([
    { type: "top", item: null },
    { type: "bottom", item: null },
    { type: "shoes", item: null },
    { type: "accessory", item: null },
  ]);
  const [activeSlot, setActiveSlot] = useState<SlotType>("top");
  const [outfitName, setOutfitName] = useState("");

  const categories = [
    { id: "tops", label: "Tops", types: ["tops", "outerwear"] },
    { id: "bottoms", label: "Bottoms", types: ["bottoms"] },
    { id: "shoes", label: "Shoes", types: ["shoes"] },
    { id: "accessories", label: "Accessories", types: ["accessories"] },
  ];

  const filteredItems = wardrobeItems.filter((item) => {
    const category = categories.find((c) => c.id === selectedCategory);
    return category?.types.includes(item.category);
  });

  const addToSlot = (item: ClothingItem) => {
    const slotTypeMap: Record<string, SlotType> = {
      tops: "top",
      outerwear: "top",
      bottoms: "bottom",
      shoes: "shoes",
      accessories: "accessory",
    };
    const slotType = slotTypeMap[item.category];
    
    setOutfitSlots((prev) =>
      prev.map((slot) =>
        slot.type === slotType ? { ...slot, item } : slot
      )
    );
  };

  const removeFromSlot = (slotType: SlotType) => {
    setOutfitSlots((prev) =>
      prev.map((slot) =>
        slot.type === slotType ? { ...slot, item: null } : slot
      )
    );
  };

  const clearOutfit = () => {
    setOutfitSlots((prev) => prev.map((slot) => ({ ...slot, item: null })));
  };

  const randomizeOutfit = () => {
    const tops = wardrobeItems.filter((i) => i.category === "tops" || i.category === "outerwear");
    const bottoms = wardrobeItems.filter((i) => i.category === "bottoms");
    const shoes = wardrobeItems.filter((i) => i.category === "shoes");
    const accessories = wardrobeItems.filter((i) => i.category === "accessories");

    setOutfitSlots([
      { type: "top", item: tops[Math.floor(Math.random() * tops.length)] || null },
      { type: "bottom", item: bottoms[Math.floor(Math.random() * bottoms.length)] || null },
      { type: "shoes", item: shoes[Math.floor(Math.random() * shoes.length)] || null },
      { type: "accessory", item: accessories[Math.floor(Math.random() * accessories.length)] || null },
    ]);
  };

  const filledSlots = outfitSlots.filter((s) => s.item).length;

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-8rem)]">
        {/* Left Panel - Wardrobe Items */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-serif text-xl font-semibold">Wardrobe</h2>
          
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="rounded-full whitespace-nowrap"
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Items Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            key={selectedCategory}
            className="grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-2"
          >
            {filteredItems.map((item) => {
              const isInOutfit = outfitSlots.some((s) => s.item?.id === item.id);
              return (
                <motion.div
                  key={item.id}
                  variants={itemAnim}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => !isInOutfit && addToSlot(item)}
                  className={`aspect-square rounded-xl overflow-hidden cursor-pointer relative group glass ${
                    isInOutfit ? "ring-2 ring-primary opacity-50" : ""
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  {isInOutfit && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                      <Badge>Added</Badge>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Center - Mannequin / Outfit Preview */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm space-y-4">
            <div className="text-center mb-6">
              <h1 className="font-serif text-2xl font-semibold">Outfit Builder</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Drag items to create your perfect look
              </p>
            </div>

            {/* Mannequin Slots */}
            <div className="relative aspect-[3/5] glass rounded-3xl p-6 flex flex-col items-center justify-between">
              {/* Silhouette Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <svg viewBox="0 0 100 200" className="h-full w-auto">
                  <ellipse cx="50" cy="20" rx="15" ry="18" fill="currentColor" />
                  <path
                    d="M35 38 Q50 45 65 38 L70 90 Q50 95 30 90 Z"
                    fill="currentColor"
                  />
                  <path
                    d="M30 90 Q50 95 70 90 L75 180 Q50 185 25 180 Z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              {/* Outfit Slots */}
              <div className="relative z-10 flex flex-col items-center gap-3 w-full">
                {/* Top Slot */}
                <OutfitSlotComponent
                  slot={outfitSlots.find((s) => s.type === "top")!}
                  onRemove={() => removeFromSlot("top")}
                  label="Top"
                  className="w-32 h-32"
                />

                {/* Bottom Slot */}
                <OutfitSlotComponent
                  slot={outfitSlots.find((s) => s.type === "bottom")!}
                  onRemove={() => removeFromSlot("bottom")}
                  label="Bottom"
                  className="w-28 h-36"
                />

                {/* Shoes & Accessory Row */}
                <div className="flex gap-4 items-center">
                  <OutfitSlotComponent
                    slot={outfitSlots.find((s) => s.type === "shoes")!}
                    onRemove={() => removeFromSlot("shoes")}
                    label="Shoes"
                    className="w-20 h-20"
                  />
                  <OutfitSlotComponent
                    slot={outfitSlots.find((s) => s.type === "accessory")!}
                    onRemove={() => removeFromSlot("accessory")}
                    label="Accessory"
                    className="w-16 h-16 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={clearOutfit}
                className="rounded-xl"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={randomizeOutfit}
                className="rounded-xl"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Name your outfit..."
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  className="rounded-xl flex-1"
                />
                <Button disabled={filledSlots < 2} className="rounded-xl">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Suggestions */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Style Suggestions
          </h2>

          <div className="glass rounded-2xl divide-y divide-border/50">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">
                    {index + 1}
                  </span>
                </div>
                <p className="text-sm">{suggestion}</p>
              </motion.div>
            ))}
          </div>

          {/* Color Harmony */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <h3 className="font-medium text-sm">Color Harmony</h3>
            <div className="flex gap-2">
              {outfitSlots
                .filter((s) => s.item)
                .map((slot) => (
                  <div
                    key={slot.type}
                    className="w-8 h-8 rounded-full border-2 border-background"
                    style={{ backgroundColor: slot.item?.colorHex }}
                    title={slot.item?.color}
                  />
                ))}
              {filledSlots === 0 && (
                <p className="text-xs text-muted-foreground">
                  Add items to see color harmony
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full rounded-xl justify-start">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Suggestions
            </Button>
            <Button variant="outline" className="w-full rounded-xl justify-start">
              <ChevronRight className="w-4 h-4 mr-2" />
              Browse Similar Outfits
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function OutfitSlotComponent({
  slot,
  onRemove,
  label,
  className = "",
}: {
  slot: OutfitSlot;
  onRemove: () => void;
  label: string;
  className?: string;
}) {
  return (
    <motion.div
      layout
      className={`relative overflow-hidden border-2 border-dashed border-border/50 rounded-2xl ${className} ${
        slot.item ? "border-solid border-primary/30" : ""
      }`}
    >
      <AnimatePresence mode="wait">
        {slot.item ? (
          <motion.div
            key={slot.item.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 group"
          >
            <Image
              src={slot.item.image}
              alt={slot.item.name}
              fill
              className="object-cover"
            />
            <button
              onClick={onRemove}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-xs text-muted-foreground">{label}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
