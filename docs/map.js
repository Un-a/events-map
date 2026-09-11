ymaps.ready(init);

let map;
let placemarks = [];

const colors = {
  saturday: '#e63946',
  sunday: '#457b9d'
};

const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

let currentDay = 'all';

function init() {
  map = new ymaps.Map('map', {
    center: [44.8176, 20.4569],
    zoom: 12,
    controls: []
  });

  map.controls.add('zoomControl', {
    position: { right: 20, bottom: 30 },
    size: 'small'
  });

  loadEvents();
}

function loadEvents() {
  fetch('./events.json')
    .then(r => r.json())
    .then(events => {
      const groups = new Map();

      events.forEach(event => {
        event.coords.forEach(coord => {
          const key = `${coord.lat},${coord.lng}`;
          if (!groups.has(key)) {
            groups.set(key, { lat: coord.lat, lng: coord.lng, address: coord.address, items: [] });
          }
          groups.get(key).items.push({
            name: event.name.trim(),
            url: event.url,
            day: event.day
          });
        });
      });

      groups.forEach(group => {
        const days = [...new Set(group.items.map(i => i.day))];

        const placemark = new ymaps.Placemark(
          [group.lat, group.lng],
          {},
          {
            iconLayout: 'default#image',
            iconImageHref: makeDotIcon(iconColorForDay(days, currentDay)),
            iconImageSize: [24, 24],
            iconImageOffset: [-12, -12],
            openBalloonOnClick: false
          }
        );

        placemark.days = days;
        placemark.groupData = group;

        placemark.events.add('click', () => {
          const filteredGroup = filterGroupByDay(group, currentDay);

          if (isMobile()) {
            openBottomSheet(filteredGroup);
          } else {
            placemark.properties.set({
              balloonContentHeader: filteredGroup.items.length > 1
                ? `${filteredGroup.items.length} мероприятия по этому адресу`
                : `<strong>${filteredGroup.items[0].name}</strong>`,
              balloonContentBody: buildEventsListHtml(filteredGroup)
            });
            placemark.balloon.open();
          }
        });

        placemarks.push(placemark);
        map.geoObjects.add(placemark);
      });
    });
}

function filterGroupByDay(group, day) {
  if (day === 'all') return group;
  return { ...group, items: group.items.filter(item => item.day === day) };
}

// Если выбран конкретный день и в точке есть событие на этот день — красим в его цвет,
// иначе (фильтр "Все" или день не совпал) берём первый день группы
function iconColorForDay(days, day) {
  return day !== 'all' && days.includes(day) ? day : days[0];
}

function buildEventsListHtml(group) {
  const dayLabel = day => (day === 'saturday' ? 'Сб' : 'Вс');

  const itemsHtml = group.items
    .map(item => `
      <strong>${item.name}</strong> (${dayLabel(item.day)})<br>
      <a href="${item.url}" target="_blank">Подробнее →</a>
    `)
    .join('<hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;">');

  return `
    📍 ${group.address}<br><br>
    ${itemsHtml}
    <br>
    <a href="https://www.google.com/maps/search/?api=1&query=${group.lat},${group.lng}" target="_blank">Google Maps →</a>
  `;
}

// ---- Bottom sheet для мобильных ----

function openBottomSheet(group) {
  const sheet = document.getElementById('bottom-sheet');
  const content = sheet.querySelector('.bottom-sheet-content');

  content.innerHTML = buildEventsListHtml(group);
  sheet.classList.add('open');
}

function closeBottomSheet() {
  document.getElementById('bottom-sheet').classList.remove('open');
}

// Генерируем цветную точку как data URL, аналог divIcon в Leaflet
function makeDotIcon(day) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.4"/>
        </filter>
      </defs>
      <circle cx="12" cy="12" r="7" fill="${colors[day]}" stroke="#fff" stroke-width="2" filter="url(#shadow)"/>
    </svg>
  `;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

function showDay(day) {
  currentDay = day;

  document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`btn-${day}`).classList.add('active');

  placemarks.forEach(placemark => {
    const shouldShow = day === 'all' || placemark.days.includes(day);
    const isOnMap = map.geoObjects.indexOf(placemark) !== -1;

    if (shouldShow) {
      placemark.options.set('iconImageHref', makeDotIcon(iconColorForDay(placemark.days, day)));
      if (!isOnMap) {
        map.geoObjects.add(placemark);
      }
    } else if (isOnMap) {
      map.geoObjects.remove(placemark);
    }
  });
}