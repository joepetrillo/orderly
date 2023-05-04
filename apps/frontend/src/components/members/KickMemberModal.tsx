import { useAuth } from "@clerk/nextjs";
import { FormEvent, SetStateAction, useState } from "react";
import { mutate } from "swr";
import Modal from "@/components/ui/Modal";
import { XCircleIcon } from "@heroicons/react/20/solid";

export default function KickMemberModal({
  name,
  course_id,
  user_id,
}: {
  name: string;
  course_id: string;
  user_id: string;
}) {
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
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}/members/${user_id}`,
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

    mutate(`${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}/members`);
    setOpen(false);
    setLoading(false);
  }

  return (
    <Modal
      title="Kick User"
      actionTitle="Kick"
      handleSubmit={handleSubmit}
      loading={loading}
      onOpen={() => setError("")}
      initialButtonIcon={<XCircleIcon />}
      initialButtonVariant="danger"
      initialButtonSize="xs"
      confirmButtonVariant="danger"
    >
      <div className="text-sm">
        <p>
          Are you sure you want to kick{" "}
          <span className="font-semibold">{name}</span>?
        </p>
        <p className="mt-2">
          Upon confirmation, all potential office hours owned by this user and
          queue positions held will be deleted.
        </p>
        {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
      </div>
    </Modal>
  );
}
