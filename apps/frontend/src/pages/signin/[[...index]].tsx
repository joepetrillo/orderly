import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <div className="flex items-center justify-center py-16">
    <div className="min-h-[364px]">
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
  </div>
);

export default SignInPage;
