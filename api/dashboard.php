<?php
// api/dashboard.php
require_once 'db.php';
header('Content-Type: application/json');

try {
    $data = [];

    // 1. Socios Activos (Total de socios registrados)
    $stmt = $conn->query("SELECT COUNT(*) AS total FROM socios");
    $data['socios_activos'] = $stmt->fetch()['total'];

    // 2. Membresías Activas
    $stmt = $conn->query("SELECT COUNT(*) AS total FROM membresias WHERE estado = 'activa'");
    $data['membresias_activas'] = $stmt->fetch()['total'];

    // 3. Ventas de Hoy
    $stmt = $conn->query("SELECT COALESCE(SUM(total), 0) AS total_hoy FROM ventas WHERE DATE(fecha_venta) = CURDATE()");
    $data['ventas_hoy'] = $stmt->fetch()['total_hoy'];

    // 4. Asistencias de Hoy
    $stmt = $conn->query("SELECT COUNT(*) AS total FROM asistencias WHERE DATE(fecha_hora) = CURDATE()");
    $data['asistencias_hoy'] = $stmt->fetch()['total'];

    // 5. Datos para el Gráfico (Últimos 7 días)
    // Generar los últimos 7 días
    $chartData = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $displayDate = date('d/m', strtotime("-$i days"));

        // Ventas de ese día
        $stmtVentas = $conn->prepare("SELECT COALESCE(SUM(total), 0) AS total FROM ventas WHERE DATE(fecha_venta) = ?");
        $stmtVentas->execute([$date]);
        $ventas = (float)$stmtVentas->fetch()['total'];

        // Asistencias de ese día
        $stmtAsist = $conn->prepare("SELECT COUNT(*) AS total FROM asistencias WHERE DATE(fecha_hora) = ?");
        $stmtAsist->execute([$date]);
        $asistencias = (int)$stmtAsist->fetch()['total'];

        $chartData[] = [
            'fecha' => $displayDate,
            'fecha_full' => $date,
            'ventas' => $ventas,
            'asistencias' => $asistencias
        ];
    }
    
    $data['chart_data'] = $chartData;
    
    // Devolver un flag de éxito
    echo json_encode(['success' => true, 'data' => $data]);

} catch(PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>
