import { Container } from "@/components/Container";
import CourseLayout from "@/components/courses/CourseLayout";
import ChangeCourseName from "@/components/settings/ChangeCourseName";
import DeleteCourse from "@/components/settings/DeleteCourse";
import GenerateNewCourseCode from "@/components/settings/GenerateNewCourseCode";
import { NextPageWithLayout } from "@/pages/_app";
import { useRouter } from "next/router";
import { ReactElement } from "react";

const CourseSettings: NextPageWithLayout = () => {
  const router = useRouter();
  const { course_id } = router.query as { course_id: string };

  return (
    <div className="pb-10 pt-5">
      <Container>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-gray-700">Edit course details</p>
        <div className="mt-10 space-y-10">
          <ChangeCourseName course_id={course_id} />
          <GenerateNewCourseCode course_id={course_id} />
          <DeleteCourse course_id={course_id} />
        </div>
      </Container>
    </div>
  );
};

CourseSettings.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default CourseSettings;
