import Button from "@/components/UI/Button";

export default function Upcoming() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 lg:px-8">
      <h1 className="mb-5 text-4xl font-bold">Upcoming</h1>
      <div>
        <Button>Button Primary Example</Button>
        <Button variant="ghost">Button Ghost Example</Button>
        <Button variant="outline">Button Outline Example</Button>
      </div>
    </div>
  );
}
