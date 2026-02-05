// Fetch and display products from the API with Bootstrap tooltip for description
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let pageSize = 10;
let sortField = null;
let sortDirection = 1; // 1: asc, -1: desc

function renderProductsPage(products, page, size) {
  const tbody = document.querySelector('#products-table tbody');
  tbody.innerHTML = '';
  const start = (page - 1) * size;
  const end = start + size;
  const pageProducts = products.slice(start, end);
  pageProducts.forEach(product => {
    const row = document.createElement('tr');
    // Add tooltip for description
    row.setAttribute('data-bs-toggle', 'tooltip');
    row.setAttribute('data-bs-placement', 'top');
    row.setAttribute('title', product.description ? product.description : 'No description');
    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.title}</td>
      <td class="fw-semibold text-success">$${product.price}</td>
      <td>${product.category && product.category.name ? product.category.name : ''}</td>
      <td>
        ${product.images && product.images.length > 0 ? `<img src="${product.images[0]}" alt="Image" class="product-img">` : ''}
      </td>
    `;
    tbody.appendChild(row);
  });
  // Initialize all tooltips
  if (window.bootstrap && bootstrap.Tooltip) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
  attachRowClickEvents();
}

function renderPagination(products, page, size) {
  const totalPages = Math.ceil(products.length / size);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  if (totalPages <= 1) return;
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = 'page-item' + (i === page ? ' active' : '');
    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.textContent = i;
    a.onclick = function(e) {
      e.preventDefault();
      goToPage(i);
    };
    li.appendChild(a);
    pagination.appendChild(li);
  }
}

function renderSortButtons() {
  // Update sort button style
  const btns = [
    'sort-title-asc', 'sort-title-desc', 'sort-price-asc', 'sort-price-desc'
  ];
  btns.forEach(id => document.getElementById(id).classList.remove('active'));
  if (sortField === 'title') {
    document.getElementById(sortDirection === 1 ? 'sort-title-asc' : 'sort-title-desc').classList.add('active');
  } else if (sortField === 'price') {
    document.getElementById(sortDirection === 1 ? 'sort-price-asc' : 'sort-price-desc').classList.add('active');
  }
}

function render() {
  renderProductsPage(filteredProducts, currentPage, pageSize);
  renderPagination(filteredProducts, currentPage, pageSize);
  renderSortButtons();
}

function filterByTitle() {
  const searchValue = document.getElementById('search-title').value.toLowerCase();
  filteredProducts = allProducts.filter(product => product.title.toLowerCase().includes(searchValue));
  currentPage = 1;
  if (sortField) sortBy(sortField, sortDirection, true);
  else render();
}

function goToPage(page) {
  currentPage = page;
  render();
}

function changePageSize() {
  pageSize = parseInt(document.getElementById('page-size').value, 10);
  currentPage = 1;
  render();
}

function sortBy(field, direction, keepDirection) {
  sortField = field;
  sortDirection = direction;
  filteredProducts.sort((a, b) => {
    if (field === 'title') {
      return a.title.localeCompare(b.title) * direction;
    } else if (field === 'price') {
      return (a.price - b.price) * direction;
    }
    return 0;
  });
  currentPage = 1;
  render();
}

function exportCSV() {
  // Lấy dữ liệu trang hiện tại
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageProducts = filteredProducts.slice(start, end);
  // Tạo header và rows
  const header = ['ID', 'Title', 'Price', 'Category', 'Images'];
  const rows = pageProducts.map(product => [
    product.id,
    '"' + product.title.replace(/"/g, '""') + '"',
    product.price,
    product.category && product.category.name ? '"' + product.category.name.replace(/"/g, '""') + '"' : '',
    product.images && product.images.length > 0 ? product.images[0] : ''
  ]);
  let csvContent = header.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
  // Tạo file và tải về
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'products_page.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function openProductModal(product) {
  document.getElementById('modal-id').value = product.id;
  document.getElementById('modal-category').value = product.category && product.category.name ? product.category.name : '';
  document.getElementById('modal-title').value = product.title;
  document.getElementById('modal-description').value = product.description;
  document.getElementById('modal-price').value = product.price;
  document.getElementById('modal-image').value = product.images && product.images.length > 0 ? product.images[0] : '';
  document.getElementById('modal-img-preview').src = product.images && product.images.length > 0 ? product.images[0] : '';
  // Show modal
  var modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}

function openCreateModal() {
  document.getElementById('create-title').value = '';
  document.getElementById('create-category').value = '';
  document.getElementById('create-description').value = '';
  document.getElementById('create-price').value = '';
  document.getElementById('create-image').value = '';
  document.getElementById('create-img-preview').style.display = 'none';
  var modal = new bootstrap.Modal(document.getElementById('createModal'));
  modal.show();
}

document.getElementById('create-image').addEventListener('input', function() {
  const url = this.value;
  const img = document.getElementById('create-img-preview');
  if (url) {
    img.src = url;
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
  }
});

function submitCreate() {
  const title = document.getElementById('create-title').value;
  const categoryId = parseInt(document.getElementById('create-category').value, 10);
  const description = document.getElementById('create-description').value;
  const price = parseFloat(document.getElementById('create-price').value);
  const image = document.getElementById('create-image').value;
  const payload = {
    title,
    price,
    description,
    categoryId,
    images: image ? [image] : []
  };
  fetch('https://api.escuelajs.co/api/v1/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      alert('Tạo sản phẩm thành công!');
      // Cập nhật lại dữ liệu trên bảng
      fetch('https://api.escuelajs.co/api/v1/products')
        .then(response => response.json())
        .then(products => {
          allProducts = products;
          filterByTitle();
          // Đóng modal
          var modal = bootstrap.Modal.getInstance(document.getElementById('createModal'));
          if (modal) modal.hide();
        });
    })
    .catch(err => {
      alert('Tạo sản phẩm thất bại!');
      console.error(err);
    });
}

function attachRowClickEvents() {
  const tbody = document.querySelector('#products-table tbody');
  Array.from(tbody.children).forEach((row, idx) => {
    row.onclick = function() {
      const start = (currentPage - 1) * pageSize;
      const product = filteredProducts[start + idx];
      openProductModal(product);
    };
  });
}

// Hàm submitEdit để gọi API update
function submitEdit() {
  const id = document.getElementById('modal-id').value;
  const title = document.getElementById('modal-title').value;
  const description = document.getElementById('modal-description').value;
  const price = parseFloat(document.getElementById('modal-price').value);
  const image = document.getElementById('modal-image').value;
  const category = document.getElementById('modal-category').value;
  const payload = {
    title,
    price,
    description,
    images: image ? [image] : []
  };
  fetch(`https://api.escuelajs.co/api/v1/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      alert('Cập nhật thành công!');
      // Cập nhật lại dữ liệu trên bảng
      fetch('https://api.escuelajs.co/api/v1/products')
        .then(response => response.json())
        .then(products => {
          allProducts = products;
          filterByTitle();
          // Đóng modal
          var modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
          if (modal) modal.hide();
        });
    })
    .catch(err => {
      alert('Cập nhật thất bại!');
      console.error(err);
    });
}

fetch('https://api.escuelajs.co/api/v1/products')
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  })
  .then(products => {
    allProducts = products;
    filteredProducts = products;
    render();
  })
  .catch(error => {
    document.querySelector('#products-table tbody').innerHTML = `<tr><td colspan="5" class="text-danger">Error loading data: ${error.message}</td></tr>`;
    console.error('Error fetching products:', error);
  });
