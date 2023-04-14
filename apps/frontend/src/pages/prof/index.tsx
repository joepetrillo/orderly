import Button from "@/components/ui/Button";

export default function ProfOfficeHours() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 lg:px-8">
      <h1 className="mb-5 text-4xl font-bold">Current Office Hour</h1>
      <div className="flex">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          <div>
            <p className="">INFO 190F Prof Jaime</p>
            <p className="">4/16, 3:00 to 5:00pm</p>
          </div>

          <Button>Join Zoom</Button>
        </div>
      </div>
      <h1 className="mb-5 pt-6 text-4xl font-bold">Current Queue</h1>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-md border-[1px] border-gray-300/60 bg-white p-4 shadow-md transition-all duration-100 hover:shadow">
          <div className="px-4">
            <p className="text-center">Jason Dullaghan</p>
            <p className="text-center">Submission Type: Private Question</p>
            <br />
            <br />
            <div className="rounded-md border-[1px] border-gray-300/60 bg-white p-4 shadow-md transition-all duration-100 hover:shadow">
              <p className="text-center">Question</p>
              <p className="text-center">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat...
              </p>
            </div>
          </div>

          <br />
          <br />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-2">
            <Button variant="ghost">Move to front</Button>
            <Button className="">Remove from Queue</Button>
          </div>
        </div>
      </div>
      <h1 className="mb-5 text-4xl font-bold">Upcoming Office Hours</h1>
      <div>
        <p className="pl-2">CS 320 Prof Jaime</p>
        <p className="pl-2">4/15, 8:00 to 9:00pm</p>
        <Button variant="outline">Add to Calendar</Button>
      </div>
      <div>
        <p className="pl-2">INFO 190F Prof Jaime</p>
        <p className="pl-2">4/16, 3:00 to 5:00pm</p>
        <Button variant="outline">Add to Calendar</Button>
      </div>
    </div>
  );
}
