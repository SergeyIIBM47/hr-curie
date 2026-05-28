export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-curie-bg)] px-4 py-10">
      <div className="w-full max-w-[440px]">{children}</div>
    </main>
  );
}
