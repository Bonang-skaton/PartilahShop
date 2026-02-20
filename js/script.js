document.querySelectorAll('.btnDetail').forEach(item => {
  item.addEventListener('click', (e) => {
    let parent = e.target.closest('.card');

    // Ambil data produk
    let gambar = parent.querySelector('.card-img-top').src;
    let hargaText = parent.querySelector('.harga').innerHTML.trim();
    let judul = parent.querySelector('.modalNama').textContent.trim();
    let deskripsi = parent.querySelector('.deskripsi') 
      ? parent.querySelector('.deskripsi').innerHTML 
      : '';
    let quantitySelect = document.querySelector('#quantity'); // ambil dari modal

    // Tampilkan modal
    document.querySelector('.btnModal').click();

    // Isi modal
    document.querySelector('.modalTitle').innerHTML = judul;
    let image = document.createElement('img');
    image.src = gambar;
    image.classList.add('w-100');
    document.querySelector('.modalImage').innerHTML = '';
    document.querySelector('.modalImage').appendChild(image);
    document.querySelector('.modalDeskripsi').innerHTML = deskripsi;
    document.querySelector('.modalHarga').innerHTML = hargaText;

    // Format Rupiah
    const formatRupiah = (num) => {
      return 'Rp. ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ',-';
    };

    // Hitung total awal
    let hargaPerItem = parseInt(hargaText.replace(/[^0-9]/g, ''), 10);
    let modalTotal = document.querySelector('.modalTotal');
    modalTotal.textContent = formatRupiah(hargaPerItem * quantitySelect.value);

    // Update total saat quantity berubah
    quantitySelect.addEventListener('change', function() {
      modalTotal.textContent = formatRupiah(hargaPerItem * this.value);
    });

    // Tombol Beli
    document.querySelector('.btnBeli').addEventListener('click', function(e) {
      e.preventDefault();

      const namaInput = document.querySelector('#name');
      const phoneInput = document.querySelector('#phone');
      const addressInput = document.querySelector('#address');
      const noteInput = document.querySelector('#note');

      const nama = namaInput.value.trim();
      const phone = phoneInput.value.trim();
      const address = addressInput.value.trim();
      const note = noteInput.value.trim();

      // Reset error
      document.querySelector('#errorName').textContent = '';
      document.querySelector('#errorPhone').textContent = '';
      document.querySelector('#errorAddress').textContent = '';
      document.querySelector('#errorNote').textContent = '';
      [namaInput, phoneInput, addressInput, noteInput].forEach(el => el.classList.remove('input-error'));

      let valid = true;
      let firstErrorField = null;

      // Validasi nama
      if (!nama) {
        document.querySelector('#errorName').textContent = 'Nama wajib diisi';
        namaInput.classList.add('input-error');
        firstErrorField = firstErrorField || namaInput;
        valid = false;
      }

      // Validasi HP
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phone) {
        document.querySelector('#errorPhone').textContent = 'Nomor HP wajib diisi';
        phoneInput.classList.add('input-error');
        firstErrorField = firstErrorField || phoneInput;
        valid = false;
      } else if (!phoneRegex.test(phone)) {
        document.querySelector('#errorPhone').textContent = 'Nomor HP tidak valid';
        phoneInput.classList.add('input-error');
        firstErrorField = firstErrorField || phoneInput;
        valid = false;
      }

      // Validasi alamat
      if (!address) {
        document.querySelector('#errorAddress').textContent = 'Alamat wajib diisi';
        addressInput.classList.add('input-error');
        firstErrorField = firstErrorField || addressInput;
        valid = false;
      }

      // Validasi catatan max 200 karakter
      if (note.length > 200) {
        document.querySelector('#errorNote').textContent = 'Catatan maksimal 200 karakter';
        noteInput.classList.add('input-error');
        firstErrorField = firstErrorField || noteInput;
        valid = false;
      }

      // Fokus ke field pertama yang error
      if (!valid) {
        if (firstErrorField) firstErrorField.focus();
        return;
      }

      // Ambil jumlah terbaru
      let jumlah = quantitySelect.value;
      let totalHarga = hargaPerItem * jumlah;

      // Susun pesan WhatsApp
      let pesanText =
        `Hai kak,%0A` +
        `Saya mau pesan produk ini:%0A%0A` +
        `Barang     : ${judul}%0A` +
        `Harga/item : ${hargaText}%0A` +
        `Jumlah     : ${jumlah} pcs%0A` +
        `Total      : ${formatRupiah(totalHarga)}%0A%0A` +
        `Nama       : ${nama}%0A` +
        `No. HP     : ${phone}%0A` +
        `Alamat     : ${address}`;

      if (note) {
        pesanText += `%0A%0ACatatan   : ${note}`;
      }

      const nohp = '+6285778080060';
      const pesan = `https://api.whatsapp.com/send?phone=${nohp}&text=${pesanText}`;

      this.href = pesan;
      window.open(pesan, '_blank');
    });
  });
});