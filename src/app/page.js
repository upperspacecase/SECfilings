import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="glass sticky top-0 z-50 border-b border-[var(--color-border-subtle)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              FP
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Filing<span className="text-[var(--color-accent)]">Pulse</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="btn btn-ghost text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="btn btn-primary text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Background gradient orbs */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent-glow)] border border-indigo-500/20 text-sm text-[var(--color-accent)] mb-8 fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] pulse-live" />
              Monitoring EDGAR in real time
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 fade-in">
              Form D filings.
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Minutes, not days.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed fade-in">
              Set your filters — SIC codes, geographies, offering sizes,
              people to watch. Get an email within minutes of the filing
              hitting EDGAR.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in">
              <Link href="/dashboard" className="btn btn-primary text-base px-8 py-3">
                Start Monitoring →
              </Link>
              <a href="#how-it-works" className="btn btn-secondary text-base px-8 py-3">
                How It Works
              </a>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
          <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "~2 min", label: "Alert latency" },
              { value: "50K+", label: "Form D filings/year" },
              { value: "24/7", label: "EDGAR monitoring" },
              { value: "$0", label: "To start" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-bold text-[var(--color-accent)]">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--color-text-muted)] mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Three steps to<span className="text-[var(--color-accent)]"> alpha</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-center mb-16 max-w-xl mx-auto">
            Stop manually checking EDGAR. Let FilingPulse watch for you.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Set Your Rules",
                desc: "Pick SIC codes, states, offering size ranges, or specific people and companies to watch.",
                icon: "⚙️",
              },
              {
                step: "02",
                title: "We Monitor EDGAR",
                desc: "Our poller checks SEC EDGAR every 2 minutes for new Form D and D/A filings.",
                icon: "📡",
              },
              {
                step: "03",
                title: "Get Alerted Instantly",
                desc: "When a filing matches your rules, you get an email with full details within minutes.",
                icon: "⚡",
              },
            ].map((item) => (
              <div key={item.step} className="card text-center group">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-xs font-mono text-[var(--color-accent)] mb-2">
                  STEP {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-[var(--color-bg-secondary)] border-y border-[var(--color-border-subtle)] py-24">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Simple pricing
            </h2>
            <p className="text-[var(--color-text-secondary)] text-center mb-16 max-w-lg mx-auto">
              Start free. Upgrade when you need real-time speed.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Free tier */}
              <div className="card">
                <div className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
                  Free
                </div>
                <div className="text-4xl font-bold mb-1">$0</div>
                <div className="text-sm text-[var(--color-text-muted)] mb-6">
                  forever
                </div>
                <ul className="space-y-3 text-sm mb-8">
                  {[
                    "1 alert rule",
                    "Hourly email digest",
                    "All Form D filings",
                    "Basic filters",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      <span className="text-[var(--color-success)]">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard" className="btn btn-secondary w-full">
                  Get Started
                </Link>
              </div>

              {/* Pro tier */}
              <div className="card relative border-indigo-500/30 bg-gradient-to-b from-[var(--color-bg-card)] to-indigo-950/20">
                <div className="absolute -top-3 right-6">
                  <span className="badge badge-accent">POPULAR</span>
                </div>
                <div className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-wider mb-4">
                  Pro
                </div>
                <div className="text-4xl font-bold mb-1">
                  $149<span className="text-lg font-normal text-[var(--color-text-muted)]">/mo</span>
                </div>
                <div className="text-sm text-[var(--color-text-muted)] mb-6">
                  billed monthly
                </div>
                <ul className="space-y-3 text-sm mb-8">
                  {[
                    "Unlimited alert rules",
                    "Real-time email alerts (~2 min)",
                    "All Form D filings",
                    "Advanced filters & watchlists",
                    "Person & company tracking",
                    "Priority support",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      <span className="text-[var(--color-accent)]">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard" className="btn btn-primary w-full">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stop missing filings
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-8 max-w-lg mx-auto">
            VCs and corp dev teams already pay $20K+ for PitchBook.
            Get the one signal they care about most — faster, and for a fraction of the cost.
          </p>
          <Link href="/dashboard" className="btn btn-primary text-base px-8 py-3">
            Start Monitoring →
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-subtle)] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
              FP
            </div>
            FilingPulse © {new Date().getFullYear()}
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
            <span>Data sourced from SEC EDGAR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
