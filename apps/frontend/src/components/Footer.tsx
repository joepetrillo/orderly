export default function Footer() {
  return (
    <footer className="z-10 mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <p className="text-center text-sm leading-6 text-gray-500">
          © {new Date().getFullYear()} Orderly Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
