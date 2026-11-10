import { CollectionShell } from '../components/CollectionShell';
import { HeroSection } from '../components/HeroSection';
import { ProductGrid } from '../components/ProductGrid';
import { StorySection } from '../components/StorySection';
import { usePageTitle } from '../lib/usePageTitle';

export function HomePage() {
  usePageTitle();
  return (
    <>
      <HeroSection />
      <CollectionShell>
        <ProductGrid />
      </CollectionShell>
      <StorySection />
    </>
  );
}
