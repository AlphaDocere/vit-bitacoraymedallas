<?php
/**
 * syncUser.php — Kreative Vit
 * Endpoint llamado desde el frontend justo después de un login exitoso.
 * Se encarga de garantizar que el usuario exista en la BD local alphadocere_Vit
 * y registrar su sesión en sesiones_log.
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// Leer los datos POST enviados en formato JSON
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!isset($input['email']) || !isset($input['nombre'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Datos incompletos (requiere email y nombre)"]);
    exit();
}

$email = trim($input['email']);
$nombre = trim($input['nombre']);
// El client_id del sistema de auth externo
$client_id = isset($input['client_id']) ? (int)$input['client_id'] : 0; 
$rol = isset($input['rol']) ? trim($input['rol']) : 'usuario';

// DEBUG LOGGING PARA VER QUÉ ESTÁ ENVIANDO EL FRONTEND (Y POR ENDE SYSTEMAUTH)
file_put_contents('sync_debug.log', date('Y-m-d H:i:s') . " - RECIBIDO PARA $email: " . json_encode($input) . "\n", FILE_APPEND);

mysqli_report(MYSQLI_REPORT_OFF);

function loadEnv($path) {
    if (!file_exists($path)) return [];
    $vars = [];
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        if (strpos($line, '=') === false) continue;
        [$key, $value] = explode('=', $line, 2);
        $vars[trim($key)] = trim($value, " \t\n\r\0\x0B\"'");
    }
    return $vars;
}

try {
    $envPath = dirname(dirname(__FILE__)) . '/.env';
    $env     = loadEnv($envPath);

    $host = $env['DB_HOST_VIT'] ?? $env['DB_HOST'] ?? 'localhost';
    $user = $env['DB_USER_VIT'] ?? $env['DB_USER'] ?? 'root';
    $pass = $env['DB_PASS_VIT'] ?? $env['DB_PASS'] ?? '';
    $name = $env['DB_NAME_VIT'] ?? 'alphadocere_Vit';
    $port = (int)($env['DB_PORT_VIT'] ?? $env['DB_PORT'] ?? 3306);

    $conn = @new mysqli($host, $user, $pass, $name, $port);
    if (!$conn || $conn->connect_error) {
        throw new Exception("Error de conexión a la BD");
    }
    $conn->set_charset("utf8mb4");

    // 1. Verificar si el usuario existe
    $stmt = $conn->prepare("SELECT id, rol FROM usuarios WHERE email = ? OR client_id = ? LIMIT 1");
    $stmt->bind_param("si", $email, $client_id);
    $stmt->execute();
    $stmt->bind_result($db_id, $db_rol);
    
    $usuarioRow = null;
    if ($stmt->fetch()) {
        $usuarioRow = ['id' => $db_id, 'rol' => $db_rol];
    }
    $stmt->close();

    $usuario_id = null;
    $local_rol = 'usuario';

    if ($usuarioRow) {
        $usuario_id = $usuarioRow['id'];
        $local_rol = $usuarioRow['rol'] ? $usuarioRow['rol'] : 'usuario';
        
        // Sincronizar el rol desde system_auth (excepto si el rol local es 'lider')
        if ($local_rol !== 'lider' && $rol !== $local_rol) {
            $local_rol = $rol;
        }

        // Actualizamos nombre, client_id y rol
        $upd = $conn->prepare("UPDATE usuarios SET nombre = ?, client_id = IF(client_id = 0 OR client_id IS NULL, ?, client_id), rol = ? WHERE id = ?");
        $upd->bind_param("sisi", $nombre, $client_id, $local_rol, $usuario_id);
        $upd->execute();
        $upd->close();
    } else {
        // Obtener generación activa para asignarla
        $generacion_id = null;
        $genStmt = $conn->query("SELECT id FROM generaciones WHERE activa = 1 ORDER BY id DESC LIMIT 1");
        if ($genRow = $genStmt->fetch_assoc()) {
            $generacion_id = $genRow['id'];
        }

        $estado_personal = "¡Iniciando mi viaje en Kreative Vit! 🚀";
        // Asignar el rol entregado por system_auth
        $local_rol = $rol;

        $ins = $conn->prepare("INSERT INTO usuarios (client_id, nombre, email, generacion_id, rol, estado_personal, fecha_ingreso) VALUES (?, ?, ?, ?, ?, ?, CURDATE())");
        $ins->bind_param("ississ", $client_id, $nombre, $email, $generacion_id, $local_rol, $estado_personal);
        $ins->execute();
        
        if ($ins->error) {
            throw new Exception("Error al insertar usuario: " . $ins->error);
        }
        $usuario_id = $ins->insert_id;
        $ins->close();
    }

    // 2. Registrar sesión en sesiones_log
    if ($usuario_id) {
        $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'Desconocida';
        if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            $ip_address = $_SERVER['HTTP_CF_CONNECTING_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip_address = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        }

        $user_agent = substr($_SERVER['HTTP_USER_AGENT'] ?? 'Desconocido', 0, 255);
        $accion = 'login';

        $logStmt = $conn->prepare("INSERT INTO sesiones_log (usuario_id, ip_address, user_agent, accion) VALUES (?, ?, ?, ?)");
        $logStmt->bind_param("isss", $usuario_id, $ip_address, $user_agent, $accion);
        $logStmt->execute();
        $logStmt->close();
    }

    $conn->close();
    echo json_encode(["success" => true, "usuario_id" => $usuario_id, "rol" => $local_rol]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
