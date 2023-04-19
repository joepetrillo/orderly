import Spinner from "@/components/ui/Spinner";
import useClerkSWR from "@/hooks/useClerkSWR";
import { useRouter } from "next/router";
import NotFound from "@/pages/404";
import { courseGET } from "@orderly/schema";
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
  const paramOk = courseGET.params.safeParse({ course_id });

  const { data, error, loading } = useClerkSWR<CourseData>(
    paramOk.success === true ? `/course/${course_id}` : null
  );

  if (!course_id) return null;

  if (paramOk.success === false) return <NotFound />;

  // switch to skeleton loader eventually
  if (loading) {
    return (
      <div className="flex justify-center">
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
    return <p className="flex justify-center text-red-500">{error.message}</p>;
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
    <Container className="space-y-5">
      <h1 className="text-4xl font-bold">{data?.name}</h1>
      <p>Course Code - {data?.code}</p>
      {authorizedView}
    </Container>
  );
}
