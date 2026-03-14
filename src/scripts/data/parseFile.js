function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data),
      error: (err) => reject(err),
    });
  });
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Falha ao carregar: ${url}`));
    document.head.appendChild(script);
  });
}

async function ensureXlsxDependency() {
  if (typeof XLSX !== "undefined") return;

  const fallbacks = [
    "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/xlsx.full.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
    "https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js",
  ];

  let lastError = null;
  for (const url of fallbacks) {
    try {
      await loadScript(url);
      if (typeof XLSX !== "undefined") return;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Dependencia SheetJS indisponivel para leitura de XLSX. Use CSV ou tente novamente. ${lastError ? `Detalhe: ${lastError.message}` : ""}`,
  );
}

async function parseXlsx(file) {
  await ensureXlsxDependency();

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { defval: null });
}

export async function parseFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "csv") {
    return parseCsv(file);
  }

  if (["xlsx", "xls"].includes(ext)) {
    return parseXlsx(file);
  }

  throw new Error("Formato invalido. Use CSV ou XLSX.");
}
