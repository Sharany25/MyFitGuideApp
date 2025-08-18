import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

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
  protein_pdf: '#00A3FF',
  carbs_pdf: '#FFC107',
  fats_pdf: '#E91E63',
};

const APP_PALETTE = {
  primary: '#2CFD89',
  accent_blue: '#00A3FF',
  text_primary: '#FFFFFF',
  button_gradient_start: 'rgba(255,255,255,0.2)',
  button_gradient_end: 'rgba(255,255,255,0.05)',
  dark: '#1D2A32',
};

interface Props {
  userId: string;
  nombreUsuario: string;
  dietData: any;
  rutinaData: any;
  title?: string;
  iconSize?: number;
  style?: ViewStyle;
}

const DownloadCombinedPdfButton: React.FC<Props> = ({
  userId,
  nombreUsuario,
  dietData,
  rutinaData,
  title = 'Descargar Plan Completo',
  iconSize = 21,
  style,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleDownload = async () => {
    setLoading(true);

    if (!dietData?.resultado?.semana && !rutinaData?.rutina?.rutina) {
      Alert.alert('Error', 'No hay datos de dieta ni de rutina para generar el PDF.');
      setLoading(false);
      return;
    }

    const displayNombreUsuario = nombreUsuario || 'Usuario Desconocido';
    const nombreLimpio = displayNombreUsuario.replace(/[^\w]/gi, '');
    const fechaGeneracion = new Date().toLocaleString();

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Mi Plan Completo - MyFitGuide</title>
  <style>
    body {
      font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background: ${PDF_PALETTE.background_light};
      color: ${PDF_PALETTE.text_dark};
      margin: 0;
      padding: 0;
      line-height: 1.6;
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
    .section-title-container {
      page-break-before: always;
      text-align: center;
      margin-top: 40px;
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 2.5rem;
      color: ${PDF_PALETTE.primary_app_green};
      font-weight: 900;
      letter-spacing: 1.5px;
      text-shadow: 0 2px 10px rgba(44, 253, 137, 0.2);
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
    .card-header-section {
      margin-bottom: 20px;
      text-align: center;
    }
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
    .macros-row {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 20px;
      justify-content: center;
    }
    .macro-box {
      flex: 1 1 130px;
      background: ${PDF_PALETTE.background_light};
      border-radius: 12px;
      padding: 13px 13px 10px 13px;
      box-shadow: 0 2px 10px ${PDF_PALETTE.shadow_color_subtle};
      min-width: 115px;
      text-align: center;
      border: 1.5px solid ${PDF_PALETTE.border_subtle};
      font-weight: bold;
    }
    .macro-label { font-size: 1rem; color: ${PDF_PALETTE.text_medium}; margin-bottom: 2px;}
    .macro-val { font-size: 1.1rem; font-weight: bold;}
    .macro-cal { color: ${PDF_PALETTE.primary_app_green};}
    .macro-prot { color: ${PDF_PALETTE.accent_app_blue};}
    .macro-carb { color: ${PDF_PALETTE.primary_app_green};}
    .macro-fat { color: ${PDF_PALETTE.danger_pdf};}
    .comidas-block, .exercises-block { margin-top: 15px; }
    .comidas-label, .exercises-label { font-weight:700; color:${PDF_PALETTE.primary_app_green}; font-size:1.1rem; margin-bottom:10px; }
    .comida-item, .exercise-item { 
      border-radius: 18px;
      padding: 18px;
      background: ${PDF_PALETTE.card_bg_light};
      margin-bottom: 18px;
      border: 1px solid ${PDF_PALETTE.border_subtle};
      box-shadow: 0 3px 12px ${PDF_PALETTE.shadow_color_subtle};
    }
    .comida-row { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
    .comida-tipo { color: ${PDF_PALETTE.accent_app_blue}; font-size: 1.05rem; font-weight: bold; letter-spacing: 0.7px; margin-right: 10px; text-transform: uppercase; display: inline-block; min-width: 80px; }
    .platillo-nombre { font-size: 1.15rem; font-weight: 700; color: ${PDF_PALETTE.text_dark}; display: inline-block; margin-left: 5px; }
    .ingredientes-title { font-weight: 700; font-size: 1rem; color: ${PDF_PALETTE.text_medium}; margin-bottom: 3px; margin-top: 10px; }
    .ingredientes-list { margin-left: 10px; font-size: 1rem; color: ${PDF_PALETTE.text_medium}; margin-bottom: 5px; }
    .ingredientes-list ul { padding-left: 20px; margin-top: 5px; margin-bottom: 5px; }
    .ingredientes-list li { margin-bottom: 3px; }
    .cost-cal-row { display: flex; justify-content: space-between; font-size: 1rem; margin-top: 10px; color: ${PDF_PALETTE.text_medium}; }
    .costo { font-weight: 600; color: ${PDF_PALETTE.text_medium};}
    .calorias { font-weight: 700; color: ${PDF_PALETTE.primary_app_green};}

    .exercise-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 12px; 
    }
    .exercise-name { 
      font-size: 1.25rem; 
      font-weight: 800; 
      color: ${PDF_PALETTE.text_dark}; 
      flex: 1; 
      margin-right: 15px; 
    }
    .stats-row { 
      display: flex; 
      justify-content: space-around; 
      margin-bottom: 18px; 
      border-top: 1px solid ${PDF_PALETTE.border_subtle};
      padding-top: 15px; 
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
    .no-data {
      text-align: center;
      color: ${PDF_PALETTE.text_medium};
      font-size: 1.1rem;
      margin-top: 50px;
      padding: 20px;
      border: 1px dashed ${PDF_PALETTE.border_subtle};
      border-radius: 15px;
    }

    @media print {
      html, body {
        margin: 0;
        padding: 0;
      }
      .cover { page-break-after: always; }
      .section-title-container { page-break-before: always; margin-top: 20px; margin-bottom: 20px; }
      .section-title { font-size: 2.2rem; }
      .main-card { 
        page-break-inside: avoid; 
        page-break-after: always;
        margin: 0;
        padding: 20px;
        border-radius: 0;
        box-shadow: none;
        border: none;
        min-height: auto;
      }
      .main-card:last-child { page-break-after: auto; }
      .dia-title { font-size: 1.8rem; margin-bottom: 5px; }
      .muscle-group { font-size: 1.1rem; margin-bottom: 10px; }
      .exercise-item, .comida-item { margin-bottom: 10px; padding: 10px; border-radius: 8px; }
      .exercise-name, .platillo-nombre { font-size: 1rem; }
      .stats-row { margin-bottom: 10px; padding-top: 8px; }
      .stat-value { font-size: 0.95rem; }
      .stat-label { font-size: 0.8rem; }
      .purpose-container, .ingredientes-list { padding: 8px; border-radius: 6px; }
      .purpose-text, .ingredientes-list, .ingredientes-list li { font-size: 0.85rem; line-height: 1.2; }
      .comida-tipo { font-size: 0.9rem; }
      .ingredientes-title { font-size: 0.9rem; margin-top: 5px; }
      .cost-cal-row { font-size: 0.9rem; margin-top: 8px; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <div class="cover-content">
      <div class="cover-title">Tu Plan Completo</div>
      <div class="cover-desc">Dieta y Rutina Personalizadas con MyFitGuide</div>
      <div class="nombre-user">Usuario: ${displayNombreUsuario}</div>
      <div class="fecha">🕒 Generado el: ${fechaGeneracion}</div>
    </div>
  </div>

  ${dietData?.resultado?.semana && dietData.resultado.semana.length > 0 ? `
    <div class="section-title-container">
      <h2 class="section-title">Plan Semanal de Dieta</h2>
    </div>
    ${dietData.resultado.semana.map((dia: any, idx: number) => `
      <div class="main-card">
        <div class="card-header-section">
          <h3 class="dia-title">${dia.dia || `Día ${idx + 1}`}</h3>
        </div>
        <div class="macros-row">
          <div class="macro-box"><div class="macro-label">Calorías</div><div class="macro-val macro-cal">${dia.totales_dia?.calorias ?? 0} kcal</div></div>
          <div class="macro-box"><div class="macro-label">Proteínas</div><div class="macro-val macro-prot">${dia.totales_dia?.proteinas ?? 0}g</div></div>
          <div class="macro-box"><div class="macro-label">Carbohidratos</div><div class="macro-val macro-carb">${dia.totales_dia?.carbohidratos ?? 0}g</div></div>
          <div class="macro-box"><div class="macro-label">Grasas</div><div class="macro-val macro-fat">${dia.totales_dia?.grasas ?? 0}g</div></div>
        </div>
        <div class="comidas-block">
          <h4 class="comidas-label">Comidas:</h4>
          ${(dia.comidas || []).map((comida: any) => `
            <div class="comida-item">
              <div class="comida-row">
                <span class="comida-tipo">${comida.tipo || 'N/D'}</span>
                <span class="platillo-nombre">
                  ${typeof comida.platillo === 'string'
                    ? comida.platillo
                    : comida.platillo?.platillo || 'Platillo N/D'}
                </span>
              </div>
              <div class="ingredientes-title">Ingredientes:</div>
              <ul class="ingredientes-list">
                ${
                  ((typeof comida.platillo === 'string' ? comida.ingredientes : comida.platillo?.ingredientes) || [])
                    .map((ing: any) => `<li>${ing.nombre || 'N/D'}: ${ing.cantidad || 'N/D'}</li>`).join('')
                }
              </ul>
              <div class="cost-cal-row">
                <span class="costo">Costo: $${comida.costo || comida.platillo?.costo || 0} MXN</span>
                <span class="calorias">Calorías: <b>${comida.calorias || comida.platillo?.calorias || 0}</b> kcal</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  ` : '<div class="section-title-container"><h2 class="section-title">Plan Semanal de Dieta</h2></div><p class="no-data">No hay datos de dieta disponibles para generar el PDF.</p>'}

  ${rutinaData?.rutina?.rutina && rutinaData.rutina.rutina.length > 0 ? `
    <div class="section-title-container">
      <h2 class="section-title">Plan Semanal de Rutina</h2>
    </div>
    ${rutinaData.rutina.rutina.map((dia: any, idx: number) => `
      <div class="main-card">
        <div class="card-header-section">
          <h3 class="dia-title">${dia.dia || `Día ${idx + 1}`}</h3>
          <p class="muscle-group">Grupo Muscular: ${dia.grupo || 'N/D'}</p>
        </div>
        <div class="exercises-block">
          ${(dia.ejercicios || []).map((ejercicio: any) => `
            <div class="exercise-item">
              <h4 class="exercise-name">${ejercicio.nombre || 'Ejercicio N/D'}</h4>
              <div class="stats-row">
                <div class="stat-item">
                  <span class="stat-value">${ejercicio.series ?? 0}</span>
                  <span class="stat-label">Series</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">${ejercicio.repeticiones ?? 0}</span>
                  <span class="stat-label">Reps</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">${ejercicio.descanso ?? 'N/D'}</span>
                  <span class="stat-label">Descanso</span>
                </div>
              </div>
              <div class="purpose-container">
                <p class="purpose-text">${ejercicio["propósito"] || 'Propósito N/D'}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  ` : '<div class="section-title-container"><h2 class="section-title">Plan Semanal de Rutina</h2></div><p class="no-data">No hay datos de rutina disponibles para generar el PDF.</p>'}
</body>
</html>
`;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const nombreArchivo = `PlanCompleto-${nombreLimpio}.pdf`;
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
      console.error("Error al generar o compartir PDF combinado:", e);
      Alert.alert('Error', 'No se pudo generar o compartir el PDF. Revisa la consola para más detalles.');
    }
  };

  return (
    <TouchableOpacity
      onPress={handleDownload}
      activeOpacity={0.9}
      disabled={loading}
      style={[styles.actionButtonWrapper, style]}
    >
      <LinearGradient colors={[APP_PALETTE.button_gradient_start, APP_PALETTE.button_gradient_end]} style={styles.actionButtonBorder}>
        <BlurView intensity={50} tint="dark" style={styles.actionButton}>
          {loading ? (
            <ActivityIndicator color={APP_PALETTE.dark} size="small" />
          ) : (
            <Ionicons name="cloud-download-outline" size={iconSize} color={APP_PALETTE.primary} />
          )}
          <Text style={styles.actionButtonText}>{title}</Text>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionButtonWrapper: {
    flex: 1,
  },
  actionButtonBorder: {
    borderRadius: 50,
    padding: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    paddingVertical: 15,
    overflow: 'hidden',
  },
  actionButtonText: {
    color: APP_PALETTE.primary,
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 17,
    letterSpacing: 0.2,
  },
});

export default DownloadCombinedPdfButton;
