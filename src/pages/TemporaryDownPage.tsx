export function TemporaryDownPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#f5f7fb] to-[#e8eef9] text-[#0e1a2b] px-4">
      <section className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Website Temporarily Down
        </h1>
        <p className="text-sm text-[#4b5b75]">
          The website is currently unavailable. Please try again later.
        </p>
        <div className="pt-2 space-y-2">
          <p className="text-sm font-medium text-[#0e1a2b]">
            For urgent issues, please contact the project owner:
          </p>
          <p className="text-lg font-semibold text-[#10233f]">
            01555251596
          </p>
        </div>
        <p className="pt-4 text-xs text-[#7b8bab] uppercase tracking-[0.2em]">
          Made By YOUSSEF
        </p>
      </section>
    </main>
  )
}

