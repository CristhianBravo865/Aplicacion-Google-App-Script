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
  const [timestamp, prefDesayuno, prefAlmuerzo, prefCena] = e.values;
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const fila = hoja.getLastRow();

  const recetas = {
    desayuno: elegirReceta(prefDesayuno, "desayuno"),
    almuerzo: elegirReceta(prefAlmuerzo, "almuerzo"),
    cena: elegirReceta(prefCena, "cena")
  };

  Object.entries(recetas).forEach(([tipo, receta], i) => {
    const baseColumna = 5 + i * 3;
    hoja.getRange(fila, baseColumna).setValue(receta.nombre);
    hoja.getRange(fila, baseColumna + 1).setValue(receta.ingredientes);
    hoja.getRange(fila, baseColumna + 2).setValue(receta.preparacion);
  });
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
