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
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] px-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Something went wrong
          </h1>
          <p className="mt-4 max-w-md text-sm text-neutral-400">
            An unexpected error occurred. Try again, or head back to the homepage.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-neutral-600">Ref: {error.digest}</p>
          )}
          <div className="mt-8 flex gap-3">
            <button
              onClick={reset}
              className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-opacity hover:opacity-90"
            >
              Try again
            </button>
            <a
              href="/"
              className="rounded-full border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-800"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
