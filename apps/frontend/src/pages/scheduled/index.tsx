import useClerkSWR from "@/hooks/useClerkSWR";
import Link from "next/link";
import CoursesSkeleton from "@/components/courses/CoursesSkeleton";
import CreateCourseModal from "@/components/courses/CreateCourseModal";
import JoinCourseModal from "@/components/courses/JoinCourseModal";
import { Container } from "@/components/Container";
import { doubleFilter } from "@/lib/utils";
import { UserIcon, KeyIcon } from "@heroicons/react/20/solid";
import { Tab } from "@headlessui/react";
import { useState } from "react";
import { motion } from "framer-motion";
import MeetingSkeleton from "@/components/courses/MeetingSkeleton";
import Button from "@/components/ui/Button";
import SwiperCore, { EffectCoverflow, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.min.css";
import "swiper/swiper.min.css";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";

type QueueGeneral = {
  id: number;
  name: string;
  question_type: string;
  question: string;
  role: 0 | 1 | 2;
  owner_name: string;
  member_count: number;
};

const QueueCard = ({
  id,
  name,
  question_type = "Private Question",
  question = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ",
  owner_name,
  member_count,
}: QueueGeneral) => {
  return (
    <Link
      className="flex flex-col gap-2 rounded border border-gray-200 bg-white p-6 shadow shadow-gray-200/70 transition-all duration-150  hover:border-gray-300 hover:shadow-md"
      href={`/courses/${id}`}
    >
      <div>
        <div className="float-right">
          <Menu>
            <Menu.Button>...</Menu.Button>
            <Menu.Items>Dequeue</Menu.Items>
            <Menu.Items>Move to Front</Menu.Items>
          </Menu>
        </div>

        <p className="line-clamp-1 text-sm text-gray-500">{owner_name}</p>

        <h3 className="mb-2 line-clamp-2 h-12 font-medium">{question_type}</h3>
        <div className="flex flex-wrap items-center justify-between gap-1"></div>
        <h3 className="h-15 mb-3 line-clamp-3 font-medium">
          Question: {question}
        </h3>
      </div>
    </Link>
  );
};

type FutureOfficeHours = {
  id: number;
  Owner_id: number;
  course_id: number;
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start_time: string;
  end_time: string;
  owner_name: string;
  link: string;
  CourseName: string;
};

const FutureOfficeHoursCard = ({
  id,
  Owner_id,
  course_id,
  day,
  start_time = "7:00",
  end_time,
  owner_name,
  CourseName,
  link,
}: FutureOfficeHours) => {
  return (
    <Link className="" href={`/courses/${id}`}>
      <div>
        <div className="pb-4">
          <p className="py-1 pl-2">CS 320 Prof Jaime</p>
          <p className="py-1 pl-2">4/15, 8:00 to 9:00pm</p>
          <Button as="link" href={createCalendar()} variant="outline">
            Add to Calendar
          </Button>
        </div>
      </div>
    </Link>
  );
};

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
  day,
  start_time = "7:00",
  end_time,
  role,
  owner_name,
  CourseName,
  link,
}: MeetingGeneral) => {
  return (
    <Link
      //  className="flex flex-col gap-2 rounded border border-gray-200 bg-white p-6 shadow shadow-gray-200/70 transition-all duration-150 hover:border-gray-300 hover:shadow-md"
      href={`/course/${id}`}
    >
      <div className="rounded-md border-[1px] border-gray-300/60 bg-white p-4 shadow shadow-gray-200/70 transition-all duration-100 hover:shadow-md">
        <div className=" pl-6">
          <p className="">{CourseName}</p>
          <p className="line-clamp-1 text-sm text-gray-500">
            {Role(role)}
            {owner_name}
          </p>
          <p className="line-clamp-1 text-sm text-gray-500">
            {DayOfWeek(day)}
            {start_time} to {end_time}
          </p>
          <br />

          <div>
            <p className="line-clamp-1 text-center text-sm text-black">
              Current Queue Postion: 3
            </p>
            <p className="line-clamp-1 text-center text-sm text-black">
              Submission Type: Private Question
            </p>
            <br />
            <br />

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-2">
              <Button variant="outline">
                <p className="text-sm">Edit Queue Submission</p>
              </Button>
              <Button as="link" href={createCalendar()}>
                <p className="text-sm">Join Zoom</p>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const tabs = [
  // { id: "all", label: "All" },
  { id: "created", label: "Hosted" },
  { id: "joined", label: "Joined" },
];

export default function Courses() {
  const { data, error, loading } = useClerkSWR<QueueGeneral[]>("/courses");
  const [selectedTab, setSelectedTab] = useState(0);

  const [ownedCourses, joinedCourses] = doubleFilter(
    data,
    (course) => course.role === 2
  );

  return (
    <div className="min-h-dash bg-gray-50">
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <div className="border-b border-b-gray-200 bg-white pt-10">
          <Container>
            <div className="items-center justify-between pb-10 sm:flex ">
              <h1 className="mb-5 font-display text-4xl font-semibold sm:m-0">
                Office Hours
              </h1>
            </div>
            <Tab.List className="inline-flex gap-2 pb-5">
              {tabs.map((tab, index) => {
                return (
                  <Tab
                    key={tab.id}
                    className="relative rounded px-4 py-1.5 text-sm font-medium ring-indigo-400 transition duration-100 hover:bg-gray-100 focus:outline-none ui-focus-visible:ring-2"
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    <span className="relative z-10">{tab.label}</span>
                    {selectedTab === index && (
                      <motion.span
                        layoutId="bubble"
                        className="absolute inset-0 bg-gray-100"
                        style={{ borderRadius: 4 }}
                        transition={{
                          type: "spring",
                          bounce: 0.3,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </Tab>
                );
              })}
            </Tab.List>
          </Container>
        </div>
        <Container className="pb-5 pt-5">
          {loading ? (
            <MeetingSkeleton />
          ) : error ? (
            <p className="text-red-500">{error.message}</p>
          ) : (
            <Tab.Panels>
              <Tab.Panel className="">
                <div className="float-right py-8">
                  <Button as="link" href={createCalendar()}>
                    <p className="text-md">Join Zoom</p>
                  </Button>
                </div>
                <h1 className="mb-5 py-8 font-display text-4xl font-semibold sm:m-0">
                  Current Office Hours Queue
                </h1>

                {ownedCourses.length === 0 && (
                  <p>You have no hosted office hours at this time</p>
                )}
                <div>
                  <Swiper
                    grabCursor={true}
                    slidesPerView={"auto"}
                    className="mySwiper"
                    spaceBetween={50}
                    pagination={{
                      clickable: true,
                    }}
                  >
                    {ownedCourses.map((curr, i) => (
                      <SwiperSlide key={i} className="max-w-md">
                        <QueueCard key={curr.id} {...curr} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                <div className="pb-10 pt-6">
                  <Button as="link" href={nextButton()}>
                    <p className="p text-md">Dequeue Front</p>
                  </Button>
                </div>
                <div className="items-center justify-between pb-5 sm:flex ">
                  <h1 className="mb-5 font-display text-4xl font-semibold sm:m-0">
                    Future Office Hour Times
                  </h1>
                </div>
                <div className="">
                  {ownedCourses.length === 0 && (
                    <p>You have future hosted office hours at this time</p>
                  )}
                  {joinedCourses.map((curr) => (
                    <FutureOfficeHoursCard
                      Owner_id={0}
                      course_id={0}
                      day={0}
                      start_time={""}
                      end_time={""}
                      link={""}
                      CourseName={""}
                      key={curr.id}
                      {...curr}
                    />
                  ))}
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {joinedCourses.map((curr) => (
                    <MeetingCard
                      Owner_id={0}
                      course_id={0}
                      day={0}
                      start_time={"6:00"}
                      end_time={"7:00pm"}
                      link={""}
                      CourseName={""}
                      key={curr.id}
                      {...curr}
                    />
                  ))}
                </div>
                <div className="items-center justify-between pt-6 sm:flex ">
                  <h1 className="mb-5 font-display text-4xl font-semibold sm:m-0">
                    Future Office Hour Times
                  </h1>
                </div>
                <div className="">
                  {ownedCourses.length === 0 && (
                    <p>You have future hosted office hours at this time</p>
                  )}
                  {joinedCourses.map((curr) => (
                    <FutureOfficeHoursCard
                      Owner_id={0}
                      course_id={0}
                      day={0}
                      start_time={""}
                      end_time={""}
                      link={""}
                      CourseName={""}
                      key={curr.id}
                      {...curr}
                    />
                  ))}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          )}
        </Container>
      </Tab.Group>
    </div>
  );
}
function nextButton() {
  return "asdmasl";
}
function createCalendar(
  start_time: number,
  end_time: number,
  link: string,
  owner_name: string,
  CourseName: string
) {
  return "https://ics.agical.io/?subject=Meet%20{{company.Account Owner First Name}}&organizer=Sandy&reminder=45&location=Sandy%27s%20Desk&dtstart=2016-10-26T15:00:00-04:00&dtend=2016-10-26T16:00:00-04:00&attach=";
}

function Role(role: number) {
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
function DayOfWeek(day: number) {
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
  /*
   <Tab.Panel className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data?.length === 0 && (
                  <p>You do not have any office hours at this time</p>
                )}
                {ownedCourses.map((curr) => (
                  <CourseCard key={curr.id} {...curr} />
                ))}
                {joinedCourses.map((curr) => (
                  <MeetingCard
                    Owner_id={0}
                    course_id={0}
                    day={0}
                    start_time={"6:00"}
                    end_time={"7:00pm"}
                    link={""}
                    CourseName={""}
                    key={curr.id}
                    {...curr}
                  />
                ))}
              </Tab.Panel>*/
}
