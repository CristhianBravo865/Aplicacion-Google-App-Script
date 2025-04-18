function onFormSubmit(e) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let dashboard = ss.getSheetByName("Dashboard");
  
    // crear el dashboard si no existe
    if (!dashboard) {
      dashboard = ss.insertSheet("Dashboard");
    }
  
    // limpiar el dashboard
    dashboard.clear();
  
    // títulos principales
    dashboard.getRange("A1").setValue("Panel de Recetas").setFontSize(16).setFontWeight("bold");
    dashboard.getRange("A3").setValue("Preferencias").setFontSize(12).setFontWeight("bold");
  
    // preferencias del usuario
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
  
    // obtener recetas
    const recetas = {
      desayuno: elegirReceta(prefDesayuno, "desayuno"),
      almuerzo: elegirReceta(prefAlmuerzo, "almuerzo"),
      cena: elegirReceta(prefCena, "cena"),
    };
  
    // mostrar resultados en el dashboard
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
  