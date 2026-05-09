"use client";

import { motion } from "framer-motion";
import { X, Heart, Trash2, Edit, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClothingItem } from "@/lib/mock-data";
import Image from "next/image";

interface ItemDetailPanelProps {
  item: ClothingItem;
  onClose: () => void;
}

export function ItemDetailPanel({ item, onClose }: ItemDetailPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      className="w-full lg:w-96 glass-strong rounded-2xl overflow-hidden flex-shrink-0"
    >
      {/* Image */}
      <div className="relative aspect-[4/5]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-4 right-4 rounded-full glass"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
        <div
          className="absolute top-4 left-4 w-6 h-6 rounded-full border-2 border-background shadow-lg"
          style={{ backgroundColor: item.colorHex }}
        />
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {item.brand}
          </p>
          <h2 className="font-serif text-2xl font-semibold mt-1">{item.name}</h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="capitalize">
            {item.category}
          </Badge>
          <Badge variant="outline">{item.color}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Season
            </p>
            <p className="text-sm font-medium mt-1 capitalize">
              {item.season.join(", ")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Worn</p>
            <p className="text-sm font-medium mt-1">{item.wearCount} times</p>
          </div>
        </div>

        {item.tags.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
              <Tag className="w-3 h-3" /> Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button variant="outline" size="icon" className="rounded-xl">
            <Heart className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button className="flex-1 rounded-xl">Add to Outfit</Button>
        </div>
      </div>
    </motion.div>
  );
}
