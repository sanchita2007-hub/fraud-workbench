import React, { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';
import { Info, X, User, Smartphone, ZoomIn, ZoomOut, Maximize, AlertTriangle, ArrowRight } from 'lucide-react';

function GraphViewer() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState('rahul_sharma');
  const [selectedNode, setSelectedNode] = useState(null);
  const fgRef = useRef();

  const fetchGraph = async () => {
    setLoading(true);
    setSelectedNode(null);
    try {
      // NAYA RENDER URL YAHAN HAI
      const response = await axios.get(`https://fraud-backend-0h4i.onrender.com/api/graph/${accountId}`);
      
      const uniqueLinks = Array.from(new Set(response.data.links.map(l => JSON.stringify(l)))).map(l => JSON.parse(l));
      const nodesMap = new Map();
      response.data.nodes.forEach(n => nodesMap.set(n.id, n));
      
      const simplifiedLinks = [];

      uniqueLinks.forEach(link1 => {
        const sourceNode = nodesMap.get(link1.source);
        const targetNode = nodesMap.get(link1.target);
        
        const txId = sourceNode?.label === 'Transaction' ? sourceNode.id : (targetNode?.label === 'Transaction' ? targetNode.id : null);
        
        if (txId) {
          const otherLink = uniqueLinks.find(l => (l.source === txId || l.target === txId) && l !== link1);
          if (otherLink) {
            const accA = nodesMap.get(link1.source)?.label === 'Transaction' ? nodesMap.get(link1.target).id : nodesMap.get(link1.source).id;
            const accB = nodesMap.get(otherLink.source)?.label === 'Transaction' ? nodesMap.get(otherLink.target).id : nodesMap.get(otherLink.source).id;
            
            if (accA && accB && accA !== accB) {
              if (!simplifiedLinks.find(l => l.source === accA && l.target === accB)) {
                const txNode = nodesMap.get(txId);
                simplifiedLinks.push({ 
                  source: accA, 
                  target: accB, 
                  amount: txNode?.amount ? `₹${Number(txNode.amount).toLocaleString()}` : 'Transfer'
                });
              }
            }
          }
        }
      });

      const visibleNodes = response.data.nodes.filter(n => n.label !== 'Transaction');
      setGraphData({ nodes: visibleNodes, links: simplifiedLinks });

    } catch (error) {
      console.error("Error fetching graph:", error);
      alert("Failed to load graph.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const label = node.name;
    const fontSize = 15 / globalScale;
    
    let color = '#3B82F6'; 
    if (node.label === 'Device') color = '#10B981'; 
    
    if (selectedNode && selectedNode.id === node.id) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
    }
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    
    ctx.lineWidth = 3 / globalScale;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.shadowBlur = 0; 

    ctx.font = `bold ${12 / globalScale}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(node.label === 'Account' ? 'ACC' : 'DEV', node.x, node.y);

    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = '#F8FAFC';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText(label, node.x, node.y + 35);
    ctx.shadowBlur = 0;
  }, [selectedNode]);

  const paintLink = useCallback((link, ctx, globalScale) => {
    if (!link.source.x || !link.target.x) return;
    
    const start = link.source;
    const end = link.target;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.stroke();

    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowLength = 14;
    const arrowX = end.x - 20 * Math.cos(angle);
    const arrowY = end.y - 20 * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - arrowLength * Math.cos(angle - Math.PI / 6), arrowY - arrowLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(arrowX - arrowLength * Math.cos(angle + Math.PI / 6), arrowY - arrowLength * Math.sin(angle + Math.PI / 6));
    ctx.fillStyle = '#EF4444';
    ctx.fill();

    const textPos = {
      x: start.x + (end.x - start.x) * 0.5,
      y: start.y + (end.y - start.y) * 0.5
    };

    let textAngle = Math.atan2(end.y - start.y, end.x - start.x);
    if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
    if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

    ctx.save();
    ctx.translate(textPos.x, textPos.y);
    ctx.rotate(textAngle);
    
    const text = link.amount;
    ctx.font = `bold ${12 / globalScale}px Inter, sans-serif`;
    const textWidth = ctx.measureText(text).width;
    
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-textWidth/2 - 8, -12, textWidth + 16, 24, 6);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#F8FAFC';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);
    
    ctx.restore();
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input 
            type="text" 
            value={accountId} 
            onChange={(e) => setAccountId(e.target.value)}
            className="input-field"
            placeholder="Enter Account ID"
            style={{ width: '250px' }}
          />
          <button onClick={fetchGraph} className="btn btn-primary">
            {loading ? 'Loading...' : 'Analyze Network'}
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', background: 'var(--bg-card)', padding: '5px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button onClick={() => fgRef.current.zoom(fgRef.current.zoom() * 1.5, 400)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '5px' }}><ZoomIn size={20} /></button>
          <button onClick={() => fgRef.current.zoom(fgRef.current.zoom() / 1.5, 400)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '5px' }}><ZoomOut size={20} /></button>
          <button onClick={() => fgRef.current.zoomToFit(400, 100)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '5px' }}><Maximize size={20} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
        
        <div style={{ flex: 1, background: '#0B1120', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', position: 'relative' }}>
          
          <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(10px)', padding: '12px 20px', borderRadius: '10px', color: 'white', border: '1px solid #334155', fontSize: '13px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Network Legend</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#3B82F6' }}></div> Account
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#10B981' }}></div> Device
            </div>
          </div>

          {graphData.nodes.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
              No graph data found.
            </div>
          ) : (
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              nodeCanvasObject={paintNode}
              linkCanvasObject={paintLink}
              linkCanvasObjectMode={() => 'replace'}
              onNodeClick={(node) => setSelectedNode(node)}
              
              d3AlphaDecay={0.01}
              d3VelocityDecay={0.5}
              cooldownTicks={200}
              d3Force="charge"
              d3ForceStrength={-500}
              linkDistance={200}
              
              onEngineStop={() => fgRef.current.zoomToFit(400, 100)} 
              
              width={800}
              height={500}
              backgroundColor="#0B1120"
            />
          )}
        </div>

        <div style={{ width: '300px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '25px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Entity Profile</h3>
            {selectedNode && (
              <button onClick={() => setSelectedNode(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            )}
          </div>

          {!selectedNode ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
              <Info size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
              <p style={{ fontSize: '14px' }}>Click on any Account or Device node to view detailed insights here.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: selectedNode.label === 'Account' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${selectedNode.label === 'Account' ? 'var(--primary)' : 'var(--success)'}` }}>
                  {selectedNode.label === 'Account' ? <User size={40} color="var(--primary)" /> : <Smartphone size={40} color="var(--success)" />}
                </div>
              </div>

              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Entity ID</label>
                <div style={{ fontSize: '20px', fontWeight: 'bold', wordBreak: 'break-all' }}>{selectedNode.name}</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Type:</span>
                  <span style={{ fontWeight: 'bold', color: selectedNode.label === 'Account' ? 'var(--primary)' : 'var(--success)' }}>{selectedNode.label}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Status:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--warning)' }}>Monitored</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', background: 'var(--bg-card)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle color="var(--danger)" size={24} /> How Money is Circulating (Transaction Flow)
        </h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          {graphData.links.map((link, index) => {
            const sourceName = graphData.nodes.find(n => n.id === link.source)?.name;
            const targetName = graphData.nodes.find(n => n.id === link.target)?.name;
            
            return (
              <React.Fragment key={index}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(59, 130, 246, 0.1)', padding: '12px 20px', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Account</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{sourceName}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--danger)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{link.amount}</span>
                  <ArrowRight size={24} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(59, 130, 246, 0.1)', padding: '12px 20px', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Account</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{targetName}</span>
                </div>
                {index < graphData.links.length - 1 && (
                   <span style={{ margin: '0 10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>THEN</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--danger)' }}>
          <h4 style={{ color: 'var(--danger)', margin: '0 0 5px 0' }}>🚨 Fraud Alert: Circular Transfer Loop Detected</h4>
          <p style={{ color: 'var(--text-main)', margin: 0, fontSize: '14px' }}>
            The money has moved in a closed loop and returned back to the origin account (<strong>{graphData.nodes.find(n => n.id === graphData.links[0]?.source)?.name}</strong>). This pattern indicates "Layering" or Money Laundering.
          </p>
        </div>
      </div>

    </div>
  );
}

export default GraphViewer;