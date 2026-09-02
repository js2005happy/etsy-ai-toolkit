import Navbar from '@/components/shared/navbar'
import ReferralApply from '@/components/shared/referral-apply'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <ReferralApply />
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
