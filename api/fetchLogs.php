<?php
/**
 * fetchLogs.php — Kreative Vit
 * Endpoint AUTÓNOMO y blindado para PHP 8.3+
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// Desactivar excepciones automáticas de mysqli para controlarlas manualmente
mysqli_report(MYSQLI_REPORT_OFF);

// ── Leer .env manualmente ─────────────────────────────────────────────────────
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
    // Buscar .env en la raíz (un nivel arriba de /api)
    $envPath = dirname(dirname(__FILE__)) . '/.env';
    $env     = loadEnv($envPath);

    // ── Credenciales de alphadocere_Vit ──────────────────────────────────────────
    $host = $env['DB_HOST_VIT'] ?? $env['DB_HOST'] ?? 'localhost';
    $user = $env['DB_USER_VIT'] ?? $env['DB_USER'] ?? 'root';
    $pass = $env['DB_PASS_VIT'] ?? $env['DB_PASS'] ?? '';
    $name = $env['DB_NAME_VIT'] ?? 'alphadocere_Vit';
    $port = (int)($env['DB_PORT_VIT'] ?? $env['DB_PORT'] ?? 3306);

    // ── Conectar ──────────────────────────────────────────────────────────────────
    $conn = @new mysqli($host, $user, $pass, $name, $port);
    if (!$conn || $conn->connect_error) {
        throw new Exception("Error de conexión a la base de datos: " . ($conn ? $conn->connect_error : "No se pudo instanciar mysqli"));
    }
    $conn->set_charset("utf8mb4");

    // ── 1. Bitácoras ─────────────────────────────────────────────────────────────
    $bitacoras = [];
    $rBit = $conn->query("
        SELECT
            b.id,
            u.nombre        AS user,
            u.nombre        AS practicante,
            b.fecha         AS fecha,
            b.hecho_hoy     AS hechoHoy,
            b.hacer_manana  AS hacerManana,
            b.estado_animo  AS mood,
            b.necesita_ayuda AS ayuda,
            b.desc_ayuda    AS ayudaDesc,
            b.palabras_count AS palabrasCount
        FROM bitacoras b
        JOIN usuarios u ON b.usuario_id = u.id
        ORDER BY b.fecha DESC, b.id DESC
    ");
    if ($rBit) {
        while ($row = $rBit->fetch_assoc()) {
            $row['ayuda'] = (bool)$row['ayuda'];
            $bitacoras[]  = $row;
        }
    }

    // ── 2. Insignias por usuario ─────────────────────────────────────────────────
    $userBadges = [];
    $rBadge = $conn->query("
        SELECT u.nombre AS username, i.insignia_id
        FROM insignias_desbloqueadas i
        JOIN usuarios u ON i.usuario_id = u.id
    ");
    if ($rBadge) {
        while ($row = $rBadge->fetch_assoc()) {
            $uname = $row['username'];
            if (!isset($userBadges[$uname])) $userBadges[$uname] = [];
            $userBadges[$uname][] = (int)$row['insignia_id'];
        }
    }

    // ── 3. Fellows (usuarios activos) ────────────────────────────────────────────
    $fellows = [];
    $rUsers = $conn->query("
        SELECT
            u.nombre        AS username,
            COALESCE(g.numero, 17) AS generation,
            COALESCE(u.estado_personal, '¡Practicando en Kreative Vit!') AS status,
            u.avatar_url    AS avatar
        FROM usuarios u
        LEFT JOIN generaciones g ON u.generacion_id = g.id
        WHERE u.activo = 1
    ");
    if ($rUsers) {
        while ($row = $rUsers->fetch_assoc()) {
            $uname           = $row['username'];
            $row['badges']   = $userBadges[$uname] ?? [];
            $row['streak']   = 0;
            $row['totalLogs'] = 0;
            $fellows[]       = $row;
        }
    }

    $conn->close();

    echo json_encode([
        "success"   => true,
        "bitacoras" => $bitacoras,
        "fellows"   => $fellows,
        "debug"     => [
            "db"              => $name,
            "env_found"       => file_exists($envPath),
            "bitacoras_count" => count($bitacoras),
            "fellows_count"   => count($fellows),
            "badge_users"     => array_keys($userBadges)
        ]
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error"   => $e->getMessage(),
        "debug"   => [
            "env_path" => $envPath ?? null,
            "env_exists" => isset($envPath) ? file_exists($envPath) : false
        ]
    ]);
}
?>
