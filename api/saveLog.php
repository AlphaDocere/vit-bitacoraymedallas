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

if (!$data || !isset($data['email']) || !isset($data['hechoHoy'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Datos incompletos."]);
    exit();
}

try {
    $conn = getVitDbConnection();
    
    // Buscar el ID del usuario en alphadocere_Vit
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $data['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if (!$user) {
        throw new Exception("Usuario no encontrado en la base de datos.");
    }
    
    $usuario_id = $user['id'];
    
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
        throw new Exception("Error al insertar: " . $stmt2->error);
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
$conn->close();
?>
