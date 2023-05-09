import { useRouter } from "next/router";
import { FormEvent, SetStateAction } from "react";
import useSWRMutation from "swr/mutation";
import Modal from "@/components/ui/Modal";
import useAuthedFetch from "@/hooks/useAuthedFetch";
import SettingsCard from "./SettingsCard";

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

      await router.replace("/");
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

  const confirm = (
    <Modal
      title="Delete Course"
      actionTitle="Delete"
      handleSubmit={async (
        e: FormEvent<HTMLFormElement>,
        setOpen: (value: SetStateAction<boolean>) => void
      ) => {
        e.preventDefault();
        await trigger(setOpen);
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
        {error && <p className="mt-2 text-xs text-red-500">{error.message}</p>}
      </div>
    </Modal>
  );

  return (
    <SettingsCard
      headerTitle="Delete Course"
      description="This action is irreversible, be careful!"
      loading={isMutating}
      customButton={confirm}
      danger={true}
    />
  );
}
