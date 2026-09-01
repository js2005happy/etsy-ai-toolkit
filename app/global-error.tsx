'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#fbfaf8] px-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1a1714] md:text-4xl">
            Something went wrong
          </h1>
          <p className="mt-4 max-w-md text-sm text-[#6b6560]">
            An unexpected error occurred. Try again, or head back to the homepage.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-[#9a948c]">Ref: {error.digest}</p>
          )}
          <div className="mt-8 flex gap-3">
            <button
              onClick={reset}
              className="rounded-full bg-[#2f5d3f] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Try again
            </button>
            <a
              href="/"
              className="rounded-full border border-[#e9e5df] px-5 py-2.5 text-sm font-medium text-[#3f3a35] transition-colors hover:bg-[#f4f1ec]"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
