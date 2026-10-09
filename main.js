const menuItems = [
  { id: 'greatest-1', category: 'greatest', name: 'The Greatest Combo', description: 'Add a short description here', price: null },
  { id: 'trad-1', category: 'traditional', name: 'Add item name', description: 'Add a short description here', price: null },
  { id: 'trad-2', category: 'traditional', name: 'Add item name', description: 'Add a short description here', price: null },
  { id: 'trad-3', category: 'traditional', name: 'Add item name', description: 'Add a short description here', price: null },
  { id: 'trad-4', category: 'traditional', name: 'Add item name', description: 'Add a short description here', price: null },
  { id: 'sides-1', category: 'sides', name: 'Add item name', description: 'Add a short description here', price: null },
  { id: 'sides-2', category: 'sides', name: 'Add item name', description: 'Add a short description here', price: null },
  { id: 'sides-3', category: 'sides', name: 'Add item name', description: 'Add a short description here', price: null },
  { id: 'sides-4', category: 'sides', name: 'Add item name', description: 'Add a short description here', price: null },
  { id: 'drinks-1', category: 'drinks', name: 'Add item name', description: 'Add a short description here', price: null },
  { id: 'drinks-2', category: 'drinks', name: 'Add item name', description: 'Add a short description here', price: null },
  { id: 'drinks-3', category: 'drinks', name: 'Add item name', description: 'Add a short description here', price: null }
];

const businessHours = {
  0: { label: 'Sunday', periods: [] },
  1: { label: 'Monday', periods: [[990, 1260]] },
  2: { label: 'Tuesday', periods: [[720, 840], [990, 1260]] },
  3: { label: 'Wednesday', periods: [[720, 840], [990, 1260]] },
  4: { label: 'Thursday', periods: [[720, 840], [990, 1260]] },
  5: { label: 'Friday', periods: [[720, 840], [990, 1260]] },
  6: { label: 'Saturday', periods: [[720, 840], [990, 1260]] }
};

const galleryImages = [
  { id: '1565708409704-dd6416e94c20', alt: 'Freshly cooked golden chips' },
  { id: '1523950300486-6be20a1b1f60', alt: 'A fish and chips shop sign' },
  { id: '1695266392242-d4e9ab8daa0b', alt: 'Food frying in a pan' }
];

function unsplashUrl(id, width) {
  return 'https://images.unsplash.com/photo-' + id + '?q=80&w=' + width + '&auto=format&fit=crop';
}

function formatClock(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function getLondonParts() {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/London',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  });
  const parts = fmt.formatToParts(new Date());
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  let weekday = 0, hour = 0, minute = 0;
  parts.forEach(function (part) {
    if (part.type === 'weekday') weekday = dayMap[part.value];
    if (part.type === 'hour') hour = parseInt(part.value, 10) % 24;
    if (part.type === 'minute') minute = parseInt(part.value, 10);
  });
  return { weekday: weekday, minutes: hour * 60 + minute };
}

function getStatus() {
  const now = getLondonParts();
  const today = businessHours[now.weekday];
  const yesterday = businessHours[(now.weekday + 6) % 7];

  for (let i = 0; i < today.periods.length; i++) {
    const start = today.periods[i][0];
    const end = today.periods[i][1];
    if (start <= end) {
      if (now.minutes >= start && now.minutes < end) {
        return { open: true, changesAt: formatClock(end), changeLabel: 'today' };
      }
    } else if (now.minutes >= start || now.minutes < end) {
      return { open: true, changesAt: formatClock(end), changeLabel: 'tomorrow' };
    }
  }

  for (let i = 0; i < yesterday.periods.length; i++) {
    const start = yesterday.periods[i][0];
    const end = yesterday.periods[i][1];
    if (start > end && now.minutes < end) {
      return { open: true, changesAt: formatClock(end), changeLabel: 'today' };
    }
  }

  for (let offset = 0; offset < 8; offset++) {
    const dayIndex = (now.weekday + offset) % 7;
    const day = businessHours[dayIndex];
    for (let i = 0; i < day.periods.length; i++) {
      const start = day.periods[i][0];
      if (offset === 0 && start <= now.minutes) continue;
      return {
        open: false,
        changesAt: formatClock(start),
        changeLabel: offset === 0 ? 'today' : day.label
      };
    }
  }

  return { open: false, changesAt: null, changeLabel: null };
}

function renderStatus() {
  const status = getStatus();
  const pill = document.getElementById('status-pill');
  const detail = document.getElementById('status-detail');

  if (status.open) {
    pill.textContent = 'Open now';
    pill.classList.add('is-open');
    pill.classList.remove('is-closed');
    if (detail) {
      detail.textContent = status.changesAt ? 'Open now, closes ' + status.changeLabel + ' at ' + status.changesAt + '.' : 'Open now.';
    }
  } else {
    pill.textContent = 'Closed';
    pill.classList.add('is-closed');
    pill.classList.remove('is-open');
    if (detail) {
      detail.textContent = status.changesAt ? 'Closed now, opens ' + status.changeLabel + ' at ' + status.changesAt + '.' : 'Closed.';
    }
  }

  const now = getLondonParts();
  document.querySelectorAll('.hours-table tr').forEach(function (row) {
    row.classList.toggle('is-today', parseInt(row.dataset.day, 10) === now.weekday);
  });
}

function renderMenu(category) {
  const panel = document.getElementById('menu-panel');
  panel.innerHTML = '';
  const isFeatured = category === 'greatest';
  panel.classList.toggle('menu-grid-featured', isFeatured);
  menuItems
    .filter(function (item) { return item.category === category; })
    .forEach(function (item) {
      const card = document.createElement('article');
      card.className = isFeatured ? 'menu-item menu-item-featured' : 'menu-item';
      const priceLabel = item.price ? item.price : 'Price TBC';
      const badge = isFeatured ? '<span class="menu-item-badge">Signature dish</span>' : '';
      card.innerHTML =
        '<div>' + badge + '<p class="menu-item-name">' + item.name + '</p>' +
        '<p class="menu-item-desc">' + item.description + '</p></div>' +
        '<span class="menu-item-price">' + priceLabel + '</span>';
      panel.appendChild(card);
    });
}

function setupMenuTabs() {
  const tabs = Array.from(document.querySelectorAll('.menu-tab'));
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      activateTab(tabs, index);
    });
    tab.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (index + direction + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
        activateTab(tabs, nextIndex);
      }
    });
  });
  const initialIndex = tabs.findIndex(function (tab) { return tab.getAttribute('aria-selected') === 'true'; });
  activateTab(tabs, initialIndex === -1 ? 0 : initialIndex);
}

function activateTab(tabs, activeIndex) {
  tabs.forEach(function (tab, index) {
    const isActive = index === activeIndex;
    tab.setAttribute('aria-selected', String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });
  const activeTab = tabs[activeIndex];
  document.getElementById('menu-panel').setAttribute('aria-labelledby', activeTab.id);
  renderMenu(activeTab.dataset.category);
}

function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  galleryImages.forEach(function (image) {
    const img = document.createElement('img');
    img.src = unsplashUrl(image.id, 900);
    img.alt = image.alt;
    img.width = 900;
    img.height = 1125;
    img.loading = 'lazy';
    img.decoding = 'async';
    grid.appendChild(img);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setupMenuTabs();
  renderGallery();
  renderStatus();
  setInterval(renderStatus, 60000);
});