import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { z } from "zod";
import SettingsCard from "@/components/courses/settings/SettingsCard";
import Input from "@/components/ui/Input";
import useAuthedFetch from "@/hooks/useAuthedFetch";
import { CourseData, updateCourseNamePATCH } from "@orderly/schema";

export default function ChangeCourseName({ course_id }: { course_id: string }) {
  const authedFetch = useAuthedFetch();
  const [name, setName] = useState("");

  async function updateName() {
    const requestBody = {
      name: name.replace(/\s{2,}/g, " ").trim(),
    };

    try {
      updateCourseNamePATCH.body.parse(requestBody);
    } catch (error) {
      const zodError = error as z.ZodError;
      throw new Error(zodError.issues[0].message);
    }

    try {
      const res = await authedFetch(`/courses/${course_id}/name`, {
        method: "PATCH",
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error) throw new Error(data.error);
        else throw new Error("An unknown error occurred");
      }

      setName("");
      return data.name;
    } catch (error) {
      if (error instanceof Error) throw new Error(error.message);
      else throw new Error("An unknown error occurred");
    }
  }

  const { error, trigger, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}`,
    updateName,
    {
      revalidate: false,
      populateCache: (
        newCourseName: string,
        existingCourseData: CourseData
      ) => {
        return { ...existingCourseData, name: newCourseName };
      },
      throwOnError: false,
    }
  );

  return (
    <SettingsCard
      headerTitle="Change Course Name"
      buttonTitle="Update"
      description="Please use between 5 and 100 characters"
      loading={isMutating}
      onSubmit={async (e) => {
        e.preventDefault();
        await trigger();
      }}
    >
      <Input
        label="New Name"
        placeholder="Computer Programming 101"
        errorMessage={error?.message}
        name="name"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        inputId="update_course_name"
      />
    </SettingsCard>
  );
}
