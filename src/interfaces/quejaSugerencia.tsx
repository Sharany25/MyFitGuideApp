export interface QuejaSugerenciaDTO {
  tipo: 'queja' | 'sugerencia';
  mensaje: string;
  usuarioId?: string;
  emailContacto?: string;
  categoria: 'acceso' | 'funcionalidad';
}
