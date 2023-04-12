import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
      router.replace("/");
    }, 3700);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h1 className="mb-5 text-4xl font-bold">Page Not Found</h1>
      <p>Redirecting you home in {seconds} seconds...</p>
    </div>
  );
}
