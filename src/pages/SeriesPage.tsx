import type { ComponentType } from 'react';
import { useParams } from 'react-router-dom';
import { CollectionShell } from '../components/CollectionShell';
import { FamilySeries } from '../components/series/FamilySeries';
import { IroshizukuSeries } from '../components/series/IroshizukuSeries';
import { MadoromiSeries } from '../components/series/MadoromiSeries';
import { PreraSeries } from '../components/series/PreraSeries';
import { WatermanSeries } from '../components/series/WatermanSeries';
import { SeriesId, isSeriesId } from '../lib/routes';
import { usePageTitle } from '../lib/usePageTitle';
import { NotFoundPage } from './NotFoundPage';

const SERIES: Record<SeriesId, { title: string; Component: ComponentType }> = {
  madoromi: { title: 'Pilot Kakuno Madoromi Series', Component: MadoromiSeries },
  family: { title: 'Pilot Kakuno Family Series', Component: FamilySeries },
  prera: { title: 'Pilot Prera Fountain Pens', Component: PreraSeries },
  iroshizuku: { title: 'Pilot Iroshizuku Bottled Inks', Component: IroshizukuSeries },
  waterman: { title: 'Waterman Bottled Inks', Component: WatermanSeries },
};

export function SeriesPage() {
  const { seriesId } = useParams();
  const series = isSeriesId(seriesId) ? SERIES[seriesId] : undefined;
  usePageTitle(series ? series.title : 'Page not found');

  if (!series) {
    return <NotFoundPage message="We don't stock a series by that name." />;
  }

  const { Component } = series;
  return (
    <CollectionShell>
      <Component />
    </CollectionShell>
  );
}
