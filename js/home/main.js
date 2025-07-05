$(function () {
    let products = [];
    const headerPromise = $.get('/ecommerce_fe/includes/home/header.html', function (data) {
        $('#header').html(data);
    });

    const footerPromise = $.get('/ecommerce_fe/includes/home/footer.html', function (data) {
        $('#footer').html(data);
    });

    $.when(headerPromise, footerPromise).done(function () {
        console.log('🔥 Header and footer loaded successfully');
        
        // ✅ Sửa lỗi: Thêm dấu # để select element theo ID
        $('#headerBtn').addClass('hidden');

        // ✅ Đợi một chút để DOM được render hoàn toàn
        setTimeout(() => {
            AuthManager.checkAuthAndUpdateHeader();
        }, 100);
        
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
        console.log('🔍 checkAuthAndUpdateHeader called');
        
        // ✅ Debug: Kiểm tra DOM đã load chưa
        console.log('🔍 DOM elements check:');
        console.log('  - Header exists:', $('#header').length > 0);
        console.log('  - Auth sections found:', $('.hidden.sm\\:flex').length);
        console.log('  - Auth sections details:', $('.hidden.sm\\:flex').map(function() {
            return {
                element: this,
                html: $(this).html().substring(0, 100) + '...',
                hasSignIn: $(this).find('a[href*="login"]').length > 0,
                hasSignUp: $(this).find('a[href*="register"]').length > 0
            };
        }).get());
        
        const token = localStorage.getItem('token');
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
        
        console.log('🔍 Auth check:');
        console.log('  - Token exists:', !!token);
        console.log('  - Token expired:', token ? isTokenExpired(token) : 'N/A');
        console.log('  - User info:', userInfo);

        if (token && !isTokenExpired(token)) {
            console.log('✅ User is logged in - updating header');
            updateHeaderForLoggedInUser(userInfo);
        } else if (token && isTokenExpired(token)) {
            console.log('⚠️ Token expired - refreshing');
            refreshAccessToken(() => {
                updateHeaderForLoggedInUser(userInfo);
            });
        } else {
            console.log('❌ No valid token - showing guest header');
            updateHeaderForGuestUser();
        }
    }

    function updateHeaderForLoggedInUser(userInfo) {
        console.log('🔑 updateHeaderForLoggedInUser called');
        console.log('🔑 UserInfo:', userInfo);
        
        const userName = userInfo.firstName || userInfo.fristName || 'User';
        console.log('🔑 Username:', userName);

        // ✅ Sửa selector - tìm chính xác element chứa auth buttons
        const authSections = $('.hidden.sm\\:flex');
        console.log('🔑 Found auth sections:', authSections.length);
        
        let desktopAuthSection = null;
        
        // ✅ Tìm section chứa Sign In/Sign Up buttons
        authSections.each(function(index) {
            const $section = $(this);
            const hasAuthButtons = $section.find('a[href*="login"], a[href*="register"]').length > 0;
            
            console.log(`🔑 Section ${index}:`, {
                hasAuthButtons: hasAuthButtons,
                html: $section.html().substring(0, 100) + '...'
            });
            
            if (hasAuthButtons) {
                desktopAuthSection = $section;
                return false; // Break loop
            }
        });
        
        // ✅ Fallback: Nếu không tìm thấy, lấy section cuối cùng
        if (!desktopAuthSection) {
            desktopAuthSection = authSections.last();
            console.log('🔑 Using fallback - last auth section');
        }
        
        console.log('🔑 Desktop auth section selected:', {
            exists: desktopAuthSection && desktopAuthSection.length > 0,
            html: desktopAuthSection ? desktopAuthSection.html().substring(0, 100) + '...' : 'N/A'
        });

        if (desktopAuthSection && desktopAuthSection.length > 0) {
            console.log('🔑 Before update:', desktopAuthSection.html().substring(0, 100) + '...');
            
            const userMenuHtml = `
                <!-- Shopping actions -->
                <div class="hidden sm:flex items-center space-x-4">
                    <a href="/ecommerce_fe/wishlist.html" class="icon-hover relative p-2 text-white hover:text-red-400 rounded-full glass-effect">
                        <i class="fas fa-heart text-xl"></i>
                        <span class="cart-badge">0</span>
                    </a>
                    <a href="/ecommerce_fe/cart.html" class="icon-hover relative p-2 text-white hover:text-yellow-400 rounded-full glass-effect">
                        <i class="fas fa-shopping-cart text-xl"></i>
                        <span class="cart-badge">0</span>
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
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            desktopAuthSection.html(userMenuHtml);
            console.log('🔑 After update:', desktopAuthSection.html().substring(0, 100) + '...');
            
            // ✅ Verify update worked
            setTimeout(() => {
                const stillHasSignIn = $('a[href*="login"]:visible').length > 0;
                const stillHasSignUp = $('a[href*="register"]:visible').length > 0;
                console.log('🔑 Verification after update:');
                console.log('  - Still has Sign In visible:', stillHasSignIn);
                console.log('  - Still has Sign Up visible:', stillHasSignUp);
                
                if (stillHasSignIn || stillHasSignUp) {
                    console.error('❌ PROBLEM: Auth buttons still visible after update!');
                    console.log('❌ Visible Sign In buttons:', $('a[href*="login"]:visible'));
                    console.log('❌ Visible Sign Up buttons:', $('a[href*="register"]:visible'));
                }
            }, 100);
        } else {
            console.error('❌ No desktop auth section found!');
        }

        // Update mobile menu
        updateMobileMenuForLoggedInUser(userInfo);

        // Bind logout events
        $(document).off('click', '#logoutBtn, #logoutBtnMobile'); // Remove old handlers
        $(document).on('click', '#logoutBtn, #logoutBtnMobile', function (e) {
            e.preventDefault();
            handleLogout();
        });
    }

    function updateMobileMenuForLoggedInUser(userInfo) {
        console.log('📱 updateMobileMenuForLoggedInUser called');
        
        const userName = userInfo.firstName || userInfo.fristName || 'User';

        // Remove existing mobile user section
        $('#navbarCollapse .mobile-user-section').remove();

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
                    <a href="/ecommerce_fe/cart.html" class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
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
                    </button>
                </div>
            </div>
        `;
        
        console.log("📱 Mobile user section HTML:", mobileUserSection);
        $('#navbarCollapse .p-6').append(mobileUserSection);
    }

    function updateHeaderForGuestUser() {
        console.log('👤 updateHeaderForGuestUser called');
        
        // ✅ Tìm tất cả auth sections và reset chúng
        const authSections = $('.hidden.sm\\:flex');
        console.log('👤 Found auth sections:', authSections.length);
        
        authSections.each(function(index) {
            const $section = $(this);
            const hasUserMenu = $section.find('button:contains("User"), button:contains("' + 
                (JSON.parse(localStorage.getItem('user_info') || '{}').firstName || 'User') + '")').length > 0;
            
            if (hasUserMenu || index === authSections.length - 1) {
                console.log(`👤 Resetting section ${index}`);
                
                const guestMenuHtml = `
                    <!-- Shopping actions -->
                    <div class="hidden sm:flex items-center space-x-4">
                        <a href="/ecommerce_fe/wishlist.html" class="icon-hover relative p-2 text-white hover:text-red-400 rounded-full glass-effect">
                            <i class="fas fa-heart text-xl"></i>
                            <span class="cart-badge">0</span>
                        </a>
                        <a href="/ecommerce_fe/cart.html" class="icon-hover relative p-2 text-white hover:text-yellow-400 rounded-full glass-effect">
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
                
                $section.html(guestMenuHtml);
                console.log(`👤 Section ${index} reset to guest menu`);
            }
        });

        // Update mobile menu for guest
        updateMobileMenuForGuest();
        
        // ✅ Verify guest buttons are showing
        setTimeout(() => {
            const signInVisible = $('a[href*="login"]:visible').length > 0;
            const signUpVisible = $('a[href*="register"]:visible').length > 0;
            console.log('👤 Guest buttons verification:');
            console.log('  - Sign In visible:', signInVisible);
            console.log('  - Sign Up visible:', signUpVisible);
        }, 100);
    }

    function updateMobileMenuForGuest() {
        console.log('📱 updateMobileMenuForGuest called');
        
        // Remove existing mobile user section
        $('#navbarCollapse .mobile-user-section').remove();

        // The mobile menu for guest users is already in the original HTML
        // Just ensure shopping actions are present
        const existingShoppingActions = $('#navbarCollapse .flex.items-center.justify-between.mb-4');
        if (existingShoppingActions.length === 0) {
            console.log('📱 Adding guest shopping actions');
            const guestShoppingSection = `
                <div class="border-t border-gray-200 pt-6">
                    <div class="flex items-center justify-between mb-4">
                        <a href="/ecommerce_fe/wishlist.html" class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <i class="fas fa-heart"></i>
                        </a>
                        <a href="/ecommerce_fe/cart.html" class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
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
        console.log('🔄 refreshAccessToken called');
        
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            console.warn('🔄 No refresh token found');
            localStorage.clear();
            updateHeaderForGuestUser();
            return;
        }

        $.ajax({
            url: `${ENV.API_BASE_URL}/api/v1/user/refresh?refresh_token=${refreshToken}`,
            type: 'GET',
            success: function (response) {
                console.log('🔄 Refresh token success:', response);
                const newAccessToken = response.data.token;
                if (newAccessToken) {
                    localStorage.setItem('token', newAccessToken);
                    if (typeof callback === 'function') {
                        callback(newAccessToken);
                    }
                } else {
                    console.error('🔄 Failed to refresh token');
                    localStorage.clear();
                    updateHeaderForGuestUser();
                }
            },
            error: function (xhr) {
                console.error('🔄 Refresh token failed:', xhr.responseText);
                localStorage.clear();
                updateHeaderForGuestUser();
            }
        });
    }

    function handleLogout() {
        console.log('🚪 handleLogout called');
        
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
                    console.log('🚪 Logout successful');
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
                        console.log('🚪 Token expired during logout - refreshing');
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

                        console.error('🚪 Logout API failed:', errorMessage);
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

    // ✅ Debug function - có thể gọi từ console để kiểm tra
    function debugAuthState() {
        console.log('🐛 === AUTH DEBUG INFO ===');
        console.log('🐛 Token:', localStorage.getItem('token'));
        console.log('🐛 User info:', JSON.parse(localStorage.getItem('user_info') || '{}'));
        console.log('🐛 Auth sections:', $('.hidden.sm\\:flex').length);
        console.log('🐛 Visible Sign In buttons:', $('a[href*="login"]:visible').length);
        console.log('🐛 Visible Sign Up buttons:', $('a[href*="register"]:visible').length);
        console.log('🐛 User menu buttons:', $('button:contains("User")').length);
        console.log('🐛 === END DEBUG INFO ===');
    }

    // Global AuthManager object
    window.AuthManager = {
        checkAuthAndUpdateHeader: checkAuthAndUpdateHeader,
        handleLogout: handleLogout,
        isTokenExpired: isTokenExpired,
        updateCartBadge: updateCartBadge,
        debugAuthState: debugAuthState  // ✅ Thêm debug function
    };
});