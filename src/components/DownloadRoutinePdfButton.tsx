import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const COLORS = {
  primary: '#00C27F',
  dark: '#029865',
  white: '#fff',
};

const PDF_PALETTE = {
  background_light: '#F8F9FA',
  text_dark: '#212529',
  text_medium: '#495057',
  primary_app_green: '#2CFD89',
  accent_app_blue: '#00A3FF',
  danger_pdf: '#FF4757',
  border_subtle: 'rgba(0, 0, 0, 0.08)',
  gradient_cover_start: '#34d399',
  gradient_cover_end: '#22d3ee',
  cover_text_light: '#FFFFFF',
  cover_text_darker: '#D4FAF7',
  card_bg_light: '#FFFFFF',
  shadow_color_subtle: 'rgba(0,0,0,0.07)',
  shadow_color_strong: 'rgba(0,0,0,0.15)',
};

interface Props {
  rutinaData: any[];
  nombreUsuario: string;
  title?: string;
  iconSize?: number;
  style?: ViewStyle;
  fechaGeneracionRutina?: string;
}

const DownloadRoutinePdfButton: React.FC<Props> = ({
  rutinaData,
  nombreUsuario,
  title = 'Rutina PDF',
  iconSize = 21,
  style,
  fechaGeneracionRutina,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleDownload = async () => {
    if (!rutinaData || rutinaData.length === 0) {
      Alert.alert('Error', 'No hay datos de rutina para generar el PDF.');
      return;
    }
    setLoading(true);

    const displayNombreUsuario = nombreUsuario || 'Usuario Desconocido';
    const nombreLimpio = displayNombreUsuario.replace(/[^\w]/gi, '');
    const fechaGeneracion = fechaGeneracionRutina || 'Fecha no disponible';

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Plan Semanal - Rutina</title>
  <style>
    body {
      font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background: ${PDF_PALETTE.background_light};
      color: ${PDF_PALETTE.text_dark};
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
      background: linear-gradient(120deg, ${PDF_PALETTE.gradient_cover_start} 60%, ${PDF_PALETTE.gradient_cover_end} 100%);
      border-radius: 0 0 48px 48px;
      box-shadow: 0 8px 40px ${PDF_PALETTE.shadow_color_strong};
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
      color: ${PDF_PALETTE.cover_text_light};
      font-weight: 900;
      letter-spacing: 1.8px;
      margin-bottom: 15px;
      margin-top: 0;
      text-shadow: 0 4px 15px rgba(0,0,0,0.25);
    }
    .cover-desc {
      color: ${PDF_PALETTE.cover_text_darker};
      font-size: 1.3rem;
      margin-bottom: 30px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .nombre-user {
      color: ${PDF_PALETTE.cover_text_light};
      font-size: 1.25rem;
      margin-bottom: 20px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .fecha {
      margin-top: 20px;
      color: ${PDF_PALETTE.cover_text_darker};
      font-size: 1.05rem;
      font-style: italic;
      font-weight: 500;
      letter-spacing: 0.07em;
      text-shadow: 0 1px 6px rgba(0,0,0,0.1);
    }
    .main-card {
      background: ${PDF_PALETTE.card_bg_light};
      border-radius: 25px;
      margin: 30px auto 25px auto;
      box-shadow: 0 6px 30px ${PDF_PALETTE.shadow_color_subtle};
      border: 1px solid ${PDF_PALETTE.border_subtle};
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
      color: ${PDF_PALETTE.primary_app_green};
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 8px;
      letter-spacing: 1.2px;
      margin-top: 0;
      text-shadow: 0 1px 8px rgba(44, 253, 137, 0.1);
    }
    .muscle-group {
      color: ${PDF_PALETTE.accent_app_blue};
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
      border: 1px solid ${PDF_PALETTE.border_subtle};
      box-shadow: 0 3px 12px ${PDF_PALETTE.shadow_color_subtle};
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
      color: ${PDF_PALETTE.text_dark}; 
      flex: 1; 
      margin-right: 15px; 
    }
    .stats-row { 
      display: flex; 
      justify-content: space-around; 
      margin-bottom: 15px; 
      border-top: 1px solid ${PDF_PALETTE.border_subtle};
      padding-top: 12px; 
    }
    .stat-item { 
      text-align: center; 
      flex: 1; 
      padding: 3px; 
    }
    .stat-label { 
      font-size: 0.9rem; 
      color: ${PDF_PALETTE.text_medium}; 
      margin-top: 3px; 
      font-weight: 500;
    }
    .stat-value { 
      font-size: 1.1rem; 
      font-weight: 800; 
      color: ${PDF_PALETTE.primary_app_green};
    }
    .purpose-container {
      background: ${PDF_PALETTE.background_light};
      border-radius: 12px;
      padding: 12px;
      border: 1px solid ${PDF_PALETTE.border_subtle};
    }
    .purpose-text {
      font-size: 0.95rem;
      color: ${PDF_PALETTE.text_medium};
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
      <div class="fecha">🕒 Generada el: ${fechaGeneracion}</div>
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
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(destPath, { mimeType: 'application/pdf', dialogTitle: title });
      } else {
        Alert.alert('Archivo guardado', `El PDF se guardó en:\n${destPath}`);
      }
    } catch (e) {
      setLoading(false);
      console.error("Error al generar o compartir PDF de rutina:", e);
      Alert.alert('Error', 'No se pudo generar o compartir el PDF de la rutina. Revisa la consola para más detalles.');
    }
  };

  return (
    <TouchableOpacity
      style={[pdfBtnStyles.btnSmall, style]}
      onPress={handleDownload}
      activeOpacity={0.9}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <Ionicons name="cloud-download-outline" size={iconSize} color={COLORS.white} />
      )}
      <Text style={pdfBtnStyles.btnText}>{title}</Text>
    </TouchableOpacity>
  );
};

const pdfBtnStyles = StyleSheet.create({
  btnSmall: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#00c27f99',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginLeft: 5
  },
  btnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 7,
    letterSpacing: 0.14,
  }
});

export default DownloadRoutinePdfButton;
