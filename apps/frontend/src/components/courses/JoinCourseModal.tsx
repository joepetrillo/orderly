import { useAuth } from "@clerk/nextjs";
import { FormEvent, SetStateAction, useState } from "react";
import { mutate } from "swr";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { joinCoursePOST } from "@orderly/schema";

export default function JoinCourseModal() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
    setOpen: (value: SetStateAction<boolean>) => void
  ) {
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

    mutate(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
    setLoading(false);
    setOpen(false);
  }

  return (
    <Modal
      title="Join Existing Course"
      actionTitle="Join"
      handleSubmit={handleSubmit}
      loading={loading}
      setError={setError}
    >
      <Input
        inputId="course_code"
        label="Code"
        errorMessage={error}
        type="text"
        placeholder="XXXXXXX"
        name="code"
      />
    </Modal>
  );
}
