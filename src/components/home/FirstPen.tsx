import { Link } from 'react-router-dom';
import { productPath } from '../../lib/routes';
import { formatKes } from '../../lib/storefront';
import { useStorefront } from '../../store/StorefrontContext';

const PICKS = [
  {
    id: 'pilot-kakuno-family',
    tag: 'Easiest start',
    name: 'Kakuno Family',
    text: 'Light, clear barrel, and a shaped grip that shows you how to hold it.',
  },
  {
    id: 'pilot-kakuno-madoromi',
    tag: 'A gift',
    name: 'Kakuno Madoromi',
    text: 'Soft pastel colours with a gold-tone nib. Limited edition.',
  },
  {
    id: 'pilot-prera',
    tag: 'One to keep',
    name: 'Pilot Prera',
    text: 'Compact, snap cap, and a converter included so you can use bottled ink.',
  },
];

export function FirstPen() {
  const { catalogProducts } = useStorefront();
  const picks = PICKS.flatMap((pick) => {
    const product = catalogProducts.find((p) => p.id === pick.id);
    return product ? [{ ...pick, price: product.priceKes }] : [];
  });
  if (picks.length === 0) return null;

  return (
    <section className="bg-wash py-12 md:py-14">
      <div className="page">
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 className="text-3xl md:text-[2rem]">Buying your first fountain pen?</h2>
          <p className="max-w-[60ch] text-ink-soft">
            All three write well out of the box and take the same Pilot cartridges and CON-40
            converter.
          </p>
        </div>
        <div className="grid divide-y divide-line rounded-md border border-line bg-sheet md:grid-cols-3 md:divide-x md:divide-y-0">
          {picks.map((pick) => (
            <Link
              key={pick.id}
              to={productPath(pick.id)}
              className="flex min-w-0 flex-col gap-1.5 p-5 hover:bg-paper md:p-6"
            >
              <span className="text-sm text-ink-soft">{pick.tag}</span>
              <h3 className="font-semibold">{pick.name}</h3>
              <span className="text-sm text-ink-soft">{pick.text}</span>
              <span className="font-mono-tabular mt-1 font-semibold">{formatKes(pick.price)}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
