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

    background: '#0A0D10',
    text: '#EAEEF2',
    text_dark: '#0C1E29',
    text_gray: '#8A949E',
    text_disabled: '#B2BCBF',
    attention: '#FFB020',
    attention_dark: '#B07800',
    attention_light: 'rgba(176, 120, 0, 0.1)',

    heading: '#EAEEF2',

    primary_bg: 'rgba(6, 88, 148, 0.08)',

    border: '#C4C4C4',

    white: '#FFFFFF',

    shape: '#151A1F',
    shape_light: '#EAEEEF',
    shape_dark: '#0F1317',

    // --- Ink scale ---
    ink950: '#0A0D10',
    ink900: '#0F1317',
    ink850: '#151A1F',
    ink800: '#1C2228',
    ink700: '#262E36',
    ink600: '#3A434D',
    ink500: '#5B6670',
    ink400: '#8A949E',
    ink300: '#B8C1CA',
    ink100: '#EAEEF2',
    ink50: '#F7F9FB',

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
