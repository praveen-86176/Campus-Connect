// Simple, reliable color system for Campus Connect

// Light theme colors
const LightTheme = {
  primary: '#0066FF',
  primaryDark: '#0052CC',
  gradientStart: '#4169E1',
  gradientEnd: '#9333EA',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#1F2A37',
  textLight: '#FFFFFF',
  mutedText: '#6B7280',
  searchBg: 'rgba(255, 255, 255, 0.2)',
  border: '#E5E7EB',
  success: '#22C55E',
  danger: '#EF4444',
  categoryBg: '#E8F0FE',
  categoryText: '#0066FF',
  tint: '#0066FF',
  tabIconDefault: '#6B7280',
  tabIconSelected: '#0066FF',
};

// Dark theme colors
const DarkTheme = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  gradientStart: '#4169E1',
  gradientEnd: '#9333EA',
  background: '#111827',
  card: '#1F2937',
  text: '#F9FAFB',
  textLight: '#FFFFFF',
  mutedText: '#9CA3AF',
  searchBg: 'rgba(31, 41, 55, 0.5)',
  border: '#374151',
  success: '#22C55E',
  danger: '#EF4444',
  categoryBg: '#1E3A8A',
  categoryText: '#60A5FA',
  tint: '#3B82F6',
  tabIconDefault: '#9CA3AF',
  tabIconSelected: '#3B82F6',
};

// Main function to get colors based on theme - USE THIS
export const getColors = (isDark: boolean = false) => {
  return isDark ? DarkTheme : LightTheme;
};

// Export light theme as default Colors (for backward compatibility)
export const Colors = LightTheme;

// Export theme colors object (for React Native pattern compatibility)
export const ThemeColors = {
  light: LightTheme,
  dark: DarkTheme,
};

// Export default colors (light theme)
export const colors = {
  primary: LightTheme.primary,
  secondary: '#5856D6',
  background: LightTheme.background,
  text: LightTheme.text,
  border: LightTheme.border,
  error: LightTheme.danger,
  success: LightTheme.success,
  warning: '#FF9500',
};

// Default export
export default Colors;
