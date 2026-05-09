"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CreditCard, 
  HelpCircle,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Lock,
  Eye,
  Trash2
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { userProfile } from "@/lib/mock-data";

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

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [styleAlerts, setStyleAlerts] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("en");

  return (
    <AppLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={item}>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="glass border-0 p-1 rounded-xl w-full grid grid-cols-4">
            <TabsTrigger value="account" className="rounded-lg">Account</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg">Notifications</TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-lg">Appearance</TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-lg">Privacy</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account">
            <motion.div variants={item} className="space-y-6">
              {/* Profile Section */}
              <div className="glass rounded-2xl p-6 space-y-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Profile Information
                </h3>
                
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={userProfile.avatar} />
                    <AvatarFallback>AC</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      defaultValue={userProfile.name}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={userProfile.email}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <Button className="rounded-xl">Save Changes</Button>
              </div>

              {/* Password Section */}
              <div className="glass rounded-2xl p-6 space-y-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Change Password
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="rounded-xl">Update Password</Button>
              </div>

              {/* Billing Section */}
              <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Subscription & Billing
                </h3>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                  <div>
                    <p className="font-medium">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">$9.99/month</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    Manage
                  </Button>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div variants={item} className="space-y-6">
              <div className="glass rounded-2xl p-6 space-y-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notification Preferences
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive updates via email
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications on your device
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Palette className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Style Alerts</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified about new style trends
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={styleAlerts}
                      onCheckedChange={setStyleAlerts}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Weekly Digest</p>
                        <p className="text-sm text-muted-foreground">
                          Weekly summary of your wardrobe activity
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={weeklyDigest}
                      onCheckedChange={setWeeklyDigest}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <motion.div variants={item} className="space-y-6">
              <div className="glass rounded-2xl p-6 space-y-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Theme
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "system", label: "System", icon: Smartphone },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                        theme === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 hover:bg-secondary"
                      }`}
                    >
                      <option.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-6 space-y-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Language & Region
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                        <SelectItem value="jpy">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <motion.div variants={item} className="space-y-6">
              <div className="glass rounded-2xl p-6 space-y-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Privacy Settings
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible to other users
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Share Outfit Data</p>
                      <p className="text-sm text-muted-foreground">
                        Help improve AI recommendations
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Enable
                    </Button>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  Data & Storage
                </h3>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                  <div>
                    <p className="font-medium">Download Your Data</p>
                    <p className="text-sm text-muted-foreground">
                      Get a copy of all your wardrobe data
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    Download
                  </Button>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 space-y-4 border border-destructive/20">
                <h3 className="font-semibold flex items-center gap-2 text-destructive">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" className="rounded-xl">
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AppLayout>
  );
}
