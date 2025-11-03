import React, { useMemo, useState } from "react";
import "./App.css";

export default function LoanManagement({ books, availableBooks, loans, onCreateLoan }) {
    const [borrower, setBorrower] = useState("");
    const [isbn13, setIsbn13] = useState(availableBooks[0]?.isbn13 || "");
    const [weeks, setWeeks] = useState(2);

    const booksByIsbn = useMemo(() => {
        const map = new Map();
        books.forEach((b) => map.set(b.isbn13, b));
        return map;
    }, [books]);

    const allBorrowed = availableBooks.length === 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!borrower.trim() || !isbn13) return;
        onCreateLoan({ borrower: borrower.trim(), isbn13, weeks });
        setBorrower("");
        setWeeks(2);
    };

    return (
        <div className='loan-management'>
            <h2>Loan Management</h2>
            {allBorrowed ? (
                <div className='info-message'>All books are currently on loan.</div>
            ) : (
                <form onSubmit={handleSubmit} className='book-form'>
                    <div className='form-row'>
                        <label htmlFor='borrower'>Borrower</label>
                        <input
                            id='borrower'
                            name='borrower'
                            type='text'
                            placeholder='Borrower name'
                            value={borrower}
                            onChange={(e) => setBorrower(e.target.value)}
                        />
                    </div>

                    <div className='form-row'>
                        <label htmlFor='book'>Book</label>
                        <select
                            id='book'
                            name='book'
                            value={isbn13}
                            onChange={(e) => setIsbn13(e.target.value)}
                        >
                            {availableBooks.map((b) => (
                                <option key={b.isbn13} value={b.isbn13}>
                                    {b.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='form-row'>
                        <label htmlFor='weeks'>Loan period (weeks)</label>
                        <input
                            id='weeks'
                            name='weeks'
                            type='number'
                            min={1}
                            max={4}
                            value={weeks}
                            onChange={(e) => setWeeks(Number(e.target.value))}
                        />
                    </div>

                    <div className='form-actions'>
                        <button type='submit' className='btn-save'>Create Loan</button>
                    </div>
                </form>
            )}

            <div className='loaned-books'>
                <h3>Loaned Books</h3>
                {loans.length === 0 ? (
                    <div className='info-message'>No books on loan.</div>
                ) : (
                    <ul className='loan-list'>
                        {loans.map((loan) => {
                            const book = booksByIsbn.get(loan.isbn13);
                            const due = new Date(loan.dueDate);
                            return (
                                <li key={`${loan.isbn13}-${loan.borrower}`} className='loan-item'>
                                    <span className='loan-title'>{book?.title || loan.isbn13}</span>
                                    <span className='loan-borrower'>Borrower: {loan.borrower}</span>
                                    <span className='loan-due'>Due: {due.toLocaleDateString()}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}


