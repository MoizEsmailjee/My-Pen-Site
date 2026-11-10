import { Link } from 'react-router-dom';
import { INK_STUDIO_SHADES } from '../../data/products';
import { ROUTES } from '../../lib/routes';
import { ResilientImage } from '../primitives';

const FACTS = [
  { title: 'Genuine imports', text: 'Pilot Japan and Waterman Paris, boxed as sold there.' },
  { title: 'Fine or medium nib', text: 'Choose on every Prera and Kakuno.' },
  { title: 'Pay your way', text: 'M-Pesa, cash on delivery, or order on WhatsApp.' },
];

export function Hero() {
  return (
    <section className="page">
      <div className="grid items-center gap-8 py-8 md:grid-cols-[1fr_1.05fr] md:gap-12 md:py-14">
        <div className="min-w-0">
          <h1 className="text-4xl leading-[1.12] sm:text-5xl lg:text-[3.5rem]">
            Fountain pens and ink, in stock in Nairobi.
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg text-ink-soft">
            Genuine Pilot pens from Japan, all {INK_STUDIO_SHADES.length} Iroshizuku inks, and
            Waterman ink from Paris. Pick a nib, pay by M-Pesa or on delivery.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to={ROUTES.range} className="btn">
              Shop pens
            </Link>
            <Link to={ROUTES.inks} className="btn-ghost">
              Browse the {INK_STUDIO_SHADES.length} inks
            </Link>
          </div>
        </div>
        <ResilientImage
          src="/assets/images/hero_pilot_fountain_pen_1794023542555.jpg"
          alt="Black Pilot fountain pen beside a bottle of Iroshizuku Tsuki-yo ink"
          fallbackTitle="Pilot fountain pen and Iroshizuku ink"
          size="full"
          priority
          className="aspect-[4/3] w-full rounded-md object-cover"
        />
      </div>
      <dl className="grid gap-4 border-t border-line py-5 sm:grid-cols-3 sm:gap-6">
        {FACTS.map((fact) => (
          <div key={fact.title} className="min-w-0 text-[0.95rem]">
            <dt className="font-semibold">{fact.title}</dt>
            <dd className="text-ink-soft">{fact.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
