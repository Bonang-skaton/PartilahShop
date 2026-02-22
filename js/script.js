// 1. Inisialisasi Data & Format Mata Uang
let cart = JSON.parse(localStorage.getItem('partilahCart')) || [];

const formatRupiah = (num) => {
    return 'Rp. ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ',-';
};

// 2. Fungsi Update UI Keranjang (Modal & Badge)
function updateCartUI() {
    const cartList = document.querySelector('#cartItemsList');
    const cartTotalPrice = document.querySelector('#cartTotalPrice');
    const cartCount = document.querySelector('#cartCount');
    const shippingSelect = document.querySelector('#shipping');
    
    cartList.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.totalItemPrice;
        cartList.innerHTML += `
            <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                <img src="${item.gambar}" style="width: 50px; height: 50px; object-fit: cover;" class="rounded me-3">
                <div class="flex-grow-1">
                    <h6 class="mb-0" style="font-size: 0.9rem;">${item.judul}</h6>
                    <small>${item.jumlah} x ${formatRupiah(item.hargaSatuan)}</small>
                </div>
                <div class="fw-bold me-3" style="font-size: 0.85rem;">${formatRupiah(item.totalItemPrice)}</div>
                <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
        `;
    });

    if (cart.length === 0) {
        cartList.innerHTML = '<p class="text-center text-muted">Keranjang Anda kosong.</p>';
    }

    // Hitung Ongkir (Ambil angka saja dari value select)
    let ongkir = 0;
    if (shippingSelect && cart.length > 0) {
        // Logika: JNE=10000, J&T=9000,  (disesuaikan dengan HTML)
        const shippingPrices = { "REGULER": 10000, "EKONOMI": 6000, };
        ongkir = shippingPrices[shippingSelect.value] || 0;
    }

    cartTotalPrice.textContent = formatRupiah(subtotal + ongkir);
    cartCount.textContent = cart.length;
    
    localStorage.setItem('partilahCart', JSON.stringify(cart));
    if (typeof feather !== 'undefined') feather.replace();
}

// 3. Logika Pencarian Produk
document.querySelector('#searchInput').addEventListener('keyup', function (e) {
    let searchText = e.target.value.toLowerCase();
    let allCards = document.querySelectorAll('#productList .col');

    allCards.forEach(card => {
        let productName = card.querySelector('.modalNama').textContent.toLowerCase();
        card.style.display = productName.includes(searchText) ? "" : "none";
    });
});

// 4. Logika Klik Tombol "Detail" untuk Membuka Modal Produk
document.querySelectorAll('.btnDetail').forEach(item => {
    item.addEventListener('click', (e) => {
        let parent = e.target.closest('.card');
        let gambar = parent.querySelector('.card-img-top').src;
        let hargaText = parent.querySelector('.harga').textContent.trim();
        let judul = parent.querySelector('.modalNama').textContent.trim();
        let deskripsi = parent.querySelector('.deskripsi') ? parent.querySelector('.deskripsi').innerHTML : '';
        let hargaPerItem = parseInt(hargaText.replace(/[^0-9]/g, ''), 10);

        // Isi konten ke dalam Modal Detail (exampleModal)
        document.querySelector('.modalTitle').innerHTML = judul;
        document.querySelector('.modalImage').innerHTML = `<img src="${gambar}" class="w-100 rounded shadow-sm">`;
        document.querySelector('.modalDeskripsi').innerHTML = deskripsi;
        document.querySelector('.modalHarga').innerHTML = hargaText;

        // Reset Pilihan Jumlah
        let qtyInput = document.querySelector('#quantity');
        qtyInput.value = 1;
        document.querySelector('.modalTotal').textContent = formatRupiah(hargaPerItem);

        // Update total saat jumlah diubah di modal
        qtyInput.onchange = function() {
            document.querySelector('.modalTotal').textContent = formatRupiah(hargaPerItem * parseInt(this.value));
        };

        // Munculkan Modal Detail
        new bootstrap.Modal(document.getElementById('exampleModal')).show();

        // Logika Tambah ke Keranjang
        const btnBeli = document.querySelector('.btnBeli');
        btnBeli.onclick = function(event) {
            event.preventDefault();
            
            const newItem = {
                judul: judul,
                gambar: gambar,
                hargaSatuan: hargaPerItem,
                jumlah: parseInt(qtyInput.value),
                totalItemPrice: hargaPerItem * parseInt(qtyInput.value),
                catatan: document.querySelector('#note').value
            };

            cart.push(newItem);
            updateCartUI();
            
            // Tutup Modal Detail, buka Modal Keranjang
            bootstrap.Modal.getInstance(document.getElementById('exampleModal')).hide();
            setTimeout(() => {
                new bootstrap.Modal(document.getElementById('cartModal')).show();
            }, 500);
            
            // Reset catatan
            document.querySelector('#note').value = "";
        };
    });
});

// 5. Fungsi Hapus Item dari Keranjang
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
};

// 6. Update Total saat Jasa Pengiriman diubah
document.querySelector('#shipping').addEventListener('change', updateCartUI);

// 7. Checkout via WhatsApp
document.querySelector('#checkoutWA').addEventListener('click', function() {
    if (cart.length === 0) return alert("Keranjang belanja masih kosong!");

    const nama = document.querySelector('#name').value.trim();
    const phone = document.querySelector('#phone').value.trim();
    const address = document.querySelector('#address').value.trim();
    const kurir = document.querySelector('#shipping').value;

    if (!nama || !phone || !address) {
        alert("Harap lengkapi Nama, No HP, dan Alamat Pengiriman!");
        return;
    }

    let pesanText = `*PESANAN BARU - PARTILAH SHOP*%0A`;
    pesanText += `-------------------------------------------%0A`;
    let totalBelanja = 0;

    cart.forEach((item, i) => {
        pesanText += `*${i+1}. ${item.judul}*%0A`;
        pesanText += `   Jml: ${item.jumlah} x ${formatRupiah(item.hargaSatuan)}%0A`;
        if(item.catatan) pesanText += `   Catatan: _${item.catatan}_%0A`;
        totalBelanja += item.totalItemPrice;
    });

    // Hitung ongkir lagi untuk teks WA
    const shippingPrices = { "JNE": 8500, "J&T": 9000, "Sicepat": 7000 };
    let biayaOngkir = shippingPrices[kurir] || 0;

    pesanText += `-------------------------------------------%0A`;
    pesanText += `*Subtotal:* ${formatRupiah(totalBelanja)}%0A`;
    pesanText += `*Kurir:* ${kurir} (${formatRupiah(biayaOngkir)})%0A`;
    pesanText += `*TOTAL BAYAR:* ${formatRupiah(totalBelanja + biayaOngkir)}%0A`;
    pesanText += `-------------------------------------------%0A`;
    pesanText += `*Data Pengiriman:*%0A`;
    pesanText += `Nama: ${nama}%0A`;
    pesanText += `No.HP: ${phone}%0A`;
    pesanText += `Alamat: ${address}%0A`;

    const nohp = '6285778080060'; // Gunakan format 62 tanpa +
    window.open(`https://api.whatsapp.com/send?phone=${nohp}&text=${pesanText}`, '_blank');
});

// Jalankan saat halaman siap
document.addEventListener('DOMContentLoaded', updateCartUI);