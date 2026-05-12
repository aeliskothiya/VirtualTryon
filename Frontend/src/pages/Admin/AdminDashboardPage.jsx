import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin, useNotification } from '@/hooks';
import {
  BarChart3,
  Users,
  CreditCard,
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  X,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const {
    admin,
    fetchOverview,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    overview,
    plans,
    isLoading,
    adminLogout,
  } = useAdmin();
  const { showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState('overview');
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price: '',
    monthly_price: '',
    yearly_price: '',
    description: '',
    features: [],
  });
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    fetchOverview();
    fetchPlans();
  }, []);

  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        monthly_price: formData.monthly_price ? parseFloat(formData.monthly_price) : null,
        yearly_price: formData.yearly_price ? parseFloat(formData.yearly_price) : null,
      };

      if (editingPlan) {
        await updatePlan(editingPlan.id, payload);
        showSuccess('Plan updated successfully');
      } else {
        await createPlan(payload);
        showSuccess('Plan created successfully');
      }

      setFormData({ name: '', code: '', price: '', monthly_price: '', yearly_price: '', description: '', features: [] });
      setEditingPlan(null);
      setShowPlanForm(false);
      setFeatureInput('');
      await fetchPlans();
    } catch (error) {
      showError(error.message || 'Operation failed');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deletePlan(planId);
        showSuccess('Plan deleted successfully');
        await fetchPlans();
      } catch (error) {
        showError('Failed to delete plan');
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Logout from admin panel?')) {
      adminLogout();
      navigate('/admin/login');
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      code: plan.code,
      price: plan.price || '',
      monthly_price: plan.monthly_price || '',
      yearly_price: plan.yearly_price || '',
      description: plan.description || '',
      features: plan.features || [],
    });
    setShowPlanForm(true);
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput],
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const stats = [
    {
      label: 'Total Users',
      value: overview?.total_users || 0,
      icon: Users,
      color: 'text-sage',
    },
    {
      label: 'Active Subscriptions',
      value: overview?.active_subscriptions || 0,
      icon: CreditCard,
      color: 'text-powder-blue',
    },
    {
      label: 'Revenue',
      value: `₹${overview?.total_revenue || 0}`,
      icon: TrendingUp,
      color: 'text-rose-dust',
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-cream border-b border-warm-gray/20">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-sage flex items-center justify-center">
                <BarChart3 size={20} className="text-cream" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-charcoal">Admin Dashboard</h1>
                <p className="text-xs text-warm-taupe">FashionAI Administration</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-warm-gray/10 rounded-lg transition-colors"
                title="Back to frontend"
              >
                <ArrowLeft size={20} className="text-charcoal" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-rose-dust/10 rounded-lg transition-colors text-rose-dust"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
      >
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {['overview', 'plans'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-sage text-cream'
                  : 'bg-warm-gray/10 text-charcoal hover:bg-warm-gray/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Overview Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="card-luxury"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-warm-taupe text-sm font-semibold">{stat.label}</p>
                          <p className="text-3xl font-bold text-charcoal mt-2">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-lg bg-gradient-sage/10 ${stat.color}`}>
                          <Icon size={24} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="card-luxury">
                  <h3 className="text-lg font-bold text-charcoal mb-4">Platform Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-warm-taupe">Backend</span>
                      <span className="inline-block w-2 h-2 rounded-full bg-sage"></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-warm-taupe">Database</span>
                      <span className="inline-block w-2 h-2 rounded-full bg-sage"></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-warm-taupe">API</span>
                      <span className="inline-block w-2 h-2 rounded-full bg-sage"></span>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="card-luxury">
                  <h3 className="text-lg font-bold text-charcoal mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-gradient-sage text-cream rounded-lg hover:opacity-90 transition-all font-semibold text-sm">
                      View All Users
                    </button>
                    <button className="w-full px-4 py-2 bg-powder-blue text-cream rounded-lg hover:opacity-90 transition-all font-semibold text-sm">
                      View Transactions
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Add Plan Button */}
              <div className="flex justify-end">
                <motion.button
                  onClick={() => {
                    setShowPlanForm(!showPlanForm);
                    setEditingPlan(null);
                    setFormData({
                      name: '',
                      code: '',
                      price: '',
                      monthly_price: '',
                      yearly_price: '',
                      description: '',
                      features: [],
                    });
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-sage text-cream rounded-lg hover:opacity-90 transition-all font-semibold flex items-center gap-2"
                >
                  <Plus size={18} />
                  New Plan
                </motion.button>
              </div>

              {/* Plan Form */}
              <AnimatePresence>
                {showPlanForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="card-luxury"
                  >
                    <h3 className="text-lg font-bold text-charcoal mb-6">
                      {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                    </h3>

                    <form onSubmit={handleAddPlan} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-charcoal mb-2">Plan Name</label>
                          <input
                            type="text"
                            placeholder="Premium"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-charcoal mb-2">Plan Code</label>
                          <input
                            type="text"
                            placeholder="premium_monthly"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-charcoal mb-2">Price</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="input-field"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-charcoal mb-2">Monthly Price</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={formData.monthly_price}
                            onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                            className="input-field"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-charcoal mb-2">Yearly Price</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={formData.yearly_price}
                            onChange={(e) => setFormData({ ...formData, yearly_price: e.target.value })}
                            className="input-field"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">Description</label>
                        <textarea
                          placeholder="Plan description..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="textarea-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">Features</label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            placeholder="Add feature..."
                            value={featureInput}
                            onChange={(e) => setFeatureInput(e.target.value)}
                            className="input-field flex-1"
                          />
                          <button
                            type="button"
                            onClick={handleAddFeature}
                            className="px-4 py-2 bg-sage/20 text-sage rounded-lg hover:bg-sage/30 transition-all font-semibold"
                          >
                            Add
                          </button>
                        </div>

                        <div className="space-y-2">
                          {formData.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-warm-gray/10 p-3 rounded-lg">
                              <span className="text-charcoal text-sm">{feature}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(idx)}
                                className="text-rose-dust hover:text-rose-dust/80"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 btn-primary font-semibold"
                        >
                          {editingPlan ? 'Update Plan' : 'Create Plan'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPlanForm(false)}
                          className="flex-1 btn-secondary font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Plans List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans?.map((plan) => (
                  <motion.div key={plan.id} variants={itemVariants} className="card-luxury">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-charcoal">{plan.name}</h4>
                        <p className="text-xs text-warm-taupe">{plan.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="p-2 hover:bg-powder-blue/10 rounded-lg transition-colors text-powder-blue"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-2 hover:bg-rose-dust/10 rounded-lg transition-colors text-rose-dust"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <p className="text-charcoal text-sm mb-4">{plan.description}</p>

                    <div className="space-y-2 mb-4">
                      {plan.features?.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-charcoal">
                          <span className="text-sage">✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-warm-gray/20">
                      <p className="text-2xl font-bold text-charcoal">
                        ₹{plan.monthly_price || plan.price}
                      </p>
                      <p className="text-xs text-warm-taupe">per month</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
