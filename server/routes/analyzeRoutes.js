// server/routes/analyzeRoutes.js
import { Router } from 'express';
import { analyzeCodeHandler } from '../controllers/analyzeController.js';

const router = Router();

// POST /api/analyze-code — Intent Mode: analyze + optimize code
router.post('/analyze-code', analyzeCodeHandler);

export default router;
