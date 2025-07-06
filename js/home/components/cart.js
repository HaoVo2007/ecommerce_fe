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
const decoded = jwt_decode(token);
const userId = decoded.user_id;

function loadCartByUserID() {
    $('#loading').show();
    $.ajax({
        url: `${ENV.API_BASE_URL}/api/v1/cart/${userId}`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
        },
        success: function (res) {
            if (res.status_code === 200 && res.data && res.data.cart_items) {
                renderCartItems(res.data.cart_items);
                if (res.data.cart_items.length === 0) {
                    $('#empty-cart').show();
                }
            }
            $('#loading').hide();
        },
        error: function (xhr) {
            toastr.error('Error fetching cart:', xhr);
            toastr.error('Failed to load cart');
        }
    });
}

function renderCartItems(items) {
    const container = $('#cart-items');
    container.empty();

    let totalProducts = 0;
    let subtotal = 0;

    items.forEach((item, index) => {
        totalProducts += item.quantity;
        subtotal += item.price * item.quantity;

        const itemHtml = `
        <div class="cart-item p-4 sm:p-6 animate-fade-in border-b" data-id="${item.product_id}">
            <div class="flex items-center gap-4">
                <!-- Ảnh -->
                <div class="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
                <img src="${item.image_url}" alt="${item.product_name}" class="w-full h-full object-cover rounded-lg">
                </div>

                <!-- Thông tin sản phẩm -->
                <div class="flex-1 min-w-0">
                <h3 class="text-base sm:text-lg font-medium text-gray-900 truncate">${item.product_name}</h3>
                <p class="text-sm text-gray-500 mt-1">Size: ${item.size}</p>
                <p class="text-base sm:text-lg font-semibold text-red-600 mt-2">${formatCurrency(item.price)}</p>
                </div>

                <!-- Hành động -->
                <div class="flex  items-center justify-end gap-2 sm:gap-3">
                <!-- Tăng/giảm số lượng -->
                <div class="flex items-center border rounded-lg text-xs sm:text-sm">
                    <button onclick="decreaseQuantity('${item.product_id}', '${item.size}')" 
                            class="px-2 sm:px-3 py-1 sm:py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition">
                    <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity px-3 py-1 sm:px-4 sm:py-2 border-x text-center min-w-[2rem]">${item.quantity}</span>
                    <button onclick="increaseQuantity('${item.product_id}', '${item.size}')" 
                            class="px-2 sm:px-3 py-1 sm:py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition">
                    <i class="fas fa-plus"></i>
                    </button>
                </div>
                     <button onclick="removeItem('${item.product_id}')" 
                        class="text-red-500 hover:text-red-700 p-1 sm:p-2 rounded-lg hover:bg-red-50 transition-colors text-sm sm:text-base">
                    <i class="fas fa-trash-alt"></i>
                </button>
                </div>
            </div>
        </div>

        `;

        container.append(itemHtml);
    });

    // 👉 Update cart count
    $('#cart-count').text(`${totalProducts} Items`);

    // 👉 Update Order Summary
    const shipping = 50000;
    const discount = 0; // Update this value when applying a promo code
    const total = subtotal + shipping - discount;

    $('#subtotal').text(formatCurrency(subtotal));
    $('#shipping').text(formatCurrency(shipping));
    $('#discount').text(discount > 0 ? `- ${formatCurrency(discount)}` : formatCurrency(0));
    $('#total').text(formatCurrency(total));
}


function increaseQuantity(productId, size) {
    $.ajax({
        url: `${ENV.API_BASE_URL}/api/v1/cart`,
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            product_id: productId,
            user_id: userId,
            quantity: 1,
            size: size,
            types: 'add'
        }),
        success: function (res) {
            toastr.success('Quantity increased successfully');
            loadCartByUserID();
        },
        error: function (err) {
            console.error(err);
            toastr.error('Quantity increase failed');
        }
    });
}

function decreaseQuantity(productId, size) {
    $.ajax({
        url: `${ENV.API_BASE_URL}/api/v1/cart`,
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            product_id: productId,
            user_id: userId,
            quantity: 1,
            size: size,
            types: 'remove'
        }),
        success: function (res) {
            toastr.success('Quantity decreased successfully');
            loadCartByUserID();
        },
        error: function (err) {
            console.error(err);
            toastr.error('Quantity decrease failed');
        }
    });
}

function removeItem(productId) {
    if (!confirm('Are you sure delete this product?')) return;
    $.ajax({
        url: `${ENV.API_BASE_URL}/api/v1/cart`,
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            product_id: productId,
            user_id: userId
        }),
        success: function (res) {
            toastr.success('Deleted product successfully');
            loadCartByUserID();
        },
        error: function (err) {
            console.error(err);
            toastr.error('Delete product failed');
        }
    });
}


function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}
