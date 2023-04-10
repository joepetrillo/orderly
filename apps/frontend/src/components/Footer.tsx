export default function Footer() {
  return (
    <footer className="z-10 mt-auto">
      <p className="mx-auto max-w-7xl px-6 py-16 text-center text-sm leading-6 text-gray-500 lg:px-8">
        © {new Date().getFullYear()} Orderly Inc. All rights reserved.
      </p>
    </footer>
  );
}
