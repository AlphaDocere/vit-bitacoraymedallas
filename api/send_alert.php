<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

function handleCors() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
}
handleCors();

require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Cuerpo JSON inválido']);
    exit;
}

$userName = htmlspecialchars($input['user'] ?? 'Practicante Desconocido');
$userEmail = filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL);
$mood = htmlspecialchars($input['mood'] ?? '');
$needsHelp = $input['needsHelp'] ?? false;
$helpDesc = htmlspecialchars($input['helpDesc'] ?? 'No especificó detalles.');
$fecha = htmlspecialchars($input['fecha'] ?? date('Y-m-d'));
$hechoHoy = htmlspecialchars($input['hechoHoy'] ?? 'No registró qué hizo hoy.');
$hacerManana = htmlspecialchars($input['hacerManana'] ?? 'No registró qué hará mañana.');

if ($mood !== 'frustrado' && $mood !== 'cansado' && !$needsHelp) {
    echo json_encode(['success' => true, 'message' => 'No requiere alerta.']);
    exit;
}

try {
    $conn = getAuthDbConnection();

    // Obtener admins de Kreative Vit (rol_id = 12)
    // TEMPORAL: Forzar envío a Joseph Joestar según petición del usuario
    $admins = [
        ['email' => 'rjoseeliecer@gmail.com', 'nombre' => 'Joseph Joestar']
    ];

    $subject = "⚠️ Alerta Emocional: $userName necesita apoyo";
    
    $motivo = [];
    if ($mood === 'frustrado' || $mood === 'cansado') $motivo[] = "Estado de ánimo: <b>$mood</b>";
    if ($needsHelp) $motivo[] = "Solicitó ayuda activa";
    $motivoStr = implode(" | ", $motivo);

    $htmlContent = "
    <div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px;'>
        <h2 style='color: #d9534f; border-bottom: 2px solid #d9534f; padding-bottom: 10px;'>Alerta de Bienestar - Kreative Vit</h2>
        <p>Hola,</p>
        <p>El practicante <strong>$userName</strong> ha registrado una bitácora que requiere tu atención.</p>
        
        <div style='background-color: white; padding: 15px; border-left: 4px solid #d9534f; margin: 20px 0;'>
            <p style='margin: 5px 0;'><strong>Fecha:</strong> $fecha</p>
            <p style='margin: 5px 0;'><strong>Email de contacto:</strong> $userEmail</p>
            <p style='margin: 5px 0;'><strong>Indicador:</strong> $motivoStr</p>
        </div>
        
        <div style='background-color: white; padding: 15px; border: 1px solid #ddd; margin: 20px 0; border-radius: 5px;'>
            <p style='margin-top: 0; color: #666;'><strong>Detalles de ayuda técnica solicitada:</strong></p>
            <p style='font-style: italic; margin-bottom: 0;'>\"$helpDesc\"</p>
        </div>

        <div style='background-color: #f1f5f9; padding: 15px; border: 1px solid #cbd5e1; margin: 20px 0; border-radius: 5px;'>
            <h3 style='margin-top: 0; color: #334155; font-size: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;'>Bitácora del Día</h3>
            <p style='color: #475569; margin: 10px 0 5px;'><strong>¿Qué hizo hoy?</strong></p>
            <p style='margin-top: 0;'>$hechoHoy</p>
            <p style='color: #475569; margin: 15px 0 5px;'><strong>¿Qué hará mañana?</strong></p>
            <p style='margin-top: 0; margin-bottom: 0;'>$hacerManana</p>
        </div>
        
        <p>Por favor, ponte en contacto con este practicante lo antes posible para brindarle soporte.</p>
        <p style='color: #777; font-size: 12px; margin-top: 30px; text-align: center;'>Este es un correo automático del sistema Kreative Vit.</p>
    </div>
    ";

    $alertSent = false;
    foreach ($admins as $admin) {
        $success = sendEmail($admin['email'], $subject, $htmlContent);
        if ($success) $alertSent = true;
    }

    echo json_encode([
        'success' => true, 
        'message' => 'Alerta procesada desde el backend local de Vit.',
        'admins_notified' => count($admins),
        'sent' => $alertSent
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al procesar alerta: ' . $e->getMessage()]);
}
