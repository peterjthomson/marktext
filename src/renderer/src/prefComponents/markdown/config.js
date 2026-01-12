import { t } from '../../i18n'

export const bulletListMarkerOptions = [
  {
    label: '*',
    value: '*'
  },
  {
    label: '-',
    value: '-'
  },
  {
    label: '+',
    value: '+'
  }
]

export const orderListDelimiterOptions = [
  {
    label: '.',
    value: '.'
  },
  {
    label: ')',
    value: ')'
  }
]

export const getPreferHeadingStyleOptions = () => [
  {
    label: t('preferences.markdown.misc.preferHeadingStyle.atx'),
    value: 'atx'
  },
  {
    label: t('preferences.markdown.misc.preferHeadingStyle.setext'),
    value: 'setext'
  }
]

export const getListIndentationOptions = () => [
  {
    label: t('preferences.markdown.lists.listIndentation.dfm'),
    value: 'dfm'
  },
  {
    label: t('preferences.markdown.lists.listIndentation.tab'),
    value: 'tab'
  },
  {
    label: t('preferences.markdown.lists.listIndentation.oneSpace'),
    value: 1
  },
  {
    label: t('preferences.markdown.lists.listIndentation.twoSpaces'),
    value: 2
  },
  {
    label: t('preferences.markdown.lists.listIndentation.threeSpaces'),
    value: 3
  },
  {
    label: t('preferences.markdown.lists.listIndentation.fourSpaces'),
    value: 4
  }
]

export const getFrontmatterTypeOptions = () => [
  {
    label: 'YAML',
    value: '-'
  },
  {
    label: 'TOML',
    value: '+'
  },
  {
    label: t('preferences.markdown.extensions.frontmatterType.jsonSemicolon'),
    value: ';'
  },
  {
    label: t('preferences.markdown.extensions.frontmatterType.jsonBrace'),
    value: '{'
  }
]

export const getSequenceThemeOptions = () => [
  {
    label: t('preferences.markdown.diagrams.sequenceTheme.handDrawn'),
    value: 'hand'
  },
  {
    label: t('preferences.markdown.diagrams.sequenceTheme.simple'),
    value: 'simple'
  }
]
