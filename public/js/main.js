
const socket = io.connect();
let globalData = {};
socket.on('info', data => {

  console.log(data);
  globalData = data;
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
    if (element._id.profile) {
      html += `Tipo de perfil: <span><i>${element._id.profile}</i></span> Cantidad: <span>${element.count}</span> <br>`;
    } else {
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
    if (element._id.phase) {
      html += `Fase: <span><i>${element._id.phase}</i></span> Cantidad: <span>${element.count}</span> <br>`;
    } else {
      html += `Fase: <span><i>String vacio</i></span> Cantidad: <span>${element.count}</span> <br>`;
    }

  });
  tracking_phase.innerHTML = html;
  html = "";

  document.getElementById("btnPdf").classList.remove("d-none");
  document.getElementById("btnExcel").classList.remove("d-none");
});


function generatePDF() {
  // Choose the element that our invoice is rendered in.
  const element = document.getElementById("contenido");
  // Choose the element and save the PDF for our user.

  const opciones = {
    filename: 'datos.pdf'
  }

  html2pdf()
    .set(opciones)
    .from(element)
    .save();
}

function generateExcel() {
  var wb = XLSX.utils.book_new();
  const str_vac = 'String vacio';
  wb.SheetNames.push("Datos");
  var ws_data = [
    ['Fecha:', globalData.Date],
    ['Numero de leads activos:',globalData.activeLeads[0].count],
    ['Numero de tracking:',globalData.noTracking[0].count],
    ['Fases de operacion'],
    ['Fase:',globalData.operationPhase[0]._id.operation_phase,'Cantidad:',globalData.operationPhase[0].count],
    ['Perfiles'],
    ['Tipo de perfil:',globalData.profile[0]._id.profile ? globalData.profile[0]._id.profile : str_vac, 'Cantidad:' ,globalData.profile[0].count],
    ['Tipo de perfil:',globalData.profile[1]._id.profile ? globalData.profile[1]._id.profile : str_vac, 'Cantidad:' ,globalData.profile[1].count],
    ['Tipo de perfil:',globalData.profile[2]._id.profile ? globalData.profile[2]._id.profile : str_vac, 'Cantidad:' ,globalData.profile[2].count],
    ['Tipo de perfil:',globalData.profile[3]._id.profile ? globalData.profile[3]._id.profile : str_vac, 'Cantidad:' ,globalData.profile[3].count],
    ['Leads pospuestos:',globalData.leadPostponed[0].count],
    ['Leads por fase'],
    ['Fase:',globalData.leadsByPhase[0]._id.phase,'Cantidad:',globalData.leadsByPhase[0].count],
    ['Fase:',globalData.leadsByPhase[1]._id.phase,'Cantidad:',globalData.leadsByPhase[1].count],
    ['Fase:',globalData.leadsByPhase[2]._id.phase,'Cantidad:',globalData.leadsByPhase[2].count],
    ['Fase:',globalData.leadsByPhase[3]._id.phase,'Cantidad:',globalData.leadsByPhase[3].count],
    ['Fases de tracking'],
    ['Fase:',globalData.tracking_phase[0]._id.phase ? globalData.tracking_phase[0]._id.phase : str_vac,'Cantidad:',globalData.tracking_phase[0].count],
    ['Fase:',globalData.tracking_phase[1]._id.phase ? globalData.tracking_phase[1]._id.phase : str_vac,'Cantidad:',globalData.tracking_phase[1].count],
    ['Fase:',globalData.tracking_phase[2]._id.phase ? globalData.tracking_phase[2]._id.phase : str_vac,'Cantidad:',globalData.tracking_phase[2].count],
    ['Fase:',globalData.tracking_phase[3]._id.phase ? globalData.tracking_phase[3]._id.phase : str_vac,'Cantidad:',globalData.tracking_phase[3].count],
    ['Fase:',globalData.tracking_phase[4]._id.phase ? globalData.tracking_phase[4]._id.phase : str_vac,'Cantidad:',globalData.tracking_phase[4].count],
    ['Fase:',globalData.tracking_phase[5]._id.phase ? globalData.tracking_phase[5]._id.phase : str_vac,'Cantidad:',globalData.tracking_phase[5].count],
    ['Fase:',globalData.tracking_phase[6]._id.phase ? globalData.tracking_phase[6]._id.phase : str_vac,'Cantidad:',globalData.tracking_phase[6].count],
    ['Fase:',globalData.tracking_phase[7]._id.phase ? globalData.tracking_phase[7]._id.phase : str_vac,'Cantidad:',globalData.tracking_phase[7].count],
    ['Fase:',globalData.tracking_phase[8]._id.phase ? globalData.tracking_phase[8]._id.phase : str_vac,'Cantidad:',globalData.tracking_phase[8].count],
  ];

  var ws = XLSX.utils.aoa_to_sheet(ws_data);
  wb.Sheets["Datos"] = ws;
  var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), 'datos.xlsx');
}

function s2ab(s) {

  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;

}