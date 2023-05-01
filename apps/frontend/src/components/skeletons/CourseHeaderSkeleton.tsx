import { Container } from "../Container";

export default function CourseHeaderSkeleton() {
  return (
    <div className="border-b border-b-gray-200 bg-white pb-5 pt-10">
      <Container className="animate-pulse-fast">
        <div className="mb-10">
          <div className="mb-5 h-[36px] w-full max-w-[850px] rounded bg-gray-200" />
          <div className="flex flex-wrap gap-4">
            <div className="h-[20px] w-full max-w-[100px] shrink-0 rounded bg-gray-200" />
            <div className="h-[20px] w-full max-w-[100px] shrink-0 rounded bg-gray-200" />
            <div className="h-[20px] w-full max-w-[100px] shrink-0 rounded bg-gray-200" />
          </div>
        </div>
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3].map((curr, index) => {
            return (
              <div
                key={index}
                className="h-[32px] w-full max-w-[110px] shrink-0 rounded bg-gray-200 px-4 py-1.5"
              />
            );
          })}
        </div>
      </Container>
    </div>
  );
}
