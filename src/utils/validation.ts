export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }
    return { valid: true };
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
