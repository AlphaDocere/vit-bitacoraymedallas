<?php
// Desactivar excepciones automáticas de mysqli para controlarlas manualmente
mysqli_report(MYSQLI_REPORT_OFF);

require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Cargar variables de entorno desde la raíz del proyecto Kreative Vit
$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

function getAuthDbConnection() {
    $host = $_ENV['DB_HOST_AUTH'] ?? 'localhost';
    $user = $_ENV['DB_USER_AUTH'] ?? 'root';
    $pass = $_ENV['DB_PASS_AUTH'] ?? '';
    $name = $_ENV['DB_NAME_AUTH'] ?? 'alphadocere_auth_system';
    $port = $_ENV['DB_PORT_AUTH'] ?? 3306;

    $conn = @new mysqli($host, $user, $pass, $name, $port);
    if (!$conn || $conn->connect_error) {
        throw new Exception("Error de conexión a BD Auth: " . ($conn ? $conn->connect_error : "No se pudo instanciar mysqli"));
    }
    $conn->set_charset("utf8mb4");
    return $conn;
}

// ── Conexión a alphadocere_Vit (bitácoras, insignias, usuarios del dashboard) ──
function getVitDbConnection() {
    $host = $_ENV['DB_HOST_VIT'] ?? $_ENV['DB_HOST_AUTH'] ?? 'localhost';
    $user = $_ENV['DB_USER_VIT'] ?? $_ENV['DB_USER_AUTH'] ?? 'root';
    $pass = $_ENV['DB_PASS_VIT'] ?? $_ENV['DB_PASS_AUTH'] ?? '';
    $name = $_ENV['DB_NAME_VIT'] ?? 'alphadocere_Vit';
    $port = $_ENV['DB_PORT_VIT'] ?? $_ENV['DB_PORT_AUTH'] ?? 3306;

    $conn = @new mysqli($host, $user, $pass, $name, $port);
    if (!$conn || $conn->connect_error) {
        throw new Exception("Error de conexión a BD Vit: " . ($conn ? $conn->connect_error : "No se pudo instanciar mysqli"));
    }
    $conn->set_charset("utf8mb4");
    return $conn;
}

function sendEmail($to, $subject, $message) {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = $_ENV['SMTP_HOST'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['SMTP_USER'];
        $mail->Password   = $_ENV['SMTP_PASS'];
        $mail->SMTPSecure = ($_ENV['SMTP_PORT'] == 465) ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $_ENV['SMTP_PORT'];

        // Remitente y destinatario
        $mail->setFrom($_ENV['MAIL_FROM'], $_ENV['MAIL_FROM_NAME'] ?? 'Kreative Vit');
        $mail->addReplyTo($_ENV['MAIL_FROM'], $_ENV['MAIL_FROM_NAME'] ?? 'Kreative Vit');
        $mail->addAddress($to);

        // Contenido
        $mail->isHTML(true);
        $mail->Subject = mb_encode_mimeheader($subject, 'UTF-8');
        $mail->Body    = $message;
        $mail->AltBody = strip_tags(str_replace(['<br>', '<br/>', '</p>'], "\n", $message));
        $mail->CharSet = 'UTF-8';

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Error al enviar correo: {$mail->ErrorInfo}");
        return false;
    }
}
