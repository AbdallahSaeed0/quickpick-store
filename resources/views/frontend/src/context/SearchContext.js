import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [parsedProducts, setParsedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                console.log('SearchContext API URL:', `${process.env.REACT_APP_API_URL}/api/products`);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`);
                console.log('SearchContext API response:', response.data);
                // Ensure the price is a number (Laravel returns price as a number, but let's be safe)
                const products = response.data.map((product) => ({
                    ...product,
                    price: parseFloat(product.price),
                }));
                setParsedProducts(products);
                setError(null);
            } catch (err) {
                console.error('SearchContext Error fetching products:', err);
                console.error('SearchContext Error details:', err.response?.data || err.message);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <SearchContext.Provider value={{ parsedProducts, loading, error }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => useContext(SearchContext);
