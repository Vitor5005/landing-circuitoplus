const SITE_URL = "";

const SHEET_NAME = "Solicitacoes";
const HEADERS = [
  "Data e hora",
  "Nome",
  "E-mail",
  "Telefone",
  "Aparelho",
  "Problema",
  "Mensagem",
  "Consentimento"
];
const PROBLEMS = ["Tela", "Bateria", "Carregamento", "Sistema/Desempenho", "Outros"];
const LIMITS = {
  name: 120,
  email: 254,
  phone: 32,
  device: 120,
  problem: 40,
  message: 1500
};

/**
 * Exibe uma confirmação simples de que o Web App está ativo.
 */
function doGet() {
  return htmlOutput_(
    "Serviço ativo",
    "O recebimento de solicitações da Circuito+ está ativo.",
    false
  );
}

/**
 * Valida e registra uma solicitação enviada pelo formulário HTML.
 */
function doPost(e) {
  const input = e && e.parameter ? e.parameter : {};

  if (asText_(input.website)) {
    return htmlOutput_(
      "Solicitação não enviada",
      "Não foi possível processar esta solicitação.",
      true
    );
  }

  const request = {
    name: asText_(input.nome).trim(),
    email: asText_(input.email).trim(),
    phone: asText_(input.telefone).trim(),
    device: asText_(input.aparelho).trim(),
    problem: asText_(input.problema).trim(),
    message: asText_(input.mensagem).trim(),
    consent: asText_(input.consentimento)
  };

  const validationMessage = validateRequest_(request);
  if (validationMessage) {
    return htmlOutput_("Solicitação não enviada", validationMessage, true);
  }

  let lock;
  try {
    lock = LockService.getDocumentLock();
    lock.waitLock(30000);

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error("Planilha vinculada não encontrada.");
    }

    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      safeCellText_(request.name),
      safeCellText_(request.email),
      safeCellText_(request.phone),
      safeCellText_(request.device),
      safeCellText_(request.problem),
      safeCellText_(request.message),
      "Sim"
    ]);
    SpreadsheetApp.flush();

    return htmlOutput_(
      "Solicitação recebida!",
      "Recebemos seus dados e entraremos em contato após avaliar as informações enviadas.",
      false
    );
  } catch (error) {
    console.error(error);
    return htmlOutput_(
      "Erro de processamento",
      "Não foi possível registrar sua solicitação agora. Tente novamente mais tarde.",
      true
    );
  } finally {
    if (lock && lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

function validateRequest_(request) {
  if (!request.name || !request.email || !request.problem || request.consent !== "consentimento") {
    return "Preencha os campos obrigatórios e confirme o consentimento para contato.";
  }

  if (!isValidEmail_(request.email)) {
    return "Informe um endereço de e-mail válido.";
  }

  if (!PROBLEMS.includes(request.problem)) {
    return "Selecione uma opção válida para o problema do aparelho.";
  }

  if (
    request.name.length > LIMITS.name ||
    request.email.length > LIMITS.email ||
    request.phone.length > LIMITS.phone ||
    request.device.length > LIMITS.device ||
    request.problem.length > LIMITS.problem ||
    request.message.length > LIMITS.message
  ) {
    return "Um ou mais campos excedem o tamanho permitido.";
  }

  return "";
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function asText_(value) {
  return typeof value === "string" ? value : "";
}

/**
 * Evita que entradas textuais sejam interpretadas como fórmulas pela planilha.
 */
function safeCellText_(value) {
  const text = asText_(value).trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function htmlOutput_(title, message, isError) {
  const returnLink = validSiteUrl_()
    ? '<a class="back" href="' + escapeHtml_(SITE_URL) + '">Voltar ao site</a>'
    : "";
  const tone = isError ? "error" : "success";
  const page =
    '<!doctype html>' +
    '<html lang="pt-BR">' +
    '<head>' +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Circuito+ | ' + escapeHtml_(title) + '</title>' +
    '<style>' +
    ':root{color-scheme:light}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#f6f8fb;color:#111827;font:16px/1.55 Arial,sans-serif}.card{width:min(100%,560px);padding:40px;border:1px solid #dce3ed;border-radius:20px;background:#fff;box-shadow:0 18px 45px rgba(17,24,39,.08)}.mark{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:#12b8a6;color:#fff;font-weight:700;font-size:24px}.success{color:#087a6e}.error{color:#b45309}h1{margin:22px 0 10px;font-size:clamp(1.8rem,5vw,2.45rem);line-height:1.15}p{margin:0;color:#4b5563}.back{display:inline-block;margin-top:26px;padding:12px 18px;border-radius:10px;background:#111827;color:#fff;text-decoration:none;font-weight:700}.back:focus,.back:hover{background:#12b8a6;outline:3px solid #a7f3ed;outline-offset:3px}' +
    '</style>' +
    '</head>' +
    '<body><main class="card"><div class="mark" aria-hidden="true">+</div>' +
    '<h1 class="' + tone + '">' + escapeHtml_(title) + '</h1>' +
    '<p>' + escapeHtml_(message) + '</p>' +
    returnLink +
    '</main></body></html>';

  return HtmlService.createHtmlOutput(page).setTitle("Circuito+");
}

function validSiteUrl_() {
  return /^https:\/\/[^\s]+$/i.test(SITE_URL);
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
