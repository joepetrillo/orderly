import { useAuth } from "@clerk/nextjs";
import { FormEvent, SetStateAction, useState } from "react";
import { useRouter } from "next/router";
import Modal from "@/components/ui/Modal";

export default function DeleteCourse({ course_id }: { course_id: string }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
    setOpen: (value: SetStateAction<boolean>) => void
  ) {
    e.preventDefault();
    setLoading(true);

    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}`,
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

    router.replace("/courses");
    setLoading(false);
    setOpen(false);
  }

  return (
    <div className="max-w-screen-md overflow-hidden rounded border border-red-300 bg-white">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="font-semibold ">Delete Course</h3>
      </div>
      <div className="flex flex-col items-start gap-4 border-t border-red-300 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-red-500">
          This action is irreversible, be careful!
        </p>
        <Modal
          title="Delete Course"
          actionTitle="Delete"
          handleSubmit={handleSubmit}
          loading={loading}
          setError={setError}
          initialButtonVariant="danger"
          initialButtonSize="sm"
          confirmButtonVariant="danger"
        >
          <div className="text-sm">
            <p>Are you sure you want to delete this course?</p>
            <p className="mt-2">
              Upon confirmation, everything related to this course will be lost.{" "}
              <span className="font-semibold">
                Proceed with caution. This action is irreversible.
              </span>
            </p>
            {error ? (
              <p className="mt-2 text-xs text-red-500">{error}</p>
            ) : null}
          </div>
        </Modal>
      </div>
    </div>
  );
}
