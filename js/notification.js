  const listEl = document.getElementById('notifList');

  function getIcon(judul) {
    const j = judul.toLowerCase();
    if(j.includes('update')) return 'refresh-cw';
    if(j.includes('penting')) return 'alert-circle';
    if(j.includes('episode') || j.includes('tayang')) return 'play';
    return 'bell';
  }

  function handleAction(id, judul, text, link) {
    // Save read status
    let reads = JSON.parse(localStorage.getItem('read_cache') || '[]');
    if(!reads.includes(id)) {
      reads.push(id);
      localStorage.setItem('read_cache', JSON.stringify(reads));
      const el = document.getElementById(`card-${id}`);
      if(el) el.classList.add('read');
    }

    if(!link || link === "#") {
      document.getElementById('mTitle').innerText = judul;
      document.getElementById('mText').innerText = text;
      document.getElementById('mIcon').innerHTML = `<i data-lucide="${getIcon(judul)}" size="24"></i>`;
      document.getElementById('notifModal').style.display = 'flex';
      lucide.createIcons();
    } else {
      setTimeout(() => { window.location.href = link; }, 150);
    }
  }

  fetch(`/api/notification`)
    .then(res => res.json())
    .then(data => {
      const items = data.notifications || [];
      const reads = JSON.parse(localStorage.getItem('read_cache') || '[]');

      listEl.innerHTML = items.map((n, i) => {
        const isRead = reads.includes(n.id) ? 'read' : '';
        return `
          <div class="notif-card ${isRead}" id="card-${n.id}" 
               style="animation-delay: ${i * 0.08}s"
               onclick="handleAction('${n.id}', '${n.judul.replace(/'/g, "\\'")}', '${n.text.replace(/'/g, "\\'")}', '${n.link}')">
            <div class="icon-box"><i data-lucide="${getIcon(n.judul)}" size="22"></i></div>
            <div class="content-wrapper"><h3>${n.judul}</h3></div>
            <i data-lucide="chevron-right" size="16" class="chevron"></i>
          </div>
        `;
      }).join('');
      lucide.createIcons();
    })
    .catch(() => {
      listEl.innerHTML = '<div class="no-data">Gagal memuat notifikasi.</div>';
    });
