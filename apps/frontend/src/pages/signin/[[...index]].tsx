import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <div className="flex items-center justify-center py-16">
    <div className="min-h-[364px]">
      <SignIn
        routing="path"
        path="/signin"
        redirectUrl="/dashboard"
        signUpUrl="/signup"
      />
    </div>
  </div>
);

export default SignInPage;
