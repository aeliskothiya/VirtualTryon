"use client";

import { motion } from "framer-motion";
import { Sparkles, Shirt, Palette, Camera, ShoppingBag, Star, ChevronRight, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

const features = [
  {
    icon: Shirt,
    title: "Digital Wardrobe",
    description: "Organize all your clothes in a beautiful, searchable digital closet.",
  },
  {
    icon: Palette,
    title: "Outfit Builder",
    description: "Mix and match items to create perfect outfits with AI suggestions.",
  },
  {
    icon: Camera,
    title: "Virtual Try-On",
    description: "See how outfits look on you with our AI-powered visualization.",
  },
  {
    icon: ShoppingBag,
    title: "Curated Store",
    description: "Discover new pieces that complement your existing wardrobe.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Fashion Blogger",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    text: "This app has completely transformed how I plan my outfits. The AI suggestions are surprisingly accurate!",
  },
  {
    name: "Michael K.",
    role: "Business Executive",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    text: "Finally, an app that helps me look put-together without spending hours deciding what to wear.",
  },
  {
    name: "Emma L.",
    role: "Creative Director",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    text: "The virtual try-on feature is a game-changer for online shopping. Love it!",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["Up to 50 items", "Basic outfit builder", "5 saved outfits", "Community support"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    features: ["Unlimited items", "AI outfit suggestions", "Virtual try-on", "Priority support", "Style analytics"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    features: ["Everything in Pro", "Team collaboration", "Brand integration", "API access", "Dedicated support"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/home" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-semibold">LUXE</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="rounded-xl">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-xl">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative max-w-7xl mx-auto text-center"
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm">AI-Powered Fashion Assistant</span>
          </motion.div>
          
          <motion.h1 variants={item} className="font-serif text-4xl sm:text-5xl lg:text-7xl font-semibold tracking-tight leading-tight">
            Your Wardrobe,{" "}
            <span className="text-primary">Reimagined</span>
          </motion.h1>
          
          <motion.p variants={item} className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Organize your closet, create stunning outfits, and discover your unique style with the power of AI.
          </motion.p>
          
          <motion.div variants={item} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="rounded-xl h-14 px-8 text-base">
                Start For Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="rounded-xl h-14 px-8 text-base">
                Learn More
              </Button>
            </a>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            variants={item}
            className="mt-16 relative mx-auto max-w-5xl"
          >
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden glass border border-border/50">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80"
                alt="LUXE Wardrobe Dashboard"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between">
                <div className="glass rounded-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Shirt className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">48 Items</p>
                    <p className="text-xs text-muted-foreground">In your wardrobe</p>
                  </div>
                </div>
                <div className="glass rounded-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">24 Outfits</p>
                    <p className="text-xs text-muted-foreground">Created this month</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold">
              Everything You Need
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              From organizing your closet to creating perfect outfits, we have got you covered.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass rounded-2xl p-6 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold">
              Loved by Thousands
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Join the community of fashion enthusiasts who trust LUXE for their daily style.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm mb-6">{`"${testimonial.text}"`}</p>
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold">
              Simple Pricing
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Choose the plan that works best for your wardrobe needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`glass rounded-2xl p-6 relative ${
                  plan.popular ? "border-2 border-primary" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="font-serif text-4xl font-semibold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-2">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full rounded-xl"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center glass rounded-3xl p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
          <div className="relative">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">
              Ready to Transform Your Wardrobe?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of users who have already discovered their perfect style with LUXE.
            </p>
            <Link href="/register">
              <Button size="lg" className="rounded-xl h-14 px-8 text-base">
                Get Started Free
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-semibold">LUXE Wardrobe</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            2024 LUXE Wardrobe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
