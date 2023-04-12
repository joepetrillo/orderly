import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => (
  <div className="flex items-center justify-center py-16">
    <SignUp
      routing="path"
      path="/signup"
      redirectUrl="/dashboard"
      signInUrl="/signin"
      appearance={{
        variables: {
          colorPrimary: "#4E46E5",
          colorText: "#030712",
          colorTextOnPrimaryBackground: "#F9FAFB",
        },
      }}
    />
  </div>
);

export default SignUpPage;
