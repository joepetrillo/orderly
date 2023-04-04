import useClerkSWR from "@/lib/useClerkSWR";
import { Prisma } from "@prisma/client";
import CoursesSkeleton from "@/components/Courses/CoursesSkeleton";
import Link from "next/link";
import CreateCourse from "./CreateCourse";
import JoinCourse from "./JoinCourse";

type Enrolled = Prisma.EnrolledGetPayload<{
  include: {
    course: true;
  };
}>;

export default function Courses() {
  const { data, error, isLoading, isValidating, mutate } = useClerkSWR<
    Enrolled[]
  >("http://localhost:3001/course");

  if (error) return <p>{error.message}</p>;

  return (
    <>
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
    </>
  );
}
