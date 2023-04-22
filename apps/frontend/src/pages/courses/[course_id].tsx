import Spinner from "@/components/ui/Spinner";
import useClerkSWR from "@/hooks/useClerkSWR";
import { useRouter } from "next/router";
import NotFound from "@/pages/404";
import { coursePARAM } from "@orderly/schema";
import JoinCourseError from "@/components/courses/JoinCourseError";
import { Container } from "@/components/Container";

type CourseData = {
  id: number;
  name: string;
  code: string;
  role: 0 | 1 | 2;
  meetings: {
    id: number;
    owner_id: string;
    day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    start_time: Date;
    end_time: Date;
  }[];
  enrolled: {
    user_id: string;
    role: number;
  }[];
};

export default function Course() {
  const router = useRouter();
  const { course_id } = router.query as { course_id: string };
  const paramOk = coursePARAM.params.safeParse({ course_id });

  const { data, error, loading } = useClerkSWR<CourseData>(
    paramOk.success === true ? `/courses/${course_id}` : null
  );

  if (!course_id)
    return (
      <div className="min-h-dash bg-gray-50">
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      </div>
    );

  if (paramOk.success === false) return <NotFound />;

  // switch to skeleton loader eventually
  if (loading) {
    return (
      <div className="min-h-dash bg-gray-50">
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
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
      <div className="min-h-dash bg-gray-50">
        <p className="flex justify-center py-20 text-red-500">
          {error.message}
        </p>
      </div>
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
    <div className="min-h-dash bg-gray-50 py-10">
      <Container className="space-y-5">
        <h1 className="text-4xl font-bold">{data?.name}</h1>
        <p>Course Code - {data?.code}</p>
        {authorizedView}
      </Container>
    </div>
  );
}
