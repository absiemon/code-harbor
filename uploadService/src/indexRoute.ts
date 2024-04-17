import * as express from 'express';
import uploadRouter from './uploadService/router'
import authRouter from './auth/userRouter'

const router = express.Router();

router.use('/auth', authRouter);

router.use('/project', uploadRouter);

export default router;
