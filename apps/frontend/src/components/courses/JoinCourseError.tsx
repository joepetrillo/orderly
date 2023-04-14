import Input from "@/components/ui/Input";
import { useAuth } from "@clerk/nextjs";
import { courseEnrollPOST } from "@orderly/schema";
import { FormEvent, useState } from "react";
import { mutate } from "swr";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function JoinCourseError({ course_id }: { course_id: string }) {
  const { getToken } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(e.currentTarget));

    const requestBody = {
      code: formData.code,
    };

    try {
      courseEnrollPOST.body.parse(requestBody);
    } catch (error) {
      const zodError = error as z.ZodError;
      setError(zodError.issues[0].message);
      return;
    }

    setLoading(true);

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
      body: JSON.stringify(requestBody),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/course/enroll`,
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

    mutate(`${process.env.NEXT_PUBLIC_API_URL}/course/${course_id}`);
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 lg:px-8">
      <h1 className="mb-5 max-w-sm text-center text-4xl font-bold">
        You are not enrolled in this course
      </h1>
      <p className="mb-5 text-gray-500">
        Enter the course entry code to gain access.
      </p>
      <fieldset disabled={loading} className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="course_code"
            className="block text-sm font-medium leading-6"
          >
            Code
          </label>
          <div className="mb-5">
            <Input
              type="text"
              placeholder="XXXXXXX"
              id="course_code"
              name="code"
            />
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          </div>
          <Button disabled={loading} className="w-full">
            Join
            {loading && <Spinner small />}
          </Button>
        </form>
      </fieldset>
    </div>
  );
}
