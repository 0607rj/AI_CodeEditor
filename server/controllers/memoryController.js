// server/controllers/memoryController.js
// CRUD operations for the Decision Memory system
// WHY: Developers make architectural decisions daily but forget WHY.
// This system captures the reasoning behind decisions for future reference.

import Decision from '../models/Decision.js';

/**
 * POST /api/store-memory
 * Store a new developer decision
 * Body: { file, function?, decision, reason, tags? }
 */
export const storeMemory = async (req, res, next) => {
  try {
    const { file, function: funcName, decision, reason, tags } = req.body;

    // Validate required fields
    if (!file || !decision || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Fields "file", "decision", and "reason" are required',
      });
    }

    const newDecision = await Decision.create({
      file,
      function: funcName || '',
      decision,
      reason,
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      data: newDecision,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/get-memory
 * Retrieve decisions with optional filtering
 * Query params: ?file=...&function=...&search=...&tag=...
 */
export const getMemory = async (req, res, next) => {
  try {
    const { file, function: funcName, search, tag } = req.query;
    const filter = {};

    if (file) filter.file = { $regex: file, $options: 'i' };
    if (funcName) filter.function = { $regex: funcName, $options: 'i' };
    if (tag) filter.tags = tag;
    if (search) {
      filter.$text = { $search: search };
    }

    const decisions = await Decision.find(filter)
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({
      success: true,
      count: decisions.length,
      data: decisions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/delete-memory/:id
 * Delete a specific decision
 */
export const deleteMemory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const decision = await Decision.findByIdAndDelete(id);

    if (!decision) {
      return res.status(404).json({
        success: false,
        error: 'Decision not found',
      });
    }

    res.json({
      success: true,
      message: 'Decision deleted',
    });
  } catch (error) {
    next(error);
  }
};
