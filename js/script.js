// 1. Inisialisasi Data Keranjang dari LocalStorage
let cart = JSON.parse(localStorage.getItem('partilahCart')) || [];

const formatRupiah = (num) => {
    return 'Rp. ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ',-';
};

// 2. Fungsi Update Tampilan Keranjang
function updateCartUI() {
    const cartList = document.querySelector('#cartItemsList');
    const cartTotalPrice = document.querySelector('#cartTotalPrice');
    const cartCount = document.querySelector('#cartCount');
    
    cartList.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.totalItemPrice;
        cartList.innerHTML += `
            <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                <img src="${item.gambar}" style="width: 50px; height: 50px; object-fit: cover;" class="rounded me-3">
                <div class="flex-grow-1">
                    <h6 class="mb-0">${item.judul}</h6>
                    <small>${item.jumlah} x ${formatRupiah(item.hargaSatuan)}</small>
                </div>
                <div class="fw-bold me-3">${formatRupiah(item.totalItemPrice)}</div>
                <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">Hapus</button>
            </div>
        `;
    });

    if (cart.length === 0) {
        cartList.innerHTML = '<p class="text-center text-muted">Keranjang Anda kosong.</p>';
    }

    cartTotalPrice.textContent = formatRupiah(total);
    cartCount.textContent = cart.length;
    
    // Simpan ke LocalStorage
    localStorage.setItem('partilahCart', JSON.stringify(cart));
    if (typeof feather !== 'undefined') feather.replace();
}

// 3. Fungsi Tambah ke Keranjang (Gunakan di dalam btnDetail listener)
document.querySelectorAll('.btnDetail').forEach(item => {
    item.addEventListener('click', (e) => {
        let parent = e.target.closest('.card');
        let gambar = parent.querySelector('.card-img-top').src;
        let hargaText = parent.querySelector('.harga').textContent.trim();
        let judul = parent.querySelector('.modalNama').textContent.trim();
        let deskripsi = parent.querySelector('.deskripsi') ? parent.querySelector('.deskripsi').innerHTML : '';
        let hargaPerItem = parseInt(hargaText.replace(/[^0-9]/g, ''), 10);

        // Munculkan Modal Detail Produk
        document.querySelector('.btnModal').click();
        document.querySelector('.modalTitle').innerHTML = judul;
        document.querySelector('.modalImage').innerHTML = `<img src="${gambar}" class="w-100 rounded">`;
        document.querySelector('.modalDeskripsi').innerHTML = deskripsi;
        document.querySelector('.modalHarga').innerHTML = hargaText;

        // Reset Total di Modal Detail
        let quantitySelect = document.querySelector('#quantity');
        quantitySelect.value = 1;
        document.querySelector('.modalTotal').textContent = formatRupiah(hargaPerItem);

        quantitySelect.onchange = function() {
            document.querySelector('.modalTotal').textContent = formatRupiah(hargaPerItem * this.value);
        };

        // Ganti fungsi tombol "Beli product ini" menjadi "Tambah ke Keranjang"
        const btnBeli = document.querySelector('.btnBeli');
        btnBeli.textContent = "Masukkan Keranjang";
        btnBeli.onclick = function(event) {
            event.preventDefault();
            
            const newItem = {
                judul: judul,
                gambar: gambar,
                hargaSatuan: hargaPerItem,
                jumlah: parseInt(quantitySelect.value),
                totalItemPrice: hargaPerItem * parseInt(quantitySelect.value)
            };

            cart.push(newItem);
            updateCartUI();
            
            // Tutup modal detail, buka modal keranjang
            bootstrap.Modal.getInstance(document.getElementById('exampleModal')).hide();
            new bootstrap.Modal(document.getElementById('cartModal')).show();
        };
    });
});

// 4. Fungsi Hapus Item
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
};

// 5. Kirim WhatsApp (Multi-produk)
document.querySelector('#checkoutWA').addEventListener('click', function() {
    if (cart.length === 0) return alert("Keranjang kosong!");

    const nama = document.querySelector('#name').value.trim();
    const phone = document.querySelector('#phone').value.trim();
    const address = document.querySelector('#address').value.trim();

    if (!nama || !phone || !address) {
        alert("Mohon isi Nama, No HP, dan Alamat di form produk terlebih dahulu!");
        return;
    }

    let pesanText = `*PESANAN BARU - PARTILAH SHOP*%0A%0A`;
    let totalBelanja = 0;

    cart.forEach((item, i) => {
        pesanText += `*${i+1}. ${item.judul}*%0A`;
        pesanText += `   Jumlah: ${item.jumlah} pcs%0A`;
        pesanText += `   Harga: ${formatRupiah(item.totalItemPrice)}%0A%0A`;
        totalBelanja += item.totalItemPrice;
    });

    pesanText += `*Total Bayar: ${formatRupiah(totalBelanja)}*%0A%0A`;
    pesanText += `*Data Pengirim:*%0A`;
    pesanText += `Nama: ${nama}%0A`;
    pesanText += `phone: ${phone}%0A`;
    pesanText += `Alamat: ${address}%0A`;

    const nohp = '+6285778080060';
    window.open(`https://api.whatsapp.com/send?phone=${nohp}&text=${pesanText}`, '_blank');
});

// Panggil saat halaman pertama dimuat
document.addEventListener('DOMContentLoaded', updateCartUI);



document.querySelector('#searchInput').addEventListener('keyup', function (e) {
  let searchText = e.target.value.toLowerCase();
  let allCards = document.querySelectorAll('#productList .col'); // Menargetkan pembungkus kolom produk

  allCards.forEach(card => {
    // Ambil nama produk dari elemen .modalNama
    let productName = card.querySelector('.modalNama').textContent.toLowerCase();
    
    // Jika nama produk mengandung teks pencarian, tampilkan. Jika tidak, sembunyikan.
    if (productName.includes(searchText)) {
      card.style.display = ""; // Tampilkan (default)
    } else {
      card.style.display = "none"; // Sembunyikan
    }
  });
});