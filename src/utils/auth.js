// utils/auth.js
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  
  // Basic check - you might want to add token expiration validation
  return !!(token && isLoggedIn === 'true');
};

// Optional: Add token validation function
export const validateToken = (token) => {
  if (!token) return false;
  
  try {
    // You can add JWT expiration check here if needed
    // const payload = JSON.parse(atob(token.split('.')[1]));
    // return payload.exp * 1000 > Date.now();
    return true;
  } catch (error) {
    return false;
  }
};