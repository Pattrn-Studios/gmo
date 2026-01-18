import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ChartRecommendation } from './types';
import { parseCSV, mapChartType } from './utils';
import { ThumbnailsGrid, ThumbnailCard } from './styles';

interface Props {
  alternatives: ChartRecommendation[];
  csvData: string;
  onSelect: (index: number) => void;
}

export function AlternativesThumbnails({ alternatives, csvData, onSelect }: Props) {
  if (alternatives.length === 0) return null;

  return (
    <div>
      <h4>Alternative Charts</h4>
      <ThumbnailsGrid>
        {alternatives.map((alt, idx) => {
          const parsedData = parseCSV(csvData);
          const categories = parsedData.map(row => row[Object.keys(row)[0]]);

          const config: Highcharts.Options = {
            chart: {
              type: mapChartType(alt.chartType),
              height: 150,
              width: 200
            },
            title: { text: undefined },
            xAxis: { categories, visible: false },
            yAxis: { visible: false },
            series: alt.series.map(s => ({
              type: mapChartType(alt.chartType) as any,
              name: s.label,
              data: parsedData.map(row => parseFloat(row[s.dataColumn]) || 0),
              color: s.colour
            })),
            legend: { enabled: false },
            credits: { enabled: false },
            tooltip: { enabled: false }
          };

          return (
            <ThumbnailCard key={idx} onClick={() => onSelect(idx)}>
              <HighchartsReact highcharts={Highcharts} options={config} />
              <span>{alt.chartType}</span>
            </ThumbnailCard>
          );
        })}
      </ThumbnailsGrid>
    </div>
  );
}
