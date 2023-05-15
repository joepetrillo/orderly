const OwnedMeetingCard = () => {
  return (
    <div className="rounded border border-gray-200">
      <div className="flex h-[65px] items-center border-b border-gray-200 bg-gray-50 p-4 sm:px-6">
        <div className="h-6 w-full max-w-[110px] rounded-lg bg-gray-200" />
      </div>
      <div className="divide-y px-4 text-sm leading-6 text-gray-700 sm:px-6">
        <div className="flex h-[56px] items-center">
          <div className="h-6 w-full max-w-[140px] rounded-lg bg-gray-200" />
        </div>
        <div className="flex h-[56px] items-center">
          <div className="h-6 w-full max-w-[300px] rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default function OwnedMeetingSkeleton() {
  return (
    <div className="animate-pulse-fast grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
      <OwnedMeetingCard />
      <OwnedMeetingCard />
      <OwnedMeetingCard />
      <OwnedMeetingCard />
      <OwnedMeetingCard />
      <OwnedMeetingCard />
    </div>
  );
}
