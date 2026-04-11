<?php
// api/notificaciones.php
require_once 'db.php';
header('Content-Type: application/json');

try {
    // Auto-crear tabla notificaciones si no existe (robusto para el server remoto)
    $conn->exec("CREATE TABLE IF NOT EXISTS notificaciones (
        id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
        tipo VARCHAR(20) NOT NULL DEFAULT 'info',
        texto VARCHAR(255) NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        leida TINYINT(1) DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        // Obtener recientes y no leidas primero
        $stmt = $conn->query("SELECT * FROM notificaciones ORDER BY leida ASC, fecha_creacion DESC LIMIT 50");
        $notificaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'data' => $notificaciones]);
        exit();
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $action = $data['action'] ?? '';

        if ($action === 'create') {
            $tipo = $data['tipo'] ?? 'info';
            $texto = $data['texto'] ?? '';
            
            $stmt = $conn->prepare("INSERT INTO notificaciones (tipo, texto) VALUES (?, ?)");
            $stmt->execute([$tipo, $texto]);
            echo json_encode(['success' => true]);
            exit();
        }

        if ($action === 'mark_read') {
            $id = $data['id'] ?? null;
            if ($id) {
                $stmt = $conn->prepare("UPDATE notificaciones SET leida = 1 WHERE id_notificacion = ?");
                $stmt->execute([$id]);
            }
            echo json_encode(['success' => true]);
            exit();
        }

        if ($action === 'mark_all_read') {
            $conn->exec("UPDATE notificaciones SET leida = 1");
            echo json_encode(['success' => true]);
            exit();
        }

        if ($action === 'delete') {
            $id = $data['id'] ?? null;
            if ($id) {
                $stmt = $conn->prepare("DELETE FROM notificaciones WHERE id_notificacion = ?");
                $stmt->execute([$id]);
            }
            echo json_encode(['success' => true]);
            exit();
        }
    }

} catch(PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
