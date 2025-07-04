$(function () {
    let products = [];
    const headerPromise = $.get('/ecommerce_fe/includes/home/header.html', function (data) {
        $('#header').html(data);
    });

    const footerPromise = $.get('/ecommerce_fe/includes/home/footer.html', function (data) {
        $('#footer').html(data);
    });

    $.when(headerPromise, footerPromise).done(function () {

        loadProducts();

        // ✅ Sửa lỗi: Thêm dấu # để select element theo ID
        $('#headerBtn').addClass('hidden');

        AuthManager.checkAuthAndUpdateHeader();

        $('#navbarToggler').on('click', function () {
            $('#navbarCollapse').toggleClass('hidden');
            // Thêm animation cho hamburger button
            $(this).toggleClass('active');
        });

        $(document).on('click', function (e) {
            const $target = $(e.target);
            if (
                !$target.closest('#navbarToggler').length &&
                !$target.closest('#navbarCollapse').length &&
                $(window).width() < 1024
            ) {
                $('#navbarCollapse').addClass('hidden');
                $('#navbarToggler').removeClass('active');
            }
        });

        $('.submenu-item > a').on('click', function (e) {
            e.preventDefault();
            const $submenu = $(this).next('.submenu');
            $('.submenu').not($submenu).slideUp(200);
            $submenu.stop(true, true).slideToggle(200);
        });
    });
    function checkAuthAndUpdateHeader() {
        const token = localStorage.getItem('token');
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

        if (token) {
            updateHeaderForLoggedInUser(userInfo);
        } else {
            updateHeaderForGuestUser();
        }
    }
    function updateHeaderForLoggedInUser(userInfo) {
        // Tìm auth section cho desktop
        const authSection = $('.hidden.sm\\:flex, .sm\\:flex').filter(function () {
            return $(this).find('a[href*="login"], a[href*="register"]').length > 0;
        });

        // Xử lý mobile menu
        if ($(window).width() < 1024) {
            // Xóa mobile user menu cũ (nếu có)
            $('#navbarCollapse .mobile-user-section').remove();

            const mobileUserMenu = `
            <div class="mobile-user-section block lg:hidden px-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center py-3 border-b border-gray-200 dark:border-gray-600">
                    <svg class="w-[20px] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span class="font-medium text-dark dark:text-white">${userInfo.firstName || userInfo.fristName || 'User'}</span>
                </div>
                 <a href="/ecommerce_fe/profile.html" class="flex items-center gap-[10px] px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i class="fas fa-user"></i> <span>My Profile</span>
                        </a>
                        <a href="/ecommerce_fe/orders.html" class="flex items-center gap-[10px] px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i class="fas fa-shopping-bag"></i> <span>My Orders</span>
                        </a>
                        <a href="/ecommerce_fe/settings.html" class="flex items-center gap-[10px] px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i class="fas fa-cog"></i> <span>Settings</span>
                        </a>
                        <div class="border-t border-gray-100 dark:border-gray-600"></div>
                        <button id="logoutBtn" class="flex items-center gap-[10px] w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i class="fas fa-sign-out-alt"></i> <span>Logout</span>
                        </button>
            </div>
        `;
            $('#navbarCollapse').append(mobileUserMenu);

            $('#logoutBtnMobile').on('click', function (e) {
                e.preventDefault();
                handleLogout();
            });
        }

        // Xử lý desktop menu
        if (authSection.length > 0) {
            const userName = userInfo.firstName || userInfo.fristName || 'User';
            const userMenuHtml = `
            <div class="relative group">
                <button class="flex items-center mr-12 space-x-2 py-2 px-4 gap-[10px] text-base font-medium text-dark dark:text-white hover:opacity-70 focus:outline-none">
                    <svg class="w-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span>${userName}</span>
                </button>
                <div class="absolute w-[150px] right-0 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div class="py-1">
                        <a href="/ecommerce_fe/profile.html" class="flex items-center gap-[10px] px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i class="fas fa-user"></i> <span>My Profile</span>
                        </a>
                        <a href="/ecommerce_fe/orders.html" class="flex items-center gap-[10px] px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i class="fas fa-shopping-bag"></i> <span>My Orders</span>
                        </a>
                        <a href="/ecommerce_fe/settings.html" class="flex items-center gap-[10px] px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i class="fas fa-cog"></i> <span>Settings</span>
                        </a>
                        <div class="border-t border-gray-100 dark:border-gray-600"></div>
                        <button id="logoutBtn" class="flex items-center gap-[10px] w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i class="fas fa-sign-out-alt"></i> <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
            authSection.html(userMenuHtml);

            $('#logoutBtn').on('click', function (e) {
                e.preventDefault();
                handleLogout();
            });
        }
    }
    function updateHeaderForGuestUser() {
        // Xóa mobile user menu nếu có
        $('#navbarCollapse .mobile-user-section').remove();

        // Thêm mobile auth section cho guest
        if ($(window).width() < 1024) {
            const mobileAuthSection = `
            <div class="mobile-auth-section block lg:hidden px-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <a href="/ecommerce_fe/auth/login.html" class="flex items-center gap-[10px] px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <i class="fas fa-sign-in-alt w-4"></i> <span>Sign In</span>
                </a>
                <a href="/ecommerce_fe/auth/register.html" class="flex items-center gap-[10px] px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <i class="fas fa-user-plus w-4"></i> <span>Sign Up</span>
                </a>
            </div>
        `;

            // Xóa mobile auth section cũ trước khi thêm mới
            $('#navbarCollapse .mobile-auth-section').remove();
            $('#navbarCollapse').append(mobileAuthSection);
        }

        // Khôi phục desktop auth section
        const authSection = $('.hidden.sm\\:flex, .sm\\:flex').filter(function () {
            return $(this).find('button, a[href*="profile"], #logoutBtn').length > 0;
        });

        if (authSection.length > 0) {
            const guestMenuHtml = `
            <a href="/ecommerce_fe/auth/login.html"
               class="loginBtn py-2 px-[22px] text-base font-medium text-dark dark:text-white hover:opacity-70">
               Sign In
            </a>
            <a href="/ecommerce_fe/auth/register.html"
               class="px-6 py-2 text-base font-medium text-white duration-300 ease-in-out rounded-md signUpBtn bg-primary hover:bg-blue-dark">
               Sign Up
            </a>
        `;
            authSection.html(guestMenuHtml);
        }
    }

    function refreshAccessToken(callback) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            toastr.error('No refresh token found. Please log in again.');
            localStorage.clear();
            window.location.href = '/ecommerce_fe/auth/login.html';
            return;
        }

        $.ajax({
            url: `${ENV.API_BASE_URL}/api/v1/user/refresh?refresh_token=${refreshToken}`,
            type: 'GET',
            success: function (response) {
                const newAccessToken = response.data.token;
                if (newAccessToken) {
                    localStorage.setItem('token', newAccessToken);
                    if (typeof callback === 'function') {
                        callback(newAccessToken);
                    }
                } else {
                    toastr.error('Failed to refresh token. Please log in again.');
                    localStorage.clear();
                    window.location.href = '/ecommerce_fe/auth/login.html';
                }
            },
            error: function () {
                toastr.error('Session expired. Please log in again.');
                localStorage.clear();
                window.location.href = '/ecommerce_fe/auth/login.html';
            }
        });
    }

    function handleLogout() {
        if (!confirm('Are you sure you want to logout?')) return;

        let token = localStorage.getItem('token');
        if (!token) {
            toastr.warning('You are not logged in');
            return;
        }

        const doLogout = (authToken) => {
            $.ajax({
                url: `${ENV.API_BASE_URL}/api/v1/user/logout`,
                type: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + authToken,
                    'Content-Type': 'application/json'
                },
                success: function () {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user_info');

                    if (typeof updateHeaderForGuestUser === 'function') {
                        updateHeaderForGuestUser();
                    }

                    toastr.success('Logout successful');

                    setTimeout(function () {
                        window.location.href = '/ecommerce_fe/index.html';
                    }, 1000);
                },
                error: function (xhr) {
                    if (xhr.status === 401) {
                        // Token expired → refresh rồi retry logout
                        refreshAccessToken((newToken) => {
                            doLogout(newToken); // retry logout
                        });
                    } else {
                        let errorMessage = 'Logout failed. Please try again.';

                        if (xhr.responseJSON && xhr.responseJSON.message) {
                            errorMessage = xhr.responseJSON.message;
                        } else if (xhr.responseText) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                errorMessage = response.message || response.error || errorMessage;
                            } catch (e) {
                                errorMessage = xhr.responseText;
                            }
                        }

                        console.error('Logout API failed:', errorMessage);
                        toastr.error(errorMessage);
                    }
                }
            });
        };

        doLogout(token);
    }

    function isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    }

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
            console.log(rating);
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
            <div class="w-full px-4 md:w-1/2 lg:w-1/3 xl:w-1/4">
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

    // Helper function to generate star rating HTML
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

    // Expose functions globally
    window.AuthManager = {
        checkAuthAndUpdateHeader: checkAuthAndUpdateHeader,
        handleLogout: handleLogout,
        isTokenExpired: isTokenExpired,
    };
});
