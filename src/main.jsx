import React, { lazy, Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, ArrowLeft, Search, MapPin, ChevronRight, X, ExternalLink } from 'lucide-react';
import { konarkDemo, showcase3D } from './data/konarkDemo.js';
import ComparisonWorkspace from './components/ComparisonWorkspace.jsx';
import HeritageViewer2D from './components/HeritageViewer2D.jsx';
import EvidenceWorkspace from './components/EvidenceWorkspace.jsx';
import ReconstructionWorkspace from './components/ReconstructionWorkspace.jsx';
import DamageIntelligenceStatus from './components/DamageIntelligenceStatus.jsx';
import './styles.css';

const Konark3DViewer = lazy(() => import('./components/Konark3DViewer.jsx'));

const fallback = '/assets/hero.png';
const unavailable = 'Not available';
const experienceModes = ['timeline', 'damage', 'compare', 'rebuild', 'viewer', '3d'];

async function api(path) {
  // Local Vite dev server API
  try {
    const response = await fetch(`/api${path}`);
    if (response.ok) return response.json();
  } catch {
    // Fall through to static production data
  }

  // Vercel/static production fallback
  if (path === '/monuments') {
    const response = await fetch('/api/monuments.json');
    if (!response.ok) throw new Error('Data could not be loaded.');
    return response.json();
  }

  const monumentMatch = path.match(/^\/monuments\/([^/]+)$/);

  if (monumentMatch) {
    const monumentId = monumentMatch[1];
    const response = await fetch('/api/monument-detail.json');

    if (!response.ok) throw new Error('Data could not be loaded.');

    const details = await response.json();

    if (Array.isArray(details)) {
      const detail = details.find(
        (item) => item.monument_id === monumentId
      );

      if (!detail) throw new Error('Monument data could not be found.');

      return detail;
    }

    if (details.monument_id === monumentId) {
      return details;
    }

    if (details[monumentId]) {
      return details[monumentId];
    }

    throw new Error('Monument data could not be found.');
  }

  throw new Error('Data could not be loaded.');
}

function readMode() {
  const mode = new URLSearchParams(window.location.search).get('mode');
  if (mode === 'reconstruction') return 'rebuild';
  return experienceModes.includes(mode) ? mode : 'timeline';
}

function updateUrl(monumentId, mode) {
  const url = new URL(window.location.href);
  if (monumentId) url.searchParams.set('monument', monumentId); else url.searchParams.delete('monument');
  if (mode) url.searchParams.set('mode', mode); else url.searchParams.delete('mode');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function relationshipLabel(item) {
  return item?.evidence_ids?.length ? item.evidence_ids.join(', ') : 'Evidence relationship not explicitly recorded';
}

function humanizeStatus(value) {
  if (value == null || value === '') return unavailable;
  return String(value).replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function timelineCategory(event) {
  const type = event.event_type || '';
  if (/damage/i.test(type)) return 'Damage';
  if (/conservation|monitoring/i.test(type)) return 'Restoration';
  if (/current/i.test(type)) return 'Current';
  return 'Historical';
}

function App() {
  const [page, setPage] = useState('home');
  const [monuments, setMonuments] = useState([]);
  const [site, setSite] = useState(null);
  const [state, setState] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/monuments').then(setMonuments).catch((loadError) => setError(loadError.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!monuments.length) return;
    const requestedId = new URLSearchParams(window.location.search).get('monument');
    if (!requestedId) return;
    const requestedSite = monuments.find((monument) => monument.monument_id === requestedId);
    if (requestedSite) { setSite(requestedSite); setPage('site'); } else updateUrl(null, null);
  }, [monuments]);

  const navigate = (nextPage) => { setPage(nextPage); if (nextPage !== 'site') updateUrl(null, null); };
  const open = (monument) => { setSite(monument); setPage('site'); updateUrl(monument.monument_id, 'timeline'); window.scrollTo(0, 0); };
  if (loading) return <div className="center"><span className="spinner"/> Loading the archive…</div>;
  if (error) return <div className="center">{error}<button onClick={() => location.reload()}>Try again</button></div>;
  if (page === 'site' && site) return <Experience site={site} back={() => navigate('explore')}/>;

  const filtered = monuments.filter((monument) => (!state || monument.state === state) && `${monument.name} ${monument.state} ${monument.heritage_type}`.toLowerCase().includes(query.toLowerCase()));
  if (page === 'home') return <Landing go={navigate}/>;
  if (page === 'about') return <><Nav go={navigate} light/><About go={navigate}/></>;
  return <><Nav go={navigate} light/><Explorer list={filtered} all={monuments} query={query} setQuery={setQuery} state={state} setState={setState} open={open}/></>;
}

function Nav({ go, light = false }) {
  return <nav className={light ? 'light-nav' : ''}><button className="brand" onClick={() => go('home')}>HERITAGE <i>AI</i></button><div><button onClick={() => go('explore')}>Explore</button><button onClick={() => go('about')}>About</button></div><button className="outline" onClick={() => go('explore')}>Open archive <ArrowRight size={15}/></button></nav>;
}

function Landing({ go }) {
  return <main className="landing"><div className="hero-img"/><div className="hero-shade"/><Nav go={go}/><section className="hero-copy"><p className="eyebrow">INDIA'S LIVING ARCHIVE · DEMO</p><h1>Travel Through<br/><em>History.</em></h1><p className="lede">Explore how India's heritage changed, understand what was lost, and visualize evidence-aware reconstruction.</p><button className="primary" onClick={() => go('explore')}>Explore heritage <ArrowRight size={18}/></button></section><div className="hero-bottom"><span>SELECT → TRAVEL → DETECT → RESTRICT → RECONSTRUCT → VERIFY</span><span>Scroll to enter</span></div><section className="capabilities"><article><span>01</span><h3>Machine Timeline</h3><p>Navigate documented states, sources and provenance.</p></article><article><span>02</span><h3>Damage Intelligence</h3><p>Make conditions and uncertainty visible.</p></article><article><span>03</span><h3>Restricted Areas</h3><p>Respectful, evidence-based site awareness.</p></article><article><span>04</span><h3>AI Reconstruction</h3><p>Test hypotheses — never replace history.</p></article></section></main>;
}

function About({ go }) {
  return <main className="about explorer"><p className="eyebrow">ABOUT THE PROTOTYPE</p><h1>One heritage journey,<br/><em>evidence kept visible.</em></h1><div className="about-copy"><p>HERITAGE AI is a cultural-technology prototype for moving through a monument’s documented states, observed condition and clearly labelled reconstruction hypotheses in one connected experience.</p><p>Konark Sun Temple is the current end-to-end demonstration. Other collection records remain intentionally incomplete until their source material and conservation metadata are curator-verified.</p><button className="primary" onClick={() => go('explore')}>Open the archive <ArrowRight size={18}/></button></div></main>;
}

function Explorer({ list, all, query, setQuery, state, setState, open }) {
  return <main className="explorer"><div className="intro"><p className="eyebrow">DEMO COLLECTION</p><h1>Choose a place to<br/><em>begin the journey.</em></h1><p>Four illustrative records demonstrate the platform data model. Historical claims and reconstruction outcomes are clearly qualified.</p></div><div className="filters"><label><Search size={17}/><input placeholder="Search monuments, state, type" value={query} onChange={(event) => setQuery(event.target.value)}/></label><select value={state} onChange={(event) => setState(event.target.value)}><option value="">All states</option>{[...new Set(all.map((monument) => monument.state))].map((value) => <option key={value}>{value}</option>)}</select></div><div className="site-grid">{list.length ? list.map((monument) => { const media = monument.media?.[0]; return <article className="site-card" role="button" tabIndex="0" onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(monument); } }} onClick={() => open(monument)} key={monument.monument_id}>{monument.image ? <img src={monument.image} alt={monument.name}/> : <div className="site-media-unavailable" role="img" aria-label={`${monument.name} media unavailable`}>MEDIA UNAVAILABLE</div>}<div><p className="card-meta">{monument.state} · {monument.heritage_type}</p><h2>{monument.name}</h2><p>{monument.description}</p>{media && <small className="card-media-credit">Photo: {media.attribution} · {media.license} · <a href={media.source_url} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>Source</a></small>}{monument.detail_available ? <button onClick={(event) => { event.stopPropagation(); open(monument); }}>Enter experience <ArrowRight size={16}/></button> : <small className="card-unavailable">Detailed digital twin currently unavailable</small>}</div></article>; }) : <div className="empty">No monuments match this search. Clear a filter to return to the demo collection.</div>}</div></main>;
}

function DemoStatusLegend() {
  return <aside className="demo-status-legend" aria-label="Demo status legend"><span><i className="verified"/> VERIFIED SOURCE</span><span><i className="documented"/> DOCUMENTED RECORD</span><span><i className="demo"/> DEMO / ILLUSTRATIVE</span><span><i className="simulated"/> SIMULATED AI</span><span><i className="survey"/> NOT SURVEY GROUND TRUTH</span></aside>;
}

function JourneySteps({ mode, setMode }) {
  const activeStage = { timeline: 2, damage: 3, compare: 4, rebuild: 5, viewer: 6, '3d': 6 }[mode] || 2;
  const stages = [['01', 'Explore Monument', 'timeline'], ['02', 'Travel Through Time', 'timeline'], ['03', 'Understand Damage', 'damage'], ['04', 'Compare States', 'compare'], ['05', 'Inspect AI Reconstruction', 'rebuild'], ['06', 'Verify Evidence', 'compare']];
  return <section className="demo-journey"><div className="journey-heading"><p className="eyebrow">DEMO JOURNEY</p><span>STAGE {String(activeStage).padStart(2, '0')} / 06</span></div><div className="journey-steps">{stages.map(([number, label, target], index) => <button className={activeStage === index + 1 ? 'active' : index + 1 < activeStage ? 'complete' : ''} onClick={() => setMode(target)} key={number}><b>{number}</b><span>{label}</span></button>)}</div></section>;
}

function DemoJourney({ mode, setMode }) {
  return <><DemoStatusLegend/><JourneySteps mode={mode} setMode={setMode}/></>;
}

function Experience({ site, back }) {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [timelineFilter, setTimelineFilter] = useState('All');
  const [selectedTimelineId, setSelectedTimelineId] = useState(null);
  const [damageId, setDamageId] = useState(null);
  const [reconstructionId, setReconstructionId] = useState(null);
  const [areaId, setAreaId] = useState(null);
  const [mode, setMode] = useState(readMode);
  const [slider, setSlider] = useState(55);

  useEffect(() => {
    if (!site.detail_available) {
      if (['3d', 'rebuild'].includes(readMode())) {
        setData({ monument: site, threeD: { authoritativeAsset: { available: false }, models: showcase3D[site.monument_id] ?? [] }, architecturalComponents: [], reconstructions: [], evidence: [], media: [] });
      } else setLoadError('Detailed digital twin currently unavailable for this collection record.');
      return;
    }
    if (site.monument_id === konarkDemo.monument.monument_id) { setData(konarkDemo); return; }
    api(`/monuments/${site.monument_id}`).then(setData).catch((loadError) => setLoadError(loadError.message));
  }, [site]);

  const changeMode = (nextMode) => { const validMode = experienceModes.includes(nextMode) ? nextMode : 'timeline'; setMode(validMode); updateUrl(site.monument_id, validMode); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  if (loadError) return <main className="experience"><header className="experience-head"><button onClick={back}><ArrowLeft size={18}/> Archive</button><p className="eyebrow">COLLECTION RECORD</p><h1>{site.name}</h1></header><section className="empty">{loadError}<button onClick={back}>Return to archive</button></section></main>;
  if (!data) return <div className="center"><span className="spinner"/> Opening monument record…</div>;

  const timeline = data.timeline ?? [];
  const damage = data.damage ?? [];
  const areas = data.restrictedZones ?? [];
  const reconstructions = data.reconstructions ?? [];
  const evidence = data.evidence ?? [];
  const currentCondition = data.currentCondition ?? null;
  const availableFilters = ['All', 'Historical', 'Damage', 'Restoration', 'Current'].filter((filter) => filter === 'All' || timeline.some((event) => timelineCategory(event) === filter));
  const filteredTimeline = timelineFilter === 'All' ? timeline : timeline.filter((event) => timelineCategory(event) === timelineFilter);
  const selectedTimeline = timeline.find((event) => event.timeline_id === selectedTimelineId) || filteredTimeline[timelineIndex] || null;
  const selectedDamage = damage.find((event) => event.damage_id === damageId) || damage[0] || null;
  const selectedArea = areas.find((zone) => zone.restricted_area_id === areaId) || areas[0] || null;
  const reconstruction = reconstructions[0] || null;
  const selectedReconstruction = reconstructions.find((item) => item.reconstruction_id === reconstructionId) || reconstruction;
  const hasReferenceModel = data.threeD?.models?.some((model) => model.authorityLevel === 'reference_only' || model.authorityLevel === 'verified_reference');
  const image = site.image || data.monument?.image || fallback;
  const chooseTimeline = (id) => { setSelectedTimelineId(id); const index = filteredTimeline.findIndex((event) => event.timeline_id === id); if (index >= 0) setTimelineIndex(index); };
  const chooseTimelineFilter = (filter) => { setTimelineFilter(filter); setSelectedTimelineId(null); setTimelineIndex(0); };
  const chooseComparisonTimeline = (id) => { setTimelineFilter('All'); setSelectedTimelineId(id); setTimelineIndex(timeline.findIndex((event) => event.timeline_id === id)); };
    const evidenceWorkspace = mode === 'timeline' 
    ? <EvidenceWorkspace record={selectedTimeline} recordType="Timeline event" evidence={evidence} media={data.media} currentCondition={currentCondition}/>
    : mode === 'damage'
      ? <EvidenceWorkspace record={selectedDamage} recordType="Damage event" evidence={evidence} media={data.media} currentCondition={currentCondition}/>
      : mode === 'rebuild'
        ? <EvidenceWorkspace record={selectedReconstruction} reconstruction={selectedReconstruction} recordType="Reconstruction hypothesis" evidence={evidence} media={data.media} currentCondition={currentCondition}/>
        : mode === 'compare'
          ? <EvidenceWorkspace record={selectedTimeline} reconstruction={selectedReconstruction} recordType="Comparison selection" evidence={evidence} media={data.media} currentCondition={currentCondition}/>
          : null;

  return <main className="experience"><header className="experience-head"><button onClick={back}><ArrowLeft size={18}/> Archive</button><p className="eyebrow">{site.heritage_type} · {site.state}</p><h1>{site.name}</h1><p><MapPin size={15}/>{site.location} <span>·</span> {site.construction_period}</p></header><DemoJourney mode={mode} setMode={changeMode}/><div className="mode-tabs">{[['timeline', 'Machine timeline'], ['damage', 'Damage intelligence'], ['compare', 'Compare states'], ['rebuild', 'AI reconstruction'], ['viewer', '2D reference'], ['3d', '3D digital twin']].map(([id, label]) => <button className={mode === id ? 'active' : ''} onClick={() => changeMode(id)} key={id}>{label}</button>)}</div>{!data.threeD?.authoritativeAsset?.available && <p className="demo-tag">{hasReferenceModel ? 'REFERENCE MODEL ONLY · AUTHORITATIVE 3D GEOMETRY UNAVAILABLE' : 'AUTHORITATIVE 3D MODEL UNAVAILABLE · 2D SOURCE VIEW ONLY'}</p>}{mode === 'timeline' && <Timeline list={filteredTimeline} all={timeline} idx={timelineIndex} filter={timelineFilter} filters={availableFilters} setFilter={chooseTimelineFilter} setIdx={chooseTimeline} selected={selectedTimeline}/>} {mode === 'timeline' && <><CurrentCondition data={currentCondition}/><Evidence items={evidence}/></>}{mode === 'damage' && <><Damage damage={damage} selected={selectedDamage} areas={areas} area={selectedArea} setDamage={setDamageId} setArea={setAreaId} site={{ ...site, image }}/><DamageIntelligenceStatus damage={damage} model={data.damageInference}/></>} {mode === 'compare' && <ComparisonWorkspace timeline={timeline} selectedTimeline={selectedTimeline} onTimelineSelect={chooseComparisonTimeline} damage={damage} selectedDamage={selectedDamage} onDamageSelect={setDamageId} currentCondition={currentCondition} reconstructions={reconstructions} evidence={evidence} threeD={data.threeD} currentImage={site.image || null}/>} {mode === 'rebuild' && <><ReconstructionWorkspace records={reconstructions} selected={selectedReconstruction} onSelect={setReconstructionId}/>{evidenceWorkspace}</>} {mode === 'viewer' && <HeritageViewer2D monument={data.monument} selectedDamage={selectedDamage} restrictedZones={areas} threeD={data.threeD}/>} {mode === '3d' && <Suspense fallback={<div className="digital-twin-fallback"><p className="eyebrow">OPTIONAL DIGITAL TWIN</p><h3>Loading 3D viewer…</h3></div>}><Konark3DViewer monument={data.monument} selectedTimeline={selectedTimeline} selectedDamage={selectedDamage} restrictedZones={areas} threeD={data.threeD} architecturalComponents={data.architecturalComponents}/></Suspense>}{mode !== 'rebuild' && evidenceWorkspace}</main>;
}
function Timeline({ list, all, idx, filter, filters, setFilter, setIdx, selected }) {
  return <section className="timeline"><div className="section-heading"><div><p className="eyebrow">HISTORICAL TIMELINE</p><h2>{all.length} documented events</h2></div><div className="timeline-filters">{filters.map((item) => <button className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div></div>{list.length ? <div className="timeline-records"><div className="timeline-list">{list.map((event, i) => <button className={(selected?.timeline_id === event.timeline_id || (!selected && i === idx)) ? 'selected' : ''} onClick={() => setIdx(event.timeline_id)} key={event.timeline_id || event.id || i}><b>{event.year || unavailable}</b><i/><span>{event.historical_event || unavailable}<small>{event.event_type || unavailable} · {humanizeStatus(event.verification)}</small></span></button>)}</div>{selected ? <article className="timeline-detail"><p className="eyebrow">{selected.event_type || unavailable} · {humanizeStatus(selected.verification)}</p><h2>{selected.historical_event || unavailable}</h2><p>{selected.description || unavailable}</p><dl><dt>Record ID</dt><dd>{selected.timeline_id || selected.id || unavailable}</dd><dt>Source</dt><dd>{selected.source?.title || unavailable}</dd><dt>Evidence</dt><dd>{relationshipLabel(selected)}</dd></dl>{selected.image_url ? <img src={selected.image_url} alt={selected.historical_event || 'Historical reference'}/> : <p className="unavailable">Historical reference unavailable</p>}</article> : <div className="empty">Historical reference unavailable.</div>}</div> : <div className="empty">No timeline events are available.</div>}</section>;
}

function Damage({ damage, selected, areas, area, setDamage, setArea, site }) {
  const detail = selected ? <>
    <h2>{selected.damage_type || unavailable}</h2>
    <p>{selected.description || unavailable}</p>
    <dl>
      <dt>Date</dt><dd>{selected.date || unavailable}</dd>
      {selected.component && <><dt>Component</dt><dd>{selected.component}</dd></>}
      {selected.location && <><dt>Location</dt><dd>{selected.location}</dd></>}
      <dt>Severity</dt><dd><strong>{selected.severity === 'not-assigned' ? 'Not assigned' : selected.severity || 'Not available'}</strong></dd>
      <dt>Confidence</dt><dd>{selected.confidence ?? 'Not available'}</dd>
      <dt>Verification</dt><dd>{selected.verification || unavailable}</dd>
      <dt>Record ID</dt><dd>{selected.damage_id || selected.id || unavailable}</dd>
      <dt>Evidence</dt><dd>{relationshipLabel(selected)}</dd>
    </dl>
    {selected.source?.url && <a href={selected.source.url} target="_blank" rel="noopener noreferrer">Open source <ExternalLink size={13}/></a>}
  </> : <><h2>Damage unavailable</h2><p>No documented damage events are available.</p></>;
  return <><section className="damage-layout"><div className="plan"><img src={site.image || fallback} alt="Konark damage reference view"/><div className="legend"><span className="red"/>Documented damage <span className="amber"/>Restricted zone</div></div><aside className="damage-card"><p className="eyebrow">DAMAGE REGISTER · {damage.length} RECORDS</p>{detail}</aside></section><section className="damage-records"><p className="eyebrow">SELECT A DOCUMENTED EVENT</p>{damage.length ? <div className="record-list">{damage.map((event) => <button className={selected?.damage_id === event.damage_id ? 'selected' : ''} onClick={() => setDamage(event.damage_id)} key={event.damage_id}><span>{event.date || unavailable}</span><b>{event.damage_type || unavailable}</b><small>{event.verification || unavailable}</small><ChevronRight size={16}/></button>)}</div> : <div className="empty">No documented damage events are available.</div>}</section><RestrictedZones areas={areas} selected={area} setArea={setArea}/></>;
}

function RestrictedZones({ areas, selected, setArea }) {
  return <section className="area-section"><p className="eyebrow">RESTRICTED AREAS LAYER</p><h2>Site access & condition states</h2><div className="zone-diagram"><div className="zone-ring zone-200"><span>200 m regulated zone</span></div><div className="zone-ring zone-100"><span>100 m prohibited zone</span></div><b>MONUMENT</b><small>SCHEMATIC DISTANCE DIAGRAM · NOT A LEGAL SURVEY BOUNDARY</small></div>{areas.length ? <div className="area-list">{areas.map((zone, i) => <button onClick={() => setArea(zone.restricted_area_id)} className={selected?.restricted_area_id === zone.restricted_area_id ? 'selected' : ''} key={zone.restricted_area_id || i}><span>0{i + 1}</span><b>{zone.name || zone.id || unavailable}</b><small>{zone.status || zone.verification || unavailable}</small><ChevronRight size={16}/></button>)}</div> : <div className="empty">Legal protection records are not loaded.</div>}{selected && <aside className="area-detail"><button onClick={() => setArea(null)}><X size={16}/></button><p className="eyebrow">{selected.zone_type || 'RESTRICTED AREA'} · {selected.verification || unavailable}</p><h3>{selected.name || selected.id || unavailable}</h3><p>{selected.reason || unavailable}</p><dl><dt>Status</dt><dd>{selected.status || unavailable}</dd>{selected.distance_meters != null && <><dt>Distance</dt><dd>{selected.distance_meters} m from property boundary</dd></>}{selected.geometry ? <><dt>Geometry</dt><dd>{JSON.stringify(selected.geometry)}</dd></> : <><dt>Geometry</dt><dd>Spatial boundary unavailable</dd></>}<dt>Record ID</dt><dd>{selected.restricted_area_id || selected.id || unavailable}</dd><dt>Source</dt><dd>{selected.source || unavailable}</dd></dl></aside>}</section>;
}

function CurrentCondition({ data }) {
  if (!data) return <section className="condition-section empty">Current condition data is unavailable.</section>;
  return <section className="condition-section"><div className="section-heading"><div><p className="eyebrow">CURRENT CONDITION</p><h2>Government-reported condition record</h2></div><span className="data-badge">{humanizeStatus(data.assessment_basis)}</span></div><div className="condition-grid"><article><span>Overall status</span><b>{humanizeStatus(data.overall_status)}</b></article><article><span>Detailed assessment</span><b>{data.latest_detailed_assessment_year || unavailable}</b></article><article><span>National statement</span><b>{data.latest_national_statement_year || unavailable}</b></article><article><span>Standardized score</span><b>{data.standardized_severity_score ?? 'Standardized score unavailable'}</b></article></div><div className="condition-details"><article><p className="eyebrow">CONSERVATION STATUS</p><p>{data.conservationStatus?.responsibleAgency || unavailable}</p><p>{humanizeStatus(data.conservationStatus?.process)}</p><p>Verification: {humanizeStatus(data.conservationStatus?.verification)}</p></article><article><p className="eyebrow">DOCUMENTED CONDITIONS</p>{data.conditions?.length ? <ul>{data.conditions.map((condition) => <li key={condition.id}><b>{condition.condition}</b><span>{condition.severity === 'not-assigned' ? 'Severity: Not assigned' : humanizeStatus(condition.severity)} · {humanizeStatus(condition.verification)}</span></li>)}</ul> : <p>{unavailable}</p>}</article><article><p className="eyebrow">INTERPRETATION LIMITS</p><p>{data.source_gaps?.note || unavailable}</p></article></div></section>;
}

function Rebuild({ site, rec, slider, setSlider }) {
  if (!rec) return <section className="empty"><p className="eyebrow">HYPOTHESIS VIEW</p><h2>Reconstruction unavailable</h2><p>No reconstruction hypothesis is present in the source data.</p></section>;
  return <><section className="rebuild-head"><p className="eyebrow">HYPOTHESIS VIEW</p><h2>From current condition to a possible form.</h2><p>This visual is an AI-generated reconstruction hypothesis. It is not established historical fact.</p></section>{rec.image_url ? <section className="compare"><div className="recon base"><img src={site.image || fallback} alt="Current condition"/><span>CURRENT CONDITION</span></div><div className="recon overlay" style={{ width: `${slider}%` }}><img src={rec.image_url} alt="AI reconstruction hypothesis"/><span>AI RECONSTRUCTION</span></div><input aria-label="Comparison slider" type="range" min="0" max="100" value={slider} onChange={(event) => setSlider(event.target.value)}/></section> : <section className="empty">No reconstruction image is available. The record remains a hypothesis and has not been generated.</section>}<section className="confidence"><div><span>Historical evidence</span><b>{rec.evidence_strength || unavailable}</b></div><div><span>AI inference</span><b>{rec.inference_strength || unavailable}</b></div><div><span>Reconstruction confidence</span><b>{rec.confidence ?? unavailable}</b></div><p>{rec.description || unavailable}</p></section></>;
}

function Evidence({ items }) {
  return <section className="evidence"><div><p className="eyebrow">EVIDENCE REGISTER</p><h2>What supports this record?</h2><p>Sources are intentionally surfaced with their limits. Demo sources are never presented as archival evidence.</p></div>{items.length ? <div className="evidence-list">{items.map((item) => <article key={item.evidence_id || item.id}><span className="reliability">{item.reliability || unavailable}</span><h3>{item.source_name || unavailable}</h3><p>{item.source_type || unavailable} · {item.source_date || 'Undated'}</p><small>{item.description || unavailable}</small>{item.source_url && <a href={item.source_url} target="_blank" rel="noopener noreferrer">Open source <ExternalLink size={13}/></a>}</article>)}</div> : <div className="empty">No evidence records are available.</div>}</section>;
}

const root = globalThis.__heritageAiRoot ?? createRoot(document.getElementById('root'));
globalThis.__heritageAiRoot = root;
root.render(<App/>);