# Phase 4: Advanced Animations - Integration Guide

## Overview
This guide shows how to integrate advanced animations into existing pages.

---

## 1. PAGE TRANSITION ANIMATIONS

Already implemented in `App.jsx`:
- All pages wrap with `<AnimatedPage>` component
- Smooth fade/slide transitions between routes
- Respects prefers-reduced-motion for accessibility

No action needed - this is automatic!

---

## 2. SCROLL-TRIGGERED ANIMATIONS

### Usage Example:
```jsx
import { ScrollAnimationWrapper } from '@/components/common/AnimationComponents';

// Wrap any element to trigger animation on scroll
<ScrollAnimationWrapper variant="fadeUp" threshold={0.2}>
  <div className="your-content">
    This animates when scrolled into view
  </div>
</ScrollAnimationWrapper>
```

### Apply to Pages:
1. **DashboardPage** - Animate stat cards on load
2. **WardrobeManagementPage** - Stagger wardrobe items
3. **RecommendationsPage** - Animate outfit recommendations
4. **SubscriptionPage** - Animate plan cards

### Implementation Pattern:
```jsx
// Before
<div className="grid">
  {items.map(item => <Card key={item.id} />)}
</div>

// After - Add scroll animation
<AnimatedStaggerContainer>
  {items.map(item => (
    <AnimatedStaggerItem key={item.id}>
      <Card />
    </AnimatedStaggerItem>
  ))}
</AnimatedStaggerContainer>
```

---

## 3. MICRO-INTERACTIONS

### Replace Standard Buttons:
```jsx
// Before
<button className="btn btn-primary">Click me</button>

// After - Add hover/tap animations
<AnimatedButton variant="primary" onClick={handleClick}>
  Click me
</AnimatedButton>
```

### Replace Standard Cards:
```jsx
// Before
<div className="card">Content</div>

// After - Add hover animation
<AnimatedCard variant="luxury">
  Content
</AnimatedCard>
```

### Form Elements:
```jsx
// Input with focus animation
<AnimatedInput placeholder="Enter email" />

// Checkbox with check animation
<AnimatedCheckbox 
  label="Accept terms"
  checked={checked}
  onChange={setChecked}
/>

// Toggle switch
<AnimatedToggle 
  enabled={enabled}
  onChange={setEnabled}
/>

// Progress bar
<AnimatedProgressBar progress={75} />
```

### Apply Throughout:
- Replace all `<button>` with `<AnimatedButton>`
- Replace all `.card` divs with `<AnimatedCard>`
- Replace form inputs with animated versions
- Add badges: `<AnimatedBadge>Premium</AnimatedBadge>`

---

## 4. MOBILE GESTURE SUPPORT

### Swipe Navigation:
```jsx
import { useGestureHandler } from '@/hooks/useAnimation';

function MyPage() {
  const { handleTouchStart, handleTouchEnd } = useGestureHandler(
    () => console.log('Swiped left'),
    () => console.log('Swiped right'),
    () => console.log('Swiped up'),
    () => console.log('Swiped down')
  );

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      Content
    </div>
  );
}
```

### Apply to Pages:
1. **WardrobeManagementPage** - Swipe to change view (list/grid)
2. **TryOnPage** - Swipe between try-on results
3. **RecommendationsPage** - Swipe between outfit recommendations

---

## 5. CONFETTI & CELEBRATION EFFECTS

### Success Animation:
```jsx
import { useConfettiBlast } from '@/components/common/Confetti';

function SubscriptionPage() {
  const { showConfetti, trigger } = useConfettiBlast();

  const handlePurchaseSuccess = () => {
    trigger(2000); // Show for 2 seconds
  };

  return (
    <>
      <Confetti active={showConfetti} />
      {/* Rest of component */}
    </>
  );
}
```

### Apply Confetti To:
1. **Subscription/CheckoutPage** - On successful purchase
2. **TryOnPage** - When results load
3. **WardrobeManagementPage** - On successful upload
4. **RegisterStep2Page** - On profile completion

---

## 6. SCROLL PROGRESS TRACKING

Track page scroll for progress bars or parallax effects:

```jsx
import { useScrollProgress } from '@/hooks/useAnimation';

function MyPage() {
  const scrollProgress = useScrollProgress();

  return (
    <div>
      {/* Progress bar showing scroll position */}
      <motion.div
        style={{ width: `${scrollProgress * 100}%` }}
        className="fixed top-0 h-1 bg-gold-accent"
      />
    </div>
  );
}
```

---

## 7. FLOATING & FLOATING ELEMENTS

### Floating Badge/Icon:
```jsx
import { FloatingElement } from '@/components/common/AnimationComponents';

<FloatingElement duration={3}>
  <div className="text-4xl">✨</div>
</FloatingElement>
```

### Use Cases:
- Floating action buttons
- Premium badges
- Special icons

---

## 8. LOADING SKELETONS

### Shimmer Loader:
```jsx
import { ShimmerLoader } from '@/components/common/AnimationComponents';

{isLoading ? (
  <>
    <ShimmerLoader width="100%" height="20px" className="mb-4" />
    <ShimmerLoader width="100%" height="20px" className="mb-4" />
    <ShimmerLoader width="80%" height="20px" />
  </>
) : (
  // Actual content
)}
```

---

## 9. SUCCESS/ERROR ANIMATIONS

### Success Icon:
```jsx
import { AnimatedSuccessCheckmark } from '@/components/common/MicroInteractions';

{formSubmitted && <AnimatedSuccessCheckmark size={64} />}
```

### Error Icon:
```jsx
import { AnimatedErrorIcon } from '@/components/common/MicroInteractions';

{formError && <AnimatedErrorIcon size={64} />}
```

### Loading Spinner:
```jsx
import { AnimatedLoadingSpinner } from '@/components/common/MicroInteractions';

{isLoading && <AnimatedLoadingSpinner size={32} color="#c4a962" />}
```

---

## 10. ACCESSIBILITY PREFERENCES

All animations automatically respect user's motion preferences:
```javascript
// Automatically disabled if user has prefers-reduced-motion
const prefersReducedMotion = usePrefersReducedMotion();

// All components check this and disable animations if true
```

---

## IMPLEMENTATION CHECKLIST

### High Priority (Do First):
- [ ] Verify App.jsx page transitions work
- [ ] Update 5 key pages with `<AnimatedStaggerContainer>`
- [ ] Add confetti to subscription success
- [ ] Add micro-interactions to buttons/cards

### Medium Priority (Then Do):
- [ ] Add gesture handlers to mobile-heavy pages
- [ ] Add scroll progress tracking
- [ ] Update form inputs with animated versions
- [ ] Add loading skeletons to data pages

### Low Priority (Polish):
- [ ] Add floating elements as accents
- [ ] Fine-tune animation timings
- [ ] Add custom easing functions
- [ ] Test on low-end devices for performance

---

## PERFORMANCE TIPS

1. **Use `triggerOnce={true}` for scroll animations** - Only animate once
2. **Lazy load heavy components** - Don't animate everything at once
3. **Test on mobile** - Some animations may be too heavy
4. **Monitor bundle size** - Framer Motion is ~40KB gzipped
5. **Prefers-reduced-motion** - Always respect user preferences

---

## TESTING ANIMATIONS

### Check Motion Preferences:
```bash
# In browser DevTools console:
window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

### Test on Mobile:
1. Use DevTools device emulation
2. Test on actual devices
3. Check scroll performance (60 FPS target)

---

## NEXT STEPS

1. Apply scroll animations to 5+ pages
2. Replace buttons/cards with animated versions
3. Test on mobile devices
4. Adjust animation timing if needed
5. Move to Phase 5: Testing & Deployment

---

## FILES CREATED THIS PHASE

- ✅ `src/utils/animations.js` - Animation variants library
- ✅ `src/hooks/useAnimation.js` - Animation custom hooks
- ✅ `src/components/common/AnimationComponents.jsx` - Reusable animation wrappers
- ✅ `src/components/common/AnimatedPage.jsx` - Page transition wrapper
- ✅ `src/components/common/MicroInteractions.jsx` - Button/card animations
- ✅ `src/components/common/Confetti.jsx` - Celebration effects

## IMPORTS REFERENCE

```javascript
// Animation variants
import { pageVariants, fadeVariants, staggerContainer } from '@/utils/animations';

// Custom hooks
import { useScrollAnimation, useGestureHandler, useConfetti, usePrefersReducedMotion } from '@/hooks/useAnimation';

// Reusable components
import { ScrollAnimationWrapper, AnimatedStaggerContainer, Confetti } from '@/components/common/AnimationComponents';
import { AnimatedButton, AnimatedCard, AnimatedInput } from '@/components/common/MicroInteractions';
import { useConfettiBlast } from '@/components/common/Confetti';
```

---

**Status**: Phase 4 in progress - All utilities created, ready for integration
