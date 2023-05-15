import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { Fragment } from "react";
import useSWRMutation from "swr/mutation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import useAuthedFetch from "@/hooks/useAuthedFetch";
import useClerkSWR from "@/hooks/useClerkSWR";
import { cn } from "@/lib/utils";
import { Member } from "@orderly/schema";

type QueueMember = Omit<Member, "emailAddress" | "role">;

// const data = [
//   {
//     id: "user_2MLd4RVzidlqHKGjUC8qcG6gcjC",
//     name: "Joe Petrillo",
//     profileImageUrl: "https://www.gravatar.com/avatar?d=mp",
//   },
//   {
//     id: "user_1",
//     name: "Giannis Antetokounmpo",
//     profileImageUrl: "https://www.gravatar.com/avatar?d=mp",
//   },
//   {
//     id: "user_2",
//     name: "Giannis Antetokounmpo",
//     profileImageUrl: "https://www.gravatar.com/avatar?d=mp",
//   },
//   {
//     id: "user_3",
//     name: "Michael Johnson",
//     profileImageUrl: "https://www.gravatar.com/avatar?d=mp",
//   },
//   {
//     id: "user_4",
//     name: "Emily Davis",
//     profileImageUrl: "https://www.gravatar.com/avatar?d=mp",
//   },
//   {
//     id: "user_7FcW4bUyQY6p2S1aW8hN",
//     name: "Giannis Antetokounmpo",
//     profileImageUrl: "https://www.gravatar.com/avatar?d=mp",
//   },
//   {
//     id: "user_4PbW3dQt6qL9H6ZjI2sA",
//     name: "Michael Brown",
//     profileImageUrl: "https://www.gravatar.com/avatar?d=mp",
//   },
//   {
//     id: "user_1ReT6sLq9Q7Y3aD8fX2g",
//     name: "Jennifer Martinez",
//     profileImageUrl: "https://www.gravatar.com/avatar?d=mp",
//   },
//   {
//     id: "user_3GoK4nZa8jD5sP2bU0wQ",
//     name: "Christopher Davis",
//     profileImageUrl: "https://www.gravatar.com/avatar?d=mp",
//   },
//   {
//     id: "user_9RkU0qPzK8jV7A2oG1eX",
//     name: "Jessica Taylor",
//     profileImageUrl: "https://www.gravatar.com/avatar?d=mp",
//   },
//   {
//     id: "user_2ElX7mFsYcW3tJ5vK1dP",
//     name: "Matthew Wilson",
//     profileImageUrl: "https://www.gravatar.com/avatar?d=mp",
//   },
//   {
//     id: "user_0QvZ9nEiDdC6wX8rU3jG",
//     name: "Daniel Lee",
//     profileImageUrl: "https://www.gravatar.com/avatar?d=mp",
//   },
//   {
//     id: "user_3BsC8nWxYwA6eK1sD7jM",
//     name: "Nicole Garcia",
//     profileImageUrl: "https://www.gravatar.com/avatar?d=mp",
//   },
//   {
//     id: "user_4HjM7tRaSbV3vN6uE8mK",
//     name: "Ryan Rodriguez",
//     profileImageUrl: "https://www.gravatar.com/avatar?d=mp",
//   },
//   {
//     id: "user_1WvE2kXuKrZ5qN3tC6iM",
//     name: "Heather Martinez",
//     profileImageUrl: "https://www.gravatar.com/avatar?d=mp",
//   },
// ];

function DeleteMeeting(props: {
  meeting_id: number;
  course_id: string;
  user_id: string;
}) {
  const authedFetch = useAuthedFetch();

  async function deleteMeeting() {
    try {
      const res = await authedFetch(
        `/courses/${props.course_id}/meetings/${props.meeting_id}/dequeue/${props.user_id}`,
        {
          method: "DELETE",
        }
      );

      const deletedMeeting = await res.json();

      if (!res.ok) {
        if (deletedMeeting.error) throw new Error(deletedMeeting.error);
        else throw new Error("An unknown error occurred");
      }

      return deletedMeeting;
    } catch (error) {
      if (error instanceof Error) throw new Error(error.message);
      else throw new Error("An unknown error occurred");
    }
  }

  const { error, trigger, isMutating, reset } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${props.course_id}/meetings/${props.meeting_id}/queue`,
    deleteMeeting,
    {
      populateCache: (deletedQueueRow, existingQueue: QueueMember[]) => {
        return existingQueue.filter((user) => {
          return user.id !== deletedQueueRow.user_id;
        });
      },
      throwOnError: false,
    }
  );

  return (
    <Menu.Item>
      {({ active, close }) => (
        <button
          disabled={isMutating}
          onClick={async (e) => {
            e.preventDefault();
            await trigger();
            close();
          }}
          className={cn(
            active ? "bg-gray-100 text-gray-900" : "text-gray-700",
            "flex w-full items-center justify-between px-4 py-2 text-left text-sm"
          )}
        >
          <span>Kick from queue</span>
          {isMutating && <Spinner small />}
        </button>
      )}
    </Menu.Item>
  );
}

function QueueMemberOptions(props: {
  meeting_id: number;
  course_id: string;
  user_id: string;
}) {
  return (
    <Menu as="div" className="relative inline-block text-left ">
      <div>
        <Menu.Button className="-mr-1 flex items-center rounded p-1 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
          <span className="sr-only">Open options</span>
          <EllipsisVerticalIcon
            className="h-[1.3em] w-[1.3em] shrink-0"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 min-w-[14rem] origin-top-right rounded bg-white shadow-lg ring-1 ring-black/5  focus:outline-none">
          <div className="py-1">
            <DeleteMeeting {...props} />
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default function Queue({
  meeting_id,
  course_id,
}: {
  meeting_id: number;
  course_id: string;
}) {
  const { data, error, loading } = useClerkSWR<QueueMember[]>(
    `/courses/${course_id}/meetings/${meeting_id}/queue`
  );

  if (error) {
    return (
      <p className="flex justify-center py-4 text-red-500">{error.message}</p>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  if (!data) return null;

  if (data.length === 0) {
    return (
      <p className="flex justify-center py-4">No students have signed up</p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((user, index) => {
          return (
            <div
              key={user.id}
              className="rounded border border-gray-200 bg-white px-4 py-2 shadow-sm shadow-gray-200/70 transition-all duration-150  hover:border-gray-300 hover:shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                    <Image
                      className="object-cover"
                      fill={true}
                      sizes="2.5rem"
                      src={user.profileImageUrl}
                      alt="avatar"
                    />
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="min-w-0 truncate">{user.name}</p>
                    {index === 0 && (
                      <p className="inline-flex items-center rounded bg-emerald-100 px-2.5 py-1 text-xs text-emerald-800">
                        Current
                      </p>
                    )}
                    {index === 1 && (
                      <p className="inline-flex items-center whitespace-nowrap rounded bg-yellow-100 px-2.5 py-1 text-xs text-yellow-800">
                        Up Next
                      </p>
                    )}
                  </div>
                </div>
                <QueueMemberOptions
                  meeting_id={meeting_id}
                  course_id={course_id}
                  user_id={user.id}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
