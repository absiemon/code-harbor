import * as express from 'express';
import { registerUser, loginUser, updateUser } from './userController';
import { verifyToken } from '../utills/verifyToken';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/update/profile', verifyToken, updateUser);

export default router;
