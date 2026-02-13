import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import Color from "colorjs.io";

/**
 * Reemplaza ocurrencias de oklab(...)/oklch(...) dentro de strings (gradients, shadows, filters)
 * por rgb(...), para que html2canvas no intente parsear oklab.
 */
const replaceModernColorsInString = (input) => {
  if (!input || typeof input !== "string") return input;
  let s = input;

  const replaceFunc = (fnName) => {
    let i = 0;
    while (i < s.length) {
      const idx = s.toLowerCase().indexOf(fnName + "(", i);
      if (idx === -1) break;

      // Encontrar el cierre de paréntesis correspondiente
      let start = idx + fnName.length + 1; // después de "("
      let depth = 1;
      let j = start;
      while (j < s.length && depth > 0) {
        const ch = s[j];
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
        j++;
      }

      // Si no cerró bien, salimos
      if (depth !== 0) break;

      const full = s.slice(idx, j); // "oklab(...)"
      try {
        const rgb = new Color(full).to("srgb").toString({ format: "rgb" });
        s = s.slice(0, idx) + rgb + s.slice(j);
        i = idx + rgb.length;
      } catch {
        // Si no se pudo convertir, avanzamos para no quedar en loop
        i = j;
      }
    }
  };

  replaceFunc("oklab");
  replaceFunc("oklch");
  return s;
};

const fixBorderColorsForExport = (clonedDoc) => {
  const win = clonedDoc.defaultView;
  const all = clonedDoc.querySelectorAll("*");

  const borderProps = [
    "border-color",
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
    "outline-color",
  ];

  const toRgb = (v) => {
    try {
      return new Color(v).to("srgb").toString({ format: "rgb" }); // incluye alpha si aplica
    } catch {
      return null;
    }
  };

  all.forEach((el) => {
    const cs = win.getComputedStyle(el);

    borderProps.forEach((p) => {
      const v = cs.getPropertyValue(p)?.trim();
      if (!v) return;

      if (v.toLowerCase().includes("oklab(") || v.toLowerCase().includes("oklch(")) {
        const rgb = toRgb(v);
        if (rgb) {
          // setProperty con prioridad !important para que no lo sobreescriba nada
          el.style.setProperty(p, rgb, "important");
        } else {
          // fallback para que no crashee
          el.style.setProperty(p, "rgba(0,0,0,0)", "important");
        }
      }
    });
  });
};

export const fixColorsForExport = (clonedDoc) => {
  const win = clonedDoc.defaultView;
  const all = clonedDoc.querySelectorAll("*");

  // Props donde suelen aparecer oklab/oklch en string (gradients/shadows/filtros)
  const stringProps = [
    "backgroundImage",
    "boxShadow",
    "textShadow",
    "filter",
    "backdropFilter",
    "outline",
    "textDecoration",
  ];

  // Props “color simples”
  const colorProps = [
    "color",
    "backgroundColor",
    "borderColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "outlineColor",
    "textDecorationColor",
    "fill",
    "stroke",
  ];

  const toRgbCss = (value) => {
    if (!value) return value;
    const v = value.trim().toLowerCase();
    if (v === "none" || v === "transparent" || v === "inherit" || v === "initial") return value;
    if (v.startsWith("rgb(") || v.startsWith("rgba(") || v.startsWith("#") || v.startsWith("hsl(") || v.startsWith("hsla(")) {
      return value;
    }
    try {
      return new Color(value).to("srgb").toString({ format: "rgb" });
    } catch {
      return value;
    }
  };

  all.forEach((el) => {
    const cs = win.getComputedStyle(el);

    // 1) Convertir colores simples
    colorProps.forEach((prop) => {
      const val = cs[prop];
      if (!val) return;

      let out = val;
      if (val.toLowerCase().includes("oklab(") || val.toLowerCase().includes("oklch(")) {
        // por si viene directo como oklab(...)
        out = toRgbCss(val);
      }

      if (out !== val) el.style[prop] = out;
    });

    // 2) Convertir strings complejos (gradients/shadows/filters)
    stringProps.forEach((prop) => {
      const val = cs[prop];
      if (!val) return;

      if (val.toLowerCase().includes("oklab(") || val.toLowerCase().includes("oklch(")) {
        const replaced = replaceModernColorsInString(val);

        // Si aún quedara oklab/oklch, aplanamos esa propiedad para evitar crash
        const stillBad =
          replaced.toLowerCase().includes("oklab(") || replaced.toLowerCase().includes("oklch(");

        if (stillBad) {
          // “Aplanado” seguro
          if (prop === "backgroundImage") el.style.backgroundImage = "none";
          else if (prop === "boxShadow") el.style.boxShadow = "none";
          else if (prop === "textShadow") el.style.textShadow = "none";
          else if (prop === "filter") el.style.filter = "none";
          else if (prop === "backdropFilter") el.style.backdropFilter = "none";
          else el.style[prop] = "none";
        } else {
          el.style[prop] = replaced;
        }
      }
    });
  });
};


export const exportAsImage = async (elementId, filename = 'resumen-vaquita') => {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff', // Fondo sólido para evitar transparencias raras
      logging: false,
      onclone: (clonedDoc) => {
        fixColorsForExport(clonedDoc);
        fixBorderColorsForExport(clonedDoc);
      }
    });

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = image;
    link.click();
    return true;
  } catch (error) {
    console.error('Error exporting image:', error);
    return false;
  }
};

export const exportAsPDF = async (elementId, filename = 'resumen-vaquita') => {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        fixColorsForExport(clonedDoc);
      },
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Ajuste simple para que quepa en la página
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return false;
  }
};