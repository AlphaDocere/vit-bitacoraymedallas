<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!isset($input['email'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Email es requerido"]);
    exit();
}

$email = trim($input['email']);
$status = isset($input['status']) ? trim($input['status']) : null;
$avatar = isset($input['avatar']) ? $input['avatar'] : null;
$generation = isset($input['generation']) ? (int)$input['generation'] : null;

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

    // Fetch user ID
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->bind_result($usuario_id);
    if (!$stmt->fetch()) {
        echo json_encode(["success" => false, "error" => "Usuario no encontrado"]);
        $stmt->close();
        $conn->close();
        exit();
    }
    $stmt->close();

    // Actualizar estado y/o avatar
    $queryParts = [];
    $params = [];
    $types = "";

    if ($status !== null) {
        $queryParts[] = "estado_personal = ?";
        $params[] = $status;
        $types .= "s";
    }
    if ($avatar !== null) {
        $queryParts[] = "avatar_url = ?";
        $params[] = $avatar;
        $types .= "s";
    }
    if ($generation !== null && $generation > 0) {
        // Obtenemos el id de la tabla generaciones correspondiente al numero (ej: 17, 18)
        // O si ya es el ID, lo guardamos. Asumiremos que el frontend envía el número de generación.
        // Como la DB tiene la tabla 'generaciones' con 'numero', vamos a buscar el id.
        $stmtGen = $conn->prepare("SELECT id FROM generaciones WHERE numero = ? LIMIT 1");
        $stmtGen->bind_param("i", $generation);
        $stmtGen->execute();
        $stmtGen->bind_result($genId);
        if ($stmtGen->fetch()) {
            $queryParts[] = "generacion_id = ?";
            $params[] = $genId;
            $types .= "i";
        }
        $stmtGen->close();
    }

    if (count($queryParts) > 0) {
        $params[] = $usuario_id;
        $types .= "i";
        
        $sql = "UPDATE usuarios SET " . implode(", ", $queryParts) . " WHERE id = ?";
        $upd = $conn->prepare($sql);
        $upd->bind_param($types, ...$params);
        $upd->execute();
        $upd->close();
    }

    $conn->close();

    echo json_encode(["success" => true, "message" => "Perfil actualizado correctamente"]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error"   => $e->getMessage()
    ]);
}
?>
