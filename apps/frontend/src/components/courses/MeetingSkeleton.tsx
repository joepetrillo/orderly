const LoadingCard = () => {
  return (
    <div className="flex h-[190px] flex-col gap-2 rounded border border-gray-200 bg-white p-6 shadow shadow-gray-200/70">
      <div className="h-5 max-w-[180px] rounded-lg bg-gray-200" />
      <div className="mb-2 h-12 max-w-[280px] rounded-lg bg-gray-200" />
      <div className="h-5 max-w-[100px] rounded-lg bg-gray-200" />
      <div className="h-5 max-w-[210px] rounded-lg bg-gray-200" />
    </div>
  );
};

export default function MeetingSkeleton() {
  return (
    <>
      <div className="grid animate-pulse-fast gap-6 sm:grid-cols-1 lg:grid-cols-3">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    </>
  );
}
