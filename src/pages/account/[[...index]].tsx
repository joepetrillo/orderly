import { UserProfile } from "@clerk/nextjs";

const UserProfilePage = () => <UserProfile routing="path" path="/account" />;

export default UserProfilePage;
