export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto  pb-24 px-4 min-h-screen">{children}</div>
  );
}
