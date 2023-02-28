import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => (
  <SignUp routing="path" path="/signup" redirectUrl="/" signInUrl="/signin" />
);

export default SignUpPage;
