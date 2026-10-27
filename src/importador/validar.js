const ESTADOS = ["Operativa", "En taller", "Parada", "Alquilada", "Baja"];
const UNIDADES_MEDIDA = ["L", "m³"];

const texto = (valor) => (typeof valor === "string" ? valor.trim() : "");
const largoEntre = (valor, minimo, maximo) => valor.length >= minimo && valor.length <= maximo;
const enteroNoNegativo = (valor) => Number.isInteger(valor) && valor >= 0;

// Cada regla devuelve la fila para el modelo o el motivo del rechazo.

function tipo(registro, clave, nombres) {
  const nombre = texto(registro.nombre);
  if (!largoEntre(nombre, 1, 100)) return { motivo: "nombre vacío o de más de 100 caracteres" };
  if (nombres.has(nombre)) return { motivo: "nombre repetido" };
  nombres.add(nombre);
  return { fila: { [clave]: registro[clave], nombre } };
}

export const reglas = {
  TipoUnidad: (r, ctx) => tipo(r, "idTipoUnidad", ctx.nombresTipoUnidad),

  TipoDocumento: (r, ctx) => tipo(r, "idTipoDocumento", ctx.nombresTipoDocumento),

  Unidad: (r, ctx) => {
    const estado = r.eliminada || r.activa === false ? "Baja" : r.estado;
    const interno = texto(r.interno);
    const patente = texto(r.patente);
    if (!ESTADOS.includes(estado)) return { motivo: `estado desconocido "${r.estado}"` };
    if (!ctx.tiposUnidad.has(r.idTipoUnidad)) return { motivo: "tipo de unidad inexistente" };
    if (!largoEntre(interno, 1, 30)) return { motivo: "interno vacío o de más de 30 caracteres" };
    if (!largoEntre(patente, 1, 20)) return { motivo: "patente vacía o de más de 20 caracteres" };
    if (!enteroNoNegativo(r.kilometraje)) return { motivo: "kilometraje inválido" };
    if (ctx.internos.has(interno)) return { motivo: "interno repetido" };
    if (ctx.patentes.has(patente)) return { motivo: "patente repetida" };
    ctx.internos.add(interno);
    ctx.patentes.add(patente);
    return { fila: { idUnidad: r.idUnidad, idTipoUnidad: r.idTipoUnidad, interno, patente, estado, kilometraje: r.kilometraje } };
  },

  Chofer: (r) => {
    const nombre = texto(r.nombre);
    const apellido = texto(r.apellido);
    const numeroLicencia = texto(r.numeroLicencia);
    if (!largoEntre(nombre, 1, 100) || !largoEntre(apellido, 1, 100)) return { motivo: "nombre o apellido inválido" };
    if (numeroLicencia.length > 50) return { motivo: "número de licencia de más de 50 caracteres" };
    if (typeof r.activo !== "boolean") return { motivo: "estado activo sin informar" };
    return {
      fila: {
        idChofer: r.idChofer, nombre, apellido, numeroLicencia,
        vencimientoLicencia: r.vencimientoLicencia, activo: r.activo
      }
    };
  },

  AsignacionChofer: (r, ctx) => {
    if (!ctx.unidades.has(r.idUnidad)) return { motivo: "unidad inexistente" };
    if (!ctx.choferes.has(r.idChofer)) return { motivo: "chofer inexistente" };
    if (!r.fechaInicio) return { motivo: "sin fecha de inicio" };
    if (r.fechaFin && r.fechaFin < r.fechaInicio) return { motivo: "fecha de fin anterior al inicio" };
    if (!r.fechaFin) {
      if (ctx.choferesConVigente.has(r.idChofer)) return { motivo: "el chofer ya tiene una asignación vigente" };
      if (ctx.unidadesConVigente.has(r.idUnidad)) return { motivo: "la unidad ya tiene una asignación vigente" };
      ctx.choferesConVigente.add(r.idChofer);
      ctx.unidadesConVigente.add(r.idUnidad);
    }
    return {
      fila: {
        idAsignacionChofer: r.idAsignacionChofer, idUnidad: r.idUnidad, idChofer: r.idChofer,
        fechaInicio: r.fechaInicio, fechaFin: r.fechaFin
      }
    };
  },

  DocumentoUnidad: (r, ctx) => {
    if (!ctx.unidades.has(r.idUnidad)) return { motivo: "unidad inexistente" };
    if (!ctx.tiposDocumento.has(r.idTipoDocumento)) return { motivo: "tipo de documento inexistente" };
    const clave = `${r.idUnidad}-${r.idTipoDocumento}`;
    if (ctx.documentos.has(clave)) return { motivo: "documento repetido para la unidad y el tipo" };
    ctx.documentos.add(clave);
    return {
      fila: {
        idDocumentoUnidad: r.idDocumentoUnidad, idUnidad: r.idUnidad, idTipoDocumento: r.idTipoDocumento,
        fechaEmision: r.fechaEmision, fechaVencimiento: r.fechaVencimiento
      }
    };
  },

  CargaCombustible: (r, ctx) => {
    const tipoCombustible = texto(r.tipoCombustible);
    const lugar = texto(r.lugar) || null;
    const fuente = texto(r.fuente) || null;
    if (!ctx.unidades.has(r.idUnidad)) return { motivo: "unidad inexistente" };
    if (r.idChofer != null && !ctx.choferes.has(r.idChofer)) return { motivo: "chofer inexistente" };
    if (!largoEntre(tipoCombustible, 1, 50)) return { motivo: "tipo de combustible inválido" };
    if (!r.fecha) return { motivo: "sin fecha" };
    if (!(r.cantidad > 0 && r.cantidad < 1e9)) return { motivo: "cantidad no positiva" };
    if (!UNIDADES_MEDIDA.includes(r.unidadMedida)) return { motivo: "unidad de medida distinta de L o m³" };
    if (!enteroNoNegativo(r.kilometraje)) return { motivo: "kilometraje inválido" };
    if ((lugar?.length ?? 0) > 200 || (fuente?.length ?? 0) > 30) return { motivo: "lugar o fuente demasiado largos" };
    return {
      fila: {
        idCargaCombustible: r.idCargaCombustible, idUnidad: r.idUnidad, idChofer: r.idChofer ?? null,
        tipoCombustible, fecha: r.fecha, cantidad: r.cantidad, unidadMedida: r.unidadMedida,
        kilometraje: r.kilometraje, lugar, fuente
      }
    };
  }
};

export function nuevoContexto() {
  return {
    nombresTipoUnidad: new Set(),
    nombresTipoDocumento: new Set(),
    tiposUnidad: new Set(),
    tiposDocumento: new Set(),
    unidades: new Set(),
    choferes: new Set(),
    internos: new Set(),
    patentes: new Set(),
    choferesConVigente: new Set(),
    unidadesConVigente: new Set(),
    documentos: new Set()
  };
}

export function validar(entidad, registros, contexto) {
  const filas = [];
  const motivos = {};
  for (const registro of registros) {
    const resultado = reglas[entidad](registro, contexto);
    if (resultado.fila) {
      filas.push(resultado.fila);
    } else {
      motivos[resultado.motivo] = (motivos[resultado.motivo] || 0) + 1;
    }
  }
  return { filas, motivos };
}
