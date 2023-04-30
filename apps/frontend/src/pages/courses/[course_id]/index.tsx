import CourseLayout from "@/components/courses/CourseLayout";
import { NextPageWithLayout } from "@/pages/_app";
import { ReactElement } from "react";

const Course: NextPageWithLayout = () => {
  return <p>This would be default page</p>;
};

Course.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default Course;
