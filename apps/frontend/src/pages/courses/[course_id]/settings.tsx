import CourseLayout from "@/components/courses/CourseLayout";
import { NextPageWithLayout } from "@/pages/_app";
import { ReactElement } from "react";

const CourseSettings: NextPageWithLayout = () => {
  return <p>This would be settings page</p>;
};

CourseSettings.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default CourseSettings;
