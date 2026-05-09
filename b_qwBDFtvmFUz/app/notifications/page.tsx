"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Sparkles, ShoppingBag, Package, Heart, Check, Trash2, Settings } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Notification {
  id: string;
  type: "style" | "order" | "wishlist" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "style",
    title: "New Style Recommendation",
    message: "Based on your recent additions, we suggest pairing your Cashmere Sweater with the Wool Trousers.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "order",
    title: "Order Shipped",
    message: "Your order #ORD-2024-001 has been shipped and will arrive in 2-3 business days.",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "wishlist",
    title: "Price Drop Alert",
    message: "The Oversized Wool Blazer you wishlisted is now 20% off!",
    time: "1 day ago",
    read: true,
  },
  {
    id: "4",
    type: "system",
    title: "Welcome to LUXE",
    message: "Thanks for joining! Start by adding items to your wardrobe.",
    time: "3 days ago",
    read: true,
  },
];

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter((n) => !n.read);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "style":
        return Sparkles;
      case "order":
        return Package;
      case "wishlist":
        return Heart;
      default:
        return Bell;
    }
  };

  const getIconColor = (type: Notification["type"]) => {
    switch (type) {
      case "style":
        return "text-primary bg-primary/10";
      case "order":
        return "text-green-500 bg-green-500/10";
      case "wishlist":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-muted-foreground bg-secondary";
    }
  };

  return (
    <AppLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight">
              Notifications
            </h1>
            <p className="text-muted-foreground text-sm">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
            </p>
          </div>
          <Link href="/settings">
            <Button variant="outline" size="icon" className="rounded-xl">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Filters & Actions */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
              className="rounded-full"
            >
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="rounded-xl">
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </motion.div>

        {/* Notifications List */}
        <motion.div variants={item} className="space-y-3">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">No notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {filter === "unread" ? "All caught up!" : "You're all caught up!"}
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`glass rounded-2xl p-4 flex gap-4 cursor-pointer group ${
                      !notification.read ? "border border-primary/20" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.time}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-secondary rounded-xl"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
