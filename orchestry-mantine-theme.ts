// Harmony: Orchestry Design System v2.2.0
// Mantine theme generated from orchestry-tokens.css (source of truth).
// Load orchestry-tokens.css globally so components can use the CSS variables.
import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Mantine needs 10 shades (0–9). Index 7 = teal-700, the action color.
const orchestryTeal: MantineColorsTuple = [
  '#EEF6F6', '#D4EBEC', '#A9D6D8', '#72BBBF', '#3A9DA2',
  '#128A90', '#007980', '#0D6C79', '#0B5560', '#083F47',
];

export const harmonyTheme = createTheme({
  primaryColor: 'orchestryTeal',
  primaryShade: 7,
  colors: { orchestryTeal },
  fontFamily: "'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  black: '#1D2229',
  white: '#FFFFFF',
  defaultRadius: 'md',
  radius: { xs: '4px', sm: '6px', md: '8px', lg: '12px', xl: '16px' },
  spacing: { xs: '8px', sm: '12px', md: '16px', lg: '24px', xl: '32px' },
  fontSizes: { xs: '12px', sm: '13px', md: '14px', lg: '16px', xl: '20px' },
  lineHeights: { xs: '16px', sm: '20px', md: '20px', lg: '24px', xl: '28px' },
  headings: {
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '28px', lineHeight: '36px' }, // type-h1
      h2: { fontSize: '24px', lineHeight: '32px' }, // type-h2
      h3: { fontSize: '20px', lineHeight: '28px' }, // type-h3
      h4: { fontSize: '18px', lineHeight: '26px' }, // type-h4
      h5: { fontSize: '16px', lineHeight: '24px' }, // type-h5
      h6: { fontSize: '14px', lineHeight: '20px' }, // type-h6
    },
  },
  shadows: {
    xs: '0 1px 2px rgba(29,34,41,0.05)',
    sm: '0 2px 8px rgba(29,34,41,0.06)',
    md: '0 10px 28px rgba(29,34,41,0.10)',
    lg: '0 20px 60px rgba(29,34,41,0.22)',
  },
  components: {
    Button: {
      defaultProps: { size: 'sm', radius: 'md' },
      styles: { root: { fontWeight: 600, height: 'var(--control-h-md)' } },
    },
    Card: {
      defaultProps: { radius: 'lg', padding: 20, withBorder: true, shadow: undefined },
      styles: { root: { background: 'var(--bg-surface)', borderColor: 'var(--border-default)' } },
    },
    Badge: {
      defaultProps: { radius: 'xl', variant: 'light' },
      styles: { root: { textTransform: 'none', fontWeight: 600, height: 22 } },
    },
    Table: {
      styles: {
        th: {
          font: 'var(--type-overline)',
          letterSpacing: 'var(--track-overline)',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
        },
        td: { font: 'var(--type-body-s)', padding: '12px 16px' },
      },
    },
    Tooltip: { defaultProps: { color: 'dark', maw: 240, multiline: true } },
    Modal: { defaultProps: { radius: 'xl', size: 440, overlayProps: { backgroundOpacity: 0.32 } } },
    Tabs: { styles: { tab: { fontWeight: 500 } } },
  },
});
