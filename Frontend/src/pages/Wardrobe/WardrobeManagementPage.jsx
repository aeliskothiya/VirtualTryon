import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  Trash2,
  MoreHorizontal,
  ArrowLeft,
  LayoutGrid,
  List,
  Sparkles,
  ImageOff,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useWardrobe, useNotification } from '@/hooks';
import { useUser } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { validateImageFile } from '@/utils/validators';
import {
  normalizeImageUrl,
  onImageLoad,
  onImageError,
  getFallbackImage,
} from '@/utils/imageLoader';
import { AnimatedButton } from '@/components/common/MicroInteractions';
import { AnimatedStaggerContainer, AnimatedStaggerItem } from '@/components/common/AnimationComponents';

export default function WardrobeManagementPage() {
  const navigate = useNavigate();
  const { items, fetchItems, uploadItem, deleteItem, updateItemStatus, syncEmbeddings, isLoading } = useWardrobe();
  const { profile } = useUser();
  const { showSuccess, showError } = useNotification();

  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [previewFiles, setPreviewFiles] = useState([]);
  const [uploadType, setUploadType] = useState('top');
  const [viewMode, setViewMode] = useState('grid');
  const [imageLoadState, setImageLoadState] = useState({}); // Track image loading state

  const activeItemCount = items.filter((item) => item.active_status === 'active').length;
  const wardrobeLimit = profile?.wardrobe_limit;
  const canUploadMore =
    typeof wardrobeLimit !== 'number' || activeItemCount < wardrobeLimit;

  useEffect(() => {
    fetchItems(true); // Fetch all items including inactive ones
  }, []);

  const filteredItems = activeFilter === 'all' 
    ? items 
    : items.filter(item => item.type === activeFilter);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) await processFiles(files);
  };

  const processFiles = async (files) => {
    try {
      const validFiles = [];
      for (const file of files) {
        const validation = validateImageFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          showError(`${file.name}: ${validation.error}`);
        }
      }
      if (validFiles.length > 0) {
        setPreviewFiles(validFiles);
      }
    } catch (error) {
      showError('File validation failed');
    }
  };

  const handleUpload = async () => {
    if (previewFiles.length === 0) {
      showError('Please select at least one file');
      return;
    }

    if (!canUploadMore) {
      showError('Wardrobe limit reached. Upgrade your plan to add more items.');
      return;
    }

    setUploading(true);
    try {
      let successCount = 0;
      let failureCount = 0;

      for (const file of previewFiles) {
        try {
          await uploadItem(uploadType, file);
          successCount++;
        } catch (error) {
          failureCount++;
          console.error(`Failed to upload ${file.name}:`, error);
        }
      }

      if (successCount > 0) {
        const typeLabel = uploadType === 'one-piece' ? 'One-Piece' : uploadType.charAt(0).toUpperCase() + uploadType.slice(1);
        showSuccess(`${successCount} ${typeLabel}${successCount > 1 ? 's' : ''} uploaded successfully!`);
      }
      if (failureCount > 0) {
        showError(`${failureCount} file(s) failed to upload`);
      }

      setPreviewFiles([]);
      await fetchItems(true);
    } catch (error) {
      showError(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Remove this item from your wardrobe?')) {
      try {
        await deleteItem(itemId);
        showSuccess('Item removed');
        await fetchItems(true);
      } catch (error) {
        showError(error.message || 'Delete failed');
      }
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.active_status === 'active' ? 'inactive' : 'active';
    try {
      await updateItemStatus(item.id, nextStatus);
      showSuccess(`Item ${nextStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (error) {
      showError(error.message || 'Status update failed');
    }
  };

  const handleImageLoad = (itemId, imageUrl) => {
    onImageLoad(imageUrl);
    setImageLoadState((prev) => ({
      ...prev,
      [itemId]: 'loaded',
    }));
  };

  const handleImageError = (itemId, imageUrl) => {
    onImageError(imageUrl);
    setImageLoadState((prev) => ({
      ...prev,
      [itemId]: 'error',
    }));
  };

  const getImageUrl = (item) => {
    // Normalize the URL to handle relative paths
    const url = normalizeImageUrl(item.image_url);
    return url || getFallbackImage('wardrobe');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { y: -8, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-cream/80 backdrop-blur-md border-b border-warm-gray/30 px-4 sm:px-8 py-6"
      >
        <div className="container-luxury flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-ivory rounded-lg transition-colors"
            >
              <ArrowLeft size={22} className="text-charcoal" />
            </motion.button>
            <div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl sm:text-4xl font-bold text-charcoal"
              >
                Digital Wardrobe
              </motion.h1>
              <p className="text-warm-taupe text-sm sm:text-base">
                {items.length} items curated just for you
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="p-3 bg-ivory rounded-lg"
          >
            <Sparkles size={24} className="text-gold-accent" />
          </motion.div>
        </div>
      </motion.header>

      <div className="container-luxury section-padding">
        {/* UPLOAD SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* UPLOAD CARD */}
            <motion.div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              animate={dragActive ? { scale: 1.02 } : { scale: 1 }}
              className={`lg:col-span-2 relative rounded-2xl border-2 border-dashed p-12 sm:p-16 transition-all cursor-pointer ${
                dragActive
                  ? 'border-gold-accent bg-gold-accent/5'
                  : 'border-warm-gray/50 bg-ivory hover:border-gold-accent hover:bg-gold-accent/2'
              }`}
            >
              {previewFiles.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {previewFiles.map((file, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-lg overflow-hidden border border-warm-gray shadow-luxury"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPreviewFiles(previewFiles.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 bg-rose-dust text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
                          title="Remove file"
                        >
                          <X size={14} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-charcoal">
                      {previewFiles.length} file{previewFiles.length > 1 ? 's' : ''} selected
                    </p>
                    <p className="text-xs text-warm-taupe">
                      Total: {(previewFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-4 justify-center pt-4 flex-wrap">
                    <AnimatedButton 
                      variant="secondary"
                      onClick={() => setPreviewFiles([])}
                      disabled={uploading}
                    >
                      Clear All
                    </AnimatedButton>
                    <AnimatedButton 
                      variant="primary"
                      onClick={handleUpload}
                      disabled={uploading || !canUploadMore}
                    >
                      {uploading ? `Uploading (${previewFiles.length})...` : canUploadMore ? `Upload ${previewFiles.length}` : 'Wardrobe Full'}
                    </AnimatedButton>
                  </div>
                </motion.div>
              ) : (
                <label className="cursor-pointer block">
                  <div className="flex flex-col items-center justify-center py-8">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="mb-6"
                    >
                      <Upload size={56} className="text-gold-accent" />
                    </motion.div>
                    <h3 className="text-2xl font-semibold text-charcoal mb-2 text-center">
                      Add to your collection
                    </h3>
                    <p className="text-warm-taupe text-center mb-6 max-w-sm">
                      Drag your fashion pieces here or click to browse your files (multiple selection supported)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) processFiles(Array.from(e.target.files));
                      }}
                      className="hidden"
                    />
                    <div className="text-xs text-warm-taupe">
                      JPG, PNG • Up to 10MB
                    </div>
                  </div>
                </label>
              )}
            </motion.div>

            {/* TYPE SELECTION */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-4">
                  Item Category
                </label>
                <motion.select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 px-6 rounded-xl font-semibold border-2 border-warm-gray bg-ivory text-charcoal transition-all appearance-none cursor-pointer hover:border-gold-accent focus:outline-none focus:border-gold-accent focus:ring-2 focus:ring-gold-accent/20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000000' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="top">👔 Tops</option>
                  <option value="bottom">👖 Bottoms</option>
                  <option value="one-piece">👗 One-Pieces</option>
                </motion.select>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={syncEmbeddings}
                className="w-full btn-ghost py-3 flex items-center justify-center gap-2 group font-medium"
              >
                <Sparkles size={18} className="group-hover:rotate-180 transition-transform" />
                Sync AI Embeddings
              </motion.button>
            </motion.div>
          </div>
        </motion.section>

        {/* FILTER & VIEW CONTROLS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12 pb-8 border-b border-warm-gray/50"
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { value: 'all', label: 'All Items' },
              { value: 'top', label: 'Tops' },
              { value: 'bottom', label: 'Bottoms' },
              { value: 'one-piece', label: 'One-Pieces' },
            ].map((f) => (
              <AnimatedButton
                key={f.value}
                variant={activeFilter === f.value ? 'primary' : 'secondary'}
                onClick={() => setActiveFilter(f.value)}
                className="whitespace-nowrap"
              >
                {f.label}
              </AnimatedButton>
            ))}
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-gold-accent text-cream'
                  : 'bg-ivory text-charcoal hover:bg-beige'
              }`}
              title="Grid view"
            >
              <LayoutGrid size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-gold-accent text-cream'
                  : 'bg-ivory text-charcoal hover:bg-beige'
              }`}
              title="List view"
            >
              <List size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* ITEMS DISPLAY */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}`}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton h-80 rounded-xl" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ivory mb-6">
                <ImageOff size={40} className="text-warm-taupe" />
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-2">
                Your wardrobe is empty
              </h3>
              <p className="text-warm-taupe max-w-sm mx-auto">
                Start your fashion journey by uploading your first item
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
                : 'space-y-4'
              }
            >
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  whileHover="hover"
                  className="group"
                >
                  <div className={`card-hover relative overflow-hidden transition-all ${
                    item.active_status === 'inactive' ? 'opacity-70 grayscale-[0.3]' : ''
                  } ${
                    viewMode === 'list' ? 'flex gap-4 items-center' : 'space-y-4'
                  }`}>
                    {/* STATUS BADGE */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                        item.active_status === 'active' 
                          ? 'bg-sage text-white' 
                          : 'bg-warm-taupe text-white'
                      }`}>
                        {item.active_status}
                      </span>
                    </div>
                    {/* IMAGE */}
                    <div className={`relative ${viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'aspect-square'} overflow-hidden rounded-lg bg-beige`}>
                      {imageLoadState[item.id] !== 'error' ? (
                        <>
                          {/* Loading Skeleton */}
                          {imageLoadState[item.id] !== 'loaded' && (
                            <motion.div
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="absolute inset-0 bg-warm-gray/20"
                            />
                          )}
                          {/* Image */}
                          <motion.img
                            whileHover={{ scale: 1.1 }}
                            src={getImageUrl(item)}
                            alt={item.type}
                            className="w-full h-full object-cover"
                            onLoad={(e) => handleImageLoad(item.id, item.image_url)}
                            onError={(e) => handleImageError(item.id, item.image_url)}
                          />
                        </>
                      ) : (
                        /* Fallback when image fails to load */
                        <div className="w-full h-full flex flex-col items-center justify-center bg-beige">
                          <ImageOff size={32} className="text-warm-gray mb-2" />
                          <p className="text-xs text-warm-taupe text-center px-2">
                            Image unavailable
                          </p>
                        </div>
                      )}
                    </div>

                    {/* INFO */}
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <div className="flex items-start justify-between mb-2">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-sage/10 text-sage">
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </span>
                        <div className="flex gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggleStatus(item)}
                            className={`p-2 rounded-lg transition-colors ${
                              item.active_status === 'active' 
                                ? 'hover:bg-warm-taupe/10 text-warm-taupe' 
                                : 'hover:bg-sage/10 text-sage'
                            }`}
                            title={item.active_status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {item.active_status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
                          </motion.button>
                          <motion.button
                            whileHover={{ rotate: 90 }}
                            onClick={() => handleDelete(item.id)}
                            className="p-2 hover:bg-rose-dust/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} className="text-rose-dust" />
                          </motion.button>
                        </div>
                      </div>

                      {/* EMBEDDING STATUS */}
                      <div className="mt-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${item.embedding_done ? 'bg-sage' : 'bg-gold-accent animate-pulse'}`} />
                          <span className={`text-[10px] font-medium ${item.embedding_done ? 'text-sage' : 'text-gold-accent'}`}>
                            {item.embedding_done ? 'AI Ready' : 'AI Processing'}
                          </span>
                        </div>
                        {!item.embedding_done && item.embedding_error && (
                          <p className="text-[9px] text-rose-dust mt-1 leading-tight">
                            {item.embedding_error.slice(0, 50)}...
                          </p>
                        )}
                      </div>
                      {viewMode === 'list' && (
                        <p className="text-sm text-warm-taupe">
                          Added {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
