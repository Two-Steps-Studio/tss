import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ShopItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: 'skin' | 'emblem' | 'theme' | 'other';
  rating: number;
  stock: number;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Pobieranie przykładowych produktów
    const mockProducts: ShopItem[] = [
      {
        id: 'skin-001',
        name: 'Najlepsza skórka',
        price: 500,
        description: 'Premium skin dla Twojego konta',
        image: '/assets/shop/skin1.png',
        category: 'skin',
        rating: 4.9,
        stock: 999,
      },
      {
        id: 'emblem-001',
        name: 'Emblem Hero',
        price: 200,
        description: 'Wyjątkowy emblem dla twojego profilu',
        image: '/assets/shop/emblem1.png',
        category: 'emblem',
        rating: 4.7,
        stock: 500,
      },
      {
        id: 'theme-001',
        name: 'Motyw Cyberpunk',
        price: 300,
        description: 'Niepowtarzalny motyw do interfejsu',
        image: '/assets/shop/theme1.png',
        category: 'theme',
        rating: 4.8,
        stock: 100,
      },
    ];

    return NextResponse.json(mockProducts);
  } catch (err: any) {
    console.error('Shop API error:', err);
    return NextResponse.json([], { status: 500 });
  }
}
