import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Layers a given layer may import. Mirrors .dependency-cruiser.cjs (second safety net).
const LAYER_DEPENDENCIES = {
  app: ['sections', 'components', 'ui', 'hooks', 'lib', 'types', 'data'],
  sections: ['sections', 'components', 'ui', 'hooks', 'lib', 'types'],
  components: ['components', 'ui', 'lib', 'types'],
  ui: ['ui', 'lib', 'types'],
  hooks: ['hooks', 'lib', 'types'],
  lib: ['lib', 'types'],
  types: ['types'],
  data: ['data', 'types'],
};

const boundariesPolicies = Object.entries(LAYER_DEPENDENCIES).map(([layer, allowed]) => ({
  from: { element: { type: layer } },
  allow: { to: { element: { type: allowed } } },
}));

const BASE_SYNTAX = [
  {
    selector: "Property[key.name='dangerouslySetInnerHTML']",
    message: 'dangerouslySetInnerHTML is forbidden (also via object spread).',
  },
  {
    selector: "Property[key.value='dangerouslySetInnerHTML']",
    message: 'dangerouslySetInnerHTML is forbidden (also via object spread).',
  },
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'dangerouslySetInnerHTML is forbidden.',
  },
  {
    selector: "AssignmentExpression[left.property.name='innerHTML']",
    message: 'innerHTML is forbidden.',
  },
  {
    selector: "AssignmentExpression[left.property.name='outerHTML']",
    message: 'outerHTML is forbidden.',
  },
  {
    selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
    message: 'insertAdjacentHTML is forbidden.',
  },
  {
    selector: "CallExpression[callee.object.name='document'][callee.property.name='write']",
    message: 'document.write is forbidden.',
  },
  { selector: 'TSEnumDeclaration', message: 'Use a union of literals instead of enum.' },
];

// Only ui/Link may render <a> or set target: every href goes through its validation.
const LINK_ONLY_SYNTAX = [
  {
    selector: "JSXOpeningElement[name.name='a']",
    message: 'Use ui/Link: every href must be validated.',
  },
  {
    selector: "JSXAttribute[name.name='target']",
    message: 'Use ui/Link: target is only set there, together with rel.',
  },
];

// Navigation and injection surfaces that no file may use (ui/Link included).
const NAVIGATION_SYNTAX = [
  {
    selector:
      "CallExpression[callee.name='createElement'], CallExpression[callee.property.name='createElement']",
    message:
      'createElement is forbidden: it would bypass the <a>/target rules. Use JSX and ui/Link.',
  },
  {
    selector: 'JSXOpeningElement[name.name=/^(form|iframe|base|meta|object|embed)$/]',
    message:
      'form, iframe, base, meta, object and embed are forbidden (CSP and navigation surface).',
  },
  {
    selector: "JSXAttribute[name.name='formAction']",
    message: 'formAction is forbidden: the site has no form.',
  },
];

const NAVIGATION_GLOBALS = ['open', 'location', 'top', 'parent', 'self', 'frames', 'opener'];
const WINDOW_LIKE = ['window', 'document', 'globalThis', 'self', 'top', 'parent'];

const NAVIGATION_PROPERTIES = [
  { object: 'window', property: 'open', message: 'window.open is forbidden: use ui/Link.' },
  { object: 'globalThis', property: 'open', message: 'globalThis.open is forbidden: use ui/Link.' },
  ...WINDOW_LIKE.map((object) => ({
    object,
    property: 'location',
    message: 'Direct location access is forbidden: use ui/Link.',
  })),
];

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  { linterOptions: { reportUnusedDisableDirectives: 'error' } },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  jsxA11y.flatConfigs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'sections', pattern: 'src/sections/*' },
        { type: 'components', pattern: 'src/components/*' },
        { type: 'ui', pattern: 'src/ui/*' },
        { type: 'hooks', pattern: 'src/hooks/**' },
        { type: 'lib', pattern: 'src/lib/**' },
        { type: 'types', pattern: 'src/types/**' },
        { type: 'data', pattern: 'src/data/**' },
      ],
    },
    rules: {
      // Quality thresholds (frontend/CLAUDE.md).
      'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 10],
      'no-console': 'error',
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-syntax': ['error', ...BASE_SYNTAX, ...LINK_ONLY_SYNTAX, ...NAVIGATION_SYNTAX],
      'no-restricted-globals': [
        'error',
        ...NAVIGATION_GLOBALS.map((name) => ({
          name,
          message: 'Browser navigation globals are forbidden: use ui/Link.',
        })),
      ],
      'no-restricted-properties': ['error', ...NAVIGATION_PROPERTIES],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': true, 'ts-ignore': true },
      ],
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'] },
        { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'property', format: null },
        { selector: 'import', format: null },
      ],
      // Pure components, named exports (App is the only default export, see override below).
      'import/no-default-export': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['../*'], message: 'Use the @/ alias instead of parent-relative imports.' },
          ],
        },
      ],
      'import/no-cycle': 'error',
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      // Resolved by TypeScript; the import plugin cannot see the `@/` alias or type-only packages.
      'import/no-unresolved': 'off',
      'boundaries/dependencies': ['error', { default: 'disallow', policies: boundariesPolicies }],
    },
  },
  {
    // The only place allowed to render <a> and set target: the validated link primitive.
    files: ['src/ui/Link/Link.tsx'],
    rules: { 'no-restricted-syntax': ['error', ...BASE_SYNTAX, ...NAVIGATION_SYNTAX] },
  },
  {
    files: ['src/app/App.tsx', 'src/app/main.tsx'],
    rules: { 'import/no-default-export': 'off' },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: { 'max-lines-per-function': 'off' },
  },
  {
    files: ['**/*.{js,cjs}'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: { globals: globals.node, sourceType: 'commonjs' },
  },
  {
    files: ['*.config.{js,ts}', 'vitest.setup.ts'],
    languageOptions: { globals: globals.node },
    rules: { 'import/no-default-export': 'off', 'import/no-unresolved': 'off' },
  },
  prettier,
);
