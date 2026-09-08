import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Center, ContactShadows, OrbitControls, useGLTF } from '@react-three/drei';
import { RotateCcw, Rotate3D, ZoomIn, Move, ExternalLink } from 'lucide-react';

function Model({ modelPath, onReady }) {
  const { scene } = useGLTF(modelPath);
  useEffect(() => { onReady(); }, [onReady]);
  return <Center><primitive object={scene} dispose={null}/></Center>;
}

function isEligibleLocalModel(model) {
  const format = String(model?.format || '').toLowerCase();
  const sourceType = String(model?.sourceType || '').toLowerCase();
  const usageStatus = String(model?.usageStatus || '').toLowerCase();
  const assetStatus = String(model?.assetStatus || '').toLowerCase();
  return Boolean(model?.localPath && !/^https?:\/\//i.test(model.localPath)
    && /^(glb|gltf|glb\/gltf)/.test(format)
    && ['local', 'available', 'verified'].includes(assetStatus)
    && model.license && model.creator && model.sourceUrl
    && !sourceType.includes('ai_generated')
    && usageStatus !== 'do_not_use_as_historical_ground_truth');
}

function publicAssetPath(localPath) {
  if (!localPath) return null;
  if (localPath.startsWith('/')) return localPath;
  return localPath.replace(/^public[\\/]/, '/').replace(/\\/g, '/').replace(/^([^/])/, '/$1');
}

class ModelErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { this.props.onError?.(); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

function ViewerScene({ modelPath, onReady, onError, controlsRef, fallback }) {
  return <Canvas shadows camera={{ position: [7.8, 5.1, 8.8], fov: 38 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
    <color attach="background" args={['#22251f']}/>
    <fog attach="fog" args={['#22251f', 12, 28]}/>
    <ambientLight intensity={0.8}/>
    <hemisphereLight intensity={1.1} color="#e4d5b9" groundColor="#45483e"/>
    <directionalLight castShadow position={[5, 9, 6]} intensity={2.7} color="#f5d8a5" shadow-mapSize={[2048, 2048]} shadow-camera-far={30} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10}/>
    <directionalLight position={[-5, 4, -5]} intensity={0.8} color="#aebbc0"/>
    <ModelErrorBoundary onError={onError} fallback={fallback}><Suspense fallback={fallback}><Bounds fit clip observe margin={1.25}><Model modelPath={modelPath} onReady={onReady}/></Bounds></Suspense></ModelErrorBoundary>
    <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.08} minDistance={1.5} maxDistance={18} minPolarAngle={0.2} maxPolarAngle={Math.PI - 0.2} makeDefault/>
  </Canvas>;
}

const stoneColors = { base: '#8f806d', light: '#b29d7d', shadow: '#6c604f', accent: '#c0a277', dark: '#514b40', highlight: '#e4a85f' };

function StoneMaterial({ color = stoneColors.base, selected = false, transparent = false }) {
  return <meshStandardMaterial color={selected ? stoneColors.highlight : color} roughness={0.86} metalness={0.02} flatShading={false} transparent={transparent} opacity={transparent ? 0.48 : 1} emissive={selected ? '#6a321d' : '#000000'} emissiveIntensity={selected ? 0.55 : 0}/>;
}

function InteractiveMass({ id, selected, onSelect, children }) {
  return <group onClick={(event) => { event.stopPropagation(); onSelect(id); }}>{children}</group>;
}

function TieredPyramid({ selected }) {
  return <group position={[0.85, 1.5, 0]}>
    {[0, 0.46, 0.86, 1.2].map((y, index) => <mesh castShadow receiveShadow position={[0, y, 0]} rotation={[0, Math.PI / 4, 0]} key={y}><coneGeometry args={[1.72 - index * 0.34, 0.54, 4]}/><StoneMaterial color={index % 2 ? stoneColors.light : stoneColors.base} selected={selected}/></mesh>)}
    <mesh castShadow position={[0, 2.15, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.38, 1.25, 4]}/><StoneMaterial color={stoneColors.accent} selected={selected}/></mesh>
    <mesh castShadow position={[0, 2.86, 0]}><cylinderGeometry args={[0.36, 0.36, 0.12, 12]}/><StoneMaterial color={stoneColors.dark} selected={selected}/></mesh>
  </group>;
}

function Shikhara({ selected }) {
  return <group position={[-1.65, 1.65, 0]}>
    <mesh castShadow position={[0, 0, 0]}><coneGeometry args={[1.24, 2.7, 10]}/><StoneMaterial color={stoneColors.light} selected={selected} transparent={selected}/></mesh>
    {[0.35, 0.78, 1.2, 1.62, 2.04].map((y, index) => <mesh castShadow position={[0, y - 1.2, 0]} key={y}><torusGeometry args={[0.98 - index * 0.13, 0.07, 8, 20]}/><StoneMaterial color={stoneColors.accent} selected={selected}/></mesh>)}
    <mesh castShadow position={[0, 1.48, 0]}><cylinderGeometry args={[0.25, 0.34, 0.22, 12]}/><StoneMaterial color={stoneColors.dark} selected={selected}/></mesh>
    <mesh castShadow position={[0, 1.82, 0]}><sphereGeometry args={[0.22, 12, 8]}/><StoneMaterial color={stoneColors.accent} selected={selected}/></mesh>
  </group>;
}

function Wheel({ position, selected, onSelect }) {
  return <group position={position} onClick={(event) => { event.stopPropagation(); onSelect('konark-wheels'); }}>
    <mesh castShadow rotation={[0, 0, 0]}><torusGeometry args={[0.74, 0.13, 12, 32]}/><StoneMaterial color={stoneColors.accent} selected={selected}/></mesh>
    <mesh castShadow rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 0.18, 12]}/><StoneMaterial color={stoneColors.dark} selected={selected}/></mesh>
    {[0, Math.PI / 4, Math.PI / 2, (Math.PI * 3) / 4].map((angle) => <mesh castShadow rotation={[0, 0, angle]} key={angle}><boxGeometry args={[1.22, 0.08, 0.08]}/><StoneMaterial color={stoneColors.light} selected={selected}/></mesh>)}
    {[0, Math.PI / 4, Math.PI / 2, (Math.PI * 3) / 4].map((angle) => <mesh castShadow rotation={[0, 0, angle]} position={[Math.cos(angle) * 0.42, Math.sin(angle) * 0.42, 0.03]} key={`inner-${angle}`}><boxGeometry args={[0.62, 0.045, 0.045]}/><StoneMaterial color={stoneColors.shadow} selected={selected}/></mesh>)}
  </group>;
}

function Horse({ position, rotation = [0, 0, 0], selected, onSelect }) {
  return <group position={position} rotation={rotation} onClick={(event) => { event.stopPropagation(); onSelect('konark-horses'); }}>
    <mesh castShadow scale={[0.82, 0.45, 0.34]} position={[0, 0.66, 0]}><sphereGeometry args={[0.7, 16, 10]}/><StoneMaterial color={stoneColors.light} selected={selected}/></mesh>
    <mesh castShadow scale={[0.32, 0.58, 0.28]} position={[0.55, 1.12, 0]} rotation={[0, 0, -0.22]}><sphereGeometry args={[0.55, 14, 10]}/><StoneMaterial color={stoneColors.base} selected={selected}/></mesh>
    <mesh castShadow position={[0.84, 1.35, 0]} rotation={[0, 0, -0.2]}><coneGeometry args={[0.2, 0.62, 6]}/><StoneMaterial color={stoneColors.accent} selected={selected}/></mesh>
    {[-0.42, 0.28].map((x) => <mesh castShadow position={[x, 0.28, 0]} key={x}><boxGeometry args={[0.13, 0.75, 0.15]}/><StoneMaterial color={stoneColors.shadow} selected={selected}/></mesh>)}
    <mesh castShadow position={[-0.78, 0.92, 0]} rotation={[0, 0, -0.6]}><cylinderGeometry args={[0.07, 0.12, 0.85, 8]}/><StoneMaterial color={stoneColors.dark} selected={selected}/></mesh>
  </group>;
}

function FallbackTwin({ selectedComponentId = null, onSelect = () => {} }) {
  const selected = (id) => selectedComponentId === id;
  return <group>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}><planeGeometry args={[18, 14]}/><StoneMaterial color="#41453d"/></mesh>
    <gridHelper args={[18, 18, '#737463', '#343831']} position={[0, -0.455, 0]}/>
    <mesh castShadow receiveShadow position={[0, -0.18, 0]}><boxGeometry args={[8.3, 0.42, 4.8]}/><StoneMaterial color={stoneColors.dark}/></mesh>
    <mesh castShadow receiveShadow position={[0, 0.08, 0]}><boxGeometry args={[7.6, 0.22, 4.35]}/><StoneMaterial color={stoneColors.accent}/></mesh>
    <mesh castShadow receiveShadow position={[0, 0.26, 0]}><boxGeometry args={[7, 0.18, 3.95]}/><StoneMaterial color={stoneColors.light}/></mesh>
    <InteractiveMass id="konark-jagamohana" selected={selected('konark-jagamohana')} onSelect={onSelect}>
      <mesh castShadow receiveShadow position={[0.7, 0.78, 0]}><boxGeometry args={[3.25, 0.95, 2.65]}/><StoneMaterial color={stoneColors.base} selected={selected('konark-jagamohana')}/></mesh>
      <TieredPyramid selected={selected('konark-jagamohana')}/>
      {[-0.52, 0.52].map((z) => <mesh castShadow position={[0.7, 0.8, z * 2.1]} key={z}><boxGeometry args={[2.45, 1.2, 0.18]}/><StoneMaterial color={stoneColors.shadow} selected={selected('konark-jagamohana')}/></mesh>)}
    </InteractiveMass>
    <InteractiveMass id="konark-vimana" selected={selected('konark-vimana')} onSelect={onSelect}>
      <mesh castShadow receiveShadow position={[-1.65, 0.72, 0]}><boxGeometry args={[2.05, 0.85, 2.25]}/><StoneMaterial color={stoneColors.base} selected={selected('konark-vimana')}/></mesh>
      <Shikhara selected={selected('konark-vimana')}/>
    </InteractiveMass>
    <InteractiveMass id="konark-natmandir" selected={selected('konark-natmandir')} onSelect={onSelect}>
      <mesh castShadow receiveShadow position={[2.75, 0.68, 0]}><boxGeometry args={[1.55, 0.72, 2.65]}/><StoneMaterial color={stoneColors.shadow} selected={selected('konark-natmandir')}/></mesh>
      {[-0.92, 0.92].flatMap((z) => [-0.52, 0.52].map((x) => <mesh castShadow position={[2.75 + x, 1.14, z]} key={`${x}-${z}`}><cylinderGeometry args={[0.12, 0.16, 0.95, 8]}/><StoneMaterial color={stoneColors.light} selected={selected('konark-natmandir')}/></mesh>))}
    </InteractiveMass>
    {[-1.35, 0, 1.35].flatMap((x) => [-1, 1].map((side) => <Wheel key={`${x}-${side}`} position={[x, 0.82, side * 2.2]} selected={selected('konark-wheels')} onSelect={onSelect}/>))}
    {[[-3.2, 0.05, -0.55], [-3.2, 0.05, 0.55], [3.95, 0.05, -0.58], [3.95, 0.05, 0.58]].map(([x, y, z], index) => <Horse key={index} position={[x, y, z]} rotation={[0, x < 0 ? Math.PI : 0, 0]} selected={selected('konark-horses')} onSelect={onSelect}/>)}
    <ContactShadows position={[0, -0.43, 0]} opacity={0.48} scale={14} blur={2.6} far={5}/>
  </group>;
}

function GenericFallbackTwin() {
  return <group>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}><planeGeometry args={[14, 11]}/><meshStandardMaterial color="#41453d" roughness={0.9}/></mesh>
    <gridHelper args={[14, 14, '#737463', '#343831']} position={[0, -0.455, 0]}/>
    <mesh castShadow receiveShadow position={[0, 0.15, 0]}><boxGeometry args={[4.4, 0.6, 3.2]}/><meshStandardMaterial color="#9b8a72" roughness={0.86}/></mesh>
    <mesh castShadow receiveShadow position={[0, 1, 0]}><coneGeometry args={[1.8, 1.7, 6]}/><meshStandardMaterial color="#b29d7d" roughness={0.86}/></mesh>
    <ContactShadows position={[0, -0.43, 0]} opacity={0.4} scale={11} blur={2.4} far={5}/>
  </group>;
}

function FallbackScene({ loading = false }) {
  return <FallbackTwin userData={{ loading, error: !loading }}/>;
}

export default function Konark3DViewer({ monument, selectedTimeline, selectedDamage, restrictedZones, threeD, architecturalComponents = [] }) {
  const isKonark = monument?.monument_id === 'konark-sun-temple';
  const registeredModel = threeD?.models?.find(isEligibleLocalModel) ?? null;
  const modelPath = publicAssetPath(registeredModel?.localPath);
  const [assetState, setAssetState] = useState('checking');
  const [modelError, setModelError] = useState(false);
  const [rotateEnabled, setRotateEnabled] = useState(true);
  const [zoomEnabled, setZoomEnabled] = useState(true);
  const [panEnabled, setPanEnabled] = useState(true);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const controlsRef = useRef(null);
  const modelAvailable = assetState === 'available' && !modelError;
  const mappedComponents = architecturalComponents.filter((component) => component.geometry_reference);
  const componentOptions = [
    ['konark-vimana', 'Vimana'],
    ['konark-jagamohana', 'Jagamohana'],
    ['konark-natmandir', 'Natmandir'],
    ['konark-wheels', 'Wheels'],
    ['konark-horses', 'Horses']
  ];
  const selectedComponent = architecturalComponents.find((component) => component.component_id === selectedComponentId);
  const hasInterior = Boolean(threeD?.interiorGeometryAvailable);
  const hasRestrictedGeometry = restrictedZones?.some((zone) => zone.geometry != null) ?? false;
  const referenceModel = threeD?.models?.find((model) => model.authorityLevel === 'reference_only' || model.authorityLevel === 'verified_reference');
  const authorityLevel = threeD?.authoritativeAsset?.available ? 'authoritative' : referenceModel?.authorityLevel ?? 'unavailable';
  const statusLabel = modelAvailable ? (registeredModel?.authorityLevel === 'authoritative' ? 'AUTHORITATIVE' : registeredModel?.authorityLevel === 'verified_reference' ? 'VERIFIED REFERENCE' : 'PROJECT / REFERENCE MODEL') : 'DEMO DIGITAL TWIN';
  const fallbackScene = isKonark ? <FallbackTwin selectedComponentId={selectedComponentId} onSelect={setSelectedComponentId}/> : <GenericFallbackTwin/>;

  useEffect(() => {
    let active = true;
    if (!modelPath) {
      setAssetState('missing');
      setModelError(false);
      return () => { active = false; };
    }
    fetch(modelPath, { cache: 'no-store' })
      .then(async (response) => {
        const contentType = response.headers.get('content-type') || '';
        const header = new Uint8Array(await response.arrayBuffer()).subarray(0, 4);
        const isGlb = String.fromCharCode(...header) === 'glTF';
        if (active) setAssetState(response.ok && isGlb && !contentType.includes('text/html') ? 'available' : 'missing');
      })
      .catch(() => { if (active) setAssetState('missing'); });
    return () => { active = false; };
  }, [modelPath]);

  const resetView = () => controlsRef.current?.reset();
  const setControl = (name, value) => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls[name] = value;
    if (name === 'enableRotate') setRotateEnabled(value);
    if (name === 'enableZoom') setZoomEnabled(value);
    if (name === 'enablePan') setPanEnabled(value);
  };

  return <section className="digital-twin-viewer">
    <div className="digital-twin-heading"><div><p className="eyebrow">OPTIONAL 3D SHOWCASE</p><h2>{monument?.name || 'Monument'} 3D Reference Model</h2><p>This is an interactive 3D reference viewer. Use mouse/touch controls to orbit and zoom.</p></div><span className="digital-twin-badge">{statusLabel}</span></div>
    {assetState === 'checking' && <div className="digital-twin-fallback"><p className="eyebrow">MODEL STATUS</p><h3>Checking local model availability…</h3><p>Only a local verified asset can be loaded.</p></div>}
    {assetState !== 'checking' && !modelAvailable && <div className="digital-twin-fallback"><p className="eyebrow">DEMO DIGITAL TWIN</p><h3>ILLUSTRATIVE GEOMETRY ACTIVE</h3><p>No eligible verified local GLB/GLTF is registered for this monument. The procedural scene is a presentation fallback only.</p><strong>ILLUSTRATIVE GEOMETRY — NOT SURVEY GROUND TRUTH</strong>{referenceModel?.sourceUrl && <a href={referenceModel.sourceUrl} target="_blank" rel="noopener noreferrer"><span>Reference metadata</span> · {referenceModel.title || referenceModel.assetId} <ExternalLink size={13}/></a>}</div>}
    {modelAvailable && registeredModel && <div className="digital-twin-asset-provenance"><div><p className="eyebrow">LOCAL 3D ASSET</p><h3>{registeredModel.title || registeredModel.assetId}</h3></div><div><span>{registeredModel.authorityLevel || 'REFERENCE MODEL'}</span><span>Creator: {registeredModel.creator}</span><span>License: {registeredModel.license}</span></div>{registeredModel.sourceUrl && <a href={registeredModel.sourceUrl} target="_blank" rel="noopener noreferrer">Source and provenance <ExternalLink size={13}/></a>}</div>}
  {assetState !== 'checking' && <div className="digital-twin-canvas">{modelAvailable ? <ViewerScene modelPath={modelPath} onReady={() => setModelError(false)} onError={() => setModelError(true)} controlsRef={controlsRef} fallback={fallbackScene}/> : <Canvas shadows camera={{ position: [7.8, 5.1, 8.8], fov: 38 }} dpr={[1, 1.5]} gl={{ antialias: true }}><color attach="background" args={['#22251f']}/><fog attach="fog" args={['#22251f', 12, 28]}/><ambientLight intensity={0.8}/><hemisphereLight intensity={1.1} color="#e4d5b9" groundColor="#45483e"/><directionalLight castShadow position={[5, 9, 6]} intensity={2.7} color="#f5d8a5" shadow-mapSize={[2048, 2048]} shadow-camera-far={30} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10}/><directionalLight position={[-5, 4, -5]} intensity={0.8} color="#aebbc0"/>{fallbackScene}<OrbitControls ref={controlsRef} enableDamping dampingFactor={0.08} minDistance={1.5} maxDistance={18} minPolarAngle={0.2} maxPolarAngle={Math.PI - 0.2}/></Canvas>}<div className="digital-twin-canvas-label">{modelAvailable ? statusLabel : 'DEMO DIGITAL TWIN'} · ILLUSTRATIVE GEOMETRY — NOT SURVEY GROUND TRUTH</div></div>}
  <div className="digital-twin-toolbar"><button onClick={resetView} aria-label="Reset 3D view"><RotateCcw size={15}/> Reset View</button><button className={rotateEnabled ? 'active' : ''} onClick={() => setControl('enableRotate', !rotateEnabled)} aria-label="Toggle orbit rotation"><Rotate3D size={15}/> Rotate</button><button className={zoomEnabled ? 'active' : ''} onClick={() => setControl('enableZoom', !zoomEnabled)} aria-label="Toggle zoom"><ZoomIn size={15}/> Zoom</button><button className={panEnabled ? 'active' : ''} onClick={() => setControl('enablePan', !panEnabled)} aria-label="Toggle pan"><Move size={15}/> Pan</button><button disabled={!hasInterior} title="Interior geometry is not established">Interior</button><button disabled={!mappedComponents.length} title={mappedComponents.length ? 'Measured component mapping exists' : 'No measured component-to-3D mapping exists'}>Measured components</button></div>
  {!modelAvailable && isKonark && <div className="digital-twin-components"><div><p className="eyebrow">PROCEDURAL COMPONENT PICKER</p><p>Select an illustrative mass to inspect its existing documented metadata. This is not a measured model mapping.</p></div><div className="digital-twin-component-buttons">{componentOptions.map(([id, label]) => <button className={selectedComponentId === id ? 'selected' : ''} onClick={() => setSelectedComponentId(selectedComponentId === id ? null : id)} key={id}>{label}</button>)}</div>{selectedComponent && <article className="digital-twin-component-detail"><p className="eyebrow">DOCUMENTED COMPONENT · {selectedComponent.verification || 'Verification not available'}</p><h3>{selectedComponent.name}</h3><p>{selectedComponent.role || selectedComponent.type || 'Component metadata recorded.'}</p>{selectedComponent.historical_condition?.documentedChange && <p>{selectedComponent.historical_condition.documentedChange}</p>}{selectedComponent.historical_condition?.documentedStatus && <p>{selectedComponent.historical_condition.documentedStatus}</p>}{selectedComponent.quantity != null && <span>Registry quantity: {selectedComponent.quantity}</span>}{selectedComponent.source?.url && <a href={selectedComponent.source.url} target="_blank" rel="noopener noreferrer">Open source <ExternalLink size={13}/></a>}</article>}</div>}
  <div className="digital-twin-status"><span>Timeline state: {selectedTimeline?.historical_event || 'No state selected'}</span><span>Historical-state geometry unavailable</span><span>DEMO / ILLUSTRATIVE</span><span>{selectedDamage ? `Damage: ${selectedDamage.damage_type}` : 'Damage not selected'}</span><span>{selectedDamage?.spatialCoordinates ? 'Mapped damage region' : 'Image-level damage location unavailable'}</span><span>{hasRestrictedGeometry ? 'Restricted-zone geometry available' : 'Spatial boundary unavailable'}</span><span>{hasInterior ? 'Interior View available' : 'Interior geometry not established'}</span></div>
  </section>;
}
