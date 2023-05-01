import { Container } from "@/components/Container";
import CourseLayout from "@/components/courses/CourseLayout";
import { NextPageWithLayout } from "@/pages/_app";
import { ReactElement } from "react";

const CourseSettings: NextPageWithLayout = () => {
  return (
    <Container>
      <p className="mt-5">This would be settings page</p>
    </Container>
  );
};

CourseSettings.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default CourseSettings;
