import { useState } from 'react';
import { isWorkflowConfigured, TRIGGER_VAR_NAMES } from './lib/api';
import { useT } from './i18n';
import { SetupGuide } from './components/SetupGuide';
import { FlowLogo } from './components/FlowLogo';
import { CsvQualityWorkflow } from './workflows/CsvQuality';
import { GeoJsonPipelineWorkflow } from './workflows/GeoJsonPipeline';
import { CsvMergeWorkflow } from './workflows/CsvMerge';
import { ColumnSelectorWorkflow } from './workflows/ColumnSelector';
import { CsvSplitWorkflow } from './workflows/CsvSplit';
import { CsvToJsonWorkflow } from './workflows/CsvToJson';
import { SpatialFilterWorkflow } from './workflows/SpatialFilter';
import type { WorkflowId } from './types';
import './App.css';

const TAB_IDS: WorkflowId[] = [1, 2, 3, 4, 5, 6, 7];

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkflowId>(1);
  const [showSetup, setShowSetup] = useState(false);
  const { lang, setLang, t } = useT();

  return (
    <div className="layout">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <FlowLogo className="header-logo" />
            <span className="header-title">{t.header.title}</span>
          </div>
          <span className="header-badge">{t.header.badge}</span>
          <div className="header-actions">
            <div className="lang-toggle" role="group" aria-label="Language">
              <button
                className={`lang-btn ${lang === 'en' ? 'lang-btn-active' : ''}`}
                onClick={() => setLang('en')}
              >EN</button>
              <button
                className={`lang-btn ${lang === 'ja' ? 'lang-btn-active' : ''}`}
                onClick={() => setLang('ja')}
              >JA</button>
            </div>
            <button className="btn-setup" onClick={() => setShowSetup(true)}>{t.header.setupBtn}</button>
          </div>
        </div>
      </header>

      <nav className="tab-bar">
        <div className="tab-bar-inner">
          {TAB_IDS.map((id) => {
            const configured = isWorkflowConfigured(id);
            return (
              <button
                key={id}
                className={`tab ${activeTab === id ? 'tab-active' : ''} ${!configured ? 'tab-unconfigured' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <span className="tab-dot" />
                {t.tabs[id]}
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

      {showSetup && (
        <SetupGuide
          varName={TRIGGER_VAR_NAMES[activeTab]}
          onClose={() => setShowSetup(false)}
        />
      )}

      <footer className="footer">
        {t.footer}
      </footer>
    </div>
  );
}
