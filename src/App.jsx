import { useEffect, useMemo, useState } from "react";
import Book from "./Book";
import BtnPlus from "./BtnPlus";
import AddBookModal from "./AddBookModal";
import BookFilter from "./BookFilter";
import BookDetails from "./BookDetails";
import "./App.css";
import LoanManagement from "./LoanManagement";

export default function App() {
    const [books, setBooks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterCriteria, setFilterCriteria] = useState({
        author: "",
    });
    const [view, setView] = useState("catalog"); // catalog | loans
    const [loans, setLoans] = useState([]); // { isbn13, borrower, weeks, dueDate }
    const [selectedBookForDetails, setSelectedBookForDetails] = useState(null);

    useEffect(() => {
        // Start with empty books array - only show user-added books
        setBooks([]);
    }, []);

    const handleAddBook = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleBookSelect = (bookId) => {
        setBooks((prev) =>
            prev.map((book) => ({
                ...book,
                selected: book.isbn13 === bookId ? !book.selected : false,
            }))
        );
    };

    const handleDeleteSelected = () => {
        setBooks((prev) => prev.filter((book) => !book.selected));
    };

    const handleUpdateSelected = () => {
        // No-op for now as requested
        console.log("Update functionality not implemented yet");
    };

    const handleAddNewBook = (newBookData) => {
        const newBook = {
            isbn13: Date.now().toString(), // Generate unique ID
            title: newBookData.title,
            author: newBookData.author,
            subtitle: newBookData.author, // Keep subtitle for compatibility
            publisher: newBookData.publisher || "Unknown Publisher",
            publicationYear: newBookData.publicationYear || "Unknown",
            language: newBookData.language || "Unknown",
            pages: newBookData.pages || "Unknown",
            image:
                newBookData.imageUrl ||
                "https://via.placeholder.com/200x300?text=No+Image",
            url: "#", // Default URL since it's not in the form
            price: "N/A", // Default price since it's not in the form
            selected: false,
            isUserAdded: true, // Mark as user-added book
        };
        setBooks((prev) => [...prev, newBook]);
    };

    // Derived: quick lookup of on-loan status by isbn13
    const onLoanByIsbn = useMemo(() => {
        const map = new Map();
        loans.forEach((l) => map.set(l.isbn13, true));
        return map;
    }, [loans]);

    const handleCreateLoan = ({ borrower, isbn13, weeks }) => {
        const weeksInt = Math.max(1, Math.min(4, parseInt(weeks, 10) || 1));
        const due = new Date();
        due.setDate(due.getDate() + weeksInt * 7);
        setLoans((prev) => [
            ...prev,
            { borrower, isbn13, weeks: weeksInt, dueDate: due.toISOString() },
        ]);
    };

    const availableBooksForLoan = useMemo(
        () => books.filter((b) => b.isUserAdded && !onLoanByIsbn.get(b.isbn13)),
        [books, onLoanByIsbn]
    );

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterCriteria((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Get unique authors from user-added books only
    const uniqueAuthors = [
        ...new Set(
            books
                .filter((book) => book.isUserAdded)
                .map((book) => book.author)
                .filter((author) => author && author.trim() !== "")
        ),
    ].sort();

    // Filter books based on criteria - only show user-added books
    const filteredBooks = books.filter((book) => {
        // Only show user-added books
        if (!book.isUserAdded) return false;

        const matchesAuthor =
            !filterCriteria.author || book.author === filterCriteria.author;
        return matchesAuthor;
    });

    const handleViewBookDetails = (book) => {
        setSelectedBookForDetails(book);
    };

    const handleDismissBookDetails = () => {
        setSelectedBookForDetails(null);
    };

    return (
        <div className='app'>
            <header className='app-header'>
                <h1>Book Catalog</h1>
            </header>

            <div className='content'>
                <div className='main-layout'>
                    {view === "catalog" && (
                        <div className='btn-plus-container'>
                            <BookFilter
                                filterCriteria={filterCriteria}
                                onFilterChange={handleFilterChange}
                                authors={uniqueAuthors}
                            />
                            <div className='action-buttons'>
                                <button
                                    className='btn-update'
                                    onClick={() => setView("loans")}
                                    title='Switch to loan management'>
                                    Manage Loans
                                </button>
                            </div>
                            <BtnPlus onClick={handleAddBook} />
                            <div className='action-buttons'>
                                <button
                                    className='btn-update'
                                    onClick={handleUpdateSelected}
                                    title='Edit selected book'>
                                    Edit
                                </button>
                                <button
                                    className='btn-delete'
                                    onClick={handleDeleteSelected}
                                    title='Delete selected book'>
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}

                    {view === "catalog" ? (
                        selectedBookForDetails ? (
                            <BookDetails
                                book={selectedBookForDetails}
                                onDismiss={handleDismissBookDetails}
                            />
                        ) : (
                            <div className='books-grid'>
                                {filteredBooks.map((b) => (
                                    <Book
                                        key={b.isbn13}
                                        image={b.image}
                                        title={b.title}
                                        authors={b.author}
                                        url={b.url}
                                        price={b.price}
                                        isSelected={b.selected}
                                        onSelect={() =>
                                            handleBookSelect(b.isbn13)
                                        }
                                        onLoan={onLoanByIsbn.get(b.isbn13)}
                                        onViewDetails={() =>
                                            handleViewBookDetails(b)
                                        }
                                    />
                                ))}
                            </div>
                        )
                    ) : (
                        <div className='loan-pane'>
                            <LoanManagement
                                books={books}
                                availableBooks={availableBooksForLoan}
                                loans={loans}
                                onCreateLoan={handleCreateLoan}
                                onQuit={() => setView("catalog")}
                            />
                        </div>
                    )}
                </div>
            </div>

            <footer className='footer'>
                <p>Primcharlin Kiattipoompun Set G</p>
            </footer>

            <AddBookModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onAddBook={handleAddNewBook}
            />
        </div>
    );
}
