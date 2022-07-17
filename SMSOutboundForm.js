function getScriptUrl() {
  let url = ScriptApp.getService().getUrl();
  return url;
}

function uuid() {
  return Utilities.getUuid();
}

function doGet(e) {
  let offline = false;
  if (offline) {
    let html = HtmlService.createTemplateFromFile("Result");
  } else {
    let html = HtmlService.createTemplateFromFile("SMS");
    html.displaystatus = "display:none";
    html.clientmobile = "";
    html.caseid = "";
    let replyaddr = Session.getActiveUser().getEmail();
    replyaddr = replyaddr.replace("calancs", "calw");
    html.replyaddr = replyaddr;
  }
  return html
    .evaluate()
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  if (typeof e !== "undefined") let clientmobile = e.parameter.clientmobile;
  let message = e.parameter.message;
  let caseid = e.parameter.caseid;
  let anon = e.parameter.anon;
  let originator;
  if (anon == "on") {
    originator = "New Message";
  } else {
    originator = "CAL West";
  }
  let replyaddr = Session.getActiveUser().getEmail();
  replyaddr = replyaddr.replace("calancs", "calw");
  clientmobile = clientmobile.replace(/^0+/, "");
  let uuidentifier = uuid();
  let sheet = SpreadsheetApp.openById(
    "1xxHYdpnaOG1Ze6pDXFl2Br_ieIMaFxHZTDW6hltB8k4"
  );
  SpreadsheetApp.setActiveSpreadsheet(sheet);
  sheet.appendRow([
    uuidentifier,
    caseid,
    replyaddr,
    clientmobile,
    message,
    Utilities.formatDate(new Date(), "GMT+1", "dd/MM/yyyy"),
    Utilities.formatDate(new Date(), "GMT+1", "HH:mm:ss"),
  ]);
  let url = "tinyurl.com/y6rb83ru?u=" + uuidentifier;
  let html = HtmlService.createTemplateFromFile("SMS");
  message = message + "\n\nREPLY BELOW:\n" + url;
  if (sendSMSAQL(clientmobile, message, originator)) {
    status = "Message sent to client mobile 0" + clientmobile;
    html.replyaddr = Session.getActiveUser().getEmail();
    html.caseid = caseid;
    html.clientmobile = clientmobile;
    html.displaystatus = "display:inline;";
  } else {
    status = "Problem sending message";
    html.result = status;
  }
  html.result = status;
  return html
    .evaluate()
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  function sendSMSAQL(to, body, originator) {
    let data = {
      originator: originator,
      destinations: ["44" + to],
      message: body,
    };
    let options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(data),
      headers: {
        "X-Auth-Token":
          "db0a3ec165f872294d798dc1fad81016fd3d193bb0385bf2449a9ec9b3a44210e1de3374",
        contentType: "application/json",
      },
    };
    let response = UrlFetchApp.fetch(
      "https://api.aql.com/v2/sms/send",
      options
    );
    Logger.log(response.getResponseCode());
    if (response.getResponseCode() == 200) {
      return true;
    } else {
      return false;
    }
  }
}
