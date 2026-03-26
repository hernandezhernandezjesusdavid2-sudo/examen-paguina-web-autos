document.addEventListener('DOMContentLoaded', () => {

  // --- STATE MANAGEMENT ---
  const V_KEY = 'el_rayo_vehicles_vanilla';
  let vehicles = JSON.parse(localStorage.getItem(V_KEY));
  if (!vehicles) {
    vehicles = window.initialVehicles || [];
    saveVehicles();
  }

  function saveVehicles() {
    localStorage.setItem(V_KEY, JSON.stringify(vehicles));
  }

  function isVehicleNew(vehicle) {
    if (!vehicle.new) return false;
    if (!vehicle.createdAt || !vehicle.recentDuration) return true;
    const createdDate = new Date(vehicle.createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= vehicle.recentDuration;
  }

  // --- ROUTING ---
  const sections = document.querySelectorAll('.view-section');
  const navLinks = document.querySelectorAll('.nav-btn');

  function showSection(target) {
    sections.forEach(sec => sec.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));

    const activeSec = document.getElementById(target);
    if (activeSec) activeSec.classList.add('active');

    const activeLinks = document.querySelectorAll(`.nav-btn[data-target="${target}"]`);
    activeLinks.forEach(l => l.classList.add('active'));

    window.scrollTo(0,0);
    
    // Auth Check for Admin
    if(target === 'admin') {
      const isAuth = sessionStorage.getItem('el_rayo_admin_auth') === 'true';
      if(!isAuth) {
        showSection('login');
      } else {
        renderAdminTable();
      }
    }
  }

  // Intercept links
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-target');
      history.pushState(null, null, `#${target}`);
      showSection(target);
    });
  });

  // Handle back/forward
  window.addEventListener('popstate', () => {
    let hash = window.location.hash.replace('#', '');
    if (!hash) hash = 'inicio';
    showSection(hash);
  });

  // Init Route
  let initialHash = window.location.hash.replace('#', '') || 'inicio';
  showSection(initialHash);


  // --- RENDERING VIEWS ---
  
  function createCardHTML(v) {
    const isNew = isVehicleNew(v);
    return `
      <div class="vehicle-card fade-in">
        <div class="card-image-wrapper">
          <img src="${v.mainImage || (v.gallery && v.gallery[0]) || './assets/images/car.png'}" alt="${v.model}" class="card-image" />
          ${isNew ? '<span class="badge badge-new">Recién Llegado</span>' : ''}
          <div class="card-overlay">
            <span class="overlay-text">Ver Especificaciones</span>
          </div>
        </div>
        <div class="card-content">
          <div class="card-header">
            <h3 class="card-title">${v.model}</h3>
            <span class="card-year">${v.year}</span>
          </div>
          <div class="card-specs">
            <div class="spec-item"><span class="spec-icon">⏱️</span><span>${v.mileage}</span></div>
            <div class="spec-item"><span class="spec-icon">⚙️</span><span>${v.engine}</span></div>
          </div>
          <div class="card-footer" style="flex-direction: column; align-items: stretch; gap: 10px;">
            <span class="card-price" style="text-align: center;">${v.price}</span>
            <button class="btn btn-primary btn-details" style="width: 100%; border-radius: 4px; padding: 0.5rem;" data-id="${v.id}">Ver Detalles</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderCatalogs() {
    const autosCont = document.getElementById('autos-catalog');
    const motosCont = document.getElementById('motos-catalog');
    const recentCont = document.getElementById('home-recent');

    const autos = vehicles.filter(v => v.type === 'car');
    const motos = vehicles.filter(v => v.type === 'motorcycle');
    const recents = vehicles.filter(isVehicleNew).slice(0, 4);

    if (autosCont) autosCont.innerHTML = autos.map(createCardHTML).join('');
    if (motosCont) motosCont.innerHTML = motos.map(createCardHTML).join('');
    if (recentCont) recentCont.innerHTML = recents.map(createCardHTML).join('');

    // Attach Details events
    document.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        openModal(id);
      });
    });
  }

  renderCatalogs();

  // Home Services Render
  const services = window.services || [
  { title: 'Diagnóstico Computarizado', problem: '¿Luces en el tablero o fallas misteriosas?', solution: 'En EL RAYO detectamos la falla exacta con tecnología de punta en minutos.' },
  { title: 'Mantenimiento Preventivo', problem: '¿Quieres evitar reparaciones costosas?', solution: 'Cuidamos cada detalle para que tu vehículo nunca te deje a pie.' },
  { title: 'Reparación de Motores', problem: '¿Pérdida de potencia o ruidos extraños?', solution: 'Expertos certificados devuelven la vida y el rendimiento a tu motor.' }
];

  const servCont = document.getElementById('home-services');
  if (servCont) {
    servCont.innerHTML = services.map((s, i) => `
      <div class="service-card animate" style="animation-delay: ${i*0.2}s">
        <div class="service-icon">🔧</div>
        <h3>${s.title}</h3>
        <p class="service-problem"><strong>Problema:</strong> ${s.problem}</p>
        <p class="service-solution"><strong>Solución:</strong> ${s.solution}</p>
      </div>
    `).join('');
  }

  // --- MODAL DETAILS ---
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  document.getElementById('close-modal').addEventListener('click', () => {
    modal.classList.remove('active');
  });

  function openModal(id) {
    const v = vehicles.find(x => x.id === id);
    if (!v) return;

    let galleryHTML = '';
    if (v.gallery && v.gallery.length > 0) {
      galleryHTML = `
        <div class="vehicle-gallery" style="margin-top: 2rem;">
          <div class="main-image-container" style="aspect-ratio: 16/9; overflow:hidden; border-radius: 8px; margin-bottom: 1rem;">
            <img src="${v.gallery[0]}" id="modal-main-img" style="width:100%; height:100%; object-fit:cover;" />
          </div>
          <div class="thumbnails" style="display:flex; gap:10px; overflow-x:auto; padding-bottom:10px;">
            ${v.gallery.map(img => `<img src="${img}" class="thumb-img" style="width:80px; height:60px; object-fit:cover; cursor:pointer; border: 2px solid transparent; border-radius:4px;" />`).join('')}
          </div>
        </div>
      `;
    }

    const content = `
      <div style="background: #1a1a1a; padding: 2rem; border-radius: 8px; color: white;">
        <h1 style="color: #CFB53B; margin-bottom: 0.5rem;">${v.model}</h1>
        <div style="display:flex; gap:15px; margin-bottom: 1.5rem; flex-wrap: wrap;">
          <span style="background: #333; padding: 5px 10px; border-radius: 4px;">📅 ${v.year}</span>
          <span style="background: #333; padding: 5px 10px; border-radius: 4px;">⏱️ ${v.mileage}</span>
          <span style="background: #333; padding: 5px 10px; border-radius: 4px;">⚙️ ${v.engine}</span>
        </div>
        <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem; color: #ccc;">${v.description}</p>
        <div style="display:flex; justify-content: space-between; align-items: center; border-top: 1px solid #333; margin-top: 2rem; padding-top: 2rem;">
          <div>
            <span style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; color: #888;">Precio Inversión</span>
            <div style="font-size: 2.5rem; font-weight: bold; color: #CFB53B;">${v.price}</div>
          </div>
        </div>
        ${galleryHTML}
        <a href="https://wa.me/525652189129?text=Hola,%20me%20interesa%20el%20vehículo%20${v.model}" target="_blank" style="display:block; width:100%; text-align:center; background:#25D366; color:white; padding:1rem; border-radius:8px; text-decoration:none; font-weight:bold; font-size:1.1rem; margin-top:2rem;">
          Me interesa, enviar WhatsApp
        </a>
      </div>
    `;

    modalBody.innerHTML = content;
    modal.classList.add('active');

    // Attach thumbnail click events
    document.querySelectorAll('.thumb-img').forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        document.getElementById('modal-main-img').src = e.target.src;
      });
    });
  }

  // --- BOOKING FORM ---
  document.getElementById('booking-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('bf-name').value;
    const phone = document.getElementById('bf-phone').value;
    const type = document.getElementById('bf-type').value;
    const service = document.getElementById('bf-service').value;
    const date = document.getElementById('bf-date').value;
    const time = document.getElementById('bf-time').value;
    const notes = document.getElementById('bf-notes').value;

    const msg = `Hola EL RAYO,%0A%0AMe gustaría agendar una cita para mi ${type}.%0A%0A*Detalles de la cita:*%0A- Nombre: ${name}%0A- Teléfono: ${phone}%0A- Servicio: ${service}%0A- Fecha: ${date}%0A- Hora: ${time}%0A- Notas: ${notes || 'N/A'}`;
    const wUrl = `https://wa.me/525652189129?text=${msg}`;
    window.open(wUrl, '_blank');
  });

  // --- ADMIN LOGIN ---
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('login-password').value;
    if (pass === 'admin123') {
      sessionStorage.setItem('el_rayo_admin_auth', 'true');
      document.getElementById('login-password').value = '';
      document.getElementById('login-error').style.display = 'none';
      history.pushState(null, null, '#admin');
      showSection('admin');
    } else {
      document.getElementById('login-error').style.display = 'block';
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('el_rayo_admin_auth');
    showSection('login');
  });

  // --- ADMIN DASHBOARD ---
  let editId = null;
  let adminGallery = [];

  const cbNew = document.getElementById('admin-new');
  const divDur = document.getElementById('admin-duration-group');
  cbNew.addEventListener('change', () => {
    divDur.style.display = cbNew.checked ? 'block' : 'none';
  });

  document.getElementById('admin-gallery').addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    const available = 10 - adminGallery.length;
    files.slice(0, available).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        adminGallery.push(reader.result);
        renderAdminGallery();
      };
      reader.readAsDataURL(file);
    });
  });

  function renderAdminGallery() {
    const cont = document.getElementById('admin-gallery-preview');
    cont.innerHTML = adminGallery.map((img, i) => `
      <div style="position:relative; border:1px solid #333;">
        <img src="${img}" style="width:100%; aspect-ratio:1; object-fit:cover;" />
        <button type="button" class="remove-admin-img" data-idx="${i}" style="position:absolute; top:2px; right:2px; background:red; color:white; border:none; border-radius:50%; cursor:pointer;">&times;</button>
      </div>
    `).join('');

    document.querySelectorAll('.remove-admin-img').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-idx');
        adminGallery.splice(idx, 1);
        renderAdminGallery();
      });
    });
  }

  document.getElementById('admin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = {
      type: document.getElementById('admin-type').value,
      model: document.getElementById('admin-model').value,
      year: parseInt(document.getElementById('admin-year').value),
      price: document.getElementById('admin-price').value,
      engine: document.getElementById('admin-engine').value,
      mileage: document.getElementById('admin-mileage').value,
      description: document.getElementById('admin-desc').value,
      new: cbNew.checked,
      recentDuration: parseInt(document.getElementById('admin-duration').value || 30),
      gallery: [...adminGallery]
    };

    if (editId) {
      v.id = editId;
      const oldV = vehicles.find(x => x.id === editId);
      v.createdAt = oldV.createdAt || new Date().toISOString();
      vehicles = vehicles.map(x => x.id === editId ? v : x);
    } else {
      v.id = vehicles.length ? Math.max(...vehicles.map(x => x.id)) + 1 : 1;
      v.createdAt = new Date().toISOString();
      vehicles.push(v);
    }

    saveVehicles();
    renderCatalogs();
    renderAdminTable();
    resetAdminForm();
  });

  document.getElementById('admin-cancel-btn').addEventListener('click', resetAdminForm);

  window.editVehicle = function(id) {
    const v = vehicles.find(x => x.id === id);
    if(!v) return;
    editId = v.id;
    document.getElementById('admin-form-title').innerText = 'Editar Vehículo';
    document.getElementById('admin-type').value = v.type;
    document.getElementById('admin-model').value = v.model;
    document.getElementById('admin-year').value = v.year;
    document.getElementById('admin-price').value = v.price;
    document.getElementById('admin-engine').value = v.engine;
    document.getElementById('admin-mileage').value = v.mileage;
    document.getElementById('admin-desc').value = v.description;
    cbNew.checked = v.new;
    divDur.style.display = v.new ? 'block' : 'none';
    document.getElementById('admin-duration').value = v.recentDuration || 30;
    
    adminGallery = v.gallery ? [...v.gallery] : [];
    if(v.mainImage && adminGallery.length === 0) adminGallery.push(v.mainImage);
    renderAdminGallery();
    
    document.getElementById('admin-submit-btn').innerText = 'Guardar Cambios';
    document.getElementById('admin-cancel-btn').style.display = 'inline-block';
  }

  window.deleteVehicle = function(id) {
    if(confirm('¿Estás seguro de eliminar este vehículo?')) {
      vehicles = vehicles.filter(x => x.id !== id);
      saveVehicles();
      renderCatalogs();
      renderAdminTable();
    }
  }

  function resetAdminForm() {
    editId = null;
    document.getElementById('admin-form').reset();
    document.getElementById('admin-form-title').innerText = 'Agregar Nuevo Vehículo';
    document.getElementById('admin-submit-btn').innerText = 'Guardar';
    document.getElementById('admin-cancel-btn').style.display = 'none';
    cbNew.checked = false;
    divDur.style.display = 'none';
    adminGallery = [];
    renderAdminGallery();
  }

  function renderAdminTable() {
    document.getElementById('admin-count').innerText = vehicles.length;
    const tbody = document.getElementById('admin-tbody');
    tbody.innerHTML = vehicles.map(v => `
      <tr style="border-bottom: 1px solid #333;">
        <td style="padding: 10px;">${v.id}</td>
        <td style="padding: 10px;">${v.model}</td>
        <td style="padding: 10px;">${v.price}</td>
        <td style="padding: 10px;">
          <button class="btn btn-primary btn-sm" onclick="editVehicle(${v.id})" style="padding: 5px 10px;">✏️</button>
          <button class="btn btn-outline btn-sm" onclick="deleteVehicle(${v.id})" style="padding: 5px 10px; border-color:red; color:red;">🗑️</button>
        </td>
      </tr>
    `).join('');
  }
});
