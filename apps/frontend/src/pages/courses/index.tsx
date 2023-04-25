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

type CourseGeneral = {
  id: number;
  name: string;
  code: string;
  role: 0 | 1 | 2;
  owner_name: string;
  member_count: number;
};

const CourseCard = ({
  id,
  name,
  code,
  owner_name,
  member_count,
}: CourseGeneral) => {
  return (
    <Link
      className="flex flex-col gap-2 rounded border border-gray-200 bg-white p-6 shadow shadow-gray-200/70 transition-all duration-150  hover:border-gray-300 hover:shadow-md"
      href={`/courses/${id}`}
    >
      <p className="line-clamp-1 text-sm text-gray-500">{owner_name}</p>
      <h3 className="mb-2 line-clamp-2 h-12 font-medium">{name}</h3>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <UserIcon className="inline h-[1.3em]" />
          <p>
            {member_count}{" "}
            <span>{member_count === 1 ? "Member" : "Members"}</span>
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <KeyIcon className="inline h-[1.3em]" />
          <p>{code}</p>
        </div>
      </div>
    </Link>
  );
};

const tabs = [
  { id: "all", label: "All" },
  { id: "created", label: "Created" },
  { id: "joined", label: "Joined" },
];

export default function Courses() {
  const { data, error, loading } = useClerkSWR<CourseGeneral[]>("/courses");
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
                Courses
              </h1>
              <div className="inline-flex gap-4">
                <CreateCourseModal />
                <JoinCourseModal />
              </div>
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
        <Container className="pb-10 pt-5">
          {loading ? (
            <CoursesSkeleton />
          ) : error ? (
            <p className="text-red-500">{error.message}</p>
          ) : (
            <Tab.Panels>
              <Tab.Panel className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data?.length === 0 && (
                  <p>You have not created or joined any courses</p>
                )}
                {ownedCourses.map((curr) => (
                  <CourseCard key={curr.id} {...curr} />
                ))}
                {joinedCourses.map((curr) => (
                  <CourseCard key={curr.id} {...curr} />
                ))}
              </Tab.Panel>
              <Tab.Panel className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {ownedCourses.length === 0 && (
                  <p>You have not created any courses</p>
                )}
                {ownedCourses.map((curr) => (
                  <CourseCard key={curr.id} {...curr} />
                ))}
              </Tab.Panel>
              <Tab.Panel className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {joinedCourses.length === 0 && (
                  <p>You have not joined any courses</p>
                )}
                {joinedCourses.map((curr) => (
                  <CourseCard key={curr.id} {...curr} />
                ))}
              </Tab.Panel>
            </Tab.Panels>
          )}
        </Container>
      </Tab.Group>
    </div>
  );
}
