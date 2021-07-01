
const socket = io.connect();
socket.on('cargar amenidades', data => {
  
  console.log(data);
  const fecha = document.getElementById('fecha');
  const activeLeads = document.getElementById('activeLeads');
  const noTracking = document.getElementById('noTracking');
  const operationPhase = document.getElementById('operationPhase');
  const profile = document.getElementById('profile');
  const leadPostponed = document.getElementById('leadPostponed');
  const leadsByPhase = document.getElementById('leadsByPhase');
  const tracking_phase = document.getElementById('tracking_phase');

  let html = "";

  fecha.innerHTML = data.Date;
  activeLeads.innerHTML = data.activeLeads[0].count;
  noTracking.innerHTML = data.noTracking[0].count;
  
  data.operationPhase.forEach(element => {
    html += `Fase: <span><i>${element._id.operation_phase}</i></span> Cantidad: <span>${element.count}</span> <br>`;
  });
  operationPhase.innerHTML = html;
  html = "";

  data.profile.forEach(element => {
    if(element._id.profile){
      html += `Tipo de perfil: <span><i>${element._id.profile}</i></span> Cantidad: <span>${element.count}</span> <br>`;
    }else{
      html += `Tipo de perfil: <span><i>String vacio</i></span> Cantidad: <span>${element.count}</span> <br>`;
    }
    
  });
  profile.innerHTML = html;
  html = "";

  leadPostponed.innerHTML = data.leadPostponed[0].count;
  
  data.leadsByPhase.forEach(element => {
    html += `Fase: <span><i>${element._id.phase}</i></span> Cantidad: <span>${element.count}</span> <br>`;
  });
  leadsByPhase.innerHTML = html;
  html = "";

  data.tracking_phase.forEach(element => {
    if(element._id.phase){
      html += `Fase: <span><i>${element._id.phase}</i></span> Cantidad: <span>${element.count}</span> <br>`;
    } else{
      html += `Fase: <span><i>String vacio</i></span> Cantidad: <span>${element.count}</span> <br>`;
    }
    
  });
  tracking_phase.innerHTML = html;
  html = "";
});


// function cargarAmenidades(data) {
//   let html = '';
//   for (i = 0; i < data.length; i++) {
//     html += `<li>${data[i].name}</li>`;
//   }
//   document.getElementById('listaAmenidades').innerHTML = html;
// }