<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';

// Leer payload JSON
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || (!isset($data['email']) && !isset($data['user'])) || !isset($data['hechoHoy'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Datos incompletos."]);
    exit();
}

try {
    $conn = getVitDbConnection();
    
    // DEBUG LOG
    file_put_contents(__DIR__ . '/debug_saveLog.txt', date('Y-m-d H:i:s') . " - PAYLOAD: " . $json . "\n", FILE_APPEND);
    
    $email = $data['email'] ?? '';
    $userName = $data['user'] ?? '';
    
    // Buscar el ID del usuario en alphadocere_Vit
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE (email = ? AND email != '') OR (nombre = ? AND nombre != '') LIMIT 1");
    $stmt->bind_param("ss", $email, $userName);
    $stmt->execute();
    $stmt->bind_result($usuario_id);
    $found = $stmt->fetch();
    $stmt->close();
    
    if (!$found) {
        throw new Exception("Usuario no encontrado en la base de datos.");
    }
    
    // Insertar la bitácora
    $stmt2 = $conn->prepare("INSERT INTO bitacoras (usuario_id, fecha, hecho_hoy, hacer_manana, estado_animo, necesita_ayuda, desc_ayuda, palabras_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    $fecha = $data['fecha']; // YYYY-MM-DD
    $hechoHoy = $data['hechoHoy'];
    $hacerManana = $data['hacerManana'] ?? '';
    $estadoAnimo = $data['mood'] ?? 'bien';
    $necesitaAyuda = isset($data['ayuda']) && $data['ayuda'] ? 1 : 0;
    $descAyuda = $data['ayudaDesc'] ?? null;
    $palabrasCount = (int)($data['palabrasCount'] ?? 0);
    
    $stmt2->bind_param("issssssi", $usuario_id, $fecha, $hechoHoy, $hacerManana, $estadoAnimo, $necesitaAyuda, $descAyuda, $palabrasCount);
    
    if ($stmt2->execute()) {
        echo json_encode(["success" => true, "message" => "Bitácora guardada permanentemente en MySQL."]);
    } else {
        $err = "Error al insertar: " . $stmt2->error;
        file_put_contents(__DIR__ . '/debug_saveLog.txt', date('Y-m-d H:i:s') . " - ERROR: " . $err . "\n", FILE_APPEND);
        throw new Exception($err);
    }

} catch (Throwable $e) {
    file_put_contents(__DIR__ . '/debug_saveLog.txt', date('Y-m-d H:i:s') . " - EXCEPTION: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
$conn->close();
?>
