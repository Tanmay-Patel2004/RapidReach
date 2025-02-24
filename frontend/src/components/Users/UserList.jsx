import { PERMISSIONS, hasPermission } from "../../constants/permissions";
import { useAuth } from "../../contexts/AuthContext";

const UserList = () => {
  const { user } = useAuth();

  const fetchUsers = async () => {
    // Check if user has permission to read all users
    if (
      !hasPermission(user.permissions, PERMISSIONS.READ_ALL_USERS.permission_id)
    ) {
      console.error("❌ User does not have permission to view all users");
      return;
    }

    // Proceed with API call...
  };

  return;
};

export default UserList;
