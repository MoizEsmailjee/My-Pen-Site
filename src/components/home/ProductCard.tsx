import { Link } from 'react-router-dom';
import type { Product } from '../../data/products';
import { displayKind, displayName, stockState } from '../../lib/productDisplay';
import { productPath } from '../../lib/routes';
import { formatKes } from '../../lib/storefront';
import { ResilientImage } from '../primitives';

const MAX_DOTS = 6;

/** One card per product. Colours and nib sizes are chosen on the product page. */
export function ProductCard({ product }: { product: Product }) {
  const swatches = product.variants.filter((v) => v.swatchHex);
  const soldOut = product.variants.every((v) => stockState(v) === 'out');
  const name = displayName(product);

  return (
    <Link to={productPath(product.id)} className="group flex min-w-0 flex-col gap-2.5">
      <div className="aspect-square overflow-hidden rounded-md border border-line bg-sheet">
        <ResilientImage
          src={product.image}
          alt={name}
          fallbackTitle={name}
          className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.03] ${
            product.imageFit === 'contain' ? 'object-contain' : 'object-cover'
          }`}
        />
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 font-semibold group-hover:underline group-hover:underline-offset-4">
          {name}
        </h3>
        <span className="font-mono-tabular shrink-0 font-semibold">
          {formatKes(product.priceKes)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 text-sm text-ink-soft">
        <span className="min-w-0">{soldOut ? 'Sold out' : displayKind(product)}</span>
        {swatches.length > 1 && (
          <span className="flex shrink-0 items-center gap-1" aria-label={`${swatches.length} colours`}>
            {swatches.slice(0, MAX_DOTS).map((v) => (
              <span
                key={v.id}
                className="h-3 w-3 rounded-full border border-line"
                style={{ backgroundColor: v.swatchHex }}
              />
            ))}
            {swatches.length > MAX_DOTS && (
              <span className="text-xs">+{swatches.length - MAX_DOTS}</span>
            )}
          </span>
        )}
      </div>
    </Link>
  );
}
