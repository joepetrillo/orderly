import Button from "@/components/ui/Button";
import { Container } from "@/components/Container";
import { CakeIcon } from "@heroicons/react/24/outline";

const BackgroundBlur = () => {
  return (
    <>
      <div
        className="absolute inset-x-0 -top-10 -z-10 transform-gpu overflow-hidden blur-[100px]  sm:-top-60"
        aria-hidden="true"
      >
        <div
          className="relative aspect-[1155/678] rotate-[30deg] bg-gradient-to-tr from-purple-600 to-pink-300 opacity-50 sm:left-[calc(50%-30rem)] sm:w-[65rem] sm:opacity-30"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
    </>
  );
};

const Hero = () => {
  return (
    <div className="relative">
      {/* <BackgroundBlur /> */}
      <Container className="py-20 text-center sm:py-28">
        <h1 className="mx-auto max-w-4xl font-display text-5xl leading-[1.1] tracking-tight sm:text-5xl sm:leading-[1.1] md:text-7xl md:leading-[1.1]">
          Office hours management made{" "}
          <span className="font-medium text-indigo-600">effortless</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 tracking-tight text-gray-600">
          Optimize student-instructor interactions and maximize engagement
          opportunities with Orderly. Boost productivity, stay organized and
          elevate your office hours.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button as="link" href="/signup" size="lg">
            Get Started
          </Button>
          <Button as="link" href="/#features" variant="ghost" size="lg">
            Learn More
          </Button>
        </div>
      </Container>
    </div>

    // <span className="font-medium text-indigo-600">
    //   Impactful and effortless <br className="md:hidden" />
    // </span>{" "}
    // office hour optimization.
  );
};

const Features = () => {
  const features = [
    {
      name: "Invest any amount",
      description:
        "Whether it’s $1 or $1,000,000, we can put your money to work for you.",
      icon: CakeIcon,
    },
    {
      name: "Build a balanced portfolio",
      description:
        "Invest in different industries to find the most opportunities to win huge.",
      icon: CakeIcon,
    },
    {
      name: "Trade in real-time",
      description:
        "Get insider tips on big stock moves and act on them within seconds.",
      icon: CakeIcon,
    },
    {
      name: "Profit from your network",
      description:
        "Invite new insiders to get tips faster and beat even other Pocket users.",
      icon: CakeIcon,
    },
    {
      name: "Encrypted and anonymized",
      description:
        "Cutting-edge security technology that even the NSA doesn’t know about keeps you hidden.",
      icon: CakeIcon,
    },
    {
      name: "Portfolio tracking",
      description:
        "Watch your investments grow exponentially, leaving other investors in the dust.",
      icon: CakeIcon,
    },
  ];

  return (
    <section
      id="features"
      aria-label="Orderly Features"
      className="border-t border-t-gray-300 py-20 sm:py-28"
    >
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-medium tracking-tight">
            Orderly Features
          </h2>
          <p className="mt-6 text-lg text-gray-600">
            Still on the fence? Read through everything Orderly can help you
            improve
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 text-sm sm:mt-20 sm:grid-cols-2 md:gap-y-10 lg:max-w-none lg:grid-cols-3"
        >
          {features.map((feature) => (
            <li
              key={feature.name}
              className="rounded-2xl border border-gray-200 p-8"
            >
              <feature.icon className="h-8 w-8" />
              <h3 className="mt-6 font-semibold text-gray-900">
                {feature.name}
              </h3>
              <p className="mt-2 text-gray-700">{feature.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
};

const CallToAction = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-tr from-indigo-800 via-indigo-600 to-indigo-400 py-32">
      <Container>
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-display text-3xl tracking-tight text-gray-50 sm:text-4xl">
            Get started today
          </h2>
          <p className="mt-4 text-lg tracking-tight text-gray-50">
            It is time to take control of your books. Buy our software so you
            can feel like you are doing something productive.
          </p>
          <Button
            variant="light"
            as="link"
            href="/signup"
            className="mt-10"
            size="lg"
          >
            Start for free
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default function Home() {
  return (
    <>
      <Hero />
    </>
  );
}
