// ⚠️ GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT ASLI KAMU (Wajib Berakhiran /exec)
const SCRIPT_URL = 'https://script.google.com/macros/library/d/1rTvvgAEjGd02RzOCFckzgQrZwAyPN5G06V3Z-dhkU7C5idy2DLI3OdAe/2';

let databaseStok = [];
let namaUserSesi = "";

function tukarHalaman(buka, tutup) {
    document.getElementById(buka).classList.remove('hidden');
    document.getElementById(tutup).classList.add('hidden');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    
    toastMsg.textContent = message;
    toast.style.borderLeftColor = type === 'success' ? 'var(--success)' : 'var(--danger)';
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 5000);
}

function muatDataStok() {
    fetch(SCRIPT_URL)
    .then(res => {
        if(!res.ok) throw new Error();
        return res.json();
    })
    .then(data => {
        databaseStok = data;
        document.getElementById('containerBarang').innerHTML = '';
        tambahBarisBarang();
    })
    .catch(() => {
        showToast("Gagal memuat stok barang. Cek penamaan sheet 'Stok_Barang' Anda.", "error");
    });
}

function tambahBarisBarang() {
    const container = document.getElementById('containerBarang');
    const row = document.createElement('div');
    row.className = 'barang-row';

    let opsiBarang = `<option value="">-- Pilih --</option>`;
    databaseStok.forEach(item => {
        opsiBarang += `<option value="${item.nama}">${item.nama} (Stok: ${item.stok})</option>`;
    });

    row.innerHTML = `
        <select class="pilih-barang" onchange="cekStokMaks(this)" style="flex: 2.5;" required>${opsiBarang}</select>
        <input type="number" class="jumlah-ambil" placeholder="Jml" min="1" style="flex: 1;" required>
        <button type="button" class="btn-del" onclick="hapusBaris(this)">✕</button>
    `;
    container.appendChild(row);
}

function hapusBaris(btn) {
    const rows = document.querySelectorAll('.barang-row');
    if(rows.length > 1) {
        btn.parentElement.remove();
    } else {
        showToast("Minimal harus mengambil 1 barang!", "error");
    }
}

function cekStokMaks(selectElement) {
    const barangTerpilih = selectElement.value;
    const inputJumlah = selectElement.nextElementSibling;
    const itemSesuai = databaseStok.find(i => i.nama === barangTerpilih);
    if(itemSesuai) {
        inputJumlah.max = itemSesuai.stok;
        inputJumlah.placeholder = "Maks " + itemSesuai.stok;
    }
}

// REGISTER
document.getElementById('formRegister').addEventListener('submit', function(e){
    e.preventDefault();
    
    const btnReg = e.target.querySelector('button');
    const txtAsli = btnReg.textContent;
    btnReg.textContent = "Mendaftarkan...";
    btnReg.disabled = true;

    const data = {
        action: "register",
        nama: document.getElementById('regNama').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value
    };

    fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(data) })
    .then(() => {
        btnReg.textContent = txtAsli;
        btnReg.disabled = false;
        showToast("Akun berhasil dibuat! Silakan login.");
        tukarHalaman('loginBox', 'registerBox');
    })
    .catch(() => {
        btnReg.textContent = txtAsli;
        btnReg.disabled = false;
        showToast("Gagal terhubung ke database. Periksa konfigurasi Apps Script Anda.", "error");
    });
});

// LOGIN
document.getElementById('formLogin').addEventListener('submit', function(e){
    e.preventDefault();
    
    const btnLogin = e.target.querySelector('button');
    const txtAsli = btnLogin.textContent;
    btnLogin.textContent = "Memverifikasi...";
    btnLogin.disabled = true;

    const data = {
        action: "login",
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };

    fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(data) })
    .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
    })
    .then(res => {
        btnLogin.textContent = txtAsli;
        btnLogin.disabled = false;

        if(res.status === "success") {
            namaUserSesi = res.nama;
            document.getElementById('namaUserAktif').innerText = namaUserSesi;
            tukarHalaman('gudangBox', 'loginBox');
            muatDataStok();
        } else {
            showToast(res.message || "Email atau Password salah!", "error");
        }
    })
    .catch(err => {
        btnLogin.textContent = txtAsli;
        btnLogin.disabled = false;
        showToast("Error Database! Periksa nama sheet 'Users' atau gunakan URL /exec yang benar.", "error");
        console.error(err);
    });
});

// AMBIL BARANG
document.getElementById('formGudang').addEventListener('submit', function(e){
    e.preventDefault();
    
    const rows = document.querySelectorAll('.barang-row');
    let arrayBarang = [];
    let valid = true;

    rows.forEach(row => {
        const namaB = row.querySelector('.pilih-barang').value;
        const jumlahB = parseInt(row.querySelector('.jumlah-ambil').value);
        const inputJml = row.querySelector('.jumlah-ambil');
        
        if (inputJml.max && jumlahB > parseInt(inputJml.max)) {
            showToast(`Jumlah pengambilan untuk ${namaB} melebihi stok yang tersedia!`, "error");
            valid = false;
            return;
        }

        arrayBarang.push({ namaBarang: namaB, jumlah: jumlahB });
    });

    if(!valid) return;

    const btnGudang = e.target.querySelector('button[type="submit"]');
    const txtAsli = btnGudang.textContent;
    btnGudang.textContent = "Memproses...";
    btnGudang.disabled = true;

    showToast("Sedang memproses dan mengirimkan notifikasi email ke Admin...");

    const dataKirim = {
        action: "ambilBarang",
        namaPengambil: namaUserSesi,
        departemen: document.getElementById('dept').value,
        kodeDept: "-",
        barangDiambil: arrayBarang
    };

    fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(dataKirim) })
    .then(res => res.json())
    .then(res => {
        btnGudang.textContent = txtAsli;
        btnGudang.disabled = false;

        if(res.status === "success") {
            showToast("Sukses! Transaksi tercatat dan email notifikasi berhasil dikirim.");
            document.getElementById('formGudang').reset();
            muatDataStok();
        } else {
            showToast("Terjadi kesalahan saat memproses pengambilan.", "error");
        }
    })
    .catch(() => {
        btnGudang.textContent = txtAsli;
        btnGudang.disabled = false;
        showToast("Gagal mengirim data. Cek sisa kuota email harian Google Apps Script Anda.", "error");
    });
});