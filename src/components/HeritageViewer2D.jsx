import React, { useState } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import konarkDemo from '../data/konarkDemo.js';

const unavailable = 'Not available';

export default function HeritageViewer2D({ monument, selectedDamage, restrictedZones, threeD, architecturalComponents = [] }) {
  const components = architecturalComponents.length
    ? architecturalComponents
    : (monument?.monument_id === konarkDemo.monument.monument_id ? konarkDemo.architecturalComponents : []);
  const hasCoordinates = monument?.latitude != null && monument?.longitude != null;
  const projectModels = threeD?.models?.filter((model) => model.usageStatus === 'candidate_for_prototype') ?? [];
  const hasGeometry = restrictedZones?.some((zone) => zone.geometry != null) ?? false;
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const componentOptions = [
    ['konark-vimana', 'Vimana', 'plan-vimana'],
    ['konark-jagamohana', 'Jagamohana', 'plan-jagamohana'],
    ['konark-natmandir', 'Natmandir', 'plan-natmandir'],
    ['konark-wheels', 'Carved wheels', 'plan-wheels'],
    ['konark-horses', 'Stone horses', 'plan-horses']
  ];
  const selectedComponent = components.find((component) => component.component_id === selectedComponentId);
  const selectedDamageHasSpatialData = Boolean(selectedDamage?.spatialCoordinates || selectedDamage?.spatial_coordinates || selectedDamage?.boundingBox || selectedDamage?.geometry);
  const prohibitedZone = restrictedZones?.find((zone) => zone.distance_meters === 100 || /prohibited/i.test(zone.zone_type || zone.name || ''));
  const regulatedZone = restrictedZones?.find((zone) => zone.distance_meters === 200 || /regulated/i.test(zone.zone_type || zone.name || ''));
  const selectComponent = (id) => setSelectedComponentId(selectedComponentId === id ? null : id);
  const selectedRows = selectedComponent ? [
    ['Registry ID', selectedComponent.component_id],
    ['Verification', selectedComponent.verification || unavailable],
    ...(selectedComponent.quantity != null ? [['Registry quantity', selectedComponent.quantity]] : []),
    ...(selectedComponent.historical_condition?.documentedChange ? [['Documented change', selectedComponent.historical_condition.documentedChange]] : []),
    ...(selectedComponent.historical_condition?.documentedStatus ? [['Documented status', selectedComponent.historical_condition.documentedStatus]] : [])
  ] : [];

  return <section className="heritage-viewer-2d">
    <div className="viewer-2d-heading">
      <div>
        <p className="eyebrow">2D / SITE REFERENCE</p>
        <h2>Schematic Heritage Site Plan</h2>
        <p>Interactive architectural index built from the official coordinate and documented component registry. Shapes communicate relationships only.</p>
      </div>
      <span className="viewer-2d-badge">SCHEMATIC REFERENCE — NOT SURVEY GEOMETRY</span>
    </div>

    <div className="viewer-2d-layout">
      <section className="viewer-2d-plan-panel">
        <div className="viewer-2d-plan-topline"><span>SCHEMATIC SITE PLAN / NORTH-UP INDEX</span><span>BOUNDARY UNAVAILABLE</span></div>
        <div className="schematic-site-plan">
          <div className="plan-grid-lines"/>
          <div className="plan-context plan-context-a"><span>SCHEMATIC SITE CONTEXT</span></div>
          <div className="plan-context plan-context-b"/>
          <div className="plan-context plan-context-c"/>
          <div className="plan-axis axis-x"/>
          <div className="plan-axis axis-y"/>
          <div className="plan-north"><b>N</b><i/></div>
          <div className="plan-coordinate"><MapPin size={17}/><span>OFFICIAL COORDINATE</span></div>
          {componentOptions.map(([id, label, className]) => <button type="button" className={`plan-component ${className} ${selectedComponentId === id ? 'selected' : ''}`} onClick={() => selectComponent(id)} aria-pressed={selectedComponentId === id} key={id}><i/><b>{label}</b></button>)}
          <div className="plan-core-outline"><span>MONUMENT CORE / SCHEMATIC</span></div>
          <div className="plan-annotation annotation-1">NO PROPERTY POLYGON DRAWN</div>
          <div className="plan-annotation annotation-2">ORIENTATION REFERENCE</div>
        </div>
        <div className="viewer-2d-plan-caption"><span>Click a documented component to inspect registry metadata.</span><b>SCHEMATIC REFERENCE — NOT SURVEY GEOMETRY</b></div>
      </section>

      <aside className="viewer-2d-sidebar">
        <section className="viewer-2d-card viewer-2d-component-card">
          <p className="eyebrow">DOCUMENTED COMPONENTS</p>
          <h3>{selectedComponent?.name || 'Select a component'}</h3>
          {selectedComponent ? <div className="viewer-2d-selected-detail">
            <p>{selectedComponent.role || selectedComponent.type || 'Component metadata recorded.'}</p>
            <dl>{selectedRows.map(([label, value]) => <React.Fragment key={label}><dt>{label}</dt><dd>{value}</dd></React.Fragment>)}</dl>
            {selectedComponent.source?.url && <a href={selectedComponent.source.url} target="_blank" rel="noopener noreferrer">Open source <ExternalLink size={13}/></a>}
            <button className="viewer-2d-clear" onClick={() => setSelectedComponentId(null)}>Clear selection</button>
          </div> : <p>Choose Vimana, Jagamohana, Natmandir, carved wheels, or stone horses from the schematic.</p>}
        </section>

        <section className="viewer-2d-card viewer-2d-damage-card">
          <p className="eyebrow">SELECTED DAMAGE RECORD</p>
          <h3>{selectedDamage?.damage_type || unavailable}</h3>
          <span className="viewer-2d-record-badge">{selectedDamage?.verification || 'Verification unavailable'}</span>
          {selectedDamage?.location && <p>Documented location text: {selectedDamage.location}</p>}
          <p className={selectedDamageHasSpatialData ? '' : 'viewer-2d-alert'}>{selectedDamageHasSpatialData ? 'Verified spatial data available for a future mapped view.' : 'Image-level damage location unavailable'}</p>
          <small>No damage marker is drawn without image-level or spatial coordinates.</small>
        </section>

        <section className="viewer-2d-card viewer-2d-zone-card">
          <p className="eyebrow">PROTECTION DISTANCE CONCEPTS</p>
          <div className="distance-diagram"><div className="distance-ring distance-ring-200"><span>additional 200m regulated<br/>schematic reference</span></div><div className="distance-ring distance-ring-100"><span>100m prohibited<br/>schematic reference</span></div><b>MONUMENT</b></div>
          <p>{prohibitedZone?.reason || 'Prohibited zone legal reason is recorded in the restricted-zone register.'}</p>
          <p>{regulatedZone?.reason || 'Regulated zone legal reason is recorded in the restricted-zone register.'}</p>
          <strong>NOT A LEGAL SURVEY BOUNDARY</strong>
          <small>{hasGeometry ? 'Source geometry is available.' : 'Spatial boundary unavailable'}</small>
        </section>

        <section className="viewer-2d-card viewer-2d-evidence-card">
          <p className="eyebrow">EVIDENCE STATUS</p>
          <ul><li><i className="legend-source"/>Source-backed coordinate and registry information</li><li><i className="legend-component"/>Documented component metadata</li><li><i className="legend-selected"/>Selected record / interface focus</li><li><i className="legend-schematic"/>Schematic reference only</li><li><i className="legend-unavailable"/>Boundary or spatial detail unavailable</li></ul>
          <p className="viewer-2d-safe-note">No fabricated geometry, boundaries, measurements, or damage coordinates are displayed.</p>
        </section>
      </aside>
    </div>

    <div className="viewer-2d-coordinate-bar">
      <div><p className="eyebrow">OFFICIAL PROPERTY COORDINATE</p><b>{hasCoordinates ? `${monument.latitude}, ${monument.longitude}` : 'Coordinate record unavailable'}</b></div>
      <div><p className="eyebrow">SPATIAL POLICY</p><b>Property geometry available: {hasGeometry ? 'Source geometry' : 'No'}</b></div>
      <div><p className="eyebrow">MODEL PROVENANCE</p>{projectModels.length ? projectModels.map((model) => <a href={model.sourceUrl} target="_blank" rel="noopener noreferrer" key={model.id}><span>Project/reference model</span><b>Not survey ground truth · {model.title}</b><ExternalLink size={14}/></a>) : <b>Procedural schematic only</b>}</div>
    </div>
  </section>;
}
