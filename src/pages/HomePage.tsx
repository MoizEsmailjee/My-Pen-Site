import { DeliveryInfo } from '../components/home/DeliveryInfo';
import { FirstPen } from '../components/home/FirstPen';
import { Hero } from '../components/home/Hero';
import { InkWall } from '../components/home/InkWall';
import { Range } from '../components/home/Range';
import { usePageTitle } from '../lib/usePageTitle';

export function HomePage() {
  usePageTitle();
  return (
    <>
      <Hero />
      <Range />
      <InkWall />
      <FirstPen />
      <DeliveryInfo />
    </>
  );
}
