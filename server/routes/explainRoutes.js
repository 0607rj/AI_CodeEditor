// server/routes/explainRoutes.js
import { Router } from 'express';
import { explainCodebaseHandler } from '../controllers/explainController.js';

const router = Router();

// POST /api/explain-codebase — Parse code, generate graph, get AI explanation
router.post('/explain-codebase', explainCodebaseHandler);

export default router;
