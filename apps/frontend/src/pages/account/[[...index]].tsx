import { UserProfile } from "@clerk/nextjs";

const UserProfilePage = () => (
  <div className="flex items-center justify-center py-10">
    <UserProfile
      routing="path"
      path="/account"
      appearance={{
        elements: {
          navbar: "hidden",
          navbarMobileMenuRow: "hidden",
        },
      }}
    />
  </div>
);

export default UserProfilePage;
