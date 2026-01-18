import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ChartRecommendation } from './types';
import { parseCSV, mapChartType, getYAxisFormatter } from './utils';
import { PreviewContainer, ReasoningBox } from './styles';

interface Props {
  recommendation: ChartRecommendation;
  csvData: string;
}

export function ChartPreview({ recommendation, csvData }: Props) {
  const chartConfig = useMemo((): Highcharts.Options => {
    const parsedData = parseCSV(csvData);
    const categories = parsedData.map(row => row[Object.keys(row)[0]]);

    return {
      chart: {
        type: mapChartType(recommendation.chartType),
        height: 400
      },
      title: { text: undefined },
      xAxis: {
        categories,
        title: { text: recommendation.xAxisLabel }
      },
      yAxis: {
        title: { text: recommendation.yAxisLabel },
        labels: { formatter: getYAxisFormatter(recommendation.yAxisFormat) }
      },
      series: recommendation.series.map(s => ({
        type: mapChartType(recommendation.chartType) as any,
        name: s.label,
        data: parsedData.map(row => parseFloat(row[s.dataColumn]) || 0),
        color: s.colour
      })),
      plotOptions: {
        series: {
          stacking: recommendation.chartType.includes('stacked') ? 'normal' : undefined
        }
      },
      legend: { align: 'left', verticalAlign: 'top' },
      credits: { enabled: false }
    };
  }, [recommendation, csvData]);

  return (
    <PreviewContainer>
      <h3>Recommended Chart</h3>
      <HighchartsReact highcharts={Highcharts} options={chartConfig} />
      <ReasoningBox>
        <strong>Why this chart?</strong>
        <p>{recommendation.reasoning}</p>
      </ReasoningBox>
    </PreviewContainer>
  );
}
