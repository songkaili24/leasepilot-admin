import { notFound } from 'next/navigation';
import { occupancyByProperty, properties, propertyById } from '@/lib/data';
import { pageMetadata } from '@/lib/seo';
import { PropertyDetail } from './_components/PropertyDetail';

interface PropertyPageProps {
  params: { propertyId: string };
}

export function generateStaticParams() {
  return properties.map((property) => ({ propertyId: property.id }));
}

export function generateMetadata({ params }: PropertyPageProps) {
  const property = propertyById(params.propertyId);
  if (!property) {
    return pageMetadata({
      title: 'Property not found',
      description: 'This property does not exist.',
      path: '/properties',
    });
  }
  return pageMetadata({
    title: `${property.name} — ${property.city}, ${property.state}`,
    description: `Lease abstracts, occupancy, and obligations for ${property.name}, ${property.city}, ${property.state}.`,
    path: `/properties/${property.id}`,
  });
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const property = propertyById(params.propertyId);
  if (!property) notFound();
  return <PropertyDetail property={property} occupancy={occupancyByProperty(property)} />;
}
