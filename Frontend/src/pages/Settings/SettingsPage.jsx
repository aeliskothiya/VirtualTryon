import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Shield, ArrowLeft, Eye, EyeOff, Upload, LogOut } from 'lucide-react';
import { useUser, useAuth, useNotification } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { validateImageFile } from '@/utils/validators';
import { normalizeImageUrl } from '@/utils/imageLoader';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { profile, updateProfile, uploadProfilePhoto, changePassword, isLoading, fetchProfile } = useUser();
  const { logout } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({ name: '', email: '', gender_preference: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  // Fetch profile on component mount
  useEffect(() => {
    console.log('[SettingsPage] Component mounted, fetching profile...');
    if (fetchProfile) {
      fetchProfile().catch(err => {
        console.error('[SettingsPage] Failed to fetch profile:', err);
        showError('Failed to load profile data');
      });
    }
  }, []);

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      console.log('[SettingsPage] Profile loaded, updating form:', profile);
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        gender_preference: profile.gender_preference || '',
      });
    }
  }, [profile]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        showError(validation.error);
        return;
      }

      setPhotoPreview(URL.createObjectURL(file));
      setUploading(true);
      await uploadProfilePhoto(file);
      showSuccess('Photo updated!');
      setPhotoPreview(null);
    } catch (error) {
      showError(error.message || 'Photo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        showError('Name is required');
        return;
      }

      console.log('[SettingsPage] Updating profile with data:', formData);
      await updateProfile(formData);
      console.log('[SettingsPage] Profile update successful');
      showSuccess('Profile updated!');
    } catch (error) {
      console.error('[SettingsPage] Profile update error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Update failed';
      showError(errorMsg);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      showSuccess('Password changed!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showError(error.message || 'Password change failed');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      showSuccess('Logged out');
      navigate('/login');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-cream/80 backdrop-blur-md border-b border-warm-gray/30 px-4 sm:px-8 py-6"
      >
        <div className="container-luxury flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-ivory rounded-lg transition-colors"
          >
            <ArrowLeft size={22} className="text-charcoal" />
          </motion.button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal">Settings</h1>
            <p className="text-warm-taupe text-sm">Manage your account & preferences</p>
          </div>
        </div>
      </motion.header>

      <div className="container-luxury section-padding">
        {/* ERROR STATE */}
        {!isLoading && !profile && (
          <div className="bg-rose-dust/10 border border-rose-dust rounded-lg p-6 text-center">
            <p className="text-rose-dust font-medium mb-4">Failed to load your profile</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchProfile?.()}
              className="btn-primary btn-sm"
            >
              Retry
            </motion.button>
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading && !profile && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-gold-accent border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-warm-taupe">Loading your profile...</p>
            </div>
          </div>
        )}

        {/* CONTENT */}
        {profile && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* SIDEBAR TABS */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1"
          >
            <nav className="space-y-2 sticky top-24">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-sage text-cream shadow-luxury'
                        : 'text-charcoal hover:bg-ivory'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </motion.button>
                );
              })}
            </nav>
          </motion.div>

          {/* CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="md:col-span-3"
          >
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* PHOTO SECTION */}
                <section className="card-luxury">
                  <h3 className="text-lg font-bold text-charcoal mb-6">Profile Photo</h3>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gold-accent bg-ivory flex items-center justify-center">
                        {(photoPreview || (profile?.profile_photo_url && !photoError)) ? (
                          <motion.img
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            src={photoPreview || normalizeImageUrl(profile?.profile_photo_url)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onLoad={() => {
                              console.log('[SettingsPage] Photo loaded successfully');
                              setPhotoError(false);
                            }}
                            onError={(e) => {
                              console.error('[SettingsPage] Photo failed to load:', e);
                              setPhotoError(true);
                            }}
                          />
                        ) : null}
                        {!photoPreview && (!profile?.profile_photo_url || photoError) && (
                          <User size={40} className="text-warm-gray" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center gap-4">
                      <div>
                        <p className="font-medium text-charcoal mb-1">Update Profile Photo</p>
                        <p className="text-sm text-warm-taupe">JPG or PNG, max 5MB</p>
                      </div>
                      <label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          disabled={uploading}
                          className="hidden"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          as="span"
                          className="btn-secondary btn-sm inline-flex items-center gap-2"
                        >
                          <Upload size={16} />
                          {uploading ? 'Uploading...' : 'Choose Photo'}
                        </motion.button>
                      </label>
                    </div>
                  </div>
                </section>

                {/* PROFILE INFO SECTION */}
                <section className="card-luxury space-y-6">
                  <h3 className="text-lg font-bold text-charcoal">Personal Information</h3>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="input-field opacity-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-warm-taupe mt-1">Cannot be changed</p>
                  </div>



                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Gender</label>
                    <select
                      value={formData.gender_preference}
                      onChange={(e) => setFormData({ ...formData, gender_preference: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  <motion.button
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                    className="btn-primary w-full sm:w-auto"
                  >
                    Save Changes
                  </motion.button>
                </section>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                {/* PASSWORD CHANGE */}
                <section className="card-luxury space-y-6">
                  <h3 className="text-lg font-bold text-charcoal">Change Password</h3>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="input-field pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-taupe hover:text-charcoal"
                      >
                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="input-field pr-10"
                        placeholder="Minimum 8 characters"
                      />
                      <button
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-taupe hover:text-charcoal"
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="input-field pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-taupe hover:text-charcoal"
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    onClick={handlePasswordChange}
                    className="btn-primary w-full sm:w-auto"
                  >
                    Update Password
                  </motion.button>
                </section>

                {/* LOGOUT */}
                <section className="card-luxury">
                  <h3 className="text-lg font-bold text-charcoal mb-4">Sign Out</h3>
                  <p className="text-warm-taupe text-sm mb-6">Log out from all your devices</p>
                  <motion.button
                    onClick={handleLogout}
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </motion.button>
                </section>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <section className="card-luxury space-y-6">
                <h3 className="text-lg font-bold text-charcoal mb-6">Notification Preferences</h3>

                {[
                  { label: 'Try-On Results', desc: 'When your try-on is ready' },
                  { label: 'New Recommendations', desc: 'When new styles match your taste' },
                  { label: 'Plan Reminders', desc: 'Subscription and quota updates' },
                  { label: 'Tips & Features', desc: 'Latest platform tips' },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-warm-gray/50 last:border-0">
                    <div>
                      <p className="font-medium text-charcoal">{notif.label}</p>
                      <p className="text-sm text-warm-taupe">{notif.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 accent-gold-accent cursor-pointer"
                    />
                  </div>
                ))}
              </section>
            )}
          </motion.div>
        </div>
        )}
      </div>
    </div>
  );
}
