import Navbar from '@/components/shared/navbar'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold text-center">
          Etsy Seller AI Toolkit
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Empowering Etsy sellers with the power of AI.
        </p>
      </main>
    </div>
  )
}
