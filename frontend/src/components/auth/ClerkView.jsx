import { useUser } from "@clerk/clerk-react";

const UserData = () => {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return <p>Please sign in to view user data.</p>;
  }

  return (
    <div>
      <h2>User Data</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};

export default UserData;
