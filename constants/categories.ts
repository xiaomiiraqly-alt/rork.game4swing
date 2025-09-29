import { Category } from '@/types/game';

export const CATEGORIES: { key: Category; name: string; color: string; emoji: string }[] = [
  { key: 'знакомство', name: 'Знакомство', color: '#FFFFFF', emoji: '💫' },
  { key: 'флирт', name: 'Флирт', color: '#FFD700', emoji: '😉' },
  { key: 'прелюдия', name: 'Прелюдия', color: '#9370DB', emoji: '💜' },
  { key: 'fire', name: '🔥', color: '#FF4500', emoji: '🔥' },
];

export const getCategoryInfo = (category: Category) => {
  return CATEGORIES.find(cat => cat.key === category) || CATEGORIES[0];
};