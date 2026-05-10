const theme = {
  colors: {
    // --- Semantic aliases (kept for backward compat, now pointing at Pitch Night palette) ---
    primary: '#C8FF3E',
    primary_dark: '#9AD500',
    primary_light: '#89CBFB',

    secondary: '#FFB020',
    secondary_dark: 'rgba(255,135,44,0.3)',

    positive: '#4ADE80',
    positive_light: 'rgba(18,164,84,.1)',

    negative: '#F04A50',
    negative_light: 'rgba(232,63,91,.1)',

    background: '#0D0D0D',
    text: '#EAEAEA',
    text_dark: '#0C1E29',
    text_gray: '#8C8C8C',
    text_disabled: '#B2B2B2',
    attention: '#FFB020',
    attention_dark: '#B07800',
    attention_light: 'rgba(176, 120, 0, 0.1)',

    heading: '#EAEAEA',

    primary_bg: 'rgba(6, 88, 148, 0.08)',

    border: '#C4C4C4',

    white: '#FFFFFF',

    shape: '#1C1C1C',
    shape_light: '#EAEAEA',
    shape_dark: '#141414',

    // --- Ink scale ---
    ink950: '#0D0D0D',
    ink900: '#141414',
    ink850: '#1C1C1C',
    ink800: '#242424',
    ink700: '#303030',
    ink600: '#404040',
    ink500: '#5E5E5E',
    ink400: '#8C8C8C',
    ink300: '#BEBEBE',
    ink100: '#EAEAEA',
    ink50: '#F7F7F7',

    // --- Pitch accent ---
    pitch: '#C8FF3E',
    pitchSoft: '#9AD500',
    pitchInk: '#0E1B00',

    // --- Signal tokens ---
    signalLive: '#FF5A5F',
    signalWin: '#4ADE80',
    signalAmber: '#FFB020',
    signalLose: '#F04A50',
  },

  fonts: {
    light: 'Inter_300Light',
    regular: 'Inter_400Regular',
    semi: 'Inter_500Medium',
    bold: 'Inter_700Bold',
    black: 'Inter_900Black',
    display: 'BarlowCondensed_700Bold',
  },

  radii: {
    xs: 8,
    sm: 12,
    md: 18,
    lg: 24,
    xl: 32,
  },
};

export { theme };
export default theme;
