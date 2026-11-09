const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Get dashboard aggregated summary
// @route   GET /api/dashboard/summary
// @access  Public
const getDashboardSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 1. Overall Totals (Income, Expense, Balance)
    const totalsAgg = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    totalsAgg.forEach((item) => {
      if (item._id === 'income') totalIncome = item.total;
      if (item._id === 'expense') totalExpenses = item.total;
    });

    const currentBalance = Number((totalIncome - totalExpenses).toFixed(2));
    totalIncome = Number(totalIncome.toFixed(2));
    totalExpenses = Number(totalExpenses.toFixed(2));

    // 2. Current Month Totals
    const startOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfCurrentMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const monthTotalsAgg = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    monthTotalsAgg.forEach((item) => {
      if (item._id === 'income') monthlyIncome = item.total;
      if (item._id === 'expense') monthlyExpenses = item.total;
    });

    const monthlySavings = Number((monthlyIncome - monthlyExpenses).toFixed(2));
    const savingsRate = monthlyIncome > 0 ? Number(((monthlySavings / monthlyIncome) * 100).toFixed(1)) : 0;

    // 3. Budgets for Current Month
    const currentBudgets = await Budget.find({
      month: currentMonth,
      year: currentYear,
    }).sort({ category: 1 });

    const totalBudget = currentBudgets.reduce((acc, curr) => acc + curr.amount, 0);

    // Current month expenses by category for budget comparison
    const monthCategoryExpensesAgg = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const monthCategorySpendMap = {};
    monthCategoryExpensesAgg.forEach((item) => {
      monthCategorySpendMap[item._id.toLowerCase()] = item.total;
    });

    let totalBudgetSpent = 0;
    const budgetOverview = currentBudgets.map((b) => {
      const spent = monthCategorySpendMap[b.category.toLowerCase()] || 0;
      totalBudgetSpent += spent;
      const remaining = Number((b.amount - spent).toFixed(2));
      const percentage = b.amount > 0 ? Number(((spent / b.amount) * 100).toFixed(1)) : 0;

      return {
        _id: b._id,
        category: b.category,
        amount: b.amount,
        spent: Number(spent.toFixed(2)),
        remaining,
        percentage,
        isExceeded: spent > b.amount,
      };
    });

    // 4. Expense Category Breakdown (All-time or last 6 months)
    const categoryBreakdownAgg = await Transaction.aggregate([
      { $match: { type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const categoryBreakdown = categoryBreakdownAgg.map((item) => ({
      category: item._id,
      amount: Number(item.total.toFixed(2)),
      percentage: totalExpenses > 0 ? Number(((item.total / totalExpenses) * 100).toFixed(1)) : 0,
      count: item.count,
    }));

    // 5. Monthly Income vs Expenses (Last 6 Months chronologically)
    const monthlyTrends = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const s = new Date(y, m - 1, 1);
      const e = new Date(y, m, 0, 23, 59, 59, 999);

      const mAgg = await Transaction.aggregate([
        {
          $match: {
            date: { $gte: s, $lte: e },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ]);

      let inc = 0;
      let exp = 0;
      mAgg.forEach((item) => {
        if (item._id === 'income') inc = item.total;
        if (item._id === 'expense') exp = item.total;
      });

      monthlyTrends.push({
        monthKey: `${y}-${m < 10 ? '0' + m : m}`,
        monthLabel: `${monthNames[m - 1]} ${y}`,
        shortMonth: monthNames[m - 1],
        income: Number(inc.toFixed(2)),
        expense: Number(exp.toFixed(2)),
        savings: Number((inc - exp).toFixed(2)),
      });
    }

    // 6. Recent Transactions (latest 6)
    const recentTransactions = await Transaction.find().sort({ date: -1 }).limit(6);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          currentBalance,
          totalBudget: Number(totalBudget.toFixed(2)),
          totalBudgetSpent: Number(totalBudgetSpent.toFixed(2)),
          monthlyIncome: Number(monthlyIncome.toFixed(2)),
          monthlyExpenses: Number(monthlyExpenses.toFixed(2)),
          monthlySavings,
          savingsRate,
          currentMonth,
          currentYear,
        },
        budgetOverview,
        categoryBreakdown,
        monthlyTrends,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed realistic initial data for instant demo
// @route   POST /api/seed
// @access  Public
const seedData = async (req, res, next) => {
  try {
    const existingCount = await Transaction.countDocuments();
    if (req.body.force !== true && existingCount > 0) {
      return res.status(200).json({
        success: true,
        message: 'Database already has data. Pass force: true to reset.',
        count: existingCount,
      });
    }

    await Transaction.deleteMany({});
    await Budget.deleteMany({});

    const now = new Date();
    const currYear = now.getFullYear();
    const currMonth = now.getMonth(); // 0-based

    // Sample Transactions across recent months
    const sampleTransactions = [
      // Current Month Income
      { title: 'Tech Corp Senior Salary', amount: 6500, type: 'income', category: 'Salary', date: new Date(currYear, currMonth, 1), description: 'Monthly base salary direct deposit' },
      { title: 'Freelance UI/UX Consulting', amount: 1850, type: 'income', category: 'Freelance', date: new Date(currYear, currMonth, 5), description: 'Design system sprint payout' },
      { title: 'Dividend Distribution', amount: 420, type: 'income', category: 'Investments', date: new Date(currYear, currMonth, 10), description: 'Vanguard Index Fund quarterly dividends' },

      // Current Month Expenses
      { title: 'Luxury Apartment Rent', amount: 2200, type: 'expense', category: 'Housing', date: new Date(currYear, currMonth, 2), description: 'Penthouse rental monthly payment' },
      { title: 'Whole Foods Market Groceries', amount: 345, type: 'expense', category: 'Food & Dining', date: new Date(currYear, currMonth, 4), description: 'Weekly organic pantry restock' },
      { title: 'Electric & High-Speed Internet', amount: 185, type: 'expense', category: 'Utilities', date: new Date(currYear, currMonth, 6), description: 'Fiber internet & energy bill' },
      { title: 'Fine Dining at Nobu', amount: 260, type: 'expense', category: 'Food & Dining', date: new Date(currYear, currMonth, 8), description: 'Client anniversary dinner' },
      { title: 'Uber & Metropolitan Transit', amount: 110, type: 'expense', category: 'Transportation', date: new Date(currYear, currMonth, 9), description: 'Rideshares and transit pass' },
      { title: 'Apple Developer Subscription & SaaS', amount: 145, type: 'expense', category: 'Entertainment', date: new Date(currYear, currMonth, 11), description: 'Software toolkits and streaming' },
      { title: 'Equinox Gym & Wellness Club', amount: 280, type: 'expense', category: 'Health', date: new Date(currYear, currMonth, 12), description: 'Monthly fitness membership' },
      { title: 'Nordstrom Wardrobe Essentials', amount: 320, type: 'expense', category: 'Shopping', date: new Date(currYear, currMonth, 14), description: 'New season blazers and shoes' },

      // Prior Month
      { title: 'Tech Corp Senior Salary', amount: 6500, type: 'income', category: 'Salary', date: new Date(currYear, currMonth - 1, 1), description: 'Monthly salary' },
      { title: 'Freelance Mobile App Design', amount: 2200, type: 'income', category: 'Freelance', date: new Date(currYear, currMonth - 1, 7), description: 'Fintech mobile app wireframes' },
      { title: 'Apartment Rent', amount: 2200, type: 'expense', category: 'Housing', date: new Date(currYear, currMonth - 1, 2), description: 'Monthly rent' },
      { title: 'Groceries & Provisions', amount: 580, type: 'expense', category: 'Food & Dining', date: new Date(currYear, currMonth - 1, 12), description: 'Monthly groceries' },
      { title: 'Vehicle Fuel & Insurance', amount: 240, type: 'expense', category: 'Transportation', date: new Date(currYear, currMonth - 1, 15), description: 'Insurance and maintenance' },
      { title: 'Bespoke Tailoring', amount: 450, type: 'expense', category: 'Shopping', date: new Date(currYear, currMonth - 1, 20), description: 'Custom fitted suit' },

      // Two Months Ago
      { title: 'Tech Corp Senior Salary', amount: 6500, type: 'income', category: 'Salary', date: new Date(currYear, currMonth - 2, 1), description: 'Monthly salary' },
      { title: 'Apartment Rent', amount: 2200, type: 'expense', category: 'Housing', date: new Date(currYear, currMonth - 2, 2), description: 'Monthly rent' },
      { title: 'Gourmet Dining & Meals', amount: 610, type: 'expense', category: 'Food & Dining', date: new Date(currYear, currMonth - 2, 14), description: 'Dining out and groceries' },
      { title: 'Utilities & Telecom', amount: 195, type: 'expense', category: 'Utilities', date: new Date(currYear, currMonth - 2, 8), description: 'Monthly bills' },
      { title: 'Concert & Theater Tickets', amount: 350, type: 'expense', category: 'Entertainment', date: new Date(currYear, currMonth - 2, 22), description: 'Symphony orchestra tickets' },

      // Three Months Ago
      { title: 'Tech Corp Senior Salary', amount: 6500, type: 'income', category: 'Salary', date: new Date(currYear, currMonth - 3, 1), description: 'Monthly salary' },
      { title: 'Consulting Honorarium', amount: 1200, type: 'income', category: 'Freelance', date: new Date(currYear, currMonth - 3, 18), description: 'Tech conference keynote' },
      { title: 'Apartment Rent', amount: 2200, type: 'expense', category: 'Housing', date: new Date(currYear, currMonth - 3, 2), description: 'Monthly rent' },
      { title: 'Dining & Provisions', amount: 540, type: 'expense', category: 'Food & Dining', date: new Date(currYear, currMonth - 3, 15), description: 'Dining expenses' },
      { title: 'Aviation Flight & Weekend Getaway', amount: 780, type: 'expense', category: 'Transportation', date: new Date(currYear, currMonth - 3, 24), description: 'Weekend retreat' },
    ];

    await Transaction.insertMany(sampleTransactions);

    // Sample Budgets for Current Month
    const sampleBudgets = [
      { category: 'Housing', amount: 2300, month: currMonth + 1, year: currYear },
      { category: 'Food & Dining', amount: 800, month: currMonth + 1, year: currYear },
      { category: 'Transportation', amount: 350, month: currMonth + 1, year: currYear },
      { category: 'Utilities', amount: 250, month: currMonth + 1, year: currYear },
      { category: 'Health', amount: 300, month: currMonth + 1, year: currYear },
      { category: 'Shopping', amount: 500, month: currMonth + 1, year: currYear },
      { category: 'Entertainment', amount: 300, month: currMonth + 1, year: currYear },
    ];

    await Budget.insertMany(sampleBudgets);

    res.status(201).json({
      success: true,
      message: 'Demo dataset populated successfully with transactions and budgets.',
      transactionsCount: sampleTransactions.length,
      budgetsCount: sampleBudgets.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  seedData,
};
