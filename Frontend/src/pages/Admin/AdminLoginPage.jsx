import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdmin, useNotification } from '@/hooks';
import { isValidEmail } from '@/utils/validators';
import { Lock, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin, isLoading } = useAdmin();
  const { showError, showSuccess } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      setFormError('Invalid email address');
      return;
    }

    try {
      await adminLogin(email, password);
      showSuccess('Admin login successful');
      navigate('/admin/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Admin login failed';
      setFormError(errorMsg);
      showError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative backgrounds - sage for admin theme */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-sage opacity-5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-powder opacity-5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="card-luxury">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-sage text-cream mb-4">
              <Shield size={24} />
            </div>
            <h1 className="text-3xl font-bold text-charcoal mb-1">Admin Panel</h1>
            <p className="text-warm-taupe text-sm">FashionAI Administration</p>
          </motion.div>

          {/* Error Message */}
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-dust/10 border border-rose-dust/30 rounded-lg text-rose-dust text-sm"
            >
              {formError}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Admin Email</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-warm-gray" size={18} />
                <input
                  type="email"
                  placeholder="admin@fashionai.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-warm-gray" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-warm-gray hover:text-charcoal transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Admin Warning */}
            <div className="bg-sage/10 border border-sage/30 rounded-lg p-3 flex gap-2">
              <Shield size={16} className="text-sage flex-shrink-0 mt-0.5" />
              <p className="text-xs text-charcoal">
                <strong>Admin Access:</strong> This login is for administrators only
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full font-semibold flex items-center justify-center gap-2 rounded-lg px-4 py-3 bg-gradient-sage text-cream hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Admin Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-warm-taupe text-xs mt-6"
        >
          <a href="/" className="text-sage hover:underline">
            Back to FashionAI
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
