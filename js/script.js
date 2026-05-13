let novelDB = [];  
let lastPageId = "beranda";  
  
const API_BASE = "http://127.0.0.1:3000";  
  
    fetch(`${API_BASE}/api/novels`)  
            .then(res => res.json())  
            .then(data => {  
                novelDB = data;  
                generateCategoryChips(data);  
                render(novelDB);  
            })  
            .catch(err => {  
                console.error("Gagal load novel:", err);  
            });  
         
function potongTeks(text, max = 30) {  
    if (!text) return '';  
    return text.length > max  
        ? text.slice(0, max) + '...'  
        : text;  
}  
  
function bukaSearch() {  
  location.href = 'search';   
}  
  
function shuffleArray(arr) {  
  const copy = [...arr]; // biar data asli nggak rusak  
  for (let i = copy.length - 1; i > 0; i--) {  
    const j = Math.floor(Math.random() * (i + 1));  
    [copy[i], copy[j]] = [copy[j], copy[i]];  
  }  
  return copy;  
}  
  
function openNotificationSPA() {  
  const pages = document.querySelectorAll(".page");  
  const bottomNav = document.querySelector(".bottom-nav");  
  const searchBtn = document.getElementById("search-button");  
  const backBtn = document.getElementById("back-button");  
  
  // simpan halaman sebelumnya  
  const currentPage = document.querySelector(".page.active");  
  if (currentPage) {  
    lastPageId = currentPage.id;  
  }  
  
  // ganti halaman  
  pages.forEach(p => p.classList.remove("active"));  
   
document.addEventListener('DOMContentLoaded', () => {  
    const searchBtn = document.getElementById('search-button');  
    if (searchBtn) {  
        searchBtn.addEventListener('click', (e) => {  
            e.preventDefault(); // Hindari aksi default button  
            location.href = 'search';   
        });  
    }  
}); document.getElementById("notification-page")?.classList.add("active");  
  
  // atur UI  
  bottomNav.style.display = "none";  
  searchBtn.style.display = "none";  
  backBtn.style.display = "block";  
  
  history.pushState(  
    { page: "notification", from: lastPageId },  
    "",  
    "#notification"  
  );  
}  
  
/* ==============================  
   NAVIGASI BAWAH (SPA RINGAN)  
============================== */  
document.addEventListener('DOMContentLoaded', () => {  
    const navLinks = document.querySelectorAll('.bottom-nav a[data-target]');  
    const pages = document.querySelectorAll('.page');  
  
    navLinks.forEach(link => {  
        link.addEventListener('click', e => {  
            e.preventDefault();  
            const target = link.dataset.target;  
  
            pages.forEach(p => p.classList.remove('active'));  
            const page = document.getElementById(target);  
            if (page) page.classList.add('active');  
  
            navLinks.forEach(n => n.classList.remove('active'));  
            link.classList.add('active');  
        });  
    });  
});  
  
document.getElementById("back-button").addEventListener("click", () => {  
  const pages = document.querySelectorAll(".page");  
  const bottomNav = document.querySelector(".bottom-nav");  
  const searchBtn = document.getElementById("search-button");  
  const backBtn = document.getElementById("back-button");  
  
  // reset page  
  pages.forEach(p => p.classList.remove("active"));  
  document.getElementById(lastPageId)?.classList.add("active");  
  
  // kembalikan UI  
  bottomNav.style.display = "flex";  
  searchBtn.style.display = "block";  
  backBtn.style.display = "none";  
  
  history.back();  
});  
  
window.addEventListener("popstate", e => {  
  const pages = document.querySelectorAll(".page");  
  const bottomNav = document.querySelector(".bottom-nav");  
  const searchBtn = document.getElementById("search-button");  
  const backBtn = document.getElementById("back-button");  
  
  pages.forEach(p => p.classList.remove("active"));  
  
  if (e.state && e.state.page === "notification") {  
    document.getElementById("notification-page")?.classList.add("active");  
    bottomNav.style.display = "none";  
    searchBtn.style.display = "none";  
    backBtn.style.display = "block";  
  } else {  
    document.getElementById(lastPageId)?.classList.add("active");  
    bottomNav.style.display = "flex";  
    searchBtn.style.display = "block";  
    backBtn.style.display = "none";  
  }  
});  
  
/* ==============================  
   SLIDE CARD + AUTO SCROLL  
============================== */  
document.addEventListener("DOMContentLoaded", () => {  
  const slider = document.querySelector(".slide-card");  
  if (!slider) return;  
  
  // ==========================  
  // LOAD SLIDE DATA  
  // ==========================  
  fetch(`${API_BASE}/api/slide`)  
    .then(res => res.json())  
    .then(data => {  
      renderSlideCard(data);  
      initSlider(); // ⬅️ PENTING: setelah card jadi  
    })  
    .catch(err => console.error("Gagal load slide data:", err));  
  
  // ==========================  
  // RENDER CARD  
  // ==========================  
  function renderSlideCard(data) {  
    slider.innerHTML = data.map(item => `  
      <a href="${item.link}" class="card"  
         style="background-image:url('${API_BASE}${item.gambar}')">  
  
        ${item.isNew ? `<span class="badge-new">NEW</span>` : ``}  
  
        <div class="text">  
          <h3>${item.judul}</h3>  
          <p>${item.status} ${item.info}</p>  
        </div>  
      </a>  
    `).join("");  
  }  
  
  // ==========================  
  // SLIDER LOGIC (BAWAAN + FIX)  
  // ==========================  
  function initSlider() {  
    const cards = slider.querySelectorAll(".card");  
    const cardGap = 10;  
    let index = 0;  
    let isAutoScrolling = false;  
  
    function getScrollDistance() {  
      if (!cards.length) return 0;  
      return cards[0].offsetWidth + cardGap;  
    }  
  
    function autoSlide() {  
      if (isAutoScrolling || !cards.length) return;  
      isAutoScrolling = true;  
  
      index = (index + 1) % cards.length;  
  
      slider.scrollTo({  
        left: getScrollDistance() * index,  
        behavior: "smooth"  
      });  
  
      setTimeout(() => {  
        isAutoScrolling = false;  
      }, 600);  
    }  
  
    let interval = setInterval(autoSlide, 5000);  
  
    slider.addEventListener("scroll", () => {  
      clearInterval(interval);  
      clearTimeout(slider.scrollEndTimeout);  
  
      slider.scrollEndTimeout = setTimeout(() => {  
        index = Math.round(slider.scrollLeft / getScrollDistance());  
        interval = setInterval(autoSlide, 5000);  
      }, 120);  
    });  
  }  
});  
  
document.addEventListener("DOMContentLoaded", () => {  
  const notificationBtn = document.getElementById("notification");  
  const notifBadge = document.getElementById("notifBadge");  
  
  if (!notificationBtn) return;  
  
  fetch(`${API_BASE}/api/notification`)  
    .then(res => res.json())  
    .then(data => {  
      const status = data.notification === true;  
  
      if (status) {  
        // aktifkan badge & style  
        notificationBtn.classList.add("has-notif");  
        notifBadge.style.display = "block";  
  
        // klik -> buka halaman notifikasi via SPA  
        notificationBtn.onclick = () => {  
          openNotificationSPA();  
        };  
  
      } else {  
        notificationBtn.classList.remove("has-notif");  
        notifBadge.style.display = "none";  
        notificationBtn.onclick = null;  
      }  
    })  
    .catch(err => console.error("Gagal load notifikasi:", err));  
});  
  
const listEl = document.getElementById('notifList');  
const modalEl = document.getElementById('notifModal');  
const mTitle = document.getElementById('mTitle');  
const mText = document.getElementById('mText');  
const mIcon = document.getElementById('mIcon');  
  
let readCache = JSON.parse(localStorage.getItem('read_cache') || '[]');  
let allNotifications = [];  
  
// Fungsi pembantu untuk ikon  
function getIcon(judul) {  
  const j = judul.toLowerCase();  
  if (j.includes('update')) return 'refresh-cw';  
  if (j.includes('penting')) return 'alert-circle';  
  if (j.includes('episode') || j.includes('tayang')) return 'play';  
  return 'bell';  
}  
  
// Memuat Notifikasi  
fetch(`${API_BASE}/api/notification`)  
  .then(res => res.json())  
  .then(data => {  
    allNotifications = data.notifications || [];  
  
    if (!allNotifications.length) {  
      listEl.innerHTML = '<p class="empty">Tidak ada notifikasi.</p>';  
      return;  
    }  
  
    // Render List dengan Animasi  
    listEl.innerHTML = allNotifications.map((n, index) => {  
      const isRead = readCache.includes(n.id.toString()) ? 'read' : '';  
        
      // index * 0.1s membuat tiap pesan muncul bergantian (staggered)  
      return `  
        <div class="notif-item ${isRead}" data-id="${n.id}"   
             style="animation: fadeInUp 0.4s ease forwards; animation-delay: ${index * 0.1}s; opacity: 0;">  
          <h3>${n.judul}</h3>  
          <p>${n.text}</p>  
        </div>  
      `;  
    }).join('');  
  
    if (window.lucide) lucide.createIcons();  
  })  
  .catch(() => {  
    listEl.innerHTML = '<p class="empty">Gagal memuat notifikasi.</p>';  
  });  
  
// Event Klik untuk SPA  
listEl.addEventListener('click', e => {  
    // 1. Jika yang diklik adalah link <a>, JANGAN jalankan fungsi card  
    if (e.target.closest('a')) {  
        return; // Biarkan link berjalan normal (pindah halaman)  
    }  
  
    const card = e.target.closest('.notif-item');  
    if (!card) return;  
  
    const id = card.dataset.id;  
    const data = allNotifications.find(n => n.id == id);  
  
    if (data) {  
        // Logika Read Cache  
        if (!readCache.includes(id.toString())) {  
            readCache.push(id.toString());  
            localStorage.setItem('read_cache', JSON.stringify(readCache));  
            card.classList.add('read');  
        }  
  
        // 2. Cek Redirect Langsung  
        if (data.link && data.link !== "#") {  
            window.location.href = data.link;  
        } else {  
            // 3. Buka Modal  
            mTitle.innerText = data.judul;  
              
            // Konversi \n ke <br> dan render HTML  
            mText.innerHTML = data.text.replace(/\n/g, '<br>');   
              
            mIcon.innerHTML = `<i data-lucide="${getIcon(data.judul)}" size="20"></i>`;  
            modalEl.style.display = 'flex';  
            document.body.style.overflow = 'hidden';  
              
            if (window.lucide) lucide.createIcons();  
        }  
    }  
});  
  
function closeNotifModal() {  
  modalEl.style.display = 'none';  
}  
  
// Klik luar modal untuk menutup  
window.onclick = e => { if (e.target == modalEl) closeNotifModal(); };  
  
document.addEventListener("DOMContentLoaded", () => {  
  fetch(`${API_BASE}/api/novels`)  
    .then(res => res.json())  
    .then(data => {  
      renderGrid(data);  
    })  
    .catch(err => console.error(err));  
});  
  
function renderGrid(novels) {  
  const container = document.getElementById("gridContainer");  
  container.innerHTML = "";  
  
  // 1. Acak data  
  const shuffled = shuffleArray(novels);  
  
  // 2. Ambil maksimal 6 item  
  const rekomendasi = shuffled.slice(0, 6);  
  
  rekomendasi.forEach(novel => {  
    const a = document.createElement("a");  
    a.href = novel.halaman;  
    a.className = "grid";  
    a.style.backgroundImage = `url('${API_BASE}${novel.gambar}')`;  
  
    const judulPendek = potongJudul(novel.nama, 28);  
  
    a.innerHTML = `  
      <h3>${judulPendek}</h3>  
      <p class="meta">  
        <i class="fas fa-book"></i>Vol. ${novel.volume}  
      </p>  
    `;  
  
    container.appendChild(a);  
  });  
}  
  
function potongJudul(text, maxChars = 30) {  
  if (!text) return '';  
  if (text.length <= maxChars) return text;  
  return text.slice(0, maxChars) + '...';  
}  
  
// FUNGSI UNTUK MEMBUAT TOMBOL KATEGORI OTOMATIS DARI ARRAY GENRE  
    function generateCategoryChips(data) {  
        const filterBar = document.getElementById('filterBar');  
        const allGenres = new Set();  
          
        data.forEach(anime => {  
            if (Array.isArray(anime.genre)) {  
                anime.genre.forEach(g => allGenres.add(g));  
            }  
        });  
  
        // Sortir genre sesuai abjad dan buat elemen chip-nya  
        Array.from(allGenres).sort().forEach(genre => {  
            const chip = document.createElement('div');  
            chip.className = 'chip';  
            chip.innerText = genre;  
            chip.onclick = function() { filter(genre, this); };  
            filterBar.appendChild(chip);  
        });  
    }  
      
    function filter(genre, chipEl) {  
    // reset status aktif semua chip  
    document.querySelectorAll('.chip').forEach(c => {  
        c.classList.remove('active');  
    });  
  
    // aktifkan chip yang diklik  
    chipEl.classList.add('active');  
  
    // kalau klik "Semua", tampilkan seluruh data  
    if (genre === 'All') {  
        render(novelDB);  
        return;  
    }  
  
    // filter berdasarkan genre  
    const filtered = novelDB.filter(novel => {  
        return Array.isArray(novel.genre) && novel.genre.includes(genre);  
    });  
  
    // render hasil filter  
    render(filtered);  
}  
      
    function render(data) {  
  const grid = document.getElementById('mainGrid');  
  
  if (data.length === 0) {  
    grid.innerHTML = `  
      <p style="color:var(--text-dim); grid-column:1/-1; text-align:center; padding:40px 0;">  
        Tidak ada Light Novel ditemukan.  
      </p>  
    `;  
    return;  
  }  
  
  const shuffled = shuffleArray(data);  
  
  grid.innerHTML = shuffled.map(novel => {  
    const judulPendek = potongTeks(novel.nama, 28);  
  
    return `  
      <a href="${novel.halaman}" class="grid"  
         style="background-image: url('${API_BASE}${novel.gambar}')">  
        <h3>${judulPendek}</h3>  
        <p class="meta">  
          <i class="fas fa-book"></i>Vol. ${novel.volume}  
        </p>  
      </a>  
    `;  
  }).join('');  
}  
  
/* ==============================  
   MENU TITIK TIGA (REDIRECT)  
============================== */  
const arrangementBtn = document.getElementById("arrangement");  
const arrangementMenu = document.getElementById("arrangement-menu");  
  
if (arrangementBtn && arrangementMenu) {  
    arrangementBtn.addEventListener("click", e => {  
        e.stopPropagation();  
        arrangementMenu.style.display =  
            arrangementMenu.style.display === "flex" ? "none" : "flex";  
    });  
  
    document.addEventListener("click", () => {  
        arrangementMenu.style.display = "none";  
    });  
  
    arrangementMenu.querySelectorAll("button").forEach(btn => {  
        btn.addEventListener("click", () => {  
            const href = btn.dataset.href;  
            if (href) location.href = href;  
        });  
    });  
}

/* ==============================
   BLOK KLIK KARTU DUMMY
============================== */
document.querySelectorAll('.card, .stat-card, .grid, .grid-header')  
.forEach(el => {
    el.addEventListener('click', e => e.preventDefault());
});
