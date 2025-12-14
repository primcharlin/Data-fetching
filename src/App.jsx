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
    const [editingBook, setEditingBook] = useState(null); // Book being edited, null for add mode
    const [filterCriteria, setFilterCriteria] = useState({
        author: "",
    });
    const [view, setView] = useState("catalog"); // catalog | loans
    const [loans, setLoans] = useState([]); // { isbn13, borrower, weeks, dueDate }
    const [selectedBookForDetails, setSelectedBookForDetails] = useState(null);

    // Load data from localStorage on mount
    useEffect(() => {
        const savedBooks = localStorage.getItem("books");
        if (savedBooks) {
            try {
                const parsedBooks = JSON.parse(savedBooks);
                setBooks(parsedBooks);
            } catch (error) {
                console.error("Error loading books from localStorage:", error);
            }
        }

        const savedLoans = localStorage.getItem("loans");
        if (savedLoans) {
            try {
                const parsedLoans = JSON.parse(savedLoans);
                setLoans(parsedLoans);
            } catch (error) {
                console.error("Error loading loans from localStorage:", error);
            }
        }
    }, []);

    // Save books to localStorage whenever they change
    useEffect(() => {
        if (books.length > 0 || localStorage.getItem("books")) {
            localStorage.setItem("books", JSON.stringify(books));
        }
    }, [books]);

    // Save loans to localStorage whenever they change
    useEffect(() => {
        if (loans.length > 0 || localStorage.getItem("loans")) {
            localStorage.setItem("loans", JSON.stringify(loans));
        }
    }, [loans]);

    const handleAddBook = () => {
        setEditingBook(null); // Set to add mode
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBook(null); // Reset edit mode
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
        const selectedBookIds = books
            .filter((book) => book.selected)
            .map((book) => book.isbn13);
        setBooks((prev) => prev.filter((book) => !book.selected));
        // Also remove any loans associated with deleted books
        setLoans((prev) =>
            prev.filter((loan) => !selectedBookIds.includes(loan.isbn13))
        );
    };

    const handleUpdateSelected = () => {
        const selectedBook = books.find((book) => book.selected);
        if (selectedBook) {
            setEditingBook(selectedBook);
            setIsModalOpen(true);
        } else {
            alert("Please select a book to edit");
        }
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

    const handleUpdateBook = (updatedBookData) => {
        if (!editingBook) return;

        setBooks((prev) =>
            prev.map((book) =>
                book.isbn13 === editingBook.isbn13
                    ? {
                          ...book,
                          title: updatedBookData.title,
                          author: updatedBookData.author,
                          subtitle: updatedBookData.author,
                          publisher:
                              updatedBookData.publisher || "Unknown Publisher",
                          publicationYear:
                              updatedBookData.publicationYear || "Unknown",
                          language: updatedBookData.language || "Unknown",
                          pages: updatedBookData.pages || "Unknown",
                          image:
                              updatedBookData.imageUrl ||
                              "https://via.placeholder.com/200x300?text=No+Image",
                          selected: false, // Deselect after editing
                      }
                    : book
            )
        );
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
                onUpdateBook={handleUpdateBook}
                editingBook={editingBook}
            />
        </div>
    );
}
