<?php
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"));
if (!$data || !isset($data->action) || $data->action !== 'login') {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit();
}

$username = $data->username;
$password = $data->password;

$stmt = $conn->prepare("SELECT u.*, r.nombre_rol FROM usuarios u LEFT JOIN roles r ON u.id_rol = r.id_rol WHERE u.username = :user LIMIT 1");
$stmt->execute([':user' => $username]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    if ($user['estado'] == 1) {
        unset($user['password']); // Don't send hash to frontend
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Cuenta desactivada']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Credenciales incorrectas']);
}
?>
