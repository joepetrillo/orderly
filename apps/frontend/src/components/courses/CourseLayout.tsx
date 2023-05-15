import { useRouter } from "next/router";
import CourseHeader from "@/components/courses/CourseHeader";
import JoinCourseError from "@/components/courses/JoinCourseError";
import Spinner from "@/components/ui/Spinner";
import useClerkSWR from "@/hooks/useClerkSWR";
import NotFound from "@/pages/404";
import { coursePARAM, CourseData } from "@orderly/schema";

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { course_id } = router.query as { course_id: string };
  const paramOk = coursePARAM.params.safeParse({ course_id });

  const { data, error, loading } = useClerkSWR<CourseData>(
    paramOk.success === true ? `/courses/${course_id}` : null
  );

  if (!course_id) return null;

  if (paramOk.success === false) return <NotFound />;

  if (error) {
    if (error.status === 404) {
      return <NotFound />;
    }
    if (error.status === 403) {
      return <JoinCourseError course_id={course_id} />;
    }
    return (
      <p className="flex justify-center py-20 text-red-500">{error.message}</p>
    );
  }

  const tabs: Array<{
    label: string;
    href: string;
    role: 0 | 1 | 2;
    pathname: string;
  }> = [
    {
      label: "Office Hours",
      role: 0,
      href: `/courses/${course_id}`,
      pathname: "/courses/[course_id]",
    },
    {
      label: "Schedule",
      role: 1,
      href: `/courses/${course_id}/schedule`,
      pathname: "/courses/[course_id]/schedule",
    },
    {
      label: "Members",
      role: 2,
      href: `/courses/${course_id}/members`,
      pathname: "/courses/[course_id]/members",
    },
    {
      label: "Settings",
      role: 0,
      href: `/courses/${course_id}/settings`,
      pathname: "/courses/[course_id]/settings",
    },
  ];

  // make sure user has role to access the page they are currently trying to visit, else show not found for now (more meaningful msg later on)
  if (data) {
    const roleRequired = tabs.find(
      (tab) => tab.pathname === router.pathname
    )?.role;
    if (roleRequired !== undefined) {
      if (data.role < roleRequired) return <NotFound />;
    }
  }

  return (
    <div className="min-h-dash">
      <CourseHeader loading={loading} data={data} tabs={tabs} />
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
