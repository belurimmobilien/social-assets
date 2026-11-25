// Januar-Posts für Metricool (createScheduledPost) aufbauen; Bilder über jsDelivr aus social-assets
const fs = require('fs');
const jan = require('./jan.json');
const B = 'https://cdn.jsdelivr.net/gh/belurimmobilien/social-assets@main/guardai/2027-01/';
const strip = s => s.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').replace(/&shy;/g, '').replace(/\s+/g, ' ').trim();
const out = [];
for (const p of jan) {
  const media = [B + p.id + '-1.jpg', B + p.id + '-2.jpg', B + 'cta.jpg'];
  const head = strip((p.big ? p.big + ' ' : '') + p.title);
  const base = { autoPublish: true, draft: false, descendants: [], firstCommentText: '', hasNotReadNotes: false, media, shortener: false, smartLinkData: { ids: [] } };
  out.push({ id: p.id, net: 'instagram', info: { ...base, mediaAltText: [head, strip(p.infoTitle), 'GuardAI – Ihr digitaler Compliance-Officer'],
    providers: [{ network: 'instagram' }], publicationDate: { dateTime: p.date, timezone: 'Europe/Berlin' }, text: p.caption,
    instagramData: { type: 'POST', showReelOnFeed: true, isAiGenerated: false } } });
  if (p.li) {
    const dt = p.date.replace('T10:00', 'T08:00');
    out.push({ id: p.id, net: 'linkedin', info: { ...base, mediaAltText: ['', '', ''],
      providers: [{ network: 'linkedin' }], publicationDate: { dateTime: dt, timezone: 'Europe/Berlin' }, text: p.liText,
      linkedinData: { documentTitle: head.slice(0, 100), publishImagesAsPDF: true, previewIncluded: true, type: 'post' } } });
  }
}
fs.writeFileSync(__dirname + '/jan-create.json', JSON.stringify(out, null, 1));
console.log(out.length, out.filter(x => x.net === 'linkedin').length);
