// medicamentos.js
// un frontend normalito con almacenamiento local como base de datos simulado (la que esta creando hora si o no)

(function() {
  const LS_KEY = "medicines.v1";
  const $$ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const repo = {
    _read() {
      try {
        return JSON.parse(localStorage.getItem(LS_KEY)) || [];
      } catch {
        return [];
      }
    },
    _write(list) {
      localStorage.setItem(LS_KEY, JSON.stringify(list));
    },
    list() {
      return this._read();
    },
    get(id) {
      return this._read().find(m => m.id === id) || null;
    },
    create(med) {
      const list = this._read();
      list.push(med);
      this._write(list);
      return med;
    },
    update(id, patch) {
      const list = this._read();
      const idx = list.findIndex(m => m.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...patch };
      this._write(list);
      return list[idx];
    },
    remove(id) {
      const list = this._read().filter(m => m.id !== id);
      this._write(list);
    },
    seedIfEmpty() {
      const list = this._read();
      if (list.length === 0) {
        const defaults = [
          { id: uid(), name: "Paracetamol", presentation: "Tabletas 500 mg", unit: "tabletas", stock: 120, reorderLevel: 30, expiration: plusMonths(12) },
          { id: uid(), name: "Ibuprofeno", presentation: "Cápsulas 400 mg", unit: "capsulas", stock: 60, reorderLevel: 20, expiration: plusMonths(10) },
          { id: uid(), name: "Amoxicilina", presentation: "Suspensión 250 mg/5 mL", unit: "ml", stock: 500, reorderLevel: 200, expiration: plusMonths(6) }
        ];
        this._write(defaults);
      }
    }
  };

  // --- Utilities ---
  function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36).slice(4);
  }
  function plusMonths(n) {
    const d = new Date();
    d.setMonth(d.getMonth() + n);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }
  function isLowStock(med) {
    return Number(med.stock) <= Number(med.reorderLevel);
  }
  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString();
  }

  // --- UI state ---
  let editingId = null;

  // --- Elements ---
  const tbody = $$("#medTbody");
  const search = $$("#search");
  const addBtn = $$("#addBtn");
  const backdrop = $$("#modalBackdrop");
  const form = $$("#medForm");
  const cancelBtn = $$("#cancelBtn");
  const modalTitle = $$("#modalTitle");

  // --- Bootstrapping ---
  repo.seedIfEmpty();
  render();

  // --- Events ---
  addBtn.addEventListener("click", () => openModal());
  cancelBtn.addEventListener("click", closeModal);
  search.addEventListener("input", render);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = getFormData(form);
    const normalized = {
      name: data.name.trim(),
      presentation: data.presentation.trim(),
      unit: data.unit,
      stock: Number(data.stock),
      reorderLevel: Number(data.reorderLevel),
      expiration: data.expiration
    };

    if (editingId) {
      repo.update(editingId, normalized);
    } else {
      repo.create({ id: uid(), ...normalized });
    }
    closeModal();
    render();
  });

  // --- Functions ---
  function render() {
    const q = search.value.trim().toLowerCase();
    const all = repo.list();
    const list = q ? all.filter(m => (m.name + " " + m.presentation).toLowerCase().includes(q)) : all;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="empty">No hay medicamentos</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(m => {
      const status = isLowStock(m) ? `<span class="badge low">Bajo</span>` : `<span class="badge ok">OK</span>`;
      return `<tr data-id="${m.id}">
        <td>${escapeHTML(m.name)}</td>
        <td>${escapeHTML(m.presentation)}</td>
        <td>${escapeHTML(m.unit)}</td>
        <td>${Number(m.stock)}</td>
        <td>${Number(m.reorderLevel)}</td>
        <td>${fmtDate(m.expiration)}</td>
        <td>${status}</td>
        <td>
          <button class="button secondary" data-action="edit">Editar</button>
          <button class="button danger" data-action="delete">Eliminar</button>
        </td>
      </tr>`;
    }).join("");

    // Wire action buttons
    $$$("#medTbody [data-action='edit']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.closest("tr").dataset.id;
        const med = repo.get(id);
        if (!med) return;
        openModal(med);
      });
    });

    $$$("#medTbody [data-action='delete']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.closest("tr").dataset.id;
        const med = repo.get(id);
        if (!med) return;
        if (confirm(`¿Eliminar "${med.name}"?`)) {
          repo.remove(id);
          render();
        }
      });
    });
  }

  function openModal(med = null) {
    editingId = med?.id || null;
    modalTitle.textContent = editingId ? "Editar Medicamento" : "Nuevo medicamento";
    form.reset();
    if (med) {
      form.name.value = med.name || "";
      form.presentation.value = med.presentation || "";
      form.unit.value = med.unit || "tabletas";
      form.stock.value = med.stock ?? 0;
      form.reorderLevel.value = med.reorderLevel ?? 0;
      form.expiration.value = med.expiration || "";
    } else {
      form.unit.value = "tabletas";
    }
    backdrop.style.display = "flex";
  }

  function closeModal() {
    backdrop.style.display = "none";
    editingId = null;
  }

  function getFormData(form) {
    const fd = new FormData(form);
    return Object.fromEntries(fd.entries());
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[c]);
  }


})();