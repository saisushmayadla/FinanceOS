const express = require('express');
const router = express.Router();
const {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
} = require('../controllers/budgetController');

router.route('/')
  .get(getBudgets)
  .post(createBudget);

router.route('/:id')
  .get(getBudgetById)
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;

