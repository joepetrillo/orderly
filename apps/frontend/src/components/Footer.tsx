import { Container } from "@/components/Container";

export default function Footer() {
  return (
    <footer className="z-10 mt-auto">
      <Container className="py-16 pt-24 text-center">
        <p className="text-sm leading-6 text-gray-600">
          © {new Date().getFullYear()} Orderly Inc. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
