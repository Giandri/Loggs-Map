import { useState, useEffect, useCallback } from 'react';

export type CookieConsentStatus = 'accepted' | 'rejected' | 'essential-only' | null;

export const useCookieConsent = () => {
  const [consentStatus, setConsentStatus] = useState<CookieConsentStatus>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load consent status from localStorage
  useEffect(() => {
    const storedConsent = localStorage.getItem('cookie-consent') as CookieConsentStatus;
    setConsentStatus(storedConsent);
    setIsLoading(false);
  }, []);

  // Accept all cookies
  const acceptAll = useCallback(() => {
    setConsentStatus('accepted');
    localStorage.setItem('cookie-consent', 'accepted');
  }, []);

  // Accept only essential cookies
  const acceptEssentialOnly = useCallback(() => {
    setConsentStatus('essential-only');
    localStorage.setItem('cookie-consent', 'essential-only');
  }, []);

  // Reject all cookies
  const rejectAll = useCallback(() => {
    setConsentStatus('rejected');
    localStorage.setItem('cookie-consent', 'rejected');
    // Clear existing cookies if rejected
    clearCookies();
  }, []);

  // Reset consent (for testing or user request)
  const resetConsent = useCallback(() => {
    setConsentStatus(null);
    localStorage.removeItem('cookie-consent');
    clearCookies();
  }, []);

  // Check if functional cookies are allowed
  const canUseFunctionalCookies = consentStatus === 'accepted';

  // Check if essential cookies are allowed
  const canUseEssentialCookies = consentStatus === 'accepted' || consentStatus === 'essential-only';

  return {
    consentStatus,
    isLoading,
    acceptAll,
    acceptEssentialOnly,
    rejectAll,
    resetConsent,
    canUseFunctionalCookies,
    canUseEssentialCookies,
  };
};

// Helper function to clear cookies
const clearCookies = () => {
  // Clear session cookies
  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    const cookieName = cookie.split('=')[0].trim();
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });

  // Clear localStorage
  localStorage.removeItem('coffee-session-id');
};
