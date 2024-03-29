import { useAuth } from "@clerk/nextjs";
import { FormEvent, useState } from "react";
import { mutate } from "swr";
import { z } from "zod";
import { Container } from "@/components/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { joinCoursePOST } from "@orderly/schema";

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
      <h1 className="font-display max-w-sm text-center text-4xl font-bold">
        You are not enrolled in this course
      </h1>
      <p className="mt-5 text-center text-gray-600">
        Enter the course code to gain access
      </p>
      <fieldset disabled={loading} className="mt-8 w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <Input
            inputId="course_code"
            label="Code"
            errorMessage={error}
            type="text"
            placeholder="XXXXXXX"
            name="code"
          />
          <Button className="mt-5 w-full">
            Join
            {loading && <Spinner small />}
          </Button>
        </form>
      </fieldset>
    </Container>
  );
}
