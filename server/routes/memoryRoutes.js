// server/routes/memoryRoutes.js
import { Router } from 'express';
import { storeMemory, getMemory, deleteMemory } from '../controllers/memoryController.js';

const router = Router();

// POST /api/store-memory — Save a developer decision
router.post('/store-memory', storeMemory);

// GET /api/get-memory — Retrieve decisions with optional filters
router.get('/get-memory', getMemory);

// DELETE /api/delete-memory/:id — Remove a decision
router.delete('/delete-memory/:id', deleteMemory);

export default router;
