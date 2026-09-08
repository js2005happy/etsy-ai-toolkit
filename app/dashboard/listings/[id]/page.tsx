import ListingWorkspace from '@/components/dashboard/listing-workspace'

export default function ListingWorkspacePage({ params }: { params: { id: string } }) {
  return <ListingWorkspace listingId={params.id} />
}
