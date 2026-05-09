"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { outfits } from "@/lib/mock-data";
import Image from "next/image";

type TryOnState = "upload" | "selecting" | "processing" | "result";

export default function TryOnPage() {
  const [state, setState] = useState<TryOnState>("upload");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setState("selecting");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = () => {
    setState("processing");
    // Simulate AI processing
    setTimeout(() => {
      setState("result");
    }, 3000);
  };

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const resetTryOn = () => {
    setState("upload");
    setUploadedImage(null);
    setSelectedOutfit(null);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">
            Virtual Try-On
          </h1>
          <p className="text-muted-foreground mt-2">
            See how outfits look on you with AI-powered visualization
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4">
          {["Upload Photo", "Select Outfit", "Try On"].map((step, index) => {
            const stepStates: TryOnState[] = ["upload", "selecting", "result"];
            const isActive =
              stepStates.indexOf(state) >= index ||
              (state === "processing" && index <= 2);
            return (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-sm hidden sm:block ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
                {index < 2 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Upload State */}
          {state === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <label className="w-full max-w-md aspect-[3/4] rounded-3xl glass border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Upload your photo</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    For best results, use a full-body photo
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </motion.div>
          )}

          {/* Selecting Outfit State */}
          {state === "selecting" && (
            <motion.div
              key="selecting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Uploaded Photo Preview */}
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Your Photo
                  </h3>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden glass relative">
                    {uploadedImage && (
                      <Image
                        src={uploadedImage}
                        alt="Uploaded photo"
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setState("upload")}
                    className="w-full rounded-xl"
                  >
                    Change Photo
                  </Button>
                </div>

                {/* Outfit Selection */}
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Select an Outfit
                  </h3>
                  <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                    {outfits.map((outfit) => (
                      <motion.div
                        key={outfit.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedOutfit(outfit.id)}
                        className={`aspect-[3/4] rounded-xl overflow-hidden cursor-pointer relative glass ${
                          selectedOutfit === outfit.id
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : ""
                        }`}
                      >
                        <Image
                          src={outfit.image}
                          alt={outfit.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-xs font-medium truncate">
                            {outfit.name}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleTryOn}
                disabled={!selectedOutfit}
                className="w-full rounded-xl py-6 text-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Try On Outfit
              </Button>
            </motion.div>
          )}

          {/* Processing State */}
          {state === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <h3 className="font-serif text-xl font-semibold mt-6">
                Creating Your Look
              </h3>
              <p className="text-muted-foreground text-sm mt-2">
                Our AI is generating your virtual try-on...
              </p>
            </motion.div>
          )}

          {/* Result State */}
          {state === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Before/After Slider */}
              <div
                className="relative aspect-[3/4] max-w-md mx-auto rounded-3xl overflow-hidden glass cursor-ew-resize"
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onMouseMove={handleSliderMove}
              >
                {/* Before Image */}
                <div className="absolute inset-0">
                  {uploadedImage && (
                    <Image
                      src={uploadedImage}
                      alt="Before"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                {/* After Image (clipped) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <Image
                    src={outfits.find((o) => o.id === selectedOutfit)?.image || ""}
                    alt="After"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Slider Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-primary"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4 text-primary-foreground" />
                    <ChevronRight className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-background/80 text-xs font-medium">
                  Before
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/80 text-xs font-medium">
                  After
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={resetTryOn} className="rounded-xl">
                  Try Another
                </Button>
                <Button className="rounded-xl">
                  Save to Wardrobe
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
