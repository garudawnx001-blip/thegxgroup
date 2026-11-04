const v = (n) => `rgb(var(--c-${n}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { bg: v('bg'), surface: v('surface'), elev: v('elev'), ink: v('ink'), mute: v('mute'), line: v('line'), accent: '#087CF5' },
      fontFamily: { display: ['"Manrope Variable"', 'system-ui', 'sans-serif'], sans: ['"Inter Variable"', 'system-ui', 'sans-serif'] },
      letterSpacing: { label: '0.28em' },
      maxWidth: { site: '1240px' },
    },
  },
}
