import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const coffeeShopsData = [
  {
    id: 'logos-central-001',
    name: 'Logos Cafe Central',
    address: 'Jl. Sudirman No. 45',
    lat: -2.1286,
    lng: 106.1126,
    phone: '+62 811-1234-5678',
    whatsapp: '+62 811-1234-5678',
    hours: {
      monday: '07:00 - 22:00',
      tuesday: '07:00 - 22:00',
      wednesday: '07:00 - 22:00',
      thursday: '07:00 - 22:00',
      friday: '07:00 - 23:00',
      saturday: '08:00 - 23:00',
      sunday: '08:00 - 22:00',
      note: 'Open 24 hours during holidays'
    },
    rating: 4.8,
    reviewCount: 156,
    reviews: [
      { text: 'Kopi enak, vibe nyaman banget!', author: 'Andi', rating: 5 },
      { text: 'Latte art-nya cantik, recommended!', author: 'Sari', rating: 5 }
    ],
    facilities: ['wifi', 'outdoor', 'pet-friendly', 'parking', 'cashless', 'vegan'],
    signatureMenu: [
      { name: 'Espresso Signature', price: 'Rp 25.000' },
      { name: 'Latte Art Special', price: 'Rp 35.000' },
      { name: 'Matcha Latte', price: 'Rp 40.000' }
    ],
    photos: ['/cafe1.jpg', '/interior1.jpg', '/latte1.jpg', '/food1.jpg'],
    socialMedia: {
      instagram: '@logoscafecentral',
      website: 'https://logoscafecentral.com'
    },
    uniqueInfo: ['Free WiFi kenceng buat WFC', 'Beans dari lokal roaster', 'Live music every Friday night'],
    distance: '1.2 km',
    wfc: true
  },
  {
    id: 'logos-timur-002',
    name: 'Logos Cafe Timur',
    address: 'Jl. Yos Sudarso No. 12',
    lat: -2.1256,
    lng: 106.1226,
    phone: '+62 812-2345-6789',
    whatsapp: '+62 812-2345-6789',
    hours: {
      monday: '06:30 - 21:00',
      tuesday: '06:30 - 21:00',
      wednesday: '06:30 - 21:00',
      thursday: '06:30 - 21:00',
      friday: '06:30 - 22:00',
      saturday: '07:00 - 22:00',
      sunday: '07:00 - 21:00',
      note: 'Weekend extended hours'
    },
    rating: 4.7,
    reviewCount: 89,
    reviews: [
      { text: 'Tempatnya cozy, kopinya mantap!', author: 'Budi', rating: 5 },
      { text: 'Perfect untuk kerja remote', author: 'Maya', rating: 4 }
    ],
    facilities: ['wifi', 'outdoor', 'parking', 'cashless'],
    signatureMenu: [
      { name: 'Cold Brew Special', price: 'Rp 30.000' },
      { name: 'Avocado Toast', price: 'Rp 28.000' },
      { name: 'Smoothie Bowl', price: 'Rp 35.000' }
    ],
    photos: ['/cafe2.jpg', '/interior2.jpg', '/latte2.jpg', '/food2.jpg'],
    socialMedia: {
      instagram: '@logoscafetimur'
    },
    uniqueInfo: ['Pet-friendly zone', 'Organic local ingredients', 'Reading corner'],
    distance: '2.1 km',
    wfc: true
  },
  {
    id: 'logos-selatan-003',
    name: 'Logos Cafe Selatan',
    address: 'Jl. Ahmad Yani No. 88',
    lat: -2.1376,
    lng: 106.1156,
    phone: '+62 813-3456-7890',
    whatsapp: '+62 813-3456-7890',
    hours: {
      monday: '07:00 - 22:00',
      tuesday: '07:00 - 22:00',
      wednesday: '07:00 - 22:00',
      thursday: '07:00 - 22:00',
      friday: '07:00 - 23:00',
      saturday: '08:00 - 23:00',
      sunday: '08:00 - 22:00',
      note: 'Early breakfast from 6 AM on weekends'
    },
    rating: 4.9,
    reviewCount: 203,
    reviews: [
      { text: 'Breakfast terbaik di kota!', author: 'Rina', rating: 5 },
      { text: 'Service ramah, tempat bersih', author: 'Dedi', rating: 5 }
    ],
    facilities: ['wifi', 'outdoor', 'pet-friendly', 'parking', 'cashless', 'vegan', 'delivery'],
    signatureMenu: [
      { name: 'Breakfast Set', price: 'Rp 45.000' },
      { name: 'Pancake Special', price: 'Rp 38.000' },
      { name: 'Egg Benedict', price: 'Rp 42.000' }
    ],
    photos: ['/cafe3.jpg', '/interior3.jpg', '/latte3.jpg', '/food3.jpg'],
    socialMedia: {
      instagram: '@logoscafeselatan',
      website: 'https://logoscafeselatan.com'
    },
    uniqueInfo: ['Chef\'s special breakfast', 'Fresh baked goods daily', 'Garden seating area'],
    distance: '3.5 km',
    wfc: true
  },
  {
    id: 'logos-barat-004',
    name: 'Logos Cafe Barat',
    address: 'Jl. Jenderal Sudirman',
    lat: -2.1356,
    lng: 106.1066,
    phone: '+62 814-4567-8901',
    whatsapp: '+62 814-4567-8901',
    hours: {
      monday: '08:00 - 20:00',
      tuesday: '08:00 - 20:00',
      wednesday: '08:00 - 20:00',
      thursday: '08:00 - 20:00',
      friday: '08:00 - 21:00',
      saturday: '09:00 - 21:00',
      sunday: '09:00 - 20:00',
      note: 'Office hours focused'
    },
    rating: 4.6,
    reviewCount: 67,
    reviews: [
      { text: 'Ideal untuk meeting kantor', author: 'Tono', rating: 4 },
      { text: 'Quiet atmosphere, good coffee', author: 'Lisa', rating: 5 }
    ],
    facilities: ['wifi', 'parking', 'cashless', 'meeting-room'],
    signatureMenu: [
      { name: 'Business Lunch Set', price: 'Rp 55.000' },
      { name: 'Cappuccino', price: 'Rp 28.000' },
      { name: 'Sandwich Premium', price: 'Rp 35.000' }
    ],
    photos: ['/cafe4.jpg', '/interior4.jpg', '/latte4.jpg', '/food4.jpg'],
    socialMedia: {
      instagram: '@logoscafebarat'
    },
    uniqueInfo: ['Meeting room available', 'Business lunch specials', 'High-speed WiFi'],
    distance: '1.8 km',
    wfc: true
  },
  {
    id: 'logos-pasar-005',
    name: 'Logos Cafe Pasar',
    address: 'Kolong Pasar Ikan',
    lat: -2.1416,
    lng: 106.1256,
    phone: '+62 815-5678-9012',
    whatsapp: '+62 815-5678-9012',
    hours: {
      monday: '05:00 - 18:00',
      tuesday: '05:00 - 18:00',
      wednesday: '05:00 - 18:00',
      thursday: '05:00 - 18:00',
      friday: '05:00 - 19:00',
      saturday: '06:00 - 19:00',
      sunday: '06:00 - 18:00',
      note: 'Early morning market hours'
    },
    rating: 4.5,
    reviewCount: 124,
    reviews: [
      { text: 'Murah meriah, enak!', author: 'Pak Ahmad', rating: 4 },
      { text: 'Authentic local vibe', author: 'Nina', rating: 5 }
    ],
    facilities: ['parking', 'cashless'],
    signatureMenu: [
      { name: 'Kopi Tubruk', price: 'Rp 15.000' },
      { name: 'Nasi Kuning Special', price: 'Rp 25.000' },
      { name: 'Pisang Goreng', price: 'Rp 12.000' }
    ],
    photos: ['/cafe5.jpg', '/interior5.jpg', '/latte5.jpg', '/food5.jpg'],
    socialMedia: {
      instagram: '@logoscafepasar'
    },
    uniqueInfo: ['Traditional Indonesian menu', 'Market location charm', 'Affordable prices'],
    distance: '2.7 km',
    wfc: false
  }
]

async function main() {
  console.log('Start seeding ...')

  for (const shop of coffeeShopsData) {
    const createdShop = await prisma.coffeeShop.upsert({
      where: { id: shop.id },
      update: {},
      create: shop,
    })
    console.log(`Created coffee shop with id: ${createdShop.id}`)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
