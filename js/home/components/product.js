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

function displayProducts() {
    const container = $('#productContainer'); // Changed from tbody to container
    container.empty();

    if (!products || products.length === 0) {
        container.append('<div class="col-12 text-center">No products found.</div>');
        return;
    }

    // Get 4 random products
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const randomProducts = shuffled.slice(0, 4);

    randomProducts.forEach(product => {
        const categoryName = getCategoryName(product.category_id);
        const mainImageUrl = product.main_image || '/placeholder-image.jpg';
        const priceVND = product.price || 0;
        const originalPrice = product.discount > 0 ? (priceVND / (1 - product.discount / 100)) : null;
        const sizesText = product.sizes ? product.sizes.map(s => `${s.size} (${s.stock})`).join(', ') : 'N/A';

        // Format price to VND
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(priceVND);

        const formattedOriginalPrice = originalPrice ? new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(originalPrice) : null;

        // Generate star rating HTML
        const rating = product.rating_average || 0;
        const reviewCount = product.reviews_count || 0;
        const starsHtml = generateStarRating(rating);
        // Determine if product has discount
        const hasDiscount = product.discount > 0;
        const discountBadge = hasDiscount ? `
            <div class="absolute top-3 left-3 z-10">
                <span class="text-black text-sm font-bold px-2 py-1 rounded-full">-${product.discount}%</span>
            </div>
        ` : '';

        const card = `
            <div style="margin-bottom: 10px" class="w-full px-4 md:w-1/2 lg:w-1/3 xl:w-1/4">
                <div class="group relative mb-8 overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
                    ${discountBadge}

                    <!-- Product Image -->
                    <div class="relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img src="${mainImageUrl}" 
                             alt="${product.product_name}"
                             class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                             onerror="this.src='/placeholder-image.jpg'">

                        <!-- Quick Action Buttons -->
                        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div class="flex space-x-2">
                                <button class="bg-white text-gray-800 p-2 rounded-full hover:bg-primary hover:text-white transition-colors duration-200" onclick="viewProduct('${product.id}')">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                </button>
                                <button class="bg-white text-gray-800 p-2 rounded-full hover:bg-primary hover:text-white transition-colors duration-200" onclick="toggleWishlist('${product.id}')">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Product Info -->
                    <div class="p-4">
                        <div class="mb-2">
                            <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">${categoryName}</span>
                        </div>
                        <h3 class="product-title mb-2 text-lg font-semibold text-gray-800 dark:text-white group-hover:text-primary transition-colors duration-200">
                            ${product.product_name}
                        </h3>

                        <!-- Rating -->
                        <div class="flex items-center mb-3">
                            <div class="flex text-yellow-400">
                                ${starsHtml}
                            </div>
                            <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">(${reviewCount} reviews)</span>
                        </div>

                        <!-- Price -->
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-4">
                                <span class="text-xl font-bold text-primary">${formattedPrice}</span>
                                ${formattedOriginalPrice ? `<span class="text-sm line-through text-gray-500 dark:text-gray-400">${formattedOriginalPrice}</span>` : ''}
                            </div>
                        </div>
                        <!-- Add to Cart Button -->
                        <button class="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-dark transition-colors duration-200 transform hover:scale-105" 
                                onclick="addToCart('${product.id}')">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.append(card);
    });
}

function generateStarRating(rating) {
    console.log(rating);
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHtml = '';

    // Full stars (yellow)
    for (let i = 0; i < fullStars; i++) {
        starsHtml += `
            <svg class="w-4 h-4 fill-current text-yellow-400" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
        `;
    }

    // Half star (if needed)
    if (hasHalfStar) {
        starsHtml += `
            <svg class="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
                <defs>
                    <linearGradient id="half-star">
                        <stop offset="50%" stop-color="currentColor" />
                        <stop offset="50%" stop-color="#d1d5db" />
                    </linearGradient>
                </defs>
                <path fill="url(#half-star)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
        `;
    }

    // Empty stars (gray)
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += `
            <svg class="w-4 h-4 fill-current text-gray-300" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
        `;
    }

    return starsHtml;
}

// Helper function to get category name (you may need to implement this based on your categories data)
function getCategoryName(categoryId) {
    // Replace this with your actual category lookup logic
    const categories = {
        '6850350b095e73f3384a39c1': 'Nike',
        '6850364d095e73f3384a39c3': 'Adidas'
    };
    return categories[categoryId] || 'Unknown Brand';
}