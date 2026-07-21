// =====================================================
// Spending Log - app.js
// All app logic: storage, categories, rendering, events
// =====================================================


// =====================================================
// STATE
// Tracks which month/year the user is currently viewing
// =====================================================

const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() // 0-indexed: 0 = January, 11 = December
};


// =====================================================
// LOCALSTORAGE HELPERS
// All data lives on the device - no server needed
// Keys used:
//   "sl_expenses"   -> array of expense objects
//   "sl_categories" -> array of category name strings
// =====================================================

// Load all expenses from storage (returns an array, never null)
function getExpenses() {
  return JSON.parse(localStorage.getItem('sl_expenses') || '[]');
}

// Write the full expenses array back to storage
function saveExpenses(expenses) {
  localStorage.setItem('sl_expenses', JSON.stringify(expenses));
}

// Add a single expense object to storage
function addExpense(expense) {
  const expenses = getExpenses();
  expenses.push(expense);
  saveExpenses(expenses);
}

// Load the saved category name list from storage
function getCategories() {
  return JSON.parse(localStorage.getItem('sl_categories') || '[]');
}

// Write the category list back to storage
function saveCategories(categories) {
  localStorage.setItem('sl_categories', JSON.stringify(categories));
}

// Add a category name to the list if it doesn't already exist
// Keeps the list alphabetical and case-insensitive de-duplicated
function addCategory(name) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const categories = getCategories();

  // Check if this category already exists (case-insensitive)
  const alreadyExists = categories.some(
    c => c.toLowerCase() === trimmed.toLowerCase()
  );

  if (!alreadyExists) {
    categories.push(trimmed);
    categories.sort((a, b) => a.localeCompare(b)); // alphabetical
    saveCategories(categories);
  }
}


// =====================================================
// DATA HELPERS
// Pure functions that compute things from raw data
// =====================================================

// Filter the full expense list to just the given month/year
function getMonthExpenses(year, month) {
  const all = getExpenses();
  return all.filter(e => {
    // Parse as local date by appending time - avoids UTC offset issues
    const d = new Date(e.date + 'T00:00:00');
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

// Sum expenses by category name
// Returns an object like: { "Food": 45.20, "Gas": 30.00 }
function getCategoryTotals(expenses) {
  const totals = {};
  expenses.forEach(e => {
    if (!totals[e.category]) totals[e.category] = 0;
    totals[e.category] = parseFloat((totals[e.category] + e.amount).toFixed(2));
  });
  return totals;
}

// Format a number as a dollar string (e.g. 12.5 -> "$12.50")
function formatMoney(amount) {
  return '$' + amount.toFixed(2);
}

// Format a "YYYY-MM-DD" date string as a short readable date (e.g. "Jul 20")
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Build the header title string (e.g. "July 2026")
function getMonthLabel(year, month) {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}


// =====================================================
// RENDERING
// Functions that update what is shown on screen
// =====================================================

// Main render - called on load and whenever month or data changes
function render() {
  const expenses = getMonthExpenses(state.year, state.month);

  // Update month label and total in the header
  document.getElementById('month-label').textContent = getMonthLabel(state.year, state.month);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  document.getElementById('month-total').textContent = formatMoney(total) + ' total';

  const emptyState = document.getElementById('empty-state');
  const summarySection = document.getElementById('summary');
  const expensesSection = document.getElementById('expenses');

  if (expenses.length === 0) {
    // No expenses this month - show the empty state message
    emptyState.classList.remove('hidden');
    summarySection.classList.add('hidden');
    expensesSection.classList.add('hidden');
  } else {
    // Expenses exist - hide the empty state, show the lists
    emptyState.classList.add('hidden');
    summarySection.classList.remove('hidden');
    expensesSection.classList.remove('hidden');
    renderSummary(expenses);
    renderExpenseList(expenses);
  }
}

// Render the "By Category" summary section
// Shows each category with its total, sorted highest-to-lowest
function renderSummary(expenses) {
  const totals = getCategoryTotals(expenses);
  const container = document.getElementById('category-list');
  container.innerHTML = ''; // clear existing rows

  // Sort by total amount, highest first
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  sorted.forEach(([category, amount]) => {
    const row = document.createElement('div');
    row.className = 'category-row';
    // Build the row HTML directly - safe here since category names come from user input
    // that we stored ourselves (not from external sources)
    row.innerHTML =
      '<span class="category-name">' + category + '</span>' +
      '<span class="category-amount">' + formatMoney(amount) + '</span>';
    container.appendChild(row);
  });
}

// Render the individual expense list (newest first)
function renderExpenseList(expenses) {
  const container = document.getElementById('expense-list');
  container.innerHTML = ''; // clear existing items

  // Sort by ID descending - since IDs are timestamps, highest ID = most recent
  const sorted = [...expenses].sort((a, b) => b.id - a.id);

  sorted.forEach(expense => {
    const item = document.createElement('div');
    item.className = 'expense-item';

    // Build note line only if a note was entered
    const noteHTML = expense.note
      ? '<div class="expense-note">' + expense.note + '</div>'
      : '';

    item.innerHTML =
      '<div class="expense-left">' +
        '<div class="expense-category">' + expense.category + '</div>' +
        noteHTML +
        '<div class="expense-date">' + formatDate(expense.date) + '</div>' +
      '</div>' +
      '<div class="expense-amount">' + formatMoney(expense.amount) + '</div>';

    container.appendChild(item);
  });
}

// Populate the category datalist with all saved category names
// Called every time the add sheet opens so it always shows the latest list
function renderCategoryOptions() {
  const datalist = document.getElementById('category-options');
  datalist.innerHTML = ''; // clear old options

  const categories = getCategories();
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    datalist.appendChild(option);
  });
}


// =====================================================
// BOTTOM SHEET
// Open and close the add-expense form
// =====================================================

function openSheet() {
  // Show the sheet and overlay
  document.getElementById('add-sheet').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');

  // Clear all fields so the form starts fresh each time
  document.getElementById('amount-input').value = '';
  document.getElementById('category-input').value = '';
  document.getElementById('note-input').value = '';

  // Refresh the category dropdown with whatever categories are saved
  renderCategoryOptions();

  // Focus the amount field after a short delay so the keyboard opens smoothly
  setTimeout(() => {
    document.getElementById('amount-input').focus();
  }, 150);
}

function closeSheet() {
  document.getElementById('add-sheet').classList.add('hidden');
  document.getElementById('overlay').classList.add('hidden');
}


// =====================================================
// SAVE EXPENSE
// Validates input, builds the expense object, stores it
// =====================================================

function handleSave() {
  const amountRaw = document.getElementById('amount-input').value.trim();
  const category  = document.getElementById('category-input').value.trim();
  const note      = document.getElementById('note-input').value.trim();

  // Amount is required and must be a positive number
  const amount = parseFloat(amountRaw);
  if (!amountRaw || isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount greater than $0.00');
    document.getElementById('amount-input').focus();
    return;
  }

  // Category is required
  if (!category) {
    alert('Please enter a category.');
    document.getElementById('category-input').focus();
    return;
  }

  // Build the expense object
  const expense = {
    id: Date.now(),                                  // unique ID based on timestamp
    amount: parseFloat(amount.toFixed(2)),           // round to 2 decimal places
    category: category,
    note: note,
    date: new Date().toISOString().split('T')[0]     // today as "YYYY-MM-DD"
  };

  // Persist the expense and its category
  addExpense(expense);
  addCategory(category);

  // Close the sheet
  closeSheet();

  // Jump back to the current month so the new expense is visible
  state.year  = new Date().getFullYear();
  state.month = new Date().getMonth();

  // Re-render everything with the new data
  render();
}


// =====================================================
// EVENT LISTENERS
// Wire up all buttons and interactions
// =====================================================

// Open the add sheet when the + FAB is tapped
document.getElementById('add-btn').addEventListener('click', openSheet);

// Close the sheet when the dark overlay is tapped
document.getElementById('overlay').addEventListener('click', closeSheet);

// Close the sheet when Cancel is tapped
document.getElementById('cancel-btn').addEventListener('click', closeSheet);

// Save the expense when Save is tapped
document.getElementById('save-btn').addEventListener('click', handleSave);

// Also save if the user presses Enter in the note field (common on desktop)
document.getElementById('note-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') handleSave();
});

// Navigate to the previous month
document.getElementById('prev-month').addEventListener('click', function() {
  if (state.month === 0) {
    // Wrap from January back to December of the previous year
    state.month = 11;
    state.year -= 1;
  } else {
    state.month -= 1;
  }
  render();
});

// Navigate to the next month
document.getElementById('next-month').addEventListener('click', function() {
  if (state.month === 11) {
    // Wrap from December forward to January of the next year
    state.month = 0;
    state.year += 1;
  } else {
    state.month += 1;
  }
  render();
});


// =====================================================
// PWA - Register Service Worker
// Enables offline use and home screen install
// =====================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').catch(function(err) {
      // Service worker registration failed - app still works, just no offline support
      console.log('Service worker registration failed:', err);
    });
  });
}


// =====================================================
// INIT
// Run the initial render when the page first loads
// =====================================================

render();
