<?php
//Cargar dependencias
require '../vendor/autoload.php';

//Cargar variable de entorno 
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ .'/..');
$dotenv->load();

//Obtener la api key desde la variable de entorno
$apiKey = $_ENV['API_KEY'];

//Obtener datos enviados desde HTTP y decodificar archivo JSON
$ubicacion = json_decode(file_get_contents("php://input"));

//Almacenamos la informacion
$latitud = $ubicacion -> latitud ?? null;
$longitud = $ubicacion -> longitud ?? null;

//Crear url para obtener información desde la api
$url = 'https://api.weatherapi.com/v1/forecast.json?key='.$apiKey.'&q=';

//Si se mando latitud y longitud se buscan los datos para esa localización, si no se mando se carga una ubicación por defecto
if($latitud !=null){
    $url .= urlencode($latitud . ' ' . $longitud) . '&days=14&aqi=no&alerts=no&lang=es';
}else{
    $url .= 'london&days=14&aqi=no&alerts=no&lang=es'; 
}

//Se hace una solicitud get a la url y almacena su resultado
$response = file_get_contents($url);

if ($response === false) {
    die('Error al obtener los datos de la API');
}
//Mandar el resultado
echo $response;