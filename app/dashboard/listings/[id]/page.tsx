import ListingWorkspace from '@/components/dashboard/listing-workspace'

export default async function ListingWorkspacePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <ListingWorkspace listingId={params.id} />
}
