import Navbar from '@/components/shared/navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
