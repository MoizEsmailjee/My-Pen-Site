import { CollectionShell } from '../components/CollectionShell';
import { WritingSetBuilderIsland } from '../islands/WritingSetBuilderIsland';
import { usePageTitle } from '../lib/usePageTitle';
import { useStorefront } from '../store/StorefrontContext';

export function SetBuilderPage() {
  usePageTitle('Writing set builder');
  const { handleAddBundleToCart } = useStorefront();
  return (
    <CollectionShell>
      <WritingSetBuilderIsland onAddBundleToCart={handleAddBundleToCart} />
    </CollectionShell>
  );
}
