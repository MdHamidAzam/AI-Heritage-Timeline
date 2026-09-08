import React from 'react';
import { ExternalLink } from 'lucide-react';
import MediaGallery from './MediaGallery.jsx';

const unavailable = 'Not available';

function sourceIds(record) {
  return record?.evidence_ids?.length ? record.evidence_ids : [];
}

function relationship(record) {
  return sourceIds(record).length ? sourceIds(record).join(', ') : 'Evidence relationship not explicitly recorded';
}

function recordTitle(record) {
  return record?.historical_event || record?.damage_type || record?.subject || record?.name || record?.source_name || 'Selected record';
}

function sourceFor(record) {
  if (!record?.source) return null;
  return { id: null, title: record.source.title || null, url: record.source.url || null, organization: record.source.organization || null };
}

export default function EvidenceWorkspace({ record, recordType, evidence = [], media = [], reconstruction, currentCondition }) {
  const source = sourceFor(record);
  const activeRecord = reconstruction || record;
  const sourceIdList = sourceIds(activeRecord);
  const matchingEvidence = sourceIdList.length ? evidence.filter((item) => sourceIdList.includes(item.evidence_id)) : [];

  return <section className="evidence-workspace">
    <div className="evidence-workspace-heading"><div><p className="eyebrow">EVIDENCE WORKSPACE</p><h2>Why am I seeing this?</h2><p>Provenance is shown only where the source data records it explicitly.</p></div><span className="data-badge">{recordType || 'Record'}</span></div>
    <div className="provenance-flow"><article><span>Observation</span><b>{record ? recordTitle(record) : 'No record selected'}</b></article><i>↓</i><article><span>Documented record</span><b>{activeRecord?.id || activeRecord?.timeline_id || activeRecord?.damage_id || 'Not available'}</b></article><i>↓</i><article><span>Source register</span><b>{sourceIdList.length ? sourceIdList.join(', ') : 'Relationship not explicitly recorded'}</b></article><i>↓</i><article><span>{reconstruction ? 'Inference / demo visual' : 'Inference / hypothesis'}</span><b>{reconstruction ? 'DEMO INFERENCE — NOT SOURCE EVIDENCE' : 'Not applicable'}</b></article><i>↓</i><article><span>Confidence</span><b>{reconstruction?.confidence ?? record?.confidence ?? currentCondition?.standardized_severity_score ?? 'Confidence unavailable'}</b></article><i>↓</i><article><span>Verification status</span><b>{activeRecord?.validation_status || activeRecord?.verification || record?.verification || 'Validation unavailable'}</b></article></div>
    <div className="evidence-workspace-grid"><section className="selected-record"><p className="eyebrow">SELECTED RECORD</p><h3>{recordTitle(activeRecord)}</h3><dl><dt>Record type</dt><dd>{recordType || unavailable}</dd><dt>Record ID</dt><dd>{activeRecord?.id || activeRecord?.timeline_id || activeRecord?.damage_id || activeRecord?.reconstruction_id || unavailable}</dd><dt>Description</dt><dd>{activeRecord?.description || activeRecord?.reason || activeRecord?.subject || unavailable}</dd><dt>Verification</dt><dd>{activeRecord?.verification || activeRecord?.validation_status || unavailable}</dd><dt>Source IDs</dt><dd>{sourceIdList.length ? sourceIdList.join(', ') : 'No source IDs explicitly recorded'}</dd><dt>Evidence relationship</dt><dd>{relationship(activeRecord)}</dd>{activeRecord?.confidence == null && reconstruction && <><dt>Confidence</dt><dd>Confidence not available</dd></>}</dl>{source && <div className="selected-source"><p className="eyebrow">SOURCE</p><b>{source.title || source.organization || unavailable}</b><small>{source.organization || unavailable}</small>{source.url && <a href={source.url} target="_blank" rel="noopener noreferrer">Open source <ExternalLink size={13}/></a>}</div>}{matchingEvidence.length ? <div className="linked-evidence">{matchingEvidence.map((item) => <article key={item.evidence_id}><b>{item.source_name || unavailable}</b><small>{item.evidence_id} · {item.source_date || 'Undated'} · {item.reliability || unavailable}</small></article>)}</div> : <p className="relationship-warning">Evidence relationship not explicitly recorded</p>}</section></div>
    <MediaGallery items={media}/>
  </section>;
}
