import { useRouter } from "next/router";
import { ReactElement } from "react";
import { Container } from "@/components/Container";
import CourseLayout from "@/components/courses/CourseLayout";
import MeetingQueues from "@/components/courses/home/MeetingQueues";
import MeetingSignups from "@/components/courses/home/MeetingSignups";
import useClerkSWR from "@/hooks/useClerkSWR";
import { NextPageWithLayout } from "@/pages/_app";
import { CourseData } from "@orderly/schema";

const Course: NextPageWithLayout = () => {
  const router = useRouter();
  const { course_id } = router.query as { course_id: string };
  const { data: courseData } = useClerkSWR<CourseData>(
    `/courses/${course_id}`,
    {
      revalidateIfStale: false,
    }
  );

  if (!courseData) return null;

  let authedView: JSX.Element | null = null;
  if (courseData.role === 2 || courseData.role === 1) {
    authedView = <MeetingQueues course_id={course_id} />;
  } else if (courseData.role === 0) {
    authedView = <MeetingSignups course_id={course_id} />;
  }

  return (
    <div className="pb-10 pt-5">
      <Container>
        <div className="mb-5 sm:mb-0">
          <h1 className="text-xl font-semibold">Office Hours</h1>
          <p className="mt-2 text-sm text-gray-700">
            {courseData.role === 2 || courseData.role === 1
              ? "View and manage your office hour queues"
              : "Sign up for office hours and view your queue positions"}
          </p>
        </div>
        <div className="mt-10">{authedView}</div>
      </Container>
    </div>
  );
};

Course.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default Course;
