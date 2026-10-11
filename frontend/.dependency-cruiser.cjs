/* Architecture rules: see frontend/CLAUDE.md. Do not weaken without Florian's request. */
const LAYERS = ['app', 'sections', 'components', 'ui', 'hooks', 'lib', 'types', 'data'];

// Layers a given layer may import (itself included for intra-layer files).
const ALLOWED = {
  app: LAYERS,
  sections: ['sections', 'components', 'ui', 'hooks', 'lib', 'types'],
  components: ['components', 'ui', 'lib', 'types'],
  ui: ['ui', 'lib', 'types'],
  hooks: ['hooks', 'lib', 'types'],
  lib: ['lib', 'types'],
  types: ['types'],
  data: ['data', 'types'],
};

// Tests and their helpers (*.test-utils.ts): never part of the shipped code.
const TEST_FILE = '[.]test(-utils)?[.]tsx?$';

const MODULE_LAYERS = ['sections', 'components', 'ui'];

const layerRules = LAYERS.map((layer) => ({
  name: `layer-${layer}-imports`,
  comment: `src/${layer} may only import: ${ALLOWED[layer].join(', ')}.`,
  severity: 'error',
  from: { path: `^src/${layer}/` },
  to: {
    path: `^src/(${LAYERS.join('|')})/`,
    pathNot: `^src/(${ALLOWED[layer].join('|')})/`,
  },
}));

// Sections and components never import their siblings: shared code moves down a layer.
const siblingRules = ['sections', 'components'].map((layer) => ({
  name: `no-sibling-imports-${layer}`,
  comment: `A module of src/${layer} must not import another module of src/${layer}.`,
  severity: 'error',
  from: { path: `^src/${layer}/([^/]+)/` },
  to: { path: `^src/${layer}/(?!$1/)[^/]+/` },
}));

// A module is reached through its index.ts only (from outside, and between ui siblings).
const deepImportRules = MODULE_LAYERS.flatMap((target) =>
  LAYERS.map((source) => {
    const sameLayer = source === target;
    return {
      name: `no-deep-imports-${source}-to-${target}`,
      comment: `Import src/${target} modules through their index.ts only.`,
      severity: 'error',
      from: { path: sameLayer ? `^src/${source}/([^/]+)/` : `^src/${source}/` },
      to: {
        path: sameLayer
          ? `^src/${target}/(?!$1/)[^/]+/(?!index[.]ts$)`
          : `^src/${target}/[^/]+/(?!index[.]ts$)`,
      },
    };
  }),
);

module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      comment: 'No circular dependencies.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    ...layerRules,
    ...siblingRules,
    ...deepImportRules,
    {
      name: 'no-orphans',
      comment: 'Unused modules are dead code.',
      severity: 'error',
      from: {
        orphan: true,
        pathNot: ['[.]d[.]ts$', TEST_FILE, '[.]gitkeep$'],
      },
      to: {},
    },
    {
      name: 'not-to-test',
      comment: 'Production code must not import tests or test helpers.',
      severity: 'error',
      from: { pathNot: TEST_FILE },
      to: { path: TEST_FILE },
    },
    {
      name: 'not-to-dev-dependencies',
      comment: 'Shipped code must not depend on devDependencies.',
      severity: 'error',
      from: { path: '^src', pathNot: TEST_FILE },
      to: { dependencyTypes: ['npm-dev'] },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
