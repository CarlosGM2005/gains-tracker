// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

/**
 * Límites de la arquitectura (ver wiki: gains-tracker/reconstruccion/arquitectura).
 * En flat config una regla repetida sustituye a la anterior, así que cada bloque
 * declara la lista completa de patrones que aplica a su carpeta.
 */
// Con `group` (sintaxis de .gitignore) 'firebase' coincide con cualquier segmento de la ruta y
// bloqueaba también '@core/firebase/...'. La expresión regular solo toca los paquetes del SDK.
const FIREBASE = {
  regex: '^(firebase|@angular/fire)(/.*)?$',
  message: 'Firebase solo se importa en core/firebase y en features/*/data/firebase.',
};
const OTRA_FEATURE = {
  group: ['@features/*/data/**', '@features/*/state/**', '@features/*/pages/**', '@features/*/ui/**'],
  message: 'Desde otra feature solo se importa su domain/ o su public-api.ts. Dentro de la misma feature usa rutas relativas.',
};
const SHARED_SIN_DOMINIO = {
  group: ['@core/*', '@features/*'],
  message: 'shared/ no depende de core/ ni de features/.',
};

const restringir = (...patterns) => ['error', { patterns }];

module.exports = tseslint.config(
  {
    ignores: ['dist/**', 'out-tsc/**', '.angular/**', 'coverage/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'no-alert': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-imports': restringir(FIREBASE),
    },
  },
  {
    files: ['src/app/features/**/*.ts'],
    rules: { 'no-restricted-imports': restringir(FIREBASE, OTRA_FEATURE) },
  },
  {
    files: ['src/app/shared/**/*.ts'],
    rules: { 'no-restricted-imports': restringir(FIREBASE, SHARED_SIN_DOMINIO) },
  },
  {
    files: ['src/app/features/*/data/firebase/**/*.ts'],
    rules: { 'no-restricted-imports': restringir(OTRA_FEATURE) },
  },
  {
    files: ['src/app/core/firebase/**/*.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
    },
  },
);
