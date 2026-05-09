"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate sending reset email
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md space-y-8"
      >
        {/* Logo */}
        <motion.div variants={item} className="flex items-center gap-3 justify-center">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-serif text-2xl font-semibold">Wardrobe</span>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={item}
          className="glass rounded-3xl p-8 space-y-6"
        >
          {!isSubmitted ? (
            <>
              {/* Back Link */}
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>

              {/* Header */}
              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  Forgot your password?
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  No worries! Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 rounded-xl bg-secondary/50 border-border/50"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </>
          ) : (
            // Success State
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">
                Check your email
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                We&apos;ve sent a password reset link to{" "}
                <span className="text-foreground font-medium">{email}</span>
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl"
                  onClick={() => setIsSubmitted(false)}
                >
                  Resend Email
                </Button>
                <Link href="/login">
                  <Button className="w-full h-12 rounded-xl">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Help Link */}
        <motion.p variants={item} className="text-center text-sm text-muted-foreground">
          Need help?{" "}
          <Link
            href="/support"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Contact Support
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
