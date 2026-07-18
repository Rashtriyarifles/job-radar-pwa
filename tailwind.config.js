export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'radar-dark':   '#1a1a18',
        'radar-bg':     '#f5f4ee',
        'radar-card':   '#ffffff',
        'radar-border': '#e5e4dc',
        'radar-muted':  '#888780',
        'radar-green':  '#1d9e75',
        'radar-blue':   '#378add',
        'radar-amber':  '#ba7517',
      },
      fontFamily: { sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'] }
    }
  },
  plugins: []
}
