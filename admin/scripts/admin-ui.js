
import apiClient from '../src/js/api-client.js'; // Import the default instance

class AdminUI {
    constructor() {
        this.productForm = document.getElementById('product-form');
        this.productList = document.getElementById('product-list');
        this.productNameField = document.getElementById('product-name');
        this.productDescriptionField = document.getElementById('product-description');
        this.productPriceField = document.getElementById('product-price');
        this.productCategoryField = document.getElementById('product-category');
        this.productStockField = document.getElementById('product-stock');
        this.productImageField = document.getElementById('product-image');
        this.productStatusField = document.getElementById('product-status');
        this.addProductModal = $('#addProductModal'); // jQuery for modal
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.loadCategories();
    }

    setupEventListeners() {
        this.productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));

        // File input handling
        document.getElementById('product-image').addEventListener('change', (e) => {
            const fileName = e.target.files[0]?.name || 'Choose file...';
            e.target.nextElementSibling.textContent = fileName;
        });

        // Section navigation
        document.querySelectorAll('.list-group-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Global functions for product actions
        window.editProduct = (id) => this.editProduct(id);
        window.deleteProduct = (id) => this.deleteProduct(id);
    }

    async loadProducts() {
        try {
            const products = await apiClient.getProducts();
            this.renderProducts(products);
            this.updateProductStats(products);
        } catch (error) {
            console.error('Error loading products:', error);
            this.showAlert('Error loading products', 'danger');
        }
    }

    renderProducts(products) {
        this.productList.innerHTML = products.map(product => `
            <tr>
                <td><img src="${product.image}" alt="${product.name}" class="product-thumb"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>₹${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td><span class="badge badge-${product.status === 'active' ? 'success' : 'danger'}">${product.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async handleProductSubmit(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', this.productNameField.value);
        formData.append('description', this.productDescriptionField.value);
        formData.append('price', this.productPriceField.value);
        formData.append('category', this.productCategoryField.value);
        formData.append('stock', this.productStockField.value);
        formData.append('status', this.productStatusField.value);
        if (this.productImageField.files[0]) {
            formData.append('image', this.productImageField.files[0]);
        }

        const productId = this.productForm.dataset.productId;

        try {
            if (productId) {
                await apiClient.updateProduct(productId, formData);
            } else {
                await apiClient.createProduct(formData);
            }
            this.showAlert('Product saved successfully', 'success');
            this.loadProducts();
            this.addProductModal.modal('hide');
            this.productForm.reset();
            delete this.productForm.dataset.productId; // Clear product ID after submission
        } catch (error) {
            console.error('Error saving product:', error);
            this.showAlert('Error saving product', 'danger');
        }
    }

    async editProduct(id) {
        try {
            const product = await apiClient.getProduct(id);
            this.productNameField.value = product.name;
            this.productDescriptionField.value = product.description;
            this.productPriceField.value = product.price;
            this.productCategoryField.value = product.category;
            this.productStockField.value = product.stock;
            this.productStatusField.value = product.status;
            // Image field cannot be pre-filled for security reasons
            this.productForm.dataset.productId = product.id; // Store product ID for update
            this.addProductModal.modal('show');
        } catch (error) {
            console.error('Error fetching product for edit:', error);
            this.showAlert('Error loading product for edit', 'danger');
        }
    }

    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await apiClient.deleteProduct(id);
            this.showAlert('Product deleted successfully', 'success');
            this.loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showAlert('Error deleting product', 'danger');
        }
    }

    async loadCategories() {
        try {
            const categories = await apiClient.getCategories();
            const categoryFilter = document.getElementById('category-filter');
            const productCategory = document.getElementById('product-category');

            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            productCategory.innerHTML = '';

            categories.forEach(category => {
                const optionFilter = document.createElement('option');
                optionFilter.value = category.name;
                optionFilter.textContent = category.name;
                categoryFilter.appendChild(optionFilter);

                const optionProduct = document.createElement('option');
                optionProduct.value = category.name;
                optionProduct.textContent = category.name;
                productCategory.appendChild(optionProduct);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    updateProductStats(products) {
        document.getElementById('total-products').textContent = products.length;
        document.getElementById('active-products').textContent = products.filter(p => p.status === 'active').length;
        document.getElementById('low-stock').textContent = products.filter(p => p.stock < 10 && p.stock > 0).length;
        document.getElementById('out-of-stock').textContent = products.filter(p => p.stock === 0).length;
    }

    handleNavigation(e) {
        e.preventDefault();
        document.querySelectorAll('.list-group-item').forEach(item => item.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const section = e.currentTarget.dataset.section;
        document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${section}-section`).classList.add('active');
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        `;
        document.querySelector('.container-fluid').prepend(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }
}

// Initialize admin UI
const adminUI = new AdminUI();

function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('adminAccess');
    window.location.href = 'login.html';
}
