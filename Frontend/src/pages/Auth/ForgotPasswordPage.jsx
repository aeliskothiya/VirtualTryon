import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, useNotification } from '@/hooks';
import { isValidEmail } from '@/utils/validators';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { sendPasswordResetEmail, isLoading } = useAuth();
  const { showError, showSuccess } = useNotification();

  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email) {
      setFormError('Email is required');
      return;
    }

    if (!isValidEmail(email)) {
      setFormError('Invalid email address');
      return;
    }

    try {
      await sendPasswordResetEmail(email);
      setIsSubmitted(true);
      showSuccess('Password reset link sent to your email');

      // Redirect after 5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to send reset email';
      setFormError(errorMsg);
      showError(errorMsg);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-powder opacity-5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-sage opacity-5 rounded-full blur-3xl" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="card-luxury">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl font-bold text-charcoal mb-2">Reset Password</h1>
                <p className="text-warm-taupe text-sm">
                  Enter your email to receive password reset instructions
                </p>
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
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-warm-gray" size={18} />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-12"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary font-semibold flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <Mail size={18} />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-warm-taupe hover:text-gold-accent transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-sage/20 mb-6"
                >
                  <CheckCircle size={32} className="text-sage" />
                </motion.div>

                <h2 className="text-2xl font-bold text-charcoal mb-2">Check Your Email</h2>
                <p className="text-warm-taupe text-sm mb-6">
                  We've sent password reset instructions to <span className="font-semibold">{email}</span>
                </p>

                <div className="bg-powder-blue/10 border border-powder-blue/30 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-charcoal">
                    <strong>💡 Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
                  </p>
                </div>

                <p className="text-warm-taupe text-xs">
                  Redirecting to login in <span className="font-semibold">5 seconds</span>...
                </p>

                <motion.button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full btn-primary font-semibold mt-6 flex items-center justify-center gap-2"
                >
                  Go to Login
                  <ArrowLeft size={18} />
                </motion.button>
              </motion.div>
            </>
          )}
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-warm-taupe text-xs mt-6"
        >
          Don't have an account?{' '}
          <Link to="/register/step-1" className="text-gold-accent hover:underline font-semibold">
            Sign up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
