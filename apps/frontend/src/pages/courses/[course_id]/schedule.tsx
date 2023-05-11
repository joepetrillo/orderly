import { useAuth } from "@clerk/nextjs";
import { Prisma } from "@prisma/client";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { Container } from "@/components/Container";
import CourseLayout from "@/components/courses/CourseLayout";
import CreateMeeting from "@/components/courses/schedule/CreateMeeting";
import OwnedMeeting from "@/components/courses/schedule/OwnedMeeting";
import OwnedMeetingsSkeleton from "@/components/skeletons/OwnedMeetingsSkeleton";
import useClerkSWR from "@/hooks/useClerkSWR";
import { NextPageWithLayout } from "@/pages/_app";

type Meeting = Prisma.MeetingGetPayload<{
  select: {
    id: true;
    owner_id: true;
    course_id: true;
    day: true;
    start_time: true;
    end_time: true;
    link: true;
  };
}>;

const Schedule: NextPageWithLayout = () => {
  const router = useRouter();
  const { course_id } = router.query as { course_id: string };

  const { data, error, loading } = useClerkSWR<Meeting[]>(
    `/courses/${course_id}/meetings/owned`
  );

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
          <CreateMeeting course_id={course_id} />
          <div>
            <h2 className="text-xl font-semibold">Your Office Hours</h2>
            <p className="mt-2 text-sm text-gray-700">Edit your office hours</p>
          </div>
          {loading ? (
            <OwnedMeetingsSkeleton />
          ) : data?.length === 0 ? (
            <p>You have not setup any office hours yet</p>
          ) : (
            <div className="flex flex-wrap gap-10">
              {data?.map((meeting) => {
                return <OwnedMeeting key={meeting.id} {...meeting} />;
              })}
            </div>
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
