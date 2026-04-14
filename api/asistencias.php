<?php
require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'read') {
    $stmt = $conn->prepare("
        SELECT a.*, s.nombre, s.apellido, s.ci 
        FROM asistencias a 
        LEFT JOIN socios s ON a.id_socio = s.id_socio
        ORDER BY a.fecha_hora DESC
    ");
    $stmt->execute();
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit();
}
require_once 'generic_crud.php';
$table = 'asistencias';
$idField = 'id_asistencia';
$columns = ['id_socio', 'fecha_hora'];
handleCrud($conn, $table, $columns, $idField);
?>
