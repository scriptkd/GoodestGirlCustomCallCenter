import { useState } from 'react';

function useLocalStorage(key, initalValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initalValue;
        }
        catch (error) {
            console.log(error);
            return initalValue;
        }
    });

    const setValue = (value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            setStoredValue(value);
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue]
}

export default useLocalStorage;


