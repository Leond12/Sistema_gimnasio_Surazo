<?php
require_once 'generic_crud.php';

$table = 'productos';
$idField = 'id_producto';
$columns = ['nombre_producto', 'descripcion', 'precio_venta', 'stock_actual', 'stock_minimo'];

handleCrud($conn, $table, $columns, $idField);
?>
