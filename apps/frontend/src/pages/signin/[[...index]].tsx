import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <div className="flex items-center justify-center py-10">
    <SignIn
      routing="path"
      path="/signin"
      redirectUrl="/courses"
      signUpUrl="/signup"
      appearance={{
        variables: {
          colorPrimary: "#4E46E5",
          colorText: "#030712",
          colorTextOnPrimaryBackground: "#F9FAFB",
        },
        elements: {
          card: "border border-gray-200 shadow shadow-gray-200/70",
        },
      }}
    />
  </div>
);

export default SignInPage;
