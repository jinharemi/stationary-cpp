// =====================================
// CONFIG
// =====================================

const SCRIPT_URL =
'https://script.google.com/macros/s/AKfycbzflNZzwqwS34FdcEqzsiS3rK4dnIiuVPJ6Zc1N0rbWhgnJkBN0GtLAqoer8YvqgJD68g/exec';

let databaseStok = [];
let namaUserSesi = "";

// =====================================
// AUTH SWITCH
// =====================================

function showRegister() {

    document
        .getElementById("loginFormBox")
        .classList
        .add("hidden");

    document
        .getElementById("registerFormBox")
        .classList
        .remove("hidden");
}

function showLogin() {

    document
        .getElementById("registerFormBox")
        .classList
        .add("hidden");

    document
        .getElementById("loginFormBox")
        .classList
        .remove("hidden");
}

// =====================================
// TOAST
// =====================================

function showToast(message) {

    const toast =
        document.getElementById("toast");

    const msg =
        document.getElementById("toastMessage");

    msg.innerText = message;

    toast.style.display = "block";

    setTimeout(() => {

        toast.style.display = "none";

    }, 3000);
}

// =====================================
// PASSWORD TOGGLE
// =====================================

document.addEventListener("click", function(e){

    if(
        e.target.closest(".toggle-password")
    ){

        const input =
        document.getElementById(
            "loginPassword"
        );

        input.type =
        input.type === "password"
        ? "text"
        : "password";
    }

});

// =====================================
// PAGE
// =====================================

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.add(
                "hidden"
            );

        });

    document
        .getElementById(pageId)
        .classList
        .remove("hidden");

}

// =====================================
// LOGIN
// =====================================

document
.getElementById("formLogin")
.addEventListener(
"submit",
function(e){

    e.preventDefault();

    const data = {

        action:"login",

        email:
        document.getElementById(
            "loginEmail"
        ).value,

        password:
        document.getElementById(
            "loginPassword"
        ).value

    };

    fetch(
        SCRIPT_URL,
        {
            method:"POST",
            body:JSON.stringify(data)
        }
    )

    .then(res=>res.json())

    .then(res=>{

        if(
            res.status==="success"
        ){

            namaUserSesi =
            res.nama;

            localStorage.setItem(
                "namaUser",
                namaUserSesi
            );

            masukApp();

        }else{

            showToast(
                res.message
            );

        }

    })

    .catch(()=>{

        showToast(
            "Gagal login"
        );

    });

});

// =====================================
// REGISTER
// =====================================

document
.getElementById("formRegister")
.addEventListener(
"submit",
function(e){

    e.preventDefault();

    const data = {

        action:"register",

        nama:
        document.getElementById(
            "regNama"
        ).value,

        email:
        document.getElementById(
            "regEmail"
        ).value,

        password:
        document.getElementById(
            "regPassword"
        ).value

    };

    fetch(
        SCRIPT_URL,
        {
            method:"POST",
            body:JSON.stringify(data)
        }
    )

    .then(()=>{

        showToast(
            "Akun berhasil dibuat"
        );

        showLogin();

    })

    .catch(()=>{

        showToast(
            "Registrasi gagal"
        );

    });

});

// =====================================
// MASUK APP
// =====================================

function masukApp(){

    document
    .getElementById(
        "authContainer"
    )
    .classList.add(
        "hidden"
    );

    document
    .getElementById(
        "appLayout"
    )
    .classList.remove(
        "hidden"
    );

    document
    .getElementById(
        "welcomeUser"
    )
    .innerText =
    namaUserSesi;

    document
    .getElementById(
        "profileNama"
    )
    .innerText =
    namaUserSesi;

    muatDataStok();

    renderRiwayat();
}

// =====================================
// AUTO LOGIN
// =====================================

window.onload = ()=>{

    const user =
    localStorage.getItem(
        "namaUser"
    );

    if(user){

        namaUserSesi =
        user;

        masukApp();
    }

};

// =====================================
// LOGOUT
// =====================================

function prosesLogout(){

    localStorage.removeItem(
        "namaUser"
    );

    document
    .getElementById(
        "appLayout"
    )
    .classList.add(
        "hidden"
    );

    document
    .getElementById(
        "authContainer"
    )
    .classList.remove(
        "hidden"
    );

    showToast(
        "Logout berhasil"
    );

}

// =====================================
// LOAD STOK
// =====================================

function muatDataStok(){

    fetch(SCRIPT_URL)

    .then(res=>res.json())

    .then(data=>{

        databaseStok =
        data;

        document
        .getElementById(
            "cardTotalBarang"
        )
        .innerText =
        data.length;

        document
        .getElementById(
            "statusKoneksi"
        )
        .innerText =
        "Online";

        document
        .getElementById(
            "containerBarang"
        )
        .innerHTML = "";

        tambahBarisBarang();

    })

    .catch(()=>{

        document
        .getElementById(
            "statusKoneksi"
        )
        .innerText =
        "Error";

    });

}

// =====================================
// TAMBAH BARANG
// =====================================

function tambahBarisBarang(){

    const container =
    document.getElementById(
        "containerBarang"
    );

    let opsi =
    `<option value="">
    Pilih Barang
    </option>`;

    databaseStok.forEach(item=>{

        opsi += `
        <option value="${item.nama}">
        ${item.nama}
        (stok ${item.stok})
        </option>
        `;

    });

    const row =
    document.createElement("div");

    row.className =
    "barang-row";

    row.innerHTML = `

        <select class="pilih-barang">

            ${opsi}

        </select>

        <input
        type="number"
        class="jumlah-ambil"
        placeholder="Jumlah">

        <button
        type="button"
        class="btn-del"
        onclick="hapusBaris(this)">

        Hapus

        </button>

    `;

    container.appendChild(
        row
    );

}

function hapusBaris(btn){

    const rows =
    document.querySelectorAll(
        ".barang-row"
    );

    if(rows.length > 1){

        btn.parentElement.remove();

    }

}

// =====================================
// GENERATE REQUEST ID
// =====================================

function generateRequestID(){

    const random =
    Math.floor(
        Math.random()*999999
    );

    return `REQ-${
        new Date().getFullYear()
    }-${random}`;
}

// =====================================
// SUBMIT
// =====================================

document
.getElementById(
    "formGudang"
)
.addEventListener(
"submit",
function(e){

    e.preventDefault();

    const rows =
    document.querySelectorAll(
        ".barang-row"
    );

    let barang = [];

    rows.forEach(row=>{

        barang.push({

            namaBarang:
            row.querySelector(
                ".pilih-barang"
            ).value,

            jumlah:
            row.querySelector(
                ".jumlah-ambil"
            ).value

        });

    });

    const requestID =
    generateRequestID();

    const payload = {

        action:
        "ambilBarang",

        namaPengambil:
        namaUserSesi,

        departemen:
        document.getElementById(
            "dept"
        ).value,

        kodeDept:"-",

        barangDiambil:
        barang

    };

    fetch(
        SCRIPT_URL,
        {
            method:"POST",
            body:JSON.stringify(
                payload
            )
        }
    )

    .then(res=>res.json())

    .then(res=>{

        if(
            res.status==="success"
        ){

            simpanRiwayat(
                requestID,
                barang
            );

            tampilkanModal(
                requestID,
                barang.length
            );

            document
            .getElementById(
                "formGudang"
            )
            .reset();

        }

    })

    .catch(()=>{

        showToast(
            "Gagal mengirim data"
        );

    });

});

// =====================================
// MODAL SUCCESS
// =====================================

function tampilkanModal(
requestID,
jumlahItem
){

    const modal =
    document.getElementById(
        "successModal"
    );

    const info =
    document.getElementById(
        "modalPengajuanInfo"
    );

    info.innerHTML = `

    <p>

    Nomor Pengajuan :
    <strong>${requestID}</strong>

    </p>

    <br>

    <p>

    Jumlah Item :
    <strong>
    ${jumlahItem}
    Barang
    </strong>

    </p>

    <br>

    <p>

    Permintaan pengambilan barang
    Anda telah berhasil diterima
    oleh sistem.

    </p>

    <br>

    <p>

    Data pengajuan telah diteruskan
    kepada Admin PPIC untuk
    dilakukan verifikasi dan
    proses persetujuan.

    </p>

    <br>

    <p>

    🟡 Menunggu Persetujuan PPIC

    </p>

    `;

    modal.classList.remove(
        "hidden"
    );

}

function closeModal(){

    document
    .getElementById(
        "successModal"
    )
    .classList.add(
        "hidden"
    );

}

// =====================================
// RIWAYAT
// =====================================

function simpanRiwayat(
requestID,
barang
){

    let data =
    JSON.parse(
        localStorage.getItem(
            "riwayat"
        )
    ) || [];

    data.unshift({

        nomor:
        requestID,

        tanggal:
        new Date()
        .toLocaleString(),

        status:
        "🟡 Menunggu Persetujuan PPIC",

        barang:
        barang.length

    });

    localStorage.setItem(
        "riwayat",
        JSON.stringify(data)
    );

    renderRiwayat();

}

function renderRiwayat(){

    const container =
    document.getElementById(
        "riwayatContainer"
    );

    const data =
    JSON.parse(
        localStorage.getItem(
            "riwayat"
        )
    ) || [];

    if(data.length===0){

        container.innerHTML =
        `
        <div class="activity-item">
        Belum ada pengajuan
        </div>
        `;

        return;
    }

    container.innerHTML = "";

    data.forEach(item=>{

        container.innerHTML += `

        <div class="activity-item">

            <strong>

            ${item.nomor}

            </strong>

            <br><br>

            ${item.status}

            <br><br>

            ${item.tanggal}

        </div>

        `;

    });

}