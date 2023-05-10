import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { Container } from "@/components/Container";
import CourseLayout from "@/components/courses/CourseLayout";
import CreateMeeting from "@/components/courses/schedule/CreateMeeting";
import OwnedMeeting from "@/components/courses/schedule/OwnedMeeting";
import OwnedMeetingsSkeleton from "@/components/skeletons/OwnedMeetingsSkeleton";
import useClerkSWR from "@/hooks/useClerkSWR";
import { NextPageWithLayout } from "@/pages/_app";

const Schedule: NextPageWithLayout = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const { course_id } = router.query as { course_id: string };

  // Meeting[] /${course_id}/users/${userId}/meetings
  const { data, error, loading } = useClerkSWR<any[]>(`/courses`);

  if (error) {
    return (
      <p className="flex justify-center py-10 text-red-500">{error.message}</p>
    );
  }

  return (
    <div className="pb-10 pt-5">
      <Container>
        <h2 className="text-xl font-semibold">Schedule</h2>
        <p className="mt-2 text-sm text-gray-700">Edit your office hours</p>
        <div className="mt-10 space-y-10">
          <CreateMeeting course_id={course_id} user_id={userId} />
          <div>
            <h2 className="text-xl font-semibold">Your Office Hours</h2>
            <p className="mt-2 text-sm text-gray-700">Edit your office hours</p>
          </div>
          {loading ? (
            <OwnedMeetingsSkeleton />
          ) : data?.length === 0 ? (
            <p>You have not setup any office hours yet</p>
          ) : (
            data?.map((meeting) => {
              return <OwnedMeeting key={meeting.id} {...meeting} />;
            })
          )}
        </div>
      </Container>
    </div>
  );
};

Schedule.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default Schedule;
