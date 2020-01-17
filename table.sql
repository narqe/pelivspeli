CREATE TABLE `competencia` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(70) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
);

INSERT INTO `competencia` 
VALUES (1,'¿Cual es tu película favorita?',0,0,0),
(2,'¿Cual de estas pelis se estrenó primero?',0,0,0),
(3,'¿Con que pelicula te reiste mas?',0,0,0),
(4,'¿Que pelicula viste mas veces?',0,0,0);

ALTER TABLE pelicula
ADD votos int(11) NOT NULL;

CREATE TABLE `voto` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `pelicula_id` int(11) NOT NULL,
  `competencia_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
);

ALTER TABLE competencia
  ADD genero_id int(11) NOT NULL;
ALTER TABLE competencia
  ADD actores_id int(11) NOT NULL;
ALTER TABLE competencia
  ADD directores_id int(11) NOT NULL;

