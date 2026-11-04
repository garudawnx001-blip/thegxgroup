/**
 * THE GX GROUP — Leads workbook
 * Receives every website submission (partnership, service, contact) and keeps the
 * status in step with the admin dashboard. Run setup() once, then deploy as a web app.
 */
var TOKEN = PropertiesService.getScriptProperties().getProperty('TOKEN') || '__TOKEN__';
var TZ = 'Asia/Kolkata';
var C = { navy: '#0B1B33', ink: '#0F172A', blue: '#087CF5', sky: '#5AA9FF', mist: '#EAF3FF', line: '#D6E4F5', white: '#FFFFFF', mute: '#64748B', gold: '#F2B33D', green: '#1FA971', red: '#E5484D' };
var PALETTE = ['#087CF5', '#0B1B33', '#5AA9FF', '#F2B33D', '#1FA971', '#9CC9FF', '#E5484D', '#7C8CA6'];

var TABS = {
  partnership_applications: {
    name: 'Partnerships', color: C.blue,
    cols: [['Reference', 'reference', 120], ['Received', 'created_at', 150], ['Status', 'status', 150], ['Founder', 'founder_name', 150], ['Email', 'email', 210], ['Phone', 'phone', 130], ['City', 'city', 110], ['Business', 'business_name', 170], ['Industry', 'industry', 140], ['Stage', 'stage', 130], ['Budget', 'estimated_budget', 140], ['Equity openness', 'equity_openness', 140], ['Co-founders', 'cofounders', 140], ['Website', 'website', 180], ['LinkedIn', 'linkedin', 180], ['Description', 'description', 280], ['Problem', 'problem', 260], ['Solution', 'solution', 260], ['Target customers', 'target_customers', 220], ['Requirements', 'requirements', 240], ['Features', 'features', 240], ['Additional details', 'additional_details', 220], ['Duplicate?', 'is_duplicate', 95], ['ID', 'id', 80]],
    statuses: ['new', 'under_review', 'shortlisted', 'contacted', 'meeting_scheduled', 'proposal_sent', 'accepted', 'rejected', 'on_hold']
  },
  service_enquiries: {
    name: 'Services', color: C.navy,
    cols: [['Reference', 'reference', 120], ['Received', 'created_at', 150], ['Status', 'status', 170], ['Name', 'name', 150], ['Email', 'email', 210], ['Phone', 'phone', 130], ['Company', 'company', 160], ['Project', 'project_name', 180], ['Project type', 'project_type', 160], ['Budget', 'budget_range', 140], ['Timeline', 'timeline', 120], ['Quotation (₹)', 'quotation_amount', 120], ['Description', 'description', 280], ['Features', 'features', 240], ['Reference links', 'reference_links', 200], ['Duplicate?', 'is_duplicate', 95], ['ID', 'id', 80]],
    statuses: ['new', 'reviewing', 'requirement_discussion', 'quotation_preparation', 'quotation_sent', 'negotiation', 'won', 'lost', 'on_hold']
  },
  contacts: {
    name: 'Contact', color: C.sky,
    cols: [['Received', 'created_at', 150], ['Status', 'handled', 120], ['Name', 'name', 160], ['Email', 'email', 220], ['Subject', 'subject', 220], ['Message', 'message', 420], ['ID', 'id', 80]],
    statuses: null
  }
};

var STATUS_COLORS = {
  'New': ['#E6F0FF', '#0B5FCC'], 'Under review': ['#FFF4DB', '#9A6400'], 'Reviewing': ['#FFF4DB', '#9A6400'],
  'Shortlisted': ['#EDE7FF', '#5B3CC4'], 'Contacted': ['#E3F6FF', '#0A6E99'], 'Meeting scheduled': ['#E3F6FF', '#0A6E99'],
  'Requirement discussion': ['#E3F6FF', '#0A6E99'], 'Quotation preparation': ['#EDE7FF', '#5B3CC4'], 'Proposal sent': ['#EDE7FF', '#5B3CC4'],
  'Quotation sent': ['#EDE7FF', '#5B3CC4'], 'Negotiation': ['#FFF4DB', '#9A6400'], 'Accepted': ['#DDF6EA', '#137A50'], 'Won': ['#DDF6EA', '#137A50'],
  'Rejected': ['#FDE6E7', '#B4232A'], 'Lost': ['#FDE6E7', '#B4232A'], 'On hold': ['#EEF1F5', '#475569'], 'Handled': ['#DDF6EA', '#137A50'], 'Open': ['#E6F0FF', '#0B5FCC']
};

function pretty_(s) { s = String(s || ''); return s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : ''; }
function safe_(v) { if (typeof v === 'string' && /^[=+\-@]/.test(v)) return "'" + v; return v; }

function cell_(key, rec) {
  var v = rec[key];
  if (v === null || v === undefined) return '';
  if (key === 'created_at') return new Date(v);
  if (key === 'status') return pretty_(v);
  if (key === 'handled') return v ? 'Handled' : 'Open';
  if (key === 'is_duplicate') return v ? 'Yes' : '';
  if (key === 'phone') return "'" + v;
  if (key === 'quotation_amount') return Number(v);
  return safe_(String(v));
}

function doPost(e) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.token !== TOKEN) return out_({ ok: false, error: 'unauthorised' });
    var cfg = TABS[body.table]; if (!cfg || !body.record) return out_({ ok: false, error: 'bad table' });
    var sh = SpreadsheetApp.getActive().getSheetByName(cfg.name);
    var row = cfg.cols.map(function (c) { return cell_(c[1], body.record); });
    var idCol = cfg.cols.length;
    var hit = sh.getRange(2, idCol, Math.max(sh.getLastRow() - 1, 1), 1).createTextFinder(String(body.record.id)).matchEntireCell(true).findNext();
    if (hit) sh.getRange(hit.getRow(), 1, 1, row.length).setValues([row]);
    else { sh.insertRowAfter(1); sh.getRange(2, 1, 1, row.length).setValues([row]); }
    return out_({ ok: true });
  } catch (err) { return out_({ ok: false, error: String(err) }); }
  finally { lock.releaseLock(); }
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---------- one-time workbook design ---------- */
function setup() {
  var ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone(TZ); ss.rename('THE GX GROUP — Leads');
  var dash = ss.getSheetByName('Dashboard') || ss.insertSheet('Dashboard', 0);
  Object.keys(TABS).forEach(function (k) { buildTab_(ss, TABS[k]); });
  ss.getSheets().forEach(function (s) { if (['Dashboard', 'Partnerships', 'Services', 'Contact'].indexOf(s.getName()) < 0) ss.deleteSheet(s); });
  buildDashboard_(ss, dash);
  ss.setActiveSheet(dash); ss.moveActiveSheet(1);
}

function buildTab_(ss, cfg) {
  var sh = ss.getSheetByName(cfg.name) || ss.insertSheet(cfg.name);
  var n = cfg.cols.length;
  sh.clear(); sh.getBandings().forEach(function (b) { b.remove(); }); sh.clearConditionalFormatRules();
  if (sh.getMaxColumns() > n) sh.deleteColumns(n + 1, sh.getMaxColumns() - n);
  if (sh.getMaxRows() < 500) sh.insertRowsAfter(sh.getMaxRows(), 500 - sh.getMaxRows());
  sh.setTabColor(cfg.color);
  var head = sh.getRange(1, 1, 1, n);
  head.setValues([cfg.cols.map(function (c) { return c[0].toUpperCase(); })])
    .setBackground(C.navy).setFontColor(C.white).setFontWeight('bold').setFontSize(9).setFontFamily('Inter')
    .setVerticalAlignment('middle').setHorizontalAlignment('left');
  sh.setRowHeight(1, 38); sh.setFrozenRows(1); sh.setFrozenColumns(cfg.name === 'Contact' ? 1 : 1);
  cfg.cols.forEach(function (c, i) { sh.setColumnWidth(i + 1, c[2]); });
  var body = sh.getRange(2, 1, sh.getMaxRows() - 1, n);
  body.setFontFamily('Inter').setFontSize(10).setFontColor(C.ink).setVerticalAlignment('middle').setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  sh.setRowHeightsForced(2, sh.getMaxRows() - 1, 30);
  var b = body.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);
  b.setFirstRowColor(C.white).setSecondRowColor('#F5F9FF');
  // date + money formats
  cfg.cols.forEach(function (c, i) {
    var r = sh.getRange(2, i + 1, sh.getMaxRows() - 1, 1);
    if (c[1] === 'created_at') r.setNumberFormat('dd mmm yyyy, h:mm am/pm');
    if (c[1] === 'quotation_amount') r.setNumberFormat('₹#,##,##0');
    if (c[1] === 'reference') r.setFontWeight('bold').setFontColor(C.blue);
    if (c[1] === 'email') r.setFontColor(C.blue);
  });
  // status chips
  var sIdx = cfg.cols.findIndex(function (c) { return c[1] === 'status' || c[1] === 'handled'; }) + 1;
  var sr = sh.getRange(2, sIdx, sh.getMaxRows() - 1, 1);
  sr.setFontWeight('bold').setHorizontalAlignment('center').setFontSize(9);
  var labels = cfg.statuses ? cfg.statuses.map(pretty_) : ['Open', 'Handled'];
  sr.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(labels, true).setAllowInvalid(true).build());
  var rules = labels.map(function (l) {
    var col = STATUS_COLORS[l] || ['#EEF1F5', '#475569'];
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(l).setBackground(col[0]).setFontColor(col[1]).setRanges([sr]).build();
  });
  var dIdx = cfg.cols.findIndex(function (c) { return c[1] === 'is_duplicate'; }) + 1;
  if (dIdx > 0) rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Yes').setBackground('#FDE6E7').setFontColor(C.red).setRanges([sh.getRange(2, dIdx, sh.getMaxRows() - 1, 1)]).build());
  sh.setConditionalFormatRules(rules);
  sh.getRange(1, 1, sh.getMaxRows(), n).setBorder(null, null, null, null, false, true, C.line, SpreadsheetApp.BorderStyle.SOLID);
  sh.hideColumns(n); // internal ID
}

function buildDashboard_(ss, d) {
  d.clear(); d.getCharts().forEach(function (c) { d.removeChart(c); });
  d.setTabColor(C.gold); d.setHiddenGridlines(true);
  if (d.getMaxColumns() < 14) d.insertColumnsAfter(d.getMaxColumns(), 14 - d.getMaxColumns());
  d.getRange(1, 1, d.getMaxRows(), d.getMaxColumns()).setFontFamily('Inter').setFontColor(C.ink).setBackground('#F4F7FB');
  d.setColumnWidth(1, 24); for (var i = 2; i <= 13; i++) d.setColumnWidth(i, 104); d.setColumnWidth(14, 24);
  // title band
  d.getRange('A1:N3').setBackground(C.navy);
  d.setRowHeight(1, 14); d.setRowHeight(2, 46); d.setRowHeight(3, 26);
  d.getRange('B2').setValue('THE GX GROUP').setFontColor(C.white).setFontSize(20).setFontWeight('bold');
  d.getRange('E2').setValue('Leads dashboard').setFontColor('#9CC9FF').setFontSize(13).setVerticalAlignment('bottom');
  d.getRange('B3').setFormula('="Updated live from thegxgroup.com  ·  "&TEXT(NOW(),"dd mmm yyyy, h:mm am/pm")').setFontColor('#9CC9FF').setFontSize(9);
  d.setRowHeight(4, 16);
  // KPI cards
  var P = 'Partnerships', S = 'Services', K = 'Contact';
  var kpis = [
    ['PARTNERSHIP APPLICATIONS', '=COUNTA(' + P + '!A2:A)', C.blue],
    ['SERVICE ENQUIRIES', '=COUNTA(' + S + '!A2:A)', C.navy],
    ['CONTACT MESSAGES', '=COUNTA(' + K + '!A2:A)', C.sky],
    ['NEW THIS MONTH', '=COUNTIFS(' + P + '!B2:B,">="&EOMONTH(TODAY(),-1)+1)+COUNTIFS(' + S + '!B2:B,">="&EOMONTH(TODAY(),-1)+1)+COUNTIFS(' + K + '!A2:A,">="&EOMONTH(TODAY(),-1)+1)', C.gold],
    ['WAITING FOR REPLY', '=COUNTIF(' + P + '!C2:C,"New")+COUNTIF(' + S + '!C2:C,"New")+COUNTIF(' + K + '!B2:B,"Open")', C.red],
    ['DEALS WON / ACCEPTED', '=COUNTIF(' + P + '!C2:C,"Accepted")+COUNTIF(' + S + '!C2:C,"Won")', C.green]
  ];
  d.setRowHeight(5, 24); d.setRowHeight(6, 48); d.setRowHeight(7, 10);
  kpis.forEach(function (k, i) {
    var col = 2 + i * 2;
    var card = d.getRange(5, col, 3, 2); card.setBackground(C.white);
    d.getRange(5, col, 1, 2).merge().setValue(k[0]).setFontSize(8).setFontWeight('bold').setFontColor(C.mute).setVerticalAlignment('bottom');
    d.getRange(6, col, 1, 2).merge().setFormula(k[1]).setFontSize(26).setFontWeight('bold').setFontColor(k[2]).setVerticalAlignment('middle').setHorizontalAlignment('left').setNumberFormat('0');
    d.getRange(7, col, 1, 2).setBackground(k[2]);
    card.setBorder(true, true, true, true, null, null, '#E3EAF3', SpreadsheetApp.BorderStyle.SOLID);
  });
  d.setRowHeight(8, 16);

  // helper data (right side, kept tidy and small) — columns P onwards
  if (d.getMaxColumns() < 26) d.insertColumnsAfter(d.getMaxColumns(), 26 - d.getMaxColumns());
  var H = d.getRange('P1:Z60'); H.setFontColor(C.mute).setFontSize(9).setBackground(C.white);
  d.getRange('P1').setValue('Chart data (auto)').setFontWeight('bold');
  // monthly trend, last 6 months
  d.getRange('P2:S2').setValues([['Month', 'Partnerships', 'Services', 'Contact']]).setFontWeight('bold');
  for (var m = 0; m < 6; m++) {
    var r = 3 + m, off = -(6 - m);
    d.getRange(r, 16).setFormula('=EOMONTH(TODAY(),' + off + ')+1').setNumberFormat('mmm yy');
    d.getRange(r, 17).setFormula('=COUNTIFS(' + P + '!$B$2:$B,">="&$P' + r + ',' + P + '!$B$2:$B,"<"&EDATE($P' + r + ',1))');
    d.getRange(r, 18).setFormula('=COUNTIFS(' + S + '!$B$2:$B,">="&$P' + r + ',' + S + '!$B$2:$B,"<"&EDATE($P' + r + ',1))');
    d.getRange(r, 19).setFormula('=COUNTIFS(' + K + '!$A$2:$A,">="&$P' + r + ',' + K + '!$A$2:$A,"<"&EDATE($P' + r + ',1))');
  }
  // breakdowns
  var blocks = [['P11', 'Project type', S + '!I2:I'], ['S11', 'Industry', P + '!I2:I'], ['V11', 'Budget', S + '!J2:J'], ['P24', 'Partnership status', P + '!C2:C'], ['S24', 'Service status', S + '!C2:C'], ['V24', 'Stage', P + '!J2:J']];
  blocks.forEach(function (b) {
    var a = d.getRange(b[0]); a.offset(0, 0, 1, 2).setValues([[b[1], 'Count']]).setFontWeight('bold');
    a.offset(1, 0).setFormula('=IFERROR(QUERY({' + b[2] + '},"select Col1, count(Col1) where Col1 is not null group by Col1 order by count(Col1) desc label count(Col1) \'\'",0),{"—",0})');
  });

  // section labels
  function label(a1, t) { d.getRange(a1).setValue(t).setFontSize(11).setFontWeight('bold').setFontColor(C.navy); }
  d.setRowHeight(9, 26); label('B9', 'Leads per month'); label('H9', 'Service enquiries by project type');
  label('B29', 'Partnership applications by industry'); label('H29', 'Budget range (services)');
  label('B49', 'Pipeline — partnerships'); label('H49', 'Pipeline — services');

  function chart(type, rng, row, col, title, opts) {
    var cb = d.newChart().setChartType(type).setPosition(row, col, 0, 0).setOption('width', 610).setOption('height', 360)
      .setOption('backgroundColor', C.white).setOption('fontName', 'Inter').setOption('legend', { position: 'bottom', textStyle: { color: C.mute, fontSize: 10 } })
      .setOption('titleTextStyle', { color: C.navy, fontSize: 12, bold: true }).setOption('title', title).setOption('colors', PALETTE)
      .setOption('chartArea', { left: 50, top: 40, width: '82%', height: '70%' })
      .setHiddenDimensionStrategy(Charts.ChartHiddenDimensionStrategy.SHOW_BOTH);
    rng.forEach(function (r) { cb.addRange(d.getRange(r)); });
    Object.keys(opts || {}).forEach(function (k) { cb.setOption(k, opts[k]); });
    d.insertChart(cb.build());
  }
  var axis = { textStyle: { color: C.mute, fontSize: 10 }, gridlines: { color: '#EEF2F7' }, baselineColor: '#D6E4F5', minValue: 0, format: '0' };
  chart(Charts.ChartType.COLUMN, ['P2:S8'], 10, 2, '', { isStacked: true, vAxis: axis, hAxis: { textStyle: { color: C.mute } }, bar: { groupWidth: '55%' }, useFirstColumnAsDomain: true, headerCount: 1 });
  chart(Charts.ChartType.PIE, ['P11:Q21'], 10, 8, '', { pieHole: 0.55, pieSliceBorderColor: C.white, pieSliceText: 'none', legend: { position: 'right', textStyle: { color: C.ink, fontSize: 10 } } });
  chart(Charts.ChartType.BAR, ['S11:T21'], 30, 2, '', { legend: { position: 'none' }, hAxis: axis, vAxis: { textStyle: { color: C.ink, fontSize: 10 } }, colors: [C.blue], bar: { groupWidth: '60%' }, chartArea: { left: 140, top: 30, width: '70%', height: '78%' } });
  chart(Charts.ChartType.PIE, ['V11:W21'], 30, 8, '', { pieHole: 0.55, pieSliceBorderColor: C.white, pieSliceText: 'none', colors: [C.navy, C.blue, C.sky, '#9CC9FF', C.gold], legend: { position: 'right', textStyle: { color: C.ink, fontSize: 10 } } });
  chart(Charts.ChartType.BAR, ['P24:Q34'], 50, 2, '', { legend: { position: 'none' }, hAxis: axis, vAxis: { textStyle: { color: C.ink, fontSize: 10 } }, colors: [C.blue], chartArea: { left: 150, top: 30, width: '68%', height: '78%' } });
  chart(Charts.ChartType.BAR, ['S24:T34'], 50, 8, '', { legend: { position: 'none' }, hAxis: axis, vAxis: { textStyle: { color: C.ink, fontSize: 10 } }, colors: [C.navy], chartArea: { left: 170, top: 30, width: '66%', height: '78%' } });
  d.hideColumns(15, 12);
}
