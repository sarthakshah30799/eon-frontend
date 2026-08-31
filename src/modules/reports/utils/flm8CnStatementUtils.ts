import type { IFlm8ReportColumn } from '../types';

export interface IFlm8HeaderCluster {
  id: string;
  groupLabel?: string;
  highlight?: boolean;
  columns: IFlm8ReportColumn[];
}

export const clusterFlm8HeaderColumns = (
  columns: IFlm8ReportColumn[]
): IFlm8HeaderCluster[] => {
  const clusters: IFlm8HeaderCluster[] = [];

  columns.forEach(column => {
    const last = clusters[clusters.length - 1];
    if (column.groupLabel && last?.groupLabel === column.groupLabel) {
      last.columns.push(column);
      last.highlight = last.highlight || column.highlight;
      return;
    }

    clusters.push({
      id: column.groupLabel ?? column.key,
      groupLabel: column.groupLabel,
      highlight: column.highlight,
      columns: [column],
    });
  });

  return clusters;
};

export const hasFlm8GroupedHeader = (columns: IFlm8ReportColumn[]) =>
  columns.some(column => Boolean(column.groupLabel));
