// Light theme colors
export const LightColors = {
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
};

// Dark theme colors
export const DarkColors = {
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
};

// Function to get colors based on theme
export const getColors = (isDark: boolean) => isDark ? DarkColors : LightColors;

// Default export for backward compatibility
export const Colors = LightColors;

