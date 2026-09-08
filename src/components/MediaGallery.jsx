import React from 'react';
import { ExternalLink } from 'lucide-react';

const availabilityLabel = {
  local: 'Available locally',
  verified_external: 'Available from verified external source',
  metadata_only: 'Metadata only',
  unavailable: 'Preview not locally stored'
};

function humanizeStatus(value) {
  if (value == null || value === '') return 'Not available';
  return String(value).replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function MediaGallery({ items = [] }) {
  return <section className="media-gallery">
    <div className="section-heading"><div><p className="eyebrow">MEDIA REGISTRY</p><h3>Media gallery</h3></div><span className="data-badge">{items.length} registered assets</span></div>
    {items.length ? <div className="media-gallery-grid">{items.map((item) => <article className="media-card" key={item.media_id || item.id}>
      {item.local_path ? <img className="media-preview" src={item.local_path} alt={item.title || item.media_id || 'Registered media'}/> : <div className="media-placeholder"><span>MEDIA RECORD</span><b>PREVIEW NOT LOCALLY STORED</b><small>{item.asset_type || 'Asset'} · Registry metadata retained</small></div>}
      <h4>{item.title || item.filename || item.media_id || 'Untitled media'}</h4>
      <p>{item.source || 'Source unavailable'} · {item.date || 'Date unavailable'}</p>
      <dl><dt>Asset ID</dt><dd>{item.media_id || 'Not available'}</dd><dt>Licence</dt><dd>{item.license || 'Not available'}</dd><dt>Verification</dt><dd>{humanizeStatus(item.verification)}</dd></dl><small className="rights-indicator">PROVENANCE / RIGHTS RETAINED</small>
      {item.author && <small>Creator: {item.author}</small>}
      {item.attribution_required != null && <small>Attribution required: {item.attribution_required ? 'Yes' : 'No'}</small>}
      {item.source_url && <a href={item.source_url} target="_blank" rel="noopener noreferrer">Open source <ExternalLink size={13}/></a>}
    </article>)}</div> : <p className="unavailable">No media registered.</p>}
  </section>;
}
