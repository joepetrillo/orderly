import { useAuth } from "@clerk/nextjs";
import { FormEvent, Fragment, useRef, useState } from "react";
import { mutate } from "swr";
import { Dialog, Transition } from "@headlessui/react";
import { courseEnrollPOST } from "@orderly/schema";
import { z } from "zod";
import Spinner from "@/components/UI/Spinner";
import Button from "@/components/UI/Button";

export default function JoinCourseModal() {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cancelButtonRef = useRef(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(e.currentTarget));

    const requestBody = {
      code: formData.code,
    };

    try {
      courseEnrollPOST.body.parse(requestBody);
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
        `${process.env.NEXT_PUBLIC_API_URL}/course/enroll`,
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

    mutate(`${process.env.NEXT_PUBLIC_API_URL}/course`);
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
        Join Existing Course
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

          <div className="fixed inset-0 z-20 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
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
                    <div className="mt-4">
                      <fieldset disabled={loading}>
                        <form onSubmit={handleSubmit} id="join_course">
                          <label
                            htmlFor="course_code"
                            className="block text-sm font-medium leading-6"
                          >
                            Code
                          </label>
                          <input
                            type="text"
                            name="code"
                            id="course_code"
                            placeholder="XXXXXXX"
                            className="mt-2 block w-full appearance-none rounded p-2 px-4 text-sm shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400"
                          />
                        </form>
                      </fieldset>
                      {error && (
                        <p className="mt-2 text-xs text-red-500">{error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 bg-gray-50 px-4 py-3 sm:px-6">
                    <Button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="w-full"
                      ref={cancelButtonRef}
                      disabled={loading}
                      variant="ghost"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={loading}
                      className="w-full"
                      type="submit"
                      form="join_course"
                      size="sm"
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
