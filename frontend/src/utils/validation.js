/**
 * Validation utilities for form fields
 */

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return re.test(password);
};

export const validateFullName = (name) => {
  return name.trim().length >= 2;
};

export const validatePhone = (phone) => {
  const re = /^[\d\s\-\+\(\)]{10,}$/;
  return re.test(phone) || phone.trim() === '';
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.entries(rules).forEach(([field, validator]) => {
    const value = formData[field];
    if (typeof validator === 'function') {
      const error = validator(value);
      if (error) {
        errors[field] = error;
      }
    }
  });
  
  return errors;
};

export const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;
  
  if (strength <= 2) return { level: 'weak', color: 'red', text: 'Weak' };
  if (strength <= 4) return { level: 'medium', color: 'yellow', text: 'Medium' };
  return { level: 'strong', color: 'green', text: 'Strong' };
};
