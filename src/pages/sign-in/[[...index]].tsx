import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <main className="flex justify-center items-center h-[80vh] my-4">
    <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
  </main>
);

export default SignInPage;