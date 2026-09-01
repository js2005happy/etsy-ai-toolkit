import Navbar from '@/components/shared/navbar'
import ReferralApply from '@/components/shared/referral-apply'
import LanguageSwitcher from '@/components/shared/language-switcher'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <ReferralApply />
      <Navbar />
      <div className="flex justify-end px-5 pt-4">
        <LanguageSwitcher />
      </div>
      <main className="flex-1">{children}</main>
    </div>
  )
}
