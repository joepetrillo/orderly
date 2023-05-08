import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import useAuthedFetch from "@/hooks/useAuthedFetch";
import { updateCourseNamePATCH } from "@orderly/schema";

export default function ChangeCourseName({ course_id }: { course_id: string }) {
  const authedFetch = useAuthedFetch();
  const [name, setName] = useState("");

  async function updateName(key: string, { arg }: { arg: string }) {
    try {
      updateCourseNamePATCH.body.parse({ name: arg });
    } catch (error) {
      const zodError = error as z.ZodError;
      throw new Error(zodError.issues[0].message);
    }

    try {
      const res = await authedFetch(`/courses/${course_id}/name`, {
        method: "PATCH",
        body: JSON.stringify({ name: arg }),
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
      populateCache: (newCourseName, existingCourseData) => {
        return { ...existingCourseData, name: newCourseName };
      },
      throwOnError: false,
    }
  );

  return (
    <div className="max-w-screen-md overflow-hidden rounded border border-gray-200 bg-white">
      <fieldset disabled={isMutating}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            trigger(name);
          }}
        >
          <div className="px-4 py-5 sm:p-6">
            <h3 className="font-semibold">Change Course Name</h3>
            <div className="mt-6">
              <Input
                inputId="update_course_name"
                label="New Name"
                errorMessage={error?.message}
                name="name"
                placeholder="Computer Programming 101"
                onChange={(e) => setName(e.currentTarget.value)}
                value={name}
              />
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 border-t border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-gray-700">
              Please use between 5 and 100 characters
            </p>
            <Button size="sm">Update {isMutating && <Spinner small />}</Button>
          </div>
        </form>
      </fieldset>
    </div>
  );
}
