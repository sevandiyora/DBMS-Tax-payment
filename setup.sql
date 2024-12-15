CREATE TABLE TaxPayments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    amount REAL,
    payment_date DATE, -- No longer mandatory
    status TEXT CHECK(status IN ('paid', 'unpaid')) DEFAULT 'unpaid',
    due_date DATE NOT NULL -- Mandatory field
);
