export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col text-gray-950">{children}</div>
  );
}
