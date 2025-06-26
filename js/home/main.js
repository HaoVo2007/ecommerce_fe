document.addEventListener("DOMContentLoaded", function () {

    const headerPromise = $.get("/ecommerceFE/includes/home/header.html", function (data) {
        $("#header").html(data);
    });

    const sidebarPromise = $.get("/ecommerceFE/includes/home/footer.html", function (data) {
        $("#footer").html(data);
    });

    $.when(headerPromise, sidebarPromise).done(function () {
        
        console.log("Header and Footer loaded");

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
});
