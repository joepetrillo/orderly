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
  const { data, error, loading } = useClerkSWR<Enrolled[]>("/course");

  const ownedCourses = data?.filter((course) => course.role === 2);
  const joinedCourses = data?.filter((course) => course.role !== 2);

  if (error) {
    return (
      <p className="flex justify-center py-16 text-red-500">{error.message}</p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 lg:px-8">
      <div>
        <h1 className="mb-5 text-4xl font-bold">Your Courses</h1>
        <div className="mb-10">
          <CreateCourse />
        </div>
        {loading ? (
          <CoursesSkeleton />
        ) : (
          <>
            {ownedCourses?.length === 0 && (
              <p>You have not created any courses</p>
            )}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ownedCourses?.map((curr) => (
                <Link
                  className="rounded-md border-[1px] border-gray-300/60 bg-white p-4 shadow-sm transition-all duration-100 hover:shadow"
                  href={`/course/${curr.course.id}`}
                  key={curr.course.id}
                >
                  <p>{curr.course.name}</p>
                  <p>{curr.course.code}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      <div>
        <h1 className="mb-5 text-4xl font-bold">Joined Courses</h1>
        <div className="mb-10">
          <JoinCourse />
        </div>
        {loading ? (
          <CoursesSkeleton />
        ) : (
          <>
            {joinedCourses?.length === 0 && (
              <p>You have not joined any courses</p>
            )}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {joinedCourses?.map((curr) => (
                <Link
                  className="rounded-md border-[1px] border-gray-300/60 bg-white p-4 shadow-sm transition-all duration-100 hover:shadow"
                  href={`/course/${curr.course.id}`}
                  key={curr.course.id}
                >
                  <p>{curr.course.name}</p>
                  <p>{curr.course.code}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
