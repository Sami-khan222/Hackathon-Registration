/** Shared centred shell for Signup / Login / OTP screens. */
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <section className="bg-surface px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}
      </div>
    </section>
  );
}
