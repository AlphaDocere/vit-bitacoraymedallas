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
    $admins = [
        ['email' => 'mrojas@alphadocere.cl', 'nombre' => 'Mauro Rojas']
    ];

    $subject = "⚠️ Alerta Emocional: $userName necesita apoyo";
    
    $motivo = [];
    if ($mood === 'frustrado' || $mood === 'cansado') $motivo[] = "Estado de ánimo: <b>$mood</b>";
    if ($needsHelp) $motivo[] = "Solicitó ayuda activa";
    $motivoStr = implode(" | ", $motivo);

    // NOTA PARA EL DESARROLLADOR: Cambiar estas URLs por las URLs públicas correctas donde estén alojadas las imágenes de producción.
    $logoVit = "https://kreativevit.alphadocere.cl/assets/Kreative%20vit%20sin%20fondo%20letra%20negra.png"; 
    $logoJoseph = "https://kreativevit.alphadocere.cl/insignias/insignia%20creador.png";
    $logoMauro = "https://kreativevit.alphadocere.cl/insignias/Mauro%20rojas.png";

    $htmlContent = "
    <div style='font-family: \"Segoe UI\", Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'>
        
        <!-- Encabezado con Logo de Kreative Vit -->
        <div style='text-align: center; margin-bottom: 20px;'>
            <img src='$logoVit' alt='Kreative Vit' style='max-width: 150px; height: auto;' onerror='this.style.display=\"none\"' />
        </div>

        <div style='text-align: center; margin-bottom: 25px;'>
            <h2 style='color: #ef4444; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;'>🚨 Alerta de Bienestar 🚨</h2>
            <p style='color: #64748b; margin-top: 5px; font-size: 14px;'>Sistema de Monitoreo Emocional</p>
        </div>
        
        <p style='color: #334155; font-size: 16px;'>Hola Administradores,</p>
        <p style='color: #334155; font-size: 16px;'>El practicante <strong style='color: #0f172a;'>$userName</strong> ha registrado una bitácora que requiere atención inmediata.</p>
        
        <!-- Tarjeta de Detalles de Alerta -->
        <div style='background-color: white; padding: 20px; border-left: 5px solid #ef4444; margin: 25px 0; border-radius: 0 8px 8px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);'>
            <p style='margin: 8px 0; color: #475569;'><strong style='color: #1e293b;'>📅 Fecha:</strong> $fecha</p>
            <p style='margin: 8px 0; color: #475569;'><strong style='color: #1e293b;'>📧 Email:</strong> <a href='mailto:$userEmail' style='color: #3b82f6; text-decoration: none;'>$userEmail</a></p>
            <p style='margin: 8px 0; color: #475569;'><strong style='color: #1e293b;'>⚠️ Indicador:</strong> $motivoStr</p>
        </div>
        
        <!-- Descripción de Ayuda -->
        <div style='background-color: #fef2f2; padding: 20px; border: 1px solid #fecaca; margin: 20px 0; border-radius: 8px;'>
            <p style='margin-top: 0; color: #991b1b; font-weight: 600; font-size: 15px;'>Detalles de ayuda técnica solicitada:</p>
            <p style='font-style: italic; color: #7f1d1d; margin-bottom: 0; line-height: 1.5;'>\"$helpDesc\"</p>
        </div>

        <!-- Contenido de Bitácora -->
        <div style='background-color: #f1f5f9; padding: 20px; border: 1px solid #cbd5e1; margin: 25px 0; border-radius: 8px;'>
            <h3 style='margin-top: 0; color: #1e293b; font-size: 16px; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px;'>📖 Bitácora del Día</h3>
            
            <p style='color: #0f172a; margin: 15px 0 5px; font-weight: 600;'>¿Qué hizo hoy?</p>
            <p style='margin-top: 0; color: #475569; line-height: 1.5;'>$hechoHoy</p>
            
            <p style='color: #0f172a; margin: 20px 0 5px; font-weight: 600;'>¿Qué hará mañana?</p>
            <p style='margin-top: 0; margin-bottom: 0; color: #475569; line-height: 1.5;'>$hacerManana</p>
        </div>
        
        <p style='color: #334155; font-size: 15px; text-align: center; margin-top: 30px;'>Por favor, pónganse en contacto con este practicante lo antes posible para brindarle soporte.</p>
        
        <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;' />

        <!-- Pie de firma con logos -->
        <table width='100%' style='margin-top: 20px;'>
            <tr>
                <td align='center' style='padding: 10px;'>
                    <img src='$logoJoseph' alt='El Creador' style='width: 60px; height: 60px; border-radius: 50%; border: 2px solid #3b82f6;' onerror='this.style.display=\"none\"' />
                    <p style='margin: 5px 0 0; font-size: 12px; color: #64748b; font-weight: 600;'>Joseph Joestar</p>
                    <p style='margin: 0; font-size: 10px; color: #94a3b8;'>El Creador</p>
                </td>
                <td align='center' style='padding: 10px;'>
                    <img src='$logoMauro' alt='Líder Alpha Docere' style='width: 60px; height: 60px; border-radius: 50%; border: 2px solid #facc15;' onerror='this.style.display=\"none\"' />
                    <p style='margin: 5px 0 0; font-size: 12px; color: #64748b; font-weight: 600;'>Mauro Rojas</p>
                    <p style='margin: 0; font-size: 10px; color: #94a3b8;'>Líder Supremo</p>
                </td>
            </tr>
        </table>

        <p style='color: #94a3b8; font-size: 11px; margin-top: 25px; text-align: center;'>Este es un correo automático generado por Kreative Vit. No responda directamente a este mensaje.</p>
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
