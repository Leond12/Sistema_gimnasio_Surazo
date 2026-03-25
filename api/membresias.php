<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Custom READ for membresias to pull relations
if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action === 'read') {
        $stmt = $conn->prepare("
            SELECT m.*, s.nombre AS socio_nombre, p.nombre_plan AS plan_nombre 
            FROM membresias m 
            LEFT JOIN socios s ON m.id_socio = s.id_socio 
            LEFT JOIN planes p ON m.id_plan = p.id_plan
        ");
        $stmt->execute();
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        exit();
    }
}

// Fallback to generic handle for Creates/Updates/Deletes
require_once 'generic_crud.php';
$table = 'membresias';
$idField = 'id_membresia';
$columns = ['id_socio', 'id_plan', 'fecha_inicio', 'fecha_vencimiento', 'estado'];

handleCrud($conn, $table, $columns, $idField);
?>
