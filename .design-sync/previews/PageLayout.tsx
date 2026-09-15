import { PageLayout } from "turath-collective";

export function Default() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="heading-section">Our Collections</h1>
        <p className="mt-4 text-muted-foreground">
          Heritage craftsmanship, made by hand in Montreal.
        </p>
      </div>
    </PageLayout>
  );
}
