import React from 'react';

const unavailable = 'Not available';

function humanize(value) {
  if (value == null || value === '') return unavailable;
  return String(value).replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function targetState(record) {
  if (!record) return unavailable;
  if (/vimana|shikhara/i.test(record.component || '') && record.evidence?.some((item) => /19th century/i.test(item.fact || ''))) return 'Pre-loss architectural state';
  if (/historical\/conservation state/i.test(record.subject || '')) return 'Documented historical/conservation state';
  return unavailable;
}

function verificationLabel(record) {
  if (!record) return 'Verification status unavailable';
  if (record.validation_status === 'not_generated') return 'Validation pending';
  return humanize(record.validation_status || record.verification);
}

export default function ReconstructionWorkspace({ records = [], selected, onSelect }) {
  if (!records.length) return <section className="reconstruction-workspace empty"><p className="eyebrow">AI RECONSTRUCTION HYPOTHESIS</p><h2>NO RECONSTRUCTION HYPOTHESIS AVAILABLE</h2><p>This monument has no monument-specific reconstruction record in the current dataset.</p></section>;

  const record = selected || records[0];
  const facts = record.evidence || [];
  const hasVisual = Boolean(record.image_url);

  return <section className="reconstruction-workspace">
    <div className="reconstruction-heading"><div><p className="eyebrow">EVIDENCE-BACKED RECONSTRUCTION WORKSPACE</p><h2>AI RECONSTRUCTION HYPOTHESIS</h2><p>This workspace separates documented facts from inference and visualization.</p></div><span className="ai-badge">NOT HISTORICAL FACT</span></div>
    <div className="reconstruction-selector" role="list" aria-label="Reconstruction hypotheses">{records.map((item) => <button className={item.reconstruction_id === record.reconstruction_id ? 'selected' : ''} onClick={() => onSelect(item.reconstruction_id)} key={item.reconstruction_id}><b>{item.reconstruction_id}</b><span>{item.component || 'Component mapping unavailable'}</span><small>{item.label || 'AI Reconstruction Hypothesis'}</small></button>)}</div>
    <div className="reconstruction-grid">
      <section className="reconstruction-summary"><p className="eyebrow">RECONSTRUCTION HYPOTHESIS</p><h3>{record.subject || unavailable}</h3><dl><dt>Hypothesis ID</dt><dd>{record.reconstruction_id || unavailable}</dd><dt>Monument</dt><dd>Sun Temple, Konark</dd><dt>Component</dt><dd>{record.component || 'Component mapping unavailable'}</dd><dt>Target state</dt><dd>{targetState(record)}</dd><dt>Evidence level</dt><dd>{humanize(record.evidence_strength)}</dd><dt>Inference level</dt><dd>{humanize(record.inference_strength)}</dd><dt>Confidence</dt><dd>{record.confidence == null ? 'CONFIDENCE UNAVAILABLE' : record.confidence}</dd><dt>Verification</dt><dd>{verificationLabel(record)}</dd><dt>Evidence count</dt><dd>{record.evidence_count ?? 0}</dd></dl></section>
      <section className="reconstruction-visual"><p className="eyebrow">CURRENT / DOCUMENTED → RECONSTRUCTION / DEMO</p>{hasVisual ? <img src={record.image_url} alt={`Reconstruction hypothesis for ${record.component || 'the monument'}`}/> : <div className="reconstruction-placeholder" role="img" aria-label="Illustrative reconstruction visualization"><div className="reconstruction-schematic"><div className="schematic-current"><span>CURRENT / DOCUMENTED</span><i/></div><div className="schematic-demo"><span>RECONSTRUCTION / DEMO</span><i/><b>{/vimana|shikhara/i.test(record.component || '') ? 'SIMPLIFIED UPPER TOWER MASS' : 'SIMPLIFIED ARCHITECTURAL MASS'}</b></div></div><b>SIMULATED AI RECONSTRUCTION</b><span>ILLUSTRATIVE VISUALIZATION · NOT HISTORICAL FACT</span></div>}<div className="hypothesis-warning">SIMULATED AI RECONSTRUCTION · NOT HISTORICAL FACT</div></section>
    </div>
    <div className="reconstruction-evidence-grid"><section><p className="eyebrow">WHAT IS DOCUMENTED?</p>{facts.length ? <div className="fact-list">{facts.map((fact, index) => <article key={`${record.reconstruction_id}-fact-${index}`}><b>DOCUMENTED FACT</b><p>{fact.fact || unavailable}</p><small>{fact.source || unavailable}</small></article>)}</div> : <p className="unavailable">Evidence relationship not explicitly recorded</p>}</section><section><p className="eyebrow">WHAT IS INFERRED?</p><div className="inference-panel"><b>EVIDENCE-BACKED INFERENCE</b><p>Inference level: {humanize(record.inference_strength)}.</p><p>The record is labelled {record.label || 'AI Reconstruction Hypothesis'} and requires human verification before it can be treated as more than a hypothesis.</p></div></section></div>
    <div className="reconstruction-chain"><div><span>OBSERVATION</span><b>{facts.length ? 'Documented source facts' : 'Not available'}</b></div><i>↓</i><div><span>RECORD / AI ANALYSIS</span><b>{record.reconstruction_id}</b></div><i>↓</i><div><span>SUPPORTING EVIDENCE</span><b>{record.evidence_ids?.length ? record.evidence_ids.join(', ') : 'EVIDENCE RELATIONSHIP NOT EXPLICITLY RECORDED'}</b></div><i>↓</i><div><span>INFERENCE / HYPOTHESIS</span><b>{humanize(record.inference_strength)}</b></div><i>↓</i><div><span>CONFIDENCE</span><b>{record.confidence == null ? 'CONFIDENCE UNAVAILABLE' : record.confidence}</b></div><i>↓</i><div><span>VERIFICATION</span><b>{verificationLabel(record)}</b></div></div>
  </section>;
}
