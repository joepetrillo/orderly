export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        {/* <nav className="mt-6">
          <ul className="flex flex-wrap justify-center gap-4 md:gap-8 lg:gap-12">
            <li>
              <a
                className="text-gray-700 transition hover:text-gray-700/75"
                href="/"
              >
                About
              </a>
            </li>

            <li>
              <a
                className="text-gray-700 transition hover:text-gray-700/75"
                href="/"
              >
                Careers
              </a>
            </li>

            <li>
              <a
                className="text-gray-700 transition hover:text-gray-700/75"
                href="/"
              >
                History
              </a>
            </li>

            <li>
              <a
                className="text-gray-700 transition hover:text-gray-700/75"
                href="/"
              >
                Services
              </a>
            </li>

            <li>
              <a
                className="text-gray-700 transition hover:text-gray-700/75"
                href="/"
              >
                Projects
              </a>
            </li>

            <li>
              <a
                className="text-gray-700 transition hover:text-gray-700/75"
                href="/"
              >
                Blog
              </a>
            </li>
          </ul>
        </nav> */}
        <p className="text-center text-sm leading-6 text-gray-500">
          © {new Date().getFullYear()} Orderly Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
