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

// --- CustomAlertDialog Component (Integrado) ---
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
            {/* 1. Usar BlurView para el fondo de pantalla completa */}
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
    // MODIFICADO: Ahora es un contenedor centrado que usa BlurView para el desenfoque
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent', // Importante para que BlurView funcione
    },
    modalWrapper: {
        width: '88%',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: PALETTE.inactive_border,
        backgroundColor: 'rgba(29, 42, 50, 0.95)', // Fondo oscuro semi-opaco para el contenido del modal
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
// --- Fin de CustomAlertDialog ---

interface Props {
  data: any;
  nombreUsuario: string;
  style?: ViewStyle;
}

const DownloadDietPdfButton: React.FC<Props> = ({ data, nombreUsuario, style }) => {
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
    await Sharing.shareAsync(path, { mimeType: 'application/pdf', dialogTitle: 'Guardar Dieta PDF' });
  };

  const handleDownload = async () => {
    if (!data?.resultado?.semana || data.resultado.semana.length === 0) {
      showCustomAlert('Error de Datos', 'No hay datos de dieta para generar el PDF.', 'error');
      return;
    }
    setLoading(true);

    const semana = data.resultado.semana;
    const fechaGeneracion = data.creado ? new Date(data.creado).toLocaleString() : 'Fecha no disponible';

    const displayNombreUsuario = nombreUsuario || 'Usuario Desconocido';
    const nombreLimpio = displayNombreUsuario.replace(/[^\w]/gi, '');

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Plan Semanal - Dieta</title>
  <style>
    /* Estilos del PDF omitidos por brevedad */
    body {
      font-family: 'Montserrat', Arial, sans-serif;
      background: #f4fefc;
      color: #20263d;
      margin: 0;
      padding: 0;
    }
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(120deg, #34d399 60%, #22d3ee 100%);
      border-radius: 0 0 48px 48px;
      box-shadow: 0 8px 40px #19d2ac22;
      margin-bottom: 0;
      padding: 0;
      page-break-after: always;
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
      font-size: 2.4rem;
      color: #fff;
      font-weight: 800;
      letter-spacing: 1.4px;
      margin-bottom: 12px;
      margin-top: 0;
      text-align: center;
      text-shadow: 0 2px 12px #019e8333;
    }
    .cover-desc {
      color: #d4faf7;
      font-size: 1.19rem;
      margin-bottom: 26px;
      text-align: center;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-shadow: 0 1px 6px #099b9b24;
    }
    .nombre-user {
      color: #f0fdf8;
      font-size: 1.12rem;
      margin-bottom: 16px;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-shadow: 0 1px 6px #099b9b24;
    }
    .fecha {
      margin-top: 16px;
      color: #b8f2e6;
      font-size: 1rem;
      font-style: italic;
      font-weight: 400;
      letter-spacing: 0.07em;
      text-align: center;
      text-shadow: 0 1px 8px #1bbeb622;
    }
    .main-card {
      background: #fff;
      border-radius: 19px;
      margin: 32px auto 25px auto;
      box-shadow: 0 4px 24px #34d39919;
      border: 1.7px solid #d7f6e9;
      padding: 30px 32px 22px 32px;
      min-height: 420px;
      max-width: 780px;
      page-break-after: always;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }
    .main-card:last-child { page-break-after: auto; }
    .dia-title {
      color: #00C27F;
      font-size: 2.05rem;
      font-weight: 800;
      margin-bottom: 15px;
      letter-spacing: 1px;
      margin-top: 0;
      text-shadow: 0 1px 10px #00c27f16;
    }
    .macros-row {
      display: flex;
      flex-wrap: wrap;
      gap: 19px;
      margin-bottom: 20px;
      margin-top: 2px;
      justify-content: flex-start;
    }
    .macro-box {
      flex: 1 1 130px;
      background: #f4fefc;
      border-radius: 14px;
      padding: 13px 13px 10px 13px;
      box-shadow: 0 2px 10px #38b00016;
      min-width: 115px;
      text-align: center;
      border: 1.5px solid #d7f6e9;
      margin-right: 4px;
      font-weight: bold;
    }
    .macro-label { font-size: 1.07rem; color: #1c5d39; margin-bottom: 2px;}
    .macro-val { font-size: 1.18rem; font-weight: bold;}
    .macro-cal { color: #38B000;}
    .macro-prot { color: #2196F3;}
    .macro-carb { color: #FFA000;}
    .macro-fat { color: #E64A19;}
    .comidas-block { margin-top: 10px; }
    .comidas-label { font-weight:700; color:#009b63; font-size:1.09rem; margin-bottom:5px; }
    .comida-item { border-radius: 12px; padding: 12px 12px 10px 12px; background: #f7fff9; margin-bottom: 12px; border: 1.1px solid #c0efe0; box-shadow: 0 1px 5px #00c27f07; }
    .comida-row { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 4px; }
    .comida-tipo { color: #00C27F; font-size: 1.01rem; font-weight: bold; letter-spacing: 0.7px; margin-right: 10px; text-transform: uppercase; display: inline-block; min-width: 80px; }
    .platillo-nombre { font-size: 1.07rem; font-weight: 700; color: #232946; display: inline-block; margin-left: 5px; }
    .ingredientes-title { font-weight: 700; font-size: 1rem; color: #11b479; margin-bottom: 1px; margin-top: 7px; }
    .ingredientes-list { margin-left: 7px; font-size: 1.01rem; color: #47545a; margin-bottom: 2px; }
    .cost-cal-row { display: flex; justify-content: space-between; font-size: 1.01rem; margin-top: 8px; color: #1e9286; }
    .costo { font-weight: 600; color: #888;}
    .calorias { font-weight: 700; color: #38B000;}
    @media print {
      .cover { page-break-after: always; }
      .main-card { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <div class="cover-content">
      <div class="cover-title">Plan semanal de dieta</div>
      <div class="cover-desc">Tu plan personalizado generado con MyFitGuide</div>
      <div class="nombre-user">${displayNombreUsuario}</div>
      <div class="fecha">🕒 Generada el: ${fechaGeneracion}</div>
    </div>
  </div>
  ${semana.map((dia: any, idx: number) => `
    <div class="main-card">
      <div class="dia-title">${dia.dia || `Día ${idx + 1}`}</div>
      <div class="macros-row">
        <div class="macro-box"><div class="macro-label">Calorías</div><div class="macro-val macro-cal">${dia.totales_dia?.calorias ?? 0} kcal</div></div>
        <div class="macro-box"><div class="macro-label">Proteínas</div><div class="macro-val macro-prot">${dia.totales_dia?.proteinas ?? 0}g</div></div>
        <div class="macro-box"><div class="macro-label">Carbohidratos</div><div class="macro-val macro-carb">${dia.totales_dia?.carbohidratos ?? 0}g</div></div>
        <div class="macro-box"><div class="macro-label">Grasas</div><div class="macro-val macro-fat">${dia.totales_dia?.grasas ?? 0}g</div></div>
      </div>
      <div class="comidas-block">
        <div class="comidas-label">Comidas:</div>
        ${(dia.comidas || []).map((comida: any) => `
          <div class="comida-item">
            <div class="comida-row">
              <div>
                <span class="comida-tipo">${comida.tipo || 'N/D'}</span>
                <span class="platillo-nombre">
                  ${typeof comida.platillo === 'string'
                    ? comida.platillo
                    : comida.platillo?.platillo || 'Platillo N/D'}
                </span>
              </div>
              <div class="costo">Costo: $${comida.costo || comida.platillo?.costo || 0} MXN</div>
            </div>
            <div class="ingredientes-title">Ingredientes:</div>
            <div class="ingredientes-list">
              <ul>
                ${
                  ((typeof comida.platillo === 'string' ? comida.ingredientes : comida.platillo?.ingredientes) || [])
                    .map((ing: any) => `<li>${ing.nombre || 'N/D'}: ${ing.cantidad || 'N/D'}</li>`).join('')
                }
              </ul>
            </div>
            <div class="cost-cal-row">
              <div class="calorias">Calorías: <b>${comida.calorias || comida.platillo?.calorias || 0}</b> kcal</div>
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
      const nombreArchivo = `Dieta-${nombreLimpio}.pdf`;
      
      // Mover el archivo a una ubicación temporal interna
      const destPath =
        Platform.OS === 'ios'
          ? `${FileSystem.documentDirectory}${nombreArchivo}`
          : `${FileSystem.cacheDirectory}${nombreArchivo}`;
          
      await FileSystem.moveAsync({ from: uri, to: destPath });
      setLoading(false);
      
      // Usaremos la lógica específica para cada plataforma
      if (Platform.OS === 'android') {
        // En Android, solicitamos permiso para abrir el diálogo de guardado
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permissions.granted) {
            // Acción principal de descarga (guarda el archivo donde el usuario elija)
            const createdFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                permissions.directoryUri, 
                nombreArchivo, 
                'application/pdf'
            );

            if (createdFileUri) {
                // Escribir el contenido del archivo en la ubicación seleccionada
                const fileContent = await FileSystem.readAsStringAsync(destPath, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                await FileSystem.writeAsStringAsync(createdFileUri, fileContent, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                showCustomAlert("¡Descarga Exitosa!", "El plan de dieta se ha guardado correctamente en la ubicación seleccionada.", 'success');
            } else {
                 showCustomAlert('Descarga Cancelada', 'No se seleccionó una ubicación válida para guardar el archivo.', 'info');
            }
        } else {
             showCustomAlert('Acceso Requerido', 'Necesitamos su permiso para guardar el archivo en su dispositivo. Por favor, intente de nuevo y conceda el permiso.', 'error');
        }

      } else {
          // iOS: Abrir la hoja de compartir, que incluye la opción "Guardar en Archivos".
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
      console.error("Error al generar o descargar PDF:", e);
      showCustomAlert('Error Fatal', 'No se pudo generar o descargar el PDF. Revisa la consola para más detalles.', 'error');
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

export default DownloadDietPdfButton;
