$(document).ready(function () {
    let tokenStorage = {
        token: null,
        refreshToken: null
    };

    // Register Form Submit
    $('#registerForm').on('submit', function (e) {
        e.preventDefault();

        $('.alert').hide();

        $('#btnRegister').addClass('loading');
        $('#buttonText').hide();
        $('#loadingText').show();

        const formData = {
            firstName: $('#firstName').val().trim(),
            lastName: $('#lastName').val().trim(),
            phone: $('#phone').val().trim(),
            email: $('#email').val().trim(),
            password: $('#password').val()
        };

        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.password) {
            showError('All fields are required.');
            resetButton();
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showError('Please enter a valid email address.');
            resetButton();
            return;
        }

        $.ajax({
            url: `${ENV.API_BASE_URL}/api/v1/user/register`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                email: formData.email,
                password: formData.password
            }),
            success: function (response) {
                console.log('Registration successful:', response);

                if (response.data.token) {
                    tokenStorage.token = response.data.token;
                    tokenStorage.refreshToken = response.data.refresh_token;

                    $('#storedToken').text(response.data.token.substring(0, 50) + '...');
                    $('#tokenDisplay').show();

                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('refresh_token', response.data.refresh_token);
                    localStorage.setItem('user_info', JSON.stringify({
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone
                    }));

                    if (typeof window.AuthManager !== 'undefined') {
                        window.AuthManager.checkAuthAndUpdateHeader();
                    }
                }

                showSuccess('Registration successful!');
                $('#registerForm')[0].reset();

                setTimeout(function () {
                    // window.location.href = '/ecommerce_fe/index.html';
                }, 2000);
            },
            error: function (xhr) {
                console.error('Registration failed:', xhr.responseText);
                let errorMessage = 'Registration failed. Please try again.';

                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.responseText) {
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        errorMessage = errorResponse.error || errorResponse.message || errorMessage;
                    } catch (e) {
                        errorMessage = xhr.responseText;
                    }
                }

                showError(errorMessage);
            },
            complete: function () {
                resetButton();
            }
        });
    });

    // Login Form Submit
    // Login Form Submit
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        $('.alert').hide();

        const email = $('#email').val().trim();
        const password = $('#password').val();

        const loginData = {
            email: email,
            password: password
        };

        // Validate input
        if (!email || !password) {
            showError('Please enter both email and password.');
            return;
        }

        // Show loading
        $('#btnLogin').addClass('loading');
        $('#buttonText').hide();
        $('#loadingText').show();

        $.ajax({
            url: `${ENV.API_BASE_URL}/api/v1/user/login`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(loginData),
            crossDomain: true,
            xhrFields: {
                withCredentials: false // Set false vì backend đang dùng AllowAllOrigins
            },
            beforeSend: function(xhr) {
                // Đảm bảo gửi đầy đủ headers
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Accept', 'application/json');
            },
            success: function (data) {
                $('#btnLogin').removeClass('loading');
                $('#buttonText').show();
                $('#loadingText').hide();

                if (data.status_code === 200) {
                    console.log('Login successful:', data);

                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('refresh_token', data.data.refresh_token);
                    localStorage.setItem('user_info', JSON.stringify(data.data));

                    if (typeof window.AuthManager !== 'undefined') {
                        window.AuthManager.checkAuthAndUpdateHeader();
                    }

                    showSuccess('Login successful!');

                    setTimeout(function () {
                        if (data.data.user_type === 'admin') {
                            window.location.href = '/ecommerce_fe/admin/index.html';
                        } else if (data.data.user_type === 'user') {
                            window.location.href = '/ecommerce_fe/index.html';
                        } else {
                            showError('Invalid user type.');
                        }
                    }, 1500);
                } else {
                    showError('Login failed: ' + (data.message || 'Unknown error.'));
                }
            },
            error: function (xhr) {
                $('#btnLogin').removeClass('loading');
                $('#buttonText').show();
                $('#loadingText').hide();

                console.error('Login failed:', xhr.responseText);
                let errorMessage = 'Login failed. Please try again.';

                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.responseText) {
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        errorMessage = errorResponse.error || errorResponse.message || errorMessage;
                    } catch (e) {
                        errorMessage = xhr.responseText;
                    }
                }

                showError(errorMessage);
            }
        });
    });

    function showSuccess(message = 'Success!') {
        $('#alertSuccess').text(message).show();
        setTimeout(() => $('#alertSuccess').fadeOut(), 5000);
    }

    function showError(message = 'An error occurred.') {
        $('#errorMessage').text(message);
        $('#alertError').show();
        setTimeout(() => $('#alertError').fadeOut(), 5000);
    }

    function resetButton() {
        $('#btnRegister').removeClass('loading');
        $('#buttonText').show();
        $('#loadingText').hide();
    }

    function getStoredToken() {
        return tokenStorage.token;
        // Or: return localStorage.getItem('token');
    }

    function getStoredRefreshToken() {
        return tokenStorage.refreshToken;
        // Or: return localStorage.getItem('refresh_token');
    }

});


