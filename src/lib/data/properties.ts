import type { Portfolio, Property } from '../types';

export const portfolios: Portfolio[] = [
  { id: 'p-1', name: 'Meridian Office Trust', code: 'MOT', propertyCount: 14 },
  { id: 'p-2', name: 'Gateway Industrial Partners', code: 'GIP', propertyCount: 9 },
  { id: 'p-3', name: 'Harborview Retail REIT', code: 'HRR', propertyCount: 11 },
];

interface PropertySpec {
  name: string;
  address: string;
  city: string;
  state: string;
  type: Property['type'];
  gfa: number;
}

const propertySpecs: Record<string, PropertySpec[]> = {
  'p-1': [
    {
      name: 'Meridian Tower',
      address: '1200 Meridian Ave',
      city: 'Chicago',
      state: 'IL',
      type: 'Office',
      gfa: 482000,
    },
    {
      name: 'The Wexford Building',
      address: '77 W Wacker Dr',
      city: 'Chicago',
      state: 'IL',
      type: 'Office',
      gfa: 318000,
    },
    {
      name: 'Candlewood Plaza',
      address: '4400 Candlewood Ct',
      city: 'Naperville',
      state: 'IL',
      type: 'Office',
      gfa: 96400,
    },
    {
      name: 'Beacon Medical Pavilion',
      address: '610 Beacon Pkwy',
      city: 'Evanston',
      state: 'IL',
      type: 'Medical Office',
      gfa: 74200,
    },
  ],
  'p-2': [
    {
      name: 'Gateway Logistics Center',
      address: '8500 Gateway Blvd',
      city: 'Joliet',
      state: 'IL',
      type: 'Industrial',
      gfa: 612000,
    },
    {
      name: 'Prairie Point Distribution',
      address: '2100 Prairie Point Dr',
      city: 'Romeoville',
      state: 'IL',
      type: 'Industrial',
      gfa: 448000,
    },
    {
      name: 'Falcon Flex Park',
      address: '500 Falcon Way',
      city: 'Aurora',
      state: 'IL',
      type: 'Flex',
      gfa: 156000,
    },
    {
      name: 'Clearline Data Campus',
      address: '9 Clearline Rd',
      city: 'Elk Grove Village',
      state: 'IL',
      type: 'Data Center',
      gfa: 88000,
    },
  ],
  'p-3': [
    {
      name: 'Harborview Marketplace',
      address: '300 Harborview Dr',
      city: 'Milwaukee',
      state: 'WI',
      type: 'Retail',
      gfa: 265000,
    },
    {
      name: 'Summit Crossing',
      address: '1450 Summit Crossing',
      city: 'Madison',
      state: 'WI',
      type: 'Retail',
      gfa: 187000,
    },
    {
      name: 'Lakeshore Commons',
      address: '72 Lakeshore Blvd',
      city: 'Racine',
      state: 'WI',
      type: 'Retail',
      gfa: 121000,
    },
  ],
};

export const properties: Property[] = Object.entries(propertySpecs).flatMap(
  ([portfolioId, specs]) =>
    specs.map((spec, index) => ({
      id: `${portfolioId}-prop-${index + 1}`,
      portfolioId,
      name: spec.name,
      address: spec.address,
      city: spec.city,
      state: spec.state,
      type: spec.type,
      grossFloorAreaSf: spec.gfa,
      postalCode: String(60000 + Math.floor(index * 137) + specs.length * 11).padStart(5, '0'),
    })),
);

export function portfolioName(id: string): string {
  return portfolios.find((p) => p.id === id)?.name ?? 'Unassigned';
}

export function propertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}
