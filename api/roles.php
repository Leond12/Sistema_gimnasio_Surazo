<?php
require_once 'generic_crud.php';

$table = 'roles';
$idField = 'id_rol';
$columns = ['nombre_rol'];

handleCrud($conn, $table, $columns, $idField);
?>
