import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => (
  <div className="flex items-center justify-center py-10">
    <SignUp routing="path" path="/signup" redirectUrl="/" signInUrl="/signin" />
  </div>
);

export default SignUpPage;
