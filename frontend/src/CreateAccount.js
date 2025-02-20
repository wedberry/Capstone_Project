import { SignUp } from "@clerk/clerk-react";

const CreateAccount = () => {
  return (
    <div>
      <h2>Create Account</h2>
      <SignUp path="/create-account" routing="path" signInUrl="/login" />
    </div>
  );
};

export default CreateAccount;