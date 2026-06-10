// ⚠️ GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT MILIKMU
const SCRIPT_URL = 'https://script.google.com/macros/library/d/1rTvvgAEjGd02RzOCFckzgQrZwAyPN5G06V3Z-dhkU7C5idy2DLI3OdAe/2';

let databaseStok = [];
let namaUserSesi = "";

function tukarHalaman(buka, tutup) {
    document.getElementById(buka).classList.remove('hidden');
    document.getElementById(tutup).classList.add('hidden');
}

function muatDataStok() {
    fetch(SCRIPT_URL)
    .then(res => res.json())
    .then(data => {
        databaseStok = data;
        document.getElementById('containerBarang').innerHTML = '';
        tambahBarisBarang();
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
        alert("Minimal harus mengambil 1 barang!");
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
    const data = {
        action: "register",
        nama: document.getElementById('regNama').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value
    };
    fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(data) })
    .then(() => {
        alert("Akun berhasil dibuat! Silakan login.");
        tukarHalaman('loginBox', 'registerBox');
    });
});

// LOGIN
document.getElementById('formLogin').addEventListener('submit', function(e){
    e.preventDefault();
    const data = {
        action: "login",
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };
    fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(data) })
    .then(res => res.json())
    .then(res => {
        if(res.status === "success") {
            namaUserSesi = res.nama;
            document.getElementById('namaUserAktif').innerText = namaUserSesi;
            tukarHalaman('gudangBox', 'loginBox');
            muatDataStok();
        } else {
            alert(res.message);
        }
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
            alert(`Jumlah pengambilan untuk ${namaB} melebihi stok yang tersedia!`);
            valid = false;
            return;
        }

        arrayBarang.push({ namaBarang: namaB, jumlah: jumlahB });
    });

    if(!valid) return;

    alert("Sedang memproses dan mengirimkan notifikasi email ke Admin...");

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
        if(res.status === "success") {
            alert("Sukses! Transaksi tercatat dan email notifikasi berhasil dikirim.");
            document.getElementById('formGudang').reset();
            muatDataStok();
        }
    });
});