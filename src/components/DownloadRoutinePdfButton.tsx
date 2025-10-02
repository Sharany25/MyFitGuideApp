import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, Platform, Dimensions, Modal, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const PALETTE = {
  primary: '#2CFD89',
  secondary_blue: '#00A3FF',
  text_primary: '#FFFFFF',
  text_dark: '#1D2A32',
  danger: '#FF4757',
  inactive_border: 'rgba(255, 255, 255, 0.15)',
  dark_overlay: 'rgba(0,0,0,0.85)',
  text_secondary: '#B0C4DE',
};

// --- CustomAlertDialog Component (Integrado para evitar errores de módulo) ---
interface CustomAlertDialogProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type: 'error' | 'info' | 'success';
    actionButtonText?: string;
    onActionPress?: () => void;
}

const CustomAlertDialog: React.FC<CustomAlertDialogProps> = ({
    visible,
    onClose,
    title,
    message,
    type,
    actionButtonText,
    onActionPress,
}) => {
    const isError = type === 'error';
    const iconName: any = isError ? 'close-circle' : (type === 'success' ? 'checkmark-circle' : 'information-circle');
    const iconColor = isError ? PALETTE.danger : PALETTE.primary;

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
            <BlurView intensity={70} tint="dark" style={dialogStyles.overlay}>
                <View style={dialogStyles.modalWrapper}>
                    <View style={dialogStyles.modalContent}>
                        <Ionicons name={iconName} size={width * 0.12} color={iconColor} style={dialogStyles.icon} />
                        <Text style={dialogStyles.title}>{title}</Text>
                        <Text style={dialogStyles.message}>{message}</Text>

                        <View style={dialogStyles.buttons}>
                            <TouchableOpacity 
                                style={[dialogStyles.buttonBase, dialogStyles.buttonClose]} 
                                onPress={onClose}
                            >
                                <Text style={[dialogStyles.buttonText, { color: PALETTE.text_primary }]}>Cerrar</Text>
                            </TouchableOpacity>

                            {onActionPress && actionButtonText && (
                                <TouchableOpacity 
                                    style={dialogStyles.buttonActionWrapper} 
                                    onPress={onActionPress}
                                >
                                    <LinearGradient
                                        colors={isError ? [PALETTE.danger, '#CC3344'] : [PALETTE.primary, PALETTE.secondary_blue]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                        style={dialogStyles.buttonBase}
                                    >
                                        <Text style={[dialogStyles.buttonText, { color: PALETTE.text_dark }]}>{actionButtonText}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
};

const dialogStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    modalWrapper: {
        width: '88%',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: PALETTE.inactive_border,
        backgroundColor: 'rgba(29, 42, 50, 0.95)',
    },
    modalContent: {
        padding: 30,
        alignItems: 'center',
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        fontSize: width * 0.06,
        fontWeight: '700',
        textAlign: 'center',
        color: PALETTE.text_primary,
        marginBottom: 8,
    },
    message: {
        fontSize: width * 0.04,
        textAlign: 'center',
        color: PALETTE.text_secondary,
        marginBottom: 30,
        lineHeight: width * 0.055,
    },
    buttons: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
    },
    buttonBase: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonClose: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: PALETTE.inactive_border,
    },
    buttonActionWrapper: {
        flex: 1,
        borderRadius: 15,
        overflow: 'hidden',
    },
    buttonText: {
        fontWeight: '700',
        fontSize: width * 0.042,
    },
});


interface Props {
  rutinaData: any[];
  nombreUsuario: string;
  style?: ViewStyle;
  fechaGeneracionRutina?: string;
}

const DownloadRoutinePdfButton: React.FC<Props> = ({
  rutinaData,
  nombreUsuario,
  style,
  fechaGeneracionRutina,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [alertData, setAlertData] = React.useState({ title: '', message: '', type: 'info', action: () => {}, actionText: '' });

  const showCustomAlert = (title: string, message: string, type: 'error' | 'info' | 'success', action?: () => void, actionText?: string) => {
    setAlertData({
      title,
      message,
      type,
      action: action || (() => setAlertVisible(false)),
      actionText: actionText || 'Aceptar',
    });
    setAlertVisible(true);
  };

  const handleShare = async (path: string) => {
    setAlertVisible(false);
    await Sharing.shareAsync(path, { mimeType: 'application/pdf', dialogTitle: 'Guardar Rutina PDF' });
  };

  const handleDownload = async () => {
    if (!rutinaData || rutinaData.length === 0) {
      showCustomAlert('Error de Datos', 'No hay datos de rutina para generar el PDF.', 'error');
      return;
    }
    setLoading(true);

    const displayNombreUsuario = nombreUsuario || 'Usuario Desconocido';
    const nombreLimpio = displayNombreUsuario.replace(/[^\w]/gi, '');
    const fechaGeneracion = fechaGeneracionRutina || 'Fecha no disponible';

    // HTML Content Generation (Adaptado a Rutinas)
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Plan Semanal - Rutina</title>
  <style>
    body {
      font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background: #F8F9FA;
      color: #212529;
      margin: 0;
      padding: 0;
      line-height: 1.5;
      font-size: 14px;
    }
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(120deg, #34d399 60%, #22d3ee 100%);
      border-radius: 0 0 48px 48px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.15);
      margin-bottom: 0;
      padding: 0;
      page-break-after: always;
      text-align: center;
    }
    .cover-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0 28px;
    }
    .cover-title {
      font-size: 2.8rem;
      color: #FFFFFF;
      font-weight: 900;
      letter-spacing: 1.8px;
      margin-bottom: 15px;
      margin-top: 0;
      text-shadow: 0 4px 15px rgba(0,0,0,0.25);
    }
    .cover-desc {
      color: #D4FAF7;
      font-size: 1.3rem;
      margin-bottom: 30px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .nombre-user {
      color: #FFFFFF;
      font-size: 1.25rem;
      margin-bottom: 20px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .fecha {
      margin-top: 20px;
      color: #D4FAF7;
      font-size: 1.05rem;
      font-style: italic;
      font-weight: 500;
      letter-spacing: 0.07em;
      text-shadow: 0 1px 6px rgba(0,0,0,0.1);
    }
    .nota-importante {
        color: #FFFFFF;
        font-size: 1.1rem;
        font-weight: 600;
        margin-top: 15px;
        padding: 10px 20px;
        background-color: rgba(0,0,0,0.15);
        border-radius: 10px;
        text-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .main-card {
      background: #FFFFFF;
      border-radius: 25px;
      margin: 30px auto 25px auto;
      box-shadow: 0 6px 30px rgba(0,0,0,0.07);
      border: 1px solid rgba(0, 0, 0, 0.08);
      padding: 30px;
      min-height: 90vh;
      max-width: 800px;
      page-break-after: always;
      page-break-inside: avoid;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }
    .main-card:last-child { page-break-after: auto; }
    .dia-title {
      color: #2CFD89;
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 8px;
      letter-spacing: 1.2px;
      margin-top: 0;
      text-shadow: 0 1px 8px rgba(44, 253, 137, 0.1);
    }
    .muscle-group {
      color: #00A3FF;
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 20px;
      letter-spacing: 0.5px;
    }
    .exercises-block { margin-top: 15px; }
    .exercise-item { 
      border-radius: 18px;
      padding: 15px;
      background: #FFFFFF;
      margin-bottom: 15px;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 3px 12px rgba(0,0,0,0.07);
    }
    .exercise-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 10px; 
    }
    .exercise-name { 
      font-size: 1.15rem; 
      font-weight: 800; 
      color: #212529; 
      flex: 1; 
      margin-right: 15px; 
    }
    .stats-row { 
      display: flex; 
      justify-content: space-around; 
      margin-bottom: 15px; 
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      padding-top: 12px; 
    }
    .stat-item { 
      text-align: center; 
      flex: 1; 
      padding: 3px; 
    }
    .stat-label { 
      font-size: 0.9rem; 
      color: #495057; 
      margin-top: 3px; 
      font-weight: 500;
    }
    .stat-value { 
      font-size: 1.1rem; 
      font-weight: 800; 
      color: #2CFD89;
    }
    .purpose-container {
      background: #F8F9FA;
      border-radius: 12px;
      padding: 12px;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .purpose-text {
      font-size: 0.95rem;
      color: #495057;
      font-style: italic;
      line-height: 1.4;
    }
    @media print {
      html, body {
        margin: 0;
        padding: 0;
      }
      .cover { page-break-after: always; }
      .main-card { 
        page-break-inside: avoid; 
        page-break-after: always;
        margin: 0;
        padding: 25px;
        border-radius: 0;
        box-shadow: none;
        border: none;
        min-height: auto;
      }
      .main-card:last-child { page-break-after: auto; }
      .dia-title { font-size: 2rem; margin-bottom: 5px; }
      .muscle-group { font-size: 1.1rem; margin-bottom: 15px; }
      .exercise-item { margin-bottom: 12px; padding: 12px; border-radius: 10px; }
      .exercise-name { font-size: 1.1rem; }
      .stats-row { margin-bottom: 12px; padding-top: 10px; }
      .stat-value { font-size: 1rem; }
      .stat-label { font-size: 0.85rem; }
      .purpose-container { padding: 10px; border-radius: 8px; }
      .purpose-text { font-size: 0.9rem; line-height: 1.3; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <div class="cover-content">
      <div class="cover-title">Plan semanal de rutina</div>
      <div class="cover-desc">Tu plan de entrenamiento personalizado generado con MyFitGuide</div>
      <div class="nombre-user">Usuario: ${displayNombreUsuario}</div>
      <div class="nota-importante">
          ⚠️ Nota Importante: Los pesos, intensidad o repeticiones sugeridas son solo referencias. Debes ajustar la carga según tu nivel de condición física, experiencia y capacidades individuales. Prioriza siempre la técnica correcta sobre el peso.
      </div>
    </div>
  </div>
  ${rutinaData.map((dia: any, idx: number) => `
    <div class="main-card">
      <div class="dia-title">${dia.dia || `Día ${idx + 1}`}</div>
      <div class="muscle-group">Grupo Muscular: ${dia.grupo || 'N/D'}</div>
      <div class="exercises-block">
        ${(dia.ejercicios || []).map((ejercicio: any) => `
          <div class="exercise-item">
            <div class="exercise-header">
              <span class="exercise-name">${ejercicio.nombre || 'Ejercicio N/D'}</span>
            </div>
            <div class="stats-row">
              <div class="stat-item">
                <div class="stat-value">${ejercicio.series ?? 0}</div>
                <div class="stat-label">Series</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${ejercicio.repeticiones ?? 0}</div>
                <div class="stat-label">Reps</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${ejercicio.descanso ?? 'N/D'}</div>
                <div class="stat-label">Descanso</div>
              </div>
            </div>
            <div class="purpose-container">
              <div class="purpose-text">${ejercicio["propósito"] || 'Propósito N/D'}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('')}
</body>
</html>
`;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      const nombreArchivo = `Rutina-${nombreLimpio}.pdf`;
      
      const destPath =
        Platform.OS === 'ios'
          ? `${FileSystem.documentDirectory}${nombreArchivo}`
          : `${FileSystem.cacheDirectory}${nombreArchivo}`;
          
      await FileSystem.moveAsync({ from: uri, to: destPath });
      setLoading(false);
      
      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permissions.granted) {
            const createdFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                permissions.directoryUri, 
                nombreArchivo, 
                'application/pdf'
            );

            if (createdFileUri) {
                const fileContent = await FileSystem.readAsStringAsync(destPath, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                await FileSystem.writeAsStringAsync(createdFileUri, fileContent, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                showCustomAlert("¡Descarga Exitosa!", "El plan de rutina se ha guardado correctamente en la ubicación seleccionada.", 'success');
            } else {
                 showCustomAlert('Descarga Cancelada', 'No se seleccionó una ubicación válida para guardar el archivo.', 'info');
            }
        } else {
             showCustomAlert('Acceso Requerido', 'Necesitamos su permiso para guardar el archivo en su dispositivo. Por favor, intente de nuevo y conceda el permiso.', 'error');
        }

      } else {
          // iOS
          showCustomAlert(
              "PDF Generado", 
              "Selecciona 'Guardar en Archivos' o 'Imprimir' en el menú de compartir para almacenar el plan en tu dispositivo.", 
              'info', 
              () => handleShare(destPath), 
              "Compartir/Guardar"
          );
      }

    } catch (e) {
      setLoading(false);
      console.error("Error al generar o descargar PDF de rutina:", e);
      showCustomAlert('Error Fatal', 'No se pudo generar o descargar el PDF de la rutina. Revisa la consola para más detalles.', 'error');
    }
  };

  return (
    <>
      <CustomAlertDialog
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type as any}
        actionButtonText={alertData.actionText}
        onActionPress={alertData.action}
      />
      <TouchableOpacity
        style={[pdfBtnStyles.buttonBase, style]}
        onPress={handleDownload}
        activeOpacity={0.8}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={PALETTE.text_dark} size="small" />
        ) : (
          <>
            <Ionicons name="cloud-download-outline" size={width * 0.05} color={PALETTE.text_dark} />
            <Text style={pdfBtnStyles.buttonText}>PDF</Text>
          </>
        )}
      </TouchableOpacity>
    </>
  );
};

const pdfBtnStyles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.primary,
    borderRadius: 20,
    paddingHorizontal: width * 0.035,
    paddingVertical: width * 0.03,
    flexGrow: 1,
    marginLeft: 10,
    height: width * 0.12,
  },
  buttonText: {
    color: PALETTE.text_dark,
    fontWeight: '700',
    fontSize: width * 0.038,
    marginLeft: 8,
  }
});

export default DownloadRoutinePdfButton;
