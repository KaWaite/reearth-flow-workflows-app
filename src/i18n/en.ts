export type Step =
  | { title: string; body: string }
  | { title: string; bodyBefore: string; bodyAfter: string; varHint: string };

export interface WorkflowLearnMore {
  problem: string;
  whenToUse: string;
  concepts: { name: string; desc: string }[];
  inputShape: string;
}

export interface WorkflowT {
  title: string;
  desc: string;
  steps?: string[];
  learnMore: WorkflowLearnMore;
  fields: Record<string, { label: string; hint: string }>;
  alert: string;
  minAreaThat?: string;
  minAreaThatSuffix?: string;
}

export interface Translations {
  header: {
    title: string;
    badge: string;
    setupBtn: string;
  };
  footer: string;
  tabs: Record<number, string>;
  common: {
    runWorkflow: string;
    running: string;
    fillExample: string;
    openInFlow: string;
    runAgain: string;
    copy: string;
    copied: string;
    workflowLabel: string;
    notConfiguredTitle: string;
  };
  workflows: {
    csvQuality: WorkflowT;
    geoJson: WorkflowT;
    csvMerge: WorkflowT;
    colSelect: WorkflowT;
    csvSplit: WorkflowT;
    csvToJson: WorkflowT;
    spatialFilter: WorkflowT;
  };
  learnMore: {
    toggle: string;
    problemHeading: string;
    whenHeading: string;
    conceptsHeading: string;
    inputHeading: string;
  };
  jobStatus: {
    title: string;
    desc: string;
    jobIdLabel: string;
    submittedAt: string;
  };
  setupGuide: {
    title: string;
    intro: string;
    steps: Step[];
    localTitle: string;
    localDesc: string;
    localDevHint: string;
    localVarHint: string;
    localApiKeyHint: string;
  };
}

export const en: Translations = {
  header: {
    title: 'Flow Trigger',
    badge: 'Re:Earth Flow',
    setupBtn: 'How to set up',
  },
  footer: 'Built for Re:Earth Flow · homework assignment',
  tabs: {
    1: 'CSV Quality',
    2: 'GeoJSON Pipeline',
    3: 'CSV Merge',
    4: 'Col Selector',
    5: 'CSV Split',
    6: 'CSV → JSON',
    7: 'Size Filter',
  },
  common: {
    runWorkflow: 'Run Workflow',
    running: 'Running…',
    fillExample: 'Fill example',
    openInFlow: 'Open in Flow ↗',
    runAgain: 'Run Again',
    copy: 'Copy',
    copied: '✓ Copied',
    workflowLabel: 'Workflow',
    notConfiguredTitle: 'Not configured.',
  },
  learnMore: {
    toggle: 'Learn more about this pipeline',
    problemHeading: 'The problem it solves',
    whenHeading: 'When to use it',
    conceptsHeading: 'Key Flow concepts',
    inputHeading: 'Input expectations',
  },
  jobStatus: {
    title: 'Job Submitted',
    desc: 'Your workflow is now running. Use the job ID below to track it in the Re:Earth Flow dashboard.',
    jobIdLabel: 'Job ID',
    submittedAt: 'Submitted at',
  },
  setupGuide: {
    title: 'How to set up a workflow',
    intro: 'Each workflow on this site maps to a deployed Re:Earth Flow project. Follow these steps once per workflow to wire it up.',
    steps: [
      {
        title: 'Open the shared workflow in Flow',
        body: 'Click the <em>Open in Flow</em> button on the workflow card. This opens a read-only copy of the workflow in the Re:Earth Flow editor.',
      },
      {
        title: 'Fork it to your workspace',
        body: 'Use <em>File → Duplicate</em> (or the equivalent fork action) to copy the workflow into your own workspace. You can edit nodes and parameters freely from here.',
      },
      {
        title: 'Create a deployment',
        body: 'From the workflow editor, open the <em>Deployments</em> panel and click <em>New deployment</em>. Give it a name and publish it. A deployment is an immutable snapshot — re-deploy any time you change the workflow.',
      },
      {
        title: 'Copy the trigger URL',
        body: 'Open the deployment and go to the <em>Trigger</em> tab. Copy the full trigger endpoint URL — it looks like <code>https://api.flow.reearth.io/api/v1/projects/…/deployments/…/trigger</code>.',
      },
      {
        title: 'Add the trigger URL to GitHub',
        bodyBefore: 'In your repository go to <em>Settings → Secrets and variables → Actions → Variables</em> and add:',
        bodyAfter: 'If <code>FLOW_API_KEY</code> is not yet set, add it under <em>Secrets</em> (not Variables — it’s a credential).',
        varHint: '= <trigger URL>',
      },
      {
        title: 'Redeploy the site',
        body: 'Push any commit to <code>main</code>, or go to <em>Actions → Deploy to GitHub Pages → Run workflow</em> to trigger a manual deploy. The new variable is baked in at build time.',
      },
    ],
    localTitle: 'Local development',
    localDesc: 'Add the following to your <code>.env.local</code> file (never commit this file):',
    localDevHint: 'Then run <code>npm run dev</code>. The Vite dev server proxies Flow API requests automatically to avoid CORS.',
    localVarHint: '= <trigger URL>',
    localApiKeyHint: '= <api key>',
  },
};
