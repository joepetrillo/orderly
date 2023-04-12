import Spinner from "@/components/UI/Spinner";
import useClerkSWR from "@/lib/useClerkSWR";
import { Prisma } from "@prisma/client";
import { useRouter } from "next/router";
import NotFound from "@/pages/404";
import { courseGET } from "@orderly/schema";
import JoinCourseError from "@/components/Courses/JoinCourseError";

type CourseData = {
  role: 0 | 1 | 2;
  course: Prisma.CourseGetPayload<{
    select: {
      id: true;
      name: true;
      code: true;
      Meeting: true;
    } & Prisma.CourseSelect;
  }>;
};

export default function Course() {
  const router = useRouter();
  const { course_id } = router.query as { course_id: string };
  const paramOk = courseGET.params.safeParse({ course_id });

  const { data, error, loading } = useClerkSWR<CourseData>(
    paramOk.success === true ? `/course/${course_id}` : null
  );

  if (!course_id) return null;

  if (paramOk.success === false) return <NotFound />;

  // switch to skeleton loader eventually
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (error) {
    if (error.status === 404) {
      return <NotFound />;
    }
    if (error.status === 403) {
      return <JoinCourseError course_id={course_id} />;
    }
    return (
      <p className="flex justify-center py-16 text-red-500">{error.message}</p>
    );
  }

  let authorizedView: JSX.Element | null = null;
  if (data?.role === 2) {
    authorizedView = <p>Owner (Professor) view</p>;
  } else if (data?.role === 1) {
    authorizedView = <p>Hoster (TA/UCA) view</p>;
  } else if (data?.role === 0) {
    authorizedView = <p>Enrolled (Student) view</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 lg:px-8">
      <h1 className="text-4xl font-bold">{data?.course.name}</h1>
      <p>Course Code - {data?.course.code}</p>
      {authorizedView}
    </div>
  );
}
