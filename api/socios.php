<?php
require_once 'generic_crud.php';

$table = 'socios';
$idField = 'id_socio';
$columns = ['nombre', 'apellido', 'dni', 'email', 'telefono'];

handleCrud($conn, $table, $columns, $idField);
?>
