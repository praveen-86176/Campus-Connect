// Email validation
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }
    return { valid: true };
};

// Name validation
export const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
};

// Check if passwords match
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
};
