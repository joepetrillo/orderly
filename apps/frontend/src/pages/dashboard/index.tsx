import useClerkSWR from "@/lib/useClerkSWR";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import CoursesSkeleton from "@/components/Courses/CoursesSkeleton";
import CreateCourse from "@/components/Courses/CreateCourse";
import JoinCourse from "@/components/Courses/JoinCourse";

type Enrolled = Prisma.EnrolledGetPayload<{
  include: {
    course: true;
  };
}>;

export default function Dashboard() {
  const { data, error, isLoading } = useClerkSWR<Enrolled[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/course`
  );

  if (error) return <p>{error.message}</p>;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
      <h1 className="mb-5 text-4xl font-bold">Your Courses</h1>
      <div className="mb-10 grid grid-cols-2 gap-4">
        <CreateCourse />
        <JoinCourse />
      </div>
      {isLoading ? (
        <CoursesSkeleton />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((curr) => (
            <Link
              className="rounded-md border-[1px] border-gray-300 border-opacity-60 bg-white p-4 shadow-sm transition-all duration-100 hover:shadow"
              href={`/course/${curr.course.id}`}
              key={curr.course.id}
            >
              {curr.course.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
