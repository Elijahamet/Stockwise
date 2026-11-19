import { AppThemeId, ThemeConfig } from '../types';

export const THEME_PRESETS: Record<AppThemeId, ThemeConfig> = {
  // 1. Classic Emerald (Signature Stockwise Brand Green) - DEFAULT
  emerald: {
    id: 'emerald',
    name: 'Classic Emerald',
    tagline: 'Signature Stockwise Green & White',
    badge: 'DEFAULT • GREEN',
    description: 'Crisp daylight interface with white cards, deep forest emerald tones, and vibrant fresh green accents.',
    isGlass: false,
    isDark: false,
    colors: {
      background: '#F7F9F8',
      card: '#FFFFFF',
      cardBorder: '#E3E9E6',
      text: '#1A2723',
      textMuted: '#5C7169',
      primary: '#0A241D',
      primaryGradient: ['#0A241D', '#0F332A', '#16986C'],
      accent: '#16986C',
      accentLight: '#E8F6F1',
      highlight: '#2CE5A7',
      tabBarBackground: ['rgba(8, 30, 23, 0.95)', 'rgba(10, 37, 30, 0.96)', 'rgba(15, 52, 41, 0.97)'],
      tabBarActive: '#2CE5A7',
      tabBarBorder: 'rgba(22, 152, 108, 0.4)',
    },
    previewColors: ['#0A241D', '#16986C', '#2CE5A7'],
  },

  // 2. Sea Blue
  sea_blue: {
    id: 'sea_blue',
    name: 'Sea Blue',
    tagline: 'Deep Oceanic Sapphire & Cyan',
    badge: 'SEA BLUE',
    description: 'Deep maritime navy with vivid sapphire gradients, crisp sky cyan accents, and clear waters styling.',
    isGlass: false,
    isDark: false,
    colors: {
      background: '#F0F6FA',
      card: '#FFFFFF',
      cardBorder: '#BAE6FD',
      text: '#0C273D',
      textMuted: '#4B6B82',
      primary: '#082538',
      primaryGradient: ['#072030', '#0B3B59', '#0284C7'],
      accent: '#0284C7',
      accentLight: '#E0F2FE',
      highlight: '#38BDF8',
      tabBarBackground: ['rgba(7, 32, 48, 0.95)', 'rgba(10, 48, 73, 0.96)', 'rgba(11, 59, 89, 0.97)'],
      tabBarActive: '#38BDF8',
      tabBarBorder: 'rgba(2, 132, 199, 0.4)',
    },
    previewColors: ['#072030', '#0284C7', '#38BDF8'],
  },

  // 3. Sunset Orange
  orange: {
    id: 'orange',
    name: 'Sunset Orange',
    tagline: 'Warm Tangerine & Terracotta Glow',
    badge: 'ORANGE',
    description: 'Vibrant sunset terracotta canvas with energetic tangerine accents and high-contrast daylight cards.',
    isGlass: false,
    isDark: false,
    colors: {
      background: '#FFF8F3',
      card: '#FFFFFF',
      cardBorder: '#FED7AA',
      text: '#2E1208',
      textMuted: '#784D3B',
      primary: '#431407',
      primaryGradient: ['#361005', '#7C2D12', '#EA580C'],
      accent: '#EA580C',
      accentLight: '#FFEDD5',
      highlight: '#FB923C',
      tabBarBackground: ['rgba(54, 16, 5, 0.95)', 'rgba(67, 20, 7, 0.96)', 'rgba(124, 45, 18, 0.97)'],
      tabBarActive: '#FB923C',
      tabBarBorder: 'rgba(234, 88, 12, 0.4)',
    },
    previewColors: ['#361005', '#EA580C', '#FB923C'],
  },

  // 4. Royal Purple
  purple: {
    id: 'purple',
    name: 'Royal Purple',
    tagline: 'Regal Amethyst & Electric Violet',
    badge: 'PURPLE',
    description: 'Majestic deep velvet violet with radiant amethyst gradients and futuristic purple luminescence.',
    isGlass: false,
    isDark: false,
    colors: {
      background: '#FAF5FF',
      card: '#FFFFFF',
      cardBorder: '#DDD6FE',
      text: '#1E1035',
      textMuted: '#63517A',
      primary: '#2E1065',
      primaryGradient: ['#240B4F', '#4C1D95', '#7C3AED'],
      accent: '#7C3AED',
      accentLight: '#EDE9FE',
      highlight: '#A78BFA',
      tabBarBackground: ['rgba(36, 11, 79, 0.95)', 'rgba(46, 16, 101, 0.96)', 'rgba(76, 29, 149, 0.97)'],
      tabBarActive: '#C4B5FD',
      tabBarBorder: 'rgba(124, 58, 237, 0.4)',
    },
    previewColors: ['#240B4F', '#7C3AED', '#C4B5FD'],
  },

  // 5. iOS 27 Liquid Glass
  glass: {
    id: 'glass',
    name: 'iOS 27 Liquid Glass',
    tagline: 'Frosted Acrylic & Ambient Glow',
    badge: 'GLASS UI',
    description: 'Translucent frosted glassmorphism, glowing neon acrylic borders, and ambient holographic reflections.',
    isGlass: true,
    isDark: true,
    colors: {
      background: '#040E11',
      card: 'rgba(255, 255, 255, 0.12)',
      cardBorder: 'rgba(34, 211, 238, 0.45)',
      text: '#FFFFFF',
      textMuted: '#94A3B8',
      primary: '#061A1D',
      primaryGradient: ['#061A1D', '#0C3D43', '#06B6D4'],
      accent: '#22D3EE',
      accentLight: 'rgba(34, 211, 238, 0.22)',
      highlight: '#67E8F9',
      tabBarBackground: ['rgba(6, 26, 29, 0.92)', 'rgba(10, 42, 47, 0.93)', 'rgba(12, 61, 67, 0.94)'],
      tabBarActive: '#67E8F9',
      tabBarBorder: 'rgba(34, 211, 238, 0.5)',
    },
    previewColors: ['#061A1D', '#06B6D4', '#67E8F9'],
  },

  // 6. Sunburst Yellow
  yellow: {
    id: 'yellow',
    name: 'Sunburst Yellow',
    tagline: 'Luminous Golden Amber & Honey',
    badge: 'YELLOW',
    description: 'Warm golden sunburst backdrop with rich amber-gold gradients, honey accents, and high-energy feel.',
    isGlass: false,
    isDark: false,
    colors: {
      background: '#FFFDF5',
      card: '#FFFFFF',
      cardBorder: '#FDE68A',
      text: '#2E1C04',
      textMuted: '#755931',
      primary: '#3D2403',
      primaryGradient: ['#301C02', '#5A3505', '#D97706'],
      accent: '#D97706',
      accentLight: '#FEF3C7',
      highlight: '#F59E0B',
      tabBarBackground: ['rgba(48, 28, 2, 0.95)', 'rgba(61, 36, 3, 0.96)', 'rgba(90, 53, 5, 0.97)'],
      tabBarActive: '#FBBF24',
      tabBarBorder: 'rgba(217, 119, 6, 0.4)',
    },
    previewColors: ['#301C02', '#D97706', '#FBBF24'],
  },

  // 7. Crimson Red
  red: {
    id: 'red',
    name: 'Crimson Red',
    tagline: 'Bold Scarlet Ruby & Passion',
    badge: 'RED',
    description: 'High-contrast scarlet ruby styling with bold crimson highlights, intense dark mahogany accents, and sharp detail.',
    isGlass: false,
    isDark: false,
    colors: {
      background: '#FFF5F5',
      card: '#FFFFFF',
      cardBorder: '#FECACA',
      text: '#2E0808',
      textMuted: '#7A3A3A',
      primary: '#450A0A',
      primaryGradient: ['#360808', '#7F1D1D', '#DC2626'],
      accent: '#DC2626',
      accentLight: '#FEE2E2',
      highlight: '#EF4444',
      tabBarBackground: ['rgba(54, 8, 8, 0.95)', 'rgba(69, 10, 10, 0.96)', 'rgba(127, 29, 29, 0.97)'],
      tabBarActive: '#F87171',
      tabBarBorder: 'rgba(220, 38, 38, 0.4)',
    },
    previewColors: ['#360808', '#DC2626', '#F87171'],
  },

  // Backward compatibility aliases
  glass_ios27: {} as any,
  midnight: {} as any,
  nordic: {} as any,
  champagne: {} as any,
  cyberpunk: {} as any,
};

// Wire aliases safely
THEME_PRESETS.glass_ios27 = THEME_PRESETS.glass;
THEME_PRESETS.midnight = THEME_PRESETS.purple;
THEME_PRESETS.nordic = THEME_PRESETS.sea_blue;
THEME_PRESETS.champagne = THEME_PRESETS.yellow;
THEME_PRESETS.cyberpunk = THEME_PRESETS.glass;

// The official list of themes, with Classic Emerald (the green) first as the default!
export const THEME_LIST: ThemeConfig[] = [
  THEME_PRESETS.emerald,
  THEME_PRESETS.sea_blue,
  THEME_PRESETS.orange,
  THEME_PRESETS.purple,
  THEME_PRESETS.glass,
  THEME_PRESETS.yellow,
  THEME_PRESETS.red,
];
