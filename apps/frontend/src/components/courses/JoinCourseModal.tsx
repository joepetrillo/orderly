import { useAuth } from "@clerk/nextjs";
import { FormEvent, Fragment, useRef, useState } from "react";
import { mutate } from "swr";
import { Dialog, Transition } from "@headlessui/react";
import { joinCoursePOST } from "@orderly/schema";
import { z } from "zod";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function JoinCourseModal() {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

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

    mutate(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <Button
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        Join
      </Button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          className="relative z-20"
          initialFocus={cancelButtonRef}
          onClose={() => {
            if (!loading) setOpen(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4"
                enterTo="opacity-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-4"
              >
                <Dialog.Panel className="relative w-full max-w-lg overflow-hidden rounded-lg bg-white text-left text-gray-950 shadow-xl transition-all">
                  <div className="bg-white px-4 py-6 sm:px-6">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6"
                    >
                      Join Existing Course
                    </Dialog.Title>
                    <fieldset disabled={loading} className="mt-5">
                      <form onSubmit={handleSubmit} id="join_course">
                        <Input
                          inputId="course_code"
                          label="Code"
                          errorMessage={error}
                          type="text"
                          placeholder="XXXXXXX"
                          name="code"
                        />
                      </form>
                    </fieldset>
                  </div>
                  <div className="flex justify-end gap-2 bg-gray-100 px-4 py-3 sm:px-6">
                    <Button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="w-full"
                      ref={cancelButtonRef}
                      disabled={loading}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={loading}
                      className="w-full"
                      type="submit"
                      form="join_course"
                    >
                      Join
                      {loading && <Spinner small />}
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
