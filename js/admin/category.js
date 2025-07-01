$(document).ready(function () {
    let currentEditId = null;
    let categoriesData = [];

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

    // Load categories on page load
    loadCategories();

    // Form submit handler
    $('#categoryForm').on('submit', function (e) {
        e.preventDefault();

        const categoryName = $('#categoryName').val().trim();
        const parentId = $('#parentCategory').val();

        if (!categoryName) {
            toastr.success('Please enter category name');
            return;
        }

        const categoryData = {
            category_name: categoryName
        };

        if (parentId) {
            categoryData.parent_id = parentId;
        }

        if (currentEditId) {
            updateCategory(currentEditId, categoryData);
        } else {
            createCategory(categoryData);
        }
    });

    // Load all categories
    function loadCategories() {
        $.ajax({
            url: `${ENV.API_BASE_URL}/api/v1/category`,
            method: 'GET',
            success: function (response) {
                if (response.status_code === 200) {
                    categoriesData = response.data;
                    displayCategories(response.data);
                    loadParentOptions(response.data);
                } else {
                    toastr.success('Error loading categories: ' + response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error loading categories:', error);
                toastr.success('Error loading categories. Please try again.');
            }
        });
    }

    // Display categories in table
    function displayCategories(categories) {
        const tbody = $('#categoryTableBody');
        tbody.empty();

        if (!Array.isArray(categories) || categories.length === 0) {
            const emptyRow = `
            <tr>
                <td colspan="5" class="text-center py-4 text-gray-500 dark:text-gray-400">
                    No categories found.
                </td>
            </tr>
        `;
            tbody.append(emptyRow);
            return;
        }

        categories.forEach(function (category) {
            const parentName = getParentName(category.parent_id, categories);
            const createdAt = formatDate(category.created_at);
            const updatedAt = formatDate(category.updated_at);

            const row = `
            <tr class="bg-white border-b hover:bg-gray-50">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900">
                    ${category.category_name}
                </th>
                <td class="px-6 py-4">
                    ${parentName || 'N/A'}
                </td>
                <td class="px-6 py-4">
                    ${createdAt}
                </td>
                <td class="px-6 py-4">
                    ${updatedAt}
                </td>
                <td class="px-6 py-4">
                    <button onclick="openEditModal('${category.id}')" 
                    class="text-blue-600 hover:text-blue-900 mr-2">
                            <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteCategory('${category.id}')" 
                    class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
            tbody.append(row);
        });
    }


    // Load parent category options
    function loadParentOptions(categories) {
        if (!Array.isArray(categories) || categories.length === 0) {

            return;
        }
        const parentSelect = $('#parentCategory');
        parentSelect.find('option:not(:first)').remove();

        categories.forEach(function (category) {
            if (!category.parent_id) { // Only show top-level categories as parent options
                parentSelect.append(`<option value="${category.id}">${category.category_name}</option>`);
            }
        });
    }

    // Get parent category name
    function getParentName(parentId, categories) {
        if (!parentId) return null;
        const parent = categories.find(cat => cat.id === parentId);
        return parent ? parent.category_name : null;
    }

    // Format date
    function formatDate(dateString) {
        if (!dateString || dateString === '0001-01-01T00:00:00Z') {
            return 'N/A';
        }
        return new Date(dateString).toLocaleDateString();
    }

    // Create new category
    function createCategory(categoryData) {
        $.ajax({
            url: `${ENV.API_BASE_URL}/api/v1/category`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(categoryData),
            success: function (response) {
                if (response.status_code === 200 || response.status_code === 201) {
                    toastr.success('Category created successfully');
                    closeModal();
                    loadCategories();
                } else {
                    toastr.success('Error creating category: ' + response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error creating category:', error);
                toastr.success('Error creating category. Please try again.');
            }
        });
    }

    // Update category
    function updateCategory(id, categoryData) {
        $.ajax({
            url: `${ENV.API_BASE_URL}/api/v1/category/${id}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(categoryData),
            success: function (response) {
                if (response.status_code === 200) {
                    toastr.success('Category updated successfully');
                    closeModal();
                    loadCategories();
                } else {
                    toastr.success('Error updating category: ' + response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error updating category:', error);
                toastr.success('Error updating category. Please try again.');
            }
        });
    }

    // Delete category
    window.deleteCategory = function (id) {
        if (confirm('Are you sure you want to delete this category?')) {
            $.ajax({
                url: `${ENV.API_BASE_URL}/api/v1/category/${id}`,
                method: 'DELETE',
                success: function (response) {
                    if (response.status_code === 200) {
                        toastr.success('Category deleted successfully');
                        loadCategories();
                    } else {
                        toastr.success('Error deleting category: ' + response.message);
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Error deleting category:', error);
                    toastr.success('Error deleting category. Please try again.');
                }
            });
        }
    };

    // Open add modal
    window.openAddModal = function () {
        currentEditId = null;
        $('#modalTitle').text('Add Category');
        $('#saveBtn').text('Create');
        $('#categoryName').val('');
        $('#parentCategory').val('');
        $('#categoryModal').removeClass('hidden');
    };

    // Open edit modal
    window.openEditModal = function (id) {
        const category = categoriesData.find(cat => cat.id === id);
        if (category) {
            currentEditId = id;
            $('#modalTitle').text('Edit Category');
            $('#saveBtn').text('Update');
            $('#categoryName').val(category.category_name);
            $('#parentCategory').val(category.parent_id || '');
            $('#categoryModal').removeClass('hidden');
        }
    };

    // Close modal
    window.closeModal = function () {
        $('#categoryModal').addClass('hidden');
        currentEditId = null;
    };

    // Close modal when clicking outside
    $('#categoryModal').on('click', function (e) {
        if (e.target === this) {
            closeModal();
        }
    });
});