import * as express from 'express';
import {deleteProject, getAllProjects, uploadCodebase} from './controller'
import { verifyToken } from '../utills/verifyToken';
const router = express.Router();

router.post('/upload', uploadCodebase);

router.get('/get-all', verifyToken, getAllProjects);

router.delete('/delete', verifyToken, deleteProject);

export default router;
