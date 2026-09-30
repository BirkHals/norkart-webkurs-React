import type { Bygning } from './api/getBygningAtPunkt';

export const buildingCategories = {
  home: { label: 'Bolig', color: '#ec4899', icon: 'home' },
  shop: { label: 'Butikk', color: '#0284c7', icon: 'shop' },
  church: { label: 'Kirke', color: '#9333ea', icon: 'church' },
  school: { label: 'Skole / universitet', color: '#eab308', icon: 'school' },
  other: { label: 'Annen / ukjent type', color: '#64748b', icon: 'other' },
} as const;

export function getBuildingCategory(building?: Bygning | null) {
  const type =
    building?.MatrikkelData?.Bygningstype?.toLocaleLowerCase('nb') ?? '';
  // Classify the registered building use, never ownership or an unknown type as housing.
  if (/kirke|kapell|kyrkje/.test(type)) return buildingCategories.church;
  if (/skole|skule|universitet|univ\.|høgsk|høysk/.test(type))
    return buildingCategories.school;
  if (/butikk|forretning|kjøpesenter|varehus/.test(type))
    return buildingCategories.shop;
  if (/bolig|bustad|enebolig|småhus|rekkehus|terrassehus|våningshus/.test(type))
    return buildingCategories.home;
  return buildingCategories.other;
}
