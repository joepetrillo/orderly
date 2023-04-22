import Input from "@/components/ui/Input";
import { useAuth } from "@clerk/nextjs";
import { joinCoursePOST } from "@orderly/schema";
import { FormEvent, useState } from "react";
import { mutate } from "swr";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { Container } from "@/components/Container";

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
      joinCoursePOST.body.parse(requestBody);
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
        `${process.env.NEXT_PUBLIC_API_URL}/courses/enroll`,
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
  }

  return (
    <Container className="flex flex-col items-center justify-center py-20">
      <h1 className="max-w-sm text-center font-display text-4xl font-bold">
        You are not enrolled in this course
      </h1>
      <p className="mt-5 text-center text-gray-600">
        Enter the course code to gain access
      </p>
      <fieldset disabled={loading} className="mt-8 w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <label htmlFor="course_code" className="block font-medium leading-6">
            Code
          </label>
          <Input
            type="text"
            placeholder="XXXXXXX"
            id="course_code"
            name="code"
            className="mt-2"
          />
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          <Button disabled={loading} className="mt-5 w-full">
            Join
            {loading && <Spinner small />}
          </Button>
        </form>
      </fieldset>
    </Container>
  );
}
