import { ReactElement } from "react";
import { NextPageWithLayout } from "@/pages/_app";
import { Container } from "@/components/Container";
import CourseLayout from "@/components/courses/CourseLayout";

const Course: NextPageWithLayout = () => {
  return (
    <Container>
      <p className="mt-5">This would be default page</p>
    </Container>
  );
};

Course.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default Course;
