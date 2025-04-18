const RECETAS = {
  desayuno: [
    {
      nombre: "Avena con fruta",
      etiquetas: ["avena", "fruta", "saludable", "sin carne"],
      ingredientes: "Avena, Fruta, Leche o agua, Miel",
      preparacion: "Cocina la avena con leche o agua y agrega fruta fresca."
    },
    {
      nombre: "Huevos revueltos con pan tostado",
      etiquetas: ["huevos", "pan tostado", "rápido", "salado"],
      ingredientes: "Huevos, Pan, Sal, Aceite",
      preparacion: "Revuelve los huevos en sartén y acompaña con pan tostado."
    }
  ],
  almuerzo: [
    {
      nombre: "Arroz con pollo",
      etiquetas: ["arroz", "pollo", "económico", "mexicano"],
      ingredientes: "Arroz, Pollo, Cebolla, Ajo",
      preparacion: "Cocina el arroz y el pollo por separado, luego mezcla todo."
    },
    {
      nombre: "Ensalada de pasta vegetariana",
      etiquetas: ["pasta", "verduras", "sin carne", "saludable", "vegetariano"],
      ingredientes: "Pasta, Tomate, Pepino, Aderezo",
      preparacion: "Cocina la pasta y mézclala con los vegetales y aderezo."
    }
  ],
  cena: [
    {
      nombre: "Sopa de verduras",
      etiquetas: ["sopa", "ligero", "sin carne", "vegetariano", "saludable"],
      ingredientes: "Zanahoria, Papa, Calabaza, Agua, Sal",
      preparacion: "Hierve las verduras hasta que estén suaves. Agrega sal al gusto."
    },
    {
      nombre: "Quesadillas",
      etiquetas: ["queso", "tortillas", "rápido", "económico"],
      ingredientes: "Tortillas, Queso",
      preparacion: "Rellena las tortillas con queso y caliéntalas en sartén."
    }
  ]
};
function onFormSubmit(e) {
  const [timestamp, preferenciasDesayuno, preferenciasAlmuerzo, preferenciasCena] = e.values;
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const fila = hoja.getLastRow();

  const recetaD = elegirReceta(preferenciasDesayuno, "desayuno");
  const recetaA = elegirReceta(preferenciasAlmuerzo, "almuerzo");
  const recetaC = elegirReceta(preferenciasCena, "cena");

  hoja.getRange(fila, 5).setValue(recetaD.nombre);
  hoja.getRange(fila, 6).setValue(recetaD.ingredientes);
  hoja.getRange(fila, 7).setValue(recetaD.preparacion);

  hoja.getRange(fila, 8).setValue(recetaA.nombre);
  hoja.getRange(fila, 9).setValue(recetaA.ingredientes);
  hoja.getRange(fila, 10).setValue(recetaA.preparacion);

  hoja.getRange(fila, 11).setValue(recetaC.nombre);
  hoja.getRange(fila, 12).setValue(recetaC.ingredientes);
  hoja.getRange(fila, 13).setValue(recetaC.preparacion);
}
function elegirReceta(preferencias, tipoComida) {
  const preferenciasUsuario = preferencias.toLowerCase().split(",").map(p => p.trim());
  let mejorReceta = null;
  let coincidenciasMax = 0;

  for (const receta of RECETAS[tipoComida]) {
    const coincidencias = receta.etiquetas.filter(etiqueta => preferenciasUsuario.includes(etiqueta)).length;
    
    if (coincidencias > coincidenciasMax) {
      coincidenciasMax = coincidencias;
      mejorReceta = receta;
    }
  }

  if (coincidenciasMax === 0) {
    return {
      nombre: "No se encontró una receta",
      ingredientes: "Intenta con preferencias diferentes.",
      preparacion: "No hay coincidencias con tus preferencias."
    };
  }

  return mejorReceta;
}

