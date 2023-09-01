import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => (
  <main className="flex justify-center items-center h-[80vh] my-4">
    <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
  </main>
);

export default SignUpPage;