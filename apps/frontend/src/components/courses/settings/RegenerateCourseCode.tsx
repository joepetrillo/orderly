import useSWRMutation from "swr/mutation";
import useAuthedFetch from "@/hooks/useAuthedFetch";
import SettingsCard from "./SettingsCard";
import { CourseData } from "@orderly/schema";

export default function RegenerateCourseCode({
  course_id,
}: {
  course_id: string;
}) {
  const authedFetch = useAuthedFetch();

  async function regenerateCode() {
    try {
      const res = await authedFetch(`/courses/${course_id}/code`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error) throw new Error(data.error);
        else throw new Error("An unknown error occurred");
      }

      return data.code;
    } catch (error) {
      if (error instanceof Error) throw new Error(error.message);
      else throw new Error("An unknown error occurred");
    }
  }

  const { error, trigger, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}`,
    regenerateCode,
    {
      revalidate: false,
      populateCache: (
        newCourseCode: string,
        existingCourseData: CourseData
      ) => {
        return { ...existingCourseData, code: newCourseCode };
      },
      throwOnError: false,
    }
  );

  return (
    <SettingsCard
      headerTitle="Regenerate Course Code"
      buttonTitle="Regenerate"
      description="All previous codes will be invalidated"
      loading={isMutating}
      error={error?.message}
      onSubmit={async (e) => {
        e.preventDefault();
        await trigger();
      }}
    />
  );
}
