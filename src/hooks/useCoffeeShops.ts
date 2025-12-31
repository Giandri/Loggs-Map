import { useState, useEffect } from "react";

interface CoffeeShop {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  whatsapp?: string;
  instagram?: string;
  facilities: any[];
  photos: any[];
  logo?: string;
  wfc: boolean;
  openTime?: string;
  closeTime?: string;
  operatingDays?: string;
  priceRange?: string;
  serviceTax?: string;
  connectionSpeed?: string;
  mushola?: boolean;
  parking?: string[];
  paymentMethods?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const useCoffeeShops = () => {
  const [coffeeShops, setCoffeeShops] = useState<CoffeeShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoffeeShops = async () => {
    try {
      setError(null);
      const response = await fetch("/api/coffee-shops");

      if (response.ok) {
        const data = await response.json();
        setCoffeeShops(data);
      } else {
        console.error("Failed to fetch coffee shops from API");
        setCoffeeShops([]);
        setError("Failed to fetch coffee shops");
      }
    } catch (err) {
      console.error("Error fetching coffee shops:", err);
      setError("Failed to fetch coffee shops");
      setCoffeeShops([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshCoffeeShops = async () => {
    await fetchCoffeeShops();
  };

  useEffect(() => {
    fetchCoffeeShops();
  }, []);

  return {
    coffeeShops,
    loading,
    error,
    refreshCoffeeShops,
  };
};
