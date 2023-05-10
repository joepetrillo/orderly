import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { Container } from "@/components/Container";
import CourseLayout from "@/components/courses/CourseLayout";
import Button from "@/components/ui/Button";
import useClerkSWR from "@/hooks/useClerkSWR";
import { NextPageWithLayout } from "@/pages/_app";
import { CourseData } from "@orderly/schema";

const OfficeHoursCard = ({
  name,
  profileImageUrl,
}: {
  name: string;
  profileImageUrl: string;
}) => {
  return (
    <div className="overflow-hidden rounded border border-gray-200">
      <div className="flex items-center gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
            <Image
              className="object-cover"
              fill={true}
              sizes="2.5rem"
              src={profileImageUrl}
              alt="avatar"
            />
          </div>
          <div className="ml-4">
            <div className="line-clamp-1 font-medium">{name}</div>
          </div>
        </div>
      </div>
      <div className="divide-y px-6 text-sm leading-6">
        <div className="flex items-center justify-start gap-2 py-4 text-gray-700">
          <ChevronDownIcon className="h-5 w-5" />
          <p className="truncate">Monday</p>
          <p className="ml-auto shrink-0">None</p>
        </div>
        <div className="flex items-center justify-start gap-2 py-4 text-gray-700">
          <ChevronDownIcon className="h-5 w-5" />
          <p className="truncate">Tuesday</p>
          <p className="ml-auto shrink-0">None</p>
        </div>
        <div className="flex items-center justify-start gap-2 py-4 text-gray-700">
          <ChevronDownIcon className="h-5 w-5" />
          <p className="truncate">Wednesday</p>
          <p className="ml-auto shrink-0">12:55 PM - 12:55 PM</p>
        </div>
        <div className="flex items-center justify-start gap-2 py-4 text-gray-700">
          <ChevronDownIcon className="h-5 w-5" />
          <p className="truncate">Thursday</p>
          <p className="ml-auto shrink-0">3:30 PM - 4:15 PM</p>
        </div>
        <div className="flex items-center justify-start gap-2 py-4 text-gray-700">
          <ChevronDownIcon className="h-5 w-5" />
          <p className="truncate">Friday</p>
          <p className="ml-auto shrink-0">None</p>
        </div>
      </div>
    </div>
  );
};

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

  return (
    <div className="pb-10 pt-5">
      <Container>
        <div className="items-center justify-between sm:flex">
          <div className="mb-5 sm:mb-0">
            <h1 className="text-xl font-semibold">Office Hours</h1>
            <p className="mt-2 text-sm text-gray-700">
              View all meeting times in this course
            </p>
          </div>
          {courseData.role > 0 && <Button>Modify Schedule</Button>}
        </div>
        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <OfficeHoursCard name="Jaime Davila" profileImageUrl="" />
        </div>
      </Container>
    </div>
  );
};

Course.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default Course;
