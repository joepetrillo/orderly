import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <div className="flex items-center justify-center py-10">
    <SignIn routing="path" path="/signin" redirectUrl="/" signUpUrl="/signup" />
  </div>
);

export default SignInPage;
