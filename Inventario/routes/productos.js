const express = require('express');
const router = express.Router();
const db = require('../db');


// OBTENER TODOS LOS PRODUCTOS
router.get('/', (req, res) => {

    db.query(
        'SELECT * FROM productos ORDER BY ID DESC',
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(results);
        }
    );

});


// OBTENER PRODUCTO POR ID
router.get('/:id', (req, res) => {

    db.query(
        'SELECT * FROM productos WHERE ID = ?',
        [req.params.id],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(result[0]);
        }
    );

});


// AGREGAR PRODUCTO
router.post('/', (req, res) => {

    const {
        nombre,
        precio,
        cantidad,
        imagen,
        fecha,
        descripcion
    } = req.body;

    db.query(
        `INSERT INTO productos
        (Nombre, Precio, Cantidad, imagen, Fecha, Descripción)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            nombre,
            precio,
            cantidad,
            imagen,
            fecha,
            descripcion
        ],
        (err) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                mensaje: 'Producto agregado'
            });

        }
    );

});


// EDITAR PRODUCTO
router.put('/:id', (req, res) => {

    const {
        nombre,
        precio,
        cantidad,
        imagen,
        fecha,
        descripcion
    } = req.body;

    db.query(
        `UPDATE productos
        SET
            Nombre = ?,
            Precio = ?,
            Cantidad = ?,
            imagen = ?,
            Fecha = ?,
            Descripción = ?
        WHERE ID = ?`,
        [
            nombre,
            precio,
            cantidad,
            imagen,
            fecha,
            descripcion,
            req.params.id
        ],
        (err) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                mensaje: 'Producto actualizado'
            });

        }
    );

});


// ELIMINAR PRODUCTO
router.delete('/:id', (req, res) => {

    db.query(
        'DELETE FROM productos WHERE ID = ?',
        [req.params.id],
        (err) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                mensaje: 'Producto eliminado'
            });

        }
    );

});

module.exports = router;