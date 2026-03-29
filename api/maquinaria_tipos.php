<?php
require_once 'generic_crud.php';
$table = 'maquinaria_tipos';
$idField = 'id_tipo';
$columns = ['nombre_tipo'];
handleCrud($conn, $table, $columns, $idField);
?>
