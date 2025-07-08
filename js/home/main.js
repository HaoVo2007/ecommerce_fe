$(function () {
    let products = [];
    const headerPromise = $.get('/ecommerce_fe/includes/home/header.html', function (data) {
        $('#header').html(data);
    });

    const footerPromise = $.get('/ecommerce_fe/includes/home/footer.html', function (data) {
        $('#footer').html(data);
    });

    $.when(headerPromise, footerPromise).done(function () {
        // ✅ Sửa lỗi: Thêm dấu # để select element theo ID
        $('#headerBtn').addClass('hidden');

        AuthManager.checkAuthAndUpdateHeader();
        
        $(document).on('click', '#navbarToggler', function () {
            console.log('click');
            $('#navbarCollapse').toggleClass('hidden');
        });

        $(document).on('click', function (e) {
            if (
                $(window).width() < 1024 &&
                !$(e.target).closest('#navbarCollapse, #navbarToggler').length
            ) {
                $('#navbarCollapse').addClass('hidden');
            }
        });

        // Mobile submenu handling
        $(document).on('click', '.submenu-item > a', function (e) {
            if ($(window).width() < 1024) {
                e.preventDefault();
                const $submenu = $(this).next('.submenu');
                $('.submenu').not($submenu).slideUp(200);
                $submenu.stop(true, true).slideToggle(200);
            }
        });

        // Window resize handler
        $(window).on('resize', function () {
            if ($(window).width() >= 1024) {
                $('#navbarCollapse').removeClass('mobile-menu-open').addClass('mobile-menu-closed');
                $('.submenu').hide(); // Hide all submenus on resize
            }
        });
    });

    function checkAuthAndUpdateHeader() {
        const token = localStorage.getItem('token');
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');

        if (token && !isTokenExpired(token)) {
            updateHeaderForLoggedInUser(userInfo);
        } else if (token && isTokenExpired(token)) {
            // Try to refresh token
            refreshAccessToken(() => {
                updateHeaderForLoggedInUser(userInfo);
            });
        } else {
            updateHeaderForGuestUser();
        }
    }

    function updateHeaderForLoggedInUser(userInfo) {
        const userName = userInfo.firstName || userInfo.fristName || 'User';

        // Update desktop auth section
        const desktopAuthSection = $('.hidden.sm\\:flex').last();
        if (desktopAuthSection.length > 0) {
            const userMenuHtml = `
                <!-- Shopping actions -->
                <div class="hidden sm:flex items-center space-x-4">
                    <a href="/ecommerce_fe/wishlist.html" class="icon-hover relative p-2 text-white hover:text-red-400 rounded-full glass-effect">
                        <i class="fas fa-heart text-xl"></i>
                        <span class="cart-badge">0</span>
                    </a>
                    <a href="/ecommerce_fe/home/cart.html" class="icon-hover relative p-2 text-white hover:text-yellow-400 rounded-full glass-effect">
                        <i class="fas fa-shopping-cart text-xl"></i>
                        <span id="cart-icon" class="cart-badge">0</span>
                    </a>
                </div>

                <!-- User Menu -->
                <div class="hidden sm:flex items-center space-x-3">
                    <div class="relative group">
                        <button class="btn-secondary py-2 px-6 text-white font-medium rounded-xl hover:bg-white hover:text-purple-600 transition-all duration-300 flex items-center">
                            <i class="fas fa-user mr-2"></i>
                            ${userName}
                            <i class="fas fa-chevron-down ml-2 text-sm transition-transform group-hover:rotate-180"></i>
                        </button>
                        
                        <!-- Dropdown Menu -->
                        <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100">
                            <div class="py-2">
                                <div class="px-4 py-3 border-b border-gray-100">
                                    <p class="text-sm font-medium text-gray-900">${userName}</p>
                                    <p class="text-xs text-gray-500">${userInfo.email || 'user@example.com'}</p>
                                </div>
                                
                                <a href="/ecommerce_fe/profile.html" class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white rounded-lg mx-2 transition-all duration-300">
                                    <i class="fas fa-user mr-3"></i>My Profile
                                </a>
                                
                                <a href="/ecommerce_fe/orders.html" class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white rounded-lg mx-2 transition-all duration-300">
                                    <i class="fas fa-shopping-bag mr-3"></i>My Orders
                                </a>
                                
                                <a href="/ecommerce_fe/settings.html" class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white rounded-lg mx-2 transition-all duration-300">
                                    <i class="fas fa-cog mr-3"></i>Settings
                                </a>
                                
                                <div class="border-t border-gray-100 my-2"></div>
                                
                                <button id="logoutBtn" class="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg mx-2 transition-all duration-300">
                                    <i class="fas fa-sign-out-alt mr-3"></i>Logout
                                    <span id="loadingText" class="flex items-center gap-[10px] justify-center" style="display: none;">
                                                <div role="status">
                                                    <svg aria-hidden="true" class="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                                    </svg>
                                                    <span class="sr-only">Loading...</span>
                                                </div>
                                            </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            desktopAuthSection.html(userMenuHtml);
        }

        // Update mobile menu
        updateMobileMenuForLoggedInUser(userInfo);

        // Bind logout events
        $(document).on('click', '#logoutBtn, #logoutBtnMobile', function (e) {
            e.preventDefault();
            handleLogout();
        });
    }

    function updateMobileMenuForLoggedInUser(userInfo) {
        const userName = userInfo.firstName || userInfo.fristName || 'User';

        // Remove existing mobile user section
        $('#navbarCollapse .mobile-user-section').remove();
        $('#navbarCollapse .border-t.border-gray-200.pt-6').last().hide();
        // Add user section to mobile menu
        const mobileUserSection = `
            <div class="mobile-user-section border-t border-gray-200 pt-6">
                <!-- User Info -->
                <div class="flex items-center mb-4 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl">
                    <div class="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-full mr-3">
                        <i class="fas fa-user text-lg"></i>
                    </div>
                    <div>
                        <p class="font-medium">${userName}</p>
                        <p class="text-sm opacity-80">${userInfo.email || 'user@example.com'}</p>
                    </div>
                </div>

                <!-- Shopping Actions -->
                <div class="flex items-center justify-between mb-4">
                    <a href="/ecommerce_fe/wishlist.html" class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <i class="fas fa-heart"></i>
                    </a>
                    <a href="/ecommerce_fe/home/cart.html" class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <i class="fas fa-shopping-cart"></i>
                    </a>
                </div>

                <!-- User Menu Items -->
                <div class="space-y-2">
                    <a href="/ecommerce_fe/profile.html" class="flex items-center py-3 px-4 text-gray-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white rounded-xl transition-all duration-300">
                        <i class="fas fa-user mr-3"></i>My Profile
                    </a>
                    <a href="/ecommerce_fe/orders.html" class="flex items-center py-3 px-4 text-gray-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white rounded-xl transition-all duration-300">
                        <i class="fas fa-shopping-bag mr-3"></i>My Orders
                    </a>
                    <a href="/ecommerce_fe/settings.html" class="flex items-center py-3 px-4 text-gray-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white rounded-xl transition-all duration-300">
                        <i class="fas fa-cog mr-3"></i>Settings
                    </a>
                    <button id="logoutBtnMobile" class="flex items-center w-full py-3 px-4 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300">
                        <i class="fas fa-sign-out-alt mr-3"></i>Logout
                        <span id="loadingTextLogout" class="flex items-center gap-[10px] justify-center" style="display: none;">
                                                <div role="status">
                                                    <svg aria-hidden="true" class="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                                    </svg>
                                                    <span class="sr-only">Loading...</span>
                                                </div>
                                            </span>
                    </button>
                </div>
            </div>
        `;

        $('#navbarCollapse .p-6').append(mobileUserSection);
    }

    function updateHeaderForGuestUser() {
        // Reset desktop auth section to original
        const desktopAuthSection = $('.hidden.sm\\:flex').last();
        if (desktopAuthSection.length > 0) {
            const guestMenuHtml = `
                <!-- Shopping actions -->
                <div class="hidden sm:flex items-center space-x-4">
                    <a href="/ecommerce_fe/wishlist.html" class="icon-hover relative p-2 text-white hover:text-red-400 rounded-full glass-effect">
                        <i class="fas fa-heart text-xl"></i>
                        <span class="cart-badge">0</span>
                    </a>
                    <a href="/ecommerce_fe/home/cart.html" class="icon-hover relative p-2 text-white hover:text-yellow-400 rounded-full glass-effect">
                        <i class="fas fa-shopping-cart text-xl"></i>
                        <span class="cart-badge">0</span>
                    </a>
                </div>

                <!-- Auth buttons -->
                <div class="hidden sm:flex items-center space-x-3">
                    <a href="/ecommerce_fe/auth/login.html" class="btn-secondary py-2 px-6 text-white font-medium rounded-xl hover:bg-white hover:text-purple-600 transition-all duration-300">
                        <i class="fas fa-sign-in-alt mr-2"></i>Sign In
                    </a>
                    <a href="/ecommerce_fe/auth/register.html" class="btn-primary py-2 px-6 text-gray-800 font-semibold rounded-xl hover:shadow-lg">
                        <i class="fas fa-user-plus mr-2"></i>Sign Up
                    </a>
                </div>
            `;
            desktopAuthSection.html(guestMenuHtml);
        }

        // Update mobile menu for guest
        updateMobileMenuForGuest();
    }

    function updateMobileMenuForGuest() {
        // Remove existing mobile user section
        $('#navbarCollapse .mobile-user-section').remove();
        $('#navbarCollapse .border-t.border-gray-200.pt-6').last().show();
        // The mobile menu for guest users is already in the original HTML
        // Just ensure shopping actions are present
        const existingShoppingActions = $('#navbarCollapse .flex.items-center.justify-between.mb-4');
        if (existingShoppingActions.length === 0) {
            const guestShoppingSection = `
                <div class="border-t border-gray-200 pt-6">
                    <div class="flex items-center justify-between mb-4">
                        <a href="/ecommerce_fe/wishlist.html" class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <i class="fas fa-heart"></i>
                        </a>
                        <a href="/ecommerce_fe/home/cart.html" class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <i class="fas fa-shopping-cart"></i>
                        </a>
                    </div>
                    <div class="space-y-3">
                        <a href="/ecommerce_fe/auth/login.html" class="block w-full py-3 px-4 text-center text-gray-700 border-2 border-gray-300 rounded-xl hover:border-purple-500 hover:text-purple-600 transition-all duration-300">
                            Sign In
                        </a>
                        <a href="/ecommerce_fe/auth/register.html" class="block w-full py-3 px-4 text-center text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-lg transition-all duration-300">
                            Sign Up
                        </a>
                    </div>
                </div>
            `;
            $('#navbarCollapse .p-6').append(guestShoppingSection);
        }
    }

    function refreshAccessToken(callback) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            console.warn('No refresh token found');
            localStorage.clear();
            updateHeaderForGuestUser();
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
                    console.error('Failed to refresh token');
                    localStorage.clear();
                    updateHeaderForGuestUser();
                }
            },
            error: function (xhr) {
                console.error('Refresh token failed:', xhr.responseText);
                localStorage.clear();
                updateHeaderForGuestUser();
            }
        });
    }

    function handleLogout() {
        if (!confirm('Are you sure you want to logout?')) return;

        let token = localStorage.getItem('token');
        if (!token) {
            if (typeof toastr !== 'undefined') {
                toastr.warning('You are not logged in');
            }
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

                    updateHeaderForGuestUser();

                    if (typeof toastr !== 'undefined') {
                        toastr.success('Logout successful');
                    }

                    setTimeout(function () {
                        window.location.href = '/ecommerce_fe/index.html';
                    }, 1000);
                },
                error: function (xhr) {
                    if (xhr.status === 401) {
                        // Token expired → refresh then retry logout
                        refreshAccessToken((newToken) => {
                            doLogout(newToken);
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
                        if (typeof toastr !== 'undefined') {
                            toastr.error(errorMessage);
                        }
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

    // Update cart badge function
    function updateCartBadge() {
        // This function can be called to update cart count from localStorage or API
        const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        const wishlistItems = JSON.parse(localStorage.getItem('wishlist') || '[]');

        $('.cart-badge').each(function () {
            const parentHref = $(this).parent().attr('href');
            if (parentHref && parentHref.includes('cart')) {
                $(this).text(cartItems.length);
            } else if (parentHref && parentHref.includes('wishlist')) {
                $(this).text(wishlistItems.length);
            }
        });
    }

    // Initialize cart badge on page load
    updateCartBadge();

    // Global AuthManager object
    window.AuthManager = {
        checkAuthAndUpdateHeader: checkAuthAndUpdateHeader,
        handleLogout: handleLogout,
        isTokenExpired: isTokenExpired,
        updateCartBadge: updateCartBadge
    };
});