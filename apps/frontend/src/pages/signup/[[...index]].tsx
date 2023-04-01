import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => (
  <div className="flex items-center justify-center py-16">
    <div className="min-h-[517px]">
      <SignUp
        routing="path"
        path="/signup"
        redirectUrl="/dashboard"
        signInUrl="/signin"
      />
    </div>
  </div>
);

export default SignUpPage;
