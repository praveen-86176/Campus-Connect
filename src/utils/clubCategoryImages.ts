/**
 * Club category images utility
 * Provides image URLs for different club categories
 */

export const getClubCategoryImage = (category: string): string => {
  const normalizedCategory = category.toLowerCase().trim();
  
  switch (normalizedCategory) {
    case 'arts':
      // Arts category - painting, creativity, arts
      return 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop';
    
    case 'cultural':
      // Cultural category - diversity, traditions, culture
      return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop';
    
    case 'sports':
      // Sports category - athletics, sports, fitness
      return 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=300&fit=crop';
    
    case 'tech':
    case 'technology':
      // Tech category - technology, coding, innovation
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop';
    
    default:
      // Default image - generic club/community
      return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop';
  }
};

export const getClubCategoryIcon = (category: string): string => {
  const normalizedCategory = category.toLowerCase().trim();
  
  switch (normalizedCategory) {
    case 'arts':
      return 'brush';
    case 'cultural':
      return 'people';
    case 'sports':
      return 'basketball';
    case 'tech':
    case 'technology':
      return 'code-slash';
    default:
      return 'business';
  }
};
