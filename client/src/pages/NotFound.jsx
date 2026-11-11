import Button from '../components/Button';

export default function NotFound() {
  return (
    <section className="px-4 py-24 text-center">
      <p className="font-display text-6xl font-semibold text-brand-500">404</p>
      <h1 className="mt-4 text-2xl font-semibold">This page doesn’t exist</h1>
      <p className="mt-2 text-muted">The link may be broken or the page may have moved.</p>
      <Button to="/" className="mt-8">Back to home</Button>
    </section>
  );
}
