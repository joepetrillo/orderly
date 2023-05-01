import { Container } from "@/components/Container";
import CourseLayout from "@/components/courses/CourseLayout";
import { NextPageWithLayout } from "@/pages/_app";
import { ReactElement } from "react";
import Image from "next/image";
import { Member } from "@orderly/schema";
import { useRouter } from "next/router";
import useClerkSWR from "@/hooks/useClerkSWR";
import MembersSkeleton from "@/components/skeletons/MembersSkeleton";
import KickMemberModal from "@/components/members/KickMemberModal";
import UpdateMemberRole from "@/components/members/UpdateMemberRole";

const CourseMembers: NextPageWithLayout = () => {
  const router = useRouter();
  const { course_id } = router.query as { course_id: string };

  const { data, error, loading } = useClerkSWR<Member[]>(
    `/courses/${course_id}/members`
  );

  if (error) {
    return (
      <p className="flex justify-center py-10 text-red-500">{error.message}</p>
    );
  }

  return (
    <div className="pb-10 pt-5">
      <Container>
        <h1 className="text-xl font-semibold">Members</h1>
        <p className="mt-2 text-sm text-gray-700">
          All users enrolled in your course
        </p>
        {loading ? (
          <MembersSkeleton />
        ) : data?.length === 0 ? (
          <p className="mt-10">Nobody has joined this course yet</p>
        ) : (
          <div className="-mx-4 mt-10 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden border border-gray-200 md:rounded">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data?.map((user) => (
                      <tr key={user.emailAddress}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="relative h-10 w-10 shrink-0">
                              <Image
                                className="h-10 w-10 rounded-full"
                                fill={true}
                                sizes="2.5rem"
                                src={user.profileImageUrl}
                                alt="avatar"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div>{user.emailAddress}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <UpdateMemberRole
                            role={user.role}
                            course_id={course_id}
                            user_id={user.id}
                          />
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <KickMemberModal
                            name={user.name}
                            course_id={course_id}
                            user_id={user.id}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

CourseMembers.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default CourseMembers;
