import { UserProfile } from "@clerk/nextjs";

const Profile = () => (
  <main className="flex justify-center items-center my-8 min-h-[75vh]">
    <UserProfile
      appearance={{
        elements: {
          card: 'shadow-none',
          profileSection__emailAddresses: "hidden",
          profileSection__connectedAccounts: "hidden",
        }
      }}
      path="/profile" routing="path"
    />
  </main>
);

export default Profile;