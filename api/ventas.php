<?php
require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action === 'read') {
        $stmt = $conn->prepare("
            SELECT v.*, s.nombre AS socio_nombre, u.username AS cajero_nombre 
            FROM ventas v 
            LEFT JOIN socios s ON v.id_socio = s.id_socio
            LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
        ");
        $stmt->execute();
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        exit();
    }
}

require_once 'generic_crud.php';
$table = 'ventas';
$idField = 'id_venta';
$columns = ['id_socio', 'id_usuario', 'total'];
handleCrud($conn, $table, $columns, $idField);
?>
