'use client';

import dynamic from 'next/dynamic';


const CoffeeShopMap = dynamic(
  () => import('@/components/CoffeeShopMap'),
  {
    ssr: false,
    loading: () => null
  }
);

export default function Home() {
  return <CoffeeShopMap />;
}
