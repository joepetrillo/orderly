import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <div className="flex items-center justify-center py-16">
    <SignIn
      routing="path"
      path="/signin"
      redirectUrl="/dashboard"
      signUpUrl="/signup"
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

export default SignInPage;
