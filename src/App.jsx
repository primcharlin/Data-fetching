import { useEffect, useState } from "react";
import Book from "./Book";
import BtnPlus from "./BtnPlus";
import AddBookModal from "./AddBookModal";
import "./App.css";
import data from "./data.json";

export default function App() {
    const [books, setBooks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Transform data to include selected property and use title as author
        const transformedData = data.map((book) => ({
            ...book,
            author: book.subtitle || "Unknown Author",
            selected: false,
        }));
        setBooks(transformedData);
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

    return (
        <div className='app'>
            <header className='app-header'>
                <h1>Book Catalog</h1>
            </header>

            <div className='content'>
                <div className='main-layout'>
                    <div className='btn-plus-container'>
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
                    <div className='books-grid'>
                        {books
                            .filter((book) => book.isUserAdded)
                            .map((b) => (
                                <Book
                                    key={b.isbn13}
                                    image={b.image}
                                    title={b.title}
                                    authors={b.author}
                                    url={b.url}
                                    price={b.price}
                                    isSelected={b.selected}
                                    onSelect={() => handleBookSelect(b.isbn13)}
                                />
                            ))}
                    </div>
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
