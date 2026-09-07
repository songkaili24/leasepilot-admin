import type { Contact, LeaseStatus } from '../types';

/**
 * Property-manager roster shared by the lease builder, documents, and notes.
 */
export const pmContacts: Record<string, Contact> = {
  okafor: { name: 'Dana Okafor', phone: '+1 (312) 555-0147', email: 'd.okafor@leasevault.com' },
  whitfield: {
    name: 'Sara Whitfield',
    phone: '+1 (312) 555-0129',
    email: 's.whitfield@leasevault.com',
  },
  tanaka: { name: 'Mio Tanaka', phone: '+1 (847) 555-0118', email: 'm.tanaka@leasevault.com' },
  gutierrez: {
    name: 'Rafael Gutierrez',
    phone: '+1 (414) 555-0163',
    email: 'r.gutierrez@leasevault.com',
  },
};

export const pmNames = Object.values(pmContacts).map((c) => c.name);

export interface LeaseSpec {
  tenant: string;
  leaseNumber: string;
  propertyId: string;
  suite: string;
  rentableSf: number;
  /** Annual base rent per square foot at commencement. */
  annualRatePerSf: number;
  status: LeaseStatus;
  /** Months before today the term commenced. */
  commencedMonthsAgo: number;
  /** Either a fixed term in months (from commencement) or an explicit expiry offset in days. */
  termMonths?: number;
  expiresInDays?: number;
  annualEscalationPct: number;
  depositMonths: number;
  permittedUse: string;
  /** Renewal options keyed by days from today until the notice deadline. */
  options?: Array<{ noticeInDays: number; termYears: number }>;
  pm: keyof typeof pmContacts;
}

/**
 * The fifteen lease abstracts of the working portfolio, hand-specified.
 * Dates are offsets relative to today so the demo stays evergreen.
 */
export const leaseSpecs: LeaseSpec[] = [
  // — Meridian Plaza (Office): law firms, financial, tech —
  {
    tenant: 'Halloran & Mercer LLP',
    leaseNumber: 'LV-2021-0231',
    propertyId: 'prop-1',
    suite: '2200',
    rentableSf: 12400,
    annualRatePerSf: 42,
    status: 'Active',
    commencedMonthsAgo: 55,
    termMonths: 84,
    annualEscalationPct: 3,
    depositMonths: 2,
    permittedUse: 'Legal offices, libraries, and client conference facilities',
    options: [
      { noticeInDays: 430, termYears: 5 },
      { noticeInDays: 795, termYears: 5 },
    ],
    pm: 'okafor',
  },
  {
    tenant: 'Bramwell Capital Management',
    leaseNumber: 'LV-2023-0512',
    propertyId: 'prop-1',
    suite: '1500',
    rentableSf: 9800,
    annualRatePerSf: 46,
    status: 'Active',
    commencedMonthsAgo: 31,
    termMonths: 60,
    annualEscalationPct: 3.5,
    depositMonths: 2,
    permittedUse: 'Investment advisory, financial services, and ancillary office uses',
    options: [{ noticeInDays: 610, termYears: 5 }],
    pm: 'whitfield',
  },
  {
    tenant: 'Sterling & Choate LLP',
    leaseNumber: 'LV-2020-0117',
    propertyId: 'prop-1',
    suite: '3100',
    rentableSf: 7600,
    annualRatePerSf: 39.5,
    status: 'Expiring',
    commencedMonthsAgo: 70,
    expiresInDays: 47,
    annualEscalationPct: 2.5,
    depositMonths: 3,
    permittedUse: 'Legal offices and client meeting facilities',
    options: [{ noticeInDays: 20, termYears: 5 }],
    pm: 'tanaka',
  },
  {
    tenant: 'Cobalt Analytics Inc.',
    leaseNumber: 'LV-2024-0688',
    propertyId: 'prop-1',
    suite: '2600',
    rentableSf: 11200,
    annualRatePerSf: 44,
    status: 'Active',
    commencedMonthsAgo: 19,
    termMonths: 60,
    annualEscalationPct: 3,
    depositMonths: 2,
    permittedUse: 'Software development, data processing, and general office use',
    options: [{ noticeInDays: 720, termYears: 5 }],
    pm: 'okafor',
  },
  {
    tenant: 'Aperture Cloudworks',
    leaseNumber: 'LV-2025-0731',
    propertyId: 'prop-1',
    suite: '1800',
    rentableSf: 8400,
    annualRatePerSf: 45,
    status: 'Active',
    commencedMonthsAgo: 13,
    termMonths: 66,
    annualEscalationPct: 3.5,
    depositMonths: 1,
    permittedUse: 'Cloud software engineering and technical support operations',
    options: [{ noticeInDays: 905, termYears: 5 }],
    pm: 'whitfield',
  },
  // — Falcon Flex Park (Flex): tech, engineering, logistics —
  {
    tenant: 'Bluewave Data Systems',
    leaseNumber: 'LV-2023-0476',
    propertyId: 'prop-2',
    suite: '100',
    rentableSf: 14500,
    annualRatePerSf: 28,
    status: 'Active',
    commencedMonthsAgo: 27,
    termMonths: 66,
    annualEscalationPct: 3,
    depositMonths: 2,
    permittedUse: 'Data hosting, network operations, and technical office',
    options: [{ noticeInDays: 480, termYears: 5 }],
    pm: 'gutierrez',
  },
  {
    tenant: 'Northgate Engineering PC',
    leaseNumber: 'LV-2022-0364',
    propertyId: 'prop-2',
    suite: '210',
    rentableSf: 9200,
    annualRatePerSf: 26.5,
    status: 'Active',
    commencedMonthsAgo: 43,
    termMonths: 60,
    annualEscalationPct: 2.5,
    depositMonths: 2,
    permittedUse: 'Engineering offices, drafting, and materials testing laboratory',
    options: [{ noticeInDays: 210, termYears: 5 }],
    pm: 'tanaka',
  },
  {
    tenant: 'Kestrel Freight Solutions',
    leaseNumber: 'LV-2021-0298',
    propertyId: 'prop-2',
    suite: '300',
    rentableSf: 18700,
    annualRatePerSf: 24,
    status: 'Expiring',
    commencedMonthsAgo: 59,
    expiresInDays: 24,
    annualEscalationPct: 2.5,
    depositMonths: 2,
    permittedUse: 'Last-mile distribution, warehouse, and ancillary office',
    options: [{ noticeInDays: 10, termYears: 5 }],
    pm: 'gutierrez',
  },
  {
    tenant: 'Vantage Robotics',
    leaseNumber: 'LV-2022-0389',
    propertyId: 'prop-2',
    suite: '140',
    rentableSf: 10800,
    annualRatePerSf: 27,
    status: 'Renewed',
    commencedMonthsAgo: 38,
    termMonths: 92,
    annualEscalationPct: 3,
    depositMonths: 2,
    permittedUse: 'Rapid prototyping, light assembly, and testing of robotic systems',
    options: [{ noticeInDays: 700, termYears: 5 }],
    pm: 'okafor',
  },
  // — Beacon Medical Pavilion (Medical Office) —
  {
    tenant: 'Redwood Health Partners',
    leaseNumber: 'LV-2022-0410',
    propertyId: 'prop-3',
    suite: '410',
    rentableSf: 6900,
    annualRatePerSf: 38,
    status: 'Active',
    commencedMonthsAgo: 40,
    termMonths: 72,
    annualEscalationPct: 3,
    depositMonths: 2,
    permittedUse: 'Primary care, specialty physician services, and phlebotomy',
    options: [{ noticeInDays: 260, termYears: 5 }],
    pm: 'tanaka',
  },
  {
    tenant: 'Dunmore Clinical Labs',
    leaseNumber: 'LV-2019-0064',
    propertyId: 'prop-3',
    suite: '320',
    rentableSf: 5200,
    annualRatePerSf: 36.5,
    status: 'Expiring',
    commencedMonthsAgo: 82,
    expiresInDays: 78,
    annualEscalationPct: 2.5,
    depositMonths: 3,
    permittedUse: 'Clinical laboratory, specimen collection, and diagnostic imaging',
    options: [{ noticeInDays: 35, termYears: 5 }],
    pm: 'whitfield',
  },
  {
    tenant: 'Lakeview Dermatology Associates',
    leaseNumber: 'LV-2025-0779',
    propertyId: 'prop-3',
    suite: '250',
    rentableSf: 4100,
    annualRatePerSf: 40,
    status: 'Active',
    commencedMonthsAgo: 10,
    termMonths: 60,
    annualEscalationPct: 4,
    depositMonths: 1,
    permittedUse: 'Dermatology practice, minor procedures, and medical spa services',
    options: [{ noticeInDays: 1210, termYears: 5 }],
    pm: 'tanaka',
  },
  // — Harborview Marketplace (Retail) —
  {
    tenant: 'Craftwork Coffee Roasters',
    leaseNumber: 'LV-2023-0544',
    propertyId: 'prop-4',
    suite: '110',
    rentableSf: 3400,
    annualRatePerSf: 34,
    status: 'Active',
    commencedMonthsAgo: 26,
    termMonths: 72,
    annualEscalationPct: 3,
    depositMonths: 2,
    permittedUse: 'Cafe, coffee roasting, and retail sale of packaged beans and brew equipment',
    options: [{ noticeInDays: 830, termYears: 5 }],
    pm: 'gutierrez',
  },
  {
    tenant: 'Juniper & Fern Home Goods',
    leaseNumber: 'LV-2021-0205',
    propertyId: 'prop-4',
    suite: '200',
    rentableSf: 7800,
    annualRatePerSf: 30,
    status: 'Renewed',
    commencedMonthsAgo: 47,
    termMonths: 93,
    annualEscalationPct: 3,
    depositMonths: 2,
    permittedUse: 'Retail sale of home furnishings, decor, and accessories',
    options: [{ noticeInDays: 550, termYears: 5 }],
    pm: 'okafor',
  },
  {
    tenant: 'Harbor Booksellers',
    leaseNumber: 'LV-2019-0088',
    propertyId: 'prop-4',
    suite: '150',
    rentableSf: 5600,
    annualRatePerSf: 28,
    status: 'Terminated',
    commencedMonthsAgo: 64,
    expiresInDays: -20,
    annualEscalationPct: 0,
    depositMonths: 2,
    permittedUse: 'Retail bookstore and adjacent cafe counter',
    options: [],
    pm: 'gutierrez',
  },
];
