export default function MembersSkeleton() {
  return (
    <div className="-mx-4 mt-10 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full md:px-6 lg:px-8">
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
                  className="px-3 py-3.5 text-left text-sm font-semibold"
                >
                  <span className="sr-only">actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="animate-pulse-fast divide-y divide-gray-200">
              {new Array(6).fill(0).map((curr, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 rounded-full bg-gray-200" />
                      <div className="h-5 w-[140px] rounded bg-gray-200" />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="h-5 w-[180px] rounded bg-gray-200" />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="h-5 w-[130px] rounded bg-gray-200" />
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6">
                    <div className="float-right h-5 w-[70px] rounded bg-gray-200" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
