document.addEventListener("DOMContentLoaded", () => {
    const pages = document.querySelectorAll('.page');
    const links = document.querySelectorAll('a[data-target]');
    let isLogin = true;

    // --- 1. STOP REDIRECT LOOP ---
    // Pastikan kita menggunakan path relatif agar lewat Cloudflare Worker
    fetch(`/api/status`, { credentials: 'include' })
    .then(res => res.json())
    .then(status => {
        if (status.loggedIn) {
            // Jika sudah login tapi buka halaman auth, tendang ke home
            window.location.href = "/";
            return;
        }
        console.log("Status: Belum login. Silakan lanjut.");
    })
    .catch(err => console.error("Gagal cek status:", err));

    // --- 2. PINDAH HALAMAN (Login <-> Register) ---
    const switchPage = (target) => {
        pages.forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(target);
        if (targetPage) targetPage.classList.add('active');
        isLogin = (target === 'login');
    };

    switchPage("login"); // Set default ke login

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(link.dataset.target);
        });
    });

    // --- 3. PASSWORD TOGGLE ---
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', () => {
            const input = icon.previousElementSibling;
            if (input.type === "password") {
                input.type = "text";
                icon.classList.replace("fa-eye", "fa-eye-slash");
            } else {
                input.type = "password";
                icon.classList.replace("fa-eye-slash", "fa-eye");
            }
        });
    });

    // --- 4. LOGIKA AUTH ---
    const handleAuth = (e, formId) => {
        e.preventDefault();
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        const actionType = (formId === 'loginForm') ? 'login' : 'register';
        const endpoint = `/api/${actionType}`;

        fetch(endpoint, {   
            method: 'POST',   
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'   
        })
        .then(res => res.json())
        .then(res => {
            if(res.status === 'success') {
                showToast(res.message, "success");
                if(actionType === 'login') {
                    // Simpan session data ke localStorage
                    localStorage.setItem('user_name', res.data.username);
                    localStorage.setItem('account_id', res.data.account_id);
                    localStorage.setItem('user_role', res.data.role);
                    
                    // Kembalikan ke halaman utama
                    setTimeout(() => { window.location.href = "/"; }, 1500);
                } else {
                    // Pindah ke tab login setelah register sukses
                    setTimeout(() => { switchPage('login'); }, 1500);
                }
            } else {
                showToast(res.message, "error");
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
            }
        })
        .catch(() => showToast("Gagal terhubung ke server!", "error"));
    };

    // Pasang listener submit
    document.getElementById('loginForm')?.addEventListener('submit', (e) => handleAuth(e, 'loginForm'));
    document.getElementById('registerForm')?.addEventListener('submit', (e) => handleAuth(e, 'registerForm'));
});

// Fungsi Toast (di luar DOMContentLoaded agar bisa diakses global)
function showToast(msg, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = msg;
    toast.className = 'show ' + (type === 'success' ? 'toast-success' : 'toast-error');
    setTimeout(() => { toast.className = ''; }, 3000);
}
