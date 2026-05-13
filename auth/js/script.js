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
    const handleAuth = (e, formId) => {
        e.preventDefault();
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        
        const actionType = (formId === 'loginForm') ? 'login' : 'register';
        formData.append('action', actionType);

        fetch('auth.php', { 
            method: 'POST', 
            body: formData,
            credentials: 'include' 
        })
        .then(async (res) => {
        const text = await res.text();
        console.log(text);

        return JSON.parse(text);
    })
        .then(res => {
            if(res.status === 'success') {
                showToast(res.message, "success");
                if(actionType === 'login') {
                    localStorage.setItem('user_name', res.data.username);
                    localStorage.setItem('account_id', res.data.account_id);
                    // Redirect ke halaman utama
                    setTimeout(() => { window.location.href = '../index.html'; }, 1500);
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