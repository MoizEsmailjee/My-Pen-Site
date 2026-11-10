import { useStorefront } from '../../store/StorefrontContext';
import { ProductCard } from './ProductCard';

export function Range() {
  const { catalogProducts } = useStorefront();
  return (
    <section id="range" className="scroll-mt-28 bg-wash py-12 md:py-14">
      <div className="page">
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 className="text-3xl md:text-[2rem]">The range</h2>
          <p className="text-ink-soft">
            Colours and nib sizes are chosen on each product page.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3 md:gap-x-6">
          {catalogProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
