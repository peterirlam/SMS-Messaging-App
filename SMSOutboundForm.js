function getScriptUrl() {
  var url = ScriptApp.getService().getUrl();
  return url;
}

function uuid() {
  return Utilities.getUuid();
}

function doGet(e) {
  var offline = false;
  if (offline) {
    var html = HtmlService.createTemplateFromFile('Result');
  } else {
    var html = HtmlService.createTemplateFromFile('SMS');
    html.displaystatus = "display:none";
    html.clientmobile = "";
    html.caseid = "";
    var replyaddr = Session.getActiveUser().getEmail();
    replyaddr = replyaddr.replace("calancs", "calw");
    html.replyaddr = replyaddr;
  }
  return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  if (typeof e !== 'undefined')
    var clientmobile = e.parameter.clientmobile;
  var message = e.parameter.message;
  var caseid = e.parameter.caseid;
  var anon = e.parameter.anon;
  var originator;
  if (anon == "on") {
    originator = "New Message";
  } else {
    originator = "CAL West";
  }
  var replyaddr = Session.getActiveUser().getEmail();
  replyaddr = replyaddr.replace("calancs", "calw");
  clientmobile = clientmobile.replace(/^0+/, '');
  var uuidentifier = uuid();
  var sheet = SpreadsheetApp.openById("1xxHYdpnaOG1Ze6pDXFl2Br_ieIMaFxHZTDW6hltB8k4");
  SpreadsheetApp.setActiveSpreadsheet(sheet);
  sheet.appendRow([uuidentifier, caseid, replyaddr, clientmobile, message, Utilities.formatDate(new Date(), "GMT+1", "dd/MM/yyyy"), Utilities.formatDate(new Date(), "GMT+1", "HH:mm:ss")]);
  var url = "tinyurl.com/y6rb83ru?u=" + uuidentifier;
  var html = HtmlService.createTemplateFromFile('SMS');
  message = message + "\n\nREPLY BELOW:\n" + url;
  if (sendSMSAQL(clientmobile, message, originator)) {
    status = "Message sent to client mobile 0" + clientmobile;
    html.replyaddr = Session.getActiveUser().getEmail();
    html.caseid = caseid
    html.clientmobile = clientmobile;
    html.displaystatus = "display:inline;";
  } else {
    status = "Problem sending message";
    html.result = status;
  }
  html.result = status;
  return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}