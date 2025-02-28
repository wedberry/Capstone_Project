import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Update the path based on your structure

export const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;