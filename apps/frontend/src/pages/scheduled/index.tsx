import { Tab } from "@headlessui/react";
import { motion } from "framer-motion";
import { SVGProps, useState } from "react";
import SwiperCore, { EffectCoverflow, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Container } from "@/components/Container";
import MeetingSkeleton from "@/components/skeletons/MeetingSkeleton";
import Button from "@/components/ui/Button";
import useClerkSWR from "@/hooks/useClerkSWR";
import { doubleFilter } from "@/lib/utils";
import "swiper/swiper-bundle.min.css";
import "swiper/swiper.min.css";
import { Menu, Transition, Popover } from "@headlessui/react";
import { Fragment, useEffect, useRef } from "react";

SwiperCore.use([EffectCoverflow, Pagination]);

type QueueGeneral = {
  id: number;
  name: string;
  question_type: string;
  question: string;
  role: 0 | 1 | 2;
  owner_name: string;
  member_count: number;
  queue_count: number;
};

const QueueCard = ({
  id,
  name,
  question_type,
  question,
  owner_name,
  member_count,
  queue_count,
}: QueueGeneral) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Popover className="flex flex-col gap-2 rounded border border-gray-200 bg-white p-6 shadow shadow-gray-200/70 transition-all duration-150  hover:border-gray-300 hover:shadow-md">
      <Popover.Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="focus:outline-none"
      >
        <div>
          <div className="float-right">
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button
                onClick={(event) => event.stopPropagation()}
                className={"text-4xl"}
              >
                ...
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1 ">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={(event) => event.stopPropagation()}
                          className={`${
                            active
                              ? "bg-indigo-600 text-white"
                              : "text-gray-900"
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          {active ? (
                            <MoveActiveIcon
                              className="mr-2 h-5 w-5"
                              aria-hidden="true"
                            />
                          ) : (
                            <MoveInactiveIcon
                              className="mr-2 h-5 w-5"
                              aria-hidden="true"
                            />
                          )}
                          Move to Front
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="px-1 py-1 ">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={(event) => event.stopPropagation()}
                          className={`${
                            active
                              ? "bg-indigo-600 text-white"
                              : "text-gray-900"
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          {active ? (
                            <ExitActiveIcon
                              className="mr-2 h-5 w-5"
                              aria-hidden="true"
                            />
                          ) : (
                            <ExitInactiveIcon
                              className="mr-2 h-5 w-5"
                              aria-hidden="true"
                            />
                          )}
                          Dequeue
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          <p className="line-clamp-1 text-left text-sm text-gray-500">{name}</p>

          <h3 className="mb-1 line-clamp-2 h-12 text-left font-medium">
            {question_type}
          </h3>
          <h3 className="mb-1 text-center font-medium">
            {nextInQueue(queue_count)}
          </h3>
          <br />
          <div className="flex flex-wrap items-center justify-between gap-1"></div>

          <h3
            className={`h-15 mb-3 ${
              isExpanded ? "" : "line-clamp-4"
            } text-left font-medium`}
          >
            Question: {question}
          </h3>
        </div>
      </Popover.Button>
      <Popover.Panel className="z-10">
        <img src="/solutions.jpg" alt="" />
      </Popover.Panel>
    </Popover>
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
    <div>
      <div>
        <div className="py-2">
          <p className="py-1 pl-2">CS 320 Prof Jaime</p>
          <p className="py-1 pl-2">4/15, 8:00 to 9:00pm</p>
          <Button
            as="link"
            href={createCalendar(
              start_time,
              end_time,
              link,
              owner_name,
              CourseName
            )}
            variant="outline"
          >
            Add to Calendar
          </Button>
        </div>
      </div>
    </div>
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

let i = 0;

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
    <div>
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
              <Button
                as="externalLink"
                href="https://umass-amherst.zoom.us/j/5662083749?pwd=eGpRV3hZTUpLc2E3SHJsMVcxVmpJZz09"
                target="_blank"
              >
                <p className="text-sm">Join Zoom</p>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MeetingNameCard = ({
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
    <div className="">
      <div className="float-right py-8">
        <Button
          as="link"
          href={
            "https://umass-amherst.zoom.us/j/5662083749?pwd=eGpRV3hZTUpLc2E3SHJsMVcxVmpJZz09"
          }
        >
          <p className="text-md">Join Zoom</p>
        </Button>
      </div>
      <h1 className="font-display mb-5 py-8 text-4xl font-semibold sm:m-0">
        {CourseName}
      </h1>
    </div>
  );
};

const tabs = [
  // { id: "all", label: "All" },
  { id: "joined", label: "Joined" },
  { id: "created", label: "Hosted" },
];

function Courses() {
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
              <h1 className="font-display mb-5 text-4xl font-semibold sm:m-0">
                Office Hours
              </h1>
            </div>

            <Tab.List className="inline-flex gap-2 pb-5">
              {tabs.map((tab, index) => {
                return (
                  <Tab
                    key={tab.id}
                    className="ui-focus-visible:ring-2 relative rounded px-4 py-1.5 text-sm font-medium ring-indigo-400 transition duration-100 hover:bg-gray-100 focus:outline-none"
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
              <Tab.Panel>
                <h1 className="font-display mb-5 py-8 text-4xl font-semibold sm:m-0">
                  Current Office Hours Queue
                </h1>
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
                <br />
                <br />
                <div className="items-center justify-between pt-6 sm:flex ">
                  <h1 className="font-display mb-5 text-4xl font-semibold sm:m-0">
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
              <Tab.Panel className="">
                {ownedCourses.length === 0 && (
                  <p>You have no hosted office hours at this time</p>
                )}
                <div className="">
                  {joinedCourses.map((currr, j) => (
                    <div key={currr.id}>
                      <MeetingNameCard
                        Owner_id={0}
                        course_id={0}
                        day={0}
                        start_time={""}
                        end_time={""}
                        link={""}
                        CourseName={CourseNameArray[j++]}
                        {...currr}
                        //change this
                      />

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
                          <SwiperSlide
                            key={i}
                            className="max-w-md style={{ padding: '0' }}"
                          >
                            <QueueCard
                              key={curr.id}
                              id={0}
                              name={nameArray[i]}
                              question_type={"Public Question"}
                              question={arrayQuestions[i]}
                              role={0}
                              owner_name={""}
                              member_count={0}
                              queue_count={i++}
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      <div className="pb-10 pt-6">
                        <Button as="link" href={nextButton()}>
                          <p className="p text-md">Dequeue Front</p>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="items-center justify-between pb-5 sm:flex ">
                  <h1 className=" font-display text-4xl font-semibold sm:m-0">
                    Future Office Hour Times
                  </h1>
                </div>
                <div className="">
                  {ownedCourses.length === 0 && (
                    <p>You have no future hosted office hours at this time</p>
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
                <div className="w-full max-w-sm px-4"></div>
              </Tab.Panel>
            </Tab.Panels>
          )}
        </Container>
      </Tab.Group>
    </div>
  );
}

function nextInQueue(i: number) {
  if (i == 0) {
    return "Asking Question";
  }
  if (i == 1) {
    return "2nd in Queue";
  }
  if (i == 2) {
    return "3rd in Queue";
  }
  return i + 1 + "th in Queue";
}
function nextButton() {
  return "";
}
function createCalendar(
  start_time: string,
  end_time: string,
  link: string,
  owner_name: string,
  CourseName: string
) {
  if (false) {
    return `https://ics.agical.io/?subject=Meet%20&organizer=${owner_name}&reminder=45&location=Sandy%27s%20Desk&dtstart=${start_time}&end=${end_time}&attach=${link}`;
  }
  return "https://ics.agical.io/?subject=Meet%20{{company.Account Owner First Name}}&organizer=Sandy&reminder=45&location=Sandy%27s%20Desk&dtstart=2016-10-26T15:00:00-04:00&dtend=2016-10-26T16:00:00-04:00&attach=http://www.example.com/";
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
}

function ExitInactiveIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M6 18L18 6M6 6l12 12"
        fill="#4f46e5"
        stroke="#4f46e5"
        stroke-width="2"
      />
    </svg>
  );
}

function ExitActiveIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M6 18L18 6M6 6l12 12"
        fill="#ffffff"
        stroke="#ffffff"
        stroke-width="2"
      />
    </svg>
  );
}

function MoveInactiveIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
        fill="#4f46e5"
        stroke="#4f46e5"
        strokeWidth="2"
      />
    </svg>
  );
}

function MoveActiveIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="2"
      />
    </svg>
  );
}
let nameArray = [
  "John Smith",
  "Jane Doe",
  "Jason Dullaghan",
  "Jason Derulo",
  "Jason Smith",
];
let CourseNameArray = ["CS 320", "CS 330", "CS 340"];
let arrayQuestions = [
  "How do I use CSS to style my webpage? Specifically, I want to know how to change the font, color, and size of text, as well as how to add borders and backgrounds to elements. Can you provide some examples of CSS code and explain how they work?",
  "How can I make my webpage responsive and mobile-friendly? I've heard about media queries and viewport meta tags, but I'm not sure how to use them. Can you explain the basics of responsive web design and provide some tips for optimizing my website for different devices?",
  "What is the difference between HTML and XHTML? I know that they are both markup languages used for creating web pages, but I'm not sure how they differ in terms of syntax and structure. Can you provide some examples of HTML and XHTML code and explain the key differences between them?",
  "How do I use JavaScript to create dynamic effects on my webpage? I want to add things like dropdown menus, image sliders, and form validation to my site, but I'm not sure where to start. Can you provide some examples of JavaScript code and explain how they can be used to add interactivity to a webpage?",
];

export default Courses;
