import fs from 'node:fs';
const monuments=JSON.parse(fs.readFileSync('public/api/monuments.json'));
const ids=new Set(); let errors=[];
for(const m of monuments){if(!m.monument_id)errors.push('Missing monument_id'); if(ids.has(m.monument_id))errors.push(`Duplicate ID: ${m.monument_id}`); ids.add(m.monument_id); if(!m.name)errors.push(`Missing name: ${m.monument_id}`)}
if(errors.length){console.error(errors.join('\n'));process.exit(1)} console.log(`Validated ${monuments.length} monument records.`);
