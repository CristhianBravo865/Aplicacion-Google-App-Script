const RECETAS = {
  desayuno: [
    {
      nombre: "Avena con fruta",
      etiquetas: ["avena", "fruta", "saludable", "sin carne"].map(e => e.toLowerCase()),
      ingredientes: "Avena, Fruta, Leche o agua, Miel",
      preparacion: "Cocina la avena con leche o agua y agrega fruta fresca.",
      calorias: 250,
      imagen: ""
    },
    {
      nombre: "Huevos revueltos con pan tostado",
      etiquetas: ["huevos", "pan tostado", "rápido", "salado"].map(e => e.toLowerCase()),
      ingredientes: "Huevos, Pan, Sal, Aceite",
      preparacion: "Revuelve los huevos en sartén y acompaña con pan tostado.",
      calorias: 300,
      imagen: ""
    }
  ],
  almuerzo: [
    {
      nombre: "Arroz con pollo",
      etiquetas: ["arroz", "pollo", "económico", "mexicano"].map(e => e.toLowerCase()),
      ingredientes: "Arroz, Pollo, Cebolla, Ajo",
      preparacion: "Cocina el arroz y el pollo por separado, luego mezcla todo.",
      calorias: 550,
      imagen: ""
    },
    {
      nombre: "Ensalada de pasta vegetariana",
      etiquetas: ["pasta", "verduras", "sin carne", "saludable", "vegetariano"].map(e => e.toLowerCase()),
      ingredientes: "Pasta, Tomate, Pepino, Aderezo",
      preparacion: "Cocina la pasta y mézclala con los vegetales y aderezo.",
      calorias: 400,
      imagen: ""
    }
  ],
  cena: [
    {
      nombre: "Sopa de verduras",
      etiquetas: ["sopa", "ligero", "sin carne", "vegetariano", "saludable"].map(e => e.toLowerCase()),
      ingredientes: "Zanahoria, Papa, Calabaza, Agua, Sal",
      preparacion: "Hierve las verduras hasta que estén suaves. Agrega sal al gusto.",
      calorias: 200,
      imagen: ""
    },
    {
      nombre: "Quesadillas",
      etiquetas: ["queso", "tortillas", "rápido", "económico"].map(e => e.toLowerCase()),
      ingredientes: "Tortillas, Queso",
      preparacion: "Rellena las tortillas con queso y caliéntalas en sartén.",
      calorias: 350,
      imagen: ""
    }
  ]
};

function obtenerRecetasDesdeSpoonacular(query, dieta = "") {
  const apiKey = 'afb7a30a34584ad2b42b3ae71f3aa9b9';
  const baseUrl = 'https://api.spoonacular.com/recipes/complexSearch';
  const url = `${baseUrl}?query=${encodeURIComponent(query)}&diet=${encodeURIComponent(dieta)}&number=1&apiKey=${apiKey}`;

  try {
    const respuesta = UrlFetchApp.fetch(url);
    const datos = JSON.parse(respuesta.getContentText());

    if (!datos.results || datos.results.length === 0) return [];

    const recetaBase = datos.results[0];
    const recetaId = recetaBase.id;

    // Segunda llamada para obtener detalles
    const detalleUrl = `https://api.spoonacular.com/recipes/${recetaId}/information?includeNutrition=true&apiKey=${apiKey}`;
    const detalleResp = UrlFetchApp.fetch(detalleUrl);
    const detalle = JSON.parse(detalleResp.getContentText());

    const ingredientes = detalle.extendedIngredients.map(i => i.original).join(', ');
    const calorias = detalle.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || "No disponible";

    return [{
      nombre: detalle.title,
      ingredientes: ingredientes,
      preparacion: detalle.sourceUrl, // Es un link a la receta
      calorias: calorias,
      imagen: detalle.image
    }];
  } catch (error) {
    Logger.log("Error con la API de Spoonacular: " + error);
    return [];
  }
}


function elegirReceta(preferencias, tipoComida, dieta = "") {
  const preferenciasUsuario = preferencias.toLowerCase().split(",").map(p => p.trim());
  const recetas = RECETAS[tipoComida];

  const recetaElegida = recetas.reduce(
    (mejor, receta) => {
      const coincidencias = receta.etiquetas.filter(et => preferenciasUsuario.includes(et)).length;
      return coincidencias > mejor.coincidencias ? { receta, coincidencias } : mejor;
    },
    { receta: null, coincidencias: 0 }
  ).receta;

  if (recetaElegida) return recetaElegida;

  // 🚀 Si no encontró nada local, busca en Spoonacular
  const alternativas = obtenerRecetasDesdeSpoonacular(preferencias, dieta);
  if (alternativas.length > 0) return alternativas[0];

  return {
    nombre: "No se encontró una receta",
    ingredientes: "Intenta con preferencias diferentes.",
    preparacion: "No hay coincidencias con tus preferencias.",
    calorias: "",
    imagen: ""
  };
}

function onFormSubmit(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboard = ss.getSheetByName("Dashboard");

  if (!dashboard) {
    dashboard = ss.insertSheet("Dashboard");
  }

  dashboard.clear();

  dashboard.getRange("A1").setValue("Planificador Semanal de Comidas").setFontSize(16).setFontWeight("bold");

  const [timestamp, prefDesayuno, prefAlmuerzo, prefCena, ingredientes, dieta] = e.values;

  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const tiposComida = ["Desayuno", "Almuerzo", "Cena"];
  const preferencias = {
    desayuno: prefDesayuno,
    almuerzo: prefAlmuerzo,
    cena: prefCena
  };

  dashboard.getRange("A3").setValue("Día");
  dashboard.getRange("B3").setValue("Tipo de comida");
  dashboard.getRange("C3").setValue("Receta");
  dashboard.getRange("D3").setValue("Ingredientes");
  dashboard.getRange("E3").setValue("Preparación");
  dashboard.getRange("F3").setValue("Calorías");
  dashboard.getRange("G3").setValue("Imagen");

  dashboard.getRange("A3:G3").setFontWeight("bold").setBackground("#f4f4f4");

  let row = 4;
  dias.forEach(dia => {
    tiposComida.forEach(tipo => {
      const receta = elegirReceta(preferencias[tipo.toLowerCase()], tipo.toLowerCase(), dieta);

      dashboard.getRange(row, 1).setValue(dia);
      dashboard.getRange(row, 2).setValue(tipo);
      dashboard.getRange(row, 3).setValue(receta.nombre);
      dashboard.getRange(row, 4).setValue(receta.ingredientes);
      dashboard.getRange(row, 5).setValue(receta.preparacion);
      dashboard.getRange(row, 6).setValue(receta.calorias);
      dashboard.getRange(row, 7).setFormula(`=IMAGE("${receta.imagen}")`);

      row++;
    });
  });

  SpreadsheetApp.getUi().alert("✅ Planificador semanal generado correctamente.");
}
