/*
 * Controlador
 */
var conection = require('./conexionbd.js');

function Controlador () {

}

var Controlador = {
    listarCompetencias: function (req, res) {
        var sql = "SELECT * FROM competencia";
        //se ejecuta la consulta
        conection.query(sql, function(error, resultado) {
            //si hubo un error, se informa y se envía un mensaje de error
            
            if (error || !resultado.length) {
                var errorMessage = error ? error.message : 'No existe un resultado.'
                console.log("Hubo un error en la consulta", errorMessage);
                return res.status(404).send("Hubo un error en la consulta");
            }
            //si no hubo error, se crea el objeto respuesta con las peliculas encontradas
            let competencia = []
            resultado.forEach(data => {
                return competencia.push(data)
            });

            //se envía la respuesta
            res.send(JSON.stringify(competencia));
        });
    },

    obtenerCompetencia: function(req, res) {
        var idCompetencia = req.params.id;
        var sql = `
            SELECT *, competencia.nombre as nombre, actor.nombre as actorNombre, director.nombre as directorNombre, genero.nombre as generoNombre FROM competencia
            LEFT JOIN actor ON competencia.actores_id = actor.id
            LEFT JOIN director ON competencia.directores_id = director.id
            LEFT JOIN genero ON competencia.genero_id = genero.id
            WHERE competencia.id=${idCompetencia}
        `;

        conection.query(sql, [idCompetencia], function(error, resultado) {
            if(error) {
                console.log('Hubo un error en la consulta', error.message);
                return res.status(500).send('Hubo un error en la consulta');
            };

        if(!idCompetencia) {
            console.log('La competencia no existe');
            return res.status(404).send('La competencia no existe.');
        };

        if(resultado.length <= 0) {
            console.log('La competencia no existe');
            return res.status(404).send('La competencia no existe');
          }

            return res.send(JSON.stringify(resultado[0]));
        })
    },

    obtenerPeliculasRandom: function (req, res) {
        var respuesta = {};
        var id = req.params.id;
        var sql = `SELECT * FROM competencia WHERE competencia.id=${id}`;
        conection.query(sql, function(error, resultado) {
            if(error) {
                console.log('Hubo un error en la consulta', error.message);
                return res.status(500).send('Hubo un error en la consulta');
            }
            if(resultado.length <= 0) {
                console.log('La competencia no existe');
                return res.status(404).send('La competencia no existe');
            }

            var competencia = resultado[0];
            var filters = [];
            var whereClause = '';

            if (competencia.genero_id > 0) {
                filters.push(`pelicula.genero_id=${competencia.genero_id}`);
            }

            if (competencia.actores_id > 0) {
                filters.push(`actor_pelicula.actor_id=${competencia.actores_id}`);
            }

            if (competencia.directores_id > 0) {
                filters.push(`director_pelicula.director_id=${competencia.directores_id}`);
            }

            if (filters.length > 0) {
                whereClause = `WHERE ${filters.join(' AND ')}`;
            }

            var peliculasSql = `
                SELECT DISTINCT pelicula.* FROM pelicula
                LEFT JOIN actor_pelicula ON actor_pelicula.pelicula_id = pelicula.id
                LEFT JOIN director_pelicula ON director_pelicula.pelicula_id = pelicula.id
                LEFT JOIN genero ON pelicula.genero_id = genero.id 
                ${whereClause} 
                ORDER BY RAND () LIMIT 2
            `;

            respuesta = {
                competencia: competencia,
            }

            conection.query(peliculasSql, function(errorPelis, resultadoPelis) {
                if(errorPelis) {
                    console.log('Hubo un error en la consulta', errorPelis.message);
                    return res.status(500).send('Hubo un error en la consulta errorPelis');
                }
                if(resultadoPelis.length <= 0) {
                    return res.status(404).send('No existen peliculas para esas condiciones');
                }
                if(resultadoPelis.length < 2) {
                    return res.status(404).send('No existen peliculas para esas condiciones');
                }

                respuesta.peliculas = resultadoPelis;
                res.send(JSON.stringify(respuesta));
            });
        })  
    },


    votarPelicula: function (req, res) {
        var idCompetencia = req.params.id;
        var idPelicula = req.body.idPelicula;
        var sql = 'INSERT INTO voto (competencia_id, pelicula_id) VALUES (' + idCompetencia + ', ' + idPelicula + ')';
        conection.query(sql, function(error, resultado) {
            if(error) {
                console.log('Hubo un error al registrar el voto.', error.message);
                return res.status(500).send('Hubo un error al registrar el voto.');
            };
            if(!idCompetencia) {
                return res.status(500).send('La competencia no existe');
            };
            if(!idPelicula) {
                return res.status(500).send('La pelicula no existe');
            }; 
            
            respuesta = {
                'idPelicula': resultado.id
            }

            res.send(JSON.stringify(respuesta));

        })
    },

    obtenerResultados: function (req, res) {
        var id = req.params.id;
        var sql = ` SELECT competencia.nombre, pelicula.id, pelicula.titulo, pelicula.poster, 
                    COUNT(voto.pelicula_id) AS votos 
                    FROM competencia
                    JOIN voto ON voto.competencia_id = competencia.id 
                    JOIN pelicula ON voto.pelicula_id = pelicula.id
                    WHERE competencia.id = ` + id + `
                    GROUP BY pelicula.id
                    ORDER BY votos DESC
                    LIMIT 3;`
      
        conection.query(sql, function(error, resultado) {
          if(error) {
            console.log('Hubo un error en la consulta', error.message);
            return res.status(500).send('Hubo un error en la consulta');
          };
          // Si la competencia no ha recibido votos devolvemos el mensaje correspondiente
          if(!resultado || resultado.length == 0) {
            console.log('Esta competencia todavia no ha recibido votos.');
            return res.status(422).send('Esta competencia todavia no ha recibido votos');
          } else {
            var respuesta = {
              competencia: resultado[0].nombre,
              resultados: resultado,
            }

            res.status(200).send(JSON.stringify(respuesta));
          }
        })
    },

    crearCompetencia: function (req, res) {
        var genero = req.body.genero
        var actor = req.body.actor
        var director = req.body.director
        var nombre = req.body.nombre

        var sql = 'INSERT INTO competencia (nombre, genero_id, actores_id, directores_id) VALUES ("' + nombre + '", ' + genero + ', ' + actor + ', ' + director + ')';
        conection.query(sql, function(error, resultado) {
            if (error) {
                console.log('Hubo un error en la consulta', error.message);
                return res.status(500).send('Hubo un error en la consulta');
            } if (!req.body.nombre || nombre === '') {
                return res.status(422).send('El campo nombre no puede estar vacio');
            } if (!resultado || resultado.length <= 0 ) {
                return res.status(404).send('No se creo la pelicula');
            } 

            var respuesta = {
                'competencia': nombre,
                'genero': genero,
                'actor': actor,
                'director': director,
            }

            return res.status(200).send(JSON.stringify(respuesta));
        
        })
    },

    listarGeneros: function (req, res) {
        var sql = `SELECT * FROM genero`;
        conection.query(sql, function(error, resultado) {
            if(error) {
                console.log('Hubo un error en la consulta', error.message);
                return res.status(500).send('Hubo un error en la consulta');
            }

            respuesta = {
                'generos': resultado,
            }

            res.status(200).send(JSON.stringify(resultado));

        })
    },


    listarActores: function (req, res) {
        var sql = `SELECT * FROM actor`;
        conection.query(sql, function(error, resultado) {
            if(error) {
                console.log('Hubo un error en la consulta', error.message);
                return res.status(500).send('Hubo un error en la consulta');
            }

            respuesta = {
                'actores': resultado,
            }

            res.status(200).send(JSON.stringify(resultado));

        })
    },


    listarDirectores: function (req, res) {
        var sql = `SELECT * FROM director`;
        conection.query(sql, function(error, resultado) {
            if(error) {
                console.log('Hubo un error en la consulta', error.message);
                return res.status(500).send('Hubo un error en la consulta');
            }

            respuesta = {
                'directores': resultado,
            }

            res.status(200).send(JSON.stringify(resultado));

        })
    },

    reiniciarVotos: function(req, res) {
    var idCompetencia = req.params.id;
    var sql = `DELETE FROM voto WHERE competencia_id=${idCompetencia}`;
    conection.query(sql, [idCompetencia], function(error) {
        if(error) {
            return res.status(500).send('No se encuentra la competencia');
        };
            return res.status(200).send('Votos reiniciados');
        })
    },

    eliminarCompetencia: function(req, res) {
        var idCompetencia = req.params.id;
        var sql = `DELETE FROM competencia WHERE id=${idCompetencia}`;
        conection.query(sql, [idCompetencia], function(error) {
            if(error) {
                return res.status(500).send('No se encuentra la competencia');
            } else if(!idCompetencia) {
                return res.status(404).send('La competencia no existe.');
            } else {
                return res.status(200).send('Competencia eliminada');
            }
        })
    },

    editarCompetencia: function(req, res) {
        var idCompetencia = req.params.id;

        var updates = [];

        if (req.body.nombre) {
            updates.push(`nombre="${req.body.nombre}"`);
        }

        if (req.body.genero) {
            updates.push(`genero_id=${req.body.genero}`);
        }

        if (req.body.actor) {
            updates.push(`actores_id=${req.body.actor}`);
        }

        if (req.body.director) {
            updates.push(`directores_id=${req.body.director}`);
        }

        var sql = `UPDATE competencia SET ${updates.join(', ')} WHERE id=${idCompetencia}`;

        conection.query(sql, [idCompetencia], function(error, resultado) {
            if(error) {
                return res.status(500).send('No existe la competencia que quieres editar')
            } else if(!idCompetencia) {
                console.log('La competencia no existe');
                return res.status(404).send('La competencia no existe.');
            } else if(!req.body.nombre) {
                return res.status(422).send('El campo nombre no puede estar vacio');
            } else {
                respuesta = {
                    'competencia': resultado,
                }
                return res.status(200).send(JSON.stringify(respuesta));
            }
        })
    }
}

module.exports = {
    Controlador
}
