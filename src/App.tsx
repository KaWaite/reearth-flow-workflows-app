import { useState } from 'react';
import { isWorkflowConfigured } from './lib/api';
import { CsvQualityWorkflow } from './workflows/CsvQuality';
import { GeoJsonPipelineWorkflow } from './workflows/GeoJsonPipeline';
import { CsvMergeWorkflow } from './workflows/CsvMerge';
import { ColumnSelectorWorkflow } from './workflows/ColumnSelector';
import { CsvSplitWorkflow } from './workflows/CsvSplit';
import { CsvToJsonWorkflow } from './workflows/CsvToJson';
import { SpatialFilterWorkflow } from './workflows/SpatialFilter';
import type { WorkflowId } from './types';
import './App.css';

const TABS: { id: WorkflowId; label: string }[] = [
  { id: 1, label: 'CSV Quality' },
  { id: 2, label: 'GeoJSON Pipeline' },
  { id: 3, label: 'CSV Merge' },
  { id: 4, label: 'Col Selector' },
  { id: 5, label: 'CSV Split' },
  { id: 6, label: 'CSV → JSON' },
  { id: 7, label: 'Size Filter' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkflowId>(1);

  return (
    <div className="layout">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="header-icon">⚙</span>
            <span className="header-title">Flow Trigger</span>
          </div>
          <span className="header-badge">Re:Earth Flow</span>
        </div>
      </header>

      <nav className="tab-bar">
        <div className="tab-bar-inner">
          {TABS.map(({ id, label }) => {
            const configured = isWorkflowConfigured(id);
            return (
              <button
                key={id}
                className={`tab ${activeTab === id ? 'tab-active' : ''} ${!configured ? 'tab-unconfigured' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <span className="tab-dot" />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="main">
        {activeTab === 1 && <CsvQualityWorkflow />}
        {activeTab === 2 && <GeoJsonPipelineWorkflow />}
        {activeTab === 3 && <CsvMergeWorkflow />}
        {activeTab === 4 && <ColumnSelectorWorkflow />}
        {activeTab === 5 && <CsvSplitWorkflow />}
        {activeTab === 6 && <CsvToJsonWorkflow />}
        {activeTab === 7 && <SpatialFilterWorkflow />}
      </main>

      <footer className="footer">
        Built for Re:Earth Flow · homework assignment
      </footer>
    </div>
  );
}
