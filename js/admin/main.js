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

    $('#dark-mode-toggle').click(function () {
        $('body').toggleClass('dark-mode');
        const icon = $(this).find('i');
        if ($('body').hasClass('dark-mode')) {
            icon.removeClass('fa-moon').addClass('fa-sun');
        } else {
            icon.removeClass('fa-sun').addClass('fa-moon');
        }
    });

    $('.menu-item').click(function (e) {
        e.preventDefault();

        $('.menu-item').removeClass('active');

        $(this).addClass('active');

        const submenu = $(this).find('.submenu');
        const arrow = $(this).find('[id$="-arrow"]');

        if (submenu.length > 0) {
            submenu.toggleClass('show');
            arrow.toggleClass('rotate-180');
        }
    });

    $(window).resize(function () {
        if ($(window).width() < 1024) {
            $('#sidebar').addClass('sidebar-collapsed');
            $('#main-content').removeClass('ml-64').addClass('ml-16');
        } else if (!$('#sidebar').hasClass('sidebar-collapsed')) {
            $('#main-content').removeClass('ml-16').addClass('ml-64');
        }
    });

}