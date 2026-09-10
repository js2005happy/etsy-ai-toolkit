import ListingObservationPanel from '@/components/dashboard/listing-observation-panel'
import ListingWorkspace from '@/components/dashboard/listing-workspace'

export default async function ListingWorkspacePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  return (
    <>
      <ListingWorkspace listingId={params.id} />
      <ListingObservationPanel listingId={params.id} />
    </>
  )
}
