import { UserProfile } from "@clerk/nextjs";

const UserProfilePage = () => (
  <div className="flex items-center justify-center py-16">
    <UserProfile
      routing="path"
      path="/account"
      appearance={{
        elements: {
          navbar: "hidden",
          navbarMobileMenuRow: "hidden",
        },
        variables: {
          colorPrimary: "#4E46E5",
          colorText: "#030712",
          colorTextOnPrimaryBackground: "#F9FAFB",
        },
      }}
    />
  </div>
);

export default UserProfilePage;
