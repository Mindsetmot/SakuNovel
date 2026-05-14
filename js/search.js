let novelDB = [];

const API_BASE = "https://core-logic.floverse.my.id";

// ======================================
// ELEMENT
// ======================================
const input = document.getElementById("searchInput");
const resultBox = document.getElementById("searchResult");
const gridContainer = document.getElementById("gridContainer");

// ======================================
// FIX LINK HALAMAN
// ======================================
function fixHalamanLink(link) {
  if (!link) return "#";
  
  if (link.startsWith("https")) {
    return link;
  }
  
  return ".." + link;
}

// ======================================
// FIX URL GAMBAR
// ======================================
function fixImageUrl(path) {
  if (!path) {
    return `${API_BASE}/assets/no-cover.jpg`;
  }

  // kalau sudah full URL
  if (path.startsWith("http")) {
    return path;
  }

  return `${API_BASE}${path}`;
}

// ======================================
// LOAD DATABASE
// ======================================
document.addEventListener("DOMContentLoaded", () => {
  fetch(`${API_BASE}/api/novels`, {
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      novelDB = data;

      generateYearChips(novelDB);
      render(novelDB);
    })
    .catch(err => {
      console.error("Gagal load database:", err);
    });

  if (input) input.focus();
});

// ======================================
// RENDER UTAMA
// ======================================
function render(data) {
  if (!gridContainer) return;

  gridContainer.innerHTML = "";
  resultBox.innerHTML = "";

  resultBox.style.display = "none";
  gridContainer.style.display = "grid";

  const sorted = [...data].sort((a, b) =>
    a.nama.localeCompare(b.nama, "id", {
      sensitivity: "base"
    })
  );

  sorted.forEach(novel => {
    const a = document.createElement("a");

    a.className = "grid";
    a.href = fixHalamanLink(novel.halaman);

    a.style.backgroundImage =
      `url('${fixImageUrl(novel.gambar)}')`;

    a.innerHTML = `
      <h3>${potongJudul(novel.nama, 28)}</h3>

      <p class="meta">
        <i class="fas fa-book"></i>
        Vol. ${novel.volume || "-"}
      </p>
    `;

    gridContainer.appendChild(a);
  });
}

// ======================================
// SEARCH REALTIME
// ======================================
if (input) {
  input.addEventListener("input", () => {
    const keyword = input.value
      .toLowerCase()
      .trim();

    if (!keyword) {
      render(novelDB);
      return;
    }

    gridContainer.style.display = "none";
    resultBox.style.display = "grid";

    const filtered = novelDB.filter(novel =>
      novel.nama?.toLowerCase().includes(keyword)
    );

    renderSearchResult(filtered);
  });
}

// ======================================
// RENDER SEARCH RESULT
// ======================================
function renderSearchResult(data) {

  if (!data.length) {
    resultBox.innerHTML = `
      <p style="
        grid-column:1/-1;
        text-align:center;
        opacity:.6;
        margin-top:60px;
      ">
        Tidak ada Light Novel ditemukan
      </p>
    `;
    
    return;
  }

  resultBox.innerHTML = data.map(novel => `
    <a href="${fixHalamanLink(novel.halaman)}"
       class="grid"
       style="
         background-image:
         url('${fixImageUrl(novel.gambar)}')
       ">

      <h3>
        ${potongJudul(novel.nama, 28)}
      </h3>

      <p class="meta">
        <i class="fas fa-book"></i>
        Vol. ${novel.volume || "-"}
      </p>

    </a>
  `).join("");
}

// ======================================
// CHIP FILTER TAHUN
// ======================================
function generateYearChips(data) {

  const filterBar =
    document.getElementById("filterBar");

  if (!filterBar) return;

  const years = new Set();

  data.forEach(novel => {
    if (novel.tanggal) {
      years.add(
        novel.tanggal.split("-")[0]
      );
    }
  });

  Array.from(years)
    .sort((a, b) => b - a)
    .forEach(year => {

      createChip(
        year,

        () => {
          const filtered =
            novelDB.filter(n =>
              n.tanggal?.startsWith(year)
            );

          render(filtered);
        },

        filterBar
      );
    });
}

function createChip(label, onClick, parent) {

  const chip = document.createElement("div");

  chip.className = "chip";
  chip.innerText = label;

  chip.onclick = () => {

    document.querySelectorAll(".chip")
      .forEach(c =>
        c.classList.remove("active")
      );

    chip.classList.add("active");

    onClick();
  };

  parent.appendChild(chip);
}

// ======================================
// UTIL
// ======================================
function potongJudul(text, max = 30) {

  if (!text) return "";

  return text.length > max
    ? text.slice(0, max) + "..."
    : text;
}
