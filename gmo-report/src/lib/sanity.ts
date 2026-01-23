import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: 'mb7v1vpy',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
})

export async function getLatestReport() {
  const query = `*[_type == "report"] | order(publicationDate desc)[0] {
    title,
    publicationDate,
    author,
    summary,
    sections[] {
      _type,

      _type == "titleSection" => {
        heading,
        subheading,
        backgroundType,
        backgroundColor,
        "backgroundImage": backgroundImage.asset->url,
        "companyLogo": companyLogo.asset->url
      },

      _type == "navigationSection" => {
        title,
        showPageNumbers,
        layout,
        "cardImages": cardImages[] {
          sectionIndex,
          "imageUrl": image.asset->url
        }
      },

      _type == "contentSection" => {
        title,
        subtitle,
        colorTheme,
        "sectionImage": sectionImage.asset->url,
        content,
        hasChart,
        "chartType": chartConfig.chartType,
        "chartData": chartConfig.chartData,
        "chartSeries": chartConfig.chartSeries[] { label, dataColumn, colour },
        "xAxisLabel": chartConfig.xAxisLabel,
        "yAxisLabel": chartConfig.yAxisLabel,
        "yAxisFormat": chartConfig.yAxisFormat,
        "gaugeMax": chartConfig.gaugeMax,
        chartSource,
        layout
      },

      _type == "headerSection" => {
        title,
        subtitle,
        "image": image.asset->url,
        showBnpBanner,
        backgroundColor
      },

      _type == "timelineSection" => {
        title,
        subtitle,
        items[] {
          number,
          "image": image.asset->url,
          header,
          body
        }
      },

      _type == "chartInsightsSection" => {
        title,
        subtitle,
        "chartType": chartConfig.chartType,
        "chartData": chartConfig.chartData,
        "chartSeries": chartConfig.chartSeries[] { label, dataColumn, colour },
        "xAxisLabel": chartConfig.xAxisLabel,
        "yAxisLabel": chartConfig.yAxisLabel,
        "yAxisFormat": chartConfig.yAxisFormat,
        "gaugeMax": chartConfig.gaugeMax,
        chartSource,
        insightsPosition,
        "colorTheme": insightsColor,
        insights
      }
    }
  }`

  return sanityClient.fetch(query)
}

export type Report = Awaited<ReturnType<typeof getLatestReport>>
