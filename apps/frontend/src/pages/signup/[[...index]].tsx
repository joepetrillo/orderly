import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => (
  <div className="flex items-center justify-center py-10">
    <SignUp
      routing="path"
      path="/signup"
      redirectUrl="/courses"
      signInUrl="/signin"
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

export default SignUpPage;
