let editingProductId = null;
let categories = [];
let products = [];

// Initialize page
$(document).ready(function () {
    loadCategories();
    loadProducts();
    setupEventHandlers();
});

// Setup event handlers
function setupEventHandlers() {
    // Add size button
    $('#addSizeBtn').on('click', function () {
        addSizeRow();
    });

    // Remove size button (delegated event)
    $(document).on('click', '.remove-size-btn', function () {
        $(this).closest('.size-row').remove();
    });

    // Image preview handlers
    $('#mainImage').on('change', function () {
        previewMainImage(this);
    });

    $('#subImages').on('change', function () {
        previewSubImages(this);
    });

    // Form submission
    $('#productForm').on('submit', function (e) {
        e.preventDefault();
        saveProduct();
    });
}

// Load categories for dropdown
function loadCategories() {
    $.ajax({
        url: `${ENV.API_BASE_URL}/api/v1/category`,
        method: 'GET',
        success: function (response) {
            if (Array.isArray(response.data)) {
                categories = response.data;
            } else if (Array.isArray(response)) {
                categories = response;
            } else {
                categories = []; 
            }
            populateCategoryDropdown();
        },
        error: function (xhr, status, error) {
            console.error('Error loading categories:', error);
            toastr.error('Failed to load categories');
        }
    });
}

// Populate category dropdown
function populateCategoryDropdown() {
    if (!Array.isArray(categories) || categories.length === 0) {
        return;
    }
    const categorySelect = $('#categoryId');
    categorySelect.empty();
    categorySelect.append('<option value="">-- Select Category --</option>');

    categories.forEach(category => {
        console.log(category);
        categorySelect.append(`<option value="${category.id || category._id}">${category.category_name}</option>`);
    });
}

// Load products
function loadProducts() {
    $.ajax({
        url: `${ENV.API_BASE_URL}/api/v1/product`,
        method: 'GET',
        crossDomain: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Accept', 'application/json');
        },
        success: function (response) {
            if (Array.isArray(response.data)) {
                products = response.data;
            } else if (Array.isArray(response)) {
                products = response;
            } else {
                products = []; 
            }
            displayProducts();
        },
        error: function (xhr, status, error) {
            console.error('Error loading products:', error);
            toastr.error('Failed to load products');
        }
    });
}


// Display products in table
function displayProducts() {
    const tbody = $('#productTableBody');
    tbody.empty();

    if (!products || products.length === 0) {
        tbody.append('<tr><td colspan="7" class="text-center py-4">No products found.</td></tr>');
        return;
    }

    products.forEach(product => {
        const categoryName = getCategoryName(product.category_id);
        const mainImageUrl = product.main_image || '/placeholder-image.jpg';
        const priceRange = getPriceRange(product.sizes);
        const sizesText = product.sizes ? product.sizes.map(s => s.size).join(', ') : 'N/A';

        const row = `
                    <tr class="bg-white border-b hover:bg-gray-50">
                        <td class="px-6 py-4">
                            <img src="${mainImageUrl}" alt="${product.product_name}" class="w-16 h-16 object-cover rounded">
                        </td>
                        <td class="px-6 py-4 font-medium text-gray-900">
                            ${product.product_name}
                        </td>
                        <td class="px-6 py-4">
                            ${categoryName}
                        </td>
                        <td class="px-6 py-4">
                            ${product.color}
                        </td>
                        <td class="px-6 py-4">
                            ${sizesText}
                        </td>
                        <td class="px-6 py-4">
                            ${priceRange}
                        </td>
                        <td class="px-6 py-4">
                            <button onclick="editProduct('${product.id || product._id}')" 
                                class="text-blue-600 hover:text-blue-900 mr-2">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteProduct('${product.id || product._id}')" 
                                class="text-red-600 hover:text-red-900">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
        tbody.append(row);
    });
}

// Helper functions
function getCategoryName(categoryId) {
    const category = categories.find(c => (c.id || c._id) === categoryId);
    return category ? category.name : 'Unknown';
}

function getPriceRange(sizes) {
    if (!sizes || sizes.length === 0) return 'N/A';

    const prices = sizes.map(s => s.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
        return `${minPrice} VND`;
    }
    return `${minPrice} - ${maxPrice} VND`;
}

// Modal functions
function openAddModal() {
    editingProductId = null;
    $('#modalTitle').text('Add Product');
    $('#productForm')[0].reset();
    $('#mainImagePreview').empty();
    $('#subImagesPreview').empty();
    resetSizes();
    $('#productModal').removeClass('hidden');
}

function closeModal() {
    $('#productModal').addClass('hidden');
}

// Size management
function addSizeRow() {
    const sizeRow = `
                <div class="size-row">
                    <input type="text" placeholder="Size (e.g., M, L, XL)" class="size-input flex-1 px-3 py-2 border border-gray-300 rounded-md">
                    <input type="number" placeholder="Stock" class="stock-input w-24 px-3 py-2 border border-gray-300 rounded-md">
                    <button type="button" class="remove-size-btn bg-red-500 text-white px-2 py-1 rounded">Remove</button>
                </div>
            `;
    $('#sizesContainer').append(sizeRow);
}

function resetSizes() {
    $('#sizesContainer').empty();
    addSizeRow();
}

// Image preview functions
function previewMainImage(input) {
    const preview = $('#mainImagePreview');
    preview.empty();

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.append(`<img src="${e.target.result}" class="image-preview" alt="Main image preview">`);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function previewSubImages(input) {
    const preview = $('#subImagesPreview');
    preview.empty();

    if (input.files) {
        Array.from(input.files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const container = $(`
                            <div class="sub-image-container">
                                <img src="${e.target.result}" class="image-preview" alt="Sub image preview">
                                <div class="remove-image" onclick="removeSubImage(${index})">×</div>
                            </div>
                        `);
                preview.append(container);
            };
            reader.readAsDataURL(file);
        });
    }
}

function removeSubImage(index) {
    // This is a simplified version - in a real app, you'd need to handle file removal properly
    $(`#subImagesPreview .sub-image-container:eq(${index})`).remove();
}

// Save product
function saveProduct() {
    const formData = new FormData();

    // Basic product data
    formData.append('product_name', $('#productName').val());
    formData.append('product_description', $('#productDescription').val());
    formData.append('category_id', $('#categoryId').val());
    formData.append('color', $('#color').val());
    formData.append('currency', $('#currency').val());
    formData.append('price', $('#price').val());
    formData.append('discount', $('#discount').val());

    // Main image
    const mainImageFile = $('#mainImage')[0].files[0];
    if (mainImageFile) {
        formData.append('main_image', mainImageFile);
    }

    // Sub images
    const subImageFiles = $('#subImages')[0].files;
    for (let i = 0; i < subImageFiles.length; i++) {
        formData.append('sub_images', subImageFiles[i]);
    }

    // Sizes data
    const sizes = [];
    $('.size-row').each(function () {
        const size = $(this).find('.size-input').val();
        const stock = $(this).find('.stock-input').val();

        if (size && price && stock) {
            sizes.push({
                size: size,
                stock: parseInt(stock)
            });
        }
    });

    formData.append('size_count', sizes.length);
    sizes.forEach((sizeData, index) => {
        formData.append(`sizes[${index}][size]`, sizeData.size);
        formData.append(`sizes[${index}][stock]`, sizeData.stock);
    });

    const url = editingProductId ?
        `${ENV.API_BASE_URL}/api/v1/product/${editingProductId}` :
        `${ENV.API_BASE_URL}/api/v1/product`;

    const method = editingProductId ? 'PUT' : 'POST';
    console.log(formData);
    $.ajax({
        url: url,
        method: method,
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            toastr.success(editingProductId ? 'Product updated successfully!' : 'Product created successfully!');
            closeModal();
            loadProducts();
        },
        error: function (xhr, status, error) {
            console.error('Error saving product:', error);
            toastr.error('Failed to save product: ' + (xhr.responseJSON?.message || error));
        }
    });
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => (p.id || p._id) === productId);
    if (!product) {
        toastr.error('Product not found');
        return;
    }

    editingProductId = productId;
    $('#modalTitle').text('Edit Product');

    // Fill form with product data
    $('#productName').val(product.product_name);
    $('#productDescription').val(product.product_description);
    $('#categoryId').val(product.category_id);
    $('#color').val(product.color);
    $('#currency').val(product.currency);

    // Fill sizes
    $('#sizesContainer').empty();
    if (product.sizes && product.sizes.length > 0) {
        product.sizes.forEach(sizeData => {
            const sizeRow = `
                        <div class="size-row">
                            <input type="text" value="${sizeData.size}" placeholder="Size" class="size-input flex-1 px-3 py-2 border border-gray-300 rounded-md">
                            <input type="number" value="${sizeData.price}" placeholder="Price" class="price-input w-24 px-3 py-2 border border-gray-300 rounded-md">
                            <input type="number" value="${sizeData.discount || 0}" placeholder="Discount %" class="discount-input w-24 px-3 py-2 border border-gray-300 rounded-md">
                            <input type="number" value="${sizeData.stock}" placeholder="Stock" class="stock-input w-24 px-3 py-2 border border-gray-300 rounded-md">
                            <button type="button" class="remove-size-btn bg-red-500 text-white px-2 py-1 rounded">Remove</button>
                        </div>
                    `;
            $('#sizesContainer').append(sizeRow);
        });
    } else {
        addSizeRow();
    }

    // Show existing images
    $('#mainImagePreview').empty();
    $('#subImagesPreview').empty();

    if (product.main_image) {
        $('#mainImagePreview').append(`<img src="${product.main_image}" class="image-preview" alt="Current main image">`);
    }

    if (product.sub_images && product.sub_images.length > 0) {
        product.sub_images.forEach(imageUrl => {
            $('#subImagesPreview').append(`
                        <div class="sub-image-container">
                            <img src="${imageUrl}" class="image-preview" alt="Current sub image">
                        </div>
                    `);
        });
    }

    $('#productModal').removeClass('hidden');
}
// Delete product
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    $.ajax({
        url: `${ENV.API_BASE_URL}/api/v1/product/${productId}`,
        method: 'DELETE',
        success: function (response) {
            toastr.success('Product deleted successfully!');
            loadProducts();
        },
        error: function (xhr, status, error) {
            console.error('Error deleting product:', error);
            toastr.error('Failed to delete product: ' + (xhr.responseJSON?.message || error));
        }
    });
}

// Configure toastr
toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};