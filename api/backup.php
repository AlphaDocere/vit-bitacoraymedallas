<?php
/**
 * Script de copia de seguridad de la base de datos (Kreative Vit)
 * Genera un archivo .sql en la raíz del proyecto.
 */

header("Content-Type: text/plain; charset=UTF-8");

require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->safeLoad();

// Seguridad: Solo permitir ejecución por línea de comandos (Cron) o con el token correcto
$isCli = (php_sapi_name() === 'cli');
$secretToken = $_ENV['ADMIN_VIT_SECRET'] ?? 'Joseph_vit';
$providedToken = $_GET['token'] ?? '';

if (!$isCli && $providedToken !== $secretToken) {
    http_response_code(403);
    die("Acceso denegado. Si accedes por navegador, debes proporcionar el token: ?token=TU_SECRETO");
}

// Configuración de la base de datos
$host = $_ENV['DB_HOST_VIT'] ?? $_ENV['DB_HOST'] ?? 'localhost';
$user = $_ENV['DB_USER_VIT'] ?? $_ENV['DB_USER'] ?? 'root';
$pass = $_ENV['DB_PASS_VIT'] ?? $_ENV['DB_PASS'] ?? '';
$name = $_ENV['DB_NAME_VIT'] ?? 'alphadocere_Vit';
$port = (int)($_ENV['DB_PORT_VIT'] ?? 3306);

// Directorio de destino: la raíz del proyecto (un nivel arriba de /api)
$backupDir = dirname(__DIR__); 
$date = date('Y-m-d_H-i-s');

// Añadimos un pequeño hash al nombre del archivo por seguridad para evitar descargas no autorizadas
$hash = substr(md5(uniqid()), 0, 6);
$fileName = "backup_vit_{$date}_{$hash}.sql";
$backupFile = $backupDir . '/' . $fileName;

try {
    mysqli_report(MYSQLI_REPORT_OFF);
    $mysqli = new mysqli($host, $user, $pass, $name, $port);
    if ($mysqli->connect_error) {
        throw new Exception("Error de conexión: " . $mysqli->connect_error);
    }
    $mysqli->set_charset("utf8mb4");

    $tables = [];
    $result = $mysqli->query("SHOW TABLES");
    if (!$result) {
        throw new Exception("Error al obtener tablas: " . $mysqli->error);
    }
    
    while ($row = $result->fetch_row()) {
        $tables[] = $row[0];
    }

    $sqlScript = "-- Copia de seguridad de Kreative Vit\n";
    $sqlScript .= "-- Fecha de generación: " . date('Y-m-d H:i:s') . "\n";
    $sqlScript .= "-- Base de datos: {$name}\n\n";
    $sqlScript .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

    foreach ($tables as $table) {
        $result = $mysqli->query("SHOW CREATE TABLE `$table`");
        $row = $result->fetch_row();
        $sqlScript .= "\n\nDROP TABLE IF EXISTS `$table`;\n";
        $sqlScript .= $row[1] . ";\n\n";

        $result = $mysqli->query("SELECT * FROM `$table`");
        $columnCount = $result->field_count;

        while ($row = $result->fetch_row()) {
            $sqlScript .= "INSERT INTO `$table` VALUES(";
            for ($j = 0; $j < $columnCount; $j++) {
                if (isset($row[$j])) {
                    $escaped = $mysqli->real_escape_string($row[$j]);
                    $sqlScript .= "'" . $escaped . "'";
                } else {
                    $sqlScript .= "NULL";
                }
                if ($j < ($columnCount - 1)) {
                    $sqlScript .= ",";
                }
            }
            $sqlScript .= ");\n";
        }
    }
    
    $sqlScript .= "\nSET FOREIGN_KEY_CHECKS=1;\n";
    $mysqli->close();
    
    // Guardar el archivo en la raíz
    if (file_put_contents($backupFile, $sqlScript) === false) {
        throw new Exception("No se pudo escribir el archivo en la ruta: $backupFile");
    }

    // Limpieza automática: mantener solo los últimos 5 backups para no llenar el almacenamiento
    $files = glob($backupDir . '/backup_vit_*.sql');
    if (is_array($files) && count($files) > 5) {
        // Ordenar por fecha de modificación descendente
        usort($files, function($a, $b) {
            return filemtime($b) - filemtime($a);
        });
        
        $filesToDelete = array_slice($files, 5);
        foreach ($filesToDelete as $file) {
            @unlink($file);
        }
        echo "Limpieza: se eliminaron " . count($filesToDelete) . " backups antiguos.\n";
    }

    echo "✅ Copia de seguridad creada exitosamente en la raíz del proyecto.\n";
    echo "Nombre del archivo: " . $fileName . "\n";

} catch (Exception $e) {
    http_response_code(500);
    echo "❌ Error al crear la copia de seguridad: " . $e->getMessage();
}
