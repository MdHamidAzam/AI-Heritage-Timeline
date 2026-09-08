import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

const unavailable = 'Not available';

function evidenceRelationship(item) {
  return item?.evidence_ids?.length
    ? item.evidence_ids.join(', ')
    : 'Evidence relationship not explicitly recorded';
}

function Value({ label, children }) {
  return <div className="comparison-value"><span>{label}</span><b>{children || unavailable}</b></div>;
}

function MediaState({ children, className = '' }) {
  return <div className={`comparison-media ${className}`}><div className="comparison-silhouette"/><p>{children}</p></div>;
}

export default function ComparisonWorkspace({
  timeline,
  selectedTimeline,
  onTimelineSelect,
  damage,
  selectedDamage,
  onDamageSelect,
  onReconstructionSelect,
  currentCondition,
  reconstructions,
  evidence,
  threeD,
  currentImage
}) {
  const [reconstructionId, setReconstructionId] = useState(reconstructions[0]?.reconstruction_id ?? null);
  const selectedReconstruction = reconstructions.find((item) => item.reconstruction_id === reconstructionId) ?? null;
  const linkedReconstruction = selectedDamage
    ? reconstructions.find((item) => item.damage_id && item.damage_id === selectedDamage.damage_id)
    : null;
  const activeReconstruction = linkedReconstruction ?? selectedReconstruction;
  const hasExplicitDamageLink = Boolean(linkedReconstruction);
  const selectedEvidenceIds = new Set([
    ...(selectedTimeline?.evidence_ids ?? []),
    ...(selectedDamage?.evidence_ids ?? []),
    ...(activeReconstruction?.evidence_ids ?? [])
  ]);

  return <section className="comparison-workspace">
    <div className="comparison-intro">
      <div><p className="eyebrow">STATE COMPARISON WORKSPACE</p><h2>Evidence across documented states.</h2><p>Move from historical record to current condition, then inspect the reconstruction hypothesis without confusing inference for fact.</p></div>
      <div className="comparison-selectors"><label>Timeline event<select value={selectedTimeline?.timeline_id || ''} onChange={(event) => onTimelineSelect(event.target.value)}><option value="">Select event</option>{timeline.map((item) => <option key={item.timeline_id} value={item.timeline_id}>{item.year || unavailable} · {item.historical_event || unavailable}</option>)}</select></label><label>Damage record<select value={selectedDamage?.damage_id || ''} onChange={(event) => onDamageSelect(event.target.value)}><option value="">Select damage</option>{damage.map((item) => <option key={item.damage_id} value={item.damage_id}>{item.date || unavailable} · {item.damage_type || unavailable}</option>)}</select></label></div>
    </div>

    <div className="comparison-panels">
      <article className="comparison-panel historical-panel"><div className="comparison-panel-head"><p className="eyebrow">01 · HISTORICAL REFERENCE</p><span className="status-badge">{selectedTimeline?.verification || 'VISUAL SOURCE UNAVAILABLE'}</span></div>{selectedTimeline?.image_url ? <img src={selectedTimeline.image_url} alt={selectedTimeline.historical_event || 'Historical reference'}/> : <MediaState>HISTORICAL REFERENCE — VISUAL SOURCE UNAVAILABLE</MediaState>}<h3>{selectedTimeline?.historical_event || 'Select a timeline event'}</h3><Value label="Date / period">{selectedTimeline?.date || selectedTimeline?.year}</Value><Value label="Event type">{selectedTimeline?.event_type}</Value><Value label="Record ID">{selectedTimeline?.timeline_id}</Value><Value label="Source">{selectedTimeline?.source?.title}</Value><p className="comparison-description">{selectedTimeline?.description || unavailable}</p></article>
      <article className="comparison-panel current-panel"><div className="comparison-panel-head"><p className="eyebrow">02 · CURRENT CONDITION</p><span className="status-badge">{currentCondition?.assessment_basis || unavailable}</span></div>{currentImage ? <img src={currentImage} alt="Current Konark visual reference"/> : <MediaState>Current image unavailable</MediaState>}<h3>{currentCondition?.overall_status || unavailable}</h3><Value label="Detailed assessment">{currentCondition?.latest_detailed_assessment_year}</Value><Value label="National statement">{currentCondition?.latest_national_statement_year}</Value><Value label="Standardized score">{currentCondition?.standardized_severity_score ?? 'Standardized score unavailable'}</Value><Value label="Verification">{currentCondition?.conservationStatus?.verification}</Value><p className="comparison-description">{currentCondition?.source_gaps?.note || unavailable}</p></article>
      <article className="comparison-panel reconstruction-panel"><div className="comparison-panel-head"><p className="eyebrow">03 · AI RECONSTRUCTION</p><span className="ai-badge">SIMULATED AI OUTPUT</span></div>{activeReconstruction?.image_url ? <img src={activeReconstruction.image_url} alt="AI reconstruction hypothesis"/> : <MediaState>ILLUSTRATIVE REFERENCE · NOT HISTORICAL FACT</MediaState>}<h3>{activeReconstruction?.label || activeReconstruction?.subject || 'No reconstruction hypothesis linked to this record'}</h3><div className="hypothesis-warning">SIMULATED AI RECONSTRUCTION · NOT HISTORICAL FACT</div><Value label="Reconstruction ID">{activeReconstruction?.reconstruction_id}</Value><Value label="Method">{activeReconstruction?.model_or_method}</Value><Value label="Component">{activeReconstruction?.component}</Value><Value label="Confidence">{activeReconstruction?.confidence ?? 'Confidence remains null'}</Value><Value label="Validation">{activeReconstruction?.validation_status || 'Validation unavailable'}</Value><Value label="Evidence count">{activeReconstruction?.evidence_count}</Value><Value label="Evidence relationship">{evidenceRelationship(activeReconstruction)}</Value>{selectedDamage && !hasExplicitDamageLink && <p className="relationship-warning">No reconstruction hypothesis linked to this record</p>}</article>
    </div>

  <div className="comparison-flow"><div><span>Damage record</span><b>{selectedDamage?.damage_type || unavailable}</b></div><i>↓</i><div><span>Affected component</span><b>{selectedDamage?.component || 'Relationship not explicitly recorded'}</b></div><i>↓</i><div><span>Reconstruction hypothesis</span><b>{hasExplicitDamageLink ? activeReconstruction?.reconstruction_id : 'Relationship not explicitly recorded'}</b></div><i>↓</i><div><span>Evidence</span><b>{selectedEvidenceIds.size ? [...selectedEvidenceIds].join(', ') : 'Evidence relationship not explicitly recorded'}</b></div><i>↓</i><div><span>Validation</span><b>{activeReconstruction?.validation_status || 'Validation unavailable'}</b></div></div>

  <div className="reconstruction-options"><div><p className="eyebrow">AVAILABLE HYPOTHESES</p><h3>Choose a reconstruction record</h3></div>{reconstructions.length ? <div className="record-list">{reconstructions.map((item) => <button className={item.reconstruction_id === activeReconstruction?.reconstruction_id ? 'selected' : ''} onClick={() => { setReconstructionId(item.reconstruction_id); onReconstructionSelect?.(item.reconstruction_id); }} key={item.reconstruction_id}><span>{item.reconstruction_id}</span><b>{item.component || unavailable}</b><small>{item.status || item.validation_status || 'Validation unavailable'}</small></button>)}</div> : <p className="unavailable">No reconstruction hypotheses available.</p>}</div>

  <div className="comparison-lower"><section className="comparison-evidence"><p className="eyebrow">EVIDENCE / SOURCES</p><h3>Source register</h3>{evidence.length ? <div className="comparison-source-list">{evidence.map((item) => <article key={item.evidence_id}><div><b>{item.source_name || unavailable}</b><span>{item.source_type || unavailable} · {item.source_date || 'Undated'} · {item.reliability || unavailable}</span><small>{item.description || unavailable}</small></div><small>Source ID: {item.evidence_id}</small>{item.source_url && <a href={item.source_url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${item.source_name || 'source'}`}><ExternalLink size={14}/></a>}</article>)}</div> : <p className="unavailable">No evidence records available.</p>}<p className="relationship-warning">{selectedEvidenceIds.size ? `Explicit evidence IDs: ${[...selectedEvidenceIds].join(', ')}` : 'Evidence relationship not explicitly recorded'}</p></section><section className="comparison-status"><p className="eyebrow">EVIDENCE / CONFIDENCE / VALIDATION</p><h3>Status at a glance</h3><Value label="Evidence status">{activeReconstruction?.evidence_strength || selectedDamage?.verification || 'Not available'}</Value><Value label="AI inference status">{activeReconstruction?.inference_strength || 'Not available'}</Value><Value label="Validation status">{activeReconstruction?.validation_status || 'Validation unavailable'}</Value><Value label="Confidence">{activeReconstruction?.confidence ?? 'Confidence unavailable'}</Value><p className="relationship-warning">Human verification required: {activeReconstruction?.human_verification_required == null ? 'Not available' : activeReconstruction.human_verification_required ? 'Yes' : 'No'}</p></section></div>

  <div className="comparison-3d"><p className="eyebrow">2D / 3D PROVENANCE</p><h3>Reference geometry status</h3><p>DEMO / ILLUSTRATIVE · Procedural reference can bridge the comparison view.</p>{threeD?.models?.filter((model) => model.usageStatus === 'candidate_for_prototype').map((model) => <a href={model.sourceUrl} target="_blank" rel="noopener noreferrer" key={model.id}>Project/reference model — not survey ground truth · {model.title} <ExternalLink size={13}/></a>)}</div>
  </section>;
}
