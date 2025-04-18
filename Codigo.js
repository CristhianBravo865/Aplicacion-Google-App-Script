const RECETAS = {
  desayuno: [
    {
      nombre: "Avena con fruta",
      etiquetas: ["avena", "fruta", "saludable", "sin carne"].map(e => e.toLowerCase()),
      ingredientes: "Avena, Fruta, Leche o agua, Miel",
      preparacion: "Cocina la avena con leche o agua y agrega fruta fresca."
    },
    {
      nombre: "Huevos revueltos con pan tostado",
      etiquetas: ["huevos", "pan tostado", "rápido", "salado"].map(e => e.toLowerCase()),
      ingredientes: "Huevos, Pan, Sal, Aceite",
      preparacion: "Revuelve los huevos en sartén y acompaña con pan tostado."
    }
  ],
  almuerzo: [
    {
      nombre: "Arroz con pollo",
      etiquetas: ["arroz", "pollo", "económico", "mexicano"].map(e => e.toLowerCase()),
      ingredientes: "Arroz, Pollo, Cebolla, Ajo",
      preparacion: "Cocina el arroz y el pollo por separado, luego mezcla todo."
    },
    {
      nombre: "Ensalada de pasta vegetariana",
      etiquetas: ["pasta", "verduras", "sin carne", "saludable", "vegetariano"].map(e => e.toLowerCase()),
      ingredientes: "Pasta, Tomate, Pepino, Aderezo",
      preparacion: "Cocina la pasta y mézclala con los vegetales y aderezo."
    }
  ],
  cena: [
    {
      nombre: "Sopa de verduras",
      etiquetas: ["sopa", "ligero", "sin carne", "vegetariano", "saludable"].map(e => e.toLowerCase()),
      ingredientes: "Zanahoria, Papa, Calabaza, Agua, Sal",
      preparacion: "Hierve las verduras hasta que estén suaves. Agrega sal al gusto."
    },
    {
      nombre: "Quesadillas",
      etiquetas: ["queso", "tortillas", "rápido", "económico"].map(e => e.toLowerCase()),
      ingredientes: "Tortillas, Queso",
      preparacion: "Rellena las tortillas con queso y caliéntalas en sartén."
    }
  ]
};

function onFormSubmit(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboard = ss.getSheetByName("Dashboard");

  // Crear el dashboard si no existe
  if (!dashboard) {
    dashboard = ss.insertSheet("Dashboard");
  }

  // Limpiar el dashboard
  dashboard.clear();

  // Títulos principales
  dashboard.getRange("A1").setValue("Panel de Recetas").setFontSize(16).setFontWeight("bold");
  dashboard.getRange("A3").setValue("Preferencias").setFontSize(12).setFontWeight("bold");

  // Preferencias del usuario
  const [timestamp, prefDesayuno, prefAlmuerzo, prefCena] = e.values;
  dashboard.getRange("A4").setValue("Desayuno").setFontWeight("bold");
  dashboard.getRange("B4").setValue(prefDesayuno);

  dashboard.getRange("A5").setValue("Almuerzo").setFontWeight("bold");
  dashboard.getRange("B5").setValue(prefAlmuerzo);

  dashboard.getRange("A6").setValue("Cena").setFontWeight("bold");
  dashboard.getRange("B6").setValue(prefCena);

  // Títulos para resultados
  dashboard.getRange("A8").setValue("Resultados").setFontSize(12).setFontWeight("bold");
  dashboard.getRange("A9").setValue("Tipo de Comida");
  dashboard.getRange("B9").setValue("Nombre de la Receta");
  dashboard.getRange("C9").setValue("Ingredientes");
  dashboard.getRange("D9").setValue("Preparación");

  dashboard.getRange("A9:D9").setFontWeight("bold").setBackground("#f4f4f4");

  // Obtener recetas
  const recetas = {
    desayuno: elegirReceta(prefDesayuno, "desayuno"),
    almuerzo: elegirReceta(prefAlmuerzo, "almuerzo"),
    cena: elegirReceta(prefCena, "cena")
  };

  // Mostrar resultados en el dashboard
  const tipos = ["Desayuno", "Almuerzo", "Cena"];
  Object.entries(recetas).forEach(([tipo, receta], index) => {
    const row = 10 + index;
    dashboard.getRange(row, 1).setValue(tipos[index]);
    dashboard.getRange(row, 2).setValue(receta.nombre);
    dashboard.getRange(row, 3).setValue(receta.ingredientes);
    dashboard.getRange(row, 4).setValue(receta.preparacion);
  });

  SpreadsheetApp.getUi().alert("Las recetas han sido actualizadas en el Panel");
}

function elegirReceta(preferencias, tipoComida) {
  const preferenciasUsuario = preferencias.toLowerCase().split(",").map(p => p.trim());
  const recetas = RECETAS[tipoComida];

  const recetaElegida = recetas.reduce(
    (mejor, receta) => {
      const coincidencias = receta.etiquetas.filter(et => preferenciasUsuario.includes(et)).length;
      return coincidencias > mejor.coincidencias ? { receta, coincidencias } : mejor;
    },
    { receta: null, coincidencias: 0 }
  ).receta;

  return recetaElegida || {
    nombre: "No se encontró una receta",
    ingredientes: "Intenta con preferencias diferentes.",
    preparacion: "No hay coincidencias con tus preferencias."
  };
}
