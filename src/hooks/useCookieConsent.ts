import { useState, useEffect, useCallback } from 'react';

export type CookieConsentStatus = 'accepted' | 'rejected' | 'essential-only' | null;

export const useCookieConsent = () => {
  const [consentStatus, setConsentStatus] = useState<CookieConsentStatus>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load consent status from cookies and localStorage
  useEffect(() => {
    const loadConsentStatus = () => {
      try {
        // Check if we're in development or if cookies are supported
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const cookiesSupported = navigator.cookieEnabled;

        if (cookiesSupported && !isDevelopment) {
          console.log('🍪 Production mode: Using cookies for consent storage');
          // Production environment - use cookies primarily
          const cookies = document.cookie.split(';');
          const consentCookie = cookies.find(cookie => cookie.trim().startsWith('cookie-consent='));

          if (consentCookie) {
            const consentValue = consentCookie.split('=')[1] as CookieConsentStatus;
            console.log('✅ Found consent cookie:', consentValue);
            setConsentStatus(consentValue);
            // Also store in localStorage as backup
            localStorage.setItem('cookie-consent', consentValue);
          } else {
            console.log('⚠️ No consent cookie found, checking localStorage');
            // Fallback to localStorage if no cookie found
            const storedConsent = localStorage.getItem('cookie-consent') as CookieConsentStatus;
            if (storedConsent) {
              console.log('✅ Found consent in localStorage:', storedConsent);
              setConsentStatus(storedConsent);
              // Store back to cookie for consistency
              setCookieConsent(storedConsent);
            } else {
              console.log('❌ No consent found anywhere - defaulting to essential-only for better UX');
              // Default to essential-only to allow basic functionality like favorites
              const defaultConsent: CookieConsentStatus = 'essential-only';
              setConsentStatus(defaultConsent);
              setCookieConsent(defaultConsent);
              localStorage.setItem('cookie-consent', defaultConsent);
            }
          }
        } else {
          console.log('🧪 Development mode: Using localStorage only');
          // Development or cookies not supported - use localStorage only
          const storedConsent = localStorage.getItem('cookie-consent') as CookieConsentStatus;
          console.log('📱 localStorage consent:', storedConsent);

          if (storedConsent) {
            setConsentStatus(storedConsent);
          } else {
            console.log('❌ No consent in development - defaulting to essential-only');
            // Default to essential-only in development too
            const defaultConsent: CookieConsentStatus = 'essential-only';
            setConsentStatus(defaultConsent);
            localStorage.setItem('cookie-consent', defaultConsent);
          }
        }
      } catch (error) {
        console.error('Error loading consent status:', error);
        // Fallback to localStorage only
        try {
          const storedConsent = localStorage.getItem('cookie-consent') as CookieConsentStatus;
          setConsentStatus(storedConsent);
        } catch (localStorageError) {
          console.error('Error loading from localStorage:', localStorageError);
        }
      }
      setIsLoading(false);
    };

    loadConsentStatus();
  }, [setCookieConsent]);

  // Helper function to set cookie
  const setCookieConsent = useCallback((value: CookieConsentStatus) => {
    // Skip cookie setting in development
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDevelopment) return;

    try {
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1); // 1 year expiry

      let cookieValue = `cookie-consent=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

      // Add Secure flag if on HTTPS
      if (window.location.protocol === 'https:') {
        cookieValue += '; Secure';
      }

      document.cookie = cookieValue;
      console.log('✅ Cookie consent set:', value);
    } catch (error) {
      console.error('❌ Error setting cookie:', error);
    }
  }, []);

  // Accept all cookies
  const acceptAll = useCallback(() => {
    setConsentStatus('accepted');
    try {
      setCookieConsent('accepted');
      localStorage.setItem('cookie-consent', 'accepted');
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  }, [setCookieConsent]);

  // Accept only essential cookies
  const acceptEssentialOnly = useCallback(() => {
    setConsentStatus('essential-only');
    try {
      setCookieConsent('essential-only');
      localStorage.setItem('cookie-consent', 'essential-only');
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  }, [setCookieConsent]);

  // Reject all cookies
  const rejectAll = useCallback(() => {
    setConsentStatus('rejected');
    try {
      setCookieConsent('rejected');
      localStorage.setItem('cookie-consent', 'rejected');
      // Clear existing cookies if rejected
      clearCookies();
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  }, [setCookieConsent]);

  // Reset consent (for testing or user request)
  const resetConsent = useCallback(() => {
    setConsentStatus(null);
    try {
      // Clear cookie
      document.cookie = 'cookie-consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } catch (error) {
      console.error('Error clearing cookie:', error);
    }
    try {
      localStorage.removeItem('cookie-consent');
      clearCookies();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
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
  try {
    // Clear session cookies
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  } catch (error) {
    console.error('Error clearing cookies:', error);
  }

  // Clear localStorage
  try {
    localStorage.removeItem('coffee-session-id');
    localStorage.removeItem('cookie-consent');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};
