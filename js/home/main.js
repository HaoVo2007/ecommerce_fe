$(function () {
    
    const headerPromise = $.get('/ecommerce_fe/includes/home/header.html', function (data) {
        $('#header').html(data);
    });

    const footerPromise = $.get('/ecommerce_fe/includes/home/footer.html', function (data) {
        $('#footer').html(data);
    });

    $.when(headerPromise, footerPromise).done(function () {
        console.log("Header and Footer loaded");

        AuthManager.checkAuthAndUpdateHeader();

        $('#navbarToggler').on('click', function () {
            $('#navbarCollapse').toggleClass('hidden');
        });

        $(document).on('click', function (e) {
            const $target = $(e.target);
            if (
                !$target.closest('#navbarToggler').length &&
                !$target.closest('#navbarCollapse').length &&
                $(window).width() < 1024
            ) {
                $('#navbarCollapse').addClass('hidden');
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
        const authSection = $('.hidden.sm\\:flex, .sm\\:flex').filter(function () {
            return $(this).find('a[href*="login"], a[href*="register"]').length > 0;
        });

        if (authSection.length > 0) {
            const userName = userInfo.firstName || userInfo.fristName || 'User';
            const userMenuHtml = `
                <div class="relative group">
                    <button class="flex items-center space-x-2 py-2 px-4 gap-[10px] text-base font-medium text-dark dark:text-white hover:opacity-70 focus:outline-none">
                        <svg class="w-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span>${userName}</span>
                    </button>
                    <div class="absolute w-[120px] right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div class="py-1">
                            <a href="/ecommerce_fe/profile.html" class="flex items-center gap-[10px] px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <i class="fas fa-user mr-2"></i> <span>My Profile</span>
                            </a>
                            <a href="/ecommerce_fe/orders.html" class="flex items-center gap-[10px] px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <i class="fas fa-shopping-bag mr-2"></i> <span>My Orders</span>
                            </a>
                            <a href="/ecommerce_fe/settings.html" class="flex items-center gap-[10px] px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <i class="fas fa-cog mr-2"></i> <span>Settings</span>
                            </a>
                            <div class="border-t border-gray-100 dark:border-gray-600"></div>
                            <button id="logoutBtn" class="flex items-center gap-[10px] text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <i class="fas fa-sign-out-alt mr-2"></i> <span>Logout</span>
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

    function handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            const token = localStorage.getItem('token');

            if (token) {
                $.ajax({
                    url: `${ENV.API_BASE_URL}/api/v1/user/logout`,
                    type: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    success: function () {
                        localStorage.removeItem('token');
                        localStorage.removeItem('refresh_token');
                        localStorage.removeItem('userInfo');
                        updateHeaderForGuestUser();
                        showNotification('Logged out successfully.', 'success');
                        setTimeout(function () {
                            window.location.href = '/ecommerce_fe/index.html';
                        }, 1000);
                    },
                    error: function (xhr, status, error) {
                        console.error('Logout API failed:', error);
                    }
                });
            }
        }
    }

    function showNotification(message, type = 'info') {
        $('.notification').remove();

        const notificationHtml = `
            <div class="notification fixed top-4 right-4 z-50 max-w-sm w-full">
                <div class="bg-white dark:bg-gray-800 border-l-4 ${type === 'success' ? 'border-green-400' : 'border-red-400'} rounded-r-lg shadow-lg">
                    <div class="flex items-center p-4">
                        <div class="flex-shrink-0">
                            ${type === 'success' ?
                '<svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="..."/></svg>' :
                '<svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="..."/></svg>'}
                        </div>
                        <div class="ml-3 flex-1">
                            <p class="text-sm font-medium ${type === 'success' ? 'text-green-800' : 'text-red-800'} dark:text-white">
                                ${message}
                            </p>
                        </div>
                        <div class="ml-4 flex-shrink-0">
                            <button class="close-notification inline-flex text-gray-400 hover:text-gray-600 focus:outline-none">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="..."/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('body').append(notificationHtml);
        setTimeout(() => $('.notification').fadeOut(300, function () { $(this).remove(); }), 3000);
        $('.close-notification').on('click', function () {
            $(this).closest('.notification').fadeOut(300, function () {
                $(this).remove();
            });
        });
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

    // Expose functions globally
    window.AuthManager = {
        checkAuthAndUpdateHeader: checkAuthAndUpdateHeader,
        handleLogout: handleLogout,
        showNotification: showNotification,
        isTokenExpired: isTokenExpired
    };
});
