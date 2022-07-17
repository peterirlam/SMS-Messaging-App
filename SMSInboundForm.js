function getRowUsingfindIndex(uid, returnrowID) {
  let term = uid;
  let ss = SpreadsheetApp.openById("1xxHYdpnaOG1Ze6pDXFl2Br_ieIMaFxHZTDW6hltB8k4");
  let data = ss.getActiveSheet().getRange(1, 1, ss.getLastRow()).getValues();
  let row = data.findIndex(rowindex => {
    return rowindex[0] == term
  });
  let columnValues = ss.getActiveSheet().getRange(row + 1, 1, row + 1, 10).getValues(); //1st is header row
  if (returnrowID) {
    return row;
  } else {
    return columnValues;
  }
}

function doGet(e) {
  if (typeof e !== 'undefined')
  let uid = e.parameter.u;
  let columnValues = getRowUsingfindIndex(uid, false);
  let clientmobile = columnValues[0][3];
  let caseid = columnValues[0][1];
  let replyaddr = columnValues[0][2];
  let origmessage = columnValues[0][4];
  let alreadyreplied = columnValues[0][7];
  if (alreadyreplied.length > 0) {
    let html = HtmlService.createTemplateFromFile('Result');
    html.caseid = caseid;
    html.replyOK_display = "display:none";
    html.linkExpired_display = "display:inline";
     return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else {
    let html = HtmlService.createTemplateFromFile('SMS');
    html.caseid = caseid;
    html.replyaddr = replyaddr;
    html.clientmobile = clientmobile;
    html.uid = uid;
    html.origmessage = origmessage;
    return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

function doPost(e) {
  if (typeof e !== 'undefined')
  let clientmobile = e.parameter.clientmobile;
  let message = e.parameter.message;
  let caseid = e.parameter.caseid;
  let replyaddr = e.parameter.replyaddr;
  let uid = e.parameter.uid;
  let origmessage = e.parameter.origmessage;
  let ss = SpreadsheetApp.openById("1xxHYdpnaOG1Ze6pDXFl2Br_ieIMaFxHZTDW6hltB8k4");
  let row = getRowUsingfindIndex(uid, true);
  ss.getActiveSheet().getRange(row + 1, 8).setValue(message);
  ss.getActiveSheet().getRange(row + 1, 9).setValue(Utilities.formatDate(new Date(), "GMT+1", "dd/MM/yyyy"));
  ss.getActiveSheet().getRange(row + 1, 10).setValue(Utilities.formatDate(new Date(), "GMT+1", "HH:mm:ss"));
  clientmobile = clientmobile.replace(/^0+/, '')
  let html = HtmlService.createTemplateFromFile('Result');
  html.caseid = caseid;
  html.replyOK_display = "display:inline";
  html.linkExpired_display = "display:none";
  GmailApp.sendEmail(replyaddr, "Text reply from client mobile: 0" + clientmobile, "Case No: " + caseid + "\n\n\Message from CA Lancs:  -->\n" + origmessage + "\n\n\nClient Message Reply:  <--\n" + message, {
    from: 'admin@calw.org.uk'
  });
  return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
