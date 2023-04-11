import Button from "@/components/UI/Button";

export default function Upcoming() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 lg:px-8">
      <h1 className="mb-5 text-4xl font-bold">Current Office Hours</h1>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-md border-[1px] border-gray-300/60 bg-white p-4 shadow-md transition-all duration-100 hover:shadow">
          <div className=" pl-6">
            <p className="">CS 320 Prof Jaime</p>
            <p className="">4/15, 8:00 to 9:00pm</p>
            <br />
            <br />
            <div className="pl">
              <p className="text-center">Current Queue Postion: 3</p>
              <p className="text-center">Submission Type: Private Question</p>
            </div>
          </div>
          <br />
          <br />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-2">
            <Button variant="ghost">Edit Queue Submission</Button>
            <Button className="">Join Zoom</Button>
          </div>
        </div>

        <div className="rounded-md border-[1px] border-gray-300/60 bg-white p-4 shadow-md transition-all duration-100 hover:shadow">
          <div className=" pl-6">
            <p className="">CS 320 Prof Jaime</p>
            <p className="">4/15, 8:00 to 9:00pm</p>
            <br />
            <br />
            <div className="pl">
              <p className="text-center">Current Queue Postion: 3</p>
              <p className="text-center">Submission Type: Private Question</p>
            </div>
          </div>
          <br />
          <br />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-2">
            <Button variant="ghost">Edit Queue Submission</Button>
            <Button className="">Join Zoom</Button>
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
