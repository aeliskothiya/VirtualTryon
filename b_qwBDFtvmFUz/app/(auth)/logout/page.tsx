"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LogoutPage() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    // Perform logout
    const timer = setTimeout(() => {
      logout();
      setIsLoggingOut(false);
      setIsLoggedOut(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [logout]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-serif text-2xl font-semibold">Wardrobe</span>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-8 space-y-6"
        >
          {isLoggingOut ? (
            <div className="py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full mx-auto mb-6"
              />
              <h2 className="font-serif text-xl font-semibold mb-2">
                Signing you out...
              </h2>
              <p className="text-muted-foreground text-sm">
                Please wait while we securely log you out.
              </p>
            </div>
          ) : isLoggedOut ? (
            <div className="py-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <LogOut className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-serif text-xl font-semibold mb-2">
                You&apos;ve been signed out
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Thank you for using Wardrobe. We hope to see you again soon!
              </p>
              <div className="space-y-3">
                <Link href="/login">
                  <Button className="w-full h-12 rounded-xl">
                    Sign In Again
                  </Button>
                </Link>
                <Link href="/home">
                  <Button variant="outline" className="w-full h-12 rounded-xl">
                    Go to Homepage
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* Security Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-muted-foreground"
        >
          For your security, please close this browser window if you&apos;re using a shared computer.
        </motion.p>
      </motion.div>
    </div>
  );
}
