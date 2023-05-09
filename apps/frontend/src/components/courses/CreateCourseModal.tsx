import { useAuth } from "@clerk/nextjs";
import { FormEvent, SetStateAction, useState } from "react";
import { mutate } from "swr";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { createCoursePOST } from "@orderly/schema";

export default function CreateCourseModal() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
    setOpen: (value: SetStateAction<boolean>) => void
  ) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(e.currentTarget));
    const courseName = formData.name as string;

    const requestBody = {
      name: courseName.replace(/\s{2,}/g, " ").trim(),
    };

    try {
      createCoursePOST.body.parse(requestBody);
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
        `${process.env.NEXT_PUBLIC_API_URL}/courses`,
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
      title="Create New Course"
      actionTitle="Create"
      handleSubmit={handleSubmit}
      loading={loading}
      onOpen={() => setError("")}
    >
      <Input
        inputId="course_name"
        label="Name"
        errorMessage={error}
        type="text"
        placeholder="Computer Programming 101"
        name="name"
      />
    </Modal>
  );
}
