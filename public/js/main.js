
const socket = io.connect();
socket.on('cargar amenidades', data => {
  cargarAmenidades(data);
});


function cargarAmenidades(data) {
  let html = '';
  for (i = 0; i < data.length; i++) {
    html += `<li>${data[i].name}</li>`;
  }
  document.getElementById('listaAmenidades').innerHTML = html;
}