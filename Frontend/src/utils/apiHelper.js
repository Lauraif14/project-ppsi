// Helper function untuk handle API calls dengan better error handling
export const apiCall = async (url, options = {}) => {
    try {
        const token = localStorage.getItem('token');
        const defaultHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        // Check if response is ok
        if (!response.ok) {
            // Try to parse error message
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // If can't parse JSON, use status text
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        // Parse JSON response
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
};

// Helper untuk format error message
export const getErrorMessage = (error) => {
    if (error.message) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'Terjadi kesalahan yang tidak diketahui';
};
