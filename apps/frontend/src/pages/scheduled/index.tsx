import Link from "next/link";

export default function Scheduled() {
  return (
    <div className="min-h-dash py-20 text-center">
      <p>Coming Soon</p>
      <Link href="/courses" className="underline">
        Go to courses
      </Link>
    </div>
  );
}
