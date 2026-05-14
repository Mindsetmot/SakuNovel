document.addEventListener("DOMContentLoaded", () => {
    const pages = document.querySelectorAll('.page');
    const links = document.querySelectorAll('a[data-target]');
    let isLogin = true;

    // === 1. PINDAH HALAMAN ===
    const switchPage = (target) => {
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById(target).classList.add('active');
        isLogin = (target === 'login');
    };

    switchPage("login");

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(link.dataset.target);
        });
    });

    // === 2. PASSWORD TOGGLE ===
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

    // === 3. LOGIKA AUTH (SINKRON DENGAN SESSION) ===
    // Bagian Logika Auth di script.js
    const handleAuth = (e, formId) => {
        e.preventDefault();
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        
        // Ubah FormData menjadi Object JSON
        const data = Object.fromEntries(formData.entries());
        
        const actionType = (formId === 'loginForm') ? 'login' : 'register';
        const endpoint = `https://core-logic.floverse.my.id/api/${actionType}`;
    
        fetch(endpoint, {   
            method: 'POST',   
            headers: {
                'Content-Type': 'application/json' // Beritahu Express ini JSON
            },
            body: JSON.stringify(data), // Kirim sebagai string JSON
            credentials: 'include'   
        })
        .then(res => res.json())
        .then(res => {
            console.log(res);
            if(res.status === 'success') {
                showToast(res.message, "success");
                if(actionType === 'login') {
                    localStorage.setItem('user_name', res.data.username);
                    localStorage.setItem('account_id', res.data.account_id);
                    localStorage.setItem('user_role', res.data.role);
                    // Redirect ke halaman utama
                    setTimeout(() => { window.location.href = `https://www.floverse.my.id`; }, 1500);
                } else {
                    setTimeout(() => { switchPage('login'); }, 1500);
                }
            } else {
                showToast(res.message, "error");
                // Reset reCAPTCHA
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
            }
        })
        .catch(() => showToast("Gagal terhubung ke server, coba lagi!", "error"));
    };

    document.getElementById('loginForm').addEventListener('submit', (e) => handleAuth(e, 'loginForm'));
    document.getElementById('registerForm').addEventListener('submit', (e) => handleAuth(e, 'registerForm'));
});

function showToast(msg, type) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.className = 'show ' + (type === 'success' ? 'toast-success' : 'toast-error');
    setTimeout(() => { toast.className = ''; }, 3000);
}
