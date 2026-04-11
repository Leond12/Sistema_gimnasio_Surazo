<?php
require_once 'generic_crud.php';

$table = 'socios';
$idField = 'id_socio';
$columns = ['nombre', 'apellido', 'ci', 'email', 'telefono'];

handleCrud($conn, $table, $columns, $idField);
?>
