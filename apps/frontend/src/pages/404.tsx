import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container } from "@/components/Container";

export default function NotFound() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(4);

  useEffect(() => {
    const timer =
      seconds > 0 && setInterval(() => setSeconds((prev) => prev - 1), 1000);
    if (timer) return () => clearInterval(timer);
  }, [seconds]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/courses");
    }, 3500);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <Container className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="max-w-sm font-display text-4xl font-bold">
        Page Not Found
      </h1>
      <p className="mt-5 text-gray-600">
        Redirecting you home in {seconds} seconds...
      </p>
    </Container>
  );
}
