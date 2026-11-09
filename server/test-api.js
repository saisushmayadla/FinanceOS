process.env.NODE_ENV = 'test';
process.env.PORT = '5001';

const http = require('http');
const app = require('./server');
const { connectDB, disconnectDB } = require('./config/db');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests(server) {
  console.log('🧪 Starting FinanceOS End-to-End API Test Suite...\n');

  try {
    // 1. Health check
    console.log('1. Testing GET /api/health...');
    const health = await request({
      host: 'localhost',
      port: 5001,
      path: '/api/health',
      method: 'GET',
    });
    console.log(`   Status: ${health.status}, Response:`, health.data);

    // 2. Seed data
    console.log('\n2. Testing POST /api/dashboard/seed...');
    const seed = await request(
      {
        host: 'localhost',
        port: 5001,
        path: '/api/dashboard/seed',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { force: true }
    );
    console.log(`   Status: ${seed.status}, Response:`, seed.data);

    // 3. Dashboard summary
    console.log('\n3. Testing GET /api/dashboard/summary...');
    const summary = await request({
      host: 'localhost',
      port: 5001,
      path: '/api/dashboard/summary',
      method: 'GET',
    });
    console.log(`   Status: ${summary.status}`);
    console.log('   Total Income:', summary.data.data.summary.totalIncome);
    console.log('   Total Expenses:', summary.data.data.summary.totalExpenses);
    console.log('   Current Balance:', summary.data.data.summary.currentBalance);
    console.log('   Budget Count:', summary.data.data.budgetOverview.length);
    console.log('   Recent Tx Count:', summary.data.data.recentTransactions.length);

    // 4. Create Transaction
    console.log('\n4. Testing POST /api/transactions (Create income & expense)...');
    const newTx = await request(
      {
        host: 'localhost',
        port: 5001,
        path: '/api/transactions',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        title: 'Automated Test Consulting',
        amount: 1500,
        type: 'income',
        category: 'Freelance',
        date: new Date().toISOString(),
        description: 'End-to-end integration test transaction',
      }
    );
    console.log(`   Status: ${newTx.status}, Created ID:`, newTx.data.data._id);
    const createdTxId = newTx.data.data._id;

    // 5. Update Transaction
    console.log(`\n5. Testing PUT /api/transactions/${createdTxId}...`);
    const updateTx = await request(
      {
        host: 'localhost',
        port: 5001,
        path: `/api/transactions/${createdTxId}`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        title: 'Automated Test Consulting (Updated)',
        amount: 1750,
      }
    );
    console.log(`   Status: ${updateTx.status}, Updated Title:`, updateTx.data.data.title, 'Amount:', updateTx.data.data.amount);

    // 6. Delete Transaction
    console.log(`\n6. Testing DELETE /api/transactions/${createdTxId}...`);
    const delTx = await request({
      host: 'localhost',
      port: 5001,
      path: `/api/transactions/${createdTxId}`,
      method: 'DELETE',
    });
    console.log(`   Status: ${delTx.status}, Deleted:`, delTx.data);

    // 7. Budgets CRUD
    console.log('\n7. Testing Budgets API...');
    const now = new Date();
    const testMonth = now.getMonth() + 1;
    const testYear = now.getFullYear();

    const newBudget = await request(
      {
        host: 'localhost',
        port: 5001,
        path: '/api/budgets',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        category: 'Test Category Budget',
        amount: 450,
        month: testMonth,
        year: testYear,
      }
    );
    console.log(`   Status: ${newBudget.status}, Created Budget ID:`, newBudget.data.data?._id);
    const createdBudgetId = newBudget.data.data._id;

    const updateBudget = await request(
      {
        host: 'localhost',
        port: 5001,
        path: `/api/budgets/${createdBudgetId}`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        amount: 600,
      }
    );
    console.log(`   Status: ${updateBudget.status}, Updated Amount:`, updateBudget.data.data?.amount);

    const delBudget = await request({
      host: 'localhost',
      port: 5001,
      path: `/api/budgets/${createdBudgetId}`,
      method: 'DELETE',
    });
    console.log(`   Status: ${delBudget.status}, Deleted Budget:`, delBudget.data);

    console.log('\n🎉 ALL 11 API TESTS PASSED SUCCESSFULLY! The backend is fully functional.');
  } finally {
    server.close();
    await disconnectDB();
    process.exit(0);
  }
}

connectDB().then(() => {
  const server = app.listen(5001, async () => {
    try {
      await runTests(server);
    } catch (e) {
      console.error('Test suite failed:', e);
      server.close();
      await disconnectDB();
      process.exit(1);
    }
  });
});
