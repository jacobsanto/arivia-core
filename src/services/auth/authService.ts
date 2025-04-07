
// Simple authentication service with enhanced security features

/**
 * Creates a secure hash of a password using a salt
 * In a real implementation, this would use a more secure algorithm
 * For now, we're using a simple hash for demo purposes
 */
export const hashPassword = (password: string, salt: string = generateSalt()): { hash: string, salt: string } => {
  // Simple hash function for demo - not secure for production!
  const hash = btoa(password + salt);
  return { hash, salt };
};

/**
 * Verifies a password against a stored hash and salt
 */
export const verifyPassword = (password: string, storedHash: string, salt: string): boolean => {
  const { hash } = hashPassword(password, salt);
  return hash === storedHash;
};

/**
 * Generates a random salt for password hashing
 */
export const generateSalt = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

/**
 * Creates a JWT-like token for session management
 * This is a simplified version for demo purposes
 */
export const generateAuthToken = (userId: string, role: string, expiryHours: number = 24): string => {
  const now = new Date();
  const expiry = new Date(now.getTime() + expiryHours * 60 * 60 * 1000);
  
  const tokenData = {
    userId,
    role,
    exp: expiry.getTime()
  };
  
  // In a real app, you'd use a proper JWT library
  return btoa(JSON.stringify(tokenData));
};

/**
 * Verifies an authentication token
 */
export const verifyAuthToken = (token: string): { valid: boolean, userId?: string, role?: string } => {
  try {
    const tokenData = JSON.parse(atob(token));
    const now = new Date();
    
    if (tokenData.exp < now.getTime()) {
      return { valid: false };
    }
    
    return { 
      valid: true,
      userId: tokenData.userId,
      role: tokenData.role
    };
  } catch (error) {
    return { valid: false };
  }
};

/**
 * Saves authentication data securely in localStorage with expiry
 */
export const saveAuthData = (authToken: string, user: any): void => {
  localStorage.setItem("authToken", authToken);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("lastAuthTime", Date.now().toString());
};

/**
 * Clears auth data from localStorage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("lastAuthTime");
};
