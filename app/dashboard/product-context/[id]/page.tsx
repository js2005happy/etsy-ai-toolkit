import ProductContextWorkspace from '@/components/dashboard/product-context-workspace'

export default async function ProductContextPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  return <ProductContextWorkspace listingId={params.id} />
}
