import { FormEvent, SetStateAction } from "react";
import { useRouter } from "next/router";
import Modal from "@/components/ui/Modal";
import useAuthedFetch from "@/hooks/useAuthedFetch";
import useSWRMutation from "swr/mutation";

export default function DeleteCourse({ course_id }: { course_id: string }) {
  const router = useRouter();
  const authedFetch = useAuthedFetch();

  async function deleteCourse(
    key: string,
    { arg: setOpen }: { arg: (value: SetStateAction<boolean>) => void }
  ) {
    try {
      const res = await authedFetch(`/courses/${course_id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error) throw new Error(data.error);
        else throw new Error("An unknown error occurred");
      }

      router.replace("/");
      setOpen(false);
    } catch (error) {
      if (error instanceof Error) throw new Error(error.message);
      else throw new Error("An unknown error occurred");
    }
  }

  const { error, trigger, isMutating, reset } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}`,
    deleteCourse,
    {
      revalidate: false,
      populateCache: () => undefined, // remove from cache
      throwOnError: false,
    }
  );

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
          handleSubmit={(
            e: FormEvent<HTMLFormElement>,
            setOpen: (value: SetStateAction<boolean>) => void
          ) => {
            e.preventDefault();
            trigger(setOpen);
          }}
          loading={isMutating}
          onOpen={() => reset()}
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
