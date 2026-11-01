import { Platform } from 'react-native';

export const StitchColors = {
  // Brand colors from Stitch Design Theme
  primary: '#2a14b4',
  primaryContainer: '#4338ca',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#c1beff',
  primaryFixed: '#e3dfff',
  primaryFixedDim: '#c3c0ff',
  onPrimaryFixed: '#100069',
  onPrimaryFixedVariant: '#372abf',

  secondary: '#0058be',
  secondaryContainer: '#2170e4',
  secondaryFixed: '#d8e2ff',
  secondaryFixedDim: '#adc6ff',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#fefcff',
  onSecondaryFixed: '#001a42',

  tertiary: '#003f5c',
  tertiaryContainer: '#00577e',
  tertiaryFixed: '#c9e6ff',
  tertiaryFixedDim: '#89ceff',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#84cdff',

  // Surfaces & Backgrounds
  surface: '#f8f9ff',
  surfaceDim: '#cbdbf5',
  surfaceBright: '#f8f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainer: '#e5eeff',
  surfaceContainerHigh: '#dce9ff',
  surfaceContainerHighest: '#d3e4fe',
  background: '#f8f9ff',

  onSurface: '#0b1c30',
  onSurfaceVariant: '#464554',
  onBackground: '#0b1c30',
  outline: '#777586',
  outlineVariant: '#c7c4d7',

  // Feedback
  error: '#dc2626',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',
  success: '#059669',
  successContainer: '#ecfdf5',
  successBorder: '#a7f3d0',
  successText: '#047857',
  warning: '#d97706',
  warningContainer: '#fffbeb',
  warningBorder: '#fde68a',
  warningText: '#b45309',
};

export const Colors = {
  light: {
    ...StitchColors,
    text: StitchColors.onSurface,
    textSecondary: StitchColors.onSurfaceVariant,
    card: StitchColors.surfaceContainerLowest,
    cardBorder: 'rgba(199, 196, 215, 0.45)',
    divider: '#f1f5f9',
    inputBackground: StitchColors.surfaceContainerLowest,
    inputBorder: '#cbd5e1',
    tabBarBackground: '#ffffff',
    tabBarBorder: '#e2e8f0',
    headerBackground: '#ffffff',
    badgeBackground: StitchColors.surfaceContainerLow,
    backgroundElement: StitchColors.surfaceContainerLow,
    backgroundSelected: StitchColors.surfaceContainerHigh,
  },
  dark: {
    ...StitchColors,
    surface: '#0f172a',
    surfaceDim: '#0a0f1d',
    surfaceBright: '#1e293b',
    surfaceContainerLowest: '#1e293b',
    surfaceContainerLow: '#172033',
    surfaceContainer: '#1e293b',
    surfaceContainerHigh: '#334155',
    surfaceContainerHighest: '#475569',
    background: '#090d16',
    onSurface: '#f1f5f9',
    onSurfaceVariant: '#94a3b8',
    onBackground: '#f1f5f9',
    outline: '#64748b',
    outlineVariant: '#334155',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    card: '#1e293b',
    cardBorder: '#334155',
    divider: '#334155',
    inputBackground: '#172033',
    inputBorder: '#475569',
    tabBarBackground: '#0f172a',
    tabBarBorder: '#1e293b',
    headerBackground: '#0f172a',
    badgeBackground: '#1e293b',
    backgroundElement: '#1e293b',
    backgroundSelected: '#334155',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'Courier',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'Inter, system-ui, sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
};

export const BottomTabInset = Platform.select({ ios: 34, android: 16 }) ?? 16;
export const MaxContentWidth = 600;
