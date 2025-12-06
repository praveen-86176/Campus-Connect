/**
 * Normalizes email by trimming and converting to lowercase
 */
export const normalizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
};

/**
 * Validates email format with stricter regex
 */
export const validateEmail = (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    
    const trimmed = email.trim();
    if (trimmed.length === 0) return false;
    
    // More comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(trimmed);
};

/**
 * Validates name - must be at least 2 characters and contain only letters and spaces
 */
export const validateName = (name: string): boolean => {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    if (trimmed.length < 2) return false;
    
    // Allow letters, spaces, hyphens, and apostrophes for names
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    return nameRegex.test(trimmed);
};

/**
 * Validates password strength with comprehensive requirements
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password is required' };
    }
    
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters long' };
    }
    
    if (password.length > 128) {
        return { valid: false, message: 'Password must be less than 128 characters' };
    }
    
    // Check for at least one letter
    if (!/[a-zA-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one letter' };
    }
    
    // Optional: Check for at least one number (for stronger passwords)
    // Uncomment if you want to enforce numbers
    // if (!/[0-9]/.test(password)) {
    //     return { valid: false, message: 'Password must contain at least one number' };
    // }
    
    return { valid: true };
};

/**
 * Gets password strength rating
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (!password || password.length < 6) return 'weak';
    
    let strength = 0;
    
    // Length checks
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
};

export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
};

export const validateEventTitle = (title: string): boolean => {
    return title.trim().length > 0;
};

export const validateEventDate = (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
};

export const validateCapacity = (capacity: string): boolean => {
    const num = parseInt(capacity, 10);
    return !isNaN(num) && num > 0;
};

/**
 * Validates phone number - must be exactly 10 digits, numbers only
 * @param phone - Phone number string to validate
 * @returns true if phone is valid (exactly 10 digits, numbers only)
 */
export const validatePhone = (phone: string): boolean => {
    // Remove any whitespace
    const cleaned = phone.trim();
    // Check if it's exactly 10 digits and contains only numbers
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(cleaned);
};

/**
 * Formats phone number input - only allows numbers, max 10 digits
 * @param text - Input text
 * @returns Formatted phone number (only digits, max 10)
 */
export const formatPhoneInput = (text: string): string => {
    // Remove all non-numeric characters
    const numbersOnly = text.replace(/[^0-9]/g, '');
    // Limit to 10 digits
    return numbersOnly.slice(0, 10);
};

/**
 * Converts Firebase authentication errors to user-friendly messages
 */
export const getFirebaseAuthErrorMessage = (error: any): string => {
    if (!error || !error.code) {
        return 'An unexpected error occurred. Please try again.';
    }

    const errorCode = error.code;
    const errorMessage = error.message || '';

    switch (errorCode) {
        // Sign in errors
        case 'auth/user-not-found':
            return 'No account found with this email address. Please check your email or sign up.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again or reset your password.';
        case 'auth/invalid-email':
            return 'Invalid email address. Please enter a valid email.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later or reset your password.';
        
        // Sign up errors
        case 'auth/email-already-in-use':
            return 'An account with this email already exists. Please sign in instead.';
        case 'auth/invalid-email':
            return 'Invalid email address. Please enter a valid email.';
        case 'auth/operation-not-allowed':
            return 'Email/password accounts are not enabled. Please contact support.';
        case 'auth/weak-password':
            return 'Password is too weak. Please choose a stronger password.';
        
        // General errors
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection and try again.';
        case 'auth/internal-error':
            return 'An internal error occurred. Please try again later.';
        case 'auth/invalid-credential':
            return 'Invalid email or password. Please check your credentials and try again.';
        
        default:
            // Return Firebase error message if it's user-friendly, otherwise generic message
            if (errorMessage.includes('email') || errorMessage.includes('password')) {
                return errorMessage;
            }
            return 'Authentication failed. Please check your credentials and try again.';
    }
};
