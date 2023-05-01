import { CourseData } from "@orderly/schema";
import { Container } from "../Container";
import Link from "next/link";
import CourseHeaderSkeleton from "@/components/skeletons/CourseHeaderSkeleton";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { KeyIcon, UserIcon, AcademicCapIcon } from "@heroicons/react/20/solid";

export default function CourseHeader({
  loading,
  data,
  tabs,
}: {
  loading: boolean;
  data: CourseData | undefined;
  tabs: Array<{
    label: string;
    href: string;
    role: 0 | 1 | 2;
    pathname: string;
  }>;
}) {
  const router = useRouter();

  if (loading) return <CourseHeaderSkeleton />;
  if (!data) return null;

  return (
    <div className="border-b border-b-gray-200 bg-white pb-5 pt-10">
      <Container>
        <div className="mb-10">
          <h1 className="mb-5 line-clamp-2 font-display text-3xl font-semibold">
            {data.name}
          </h1>
          <div className="flex flex-wrap gap-4">
            <div className="inline-flex shrink-0 items-center gap-1 text-sm text-gray-500">
              <AcademicCapIcon className="h-[1.3em] w-[1.3em]" />
              <p>{data.owner_name}</p>
            </div>
            <div className="inline-flex shrink-0 items-center gap-1 text-sm text-gray-500">
              <UserIcon className="h-[1.3em] w-[1.3em]" />
              <p>
                {data.member_count}{" "}
                {data.member_count === 1 ? "Member" : "Members"}
              </p>
            </div>
            {data.role === 2 || data.role === 1 ? (
              <div className="inline-flex shrink-0 items-center gap-1 text-sm text-gray-500">
                <KeyIcon className="h-[1.3em] w-[1.3em]" />
                <p>{data.code}</p>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            if (tab.role > data.role) return;

            return (
              <Link
                href={tab.href}
                key={tab.label}
                draggable={false}
                className="relative shrink-0 rounded px-4 py-1.5 text-sm font-medium ring-indigo-400 transition duration-100 hover:bg-gray-100 focus-visible:ring-2"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <span className="relative z-10">{tab.label}</span>
                {router.pathname === tab.pathname && (
                  <motion.span
                    layoutId="course_page_header"
                    className="absolute inset-0 bg-gray-100"
                    style={{ borderRadius: 4 }}
                    transition={{
                      type: "spring",
                      bounce: 0.3,
                      duration: 0.5,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
