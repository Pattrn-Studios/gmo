/**
 * Sanity Document Action: View French Translation
 *
 * Adds a button to report documents that opens the French-translated
 * version of the report in a new browser tab.
 */

import type { DocumentActionComponent } from 'sanity'
import { TranslateIcon } from '@sanity/icons'

export const ViewFrenchTranslationAction: DocumentActionComponent = (props) => {
  const { published } = props

  return {
    label: 'Voir traduction française',
    icon: TranslateIcon,
    title: published
      ? 'Ouvrir la version française du rapport'
      : 'Publiez d\'abord le document pour voir la traduction',
    disabled: !published,
    onHandle: () => {
      window.open('https://gmo-builder.vercel.app/fr', '_blank')
    },
  }
}
