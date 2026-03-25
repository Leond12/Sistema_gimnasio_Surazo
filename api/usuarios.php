<?php
require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action === 'read') {
        $stmt = $conn->prepare("
            SELECT u.id_usuario, u.username, u.id_rol, u.estado, r.nombre_rol AS roles_nombre 
            FROM usuarios u 
            LEFT JOIN roles r ON u.id_rol = r.id_rol
        ");
        $stmt->execute();
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        exit();
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $action = $data['action'] ?? '';

    if ($action === 'create') {
        $pass = isset($data['password']) && !empty($data['password']) ? password_hash($data['password'], PASSWORD_DEFAULT) : password_hash('123456', PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO usuarios (username, password, id_rol, estado) VALUES (:user, :pass, :rol, :estado)");
        try {
            $stmt->execute([
                ':user' => $data['username'],
                ':pass' => $pass,
                ':rol' => $data['id_rol'] ?? null,
                ':estado' => $data['estado'] ?? 1
            ]);
            echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    if ($action === 'update') {
        $id = $data['id'] ?? null;
        if (!$id) { echo json_encode(['success' => false, 'error' => 'Missing ID']); exit(); }
        
        $sql = "UPDATE usuarios SET username = :user, id_rol = :rol, estado = :estado";
        $params = [
            ':id' => $id,
            ':user' => $data['username'],
            ':rol' => $data['id_rol'] ?? null,
            ':estado' => $data['estado'] ?? 1
        ];

        if (isset($data['password']) && !empty($data['password'])) {
            $sql .= ", password = :pass";
            $params[':pass'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        $sql .= " WHERE id_usuario = :id";

        $stmt = $conn->prepare($sql);
        try {
            $stmt->execute($params);
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    if ($action === 'delete') {
        $id = $data['id'] ?? null;
        if ($id) {
            $stmt = $conn->prepare("DELETE FROM usuarios WHERE id_usuario = :id");
            try {
                $stmt->execute([':id' => $id]);
                echo json_encode(['success' => true]);
            } catch(PDOException $e) {
                echo json_encode(['success' => false, 'error' => 'No se puede eliminar, el usuario está en uso']);
            }
        }
    }
}
?>
