<?php
require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action === 'read') {
        $stmt = $conn->prepare("
            SELECT a.*, s.nombre AS socio_nombre 
            FROM asistencias a 
            LEFT JOIN socios s ON a.id_socio = s.id_socio
        ");
        $stmt->execute();
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        exit();
    }
}

require_once 'generic_crud.php';
$table = 'asistencias';
$idField = 'id_asistencia';
$columns = ['id_socio', 'fecha_hora'];
handleCrud($conn, $table, $columns, $idField);
?>
