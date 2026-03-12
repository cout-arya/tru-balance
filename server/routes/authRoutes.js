import express from 'express';
import { registerUser, loginUser, demoLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/demo-login', demoLogin);

export default router;
