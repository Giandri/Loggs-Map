'use client';

import dynamic from 'next/dynamic';


const Maps = dynamic(
  () => import('@/components/Maps'),
  {
    ssr: false,
    loading: () => null
  }
);

export default function Home() {
  return <Maps />;
}
