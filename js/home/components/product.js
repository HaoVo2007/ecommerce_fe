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

const token = localStorage.getItem('token');

let productData = null;
let selectedSize = null;
let currentQuantity = 1;
function loadProducts() {
    showSkeletons();
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
        const categoryName = "NAN";
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
                                <button class="add-to-cart-btn w-full py-4 text-white font-bold rounded-lg text-lg">
                                    <i class="fas fa-eye mr-2"></i>
                                    <a href="/ecommerce_fe/home/detail.html?id=${product.id}">View Details</a>
                                </button>
                        </div>
                    </div>
            </div>
        `;

        container.append(card);
    });
}

function showSkeletons() {
    const container = $('#productContainer');
    container.empty();

    const skeleton = `
        <div class="w-full px-4 md:w-1/2 lg:w-1/3 xl:w-1/4">
            <div role="status" class="h-full p-4 border border-gray-200 rounded-sm shadow-sm animate-pulse dark:border-gray-700">
                <div class="flex items-center justify-center h-48 mb-4 bg-gray-300 rounded-sm dark:bg-gray-700">
                    <svg class="w-10 h-10 text-gray-200 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                        <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z"/>
                        <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"/>
                    </svg>
                </div>
                <div class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                <div class="flex items-center mt-4">
                    <svg class="w-10 h-10 me-3 text-gray-200 dark:text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                    </svg>
                    <div>
                        <div class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
                        <div class="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    for (let i = 0; i < 4; i++) {
        container.append(skeleton);
    }
}

function viewProduct(productId) {
    if (!productId) {
        console.error('Product ID is missing');
        return;
    }
    window.location.href = `/ecommerce_fe/home/detail.html?id=${productId}`;
}

function generateStarRating(rating) {
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

function getProductId() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    return productId
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

async function loadProductByID() {
    try {
        $('#loading').show();
        const productId = getProductId();

        const response = await $.ajax({
            url: `${ENV.API_BASE_URL}/api/v1/product/${productId}`,
            method: 'GET',
            dataType: 'json'
        });

        if (response.status_code === 200) {
            productData = response.data;
            renderProduct();
        } else {
            throw new Error(response.message || 'Failed to load product');
        }
    } catch (error) {
        console.error('Error loading product:', error);
        toastr.error('Failed to load product. Please try again!');
    } finally {
        $('#loading').hide();
    }
}

function renderProduct() {
    const product = productData;

    // Update product name
    $('#product-name').text(product.product_name);
    document.title = product.product_name;

    // Update rating
    $('#rating-stars').html(generateStarRating(product.rating_average));
    $('#rating-text').text(`(${product.reviews_count} Reviews)`);

    // Update color
    $('#product-color').text(product.color);

    // Update prices
    const originalPrice = product.price;
    const discountedPrice = originalPrice * (1 - product.discount / 100);

    $('#original-price').text(formatCurrency(originalPrice));
    $('#discounted-price').text(formatCurrency(discountedPrice));
    $('#discount-percent').text(`-${product.discount}%`);

    if (product.discount > 0) {
        $('#discount-badge').text(`-${product.discount}%`).show();
    }

    // Update main image
    $('#main-image').attr('src', product.main_image);

    // Update thumbnails
    renderThumbnails();

    // Update sizes
    renderSizes();

    // Update description
    $('#product-description').html(product.product_description.replace(/\r\n/g, '<br>'));

    // Add fade-in animation
    $('#product-container').addClass('fade-in');
}

function renderThumbnails() {
    const product = productData;
    const container = $('#thumbnail-container');
    container.empty();

    // Add main image as first thumbnail
    const mainThumb = $(`
                <div class="thumbnail-image active w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0" data-image="${product.main_image}">
                    <img src="${product.main_image}" alt="Main" class="w-full h-full object-cover">
                </div>
            `);
    container.append(mainThumb);

    // Add sub images
    product.sub_image.forEach(img => {
        const thumb = $(`
                    <div class="thumbnail-image w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0" data-image="${img.url}">
                        <img src="${img.url}" alt="Sub Image" class="w-full h-full object-cover">
                    </div>
                `);
        container.append(thumb);
    });

    // Add click events
    $('.thumbnail-image').on('click', function () {
        const imageUrl = $(this).data('image');
        $('#main-image').attr('src', imageUrl);

        $('.thumbnail-image').removeClass('active');
        $(this).addClass('active');
    });
}

function renderSizes() {
    const product = productData;
    const container = $('#size-options');
    container.empty();

    product.sizes.forEach(sizeOption => {
        const sizeBtn = $(`
                    <div class="size-option border-2 border-gray-300 rounded-lg p-3 text-center font-semibold ${sizeOption.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}" 
                         data-size="${sizeOption.size}" data-stock="${sizeOption.stock}">
                        ${sizeOption.size}
                    </div>
                `);

        if (sizeOption.stock > 0) {
            sizeBtn.on('click', function () {
                selectedSize = $(this).data('size');
                const stock = $(this).data('stock');

                $('.size-option').removeClass('selected');
                $(this).addClass('selected');

                $('#stock-info').text(`${stock} items available`);
                $('#quantity').attr('max', stock);

                if (currentQuantity > stock) {
                    currentQuantity = stock;
                    $('#quantity').val(currentQuantity);
                }
            });
        }

        container.append(sizeBtn);
    });
}

$('#decrease-qty').on('click', function () {
    if (currentQuantity > 1) {
        currentQuantity--;
        $('#quantity').val(currentQuantity);
    }
});

$('#increase-qty').on('click', function () {
    const maxStock = selectedSize ?
        productData.sizes.find(s => s.size === selectedSize)?.stock :
        Math.max(...productData.sizes.map(s => s.stock));

    if (currentQuantity < maxStock) {
        currentQuantity++;
        $('#quantity').val(currentQuantity);
    }
});

$('#quantity').on('change', function () {
    const value = parseInt($(this).val());
    const maxStock = selectedSize ?
        productData.sizes.find(s => s.size === selectedSize)?.stock :
        Math.max(...productData.sizes.map(s => s.stock));

    if (value >= 1 && value <= maxStock) {
        currentQuantity = value;
    } else {
        $(this).val(currentQuantity);
    }
});

$('#add-to-cart').on('click', function () {
    if (!selectedSize) {
        toastr.warning('Please select a size');
        return;
    }

    const selectedSizeData = productData.sizes.find(s => s.size == selectedSize);
    if (selectedSizeData.stock < currentQuantity) {
        toastr.error('Quantity exceeds stock!');
        return;
    }
    selectedSize = selectedSize.toString();
    const btn = $(this);
    const originalText = btn.html();
    btn.html('<i class="fas fa-spinner fa-spin mr-2"></i>Adding...');
    btn.prop('disabled', true);
    const decoded = jwt_decode(token);
    const userId = decoded.user_id;
    console.log(userId);
    // Dữ liệu gửi lên API
    const data = {
        product_id: productData.id,
        size: selectedSize,
        quantity: currentQuantity,
        user_id: userId
    }

    // Gửi request AJAX
    $.ajax({
        url: `${ENV.API_BASE_URL}/api/v1/cart`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            toastr.success('Product added to cart!');
            
            const badge = $('#cart-icon');
            let count = parseInt(badge.text());
            badge.text(count + 1);

            // Reset nút
            btn.html(originalText);
            btn.prop('disabled', false);
        },
        error: function (xhr) {
            toastr.error('Failed to add to cart!');
            btn.html(originalText);
            btn.prop('disabled', false);
        }
    });
});
