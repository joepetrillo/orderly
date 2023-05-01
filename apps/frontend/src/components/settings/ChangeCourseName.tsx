import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@clerk/nextjs";
import { updateCourseNamePATCH } from "@orderly/schema";
import { FormEvent, useState } from "react";
import { mutate } from "swr";
import { z } from "zod";
import Spinner from "../ui/Spinner";

export default function ChangeCourseName({ course_id }: { course_id: string }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(e.currentTarget));
    const requestBody = {
      name: formData.name,
    };

    try {
      updateCourseNamePATCH.body.parse(requestBody);
    } catch (error) {
      const zodError = error as z.ZodError;
      setError(zodError.issues[0].message);
      return;
    }

    setLoading(true);

    const requestOptions = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
      body: JSON.stringify(requestBody),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}/name`,
        requestOptions
      );
      const data = await res.json();

      if (!res.ok) {
        if (data.error) {
          setError(data.error);
        } else {
          setError("An unexpected error has occurred, please try again later");
        }
        setLoading(false);
        return;
      }
    } catch (error) {
      setError(
        "There was an error reaching the server, please try again later"
      );
      setLoading(false);
      return;
    }

    mutate(`${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}`);
    setLoading(false);
    setError("");
  }

  return (
    <div className="max-w-screen-md overflow-hidden rounded border border-gray-200 bg-white">
      <fieldset disabled={loading}>
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-5 sm:p-6">
            <h3 className="font-semibold">Change Course Name</h3>
            <div className="mt-6">
              <Input
                inputId="update_course_name"
                label="New Name"
                errorMessage={error}
                name="name"
              />
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 border-t border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-gray-700">
              Please use between 5 and 100 characters
            </p>
            <Button size="sm">Update {loading && <Spinner small />}</Button>
          </div>
        </form>
      </fieldset>
    </div>
  );
}
