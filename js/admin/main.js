document.addEventListener("DOMContentLoaded", function () {

    const headerPromise = $.get("/ecommerce_fe/includes/admin/header.html", function (data) {
        $("#header").html(data);
    });

    const sidebarPromise = $.get("/ecommerce_fe/includes/admin/sidebar.html", function (data) {
        $("#sidebar-container").html(data);
    });

    $.when(headerPromise, sidebarPromise).done(function () {
        console.log("Header and Sidebar loaded");
        initializeEventHandlers();
    });
});
function initializeEventHandlers() {
    // Gán class active dựa theo URL hiện tại
    const currentPath = window.location.pathname;

    $('.menu-item').each(function () {
        const link = $(this).find('a').attr('href');
        if (link && currentPath.includes(link)) {
            $('.menu-item').removeClass('active'); // bỏ active cũ
            $(this).addClass('active'); // set active mới
        }
    });

    // Toggle menu
    $('#menu-toggle').click(function () {
        const sidebar = $('#sidebar');
        const mainContent = $('#main-content');

        sidebar.toggleClass('sidebar-collapsed');

        if (sidebar.hasClass('sidebar-collapsed')) {
            mainContent.removeClass('ml-64').addClass('ml-16');
            sidebar.removeClass('w-64').addClass('w-16');
        } else {
            mainContent.removeClass('ml-16').addClass('ml-64');
            sidebar.removeClass('w-16').addClass('w-64');
        }
    });

    // Toggle dark mode
    $('#dark-mode-toggle').click(function () {
        $('body').toggleClass('dark-mode');
        const icon = $(this).find('i');
        if ($('body').hasClass('dark-mode')) {
            icon.removeClass('fa-moon').addClass('fa-sun');
        } else {
            icon.removeClass('fa-sun').addClass('fa-moon');
        }
    });

    // Toggle submenu
    $('.menu-item').click(function (e) {
        const submenu = $(this).find('.submenu');
        const arrow = $(this).find('[id$="-arrow"]');

        if (submenu.length > 0) {
            e.preventDefault(); // nếu có submenu thì không chuyển trang
            submenu.toggleClass('show');
            arrow.toggleClass('rotate-180');
        }
    });

    // Auto-collapse sidebar on small screens
    $(window).resize(function () {
        if ($(window).width() < 1024) {
            $('#sidebar').addClass('sidebar-collapsed');
            $('#main-content').removeClass('ml-64').addClass('ml-16');
        } else if (!$('#sidebar').hasClass('sidebar-collapsed')) {
            $('#main-content').removeClass('ml-16').addClass('ml-64');
        }
    });
}
