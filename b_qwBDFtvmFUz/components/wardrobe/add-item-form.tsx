"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const categories = [
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "shoes", label: "Shoes" },
  { value: "accessories", label: "Accessories" },
  { value: "outerwear", label: "Outerwear" },
];

const seasons = ["Spring", "Summer", "Fall", "Winter"];
const colors = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "White", hex: "#ffffff" },
  { name: "Cream", hex: "#F5F5DC" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Gray", hex: "#808080" },
  { name: "Brown", hex: "#8B4513" },
];

interface AddItemFormProps {
  onClose: () => void;
}

export function AddItemForm({ onClose }: AddItemFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSeason = (season: string) => {
    setSelectedSeasons((prev) =>
      prev.includes(season)
        ? prev.filter((s) => s !== season)
        : [...prev, season]
    );
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 py-6"
    >
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Image</Label>
        <div
          className={`relative aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-dashed border-border transition-colors ${
            imagePreview ? "border-transparent" : "hover:border-primary/50"
          }`}
        >
          {imagePreview ? (
            <>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 rounded-full"
                onClick={() => setImagePreview(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Click to upload
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g., Cashmere Sweater"
          className="rounded-xl"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Color */}
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              type="button"
              className="w-8 h-8 rounded-full border-2 border-transparent hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Season */}
      <div className="space-y-2">
        <Label>Season</Label>
        <div className="flex flex-wrap gap-2">
          {seasons.map((season) => (
            <Button
              key={season}
              type="button"
              variant={selectedSeasons.includes(season) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSeason(season)}
              className="rounded-full"
            >
              {season}
            </Button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <Label htmlFor="brand">Brand</Label>
        <Input
          id="brand"
          placeholder="e.g., Loro Piana"
          className="rounded-xl"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            className="rounded-xl"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" onClick={addTag} variant="outline" className="rounded-xl">
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeTag(tag)}
              >
                {tag} <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
          Cancel
        </Button>
        <Button onClick={onClose} className="flex-1 rounded-xl">
          Add to Wardrobe
        </Button>
      </div>
    </motion.div>
  );
}
