const LoadingCard = () => {
  return (
    <div className="flex h-[162px] flex-col gap-2 rounded border border-gray-200 bg-white p-6 shadow shadow-gray-200/70">
      <div className="h-5 max-w-[180px] rounded-lg bg-gray-200" />
      <div className="mb-2 h-12 max-w-[280px] rounded-lg bg-gray-200" />
      <div className="flex items-center justify-between gap-8">
        <div className="h-5 w-full rounded-lg bg-gray-200" />
        <div className="h-5 w-full rounded-lg bg-gray-200" />
      </div>
    </div>
  );
};

export default function AllCoursesSkeleton() {
  return (
    <>
      <div className="grid animate-pulse-fast gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    </>
  );
}
