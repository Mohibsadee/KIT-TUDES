import { useEffect, useState } from "react";

const Quote = () => {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fallbackQuotes = [
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { quote: "Whoever is happy will make others happy too.", author: "Anne Frank" },
    { quote: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" }
  ];

  const fetchQuote = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://dummyjson.com/quotes/random");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      // API returns: { id, quote, author }
      setQuote(data.quote);
      setAuthor(data.author);
    } catch (err) {
      console.error("API Error, using fallback:", err);
      setError("Could not fetch from API. Using fallback quotes.");
      const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      setQuote(randomQuote.quote);
      setAuthor(randomQuote.author);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md text-center max-w-lg mx-auto">
      <div className="min-h-[120px] flex flex-col justify-center">
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <p className="text-xl font-serif italic text-gray-800">"{quote}"</p>
            <p className="mt-4 font-semibold text-gray-700">— {author}</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}


    </div>
  );
};

export default Quote;
