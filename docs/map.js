ymaps.ready(init);

let map;
let placemarks = [];

const colors = {
  saturday: '#e63946',
  sunday: '#457b9d'
};

const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

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
      events.forEach(event => {
        event.coords.forEach(coord => {
          const eventData = {
            name: event.name.trim(),
            address: coord.address,
            url: event.url,
            lat: coord.lat,
            lng: coord.lng
          };

          const placemark = new ymaps.Placemark(
            [coord.lat, coord.lng],
            {
              balloonContentHeader: `<strong>${eventData.name}</strong>`,
              balloonContentBody: `
                📍 ${eventData.address}<br>
                <a href="${eventData.url}" target="_blank">Подробнее →</a><br>
                <a href="https://www.google.com/maps/search/?api=1&query=${eventData.lat},${eventData.lng}" target="_blank">Google Maps →</a>
              `
            },
            {
              iconLayout: 'default#image',
              iconImageHref: makeDotIcon(event.day),
              iconImageSize: [24, 24],
              iconImageOffset: [-12, -12],
              openBalloonOnClick: false
            }
          );

          placemark.day = event.day;
          placemark.eventData = eventData;

          placemark.events.add('click', () => {
            if (isMobile()) {
              openBottomSheet(eventData);
            } else {
              placemark.balloon.open();
            }
          });

          placemarks.push(placemark);
          map.geoObjects.add(placemark);
        });
      });
    });
}

function openBottomSheet(data) {
  const sheet = document.getElementById('bottom-sheet');
  const content = sheet.querySelector('.bottom-sheet-content');

  content.innerHTML = `
    <strong>${data.name}</strong><br>
    📍 ${data.address}<br>
    <a href="${data.url}" target="_blank">Подробнее →</a><br>
    <a href="https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lng}" target="_blank">Google Maps →</a>
  `;

  sheet.classList.add('open');
}

function closeBottomSheet() {
  document.getElementById('bottom-sheet').classList.remove('open');
}

function makeDotIcon(day) {
  const color = colors[day];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.4"/>
        </filter>
      </defs>
      <circle cx="12" cy="12" r="7" fill="${color}" stroke="#fff" stroke-width="2" filter="url(#shadow)"/>
    </svg>
  `;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

function showDay(day) {
  document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`btn-${day}`).classList.add('active');

  placemarks.forEach(placemark => {
    const shouldShow = day === 'all' || placemark.day === day;
    const isOnMap = map.geoObjects.indexOf(placemark) !== -1;

    if (shouldShow && !isOnMap) {
      map.geoObjects.add(placemark);
    } else if (!shouldShow && isOnMap) {
      map.geoObjects.remove(placemark);
    }
  });
}