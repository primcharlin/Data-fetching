import { useEffect, useState } from "react";
import "./App.css";

export default function BookDetails({ book, onDismiss }) {
    const [similarBooks, setSimilarBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!book) return;

        const fetchSimilarBooks = async () => {
            setLoading(true);
            setError(null);
            try {
                // Try searching by title first
                let query = book.title;
                // If title is too long, use first few words
                if (query.length > 30) {
                    query = query.split(" ").slice(0, 3).join(" ");
                }

                const response = await fetch(
                    `https://api.itbook.store/1.0/search/${encodeURIComponent(query)}`
                );
                const data = await response.json();

                if (data.error === "0" && data.books) {
                    // Filter out the current book and limit to 6 similar books
                    const filtered = data.books
                        .filter((b) => b.isbn13 !== book.isbn13)
                        .slice(0, 6);
                    setSimilarBooks(filtered);
                } else {
                    setSimilarBooks([]);
                }
            } catch (err) {
                console.error("Error fetching similar books:", err);
                setError("Failed to load similar books");
                setSimilarBooks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSimilarBooks();
    }, [book]);

    if (!book) return null;

    return (
        <div className='book-details-overlay'>
            <div className='book-details-container'>
                <button
                    className='book-details-dismiss'
                    onClick={onDismiss}
                    title='Close details'>
                    ×
                </button>

                <div className='book-details-content'>
                    <div className='book-details-main'>
                        <div className='book-details-image'>
                            <img
                                src={book.image}
                                alt={book.title}
                            />
                        </div>
                        <div className='book-details-info'>
                            <h2 className='book-details-title'>{book.title}</h2>
                            <div className='book-details-meta'>
                                <div className='book-details-row'>
                                    <span className='book-details-label'>Author:</span>
                                    <span className='book-details-value'>
                                        {book.author || book.subtitle || "Unknown"}
                                    </span>
                                </div>
                                <div className='book-details-row'>
                                    <span className='book-details-label'>Publisher:</span>
                                    <span className='book-details-value'>
                                        {book.publisher || "Unknown"}
                                    </span>
                                </div>
                                <div className='book-details-row'>
                                    <span className='book-details-label'>
                                        Publication Year:
                                    </span>
                                    <span className='book-details-value'>
                                        {book.publicationYear || "Unknown"}
                                    </span>
                                </div>
                                <div className='book-details-row'>
                                    <span className='book-details-label'>Pages:</span>
                                    <span className='book-details-value'>
                                        {book.pages || "Unknown"}
                                    </span>
                                </div>
                                <div className='book-details-row'>
                                    <span className='book-details-label'>Language:</span>
                                    <span className='book-details-value'>
                                        {book.language || "Unknown"}
                                    </span>
                                </div>
                                <div className='book-details-row'>
                                    <span className='book-details-label'>Price:</span>
                                    <span className='book-details-value'>
                                        {book.price || "N/A"}
                                    </span>
                                </div>
                                {book.isbn13 && (
                                    <div className='book-details-row'>
                                        <span className='book-details-label'>ISBN-13:</span>
                                        <span className='book-details-value'>
                                            {book.isbn13}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='similar-books-section'>
                        <h3 className='similar-books-title'>Similar Books</h3>
                        {loading && (
                            <p className='similar-books-loading'>Loading similar books...</p>
                        )}
                        {error && (
                            <p className='similar-books-error'>{error}</p>
                        )}
                        {!loading && !error && similarBooks.length === 0 && (
                            <p className='similar-books-empty'>
                                No similar books found.
                            </p>
                        )}
                        {!loading && similarBooks.length > 0 && (
                            <div className='similar-books-grid'>
                                {similarBooks.map((similarBook) => (
                                    <div
                                        key={similarBook.isbn13}
                                        className='similar-book-card'>
                                        <img
                                            src={similarBook.image}
                                            alt={similarBook.title}
                                            className='similar-book-image'
                                        />
                                        <div className='similar-book-info'>
                                            <h4 className='similar-book-title'>
                                                {similarBook.title}
                                            </h4>
                                            <p className='similar-book-subtitle'>
                                                {similarBook.subtitle}
                                            </p>
                                            <p className='similar-book-price'>
                                                {similarBook.price}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

