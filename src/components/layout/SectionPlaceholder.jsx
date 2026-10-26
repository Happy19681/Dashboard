function SectionPlaceholder({ title }) {
  return (
    <main className="mx-auto w-full max-w-[1440px] p-6 md:p-8">
      <p className="mb-2 text-sm text-muted-foreground">Dashboard</p>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        This page is set up. We'll build its content in a later step.
      </p>
    </main>
  );
}

export default SectionPlaceholder;
