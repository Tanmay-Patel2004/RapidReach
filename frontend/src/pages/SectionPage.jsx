import { 
  selectAuthToken,
  selectUserRole,
  selectUserPermissions 
} from '../store/slices/authSlice';

const token = useSelector(selectAuthToken); 