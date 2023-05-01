import { useAuth } from "@clerk/nextjs";
import { Fragment, useState } from "react";
import { mutate } from "swr";
import {
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { Listbox, Transition } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { usePopper } from "react-popper";
import { toast } from "react-hot-toast";

const roles: { role: 0 | 1; component: JSX.Element }[] = [
  {
    role: 0,
    component: (
      <span className="inline-flex h-full items-center rounded bg-indigo-100 px-2 text-xs font-semibold leading-5 text-indigo-800">
        Student
      </span>
    ),
  },
  {
    role: 1,
    component: (
      <span className="inline-flex h-full items-center rounded bg-rose-100 px-2 text-xs font-semibold leading-5 text-rose-800">
        Instructor
      </span>
    ),
  },
];

const showErrorToast = () =>
  toast.custom(
    (t) => (
      <Transition
        appear={true}
        as={Fragment}
        show={t.visible}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
          <div className="p-4">
            <div className="flex items-center">
              <div className="shrink-0">
                <XCircleIcon
                  className="h-8 w-8 text-red-500"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium">
                  There was an error while updating a role
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    ),
    { position: "bottom-right", duration: 2500 }
  );

const showSuccessToast = () =>
  toast.custom(
    (t) => (
      <Transition
        appear={true}
        as={Fragment}
        show={t.visible}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
          <div className="p-4">
            <div className="flex items-center">
              <div className="shrink-0">
                <CheckCircleIcon
                  className="h-8 w-8 text-indigo-600"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">
                  Successfully updated role
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    ),
    { position: "bottom-right", duration: 2500 }
  );

export default function UpdateMemberRole({
  role,
  course_id,
  user_id,
}: {
  role: 0 | 1;
  course_id: string;
  user_id: string;
}) {
  const { getToken } = useAuth();
  const [selected, setSelected] = useState(roles[role]);
  const [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [{ name: "offset", options: { offset: [0, 4] } }],
    placement: "bottom-start",
    strategy: "fixed",
  });

  async function handleChange(value: { role: 0 | 1; component: JSX.Element }) {
    if (selected.role === value.role) return;

    const prevSelected = selected;
    setSelected(value);

    const requestOptions = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
      body: JSON.stringify({ role: value.role }),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}/members/${user_id}`,
        requestOptions
      );

      if (!res.ok) {
        setSelected(prevSelected);
        showErrorToast();
        return;
      }
    } catch (error) {
      setSelected(prevSelected);
      showErrorToast();
      return;
    }

    showSuccessToast();
    mutate(`${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}/members`);
  }

  return (
    <Listbox value={selected} onChange={handleChange}>
      {({ open }) => (
        <div>
          <Listbox.Button
            ref={setReferenceElement}
            className="relative flex h-[40px] w-[130px] cursor-default items-center rounded border border-gray-300 bg-white py-1.5 pl-2 pr-9 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          >
            {selected.component}
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              ref={setPopperElement}
              style={styles.popper}
              {...attributes.popper}
              className="absolute z-20 max-h-60 w-full max-w-[180px] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
            >
              {roles.map((role) => (
                <Listbox.Option
                  key={role.role}
                  className={({ active }) =>
                    cn(
                      active ? "bg-indigo-600 text-white" : "text-gray-950",
                      "relative flex h-[40px] cursor-default select-none items-center border border-transparent py-1.5 pl-2 pr-9"
                    )
                  }
                  value={role}
                >
                  {({ selected, active }) => (
                    <>
                      {role.component}
                      {selected ? (
                        <span
                          className={cn(
                            active ? "text-white" : "text-indigo-600",
                            "absolute inset-y-0 right-0 flex items-center pr-2"
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
