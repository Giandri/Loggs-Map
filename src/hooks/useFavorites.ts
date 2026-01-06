import { useState, useEffect, useCallback } from "react";
import { useCookieConsent } from "./useCookieConsent";

// Generate a simple session/user ID using cookies
// Falls back to localStorage if cookies are not available
const getUserId = () => {
  // First try to get from cookies
  const cookies = document.cookie.split(";");
  const sessionCookie = cookies.find((cookie) => cookie.trim().startsWith("coffee-session-id="));

  if (sessionCookie) {
    const userId = sessionCookie.split("=")[1];
    console.log("✅ Cookie found:", userId);
    return userId;
  }

  // Generate new session ID
  const newUserId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log("🆕 Generating new session ID:", newUserId);

  // Set cookie that expires in 30 days
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  // Build cookie string with proper attributes
  let cookieValue = `coffee-session-id=${newUserId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; max-age=2592000`;

  // Add Secure flag for HTTPS (production)
  if (window.location.protocol === "https:") {
    cookieValue += "; Secure";
  }

  document.cookie = cookieValue;

  // Verify cookie was set immediately
  const verifyCookie = document.cookie.split(";").find((cookie) => cookie.trim().startsWith("coffee-session-id="));

  if (verifyCookie) {
    const verifiedUserId = verifyCookie.split("=")[1];
    console.log("✅ Cookie successfully set:", verifiedUserId);
  } else {
    console.error("❌ Failed to set cookie! Cookie string:", cookieValue);
    console.log("Current cookies:", document.cookie);
  }

  // Also store in localStorage as backup
  localStorage.setItem("coffee-session-id", newUserId);

  return newUserId;
};

// Debug function to check cookie status
const debugCookies = () => {
  console.log("🍪 Cookie Debug Info:");
  console.log("All cookies:", document.cookie);
  console.log("Protocol:", window.location.protocol);

  const cookies = document.cookie.split(";");
  const coffeeCookie = cookies.find((cookie) => cookie.trim().startsWith("coffee-session-id="));

  if (coffeeCookie) {
    const [name, value] = coffeeCookie.split("=");
    console.log("✅ Coffee cookie found:", { name: name.trim(), value });
  } else {
    console.log("❌ No coffee cookie found");
  }

  const localStorageId = localStorage.getItem("coffee-session-id");
  console.log("💾 localStorage backup:", localStorageId);

  return {
    hasCookie: !!coffeeCookie,
    hasLocalStorage: !!localStorageId,
    cookieValue: coffeeCookie?.split("=")[1],
    localStorageValue: localStorageId,
  };
};

// Make debug function available globally for testing
if (typeof window !== "undefined") {
  (window as any).debugCookies = debugCookies;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cookie consent management
  const { canUseFunctionalCookies, canUseEssentialCookies } = useCookieConsent();

  // Initialize session ID on first use (only if cookies are allowed)
  useEffect(() => {
    if (canUseEssentialCookies) {
      console.log("🔄 Initializing session ID...");
      const userId = getUserId();
      console.log("📋 Session ID:", userId);
      debugCookies();
    } else {
      console.log("🚫 Cookies not allowed, using localStorage only");
    }
  }, [canUseEssentialCookies]);

  // Load favorites from API or localStorage based on consent
  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If cookies are not allowed, use localStorage only
      if (!canUseEssentialCookies) {
        const localFavorites = localStorage.getItem("coffee-shop-favorites");
        if (localFavorites) {
          try {
            setFavorites(JSON.parse(localFavorites));
          } catch (parseError) {
            console.error("Error parsing local favorites:", parseError);
            setFavorites([]);
          }
        }
        return;
      }

      // Use API if cookies are allowed
      const response = await fetch("/api/favorites");

      // Always try to parse response, but handle errors gracefully
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, create a generic error object
        data = { error: "Invalid response from server" };
      }

      if (!response.ok) {
        // If session not found, create new session and return empty favorites
        if (response.status === 401 && data.error?.includes("Session not found")) {
          getUserId(); // This will create a new cookie
          // Return empty favorites for new session
          setFavorites([]);
          return;
        }

        throw new Error(data.error || "Failed to load favorites");
      }

      setFavorites(data.favorites || []);
    } catch (err: any) {
      console.error("Error loading favorites:", err);
      setError(err.message);
      // Fallback to localStorage if API fails
      const localFavorites = localStorage.getItem("coffee-shop-favorites");
      if (localFavorites) {
        try {
          setFavorites(JSON.parse(localFavorites));
        } catch (parseError) {
          console.error("Error parsing local favorites:", parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [canUseEssentialCookies]);

  // Add favorite
  const addFavorite = useCallback(
    async (coffeeShopId: string) => {
      console.log("🆕 Adding favorite:", coffeeShopId);
      console.log("🍪 Can use essential cookies:", canUseEssentialCookies);

      try {
        setLoading(true);
        setError(null);

        // Check if we can use cookies for this operation
        if (!canUseEssentialCookies) {
          console.log("💾 Using localStorage (cookies not allowed)");
          // If cookies not allowed, just use localStorage
          const localFavorites = JSON.parse(localStorage.getItem("coffee-shop-favorites") || "[]");
          if (!localFavorites.includes(coffeeShopId)) {
            localFavorites.push(coffeeShopId);
            localStorage.setItem("coffee-shop-favorites", JSON.stringify(localFavorites));
            setFavorites(localFavorites);
            console.log("✅ Favorite added to localStorage:", localFavorites);
          } else {
            console.log("⚠️ Favorite already exists in localStorage");
          }
          return true;
        }

        console.log("🌐 Using API (cookies allowed)");

        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coffeeShopId,
          }),
        });

        console.log("📡 Response status:", response.status);

        // Always try to parse response, but handle errors gracefully
        let data;
        try {
          data = await response.json();
          console.log("📡 Response data:", data);
        } catch (parseError) {
          console.error("❌ Failed to parse response:", parseError);
          data = { error: "Invalid response from server" };
        }

        if (!response.ok) {
          console.error("❌ API error:", response.status, data.error);
          // If session not found, create new session
          if (response.status === 401 && data.error?.includes("Session not found")) {
            console.log("🔄 Session not found, creating new session");
            getUserId(); // Create new cookie
            setError("Session expired. Please refresh the page.");
            return false;
          }

          throw new Error(data.error || "Failed to add favorite");
        }

        console.log("✅ Favorite added to database successfully");
        // Update local state
        setFavorites((prev) => [...prev, coffeeShopId]);
        return true;
      } catch (err: any) {
        console.error("Error adding favorite:", err);
        setError(err.message);

        // Fallback to localStorage on API failure
        try {
          const localFavorites = JSON.parse(localStorage.getItem("coffee-shop-favorites") || "[]");
          if (!localFavorites.includes(coffeeShopId)) {
            localFavorites.push(coffeeShopId);
            localStorage.setItem("coffee-shop-favorites", JSON.stringify(localFavorites));
            setFavorites(localFavorites);
          }
          return true;
        } catch (localError) {
          console.error("LocalStorage fallback failed:", localError);
          return false;
        }
      } finally {
        setLoading(false);
      }
    },
    [canUseEssentialCookies]
  );

  // Remove favorite
  const removeFavorite = useCallback(
    async (coffeeShopId: string) => {
      try {
        setLoading(true);
        setError(null);

        // Check if we can use cookies for this operation
        if (!canUseEssentialCookies) {
          // If cookies not allowed, just use localStorage
          const localFavorites = JSON.parse(localStorage.getItem("coffee-shop-favorites") || "[]");
          const updatedFavorites = localFavorites.filter((id: string) => id !== coffeeShopId);
          localStorage.setItem("coffee-shop-favorites", JSON.stringify(updatedFavorites));
          setFavorites(updatedFavorites);
          return true;
        }

        const response = await fetch(`/api/favorites?coffeeShopId=${coffeeShopId}`, {
          method: "DELETE",
        });

        // Always try to parse response, but handle errors gracefully
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          data = { error: "Invalid response from server" };
        }

        if (!response.ok) {
          // If session not found, create new session
          if (response.status === 401 && data.error?.includes("Session not found")) {
            getUserId(); // Create new cookie
            setError("Session expired. Please refresh the page.");
            return false;
          }

          throw new Error(data.error || "Failed to remove favorite");
        }

        // Update local state
        setFavorites((prev) => prev.filter((id: string) => id !== coffeeShopId));
        return true;
      } catch (err: any) {
        console.error("Error removing favorite:", err);
        setError(err.message);

        // Fallback to localStorage on API failure
        try {
          const localFavorites = JSON.parse(localStorage.getItem("coffee-shop-favorites") || "[]");
          const updatedFavorites = localFavorites.filter((id: string) => id !== coffeeShopId);
          localStorage.setItem("coffee-shop-favorites", JSON.stringify(updatedFavorites));
          setFavorites(updatedFavorites);
          return true;
        } catch (localError) {
          console.error("LocalStorage fallback failed:", localError);
          return false;
        }
      } finally {
        setLoading(false);
      }
    },
    [canUseEssentialCookies]
  );

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (coffeeShopId: string) => {
      const isFavorited = favorites.includes(coffeeShopId);
      if (isFavorited) {
        return await removeFavorite(coffeeShopId);
      } else {
        return await addFavorite(coffeeShopId);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  // Check if coffee shop is favorited
  const isFavorited = useCallback(
    (coffeeShopId: string) => {
      return favorites.includes(coffeeShopId);
    },
    [favorites]
  );

  // Load favorites on mount and when consent changes
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    loading,
    error,
    toggleFavorite,
    isFavorited,
    refreshFavorites: loadFavorites,
    debugCookies, // For debugging purposes
    debugFavorites: () => ({
      favorites,
      loading,
      error,
      canUseEssentialCookies,
      canUseFunctionalCookies,
      localStorage: localStorage.getItem("coffee-shop-favorites"),
    }),
  };
};
