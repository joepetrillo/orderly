import { useAuth } from "@clerk/nextjs";
import { FormEvent, Fragment, useRef, useState } from "react";
import { mutate } from "swr";
import { Dialog, Transition } from "@headlessui/react";
import Spinner from "@/components/Spinner";
import { courseEnrollPOST } from "@orderly/schema";
import { z } from "zod";

export default function JoinCourse() {
  const { getToken } = useAuth();

  const [open, setOpen] = useState(false);
  const [loading, isLoading] = useState(false);
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

    isLoading(true);
    setError("");

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
      body: JSON.stringify(requestBody),
    };

    // send a request to the API to update the data (TODO - better error handling here)
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/course/enroll`,
      requestOptions
    );

    mutate(`${process.env.NEXT_PUBLIC_API_URL}/course`);

    setOpen(false);
    isLoading(false);
  }

  return (
    <>
      <button
        className="rounded border-[1px] border-blue-400 bg-blue-100 px-6 py-2 font-medium transition-all duration-100 hover:bg-blue-200"
        onClick={() => setOpen(true)}
      >
        Join Existing Course
      </button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          className="relative z-20"
          initialFocus={cancelButtonRef}
          onClose={() => setOpen(false)}
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
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
                <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left text-gray-900 shadow-xl transition-all">
                  <div className="bg-white px-4 py-6 sm:px-6">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6"
                    >
                      Join Existing Course
                    </Dialog.Title>
                    <div className="mt-4">
                      <fieldset disabled={loading}>
                        <form onSubmit={handleSubmit} id="create_course">
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
                            className="mt-2 block w-full rounded p-1.5 px-4 text-sm shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400"
                          />
                        </form>
                      </fieldset>
                      {error && (
                        <p className="mt-2 text-xs text-red-500">{error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 bg-gray-50 px-4 py-3 sm:px-6">
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center rounded bg-white px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-inset ring-gray-300 transition-all duration-100 hover:bg-gray-50 disabled:pointer-events-none"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      disabled={loading}
                      type="submit"
                      form="create_course"
                      className="inline-flex w-full items-center justify-center gap-3 rounded bg-blue-100 px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-inset ring-blue-400 transition-all duration-100 hover:bg-blue-200 disabled:pointer-events-none"
                    >
                      Join
                      {loading && <Spinner small />}
                    </button>
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