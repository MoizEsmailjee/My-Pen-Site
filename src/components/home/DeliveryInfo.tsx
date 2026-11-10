import { formatKes } from '../../lib/storefront';
import { useStorefront } from '../../store/StorefrontContext';
import { ResilientImage } from '../primitives';

export function DeliveryInfo() {
  const { storeSettings } = useStorefront();
  const items = [
    {
      title: 'Nairobi, same day',
      text: 'Order before 3 pm for delivery that afternoon. CBD, Westlands, Kilimani, Lavington, Karen, Gigiri.',
    },
    {
      title: 'Rest of Kenya, next day',
      text: `Courier to all 47 counties in padded packaging. Free on orders from ${formatKes(
        storeSettings.freeDeliveryThresholdKes
      )}.`,
    },
    {
      title: 'M-Pesa or cash on delivery',
      text: 'Pay when you order, or check the pen first and pay the rider.',
    },
  ];

  return (
    <section id="delivery" className="scroll-mt-28 py-12 md:py-14">
      <div className="page grid items-center gap-8 md:grid-cols-2 md:gap-12">
        <ResilientImage
          src="/assets/images/japanese_nib_craftsmanship_1794023548186.jpg"
          alt="Gold fountain pen nib drawing a line of blue ink on textured paper"
          fallbackTitle="Fountain pen nib"
          size="full"
          className="aspect-[4/3] w-full rounded-md object-cover"
        />
        <div className="min-w-0">
          <h2 className="text-3xl md:text-[2rem]">Delivery and payment</h2>
          <dl className="mt-5 grid gap-4">
            {items.map((item) => (
              <div key={item.title} className="border-t border-line pt-3.5">
                <dt className="font-semibold">{item.title}</dt>
                <dd className="text-ink-soft">{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
