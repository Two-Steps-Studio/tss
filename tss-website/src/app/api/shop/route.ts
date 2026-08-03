import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// XSS sanitization
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>\"'`]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

const searchSchema = z.object({
  q: z.string().max(100).transform(sanitizeInput),
  category: z.enum([
    'bg', 'frame', 'style', 'theme', 'skin', 'emblem', 'other'
  ]).optional(),
});

interface ShopItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: 'bg' | 'frame' | 'style' | 'theme' | 'skin' | 'emblem' | 'other';
  rating: number;
  stock: number;
  background?: string;
  frame?: string;
  style?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category') as
      | 'bg'
      | 'frame'
      | 'style'
      | 'theme'
      | 'skin'
      | 'emblem'
      | 'other';

    const supabase = await createClient();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login to view shop.' },
        { status: 401 }
      );
    }

    // Walidacja inputu
    const params = searchSchema.parse({ q, category });
    const searchQuery = sanitizeInput(params.q);

    // Pobieranie przykładowych produktów
    const mockProducts: ShopItem[] = [
      // ── BG ──
      {
        id: 'bg-001',
        name: 'Tło Neon',
        price: 150,
        description: 'Jaskrawe tło z efektami neonowymi',
        image: '/assets/shop/bg-neon.png',
        category: 'bg',
        rating: 4.8,
        stock: 200,
        background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
        frame: 'glow',
        style: 'cyberpunk',
      },
      {
        id: 'bg-002',
        name: 'Tło Dark',
        price: 120,
        description: 'Ciemne tło z subtelnymi akcentami',
        image: '/assets/shop/bg-dark.png',
        category: 'bg',
        rating: 4.6,
        stock: 200,
        background: '#1a1a2e',
        frame: 'minimal',
        style: 'minimalist',
      },
      // ── RAMKI ──
      {
        id: 'frame-001',
        name: 'Rama Gold',
        price: 100,
        description: 'Złota rama dla avatara',
        image: '/assets/shop/frame-gold.png',
        category: 'frame',
        rating: 4.9,
        stock: 150,
        frame: 'gold',
        style: 'elegant',
      },
      {
        id: 'frame-002',
        name: 'Rama Silver',
        price: 80,
        description: 'Srebrna rama z błyskiem',
        image: '/assets/shop/frame-silver.png',
        category: 'frame',
        rating: 4.7,
        stock: 150,
        frame: 'silver',
        style: 'classic',
      },
      // ── STYLE ──
      {
        id: 'style-001',
        name: 'Czysty UI',
        price: 90,
        description: 'Minimalistyczny styl interfejsu',
        image: '/assets/shop/style-clean.png',
        category: 'style',
        rating: 4.5,
        stock: 300,
        style: 'clean',
      },
      {
        id: 'style-002',
        name: 'Dark Mode',
        price: 110,
        description: 'Ciemny motyw z akcentami',
        image: '/assets/shop/style-dark.png',
        category: 'style',
        rating: 4.8,
        stock: 300,
        style: 'dark',
      },
      // ── MOTYWY ──
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
      {
        id: 'theme-002',
        name: 'Motyw Nature',
        price: 250,
        description: 'Motyw inspirowany naturą',
        image: '/assets/shop/theme-nature.png',
        category: 'theme',
        rating: 4.6,
        stock: 150,
      },
      // ── SKÓRKI ──
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
      // ── EMBLEMATY ──
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
    ];

    return NextResponse.json(mockProducts);
  } catch (err: any) {
    console.error('Shop API error:', err);
    return NextResponse.json([], { status: 500 });
  }
}
