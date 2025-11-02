const apiBaseUrl = 'http://localhost:3000/api'; // Update with your API base URL

async function fetchProducts() {
    try {
        const response = await fetch(`${apiBaseUrl}/products`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const products = await response.json();
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

async function fetchProductById(productId) {
    try {
        const response = await fetch(`${apiBaseUrl}/products/${productId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const product = await response.json();
        return product;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
}

async function createOrder(orderData) {
    try {
        const response = await fetch(`${apiBaseUrl}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const order = await response.json();
        return order;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

export { fetchProducts, fetchProductById, createOrder };