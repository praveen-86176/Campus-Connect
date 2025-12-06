/**
 * Text, date, and time formatting utilities
 * Centralized formatting functions for consistent display
 */

/**
 * Formats a date string to a readable format
 * @param dateString - ISO date string or Date object
 * @param format - Format style ('full' | 'short' | 'date-only')
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string | Date,
  format: 'full' | 'short' | 'date-only' = 'full'
): string => {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    switch (format) {
      case 'date-only':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'short':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      case 'full':
      default:
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
    }
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Formats a time string to readable format
 * @param timeString - Time string (HH:MM or HH:MM:SS)
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export const formatTime = (timeString: string): string => {
  try {
    if (!timeString) return '';
    
    // Handle different time formats
    const timeParts = timeString.split(':');
    if (timeParts.length < 2) return timeString;
    
    const hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    
    if (isNaN(hours)) return timeString;
    
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(parseInt(minutes, 10));
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    return timeString;
  }
};

/**
 * Formats date and time together
 * @param dateString - ISO date string
 * @param timeString - Time string
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string, timeString: string): string => {
  const date = formatDate(dateString, 'date-only');
  const time = formatTime(timeString);
  return `${date} • ${time}`;
};

/**
 * Truncates text to a maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Formats a number with commas for thousands
 * @param num - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US');
};

/**
 * Formats phone number for display
 * @param phone - Phone number string
 * @returns Formatted phone number (e.g., "(123) 456-7890")
 */
export const formatPhoneDisplay = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return phone;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
};

/**
 * Gets relative time string (e.g., "2 hours ago", "in 3 days")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string | Date): string => {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const absDiff = Math.abs(diffInSeconds);
    const isPast = diffInSeconds > 0;
    const prefix = isPast ? '' : 'in ';
    const suffix = isPast ? ' ago' : '';

    // Seconds
    if (absDiff < 60) {
      return isPast ? 'just now' : 'in a moment';
    }

    // Minutes
    if (absDiff < 3600) {
      const minutes = Math.floor(absDiff / 60);
      return `${prefix}${minutes} ${minutes === 1 ? 'minute' : 'minutes'}${suffix}`;
    }

    // Hours
    if (absDiff < 86400) {
      const hours = Math.floor(absDiff / 3600);
      return `${prefix}${hours} ${hours === 1 ? 'hour' : 'hours'}${suffix}`;
    }

    // Days
    if (absDiff < 604800) {
      const days = Math.floor(absDiff / 86400);
      return `${prefix}${days} ${days === 1 ? 'day' : 'days'}${suffix}`;
    }

    // Weeks
    if (absDiff < 2592000) {
      const weeks = Math.floor(absDiff / 604800);
      return `${prefix}${weeks} ${weeks === 1 ? 'week' : 'weeks'}${suffix}`;
    }

    // Months
    if (absDiff < 31536000) {
      const months = Math.floor(absDiff / 2592000);
      return `${prefix}${months} ${months === 1 ? 'month' : 'months'}${suffix}`;
    }

    // Years
    const years = Math.floor(absDiff / 31536000);
    return `${prefix}${years} ${years === 1 ? 'year' : 'years'}${suffix}`;
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Capitalizes first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Formats file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
