<?php
require_once 'generic_crud.php';
$table = 'proveedores';
$idField = 'id_proveedor';
$columns = ['nombre_empresa', 'contacto_nombre', 'telefono', 'email', 'direccion'];
handleCrud($conn, $table, $columns, $idField);
?>
