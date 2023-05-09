import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { FormEvent, SetStateAction } from "react";
import useSWRMutation from "swr/mutation";
import SettingsCard from "@/components/courses/settings/SettingsCard";
import Modal from "@/components/ui/Modal";
import useAuthedFetch from "@/hooks/useAuthedFetch";

export default function DeleteCourse({ course_id }: { course_id: string }) {
  const router = useRouter();
  const { userId } = useAuth();
  const authedFetch = useAuthedFetch();

  async function leaveCourse(
    key: string,
    { arg: setOpen }: { arg: (value: SetStateAction<boolean>) => void }
  ) {
    try {
      const res = await authedFetch(`/courses/${course_id}/members/${userId}`, {
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
    leaveCourse,
    {
      revalidate: false,
      populateCache: () => undefined, // remove from cache
      throwOnError: false,
    }
  );

  const confirm = (
    <Modal
      title="Leave Course"
      actionTitle="Leave"
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
        <p>Are you sure you want to leave this course?</p>
        <p className="mt-2">
          Upon confirmation, all potential office hours owned by you and queue
          positions held will be deleted.{" "}
          <span className="font-semibold">Proceed with caution.</span>
        </p>
        {error && <p className="mt-2 text-xs text-red-500">{error.message}</p>}
      </div>
    </Modal>
  );

  return (
    <SettingsCard
      headerTitle="Leave Course"
      description="You will need a valid entry code to rejoin"
      loading={isMutating}
      customButton={confirm}
      danger={true}
    />
  );
}
