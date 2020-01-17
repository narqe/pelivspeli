//paquetes necesarios para el proyecto
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var controlador = require('./controlador');
var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

//seteamos el puerto en el cual va a escuchar los pedidos la aplicación
var puerto = '8080';

app.listen(puerto, function () {
  console.log( "Escuchando en el puerto " + puerto );
});

app.get('/generos', controlador.Controlador.listarGeneros);
app.get('/directores', controlador.Controlador.listarDirectores);
app.get('/actores', controlador.Controlador.listarActores);
app.get('/competencias/:id/peliculas', controlador.Controlador.obtenerPeliculasRandom);
app.post('/competencias/:id/voto', controlador.Controlador.votarPelicula);
app.get('/competencias/:id/resultados', controlador.Controlador.obtenerResultados);
app.get("/competencias/:id", controlador.Controlador.obtenerCompetencia);
app.post('/competencias', controlador.Controlador.crearCompetencia);
app.get('/competencias', controlador.Controlador.listarCompetencias);
app.put('/competencias/:id', controlador.Controlador.editarCompetencia);
app.delete('/competencias/:id/votos', controlador.Controlador.reiniciarVotos);
app.delete('/competencias/:id', controlador.Controlador.eliminarCompetencia);