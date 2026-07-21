// =====================================================
// Spending Log - app.js
// All app logic: storage, categories, rendering, events
// Features: add, edit, delete, today total, category colors, CSV export
// =====================================================


// =====================================================
// CATEGORY COLOR PALETTE
// A set of distinct colors assigned to categories.
// The same category name always gets the same color
// because we hash the name to pick the index.
// =====================================================

const CATEGORY_COLORS = [
  '#a78bfa', // purple (matches accent)
  '#34d399', // green
  '#f87171', // red/coral
  '#fbbf24', // amber
  '#60a5fa', // blue
  '#f472b6', // pink
  '#fb923c', // orange
  '#22d3ee', // cyan
  '#a3e635', // lime
  '#e879f9', // fuchsia
];

// Hash a category name to a consistent index in the color palette.
// Same name always returns the same color, regardless of order added.
function getCategoryColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}


// =====================================================
// STATE
// Tracks which month/year we're viewing and whether
// the sheet is in add mode or edit mode.
// =====================================================

const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(), // 0-indexed: 0 = January
  editingId: null               // null = adding new; number = editing that expense ID
};


// =====================================================
// LOCALSTORAGE HELPERS
// All data lives on the device - no server needed.
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

// Update an existing expense by ID - replaces the matching record
function updateExpense(updatedExpense) {
  const expenses = getExpenses();
  const index = expenses.findIndex(e => e.id === updatedExpense.id);
  if (index !== -1) {
    expenses[index] = updatedExpense;
    saveExpenses(expenses);
  }
}

// Remove an expense from storage by its ID
function deleteExpense(id) {
  const expenses = getExpenses().filter(e => e.id !== id);
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

// Add a category name to the list if it doesn't already exist.
// Keeps the list alphabetical and case-insensitive de-duplicated.
function addCategory(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const categories = getCategories();
  const alreadyExists = categories.some(
    c => c.toLowerCase() === trimmed.toLowerCase()
  );
  if (!alreadyExists) {
    categories.push(trimmed);
    categories.sort((a, b) => a.localeCompare(b));
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
    // Append time so it parses as local date, not UTC
    const d = new Date(e.date + 'T00:00:00');
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

// Get only today's expenses
function getTodayExpenses() {
  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  return getExpenses().filter(e => e.date === today);
}

// Sum expenses by category name.
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

// Format a "YYYY-MM-DD" string as a short readable date (e.g. "Jul 20")
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Build the header title string (e.g. "July 2026")
function getMonthLabel(year, month) {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Check if the state is currently showing the current real month
function isCurrentMonth() {
  const now = new Date();
  return state.year === now.getFullYear() && state.month === now.getMonth();
}


// =====================================================
// RENDERING
// Functions that update what is shown on screen
// =====================================================

// Main render - called on load and whenever month or data changes
function render() {
  const expenses = getMonthExpenses(state.year, state.month);

  // Update month label and monthly total in the header
  document.getElementById('month-label').textContent = getMonthLabel(state.year, state.month);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  document.getElementById('month-total').textContent = formatMoney(total) + ' total';

  // Show today's total only when viewing the current month
  const todayEl = document.getElementById('today-total');
  if (isCurrentMonth()) {
    const todayExpenses = getTodayExpenses();
    if (todayExpenses.length > 0) {
      const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
      todayEl.textContent = 'Today: ' + formatMoney(todayTotal);
      todayEl.classList.remove('hidden');
    } else {
      todayEl.classList.add('hidden');
    }
  } else {
    todayEl.classList.add('hidden');
  }

  const emptyState      = document.getElementById('empty-state');
  const summarySection  = document.getElementById('summary');
  const expensesSection = document.getElementById('expenses');

  if (expenses.length === 0) {
    emptyState.classList.remove('hidden');
    summarySection.classList.add('hidden');
    expensesSection.classList.add('hidden');
  } else {
    emptyState.classList.add('hidden');
    summarySection.classList.remove('hidden');
    expensesSection.classList.remove('hidden');
    renderSummary(expenses);
    renderExpenseList(expenses);
  }
}

// Render the "By Category" summary section with color dots
function renderSummary(expenses) {
  const totals = getCategoryTotals(expenses);
  const container = document.getElementById('category-list');
  container.innerHTML = '';

  // Sort highest total first
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  sorted.forEach(function(entry) {
    const category = entry[0];
    const amount   = entry[1];
    const color    = getCategoryColor(category);

    const row = document.createElement('div');
    row.className = 'category-row';

    // Left side: colored dot + category name
    const nameEl = document.createElement('span');
    nameEl.className = 'category-name';
    nameEl.innerHTML =
      '<span class="category-dot" style="background:' + color + '"></span>' +
      category;

    // Right side: total amount
    const amountEl = document.createElement('span');
    amountEl.className = 'category-amount';
    amountEl.textContent = formatMoney(amount);

    row.appendChild(nameEl);
    row.appendChild(amountEl);
    container.appendChild(row);
  });
}

// Render the individual expense list (newest first)
// Each row has: color dot, category, note, date (tappable to edit) + amount + delete button
function renderExpenseList(expenses) {
  const container = document.getElementById('expense-list');
  container.innerHTML = '';

  // Sort by ID descending - highest ID = most recently added
  const sorted = [...expenses].sort((a, b) => b.id - a.id);

  sorted.forEach(function(expense) {
    const color = getCategoryColor(expense.category);

    const item = document.createElement('div');
    item.className = 'expense-item';

    // --- LEFT SIDE: category, note, date (tap to open edit sheet) ---
    const left = document.createElement('div');
    left.className = 'expense-left';

    const catEl = document.createElement('div');
    catEl.className = 'expense-category';
    catEl.innerHTML =
      '<span class="category-dot" style="background:' + color + '"></span>' +
      expense.category;

    left.appendChild(catEl);

    if (expense.note) {
      const noteEl = document.createElement('div');
      noteEl.className = 'expense-note';
      noteEl.textContent = expense.note;
      left.appendChild(noteEl);
    }

    const dateEl = document.createElement('div');
    dateEl.className = 'expense-date';
    dateEl.textContent = formatDate(expense.date);
    left.appendChild(dateEl);

    // Tapping the left side opens the edit sheet for this expense
    left.addEventListener('click', function() {
      openSheetForEdit(expense);
    });

    // --- RIGHT SIDE: amount (top) + delete button (bottom) ---
    const right = document.createElement('div');
    right.className = 'expense-right';

    const amountEl = document.createElement('div');
    amountEl.className = 'expense-amount';
    amountEl.textContent = formatMoney(expense.amount);

    // Trash icon delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('aria-label', 'Delete expense');
    deleteBtn.textContent = '🗑';

    // Confirm before deleting so accidental taps don't lose data
    deleteBtn.addEventListener('click', function(e) {
      e.stopPropagation(); // prevent the edit sheet from opening
      if (confirm('Delete this expense?')) {
        deleteExpense(expense.id);
        render();
      }
    });

    right.appendChild(amountEl);
    right.appendChild(deleteBtn);

    item.appendChild(left);
    item.appendChild(right);
    container.appendChild(item);
  });
}

// Populate the category datalist with all saved category names.
// Called every time the add/edit sheet opens.
function renderCategoryOptions() {
  const datalist = document.getElementById('category-options');
  datalist.innerHTML = '';
  getCategories().forEach(function(cat) {
    const option = document.createElement('option');
    option.value = cat;
    datalist.appendChild(option);
  });
}


// =====================================================
// BOTTOM SHEET
// Open for adding a new expense, or editing an existing one
// =====================================================

// Open the sheet in ADD mode (blank form)
function openSheet() {
  state.editingId = null; // make sure we're not in edit mode

  document.getElementById('sheet-title').textContent = 'Add Expense';
  document.getElementById('save-btn').textContent    = 'Save Expense';
  document.getElementById('amount-input').value      = '';
  document.getElementById('category-input').value    = '';
  document.getElementById('note-input').value        = '';

  renderCategoryOptions();
  showSheet();
}

// Open the sheet in EDIT mode, pre-filled with an existing expense's data
function openSheetForEdit(expense) {
  state.editingId = expense.id; // store which record we're updating

  document.getElementById('sheet-title').textContent  = 'Edit Expense';
  document.getElementById('save-btn').textContent     = 'Save Changes';
  document.getElementById('amount-input').value       = expense.amount;
  document.getElementById('category-input').value     = expense.category;
  document.getElementById('note-input').value         = expense.note || '';

  renderCategoryOptions();
  showSheet();
}

// Shared logic to show the overlay and sheet
function showSheet() {
  document.getElementById('add-sheet').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');
  // Focus amount field after a short delay so the keyboard opens smoothly
  setTimeout(function() {
    document.getElementById('amount-input').focus();
  }, 150);
}

// Hide the sheet and overlay
function closeSheet() {
  document.getElementById('add-sheet').classList.add('hidden');
  document.getElementById('overlay').classList.add('hidden');
  state.editingId = null;
}


// =====================================================
// SAVE EXPENSE
// Handles both adding a new expense and updating an existing one
// =====================================================

function handleSave() {
  const amountRaw = document.getElementById('amount-input').value.trim();
  const category  = document.getElementById('category-input').value.trim();
  const note      = document.getElementById('note-input').value.trim();

  // Validate - amount must be a positive number
  const amount = parseFloat(amountRaw);
  if (!amountRaw || isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount greater than $0.00');
    document.getElementById('amount-input').focus();
    return;
  }

  // Validate - category is required
  if (!category) {
    alert('Please enter a category.');
    document.getElementById('category-input').focus();
    return;
  }

  const roundedAmount = parseFloat(amount.toFixed(2));

  if (state.editingId !== null) {
    // --- EDIT MODE: update the existing record ---
    // Keep the original date - we're only updating the fields the user can change
    const existing = getExpenses().find(e => e.id === state.editingId);
    if (existing) {
      updateExpense({
        id:       existing.id,
        amount:   roundedAmount,
        category: category,
        note:     note,
        date:     existing.date // preserve original date
      });
      addCategory(category); // save category if it's new
    }
  } else {
    // --- ADD MODE: create a new expense record ---
    addExpense({
      id:       Date.now(),                              // unique ID = timestamp
      amount:   roundedAmount,
      category: category,
      note:     note,
      date:     new Date().toISOString().split('T')[0]  // today as "YYYY-MM-DD"
    });
    addCategory(category);

    // Jump to current month so the new expense is visible
    state.year  = new Date().getFullYear();
    state.month = new Date().getMonth();
  }

  closeSheet();
  render();
}


// =====================================================
// EXPORT CSV
// Downloads the current month's expenses as a .csv file
// =====================================================

function exportCSV() {
  const expenses = getMonthExpenses(state.year, state.month);

  if (expenses.length === 0) {
    alert('No expenses this month to export.');
    return;
  }

  // CSV header row
  const rows = [['Date', 'Category', 'Amount', 'Note']];

  // Sort by date ascending for the export
  const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date));

  sorted.forEach(function(e) {
    // Wrap fields in quotes to handle commas inside notes/categories
    rows.push([
      e.date,
      '"' + e.category.replace(/"/g, '""') + '"',
      e.amount.toFixed(2),
      '"' + (e.note || '').replace(/"/g, '""') + '"'
    ]);
  });

  const csvContent = rows.map(function(r) { return r.join(','); }).join('\n');

  // Create a downloadable file and trigger it
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');

  // File name includes the month, e.g. "spending-log-2026-07.csv"
  const monthStr = String(state.month + 1).padStart(2, '0');
  link.href     = url;
  link.download = 'spending-log-' + state.year + '-' + monthStr + '.csv';
  link.click();

  // Clean up the temporary URL
  URL.revokeObjectURL(url);
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

// Save (or update) the expense when Save is tapped
document.getElementById('save-btn').addEventListener('click', handleSave);

// Allow pressing Enter in the note field to save
document.getElementById('note-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') handleSave();
});

// Navigate to the previous month
document.getElementById('prev-month').addEventListener('click', function() {
  if (state.month === 0) {
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
    state.month = 0;
    state.year += 1;
  } else {
    state.month += 1;
  }
  render();
});

// Export current month to CSV
document.getElementById('export-btn').addEventListener('click', exportCSV);


// =====================================================
// PWA - Register Service Worker
// Enables offline use and home screen install
// =====================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').catch(function(err) {
      console.log('Service worker registration failed:', err);
    });
  });
}


// =====================================================
// INIT - run the first render when the page loads
// =====================================================

render();
