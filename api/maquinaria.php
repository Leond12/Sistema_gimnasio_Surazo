<?php
require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action === 'read') {
        $stmt = $conn->prepare("
            SELECT m.*, t.nombre_tipo AS tipo_nombre 
            FROM maquinaria_inventario m 
            LEFT JOIN maquinaria_tipos t ON m.id_tipo = t.id_tipo
        ");
        $stmt->execute();
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        exit();
    }
}

require_once 'generic_crud.php';
$table = 'maquinaria_inventario';
$idField = 'id_maquina';
$columns = ['nombre_maquina', 'id_tipo', 'fecha_adquisicion', 'estado', 'ultimo_mantenimiento', 'observaciones'];
handleCrud($conn, $table, $columns, $idField);
?>
