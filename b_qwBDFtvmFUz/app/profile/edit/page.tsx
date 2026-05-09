"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Save, X } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { userProfile } from "@/lib/mock-data";
import Link from "next/link";
import { useRouter } from "next/navigation";

const styleOptions = ["Minimalist", "Classic", "Bohemian", "Streetwear", "Preppy", "Romantic", "Edgy"];
const colorOptions = ["Black", "White", "Navy", "Cream", "Camel", "Grey", "Brown", "Burgundy"];

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

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [bio, setBio] = useState("Fashion enthusiast with a love for minimalist luxury style.");
  const [styleProfile, setStyleProfile] = useState(userProfile.styleProfile);
  const [favoriteColors, setFavoriteColors] = useState<string[]>(userProfile.favoriteColors);

  const toggleColor = (color: string) => {
    setFavoriteColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    router.push("/profile");
  };

  return (
    <AppLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={item} className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight">
              Edit Profile
            </h1>
            <p className="text-muted-foreground text-sm">
              Update your personal information
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <motion.div variants={item} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-background">
                  <AvatarImage src={userProfile.avatar} alt={name} />
                  <AvatarFallback className="text-2xl">
                    {name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
              <div className="space-y-2">
                <Button type="button" variant="outline" size="sm" className="rounded-xl">
                  Upload New Photo
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Basic Info */}
          <motion.div variants={item} className="glass rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>
          </motion.div>

          {/* Style Preferences */}
          <motion.div variants={item} className="glass rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold">Style Preferences</h3>
            
            <div className="space-y-2">
              <Label>Style Profile</Label>
              <Select value={styleProfile} onValueChange={setStyleProfile}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Favorite Colors</Label>
              <p className="text-xs text-muted-foreground">
                Select colors that represent your style
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {colorOptions.map((color) => (
                  <Badge
                    key={color}
                    variant={favoriteColors.includes(color) ? "default" : "outline"}
                    className="cursor-pointer rounded-full px-3 py-1"
                    onClick={() => toggleColor(color)}
                  >
                    {favoriteColors.includes(color) && (
                      <X className="w-3 h-3 mr-1" />
                    )}
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={item} className="flex gap-3">
            <Link href="/profile" className="flex-1">
              <Button type="button" variant="outline" className="w-full rounded-xl h-12">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 rounded-xl h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </AppLayout>
  );
}
