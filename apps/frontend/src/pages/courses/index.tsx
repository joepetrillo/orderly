import useClerkSWR from "@/hooks/useClerkSWR";
import Link from "next/link";
import CoursesSkeleton from "@/components/courses/CoursesSkeleton";
import CreateCourseModal from "@/components/courses/CreateCourseModal";
import JoinCourseModal from "@/components/courses/JoinCourseModal";
import { Container } from "@/components/Container";
import { doubleFilter } from "@/lib/utils";
import { UserIcon, KeyIcon } from "@heroicons/react/20/solid";

type CourseGeneral = {
  id: number;
  name: string;
  code: string;
  role: 0 | 1 | 2;
  owner_name: string;
  member_count: number;
};

const CourseCard = ({
  id,
  name,
  code,
  owner_name,
  member_count,
}: CourseGeneral) => {
  return (
    <Link
      className="flex flex-col gap-2 rounded border border-gray-200 bg-white p-6 shadow shadow-gray-200/70 transition-all duration-150 hover:border-gray-300 hover:shadow-md"
      href={`/course/${id}`}
    >
      <p className="line-clamp-1 text-sm text-gray-500">{owner_name}</p>
      <h3 className="mb-2 line-clamp-2 h-12 font-medium">{name}</h3>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <KeyIcon className="h-[1.3em]" />
        <p>{code}</p>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <UserIcon className="h-[1.3em]" />
        <p>
          {member_count} {member_count === 1 ? "Member" : "Members"}
        </p>
      </div>
    </Link>
  );
};

export default function Courses() {
  const { data, error, loading } = useClerkSWR<CourseGeneral[]>("/course");

  const [ownedCourses, joinedCourses] = doubleFilter(
    data,
    (course) => course.role === 2
  );

  return (
    <div className="min-h-dash bg-gray-50 py-10">
      <Container>
        <h1 className="font-display text-4xl font-bold">Courses</h1>
        <div className="mb-10 mt-6 space-x-4">
          <CreateCourseModal />
          <JoinCourseModal />
        </div>
        {loading ? (
          <CoursesSkeleton />
        ) : error ? (
          <p className="text-red-500">{error.message}</p>
        ) : (
          <>
            {data?.length === 0 && (
              <p>You have not created or joined any courses</p>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ownedCourses.map((curr) => (
                <CourseCard key={curr.id} {...curr} />
              ))}
              {joinedCourses.map((curr) => (
                <CourseCard key={curr.id} {...curr} />
              ))}
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
