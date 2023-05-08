import useSWRMutation from "swr/mutation";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import useAuthedFetch from "@/hooks/useAuthedFetch";

export default function GenerateNewCourseCode({
  course_id,
}: {
  course_id: string;
}) {
  const authedFetch = useAuthedFetch();

  async function regenerateCode() {
    try {
      const res = await authedFetch(`/courses/${course_id}/code`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error) throw new Error(data.error);
        else throw new Error("An unknown error occurred");
      }

      return data.code;
    } catch (error) {
      if (error instanceof Error) throw new Error(error.message);
      else throw new Error("An unknown error occurred");
    }
  }

  const { error, trigger, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}`,
    regenerateCode,
    {
      revalidate: false,
      populateCache: (newCourseCode, existingCourseData) => {
        return { ...existingCourseData, code: newCourseCode };
      },
      throwOnError: false,
    }
  );

  return (
    <div className="max-w-screen-md overflow-hidden rounded border border-gray-200 bg-white">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="font-semibold">Regenerate Course Code</h3>
        {error ? (
          <p className="mt-5 text-xs text-red-500">{error.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col items-start gap-4 border-t border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-gray-700">
          All previous codes will be invalidated
        </p>
        <fieldset disabled={isMutating}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              trigger();
            }}
          >
            <Button size="sm">
              Regenerate {isMutating && <Spinner small />}
            </Button>
          </form>
        </fieldset>
      </div>
    </div>
  );
}
