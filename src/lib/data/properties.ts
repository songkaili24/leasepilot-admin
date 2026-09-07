import type { Portfolio, Property } from '../types';

export const portfolios: Portfolio[] = [
  { id: 'p-1', name: 'Meridian Office Trust', code: 'MOT', propertyCount: 2 },
  { id: 'p-2', name: 'Gateway Flex Partners', code: 'GFP', propertyCount: 1 },
  { id: 'p-3', name: 'Harborview Retail REIT', code: 'HRR', propertyCount: 1 },
];

export const properties: Property[] = [
  {
    id: 'prop-1',
    portfolioId: 'p-1',
    name: 'Meridian Plaza',
    address: '1200 Meridian Ave',
    city: 'Chicago',
    state: 'IL',
    postalCode: '60601',
    type: 'Office',
    grossFloorAreaSf: 62000,
    yearBuilt: 1987,
  },
  {
    id: 'prop-2',
    portfolioId: 'p-2',
    name: 'Falcon Flex Park',
    address: '500 Falcon Way',
    city: 'Aurora',
    state: 'IL',
    postalCode: '60505',
    type: 'Flex',
    grossFloorAreaSf: 64000,
    yearBuilt: 2004,
  },
  {
    id: 'prop-3',
    portfolioId: 'p-1',
    name: 'Beacon Medical Pavilion',
    address: '610 Beacon Pkwy',
    city: 'Evanston',
    state: 'IL',
    postalCode: '60201',
    type: 'Medical Office',
    grossFloorAreaSf: 20000,
    yearBuilt: 2011,
  },
  {
    id: 'prop-4',
    portfolioId: 'p-3',
    name: 'Harborview Marketplace',
    address: '300 Harborview Dr',
    city: 'Milwaukee',
    state: 'WI',
    postalCode: '53202',
    type: 'Retail',
    grossFloorAreaSf: 22000,
    yearBuilt: 1996,
  },
];

export function portfolioName(id: string): string {
  return portfolios.find((p) => p.id === id)?.name ?? 'Unassigned';
}

export function propertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}
