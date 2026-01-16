import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {EarthGlobeIcon} from '@sanity/icons'
import type {DocumentActionComponent} from 'sanity'

export default defineConfig({
  name: 'default',
  title: 'GMO Reports',
  projectId: 'mb7v1vpy',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'report') {
        const ViewLiveReportAction: DocumentActionComponent = (props) => {
          return {
            label: 'View Live Report',
            icon: EarthGlobeIcon,
            onHandle: () => {
              window.open('https://gmo-builder.vercel.app', '_blank')
            },
          }
        }
        return [...prev, ViewLiveReportAction]
      }
      return prev
    },
  },
})
