import React, { useState, useMemo } from 'react';
import { Star, Check, LogIn, Trash2, MessageSquare, UserCheck } from 'lucide-react';
import { Product } from '../data/products';

export interface ProductReviewRecord {
  id: string;
  productId: string;
  userId: string;
  authorName: string;
  authorLocation?: string;
  variantLabel?: string;
  rating: number;
  comment: string;
  timestamp: string;
  createdAt: number;
}

interface CustomerReviewsIslandProps {
  product: Product;
  reviews: ProductReviewRecord[];
  currentUser: {
    uid: string;
    name: string;
    emailOrPhone: string;
    isFirebaseAuthenticated: boolean;
  } | null;
  isSigningIn: boolean;
  onGoogleSignIn: () => Promise<void>;
  onQuickMemberSignIn: (name: string, contact: string) => void;
  onSubmitReview: (payload: {
    productId: string;
    rating: number;
    comment: string;
    variantLabel: string;
    authorLocation: string;
  }) => Promise<void>;
  onDeleteReview?: (review: ProductReviewRecord) => Promise<void>;
  compact?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  5: '5.0 · Exceptional Writing Instrument',
  4: '4.0 · Smooth & Reliable Performer',
  3: '3.0 · Good Everyday Value',
  2: '2.0 · Below Expectations',
  1: '1.0 · Needs Improvement',
};

export function StarRatingDisplay({
  rating,
  size = 'sm',
}: {
  rating: number;
  size?: 'xs' | 'sm' | 'md';
}) {
  const rounded = Math.round(rating);
  const iconClass =
    size === 'xs'
      ? 'w-3 h-3'
      : size === 'sm'
      ? 'w-3.5 h-3.5'
      : 'w-4 h-4';

  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${iconClass} ${
            star <= rounded
              ? 'fill-brand text-brand'
              : 'fill-transparent text-faint'
          }`}
        />
      ))}
    </div>
  );
}

export function CustomerReviewsIsland({
  product,
  reviews,
  currentUser,
  isSigningIn,
  onGoogleSignIn,
  onQuickMemberSignIn,
  onSubmitReview,
  onDeleteReview,
  compact = false,
}: CustomerReviewsIslandProps) {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [selectedVariantLabel, setSelectedVariantLabel] = useState<string>(
    product.variants[0]?.label.split(' · ')[0] || product.name
  );
  const [authorLocation, setAuthorLocation] = useState<string>('Nairobi, Kenya');
  const [commentText, setCommentText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inline quick login fields if logged out
  const [quickName, setQuickName] = useState('');
  const [quickContact, setQuickContact] = useState('');

  const productReviews = useMemo(
    () =>
      reviews
        .filter((r) => r.productId === product.id)
        .sort((a, b) => b.createdAt - a.createdAt),
    [reviews, product.id]
  );

  const averageRating = useMemo(() => {
    if (productReviews.length === 0) return 5.0;
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / productReviews.length;
  }, [productReviews]);

  const activeStarValue = hoveredRating ?? selectedRating;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (trimmed.length < 3) {
      setErrorMessage('Please write a short review (at least 3 characters).');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onSubmitReview({
        productId: product.id,
        rating: selectedRating,
        comment: trimmed.slice(0, 600),
        variantLabel: selectedVariantLabel,
        authorLocation: authorLocation.trim() || 'Nairobi, Kenya',
      });
      setCommentText('');
      setSubmittedSuccess(true);
      setTimeout(() => setSubmittedSuccess(false), 3000);
    } catch {
      setErrorMessage('Could not save review. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${compact ? 'pt-5 mt-5 border-t border-line' : 'space-y-6'}`}>
      {/* Top Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-ink" />
            <h4 className="font-serif-display text-lg font-semibold text-ink">
              Customer Reviews · {product.name}
            </h4>
          </div>
          <p className="text-xs text-ink-soft mt-0.5">
            Verified collector impressions &amp; Firestore-persisted star ratings
          </p>
        </div>

        <div className="flex items-center gap-3 bg-paper px-3.5 py-2 rounded border border-line">
          <div className="text-right">
            <div className="font-mono-tabular text-base font-bold text-ink leading-none">
              {averageRating.toFixed(1)} / 5.0
            </div>
            <div className="text-xs text-ink-soft mt-0.5">
              {productReviews.length}{' '}
              {productReviews.length === 1 ? 'Collector Review' : 'Collector Reviews'}
            </div>
          </div>
          <StarRatingDisplay rating={averageRating} size="md" />
        </div>
      </div>

      <div
        className={`grid grid-cols-1 ${
          compact ? ' gap-5' : 'lg:grid-cols-12 gap-8 items-start'
        }`}
      >
        {/* Review Submission Box */}
        <div className={`${compact ? '' : 'lg:col-span-5'}`}>
          <div className="p-4 rounded-lg border border-line bg-paper space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink">
                Write a Customer Review
              </span>
              {currentUser && (
                <span className="inline-flex items-center gap-1 text-xs text-ok font-medium">
                  <UserCheck className="w-3 h-3" />
                  <span>{currentUser.name}</span>
                </span>
              )}
            </div>

            {!currentUser ? (
              /* Logged-Out State: Quick Sign-In to Review */
              <div className="space-y-3">
                <p className="text-xs text-ink-soft leading-relaxed">
                  Sign in with your Google account or Atelier Collector profile to submit a
                  star rating and short review for <strong>{product.name}</strong>.
                </p>

                <button
                  type="button"
                  disabled={isSigningIn}
                  onClick={onGoogleSignIn}
                  className="w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider bg-ink hover:bg-ink-hover text-white rounded flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <LogIn className="w-3.5 h-3.5 text-brand" />
                  <span>
                    {isSigningIn
                      ? 'Signing In...'
                      : 'Sign In with Google (Cloud Firestore)'}
                  </span>
                </button>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!quickName.trim() || !quickContact.trim()) return;
                    onQuickMemberSignIn(quickName.trim(), quickContact.trim());
                  }}
                  className="pt-2.5 border-t border-line space-y-2"
                >
                  <span className="block text-xs font-medium text-ink-soft">
                    Or Quick Collector Sign-In:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      placeholder="Your Name (e.g. Wanjiku)"
                      className="px-2.5 py-1.5 text-xs bg-white border border-line rounded focus:outline-none focus:border-ink"
                    />
                    <input
                      type="text"
                      required
                      value={quickContact}
                      onChange={(e) => setQuickContact(e.target.value)}
                      placeholder="Email or +254 Phone"
                      className="px-2.5 py-1.5 text-xs bg-white border border-line rounded focus:outline-none focus:border-ink"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 px-3 text-xs font-semibold uppercase tracking-wider bg-white hover:bg-ink text-ink hover:text-white border border-ink rounded transition-colors cursor-pointer"
                  >
                    Continue to Review Form
                  </button>
                </form>
              </div>
            ) : (
              /* Logged-In Review Submission Form */
              <form onSubmit={handleFormSubmit} className="space-y-3">
                {errorMessage && (
                  <div className="p-2.5 rounded bg-red-50 border border-red-200 text-xs text-red-800">
                    {errorMessage}
                  </div>
                )}

                {submittedSuccess && (
                  <div className="p-2.5 rounded bg-ok/10 border border-ok/30 text-xs text-ok font-medium flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Thank you! Your review has been published
                      {currentUser.isFirebaseAuthenticated ? ' to Cloud Firestore.' : '.'}
                    </span>
                  </div>
                )}

                {/* Interactive 1-5 Star Selector */}
                <div>
                  <label className="block text-xs font-medium text-ink-soft mb-1">
                    Your Star Rating
                  </label>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded bg-white border border-line">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = star <= activeStarValue;
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(null)}
                            onClick={() => setSelectedRating(star)}
                            aria-label={`Rate ${star} out of 5 stars`}
                            className="p-1 rounded hover:bg-paper transition-transform hover:scale-110 cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                active
                                  ? 'fill-brand text-brand'
                                  : 'fill-transparent text-faint'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-medium text-ink truncate">
                      {RATING_LABELS[activeStarValue]}
                    </span>
                  </div>
                </div>

                {/* Variant / Finish & Location Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1">
                      Finish / Shade Reviewed
                    </label>
                    <select
                      value={selectedVariantLabel}
                      onChange={(e) => setSelectedVariantLabel(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-line rounded focus:outline-none focus:border-ink"
                    >
                      {product.variants.map((v) => {
                        const shortLabel = v.label.split(' · ')[0];
                        return (
                          <option key={v.id} value={shortLabel}>
                            {shortLabel}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1">
                      Your Location
                    </label>
                    <input
                      type="text"
                      value={authorLocation}
                      onChange={(e) => setAuthorLocation(e.target.value)}
                      placeholder="e.g. Westlands, Nairobi"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-line rounded focus:outline-none focus:border-ink"
                    />
                  </div>
                </div>

                {/* Short Review Comment */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-ink-soft">
                      Your Review
                    </label>
                    <span className="font-mono-tabular text-xs text-faint">
                      {commentText.length}/600
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    maxLength={600}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={`Share your experience writing with ${product.name} (nib smoothness, ink flow, balance)...`}
                    className="w-full px-3 py-2 text-xs bg-white border border-line rounded focus:outline-none focus:border-ink"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider bg-ink hover:bg-ink-hover text-white rounded transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving Review...' : 'Submit Star Rating & Review'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className={`${compact ? '' : 'lg:col-span-7'} space-y-3`}>
          {productReviews.length === 0 ? (
            <div className="p-6 rounded-lg border border-line bg-white text-center">
              <p className="font-serif-display text-base text-ink">
                No Reviews Yet for {product.name}
              </p>
              <p className="text-xs text-ink-soft mt-1">
                Be the first collector in Kenya to rate this writing instrument.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {productReviews.map((rev) => {
                const isOwnReview =
                  currentUser &&
                  (rev.userId === currentUser.uid || rev.authorName === currentUser.name);

                return (
                  <div
                    key={rev.id}
                    className="p-4 rounded-lg border border-line bg-white space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <StarRatingDisplay rating={rev.rating} size="xs" />
                          <span className="text-xs font-semibold text-ink">
                            {rev.authorName}
                          </span>
                          {rev.authorLocation && (
                            <span className="text-xs text-ink-soft">
                              · {rev.authorLocation}
                            </span>
                          )}
                        </div>
                        {rev.variantLabel && (
                          <p className="text-xs text-brand font-medium mt-0.5">
                            Reviewed: {rev.variantLabel}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono-tabular text-faint">
                          {rev.timestamp}
                        </span>
                        {isOwnReview && onDeleteReview && !rev.id.startsWith('seed-rev-') && (
                          <button
                            type="button"
                            onClick={() => onDeleteReview(rev)}
                            title="Delete your review"
                            className="p-1 text-faint hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-ink-soft leading-relaxed">{rev.comment}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
