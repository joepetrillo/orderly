import useClerkSWR from "@/hooks/useClerkSWR";
import Link from "next/link";
import CoursesSkeleton from "@/components/courses/CoursesSkeleton";
import CreateCourseModal from "@/components/courses/CreateCourseModal";
import JoinCourseModal from "@/components/courses/JoinCourseModal";
import { Container } from "@/components/Container";
import { doubleFilter } from "@/lib/utils";
import { UserIcon, KeyIcon } from "@heroicons/react/20/solid";
import Button from "@/components/ui/Button";
import MeetingSkeleton from "@/components/courses/MeetingSkeleton";

type MeetingGeneral = {
  id: number;
  Owner_id: number;
  course_id: number;
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start_time: string;
  end_time: string;
  role: 0 | 1 | 2;
  owner_name: string;
  link: string;
  CourseName: string;
};

const MeetingCard = ({
  id,
  Owner_id,
  course_id,
  day = 1,
  start_time = "7:00",
  end_time = "8:00pm",
  role,
  owner_name,
  CourseName = "CS 230",
  link = "",
}: MeetingGeneral) => {
  return (
    <Link
      //  className="flex flex-col gap-2 rounded border border-gray-200 bg-white p-6 shadow shadow-gray-200/70 transition-all duration-150 hover:border-gray-300 hover:shadow-md"
      href={`/course/${id}`}
    >
      <div className="rounded-md border-[1px] border-gray-300/60 bg-white p-4 shadow-md transition-all duration-100 hover:shadow">
        <div className=" pl-6">
          <p className="">{CourseName}</p>
          <p className="">
            {Role(role)}
            {owner_name}
          </p>
          <p className="">
            {DayOfWeek(day)}
            {start_time} to {end_time}
          </p>
          <br />
          <br />
          <div>
            <p className="text-center">Current Queue Postion: 3</p>
            <p className="text-center">Submission Type: Private Question</p>
            <br />
            <br />
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-2">
              <Button variant="ghost">Edit Queue Submission</Button>
              <Button as="link" href={link}>
                Join Zoom
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function Scheduled() {
  const { data, error, loading } = useClerkSWR<MeetingGeneral[]>("/course");

  const [ownedCourses, joinedCourses] = doubleFilter(
    data,
    (course) => course.role === 2
  );

  return (
    <Container>
      <h1 className="mb-5 text-4xl font-bold">Current Office Hours</h1>

      {loading ? (
        <MeetingSkeleton />
      ) : error ? (
        <p className="text-red-500">{error.message}</p>
      ) : (
        <>
          {data?.length === 0 && (
            <p>You have not created or joined office hours</p>
          )}
          <div className="lg:grid-cols-900 grid gap-6 sm:grid-cols-3 lg:grid-cols-3">
            {ownedCourses.map((curr) => (
              <MeetingCard key={curr.id} {...curr} />
            ))}
          </div>
        </>
      )}

      <h1 className="mb-5 pt-7 text-4xl font-bold ">Scheduled Office Hours</h1>
      <div>
        <div className="py-4">
          <p className="py-1 pl-2">CS 320 Prof Jaime</p>
          <p className="py-1 pl-2">4/15, 8:00 to 9:00pm</p>
          <Button as="link" href={createCalendar()} variant="outline">
            Add to Calendar
          </Button>
        </div>
      </div>
    </Container>
  );
}

function createCalendar() {
  return "https://ics.agical.io/?subject=Meet%20{{company.Account Owner First Name}}&organizer=Sandy&reminder=45&location=Sandy%27s%20Desk&dtstart=2016-10-26T15:00:00-04:00&dtend=2016-10-26T16:00:00-04:00&attach=http://www.example.com/";
}

function Role(role) {
  if (role == 0) {
    return "Student: ";
  }

  if (role == 1) {
    return "TA/UCA: ";
  }

  if (role == 2) {
    return "Prof: ";
  }
}
function DayOfWeek(day) {
  if (day == 0) {
    return "Monday, ";
  }

  if (day == 1) {
    return "Tuesday, ";
  }

  if (day == 2) {
    return "Wednesday, ";
  }

  if (day == 3) {
    return "Thursday, ";
  }

  if (day == 4) {
    return "Friday, ";
  }

  if (day == 5) {
    return "Saturday, ";
  }
  if (day == 6) {
    return "Sunday, ";
  }
}
