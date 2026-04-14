<?php
// api/planes.php
require_once 'db.php';

$action = $_GET['action'] ?? '';

if ($action === 'read') {
    try {
        $stmt = $conn->prepare("SELECT * FROM planes ORDER BY nombre_plan ASC");
        $stmt->execute();
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Fallback to generic CRUD for create/update/delete if needed
require_once 'generic_crud.php';
$columns = ['nombre_plan', 'descripcion', 'precio', 'duracion_dias'];
handleCrud($conn, 'planes', $columns, 'id_plan');
?>
