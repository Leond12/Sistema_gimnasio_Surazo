<?php
require_once 'db.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS notificaciones (
        id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
        tipo VARCHAR(20) NOT NULL DEFAULT 'info',
        texto VARCHAR(255) NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        leida TINYINT(1) DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $conn->exec($sql);
    echo "Tabla 'notificaciones' creada o ya existía exitosamente.\n";
} catch(PDOException $e) {
    echo "Error creando la tabla: " . $e->getMessage() . "\n";
}
?>
