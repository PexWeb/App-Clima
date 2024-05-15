////////////////////////////////////////////BARRA DE BUSQUEDA////////////////////////////////

const barraBusqueda = document.querySelector('#barraBusqueda');
const btnBuscar = document.querySelector('#btnBuscar');

////////////////////////////////////////////CLIMA////////////////////////////////////////////
const ahora = document.querySelector('#ahora');
const localizacion = document.querySelector('#localización');
const descripcionClima = document.querySelector('#descripciónClima');
const viento = document.querySelector('#viento');
const temperatura = document.querySelector('#temperatura');
const uv = document.querySelector('#uv');
const precipitaciones = document.querySelector('#precipitaciones');
const imagenClima = document.querySelector('#imagenClima');

////////////////////////////////////////////CONTENEDORES/////////////////////////////////////
const contenedorHoras = document.querySelector('#horas');
const contenedorDias = document.querySelector('#dias');
const contenedorMensaje = document.querySelector('#contenedor-mensaje');

////////////////////////////////////////////VARIABLES/////////////////////////////////////////
let localizacionAnterior = '';
let cargando = false;

////////////////////////////////////////////EVENTOS//////////////////////////////////////////
window.addEventListener('load',()=>{//Espera a que la ventana del navegador haya terminado de cargar todo los recursos
    btnBuscar.addEventListener('click',(event)=>{
        event.preventDefault();//previene el evento por defecto que es cargar la pagina
        if(barraBusqueda.value!=''){
            if(!cargando){
                buscarPorNombre(barraBusqueda.value);//si se ingreso un nombre lo buscaremos
            }            
        }
    })   
    mostrarIconosCarga();
    if(navigator.geolocation){//Verifica si el navegador admite la API de geolocalización
        obtenerLocalizacionActual()//Esta funcion busca la localizacion actual del usuario y devulve una promesa
        .then(loc=>{//Se ejcuta si se cumplio la promesa y pasamos la localizacion
            obtenerDetallesClima(loc.latitude, loc.longitude);//Llamamos la funcion obtener ubicacion y mandamos la latitud y longitud
        })
        .catch(() => {
            obtenerDetallesClima();//Obtenemos el clima por defecto
        });
    }else{
        obtenerDetallesClima();//Obtenemos el clima por defecto
    }
})

function obtenerLocalizacionActual(){//Obtiene la localizacion actual del usuario
    return new Promise((resolve,reject)=>{
        const options = {
            enableHighAccuracy: true,//Establece que se proporcionara una mejor precisión en la localización
            timeout: 5000,//Establece cuanto tiempo esta dispuesto a esperar para obtner la localización
            maximumAge: 0,//Especifica cuánto tiempo (en milisegundos) la ubicación puede ser almacenada en caché antes de que se considere obsoleta y se solicite una nueva ubicación. Esta en 0 porque no se alamcenara en el caché.
        };          
        function success(pos) {//Se llama si la obtencion de la localización fue exitosa. pos Representa la posición del usuario.
            const crd = pos.coords;//Datos de la ubicacion del usuario (latitud, longitud, cordenadas, etc)          
            resolve(crd);
        }          
        function error(err) {//Se llama si ocurrio un error  en la obtencion de la localización
            console.warn(`ERROR(${err.code}): ${err.message}`);
            reject(err);
        }          
        navigator.geolocation.getCurrentPosition(success, error, options);//Obtenemos la localización  
    })    
}

function obtenerDetallesClima(lat,lon,ubicacion){
    obtenerDatosDesdeAPI(lat,lon)
    .then(function(datos){
        cargarDatosActuales(datos,ubicacion);      
    })
    .catch(error =>{
        console.log('Ha ocurrido un erro: '+error);
    })
}

function cargarDatosActuales(datos,ubicacion){
    eliminarIconosCarga();
    mostrarDatosPrincipales("Ahora",datos.current.temp_c,ubicacion,datos.current.condition.text,datos.current.wind_kph,datos.current.uv,datos.current.precip_mm,datos.current.condition.icon,datos);

    const diaActual = datos.forecast.forecastday[0];//Obtiene el dia actual
    const horas = diaActual.hour;//Obtiene las horas para el dia actual
    cargarDias(datos,ubicacion);//Carga el listado de dias
    cargarHoras(horas);//Carga el listado de horas
}

function cargarDatosDia(datos,diaViendo,ubicacion){//Carga los datos del dia seleccionado
    const diaActual = datos.forecast.forecastday[diaViendo];//Obtiene el dia seleccionado
    const fecha = new Date(diaActual.date);  //Obtiene la fecha del dia seleccionado
    mostrarDatosPrincipales(obtenerNombreDia(fecha)+' '+fecha.getUTCDate(),diaActual.day.maxtemp_c,ubicacion,diaActual.day.condition.text,diaActual.day.maxwind_kph,diaActual.day.uv,diaActual.day.totalprecip_mm,diaActual.day.condition.icon,datos);
    const horas = diaActual.hour;//Obtiene las horas del dia seleccionado
    cargarDias(datos,ubicacion);//Carga el listado de dias
    cargarHoras(horas);//carga el listado de horas para el dia seleccionado
}

function cargarDias(datos,ubicacion){//carga el listado de dias
    const dias = datos.forecast.forecastday;//Obtiene todos los dias
    let contDias = 0;//Cuenta cuantos dias va a haber
    eliminarDiasCargados();
        dias.forEach(element => {//Recorre el array de dias y carga los datos
            const dia = document.createElement('DIV');
            const fecha = new Date(element.date);  
            let contenido = '<h3>'+obtenerNombreDia(fecha)+' '+fecha.getUTCDate()+'</h3>';//Creo el contenido del div
            contenido += '<img src="'+element.day.condition.icon+'" alt="Icono resumen clima">';
            contenido += '<div class="termometro-contenedor">';
            contenido +=  '<p>'+Math.round(element.day.mintemp_c) + ' C°'+'</p>'
            contenido += '<div class="barra-termometro"></div>';
            contenido += '<p>'+Math.round(element.day.maxtemp_c) + ' C°'+'</p>';
            contenido += '</div>';
            dia.innerHTML = contenido;
            dia.classList.add('dia');
            dia.setAttribute('data-id', contDias);
            dia.addEventListener('click',() =>{//Agrega el evento al dia cuando hagamos click
                if(esHoy(element.date)){// Si el dia seleccionado es el de hoy
                    cargarDatosActuales(datos,ubicacion);//Se muestra el clima actual
                }else{
                    cargarDatosDia(datos,dia.getAttribute('data-id'),ubicacion);//Se muestra el resumen del clima del dia seleccionado
                }
            });
            contenedorDias.appendChild(dia);//Añade el dia a la pagina  
            contDias++;//Aumenta el conte de dias totales 
        });
        if(contDias<14){//revisa si se cargaron menos de 14 dias para añadir 5 dias de relleno sin contenido (Esto lo hago porque la version gratis de la API solo muestra 3 dias)
            for (let index = 0; index < 6 ; index++) {
                const dia = document.createElement('DIV');
                dia.classList.add('dia');
                dia.classList.add('no-disponible');
                contenedorDias.appendChild(dia); 
            }
        }        
}

function cargarHoras(horas){//Cargamos el listado de horas para un dia en especifico
    eliminarHorasCargadas();
    horas.forEach(element => {//Recorre el array de horas y carga sus datos en la pagina
        const hora = document.createElement('DIV'); 
        
        const tiempoExacto = new Date(element.time);
        let tiempoHora = tiempoExacto.getHours();
        let tiempoMinuto = tiempoExacto.getMinutes();
        if (tiempoHora < 10) {
            tiempoHora = '0' + tiempoHora;
          }
          if (tiempoMinuto < 10) {
            tiempoMinuto = '0' + tiempoMinuto;
          }
        let contenido = '<h3>'+tiempoHora+":"+tiempoMinuto+'</h3>';//Creo el contenido para las horas
        contenido += '<img src="'+element.condition.icon+'" alt="Icono resumen clima">';
        contenido += '<p>'+Math.round(element.temp_c) + ' C°'+'</p>';   
        
        hora.innerHTML = contenido;
        hora.classList.add('hora');
        contenedorHoras.appendChild(hora);//Agrega las horas a la pagina
    });    
}

function buscarPorNombre(location){//busca una localizacion por su nombre
    mostrarIconosCarga();
    let apiUrl = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(location);//Obtenemos la localizacion por medio de la API

    fetch(apiUrl)//Hacemos una solicitud get a la URL 
    .then(response =>{
        return response.json()//Convertimos los datos recibidos de la solicitud en un archivo json
    })
    .then(data => {//Tomamos los datos recibidos
        if (data) {//Verificamos que se hayan recibido datos
            let ubicacion = data[0].name;
            let latitude = data[0].lat;
            let longitude = data[0].lon;
            obtenerDetallesClima(latitude,longitude,ubicacion);
        }else {
            mostrarMensaje("No se encontraron resultados"); 
        }
    })
    .catch(error => {
      mostrarMensaje("No se encontraron resultados"); 
      eliminarIconosCarga();
      buscarPorNombre(localizacionAnterior);
    });
}

function formatearFecha(fecha){//Ayuda a formatear la fecha al formato correcto
    const fechaAPI = fecha;
    const [año, mes, dia] = fechaAPI.split('-');
    return new Date(año, mes - 1, dia);
}

function obtenerNombreDia(fecha){//obtiene el nombre de un dia especificado
    const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado","domingo"];
    const numeroDia = fecha.getDay(); // Esto devuelve un número entre 0 y 6
    return diasSemana[numeroDia];
}

function esHoy(fecha){//Revisa si la fecha enviada es la de hoy
    // Obtener la fecha actual
    const fechaActual = new Date();
    // Comparar si la fecha dada es igual a la fecha actual
    const fechaDada = new Date(fecha);
    if (
    fechaDada.getUTCDate() === fechaActual.getDate() &&
    fechaDada.getMonth() === fechaActual.getMonth() &&
    fechaDada.getFullYear() === fechaActual.getFullYear()
    ) {
        return true;
    } else {
        return false;
    }
}

function mostrarDatosPrincipales(ahoraTexto,temp,ubicacion,descripcion,vientoValor,uvValor,precipitacionesValor,icono,datos){
    ahora.textContent = ahoraTexto;
    temperatura.textContent = Math.round(temp) + ' C°';//Redondeamos la temperatura
    if(ubicacion!=null){//Si se paso el nombre de la ubicacion
        localizacion.textContent =ubicacion;//Mostramos el nombre de la ubicación
        localizacionAnterior = ubicacion;
    }else{
        localizacion.textContent =datos.location.name;//Mostramos el nombre de la ubicación obtenido por medio de la api
        localizacionAnterior = datos.location.name;
    }            
    descripcionClima.textContent = descripcion;//Mostramos la descripcioón del tiempo
    viento.textContent = vientoValor+ " km/h";//Mostramos la velocidad del viento
    uv.textContent = uvValor;
    precipitaciones.textContent = precipitacionesValor+'mm';
    imagenClima.setAttribute('src',icono);
}

function mostrarIconosCarga(){
    cargando = true;
    eliminarDiasCargados();
    for (let index = 0; index < 14 ; index++) {
        const dia = document.createElement('DIV');
        dia.classList.add('dia');
        dia.classList.add('cargando');
        dia.innerHTML = '<img class="icono-carga" src="build/img/loading-icon.gif" alt="Icono resumen clima">';
        contenedorDias.appendChild(dia); 
    }
    eliminarHorasCargadas();
    for (let index = 0; index < 24 ; index++) {
        const hora = document.createElement('DIV');
        hora.classList.add('hora');
        hora.classList.add('cargando');
        hora.innerHTML = '<img class="icono-carga" src="build/img/loading-icon.gif" alt="Icono resumen clima">';
        contenedorHoras.appendChild(hora); 
    }    
    ahora.textContent = '';
    temperatura.textContent = '';
    localizacion.textContent ='';        
    descripcionClima.textContent = '';
    viento.textContent = '';
    uv.textContent = '';
    precipitaciones.textContent = '';
    imagenClima.setAttribute('src','build/img/loading-icon.gif');
}
function eliminarIconosCarga(){
    cargando = false;
    const iconosCarga = document.querySelectorAll('.cargando');
    iconosCarga.forEach(element => {//Elimina todos los dias ya cargados
        element.remove();
    });
}
function eliminarDiasCargados(){
    const diasAntiguos = document.querySelectorAll('.dia');//Obtiene todos los dias cargados en la pagina
    diasAntiguos.forEach(element => {//Elimina todos los dias ya cargados
        element.remove();
    });
}
function eliminarHorasCargadas(){
    const horasAntiguos = document.querySelectorAll('.hora');//Obtiene todas las horas ya cargadas en la pagina
    horasAntiguos.forEach(element => {//Elimina todas las horas ya cargadas en la pagina
        element.remove();
    });
}

function mostrarMensaje(mensaje) {
    let contenido = '<div class="mensaje">';
    contenido += '<p>'+mensaje+'</p>';
    contenido += '</div>';
    contenedorMensaje.innerHTML = contenido;    
    // Utiliza setTimeout para mostrar el mensaje por 7 segundos
    setTimeout(function() {
        eliminarMensaje();
    }, 7000); 
  }

function eliminarMensaje(){
    const mensaje = document.querySelector('.mensaje');
    if(mensaje!=null){
        mensaje.remove();
    }
}

function obtenerDatosDesdeAPI(lat,lon){
    //Creación de objeto con la información 
    const ubicacion = {
        latitud: lat,
        longitud: lon
    }

    //Hacer solicitud HTTP
    return fetch('php/obtenerDatosTiempo.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ubicacion)
    })
    .then(response => {//Manejar respuesta del servidor
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(data => {//Retornar datos obtenidos
            return data; 
        })
        .catch(error => {
            console.error('Hubo un problema con la solicitud:', error);
            throw error; 
        });
}