/**
 * Validation utility functions
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");
  // Check if it has 10-15 digits (international format)
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

export const formatPhone = (phone: string): string => {
  // Remove all non-digit characters except +
  return phone.replace(/[^\d+]/g, "");
};

export const getEmailError = (email: string): string => {
  if (!email) return "Email is required";
  if (!validateEmail(email)) return "Please enter a valid email address";
  return "";
};

export const getPhoneError = (phone: string): string => {
  if (!phone) return "Phone number is required";
  if (!validatePhone(phone)) return "Please enter a valid phone number (10-15 digits)";
  return "";
};
