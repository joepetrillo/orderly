import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <SignIn routing="path" path="/signin" redirectUrl="/" signUpUrl="/signup" />
);

export default SignInPage;
