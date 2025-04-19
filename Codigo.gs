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

function traducirTexto(texto, idiomaOrigen = 'es', idiomaDestino = 'en') {
  return LanguageApp.translate(texto, idiomaOrigen, idiomaDestino);
}

function obtenerRecetasDesdeSpoonacular(query, dieta = "", cantidad = 5) {
  const queryTraducido = traducirTexto(query);
  const apiKey = '92a4f016fcea46bfb73cb134375682c0';
  const baseUrl = 'https://api.spoonacular.com/recipes/complexSearch';
  const url = `${baseUrl}?query=${encodeURIComponent(queryTraducido)}&diet=${encodeURIComponent(dieta)}&number=${cantidad}&apiKey=${apiKey}`;

  try {
    const respuesta = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const codigo = respuesta.getResponseCode();

    if (codigo !== 200) {
      Logger.log(`Error al buscar receta: Código ${codigo} - ${respuesta.getContentText()}`);
      return [];
    }

    const datos = JSON.parse(respuesta.getContentText());
    if (!datos.results || datos.results.length === 0) return [];

    return datos.results.map(recetaBase => {
      const recetaId = recetaBase.id;
      const detalleUrl = `https://api.spoonacular.com/recipes/${recetaId}/information?includeNutrition=true&apiKey=${apiKey}`;
      const detalleResp = UrlFetchApp.fetch(detalleUrl, { muteHttpExceptions: true });
      const codigoDetalle = detalleResp.getResponseCode();

      if (codigoDetalle !== 200) {
        Logger.log(`Error al obtener detalles de receta: Código ${codigoDetalle} - ${detalleResp.getContentText()}`);
        return null;
      }

      const detalle = JSON.parse(detalleResp.getContentText());
      const ingredientesOriginal = detalle.extendedIngredients.map(i => i.original).join(', ');
      const calorias = detalle.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || "No disponible";
      const resumen = detalle.summary || detalle.instructions || "Visita el enlace para más información";

      return {
        nombre: traducirTexto(detalle.title, 'en', 'es'),
        ingredientes: traducirTexto(ingredientesOriginal, 'en', 'es'),
        preparacion: traducirTexto("Puedes ver la receta completa aquí: " + detalle.sourceUrl, 'en', 'es'),
        calorias: calorias,
        imagen: detalle.image
      };
    }).filter(r => r !== null);
  } catch (error) {
    Logger.log("⚠️ Excepción inesperada al usar la API de Spoonacular: " + error);
    return [];
  }
}

function elegirReceta(preferencias, tipoComida, dieta = "") {
  const preferenciasUsuario = preferencias.toLowerCase().split(",").map(p => p.trim());
  const queryAleatoria = preferenciasUsuario[Math.floor(Math.random() * preferenciasUsuario.length)];
  const alternativas = obtenerRecetasDesdeSpoonacular(queryAleatoria, dieta, 5);

  if (alternativas.length > 0) {
    const recetaAleatoria = alternativas[Math.floor(Math.random() * alternativas.length)];
    return recetaAleatoria;
  }

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