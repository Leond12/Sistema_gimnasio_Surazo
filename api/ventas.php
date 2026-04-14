<?php
require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'read') {
    $stmt = $conn->prepare("
        SELECT v.*, s.nombre, s.apellido, u.username as cajero_nombre 
        FROM ventas v 
        LEFT JOIN socios s ON v.id_socio = s.id_socio
        LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
        ORDER BY v.fecha_venta DESC
    ");
    $stmt->execute();
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit();
}
require_once 'generic_crud.php';
$table = 'ventas';
$idField = 'id_venta';
$columns = ['id_socio', 'id_usuario', 'total', 'fecha_venta'];
handleCrud($conn, $table, $columns, $idField);
?>
