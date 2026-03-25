<?php
require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action === 'read') {
        $stmt = $conn->prepare("
            SELECT c.*, u.username AS instructor_nombre 
            FROM clases c 
            LEFT JOIN usuarios u ON c.id_instructor = u.id_usuario
        ");
        $stmt->execute();
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        exit();
    }
}

require_once 'generic_crud.php';
$table = 'clases';
$idField = 'id_clase';
$columns = ['nombre_clase', 'id_instructor', 'cupo_maximo', 'horario_inicio'];
handleCrud($conn, $table, $columns, $idField);
?>
