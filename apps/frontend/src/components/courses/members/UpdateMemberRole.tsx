import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { Fragment, useState } from "react";
import { usePopper } from "react-popper";
import useSWRMutation from "swr/mutation";
import { showErrorToast, showSuccessToast } from "@/components/ui/Toast";
import useAuthedFetch from "@/hooks/useAuthedFetch";
import { cn } from "@/lib/utils";
import { Member } from "@orderly/schema";

function RoleBadge({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-full items-center rounded px-2 text-xs font-semibold leading-5",
        className
      )}
    >
      {children}
    </span>
  );
}

const roles: { role: 0 | 1; component: JSX.Element }[] = [
  {
    role: 0,
    component: (
      <RoleBadge className="bg-indigo-100 text-indigo-800">Student</RoleBadge>
    ),
  },
  {
    role: 1,
    component: (
      <RoleBadge className="bg-rose-100 text-rose-800">Instructor</RoleBadge>
    ),
  },
];

export default function UpdateMemberRole({
  role,
  course_id,
  user_id,
}: {
  role: 0 | 1;
  course_id: string;
  user_id: string;
}) {
  const [selected, setSelected] = useState(roles[role]);
  const [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [{ name: "offset", options: { offset: [0, 4] } }],
    placement: "bottom-start",
    strategy: "fixed",
  });

  const authedFetch = useAuthedFetch();

  async function updateRole(
    key: string,
    { arg: newValue }: { arg: { role: 0 | 1; component: JSX.Element } }
  ) {
    try {
      const res = await authedFetch(
        `/courses/${course_id}/members/${user_id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: newValue.role }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (data.error) throw new Error(data.error);
        else throw new Error("An unknown error occurred");
      }

      showSuccessToast("Successfully updated role");
      return data;
    } catch (error) {
      if (error instanceof Error) throw new Error(error.message);
      else throw new Error("An unknown error occurred");
    }
  }

  const { trigger } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}/members`,
    updateRole,
    {
      revalidate: false,
      populateCache: (
        updatedMember: { user_id: string; course_id: string; role: 0 | 1 },
        memberList: Member[]
      ) => {
        return memberList.map((member) => {
          if (member.id === updatedMember.user_id) {
            member.role = updatedMember.role;
          }
          return member;
        });
      },
    }
  );

  async function handleChange(newValue: {
    role: 0 | 1;
    component: JSX.Element;
  }) {
    if (selected.role === newValue.role) return;

    const prevSelected = selected;
    setSelected(newValue);

    try {
      await trigger(newValue);
    } catch (err) {
      setSelected(prevSelected);
      showErrorToast("There was an error while updating a role");
    }
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
