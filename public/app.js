const $ = (s) => document.querySelector(s);

// Muted, earthy spine colours that sit well on cream/beige
const PALETTE = [
  "#9a5b3c", "#7d8f69", "#b8893f", "#5f6f7a", "#8c4a4a", "#6b5b45",
  "#a77b5a", "#556b5d", "#c07a52", "#7a6a8a", "#4e5d6c", "#b0694a",
];

let state = { by: "genre", q: "", shelves: [], selectedId: null, books: [] };

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const colorFor = (b) => PALETTE[hash(b.title) % PALETTE.length];

// Spine size derived from page count & title, so each looks a little different
function spineSize(b) {
  const pages = b.pages || 250;
  const width = Math.max(26, Math.min(58, Math.round(pages / 12)));
  const height = 120 + (hash(b.title + b.author) % 55); // 120–174px
  return { width, height };
}

async function api(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.json();
}

async function load() {
  const [shelves, books] = await Promise.all([
    api(`/api/shelves?by=${state.by}`),
    api("/api/books"),
  ]);
  state.shelves = shelves;
  state.books = books;
  renderStats();
  renderShelves();
  $("#genreList").innerHTML = [...new Set(books.map((b) => b.genre))]
    .map((g) => `<option value="${g}">`).join("");
}

function renderStats() {
  const b = state.books;
  const read = b.filter((x) => x.status === "Read").length;
  const reading = b.filter((x) => x.status === "Reading").length;
  const want = b.filter((x) => x.status === "Want to read").length;
  const genres = new Set(b.map((x) => x.genre)).size;
  const rated = b.filter((x) => x.rating > 0);
  const avg = rated.length ? (rated.reduce((s, x) => s + x.rating, 0) / rated.length).toFixed(1) : "–";
  const items = [
    [b.length, "Books"], [read, "Read"], [reading, "Reading now"],
    [want, "Want to read"], [avg, "Avg rating"], [genres, "Genres"],
  ];
  $("#stats").innerHTML = items.map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("");
}

function matches(b) {
  if (!state.q) return true;
  const q = state.q.toLowerCase();
  return [b.title, b.author, b.genre].some((v) => v.toLowerCase().includes(q));
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderShelves() {
  const box = $("#shelves");
  const visible = state.shelves
    .map((s) => ({ ...s, books: s.books.filter(matches) }))
    .filter((s) => s.books.length);

  if (!visible.length) {
    box.innerHTML = `<div class="empty-msg">No books match your search.</div>`;
    return;
  }

  box.innerHTML = visible.map((s) => `
    <section class="shelf">
      <div class="shelf-head"><h3>${esc(s.name)}</h3><span>${s.books.length}</span></div>
      <div class="row-books">
        ${s.books.map((b) => {
          const { width, height } = spineSize(b);
          return `<button class="spine${b._id === state.selectedId ? " selected" : ""}"
                    data-id="${b._id}" title="${esc(b.title)} — ${esc(b.author)}"
                    style="width:${width}px;height:${height}px;background:${colorFor(b)}">
                    <span>${esc(b.title)}</span>
                  </button>`;
        }).join("")}
      </div>
      <div class="plank"></div>
    </section>`).join("");
}

function showDetail(id) {
  const b = state.books.find((x) => x._id === id);
  if (!b) return;
  state.selectedId = id;
  document.querySelectorAll(".spine").forEach((el) => el.classList.toggle("selected", el.dataset.id === id));

  const detail = $("#detail");
  detail.classList.remove("empty");
  detail.querySelector(".card").hidden = false;

  $("#dCover").style.background = colorFor(b);
  $("#dCoverTitle").textContent = b.title;
  $("#dGenre").textContent = b.genre;
  $("#dTitle").textContent = b.title;
  $("#dAuthor").textContent = "by " + b.author;
  $("#dDesc").textContent = b.description || "No description yet.";
  $("#dYear").textContent = b.year || "–";
  $("#dPages").textContent = b.pages || "–";
  $("#dStatus").textContent = b.status;
  $("#dRating").textContent = b.rating ? "★".repeat(b.rating) + "☆".repeat(5 - b.rating) : "Unrated";
}

function hideDetail() {
  state.selectedId = null;
  const detail = $("#detail");
  detail.classList.add("empty");
  detail.querySelector(".card").hidden = true;
  document.querySelectorAll(".spine.selected").forEach((el) => el.classList.remove("selected"));
}

// ---------- Events ----------
$("#shelves").addEventListener("click", (e) => {
  const spine = e.target.closest(".spine");
  if (spine) showDetail(spine.dataset.id);
});

document.querySelectorAll(".seg button").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.by = btn.dataset.by;
    load();
  })
);

let t;
$("#search").addEventListener("input", (e) => {
  clearTimeout(t);
  t = setTimeout(() => { state.q = e.target.value.trim(); renderShelves(); }, 150);
});

$("#closeDetail").addEventListener("click", hideDetail);

$("#deleteBook").addEventListener("click", async () => {
  if (!state.selectedId || !confirm("Remove this book from your shelf?")) return;
  await api(`/api/books/${state.selectedId}`, { method: "DELETE" });
  hideDetail();
  load();
});

// Add-book dialog
const dlg = $("#addDialog");
$("#openAdd").addEventListener("click", () => dlg.showModal());
$("#cancelAdd").addEventListener("click", () => dlg.close());
$("#addForm").addEventListener("submit", async (e) => {
  const data = Object.fromEntries(new FormData(e.target));
  ["year", "pages", "rating"].forEach((k) => (data[k] = data[k] === "" ? undefined : Number(data[k])));
  try {
    const book = await api("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    e.target.reset();
    await load();
    showDetail(book._id);
  } catch (err) {
    alert("Could not save: " + err.message);
  }
});

load().catch((err) => {
  $("#shelves").innerHTML = `<div class="empty-msg">Couldn't load books: ${esc(err.message)}</div>`;
});
