export const COLORS = {
  primary: '#2196F3',
  primaryLight: '#E0E7FF',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray800: '#1F2937',
};

export interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
  image: string;
}

export const PRODUCTS: Product[] = [
  {
    id: '3',
    name: 'Laptop Dell XPS 13',
    unit: 'Chiếc',
    price: 25000000,
    image: '💻',
  },
  {
    id: '4',
    name: 'iPhone 15 Pro Max',
    unit: 'Chiếc',
    price: 35000000,
    image: '📱',
  },
  {
    id: '5',
    name: 'Samsung Galaxy S24',
    unit: 'Chiếc',
    price: 22000000,
    image: '📱',
  },
  {
    id: '6',
    name: 'iPad Air M2',
    unit: 'Chiếc',
    price: 18000000,
    image: '📱',
  },
];

export const formatPrice = (price: number) => {
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1) + 'M';
  }
  if (price >= 1000) {
    return (price / 1000).toFixed(0) + 'K';
  }
  return price.toString();
};
