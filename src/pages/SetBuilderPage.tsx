import { InkMixingSetBuilderIsland } from '../islands/InkMixingSetBuilderIsland';
import { WritingSetBuilderIsland } from '../islands/WritingSetBuilderIsland';
import { usePageTitle } from '../lib/usePageTitle';
import { useStorefront } from '../store/StorefrontContext';

/** Both bundle builders: three inks at the set price, and a pen + converter + ink set. */
export function SetBuilderPage() {
  usePageTitle('Build a set');
  const { handleAddBundleToCart } = useStorefront();
  return (
    <div className="page pb-14">
      <InkMixingSetBuilderIsland onAddInkMixingSetToCart={handleAddBundleToCart} />
      <WritingSetBuilderIsland onAddBundleToCart={handleAddBundleToCart} />
    </div>
  );
}
