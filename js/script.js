/* ==============================  
   KONFIGURASI & STATE UTAMA
============================== */
const API_BASE = "";
let novelDB = [];
let lastPageId = "beranda";
let allNotifications = [];
let readCache = JSON.parse(localStorage.getItem('read_cache') || '[]');

/* ==============================  
   INISIALISASI APLIKASI (ON LOAD)
============================== */
document.addEventListener("DOMContentLoaded", () => {
    // --- AUTH GUARD: CEK LOGIN DULU ---
    fetch(`${API_BASE}/api/status`, { credentials: 'include' })
    .then(res => res.json())
    .then(status => {
        if (!status.loggedIn) {
            // Jika belum login, langsung lempar ke halaman login
            window.location.href = "/auth"; 
            return;
        }
        
        // Jika sudah login, baru jalankan fungsi load konten
        loadMainContent();
    })
    .catch(err => {
        console.error("Auth check failed:", err);
        window.location.href = "/auth";
    });
});

/* ==============================  
   FUNGSI UTAMA LOAD KONTEN
============================== */
function loadMainContent() {
    // 1. LOAD DATA NOVEL
    fetch(`${API_BASE}/api/novels`, {
        credentials: 'include',
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        novelDB = data;
        generateCategoryChips(data);
        render(novelDB);
        renderGrid(data);
    })
    .catch(err => console.error("Gagal load novel:", err));

    // 2. LOAD DATA SLIDE
    const slider = document.querySelector(".slide-card");
    if (slider) {
        fetch(`${API_BASE}/api/slide`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                renderSlideCard(data, slider);
                initSlider(slider);
            })
            .catch(err => console.error("Gagal load slide:", err));
    }

    // 3. LOAD STATUS & DATA NOTIFIKASI
    initNotificationSystem();

    // 4. SETUP EVENT LISTENERS
    setupEventListeners();
}

/* ==============================  
   FUNGSI AUTH & EVENT SETUP
============================== */
function setupEventListeners() {
    // Tombol Search
    const searchBtn = document.getElementById('search-button');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            location.href = 'search';
        });
    }

    // Navigasi Bawah (SPA)
    const navLinks = document.querySelectorAll('.bottom-nav a[data-target]');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = link.dataset.target;
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(target)?.classList.add('active');
            navLinks.forEach(n => n.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Tombol Back
    document.getElementById("back-button")?.addEventListener("click", () => {
        const pages = document.querySelectorAll(".page");
        pages.forEach(p => p.classList.remove("active"));
        document.getElementById(lastPageId)?.classList.add("active");

        document.querySelector(".bottom-nav").style.display = "flex";
        document.getElementById("search-button").style.display = "block";
        document.getElementById("back-button").style.display = "none";
        history.back();
    });

    // Menu Titik Tiga
    const arrangementBtn = document.getElementById("arrangement");
    const arrangementMenu = document.getElementById("arrangement-menu");
    if (arrangementBtn && arrangementMenu) {
        arrangementBtn.addEventListener("click", e => {
            e.stopPropagation();
            arrangementMenu.style.display = arrangementMenu.style.display === "flex" ? "none" : "flex";
        });
        document.addEventListener("click", () => arrangementMenu.style.display = "none");
    }
}

/* ==============================  
   LOGIKA RENDER NOVEL
============================== */
function render(data) {
    const grid = document.getElementById('mainGrid');
    if (!grid) return;

    if (data.length === 0) {
        grid.innerHTML = `<p class="empty-msg">Tidak ada Light Novel ditemukan.</p>`;
        return;
    }

    grid.innerHTML = shuffleArray(data).map(novel => `
        <a href="${novel.halaman}" class="grid" style="background-image: url('${API_BASE}${novel.gambar}')">
            <h3>${potongTeks(novel.nama, 28)}</h3>
            <p class="meta"><i class="fas fa-book"></i> Vol. ${novel.volume}</p>
        </a>
    `).join('');
}

function renderGrid(novels) {
    const container = document.getElementById("gridContainer");
    if (!container) return;
    
    const rekomendasi = shuffleArray(novels).slice(0, 6);
    container.innerHTML = rekomendasi.map(novel => `
        <a href="${novel.halaman}" class="grid" style="background-image: url('${API_BASE}${novel.gambar}')">
            <h3>${potongTeks(novel.nama, 28)}</h3>
            <p class="meta"><i class="fas fa-book"></i> Vol. ${novel.volume}</p>
        </a>
    `).join('');
}

/* ==============================  
   LOGIKA SLIDER
============================== */
function renderSlideCard(data, slider) {
    slider.innerHTML = data.map(item => `
        <a href="${item.link}" class="card" style="background-image:url('${API_BASE}${item.gambar}')">
            ${item.isNew ? `<span class="badge-new">NEW</span>` : ``}
            <div class="text">
                <h3>${item.judul}</h3>
                <p>${item.status} ${item.info}</p>
            </div>
        </a>
    `).join("");
}

function initSlider(slider) {
    const cards = slider.querySelectorAll(".card");
    if (!cards.length) return;

    let index = 0;
    const cardGap = 10;
    const getScrollDistance = () => cards[0].offsetWidth + cardGap;

    const interval = setInterval(() => {
        index = (index + 1) % cards.length;
        slider.scrollTo({ left: getScrollDistance() * index, behavior: "smooth" });
    }, 5000);

    slider.addEventListener("scroll", () => clearInterval(interval));
}

/* ==============================  
   SISTEM NOTIFIKASI
============================== */
function initNotificationSystem() {
    const notificationBtn = document.getElementById("notification");
    const notifBadge = document.getElementById("notifBadge");
    const listEl = document.getElementById('notifList');

    fetch(`${API_BASE}/api/notification`, {
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        if (data.notification) {
            notificationBtn?.classList.add("has-notif");
            if (notifBadge) notifBadge.style.display = "block";
            notificationBtn.onclick = () => openNotificationSPA();
        }

        allNotifications = data.notifications || [];
        if (listEl) {
            listEl.innerHTML = allNotifications.length 
                ? allNotifications.map((n, i) => `
                    <div class="notif-item ${readCache.includes(n.id.toString()) ? 'read' : ''}" 
                         data-id="${n.id}" style="animation-delay: ${i * 0.1}s">
                        <h3>${n.judul}</h3>
                        <p>${n.text}</p>
                    </div>`).join('')
                : '<p class="empty">Tidak ada notifikasi.</p>';
        }
    });
}

function openNotificationSPA() {
    lastPageId = document.querySelector(".page.active")?.id || "beranda";
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById("notification-page")?.classList.add("active");

    document.querySelector(".bottom-nav").style.display = "none";
    document.getElementById("search-button").style.display = "none";
    document.getElementById("back-button").style.display = "block";

    history.pushState({ page: "notification" }, "", "#notification");
}

/* ==============================  
   UTILITIES / PEMBANTU
============================== */
function potongTeks(text, max = 30) {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '...' : text;
}

function shuffleArray(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function generateCategoryChips(data) {
    const filterBar = document.getElementById('filterBar');
    if (!filterBar) return;
    const allGenres = new Set();
    data.forEach(item => item.genre?.forEach(g => allGenres.add(g)));

    Array.from(allGenres).sort().forEach(genre => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerText = genre;
        chip.onclick = function() {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            render(genre === 'All' ? novelDB : novelDB.filter(n => n.genre?.includes(genre)));
        };
        filterBar.appendChild(chip);
    });
}
