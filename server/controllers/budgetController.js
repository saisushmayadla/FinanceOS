const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets with computed spending usage
// @route   GET /api/budgets
// @access  Public
const getBudgets = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const month = req.query.month ? parseInt(req.query.month, 10) : currentDate.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year, 10) : currentDate.getFullYear();

    const query = {};
    if (month) query.month = month;
    if (year) query.year = year;

    const budgets = await Budget.find(query).sort({ category: 1 });

    // Calculate actual expenses for each budget category in this specific month & year
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Aggregate expenses by category for this period
    const spendingAgg = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const spendingMap = {};
    spendingAgg.forEach((item) => {
      spendingMap[item._id.toLowerCase()] = item.totalSpent;
    });

    // Merge actual spending into budget objects
    const budgetsWithUsage = budgets.map((b) => {
      const spent = spendingMap[b.category.toLowerCase()] || 0;
      const remaining = Number((b.amount - spent).toFixed(2));
      const percentage = b.amount > 0 ? Number(((spent / b.amount) * 100).toFixed(1)) : 0;
      const isExceeded = spent > b.amount;

      return {
        _id: b._id,
        category: b.category,
        amount: b.amount,
        month: b.month,
        year: b.year,
        spent: Number(spent.toFixed(2)),
        remaining,
        percentage,
        isExceeded,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };
    });

    const totalAllocated = budgets.reduce((acc, curr) => acc + curr.amount, 0);
    const totalSpentInBudgets = budgetsWithUsage.reduce((acc, curr) => acc + curr.spent, 0);

    res.status(200).json({
      success: true,
      month,
      year,
      totalAllocated: Number(totalAllocated.toFixed(2)),
      totalSpent: Number(totalSpentInBudgets.toFixed(2)),
      count: budgetsWithUsage.length,
      data: budgetsWithUsage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single budget by ID
// @route   GET /api/budgets/:id
// @access  Public
const getBudgetById = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: `Budget not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Public
const createBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year } = req.body;

    if (!category || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category and amount',
      });
    }

    const current = new Date();
    const budgetMonth = month ? parseInt(month, 10) : current.getMonth() + 1;
    const budgetYear = year ? parseInt(year, 10) : current.getFullYear();
    const numericAmount = Number(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget amount must be a positive number',
      });
    }

    if (budgetMonth < 1 || budgetMonth > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12',
      });
    }

    // Check if budget for this category and month/year already exists
    const existing = await Budget.findOne({
      category: { $regex: new RegExp(`^${category.trim()}$`, 'i') },
      month: budgetMonth,
      year: budgetYear,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A budget for category "${category}" already exists for ${budgetMonth}/${budgetYear}. You can edit it instead.`,
      });
    }

    const budget = await Budget.create({
      category: category.trim(),
      amount: numericAmount,
      month: budgetMonth,
      year: budgetYear,
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: budget,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A budget for this category already exists for this period.',
      });
    }
    next(error);
  }
};

// @desc    Update existing budget
// @route   PUT /api/budgets/:id
// @access  Public
const updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: `Budget not found with id ${req.params.id}`,
      });
    }

    if (req.body.amount !== undefined) {
      const numericAmount = Number(req.body.amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Budget amount must be a positive number',
        });
      }
      req.body.amount = numericAmount;
    }

    budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Public
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: `Budget not found with id ${req.params.id}`,
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
};
