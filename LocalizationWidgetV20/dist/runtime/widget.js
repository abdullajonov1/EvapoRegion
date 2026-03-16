System.register(["jimu-core"], function(__WEBPACK_DYNAMIC_EXPORT__, __system_context__) {
	var __WEBPACK_EXTERNAL_MODULE_jimu_core__ = {};
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_core__, "__esModule", { value: true });
	return {
		setters: [
			function(module) {
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE_jimu_core__[key] = module[key];
				});
			}
		],
		execute: function() {
			__WEBPACK_DYNAMIC_EXPORT__(
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[3].use[1]!./node_modules/resolve-url-loader/index.js??ruleSet[1].rules[3].use[2]!./node_modules/sass-loader/dist/cjs.js??ruleSet[1].rules[3].use[3]!./your-extensions/widgets/LocalizationWidgetV20/src/runtime/widget.css":
/*!******************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[3].use[1]!./node_modules/resolve-url-loader/index.js??ruleSet[1].rules[3].use[2]!./node_modules/sass-loader/dist/cjs.js??ruleSet[1].rules[3].use[3]!./your-extensions/widgets/LocalizationWidgetV20/src/runtime/widget.css ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/* ===== DYNAMIC RESPONSIVE LOCALIZATION WIDGET ===== */
/* Design matching the image - Globe icon, Language text, Chevron */
/* CSS Variables - matching other widgets */
:root {
  --widget-bg-primary: #2c3e50;
  --widget-bg-secondary: #34495e;
  --widget-bg-tertiary: #3a4a5c;
  --text-primary: #ffffff;
  --text-secondary: #bdc3c7;
  --border-primary: #485c6b;
}

.loc-widget-root {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  min-height: auto;
  container-type: size;
  container-name: localization-widget;
  overflow: hidden;
  background: var(--widget-bg-primary, #2c3e50);
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

/* Header Text Section - Left Side */
.header-text-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.header-title-large {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  letter-spacing: 0.02em;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.header-title-small {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: var(--text-secondary, #bdc3c7);
  letter-spacing: 0.01em;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

/* Controls Section - Right Side */
.controls-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
  min-width: 0;
}

/* ===== LANGUAGE SELECTOR - Matching Image Design ===== */
.language-selector-wrap {
  position: relative;
  width: auto;
  min-width: 100px;
  flex-shrink: 0;
  display: flex;
}

.lang-picker-btn {
  width: auto;
  min-width: 100px;
  height: auto;
  min-height: 36px;
  background: transparent;
  border: 2px solid var(--border-primary, #485c6b);
  border-radius: 50px;
  color: var(--text-primary, #ffffff);
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 14px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  box-sizing: border-box;
}

.lang-picker-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.02);
}

.lang-picker-btn.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

/* Globe Icon */
.globe-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  stroke: currentColor;
}

/* Language Text */
.lang-text {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Chevron Icon */
.chevron-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  stroke: currentColor;
  transition: transform 0.2s ease;
}

.lang-picker-btn.active .chevron-icon {
  transform: rotate(180deg);
}

/* ===== THEME SELECTOR - Same Design ===== */
.theme-selector-wrap {
  position: relative;
  width: auto;
  min-width: 100px;
  flex-shrink: 0;
  display: flex;
}

.theme-picker-btn {
  width: auto;
  min-width: 100px;
  height: auto;
  min-height: 36px;
  background: transparent;
  border: 2px solid var(--border-primary, #485c6b);
  border-radius: 50px;
  color: var(--text-primary, #ffffff);
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 14px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  box-sizing: border-box;
}

.theme-picker-btn.dark {
  background: transparent;
  border-color: var(--border-primary, #485c6b);
  color: var(--text-primary, #ffffff);
}

.theme-picker-btn.light {
  background: transparent;
  border-color: rgba(0, 0, 0, 0.2);
  color: #000000;
}

.theme-picker-btn:hover {
  transform: scale(1.02);
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.1);
}

.theme-picker-btn.dark:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.theme-picker-btn.light:hover {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.3);
}

/* Theme Icon */
.theme-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Theme Text */
.theme-text {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ===== DROPDOWN MENU ===== */
.lang-menu-popup {
  position: fixed;
  background: #1e293b;
  border: 2px solid #38bdf8;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 999999;
  min-width: 140px;
  overflow: hidden;
  margin-top: 4px;
}

.lang-menu-choice {
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 500;
  color: #f1f5f9;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1e293b;
}

.lang-menu-choice:hover {
  background: #0f172a;
  color: #38bdf8;
}

.lang-menu-choice.active {
  background: #0f172a;
  color: #38bdf8;
}

.lang-option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-option-flag {
  font-size: 18px;
}

.lang-option-text {
  font-size: 14px;
  font-weight: 500;
}

.checkmark {
  color: #38bdf8;
  font-weight: 700;
  font-size: 14px;
}

/* ===== RESPONSIVE LAYOUT ===== */
@media (max-width: 768px) {
  .loc-widget-root {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
  }
  .header-text-section {
    flex: 1;
    gap: 3px;
    min-width: 0;
  }
  .header-title-large {
    font-size: 20px;
  }
  .header-title-small {
    font-size: 13px;
  }
  .controls-section {
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }
  .language-selector-wrap,
  .theme-selector-wrap {
    min-width: 90px;
  }
  .lang-picker-btn,
  .theme-picker-btn {
    min-width: 90px;
    padding: 5px 12px;
    gap: 5px;
  }
  .globe-icon,
  .theme-icon {
    width: 16px;
    height: 16px;
  }
  .lang-text,
  .theme-text {
    font-size: 12px;
  }
  .chevron-icon {
    width: 12px;
    height: 12px;
  }
}
@media (max-width: 480px) {
  .loc-widget-root {
    flex-direction: column;
    align-items: flex-start;
    padding: 8px 10px;
    gap: 10px;
  }
  .header-text-section {
    width: 100%;
    gap: 2px;
  }
  .header-title-large {
    font-size: 18px;
  }
  .header-title-small {
    font-size: 12px;
  }
  .controls-section {
    flex-direction: column;
    width: 100%;
    align-items: stretch;
    gap: 6px;
  }
  .language-selector-wrap,
  .theme-selector-wrap {
    flex: 1;
    min-width: 0;
  }
  .lang-picker-btn,
  .theme-picker-btn {
    width: 100%;
    min-width: 0;
    min-height: 32px;
    padding: 5px 10px;
    gap: 5px;
  }
  .globe-icon,
  .theme-icon {
    width: 16px;
    height: 16px;
  }
  .lang-text,
  .theme-text {
    font-size: 12px;
  }
  .chevron-icon {
    width: 12px;
    height: 12px;
  }
}
/* ===== SIZE CLASSES - Dynamic Responsive ===== */
/* Extra Small (< 50px height) */
.loc-widget-root.size-xs {
  gap: 3px;
  padding: 3px;
}

.loc-widget-root.size-xs .lang-picker-btn,
.loc-widget-root.size-xs .theme-picker-btn {
  min-height: 18px;
  padding: 2px 8px;
  gap: 4px;
  border-radius: 20px;
  border-width: 1px;
}

.loc-widget-root.size-xs .globe-icon,
.loc-widget-root.size-xs .theme-icon {
  width: 12px;
  height: 12px;
}

.loc-widget-root.size-xs .lang-text,
.loc-widget-root.size-xs .theme-text {
  font-size: 9px;
}

.loc-widget-root.size-xs .chevron-icon {
  width: 10px;
  height: 10px;
}

/* Small (50px - 80px height) */
.loc-widget-root.size-sm {
  gap: 4px;
  padding: 4px;
}

.loc-widget-root.size-sm .lang-picker-btn,
.loc-widget-root.size-sm .theme-picker-btn {
  min-height: 24px;
  padding: 4px 10px;
  gap: 5px;
  border-radius: 25px;
  border-width: 1.5px;
}

.loc-widget-root.size-sm .globe-icon,
.loc-widget-root.size-sm .theme-icon {
  width: 16px;
  height: 16px;
}

.loc-widget-root.size-sm .lang-text,
.loc-widget-root.size-sm .theme-text {
  font-size: 11px;
}

.loc-widget-root.size-sm .chevron-icon {
  width: 12px;
  height: 12px;
}

/* Medium (80px - 120px height) */
.loc-widget-root.size-md {
  gap: 6px;
  padding: 6px;
}

.loc-widget-root.size-md .lang-picker-btn,
.loc-widget-root.size-md .theme-picker-btn {
  min-height: 32px;
  padding: 6px 14px;
  gap: 6px;
  border-radius: 30px;
  border-width: 2px;
}

.loc-widget-root.size-md .globe-icon,
.loc-widget-root.size-md .theme-icon {
  width: 20px;
  height: 20px;
}

.loc-widget-root.size-md .lang-text,
.loc-widget-root.size-md .theme-text {
  font-size: 13px;
}

.loc-widget-root.size-md .chevron-icon {
  width: 14px;
  height: 14px;
}

/* Large (120px - 180px height) */
.loc-widget-root.size-lg {
  gap: 8px;
  padding: 8px;
}

.loc-widget-root.size-lg .lang-picker-btn,
.loc-widget-root.size-lg .theme-picker-btn {
  min-height: 42px;
  padding: 8px 20px;
  gap: 10px;
  border-radius: 40px;
  border-width: 2px;
}

.loc-widget-root.size-lg .globe-icon,
.loc-widget-root.size-lg .theme-icon {
  width: 26px;
  height: 26px;
}

.loc-widget-root.size-lg .lang-text,
.loc-widget-root.size-lg .theme-text {
  font-size: 16px;
}

.loc-widget-root.size-lg .chevron-icon {
  width: 18px;
  height: 18px;
}

/* Extra Large (> 180px height) */
.loc-widget-root.size-xl {
  gap: 12px;
  padding: 12px;
}

.loc-widget-root.size-xl .lang-picker-btn,
.loc-widget-root.size-xl .theme-picker-btn {
  min-height: 56px;
  padding: 12px 28px;
  gap: 14px;
  border-radius: 50px;
  border-width: 3px;
}

.loc-widget-root.size-xl .globe-icon,
.loc-widget-root.size-xl .theme-icon {
  width: 32px;
  height: 32px;
}

.loc-widget-root.size-xl .lang-text,
.loc-widget-root.size-xl .theme-text {
  font-size: 20px;
}

.loc-widget-root.size-xl .chevron-icon {
  width: 22px;
  height: 22px;
}

/* ===== LIGHT THEME - White background, black text ===== */
html.light-theme .loc-widget-root,
html[data-theme=light] .loc-widget-root,
body.light-theme .loc-widget-root {
  background: #f5f7fa !important;
}

html.light-theme .header-title-large,
html[data-theme=light] .header-title-large,
body.light-theme .header-title-large {
  color: #000000 !important;
}

html.light-theme .header-title-small,
html[data-theme=light] .header-title-small,
body.light-theme .header-title-small {
  color: #374151 !important;
}

html.light-theme .lang-picker-btn,
html[data-theme=light] .lang-picker-btn,
body.light-theme .lang-picker-btn {
  background: transparent !important;
  border-color: rgba(0, 0, 0, 0.2) !important;
  color: #000000 !important;
}

html.light-theme .lang-picker-btn:hover,
html[data-theme=light] .lang-picker-btn:hover,
body.light-theme .lang-picker-btn:hover {
  background: rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(0, 0, 0, 0.3) !important;
}

html.light-theme .lang-picker-btn.active,
html[data-theme=light] .lang-picker-btn.active,
body.light-theme .lang-picker-btn.active {
  background: rgba(0, 0, 0, 0.1) !important;
  border-color: rgba(0, 0, 0, 0.4) !important;
}

html.light-theme .theme-picker-btn,
html[data-theme=light] .theme-picker-btn,
body.light-theme .theme-picker-btn {
  background: transparent !important;
  border-color: rgba(0, 0, 0, 0.2) !important;
  color: #000000 !important;
}

html.light-theme .theme-picker-btn:hover,
html[data-theme=light] .theme-picker-btn:hover,
body.light-theme .theme-picker-btn:hover {
  background: rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(0, 0, 0, 0.3) !important;
}

html.light-theme .lang-menu-popup,
html[data-theme=light] .lang-menu-popup,
body.light-theme .lang-menu-popup {
  background: #ffffff !important;
  border-color: rgba(0, 0, 0, 0.2) !important;
}

html.light-theme .lang-menu-choice,
html[data-theme=light] .lang-menu-choice,
body.light-theme .lang-menu-choice {
  background: #ffffff !important;
  color: #000000 !important;
}

html.light-theme .lang-menu-choice:hover,
html[data-theme=light] .lang-menu-choice:hover,
body.light-theme .lang-menu-choice:hover {
  background: rgba(0, 0, 0, 0.05) !important;
  color: #000000 !important;
}

html.light-theme .lang-menu-choice.active,
html[data-theme=light] .lang-menu-choice.active,
body.light-theme .lang-menu-choice.active {
  background: rgba(0, 0, 0, 0.1) !important;
  color: #000000 !important;
}

/* ===== DARK THEME - Dark background, white text ===== */
html.dark-theme .loc-widget-root,
html[data-theme=dark] .loc-widget-root,
body.dark-theme .loc-widget-root {
  background: var(--widget-bg-primary, #2c3e50) !important;
}

html.dark-theme .header-title-large,
html[data-theme=dark] .header-title-large,
body.dark-theme .header-title-large {
  color: #ffffff !important;
}

html.dark-theme .header-title-small,
html[data-theme=dark] .header-title-small,
body.dark-theme .header-title-small {
  color: #cbd5e1 !important;
}

html.dark-theme .lang-picker-btn,
html[data-theme=dark] .lang-picker-btn,
body.dark-theme .lang-picker-btn {
  background: transparent !important;
  border-color: var(--border-primary, #485c6b) !important;
  color: var(--text-primary, #ffffff) !important;
}

html.dark-theme .lang-picker-btn:hover,
html[data-theme=dark] .lang-picker-btn:hover,
body.dark-theme .lang-picker-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}

html.dark-theme .theme-picker-btn,
html[data-theme=dark] .theme-picker-btn,
body.dark-theme .theme-picker-btn {
  background: transparent !important;
  border-color: var(--border-primary, #485c6b) !important;
  color: var(--text-primary, #ffffff) !important;
}

html.dark-theme .theme-picker-btn:hover,
html[data-theme=dark] .theme-picker-btn:hover,
body.dark-theme .theme-picker-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}

html.dark-theme .lang-menu-popup,
html[data-theme=dark] .lang-menu-popup,
body.dark-theme .lang-menu-popup {
  background: #1e293b !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

html.dark-theme .lang-menu-choice,
html[data-theme=dark] .lang-menu-choice,
body.dark-theme .lang-menu-choice {
  background: #1e293b !important;
  color: #ffffff !important;
}

html.dark-theme .lang-menu-choice:hover,
html[data-theme=dark] .lang-menu-choice:hover,
body.dark-theme .lang-menu-choice:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

html.dark-theme .lang-menu-choice.active,
html[data-theme=dark] .lang-menu-choice.active,
body.dark-theme .lang-menu-choice.active {
  background: rgba(255, 255, 255, 0.15) !important;
  color: #ffffff !important;
}

/* ===== CONTAINER QUERIES FALLBACK ===== */
@container localization-widget (max-width: 400px) {
  .loc-widget-root {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-title-large {
    font-size: 18px;
  }
  .header-title-small {
    font-size: 12px;
  }
  .controls-section {
    width: 100%;
    flex-direction: column;
  }
  .language-selector-wrap,
  .theme-selector-wrap {
    width: 100%;
  }
  .lang-picker-btn,
  .theme-picker-btn {
    width: 100%;
  }
}
@container localization-widget (max-height: 50px) {
  .header-title-large {
    font-size: 16px;
  }
  .header-title-small {
    font-size: 11px;
  }
  .language-selector-wrap,
  .theme-selector-wrap {
    flex: 1;
  }
  .lang-picker-btn,
  .theme-picker-btn {
    min-height: 18px;
    padding: 2px 8px;
    gap: 4px;
    border-radius: 20px;
  }
  .globe-icon,
  .theme-icon {
    width: 12px;
    height: 12px;
  }
  .lang-text,
  .theme-text {
    font-size: 9px;
  }
  .chevron-icon {
    width: 10px;
    height: 10px;
  }
}
@container localization-widget (min-height: 51px) and (max-height: 80px) {
  .lang-picker-btn,
  .theme-picker-btn {
    min-height: 24px;
    padding: 4px 10px;
    gap: 5px;
  }
  .globe-icon,
  .theme-icon {
    width: 16px;
    height: 16px;
  }
  .lang-text,
  .theme-text {
    font-size: 11px;
  }
}
@container localization-widget (min-height: 81px) and (max-height: 120px) {
  .lang-picker-btn,
  .theme-picker-btn {
    min-height: 32px;
    padding: 6px 14px;
    gap: 6px;
  }
  .globe-icon,
  .theme-icon {
    width: 20px;
    height: 20px;
  }
  .lang-text,
  .theme-text {
    font-size: 13px;
  }
}
@container localization-widget (min-height: 121px) and (max-height: 180px) {
  .lang-picker-btn,
  .theme-picker-btn {
    min-height: 42px;
    padding: 8px 20px;
    gap: 10px;
  }
  .globe-icon,
  .theme-icon {
    width: 26px;
    height: 26px;
  }
  .lang-text,
  .theme-text {
    font-size: 16px;
  }
}
@container localization-widget (min-height: 181px) {
  .lang-picker-btn,
  .theme-picker-btn {
    min-height: 56px;
    padding: 12px 28px;
    gap: 14px;
  }
  .globe-icon,
  .theme-icon {
    width: 32px;
    height: 32px;
  }
  .lang-text,
  .theme-text {
    font-size: 20px;
  }
}
/* ===== ACCESSIBILITY ===== */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
  .lang-picker-btn:hover,
  .theme-picker-btn:hover {
    transform: none !important;
  }
}`, "",{"version":3,"sources":["webpack://./your-extensions/widgets/LocalizationWidgetV20/src/runtime/widget.css"],"names":[],"mappings":"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","sourcesContent":["/* ===== DYNAMIC RESPONSIVE LOCALIZATION WIDGET ===== */\n/* Design matching the image - Globe icon, Language text, Chevron */\n\n/* CSS Variables - matching other widgets */\n:root {\n  --widget-bg-primary: #2c3e50;\n  --widget-bg-secondary: #34495e;\n  --widget-bg-tertiary: #3a4a5c;\n  --text-primary: #ffffff;\n  --text-secondary: #bdc3c7;\n  --border-primary: #485c6b;\n}\n\n.loc-widget-root {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  justify-content: space-between;\n  gap: 16px;\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n  padding: 12px 16px;\n  min-height: auto;\n  container-type: size;\n  container-name: localization-widget;\n  overflow: hidden;\n  background: var(--widget-bg-primary, #2c3e50);\n  border-radius: 8px;\n  transition: background-color 0.3s ease;\n}\n\n/* Header Text Section - Left Side */\n.header-text-section {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  flex: 1;\n  min-width: 0;\n}\n\n.header-title-large {\n  margin: 0;\n  font-size: 24px;\n  font-weight: 700;\n  color: var(--text-primary, #ffffff);\n  letter-spacing: 0.02em;\n  line-height: 1.2;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  transition: color 0.3s ease;\n}\n\n.header-title-small {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 400;\n  color: var(--text-secondary, #bdc3c7);\n  letter-spacing: 0.01em;\n  line-height: 1.3;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  transition: color 0.3s ease;\n}\n\n/* Controls Section - Right Side */\n.controls-section {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  gap: 8px;\n  flex-shrink: 0;\n  min-width: 0;\n}\n\n/* ===== LANGUAGE SELECTOR - Matching Image Design ===== */\n.language-selector-wrap {\n  position: relative;\n  width: auto;\n  min-width: 100px;\n  flex-shrink: 0;\n  display: flex;\n}\n\n.lang-picker-btn {\n  width: auto;\n  min-width: 100px;\n  height: auto;\n  min-height: 36px;\n  background: transparent;\n  border: 2px solid var(--border-primary, #485c6b);\n  border-radius: 50px;\n  color: var(--text-primary, #ffffff);\n  cursor: pointer;\n  outline: none;\n  transition: all 0.2s ease;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  padding: 6px 14px;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial,\n    sans-serif;\n  box-sizing: border-box;\n}\n\n.lang-picker-btn:hover {\n  background: rgba(255, 255, 255, 0.1);\n  border-color: rgba(255, 255, 255, 0.4);\n  transform: scale(1.02);\n}\n\n.lang-picker-btn.active {\n  background: rgba(255, 255, 255, 0.15);\n  border-color: rgba(255, 255, 255, 0.5);\n  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);\n}\n\n/* Globe Icon */\n.globe-icon {\n  width: 18px;\n  height: 18px;\n  flex-shrink: 0;\n  stroke: currentColor;\n}\n\n/* Language Text */\n.lang-text {\n  font-size: 14px;\n  font-weight: 500;\n  white-space: nowrap;\n  flex-shrink: 0;\n}\n\n/* Chevron Icon */\n.chevron-icon {\n  width: 14px;\n  height: 14px;\n  flex-shrink: 0;\n  stroke: currentColor;\n  transition: transform 0.2s ease;\n}\n\n.lang-picker-btn.active .chevron-icon {\n  transform: rotate(180deg);\n}\n\n/* ===== THEME SELECTOR - Same Design ===== */\n.theme-selector-wrap {\n  position: relative;\n  width: auto;\n  min-width: 100px;\n  flex-shrink: 0;\n  display: flex;\n}\n\n.theme-picker-btn {\n  width: auto;\n  min-width: 100px;\n  height: auto;\n  min-height: 36px;\n  background: transparent;\n  border: 2px solid var(--border-primary, #485c6b);\n  border-radius: 50px;\n  color: var(--text-primary, #ffffff);\n  cursor: pointer;\n  outline: none;\n  transition: all 0.2s ease;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  padding: 6px 14px;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial,\n    sans-serif;\n  box-sizing: border-box;\n}\n\n.theme-picker-btn.dark {\n  background: transparent;\n  border-color: var(--border-primary, #485c6b);\n  color: var(--text-primary, #ffffff);\n}\n\n.theme-picker-btn.light {\n  background: transparent;\n  border-color: rgba(0, 0, 0, 0.2);\n  color: #000000;\n}\n\n.theme-picker-btn:hover {\n  transform: scale(1.02);\n  border-color: rgba(255, 255, 255, 0.4);\n  background: rgba(255, 255, 255, 0.1);\n}\n\n.theme-picker-btn.dark:hover {\n  background: rgba(255, 255, 255, 0.1);\n  border-color: rgba(255, 255, 255, 0.4);\n}\n\n.theme-picker-btn.light:hover {\n  background: rgba(0, 0, 0, 0.05);\n  border-color: rgba(0, 0, 0, 0.3);\n}\n\n/* Theme Icon */\n.theme-icon {\n  width: 18px;\n  height: 18px;\n  flex-shrink: 0;\n}\n\n/* Theme Text */\n.theme-text {\n  font-size: 14px;\n  font-weight: 500;\n  white-space: nowrap;\n  flex-shrink: 0;\n}\n\n/* ===== DROPDOWN MENU ===== */\n.lang-menu-popup {\n  position: fixed;\n  background: #1e293b;\n  border: 2px solid #38bdf8;\n  border-radius: 12px;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);\n  z-index: 999999;\n  min-width: 140px;\n  overflow: hidden;\n  margin-top: 4px;\n}\n\n.lang-menu-choice {\n  padding: 10px 14px;\n  font-size: 14px;\n  font-weight: 500;\n  color: #f1f5f9;\n  cursor: pointer;\n  transition: all 0.15s ease;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  background: #1e293b;\n}\n\n.lang-menu-choice:hover {\n  background: #0f172a;\n  color: #38bdf8;\n}\n\n.lang-menu-choice.active {\n  background: #0f172a;\n  color: #38bdf8;\n}\n\n.lang-option-content {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.lang-option-flag {\n  font-size: 18px;\n}\n\n.lang-option-text {\n  font-size: 14px;\n  font-weight: 500;\n}\n\n.checkmark {\n  color: #38bdf8;\n  font-weight: 700;\n  font-size: 14px;\n}\n\n/* ===== RESPONSIVE LAYOUT ===== */\n@media (max-width: 768px) {\n  .loc-widget-root {\n    flex-direction: row;\n    align-items: center;\n    gap: 12px;\n    padding: 10px 12px;\n  }\n\n  .header-text-section {\n    flex: 1;\n    gap: 3px;\n    min-width: 0;\n  }\n\n  .header-title-large {\n    font-size: 20px;\n  }\n\n  .header-title-small {\n    font-size: 13px;\n  }\n\n  .controls-section {\n    flex-direction: column;\n    align-items: flex-end;\n    gap: 6px;\n    flex-shrink: 0;\n  }\n\n  .language-selector-wrap,\n  .theme-selector-wrap {\n    min-width: 90px;\n  }\n\n  .lang-picker-btn,\n  .theme-picker-btn {\n    min-width: 90px;\n    padding: 5px 12px;\n    gap: 5px;\n  }\n\n  .globe-icon,\n  .theme-icon {\n    width: 16px;\n    height: 16px;\n  }\n\n  .lang-text,\n  .theme-text {\n    font-size: 12px;\n  }\n\n  .chevron-icon {\n    width: 12px;\n    height: 12px;\n  }\n}\n\n@media (max-width: 480px) {\n  .loc-widget-root {\n    flex-direction: column;\n    align-items: flex-start;\n    padding: 8px 10px;\n    gap: 10px;\n  }\n\n  .header-text-section {\n    width: 100%;\n    gap: 2px;\n  }\n\n  .header-title-large {\n    font-size: 18px;\n  }\n\n  .header-title-small {\n    font-size: 12px;\n  }\n\n  .controls-section {\n    flex-direction: column;\n    width: 100%;\n    align-items: stretch;\n    gap: 6px;\n  }\n\n  .language-selector-wrap,\n  .theme-selector-wrap {\n    flex: 1;\n    min-width: 0;\n  }\n\n  .lang-picker-btn,\n  .theme-picker-btn {\n    width: 100%;\n    min-width: 0;\n    min-height: 32px;\n    padding: 5px 10px;\n    gap: 5px;\n  }\n\n  .globe-icon,\n  .theme-icon {\n    width: 16px;\n    height: 16px;\n  }\n\n  .lang-text,\n  .theme-text {\n    font-size: 12px;\n  }\n\n  .chevron-icon {\n    width: 12px;\n    height: 12px;\n  }\n}\n\n/* ===== SIZE CLASSES - Dynamic Responsive ===== */\n\n/* Extra Small (< 50px height) */\n.loc-widget-root.size-xs {\n  gap: 3px;\n  padding: 3px;\n}\n\n.loc-widget-root.size-xs .lang-picker-btn,\n.loc-widget-root.size-xs .theme-picker-btn {\n  min-height: 18px;\n  padding: 2px 8px;\n  gap: 4px;\n  border-radius: 20px;\n  border-width: 1px;\n}\n\n.loc-widget-root.size-xs .globe-icon,\n.loc-widget-root.size-xs .theme-icon {\n  width: 12px;\n  height: 12px;\n}\n\n.loc-widget-root.size-xs .lang-text,\n.loc-widget-root.size-xs .theme-text {\n  font-size: 9px;\n}\n\n.loc-widget-root.size-xs .chevron-icon {\n  width: 10px;\n  height: 10px;\n}\n\n/* Small (50px - 80px height) */\n.loc-widget-root.size-sm {\n  gap: 4px;\n  padding: 4px;\n}\n\n.loc-widget-root.size-sm .lang-picker-btn,\n.loc-widget-root.size-sm .theme-picker-btn {\n  min-height: 24px;\n  padding: 4px 10px;\n  gap: 5px;\n  border-radius: 25px;\n  border-width: 1.5px;\n}\n\n.loc-widget-root.size-sm .globe-icon,\n.loc-widget-root.size-sm .theme-icon {\n  width: 16px;\n  height: 16px;\n}\n\n.loc-widget-root.size-sm .lang-text,\n.loc-widget-root.size-sm .theme-text {\n  font-size: 11px;\n}\n\n.loc-widget-root.size-sm .chevron-icon {\n  width: 12px;\n  height: 12px;\n}\n\n/* Medium (80px - 120px height) */\n.loc-widget-root.size-md {\n  gap: 6px;\n  padding: 6px;\n}\n\n.loc-widget-root.size-md .lang-picker-btn,\n.loc-widget-root.size-md .theme-picker-btn {\n  min-height: 32px;\n  padding: 6px 14px;\n  gap: 6px;\n  border-radius: 30px;\n  border-width: 2px;\n}\n\n.loc-widget-root.size-md .globe-icon,\n.loc-widget-root.size-md .theme-icon {\n  width: 20px;\n  height: 20px;\n}\n\n.loc-widget-root.size-md .lang-text,\n.loc-widget-root.size-md .theme-text {\n  font-size: 13px;\n}\n\n.loc-widget-root.size-md .chevron-icon {\n  width: 14px;\n  height: 14px;\n}\n\n/* Large (120px - 180px height) */\n.loc-widget-root.size-lg {\n  gap: 8px;\n  padding: 8px;\n}\n\n.loc-widget-root.size-lg .lang-picker-btn,\n.loc-widget-root.size-lg .theme-picker-btn {\n  min-height: 42px;\n  padding: 8px 20px;\n  gap: 10px;\n  border-radius: 40px;\n  border-width: 2px;\n}\n\n.loc-widget-root.size-lg .globe-icon,\n.loc-widget-root.size-lg .theme-icon {\n  width: 26px;\n  height: 26px;\n}\n\n.loc-widget-root.size-lg .lang-text,\n.loc-widget-root.size-lg .theme-text {\n  font-size: 16px;\n}\n\n.loc-widget-root.size-lg .chevron-icon {\n  width: 18px;\n  height: 18px;\n}\n\n/* Extra Large (> 180px height) */\n.loc-widget-root.size-xl {\n  gap: 12px;\n  padding: 12px;\n}\n\n.loc-widget-root.size-xl .lang-picker-btn,\n.loc-widget-root.size-xl .theme-picker-btn {\n  min-height: 56px;\n  padding: 12px 28px;\n  gap: 14px;\n  border-radius: 50px;\n  border-width: 3px;\n}\n\n.loc-widget-root.size-xl .globe-icon,\n.loc-widget-root.size-xl .theme-icon {\n  width: 32px;\n  height: 32px;\n}\n\n.loc-widget-root.size-xl .lang-text,\n.loc-widget-root.size-xl .theme-text {\n  font-size: 20px;\n}\n\n.loc-widget-root.size-xl .chevron-icon {\n  width: 22px;\n  height: 22px;\n}\n\n/* ===== LIGHT THEME - White background, black text ===== */\nhtml.light-theme .loc-widget-root,\nhtml[data-theme=\"light\"] .loc-widget-root,\nbody.light-theme .loc-widget-root {\n  background: #f5f7fa !important;\n}\n\nhtml.light-theme .header-title-large,\nhtml[data-theme=\"light\"] .header-title-large,\nbody.light-theme .header-title-large {\n  color: #000000 !important;\n}\n\nhtml.light-theme .header-title-small,\nhtml[data-theme=\"light\"] .header-title-small,\nbody.light-theme .header-title-small {\n  color: #374151 !important;\n}\n\nhtml.light-theme .lang-picker-btn,\nhtml[data-theme=\"light\"] .lang-picker-btn,\nbody.light-theme .lang-picker-btn {\n  background: transparent !important;\n  border-color: rgba(0, 0, 0, 0.2) !important;\n  color: #000000 !important;\n}\n\nhtml.light-theme .lang-picker-btn:hover,\nhtml[data-theme=\"light\"] .lang-picker-btn:hover,\nbody.light-theme .lang-picker-btn:hover {\n  background: rgba(0, 0, 0, 0.05) !important;\n  border-color: rgba(0, 0, 0, 0.3) !important;\n}\n\nhtml.light-theme .lang-picker-btn.active,\nhtml[data-theme=\"light\"] .lang-picker-btn.active,\nbody.light-theme .lang-picker-btn.active {\n  background: rgba(0, 0, 0, 0.1) !important;\n  border-color: rgba(0, 0, 0, 0.4) !important;\n}\n\nhtml.light-theme .theme-picker-btn,\nhtml[data-theme=\"light\"] .theme-picker-btn,\nbody.light-theme .theme-picker-btn {\n  background: transparent !important;\n  border-color: rgba(0, 0, 0, 0.2) !important;\n  color: #000000 !important;\n}\n\nhtml.light-theme .theme-picker-btn:hover,\nhtml[data-theme=\"light\"] .theme-picker-btn:hover,\nbody.light-theme .theme-picker-btn:hover {\n  background: rgba(0, 0, 0, 0.05) !important;\n  border-color: rgba(0, 0, 0, 0.3) !important;\n}\n\nhtml.light-theme .lang-menu-popup,\nhtml[data-theme=\"light\"] .lang-menu-popup,\nbody.light-theme .lang-menu-popup {\n  background: #ffffff !important;\n  border-color: rgba(0, 0, 0, 0.2) !important;\n}\n\nhtml.light-theme .lang-menu-choice,\nhtml[data-theme=\"light\"] .lang-menu-choice,\nbody.light-theme .lang-menu-choice {\n  background: #ffffff !important;\n  color: #000000 !important;\n}\n\nhtml.light-theme .lang-menu-choice:hover,\nhtml[data-theme=\"light\"] .lang-menu-choice:hover,\nbody.light-theme .lang-menu-choice:hover {\n  background: rgba(0, 0, 0, 0.05) !important;\n  color: #000000 !important;\n}\n\nhtml.light-theme .lang-menu-choice.active,\nhtml[data-theme=\"light\"] .lang-menu-choice.active,\nbody.light-theme .lang-menu-choice.active {\n  background: rgba(0, 0, 0, 0.1) !important;\n  color: #000000 !important;\n}\n\n/* ===== DARK THEME - Dark background, white text ===== */\nhtml.dark-theme .loc-widget-root,\nhtml[data-theme=\"dark\"] .loc-widget-root,\nbody.dark-theme .loc-widget-root {\n  background: var(--widget-bg-primary, #2c3e50) !important;\n}\n\nhtml.dark-theme .header-title-large,\nhtml[data-theme=\"dark\"] .header-title-large,\nbody.dark-theme .header-title-large {\n  color: #ffffff !important;\n}\n\nhtml.dark-theme .header-title-small,\nhtml[data-theme=\"dark\"] .header-title-small,\nbody.dark-theme .header-title-small {\n  color: #cbd5e1 !important;\n}\n\nhtml.dark-theme .lang-picker-btn,\nhtml[data-theme=\"dark\"] .lang-picker-btn,\nbody.dark-theme .lang-picker-btn {\n  background: transparent !important;\n  border-color: var(--border-primary, #485c6b) !important;\n  color: var(--text-primary, #ffffff) !important;\n}\n\nhtml.dark-theme .lang-picker-btn:hover,\nhtml[data-theme=\"dark\"] .lang-picker-btn:hover,\nbody.dark-theme .lang-picker-btn:hover {\n  background: rgba(255, 255, 255, 0.1) !important;\n  border-color: rgba(255, 255, 255, 0.4) !important;\n}\n\nhtml.dark-theme .theme-picker-btn,\nhtml[data-theme=\"dark\"] .theme-picker-btn,\nbody.dark-theme .theme-picker-btn {\n  background: transparent !important;\n  border-color: var(--border-primary, #485c6b) !important;\n  color: var(--text-primary, #ffffff) !important;\n}\n\nhtml.dark-theme .theme-picker-btn:hover,\nhtml[data-theme=\"dark\"] .theme-picker-btn:hover,\nbody.dark-theme .theme-picker-btn:hover {\n  background: rgba(255, 255, 255, 0.1) !important;\n  border-color: rgba(255, 255, 255, 0.4) !important;\n}\n\nhtml.dark-theme .lang-menu-popup,\nhtml[data-theme=\"dark\"] .lang-menu-popup,\nbody.dark-theme .lang-menu-popup {\n  background: #1e293b !important;\n  border-color: rgba(255, 255, 255, 0.2) !important;\n}\n\nhtml.dark-theme .lang-menu-choice,\nhtml[data-theme=\"dark\"] .lang-menu-choice,\nbody.dark-theme .lang-menu-choice {\n  background: #1e293b !important;\n  color: #ffffff !important;\n}\n\nhtml.dark-theme .lang-menu-choice:hover,\nhtml[data-theme=\"dark\"] .lang-menu-choice:hover,\nbody.dark-theme .lang-menu-choice:hover {\n  background: rgba(255, 255, 255, 0.1) !important;\n  color: #ffffff !important;\n}\n\nhtml.dark-theme .lang-menu-choice.active,\nhtml[data-theme=\"dark\"] .lang-menu-choice.active,\nbody.dark-theme .lang-menu-choice.active {\n  background: rgba(255, 255, 255, 0.15) !important;\n  color: #ffffff !important;\n}\n\n/* ===== CONTAINER QUERIES FALLBACK ===== */\n@container localization-widget (max-width: 400px) {\n  .loc-widget-root {\n    flex-direction: column;\n    align-items: flex-start;\n  }\n\n  .header-title-large {\n    font-size: 18px;\n  }\n\n  .header-title-small {\n    font-size: 12px;\n  }\n\n  .controls-section {\n    width: 100%;\n    flex-direction: column;\n  }\n\n  .language-selector-wrap,\n  .theme-selector-wrap {\n    width: 100%;\n  }\n\n  .lang-picker-btn,\n  .theme-picker-btn {\n    width: 100%;\n  }\n}\n\n@container localization-widget (max-height: 50px) {\n  .header-title-large {\n    font-size: 16px;\n  }\n\n  .header-title-small {\n    font-size: 11px;\n  }\n\n  .language-selector-wrap,\n  .theme-selector-wrap {\n    flex: 1;\n  }\n  .lang-picker-btn,\n  .theme-picker-btn {\n    min-height: 18px;\n    padding: 2px 8px;\n    gap: 4px;\n    border-radius: 20px;\n  }\n  .globe-icon,\n  .theme-icon {\n    width: 12px;\n    height: 12px;\n  }\n  .lang-text,\n  .theme-text {\n    font-size: 9px;\n  }\n  .chevron-icon {\n    width: 10px;\n    height: 10px;\n  }\n}\n\n@container localization-widget (min-height: 51px) and (max-height: 80px) {\n  .lang-picker-btn,\n  .theme-picker-btn {\n    min-height: 24px;\n    padding: 4px 10px;\n    gap: 5px;\n  }\n  .globe-icon,\n  .theme-icon {\n    width: 16px;\n    height: 16px;\n  }\n  .lang-text,\n  .theme-text {\n    font-size: 11px;\n  }\n}\n\n@container localization-widget (min-height: 81px) and (max-height: 120px) {\n  .lang-picker-btn,\n  .theme-picker-btn {\n    min-height: 32px;\n    padding: 6px 14px;\n    gap: 6px;\n  }\n  .globe-icon,\n  .theme-icon {\n    width: 20px;\n    height: 20px;\n  }\n  .lang-text,\n  .theme-text {\n    font-size: 13px;\n  }\n}\n\n@container localization-widget (min-height: 121px) and (max-height: 180px) {\n  .lang-picker-btn,\n  .theme-picker-btn {\n    min-height: 42px;\n    padding: 8px 20px;\n    gap: 10px;\n  }\n  .globe-icon,\n  .theme-icon {\n    width: 26px;\n    height: 26px;\n  }\n  .lang-text,\n  .theme-text {\n    font-size: 16px;\n  }\n}\n\n@container localization-widget (min-height: 181px) {\n  .lang-picker-btn,\n  .theme-picker-btn {\n    min-height: 56px;\n    padding: 12px 28px;\n    gap: 14px;\n  }\n  .globe-icon,\n  .theme-icon {\n    width: 32px;\n    height: 32px;\n  }\n  .lang-text,\n  .theme-text {\n    font-size: 20px;\n  }\n}\n\n/* ===== ACCESSIBILITY ===== */\n@media (prefers-reduced-motion: reduce) {\n  * {\n    transition: none !important;\n    animation: none !important;\n  }\n  .lang-picker-btn:hover,\n  .theme-picker-btn:hover {\n    transform: none !important;\n  }\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./your-extensions/widgets/LocalizationWidgetV20/src/runtime/widget.css":
/*!******************************************************************************!*\
  !*** ./your-extensions/widgets/LocalizationWidgetV20/src/runtime/widget.css ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../../../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../../../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../../../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_3_use_1_node_modules_resolve_url_loader_index_js_ruleSet_1_rules_3_use_2_node_modules_sass_loader_dist_cjs_js_ruleSet_1_rules_3_use_3_widget_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../../../../node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[3].use[1]!../../../../../node_modules/resolve-url-loader/index.js??ruleSet[1].rules[3].use[2]!../../../../../node_modules/sass-loader/dist/cjs.js??ruleSet[1].rules[3].use[3]!./widget.css */ "./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[3].use[1]!./node_modules/resolve-url-loader/index.js??ruleSet[1].rules[3].use[2]!./node_modules/sass-loader/dist/cjs.js??ruleSet[1].rules[3].use[3]!./your-extensions/widgets/LocalizationWidgetV20/src/runtime/widget.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());
options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_3_use_1_node_modules_resolve_url_loader_index_js_ruleSet_1_rules_3_use_2_node_modules_sass_loader_dist_cjs_js_ruleSet_1_rules_3_use_3_widget_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_3_use_1_node_modules_resolve_url_loader_index_js_ruleSet_1_rules_3_use_2_node_modules_sass_loader_dist_cjs_js_ruleSet_1_rules_3_use_3_widget_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_3_use_1_node_modules_resolve_url_loader_index_js_ruleSet_1_rules_3_use_2_node_modules_sass_loader_dist_cjs_js_ruleSet_1_rules_3_use_3_widget_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_3_use_1_node_modules_resolve_url_loader_index_js_ruleSet_1_rules_3_use_2_node_modules_sass_loader_dist_cjs_js_ruleSet_1_rules_3_use_3_widget_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ "jimu-core":
/*!****************************!*\
  !*** external "jimu-core" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_core__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
/*!******************************************!*\
  !*** ./jimu-core/lib/set-public-path.ts ***!
  \******************************************/
/**
 * Webpack will replace __webpack_public_path__ with __webpack_require__.p to set the public path dynamically.
 * The reason why we can't set the publicPath in webpack config is: we change the publicPath when download.
 * */
// eslint-disable-next-line
// @ts-ignore
__webpack_require__.p = window.jimuConfig.baseUrl;

})();

// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!******************************************************************************!*\
  !*** ./your-extensions/widgets/LocalizationWidgetV20/src/runtime/widget.tsx ***!
  \******************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __set_webpack_public_path__: () => (/* binding */ __set_webpack_public_path__),
/* harmony export */   "default": () => (/* binding */ LocalizationWidget)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var _widget_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./widget.css */ "./your-extensions/widgets/LocalizationWidgetV20/src/runtime/widget.css");
/** @jsx jsx */


const LANG_OPTIONS = [
    { code: "uz_lat", flag: "🇺🇿", label: "O'zbekcha", shortLabel: "UZ" },
    { code: "uz_cyrl", flag: "🇺🇿", label: "Ўзбекча", shortLabel: "ЎЗ" },
    { code: "ru", flag: "🇷🇺", label: "Русский", shortLabel: "RU" },
];
// Theme labels - tilga qarab dinamik
const THEME_LABELS = {
    light: {
        uz_lat: "Kunduz",
        uz_cyrl: "Кундуз",
        ru: "День",
    },
    dark: {
        uz_lat: "Tungi",
        uz_cyrl: "Тунги",
        ru: "Ночь",
    },
};
// Header text labels - tilga qarab dinamik
const HEADER_LABELS = {
    uz_lat: {
        water: "Water",
        spaceMonitoring: "Space Monitoring",
    },
    uz_cyrl: {
        water: "Water",
        spaceMonitoring: "Space Monitoring",
    },
    ru: {
        water: "Water",
        spaceMonitoring: "Space Monitoring",
    },
};
const getThemeOptions = (lang) => [
    { code: "light", icon: "☀️", label: THEME_LABELS.light[lang] },
    { code: "dark", icon: "🌙", label: THEME_LABELS.dark[lang] },
];
function normalizeLang(input) {
    const raw = String(input !== null && input !== void 0 ? input : "")
        .trim()
        .toLowerCase();
    if (raw === "ru" || raw === "rus" || raw === "russian")
        return "ru";
    if (raw === "uz_cyrl" ||
        raw === "uz-cyrl" ||
        raw === "uzcyrl" ||
        raw === "cyrillic")
        return "uz_cyrl";
    return "uz_lat";
}
function normalizeTheme(input) {
    const raw = String(input !== null && input !== void 0 ? input : "")
        .trim()
        .toLowerCase();
    if (raw === "light" || raw === "kun" || raw === "day")
        return "light";
    return "dark";
}
function getInitialLang() {
    try {
        const urlLang = new URLSearchParams(window.location.search).get("lang");
        if (urlLang)
            return normalizeLang(urlLang);
        const sessionLang = sessionStorage.getItem("evapo_session_lang");
        if (sessionLang)
            return normalizeLang(sessionLang);
        return "uz_lat";
    }
    catch (_a) { }
    return "uz_lat";
}
function getInitialTheme() {
    try {
        const urlTheme = new URLSearchParams(window.location.search).get("theme");
        if (urlTheme)
            return normalizeTheme(urlTheme);
        const sessionTheme = sessionStorage.getItem("evapo_session_theme");
        if (sessionTheme)
            return normalizeTheme(sessionTheme);
        const storedTheme = localStorage.getItem("evapo_app_theme");
        if (storedTheme)
            return normalizeTheme(storedTheme);
        return "dark";
    }
    catch (_a) { }
    return "dark";
}
function persistLanguage(lang) {
    try {
        localStorage.setItem("evapo_app_lang", lang);
        sessionStorage.setItem("evapo_session_lang", lang);
    }
    catch (_a) { }
    try {
        const url = new URL(window.location.href);
        url.searchParams.set("lang", lang);
        window.history.replaceState({}, "", url.toString());
    }
    catch (_b) { }
}
function persistTheme(theme) {
    try {
        localStorage.setItem("evapo_app_theme", theme);
        sessionStorage.setItem("evapo_session_theme", theme);
    }
    catch (_a) { }
    try {
        const url = new URL(window.location.href);
        url.searchParams.set("theme", theme);
        window.history.replaceState({}, "", url.toString());
    }
    catch (_b) { }
}
function broadcastLanguageChange(lang) {
    const detail = { lang, timestamp: Date.now(), source: "LocalizationWidget" };
    console.log("[LocalizationWidget] Broadcasting languageChanged:", detail);
    document.dispatchEvent(new CustomEvent("languageChanged", { detail, bubbles: true }));
}
function broadcastThemeChange(theme) {
    const detail = { theme, timestamp: Date.now(), source: "LocalizationWidget" };
    console.log("[LocalizationWidget] Broadcasting themeChanged:", detail);
    document.dispatchEvent(new CustomEvent("themeChanged", { detail, bubbles: true }));
    applyThemeToDocument(theme);
    // Re-apply after short delay to catch dynamically loaded content
    setTimeout(() => applyThemeToDocument(theme), 100);
    setTimeout(() => applyThemeToDocument(theme), 500);
}
function applyThemeToDocument(theme) {
    const addClass = theme === "light" ? "light-theme" : "dark-theme";
    const removeClass = theme === "light" ? "dark-theme" : "light-theme";
    // Apply to a document
    const applyToDoc = (doc) => {
        try {
            const html = doc.documentElement;
            const body = doc.body;
            if (html) {
                html.classList.remove(removeClass);
                html.classList.add(addClass);
                html.setAttribute("data-theme", theme);
                html.style.setProperty("--current-theme", theme);
            }
            if (body) {
                body.classList.remove(removeClass);
                body.classList.add(addClass);
                body.setAttribute("data-theme", theme);
            }
        }
        catch (e) {
            // Silently fail
        }
    };
    // Apply to current document
    applyToDoc(document);
    // Apply to parent window (if in iframe)
    try {
        if (window.parent && window.parent !== window && window.parent.document) {
            applyToDoc(window.parent.document);
        }
    }
    catch (e) { }
    // Apply to top window
    try {
        if (window.top && window.top !== window && window.top.document) {
            applyToDoc(window.top.document);
        }
    }
    catch (e) { }
    // Apply to all iframes in current document
    const applyToAllIframes = (doc) => {
        try {
            const iframes = doc.querySelectorAll("iframe");
            iframes.forEach((iframe) => {
                try {
                    if (iframe.contentDocument) {
                        applyToDoc(iframe.contentDocument);
                        // Recursively apply to nested iframes
                        applyToAllIframes(iframe.contentDocument);
                    }
                }
                catch (e) { }
            });
        }
        catch (e) { }
    };
    applyToAllIframes(document);
    // Try to apply to parent's iframes too
    try {
        if (window.parent && window.parent !== window && window.parent.document) {
            applyToAllIframes(window.parent.document);
        }
    }
    catch (e) { }
    // Try to apply to top window's iframes
    try {
        if (window.top && window.top !== window && window.top.document) {
            applyToAllIframes(window.top.document);
        }
    }
    catch (e) { }
    console.log("[LocalizationWidget] Theme applied to all documents:", theme);
    console.log("[LocalizationWidget] Theme applied:", theme);
}
class LocalizationWidgetComponent extends jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.langDropdownRef = jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createRef();
        this.langButtonRef = jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createRef();
        this.themeDropdownRef = jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createRef();
        this.themeButtonRef = jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createRef();
        this.containerRef = jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createRef();
        this.resizeObserver = null;
        this.containerSize = { width: 0, height: 0 };
        // Setup ResizeObserver for dynamic responsive sizing
        this.setupResizeObserver = () => {
            if (!this.containerRef.current)
                return;
            this.resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    this.containerSize = { width, height };
                    this.updateContainerSize(width, height);
                }
            });
            this.resizeObserver.observe(this.containerRef.current);
            // Initial size update
            const rect = this.containerRef.current.getBoundingClientRect();
            this.containerSize = { width: rect.width, height: rect.height };
            this.updateContainerSize(rect.width, rect.height);
        };
        // Update container size classes
        this.updateContainerSize = (width, height) => {
            if (!this.containerRef.current)
                return;
            const container = this.containerRef.current;
            const sizeClass = this.getSizeClass(width, height);
            const layoutClass = this.getLayoutClass(width, height);
            // Remove all size classes
            container.classList.remove("size-xs", "size-sm", "size-md", "size-lg", "size-xl");
            container.classList.remove("layout-horizontal", "layout-vertical");
            // Add appropriate size class
            container.classList.add(sizeClass);
            if (layoutClass) {
                container.classList.add(layoutClass);
            }
        };
        // Get size class based on container HEIGHT (like EvapoCropV10)
        this.getSizeClass = (width, height) => {
            // Use height as primary dimension for vertical layout
            if (height < 50)
                return "size-xs";
            if (height < 80)
                return "size-sm";
            if (height < 120)
                return "size-md";
            if (height < 180)
                return "size-lg";
            return "size-xl";
        };
        // Get layout class based on aspect ratio
        this.getLayoutClass = (width, height) => {
            // Always vertical layout - language and theme stacked
            return null;
        };
        this.handleClickOutside = (event) => {
            const target = event.target;
            if (this.langDropdownRef.current &&
                !this.langDropdownRef.current.contains(target)) {
                this.setState({ isLangOpen: false, langMenuPosition: null });
            }
            if (this.themeDropdownRef.current &&
                !this.themeDropdownRef.current.contains(target)) {
                this.setState({ isThemeOpen: false, themeMenuPosition: null });
            }
        };
        this.handleEscape = (event) => {
            if (event.key === "Escape") {
                this.setState({
                    isLangOpen: false,
                    isThemeOpen: false,
                    langMenuPosition: null,
                    themeMenuPosition: null,
                });
            }
        };
        this.handleScroll = () => {
            this.setState({
                isLangOpen: false,
                isThemeOpen: false,
                langMenuPosition: null,
                themeMenuPosition: null,
            });
        };
        this.handleResize = () => {
            this.setState({
                isLangOpen: false,
                isThemeOpen: false,
                langMenuPosition: null,
                themeMenuPosition: null,
            });
        };
        this.toggleLangDropdown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setState({ isThemeOpen: false, themeMenuPosition: null });
            if (this.state.isLangOpen) {
                this.setState({ isLangOpen: false, langMenuPosition: null });
            }
            else {
                const button = this.langButtonRef.current;
                if (button) {
                    const rect = button.getBoundingClientRect();
                    this.setState({
                        isLangOpen: true,
                        langMenuPosition: {
                            top: rect.bottom,
                            left: rect.left,
                            width: rect.width,
                        },
                    });
                }
                else {
                    this.setState({ isLangOpen: true });
                }
            }
        };
        this.toggleThemeDropdown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setState({ isLangOpen: false, langMenuPosition: null });
            if (this.state.isThemeOpen) {
                this.setState({ isThemeOpen: false, themeMenuPosition: null });
            }
            else {
                const button = this.themeButtonRef.current;
                if (button) {
                    const rect = button.getBoundingClientRect();
                    this.setState({
                        isThemeOpen: true,
                        themeMenuPosition: {
                            top: rect.bottom,
                            left: rect.left,
                            width: rect.width,
                        },
                    });
                }
                else {
                    this.setState({ isThemeOpen: true });
                }
            }
        };
        this.selectLangOption = (code, e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setLanguage(code);
            this.setState({ isLangOpen: false, langMenuPosition: null });
        };
        this.selectThemeOption = (code, e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setTheme(code);
            this.setState({ isThemeOpen: false, themeMenuPosition: null });
        };
        this.onExternalLanguageChanged = (ev) => {
            var _a, _b;
            const ce = ev;
            if (((_a = ce === null || ce === void 0 ? void 0 : ce.detail) === null || _a === void 0 ? void 0 : _a.source) === "LocalizationWidget")
                return;
            const lang = normalizeLang((_b = ce === null || ce === void 0 ? void 0 : ce.detail) === null || _b === void 0 ? void 0 : _b.lang);
            if (lang !== this.state.lang && this._isMounted) {
                this.setState({ lang });
            }
        };
        this.onExternalThemeChanged = (ev) => {
            var _a, _b;
            const ce = ev;
            if (((_a = ce === null || ce === void 0 ? void 0 : ce.detail) === null || _a === void 0 ? void 0 : _a.source) === "LocalizationWidget")
                return;
            const theme = normalizeTheme((_b = ce === null || ce === void 0 ? void 0 : ce.detail) === null || _b === void 0 ? void 0 : _b.theme);
            if (theme !== this.state.theme && this._isMounted) {
                this.setState({ theme });
            }
        };
        this.setLanguage = (lang) => {
            if (lang === this.state.lang)
                return;
            this.setState({ lang }, () => {
                persistLanguage(lang);
                broadcastLanguageChange(lang);
            });
        };
        this.setTheme = (theme) => {
            if (theme === this.state.theme)
                return;
            this.setState({ theme }, () => {
                persistTheme(theme);
                broadcastThemeChange(theme);
            });
        };
        this.state = {
            lang: getInitialLang(),
            theme: getInitialTheme(),
            isLangOpen: false,
            isThemeOpen: false,
            langMenuPosition: null,
            themeMenuPosition: null,
        };
    }
    componentDidMount() {
        this._isMounted = true;
        console.log("[LocalizationWidget] Mounted - lang:", this.state.lang, "theme:", this.state.theme);
        broadcastLanguageChange(this.state.lang);
        broadcastThemeChange(this.state.theme);
        document.addEventListener("languageChanged", this.onExternalLanguageChanged);
        document.addEventListener("themeChanged", this.onExternalThemeChanged);
        document.addEventListener("mousedown", this.handleClickOutside);
        document.addEventListener("keydown", this.handleEscape);
        window.addEventListener("scroll", this.handleScroll, true);
        window.addEventListener("resize", this.handleResize);
        // Setup ResizeObserver for dynamic responsive sizing
        this.setupResizeObserver();
    }
    componentWillUnmount() {
        this._isMounted = false;
        document.removeEventListener("languageChanged", this.onExternalLanguageChanged);
        document.removeEventListener("themeChanged", this.onExternalThemeChanged);
        document.removeEventListener("mousedown", this.handleClickOutside);
        document.removeEventListener("keydown", this.handleEscape);
        window.removeEventListener("scroll", this.handleScroll, true);
        window.removeEventListener("resize", this.handleResize);
        // Cleanup ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    }
    render() {
        const { lang, theme, isLangOpen, isThemeOpen, langMenuPosition, themeMenuPosition, } = this.state;
        // Dinamik theme options - tilga qarab
        const THEME_OPTIONS = getThemeOptions(lang);
        const currentLangOption = LANG_OPTIONS.find((opt) => opt.code === lang) || LANG_OPTIONS[0];
        const currentThemeOption = THEME_OPTIONS.find((opt) => opt.code === theme) || THEME_OPTIONS[1];
        const langMenuStyle = langMenuPosition
            ? {
                position: "fixed",
                top: langMenuPosition.top,
                left: langMenuPosition.left,
                width: langMenuPosition.width,
                zIndex: 999999,
            }
            : {};
        const themeMenuStyle = themeMenuPosition
            ? {
                position: "fixed",
                top: themeMenuPosition.top,
                left: themeMenuPosition.left,
                width: themeMenuPosition.width,
                zIndex: 999999,
            }
            : {};
        // Get language label based on current language
        const langLabels = {
            uz_lat: "Til",
            uz_cyrl: "Тил",
            ru: "Язык",
        };
        const currentLangLabel = langLabels[lang] || "Language";
        const headerLabels = HEADER_LABELS[lang];
        return ((0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "loc-widget-root", ref: this.containerRef },
            (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "header-text-section" },
                (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("h1", { className: "header-title-large" }, headerLabels.water),
                (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2", { className: "header-title-small" }, headerLabels.spaceMonitoring)),
            (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "controls-section" },
                (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "language-selector-wrap", ref: this.langDropdownRef },
                    (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { ref: this.langButtonRef, className: "lang-picker-btn" + (isLangOpen ? " active" : ""), onClick: this.toggleLangDropdown, type: "button", title: "Til tanlash" },
                        (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", { className: "globe-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5" },
                            (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", { cx: "12", cy: "12", r: "10" }),
                            (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("ellipse", { cx: "12", cy: "12", rx: "4", ry: "10" }),
                            (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", { d: "M2 12h20" }),
                            (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", { d: "M12 2c2.5 3 4 6.5 4 10s-1.5 7-4 10" }),
                            (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", { d: "M12 2c-2.5 3-4 6.5-4 10s1.5 7 4 10" })),
                        (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "lang-text" }, currentLangLabel),
                        (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", { className: "chevron-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" },
                            (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("polyline", { points: "6 9 12 15 18 9" }))),
                    isLangOpen && ((0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "lang-menu-popup", role: "listbox", style: langMenuStyle }, LANG_OPTIONS.map((opt) => ((0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { key: opt.code, className: "lang-menu-choice" + (lang === opt.code ? " active" : ""), onClick: (e) => this.selectLangOption(opt.code, e), role: "option" },
                        (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "lang-option-content" },
                            (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "lang-option-flag" }, opt.flag),
                            (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "lang-option-text" }, opt.label)),
                        lang === opt.code && (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "checkmark" }, "\u2713"))))))),
                (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "theme-selector-wrap" },
                    (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { className: "theme-picker-btn" + (theme === "dark" ? " dark" : " light"), onClick: () => this.setTheme(theme === "dark" ? "light" : "dark"), type: "button", title: theme === "dark"
                            ? "Kunduz rejimiga o'tish"
                            : "Tungi rejimga o'tish" },
                        theme === "dark" ? ((0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", { className: "theme-icon", viewBox: "0 0 24 24", fill: "currentColor", stroke: "none" },
                            (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }))) : ((0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", { className: "theme-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                            (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("circle", { cx: "12", cy: "12", r: "4" }),
                            (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", { d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" }))),
                        (0,jimu_core__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "theme-text" }, theme === "dark"
                            ? THEME_LABELS.dark[lang]
                            : THEME_LABELS.light[lang]))))));
    }
}
class LocalizationWidget extends LocalizationWidgetComponent {
    constructor(props) {
        super(props);
    }
}
function __set_webpack_public_path__(url) { __webpack_require__.p = url; }

})();

/******/ 	return __webpack_exports__;
/******/ })()

			);
		}
	};
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9Mb2NhbGl6YXRpb25XaWRnZXRWMjAvZGlzdC9ydW50aW1lL3dpZGdldC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDc0g7QUFDakI7QUFDckcsOEJBQThCLG1GQUEyQixDQUFDLDRGQUFxQztBQUMvRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxPQUFPLDZJQUE2SSxXQUFXLFdBQVcsS0FBSyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxNQUFNLEtBQUssVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxNQUFNLFdBQVcsS0FBSyxVQUFVLFdBQVcsVUFBVSxVQUFVLFVBQVUsTUFBTSxLQUFLLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsTUFBTSxLQUFLLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsTUFBTSxXQUFXLEtBQUssVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsTUFBTSxXQUFXLEtBQUssV0FBVyxVQUFVLFdBQVcsVUFBVSxVQUFVLE1BQU0sS0FBSyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxNQUFNLEtBQUssV0FBVyxXQUFXLFdBQVcsTUFBTSxLQUFLLFdBQVcsV0FBVyxXQUFXLE1BQU0sVUFBVSxLQUFLLFVBQVUsVUFBVSxVQUFVLFdBQVcsTUFBTSxXQUFXLEtBQUssVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLFdBQVcsS0FBSyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsTUFBTSxLQUFLLFdBQVcsTUFBTSxXQUFXLEtBQUssV0FBVyxVQUFVLFdBQVcsVUFBVSxVQUFVLE1BQU0sS0FBSyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxNQUFNLEtBQUssV0FBVyxXQUFXLFdBQVcsTUFBTSxLQUFLLFdBQVcsV0FBVyxVQUFVLE1BQU0sS0FBSyxXQUFXLFdBQVcsV0FBVyxNQUFNLEtBQUssV0FBVyxXQUFXLE1BQU0sS0FBSyxXQUFXLFdBQVcsTUFBTSxVQUFVLEtBQUssVUFBVSxVQUFVLFVBQVUsTUFBTSxVQUFVLEtBQUssVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLFdBQVcsS0FBSyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLEtBQUssV0FBVyxVQUFVLFdBQVcsVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxNQUFNLEtBQUssV0FBVyxVQUFVLE1BQU0sS0FBSyxXQUFXLFVBQVUsTUFBTSxLQUFLLFVBQVUsV0FBVyxVQUFVLE1BQU0sS0FBSyxVQUFVLE1BQU0sS0FBSyxVQUFVLFdBQVcsTUFBTSxLQUFLLFVBQVUsV0FBVyxVQUFVLE1BQU0sV0FBVyxLQUFLLEtBQUssV0FBVyxXQUFXLFVBQVUsV0FBVyxLQUFLLEtBQUssVUFBVSxVQUFVLFVBQVUsS0FBSyxLQUFLLFVBQVUsS0FBSyxLQUFLLFVBQVUsS0FBSyxLQUFLLFdBQVcsV0FBVyxVQUFVLFVBQVUsS0FBSyxNQUFNLFVBQVUsS0FBSyxNQUFNLFVBQVUsV0FBVyxVQUFVLEtBQUssTUFBTSxVQUFVLFVBQVUsS0FBSyxNQUFNLFVBQVUsS0FBSyxLQUFLLFVBQVUsVUFBVSxLQUFLLEtBQUssS0FBSyxLQUFLLFdBQVcsV0FBVyxXQUFXLFVBQVUsS0FBSyxLQUFLLFVBQVUsVUFBVSxLQUFLLE1BQU0sVUFBVSxLQUFLLE1BQU0sVUFBVSxLQUFLLE1BQU0sV0FBVyxVQUFVLFdBQVcsVUFBVSxNQUFNLE9BQU8sVUFBVSxVQUFVLE1BQU0sT0FBTyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsTUFBTSxPQUFPLFVBQVUsVUFBVSxNQUFNLE9BQU8sVUFBVSxNQUFNLE1BQU0sVUFBVSxVQUFVLE1BQU0sS0FBSyxZQUFZLFdBQVcsS0FBSyxVQUFVLFVBQVUsT0FBTyxPQUFPLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sTUFBTSxVQUFVLFVBQVUsT0FBTyxZQUFZLEtBQUssVUFBVSxVQUFVLE9BQU8sT0FBTyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLE9BQU8sWUFBWSxLQUFLLFVBQVUsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxNQUFNLFVBQVUsVUFBVSxPQUFPLFlBQVksS0FBSyxVQUFVLFVBQVUsT0FBTyxPQUFPLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sTUFBTSxVQUFVLFVBQVUsT0FBTyxZQUFZLEtBQUssVUFBVSxVQUFVLE9BQU8sT0FBTyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLE9BQU8sWUFBWSxPQUFPLFdBQVcsT0FBTyxRQUFRLFdBQVcsT0FBTyxRQUFRLFdBQVcsT0FBTyxRQUFRLFdBQVcsV0FBVyxXQUFXLE9BQU8sUUFBUSxXQUFXLFdBQVcsT0FBTyxRQUFRLFdBQVcsV0FBVyxPQUFPLFFBQVEsV0FBVyxXQUFXLFdBQVcsT0FBTyxRQUFRLFdBQVcsV0FBVyxPQUFPLFFBQVEsV0FBVyxXQUFXLE9BQU8sUUFBUSxXQUFXLFdBQVcsT0FBTyxRQUFRLFdBQVcsV0FBVyxPQUFPLFFBQVEsV0FBVyxXQUFXLE9BQU8sWUFBWSxPQUFPLFdBQVcsT0FBTyxRQUFRLFdBQVcsT0FBTyxRQUFRLFdBQVcsT0FBTyxRQUFRLFdBQVcsV0FBVyxXQUFXLE9BQU8sUUFBUSxXQUFXLFdBQVcsT0FBTyxRQUFRLFdBQVcsV0FBVyxXQUFXLE9BQU8sUUFBUSxXQUFXLFdBQVcsT0FBTyxRQUFRLFdBQVcsV0FBVyxPQUFPLFFBQVEsV0FBVyxXQUFXLE9BQU8sUUFBUSxXQUFXLFdBQVcsT0FBTyxRQUFRLFdBQVcsV0FBVyxPQUFPLFlBQVksS0FBSyxLQUFLLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxXQUFXLE1BQU0sT0FBTyxVQUFVLE1BQU0sT0FBTyxVQUFVLE1BQU0sS0FBSyxNQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE9BQU8sVUFBVSxNQUFNLE9BQU8sV0FBVyxXQUFXLFVBQVUsV0FBVyxNQUFNLE9BQU8sVUFBVSxVQUFVLE1BQU0sT0FBTyxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsTUFBTSxLQUFLLE1BQU0sTUFBTSxXQUFXLFdBQVcsVUFBVSxNQUFNLE9BQU8sVUFBVSxVQUFVLE1BQU0sT0FBTyxVQUFVLE1BQU0sS0FBSyxNQUFNLE1BQU0sV0FBVyxXQUFXLFVBQVUsTUFBTSxPQUFPLFVBQVUsVUFBVSxNQUFNLE9BQU8sVUFBVSxNQUFNLEtBQUssTUFBTSxNQUFNLFdBQVcsV0FBVyxVQUFVLE1BQU0sT0FBTyxVQUFVLFVBQVUsTUFBTSxPQUFPLFVBQVUsTUFBTSxL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QUcsR0FBRzs0QkFDaEMseURBQU0sQ0FBQyxFQUFDLG9IQUFvSCxHQUFHLENBQzNILENBQ1A7d0JBRUQseURBQU0sU0FBUyxFQUFDLFlBQVksSUFDekIsS0FBSyxLQUFLLE1BQU07NEJBQ2YsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzRCQUN6QixDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FDdkIsQ0FDQSxDQUNMLENBQ0EsQ0FDRixDQUNQLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFFYyxNQUFNLGtCQUFtQixTQUFRLDJCQUEyQjtJQUN6RSxZQUFZLEtBQThCO1FBQ3hDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNmLENBQUM7Q0FDRjtBQUVPLFNBQVMsMkJBQTJCLENBQUMsR0FBRyxJQUFJLHFCQUF1QixHQUFHLEdBQUcsRUFBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL0xvY2FsaXphdGlvbldpZGdldFYyMC9zcmMvcnVudGltZS93aWRnZXQuY3NzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvTG9jYWxpemF0aW9uV2lkZ2V0VjIwL3NyYy9ydW50aW1lL3dpZGdldC5jc3M/MTU3ZiIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS1jb3JlXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9ub25jZSIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vamltdS1jb3JlL2xpYi9zZXQtcHVibGljLXBhdGgudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL0xvY2FsaXphdGlvbldpZGdldFYyMC9zcmMvcnVudGltZS93aWRnZXQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIGAvKiA9PT09PSBEWU5BTUlDIFJFU1BPTlNJVkUgTE9DQUxJWkFUSU9OIFdJREdFVCA9PT09PSAqL1xuLyogRGVzaWduIG1hdGNoaW5nIHRoZSBpbWFnZSAtIEdsb2JlIGljb24sIExhbmd1YWdlIHRleHQsIENoZXZyb24gKi9cbi8qIENTUyBWYXJpYWJsZXMgLSBtYXRjaGluZyBvdGhlciB3aWRnZXRzICovXG46cm9vdCB7XG4gIC0td2lkZ2V0LWJnLXByaW1hcnk6ICMyYzNlNTA7XG4gIC0td2lkZ2V0LWJnLXNlY29uZGFyeTogIzM0NDk1ZTtcbiAgLS13aWRnZXQtYmctdGVydGlhcnk6ICMzYTRhNWM7XG4gIC0tdGV4dC1wcmltYXJ5OiAjZmZmZmZmO1xuICAtLXRleHQtc2Vjb25kYXJ5OiAjYmRjM2M3O1xuICAtLWJvcmRlci1wcmltYXJ5OiAjNDg1YzZiO1xufVxuXG4ubG9jLXdpZGdldC1yb290IHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBnYXA6IDE2cHg7XG4gIHdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IDEwMCU7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIHBhZGRpbmc6IDEycHggMTZweDtcbiAgbWluLWhlaWdodDogYXV0bztcbiAgY29udGFpbmVyLXR5cGU6IHNpemU7XG4gIGNvbnRhaW5lci1uYW1lOiBsb2NhbGl6YXRpb24td2lkZ2V0O1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS13aWRnZXQtYmctcHJpbWFyeSwgIzJjM2U1MCk7XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgdHJhbnNpdGlvbjogYmFja2dyb3VuZC1jb2xvciAwLjNzIGVhc2U7XG59XG5cbi8qIEhlYWRlciBUZXh0IFNlY3Rpb24gLSBMZWZ0IFNpZGUgKi9cbi5oZWFkZXItdGV4dC1zZWN0aW9uIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgZ2FwOiA0cHg7XG4gIGZsZXg6IDE7XG4gIG1pbi13aWR0aDogMDtcbn1cblxuLmhlYWRlci10aXRsZS1sYXJnZSB7XG4gIG1hcmdpbjogMDtcbiAgZm9udC1zaXplOiAyNHB4O1xuICBmb250LXdlaWdodDogNzAwO1xuICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjZmZmZmZmKTtcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMDJlbTtcbiAgbGluZS1oZWlnaHQ6IDEuMjtcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gIHRyYW5zaXRpb246IGNvbG9yIDAuM3MgZWFzZTtcbn1cblxuLmhlYWRlci10aXRsZS1zbWFsbCB7XG4gIG1hcmdpbjogMDtcbiAgZm9udC1zaXplOiAxNHB4O1xuICBmb250LXdlaWdodDogNDAwO1xuICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnksICNiZGMzYzcpO1xuICBsZXR0ZXItc3BhY2luZzogMC4wMWVtO1xuICBsaW5lLWhlaWdodDogMS4zO1xuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgdHJhbnNpdGlvbjogY29sb3IgMC4zcyBlYXNlO1xufVxuXG4vKiBDb250cm9scyBTZWN0aW9uIC0gUmlnaHQgU2lkZSAqL1xuLmNvbnRyb2xzLXNlY3Rpb24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBhbGlnbi1pdGVtczogZmxleC1lbmQ7XG4gIGdhcDogOHB4O1xuICBmbGV4LXNocmluazogMDtcbiAgbWluLXdpZHRoOiAwO1xufVxuXG4vKiA9PT09PSBMQU5HVUFHRSBTRUxFQ1RPUiAtIE1hdGNoaW5nIEltYWdlIERlc2lnbiA9PT09PSAqL1xuLmxhbmd1YWdlLXNlbGVjdG9yLXdyYXAge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHdpZHRoOiBhdXRvO1xuICBtaW4td2lkdGg6IDEwMHB4O1xuICBmbGV4LXNocmluazogMDtcbiAgZGlzcGxheTogZmxleDtcbn1cblxuLmxhbmctcGlja2VyLWJ0biB7XG4gIHdpZHRoOiBhdXRvO1xuICBtaW4td2lkdGg6IDEwMHB4O1xuICBoZWlnaHQ6IGF1dG87XG4gIG1pbi1oZWlnaHQ6IDM2cHg7XG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICBib3JkZXI6IDJweCBzb2xpZCB2YXIoLS1ib3JkZXItcHJpbWFyeSwgIzQ4NWM2Yik7XG4gIGJvcmRlci1yYWRpdXM6IDUwcHg7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICNmZmZmZmYpO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIG91dGxpbmU6IG5vbmU7XG4gIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBnYXA6IDZweDtcbiAgcGFkZGluZzogNnB4IDE0cHg7XG4gIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIFwiU2Vnb2UgVUlcIiwgUm9ib3RvLCBBcmlhbCwgc2Fucy1zZXJpZjtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbn1cblxuLmxhbmctcGlja2VyLWJ0bjpob3ZlciB7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcbiAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNCk7XG4gIHRyYW5zZm9ybTogc2NhbGUoMS4wMik7XG59XG5cbi5sYW5nLXBpY2tlci1idG4uYWN0aXZlIHtcbiAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjE1KTtcbiAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNSk7XG4gIGJveC1zaGFkb3c6IDAgMCAwIDJweCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSk7XG59XG5cbi8qIEdsb2JlIEljb24gKi9cbi5nbG9iZS1pY29uIHtcbiAgd2lkdGg6IDE4cHg7XG4gIGhlaWdodDogMThweDtcbiAgZmxleC1zaHJpbms6IDA7XG4gIHN0cm9rZTogY3VycmVudENvbG9yO1xufVxuXG4vKiBMYW5ndWFnZSBUZXh0ICovXG4ubGFuZy10ZXh0IHtcbiAgZm9udC1zaXplOiAxNHB4O1xuICBmb250LXdlaWdodDogNTAwO1xuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICBmbGV4LXNocmluazogMDtcbn1cblxuLyogQ2hldnJvbiBJY29uICovXG4uY2hldnJvbi1pY29uIHtcbiAgd2lkdGg6IDE0cHg7XG4gIGhlaWdodDogMTRweDtcbiAgZmxleC1zaHJpbms6IDA7XG4gIHN0cm9rZTogY3VycmVudENvbG9yO1xuICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4ycyBlYXNlO1xufVxuXG4ubGFuZy1waWNrZXItYnRuLmFjdGl2ZSAuY2hldnJvbi1pY29uIHtcbiAgdHJhbnNmb3JtOiByb3RhdGUoMTgwZGVnKTtcbn1cblxuLyogPT09PT0gVEhFTUUgU0VMRUNUT1IgLSBTYW1lIERlc2lnbiA9PT09PSAqL1xuLnRoZW1lLXNlbGVjdG9yLXdyYXAge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHdpZHRoOiBhdXRvO1xuICBtaW4td2lkdGg6IDEwMHB4O1xuICBmbGV4LXNocmluazogMDtcbiAgZGlzcGxheTogZmxleDtcbn1cblxuLnRoZW1lLXBpY2tlci1idG4ge1xuICB3aWR0aDogYXV0bztcbiAgbWluLXdpZHRoOiAxMDBweDtcbiAgaGVpZ2h0OiBhdXRvO1xuICBtaW4taGVpZ2h0OiAzNnB4O1xuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgYm9yZGVyOiAycHggc29saWQgdmFyKC0tYm9yZGVyLXByaW1hcnksICM0ODVjNmIpO1xuICBib3JkZXItcmFkaXVzOiA1MHB4O1xuICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjZmZmZmZmKTtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBvdXRsaW5lOiBub25lO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgZ2FwOiA2cHg7XG4gIHBhZGRpbmc6IDZweCAxNHB4O1xuICBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBcIlNlZ29lIFVJXCIsIFJvYm90bywgQXJpYWwsIHNhbnMtc2VyaWY7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG59XG5cbi50aGVtZS1waWNrZXItYnRuLmRhcmsge1xuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgYm9yZGVyLWNvbG9yOiB2YXIoLS1ib3JkZXItcHJpbWFyeSwgIzQ4NWM2Yik7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICNmZmZmZmYpO1xufVxuXG4udGhlbWUtcGlja2VyLWJ0bi5saWdodCB7XG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICBib3JkZXItY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4yKTtcbiAgY29sb3I6ICMwMDAwMDA7XG59XG5cbi50aGVtZS1waWNrZXItYnRuOmhvdmVyIHtcbiAgdHJhbnNmb3JtOiBzY2FsZSgxLjAyKTtcbiAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNCk7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcbn1cblxuLnRoZW1lLXBpY2tlci1idG4uZGFyazpob3ZlciB7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcbiAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNCk7XG59XG5cbi50aGVtZS1waWNrZXItYnRuLmxpZ2h0OmhvdmVyIHtcbiAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjA1KTtcbiAgYm9yZGVyLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMyk7XG59XG5cbi8qIFRoZW1lIEljb24gKi9cbi50aGVtZS1pY29uIHtcbiAgd2lkdGg6IDE4cHg7XG4gIGhlaWdodDogMThweDtcbiAgZmxleC1zaHJpbms6IDA7XG59XG5cbi8qIFRoZW1lIFRleHQgKi9cbi50aGVtZS10ZXh0IHtcbiAgZm9udC1zaXplOiAxNHB4O1xuICBmb250LXdlaWdodDogNTAwO1xuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICBmbGV4LXNocmluazogMDtcbn1cblxuLyogPT09PT0gRFJPUERPV04gTUVOVSA9PT09PSAqL1xuLmxhbmctbWVudS1wb3B1cCB7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgYmFja2dyb3VuZDogIzFlMjkzYjtcbiAgYm9yZGVyOiAycHggc29saWQgIzM4YmRmODtcbiAgYm9yZGVyLXJhZGl1czogMTJweDtcbiAgYm94LXNoYWRvdzogMCA4cHggMjRweCByZ2JhKDAsIDAsIDAsIDAuNCk7XG4gIHotaW5kZXg6IDk5OTk5OTtcbiAgbWluLXdpZHRoOiAxNDBweDtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgbWFyZ2luLXRvcDogNHB4O1xufVxuXG4ubGFuZy1tZW51LWNob2ljZSB7XG4gIHBhZGRpbmc6IDEwcHggMTRweDtcbiAgZm9udC1zaXplOiAxNHB4O1xuICBmb250LXdlaWdodDogNTAwO1xuICBjb2xvcjogI2YxZjVmOTtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4xNXMgZWFzZTtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBiYWNrZ3JvdW5kOiAjMWUyOTNiO1xufVxuXG4ubGFuZy1tZW51LWNob2ljZTpob3ZlciB7XG4gIGJhY2tncm91bmQ6ICMwZjE3MmE7XG4gIGNvbG9yOiAjMzhiZGY4O1xufVxuXG4ubGFuZy1tZW51LWNob2ljZS5hY3RpdmUge1xuICBiYWNrZ3JvdW5kOiAjMGYxNzJhO1xuICBjb2xvcjogIzM4YmRmODtcbn1cblxuLmxhbmctb3B0aW9uLWNvbnRlbnQge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDhweDtcbn1cblxuLmxhbmctb3B0aW9uLWZsYWcge1xuICBmb250LXNpemU6IDE4cHg7XG59XG5cbi5sYW5nLW9wdGlvbi10ZXh0IHtcbiAgZm9udC1zaXplOiAxNHB4O1xuICBmb250LXdlaWdodDogNTAwO1xufVxuXG4uY2hlY2ttYXJrIHtcbiAgY29sb3I6ICMzOGJkZjg7XG4gIGZvbnQtd2VpZ2h0OiA3MDA7XG4gIGZvbnQtc2l6ZTogMTRweDtcbn1cblxuLyogPT09PT0gUkVTUE9OU0lWRSBMQVlPVVQgPT09PT0gKi9cbkBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xuICAubG9jLXdpZGdldC1yb290IHtcbiAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiAxMnB4O1xuICAgIHBhZGRpbmc6IDEwcHggMTJweDtcbiAgfVxuICAuaGVhZGVyLXRleHQtc2VjdGlvbiB7XG4gICAgZmxleDogMTtcbiAgICBnYXA6IDNweDtcbiAgICBtaW4td2lkdGg6IDA7XG4gIH1cbiAgLmhlYWRlci10aXRsZS1sYXJnZSB7XG4gICAgZm9udC1zaXplOiAyMHB4O1xuICB9XG4gIC5oZWFkZXItdGl0bGUtc21hbGwge1xuICAgIGZvbnQtc2l6ZTogMTNweDtcbiAgfVxuICAuY29udHJvbHMtc2VjdGlvbiB7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBhbGlnbi1pdGVtczogZmxleC1lbmQ7XG4gICAgZ2FwOiA2cHg7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gIH1cbiAgLmxhbmd1YWdlLXNlbGVjdG9yLXdyYXAsXG4gIC50aGVtZS1zZWxlY3Rvci13cmFwIHtcbiAgICBtaW4td2lkdGg6IDkwcHg7XG4gIH1cbiAgLmxhbmctcGlja2VyLWJ0bixcbiAgLnRoZW1lLXBpY2tlci1idG4ge1xuICAgIG1pbi13aWR0aDogOTBweDtcbiAgICBwYWRkaW5nOiA1cHggMTJweDtcbiAgICBnYXA6IDVweDtcbiAgfVxuICAuZ2xvYmUtaWNvbixcbiAgLnRoZW1lLWljb24ge1xuICAgIHdpZHRoOiAxNnB4O1xuICAgIGhlaWdodDogMTZweDtcbiAgfVxuICAubGFuZy10ZXh0LFxuICAudGhlbWUtdGV4dCB7XG4gICAgZm9udC1zaXplOiAxMnB4O1xuICB9XG4gIC5jaGV2cm9uLWljb24ge1xuICAgIHdpZHRoOiAxMnB4O1xuICAgIGhlaWdodDogMTJweDtcbiAgfVxufVxuQG1lZGlhIChtYXgtd2lkdGg6IDQ4MHB4KSB7XG4gIC5sb2Mtd2lkZ2V0LXJvb3Qge1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XG4gICAgcGFkZGluZzogOHB4IDEwcHg7XG4gICAgZ2FwOiAxMHB4O1xuICB9XG4gIC5oZWFkZXItdGV4dC1zZWN0aW9uIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBnYXA6IDJweDtcbiAgfVxuICAuaGVhZGVyLXRpdGxlLWxhcmdlIHtcbiAgICBmb250LXNpemU6IDE4cHg7XG4gIH1cbiAgLmhlYWRlci10aXRsZS1zbWFsbCB7XG4gICAgZm9udC1zaXplOiAxMnB4O1xuICB9XG4gIC5jb250cm9scy1zZWN0aW9uIHtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGFsaWduLWl0ZW1zOiBzdHJldGNoO1xuICAgIGdhcDogNnB4O1xuICB9XG4gIC5sYW5ndWFnZS1zZWxlY3Rvci13cmFwLFxuICAudGhlbWUtc2VsZWN0b3Itd3JhcCB7XG4gICAgZmxleDogMTtcbiAgICBtaW4td2lkdGg6IDA7XG4gIH1cbiAgLmxhbmctcGlja2VyLWJ0bixcbiAgLnRoZW1lLXBpY2tlci1idG4ge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIG1pbi13aWR0aDogMDtcbiAgICBtaW4taGVpZ2h0OiAzMnB4O1xuICAgIHBhZGRpbmc6IDVweCAxMHB4O1xuICAgIGdhcDogNXB4O1xuICB9XG4gIC5nbG9iZS1pY29uLFxuICAudGhlbWUtaWNvbiB7XG4gICAgd2lkdGg6IDE2cHg7XG4gICAgaGVpZ2h0OiAxNnB4O1xuICB9XG4gIC5sYW5nLXRleHQsXG4gIC50aGVtZS10ZXh0IHtcbiAgICBmb250LXNpemU6IDEycHg7XG4gIH1cbiAgLmNoZXZyb24taWNvbiB7XG4gICAgd2lkdGg6IDEycHg7XG4gICAgaGVpZ2h0OiAxMnB4O1xuICB9XG59XG4vKiA9PT09PSBTSVpFIENMQVNTRVMgLSBEeW5hbWljIFJlc3BvbnNpdmUgPT09PT0gKi9cbi8qIEV4dHJhIFNtYWxsICg8IDUwcHggaGVpZ2h0KSAqL1xuLmxvYy13aWRnZXQtcm9vdC5zaXplLXhzIHtcbiAgZ2FwOiAzcHg7XG4gIHBhZGRpbmc6IDNweDtcbn1cblxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXhzIC5sYW5nLXBpY2tlci1idG4sXG4ubG9jLXdpZGdldC1yb290LnNpemUteHMgLnRoZW1lLXBpY2tlci1idG4ge1xuICBtaW4taGVpZ2h0OiAxOHB4O1xuICBwYWRkaW5nOiAycHggOHB4O1xuICBnYXA6IDRweDtcbiAgYm9yZGVyLXJhZGl1czogMjBweDtcbiAgYm9yZGVyLXdpZHRoOiAxcHg7XG59XG5cbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS14cyAuZ2xvYmUtaWNvbixcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS14cyAudGhlbWUtaWNvbiB7XG4gIHdpZHRoOiAxMnB4O1xuICBoZWlnaHQ6IDEycHg7XG59XG5cbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS14cyAubGFuZy10ZXh0LFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXhzIC50aGVtZS10ZXh0IHtcbiAgZm9udC1zaXplOiA5cHg7XG59XG5cbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS14cyAuY2hldnJvbi1pY29uIHtcbiAgd2lkdGg6IDEwcHg7XG4gIGhlaWdodDogMTBweDtcbn1cblxuLyogU21hbGwgKDUwcHggLSA4MHB4IGhlaWdodCkgKi9cbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1zbSB7XG4gIGdhcDogNHB4O1xuICBwYWRkaW5nOiA0cHg7XG59XG5cbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1zbSAubGFuZy1waWNrZXItYnRuLFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXNtIC50aGVtZS1waWNrZXItYnRuIHtcbiAgbWluLWhlaWdodDogMjRweDtcbiAgcGFkZGluZzogNHB4IDEwcHg7XG4gIGdhcDogNXB4O1xuICBib3JkZXItcmFkaXVzOiAyNXB4O1xuICBib3JkZXItd2lkdGg6IDEuNXB4O1xufVxuXG4ubG9jLXdpZGdldC1yb290LnNpemUtc20gLmdsb2JlLWljb24sXG4ubG9jLXdpZGdldC1yb290LnNpemUtc20gLnRoZW1lLWljb24ge1xuICB3aWR0aDogMTZweDtcbiAgaGVpZ2h0OiAxNnB4O1xufVxuXG4ubG9jLXdpZGdldC1yb290LnNpemUtc20gLmxhbmctdGV4dCxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1zbSAudGhlbWUtdGV4dCB7XG4gIGZvbnQtc2l6ZTogMTFweDtcbn1cblxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXNtIC5jaGV2cm9uLWljb24ge1xuICB3aWR0aDogMTJweDtcbiAgaGVpZ2h0OiAxMnB4O1xufVxuXG4vKiBNZWRpdW0gKDgwcHggLSAxMjBweCBoZWlnaHQpICovXG4ubG9jLXdpZGdldC1yb290LnNpemUtbWQge1xuICBnYXA6IDZweDtcbiAgcGFkZGluZzogNnB4O1xufVxuXG4ubG9jLXdpZGdldC1yb290LnNpemUtbWQgLmxhbmctcGlja2VyLWJ0bixcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1tZCAudGhlbWUtcGlja2VyLWJ0biB7XG4gIG1pbi1oZWlnaHQ6IDMycHg7XG4gIHBhZGRpbmc6IDZweCAxNHB4O1xuICBnYXA6IDZweDtcbiAgYm9yZGVyLXJhZGl1czogMzBweDtcbiAgYm9yZGVyLXdpZHRoOiAycHg7XG59XG5cbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1tZCAuZ2xvYmUtaWNvbixcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1tZCAudGhlbWUtaWNvbiB7XG4gIHdpZHRoOiAyMHB4O1xuICBoZWlnaHQ6IDIwcHg7XG59XG5cbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1tZCAubGFuZy10ZXh0LFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLW1kIC50aGVtZS10ZXh0IHtcbiAgZm9udC1zaXplOiAxM3B4O1xufVxuXG4ubG9jLXdpZGdldC1yb290LnNpemUtbWQgLmNoZXZyb24taWNvbiB7XG4gIHdpZHRoOiAxNHB4O1xuICBoZWlnaHQ6IDE0cHg7XG59XG5cbi8qIExhcmdlICgxMjBweCAtIDE4MHB4IGhlaWdodCkgKi9cbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1sZyB7XG4gIGdhcDogOHB4O1xuICBwYWRkaW5nOiA4cHg7XG59XG5cbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1sZyAubGFuZy1waWNrZXItYnRuLFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLWxnIC50aGVtZS1waWNrZXItYnRuIHtcbiAgbWluLWhlaWdodDogNDJweDtcbiAgcGFkZGluZzogOHB4IDIwcHg7XG4gIGdhcDogMTBweDtcbiAgYm9yZGVyLXJhZGl1czogNDBweDtcbiAgYm9yZGVyLXdpZHRoOiAycHg7XG59XG5cbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1sZyAuZ2xvYmUtaWNvbixcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1sZyAudGhlbWUtaWNvbiB7XG4gIHdpZHRoOiAyNnB4O1xuICBoZWlnaHQ6IDI2cHg7XG59XG5cbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1sZyAubGFuZy10ZXh0LFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLWxnIC50aGVtZS10ZXh0IHtcbiAgZm9udC1zaXplOiAxNnB4O1xufVxuXG4ubG9jLXdpZGdldC1yb290LnNpemUtbGcgLmNoZXZyb24taWNvbiB7XG4gIHdpZHRoOiAxOHB4O1xuICBoZWlnaHQ6IDE4cHg7XG59XG5cbi8qIEV4dHJhIExhcmdlICg+IDE4MHB4IGhlaWdodCkgKi9cbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS14bCB7XG4gIGdhcDogMTJweDtcbiAgcGFkZGluZzogMTJweDtcbn1cblxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXhsIC5sYW5nLXBpY2tlci1idG4sXG4ubG9jLXdpZGdldC1yb290LnNpemUteGwgLnRoZW1lLXBpY2tlci1idG4ge1xuICBtaW4taGVpZ2h0OiA1NnB4O1xuICBwYWRkaW5nOiAxMnB4IDI4cHg7XG4gIGdhcDogMTRweDtcbiAgYm9yZGVyLXJhZGl1czogNTBweDtcbiAgYm9yZGVyLXdpZHRoOiAzcHg7XG59XG5cbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS14bCAuZ2xvYmUtaWNvbixcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS14bCAudGhlbWUtaWNvbiB7XG4gIHdpZHRoOiAzMnB4O1xuICBoZWlnaHQ6IDMycHg7XG59XG5cbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS14bCAubGFuZy10ZXh0LFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXhsIC50aGVtZS10ZXh0IHtcbiAgZm9udC1zaXplOiAyMHB4O1xufVxuXG4ubG9jLXdpZGdldC1yb290LnNpemUteGwgLmNoZXZyb24taWNvbiB7XG4gIHdpZHRoOiAyMnB4O1xuICBoZWlnaHQ6IDIycHg7XG59XG5cbi8qID09PT09IExJR0hUIFRIRU1FIC0gV2hpdGUgYmFja2dyb3VuZCwgYmxhY2sgdGV4dCA9PT09PSAqL1xuaHRtbC5saWdodC10aGVtZSAubG9jLXdpZGdldC1yb290LFxuaHRtbFtkYXRhLXRoZW1lPWxpZ2h0XSAubG9jLXdpZGdldC1yb290LFxuYm9keS5saWdodC10aGVtZSAubG9jLXdpZGdldC1yb290IHtcbiAgYmFja2dyb3VuZDogI2Y1ZjdmYSAhaW1wb3J0YW50O1xufVxuXG5odG1sLmxpZ2h0LXRoZW1lIC5oZWFkZXItdGl0bGUtbGFyZ2UsXG5odG1sW2RhdGEtdGhlbWU9bGlnaHRdIC5oZWFkZXItdGl0bGUtbGFyZ2UsXG5ib2R5LmxpZ2h0LXRoZW1lIC5oZWFkZXItdGl0bGUtbGFyZ2Uge1xuICBjb2xvcjogIzAwMDAwMCAhaW1wb3J0YW50O1xufVxuXG5odG1sLmxpZ2h0LXRoZW1lIC5oZWFkZXItdGl0bGUtc21hbGwsXG5odG1sW2RhdGEtdGhlbWU9bGlnaHRdIC5oZWFkZXItdGl0bGUtc21hbGwsXG5ib2R5LmxpZ2h0LXRoZW1lIC5oZWFkZXItdGl0bGUtc21hbGwge1xuICBjb2xvcjogIzM3NDE1MSAhaW1wb3J0YW50O1xufVxuXG5odG1sLmxpZ2h0LXRoZW1lIC5sYW5nLXBpY2tlci1idG4sXG5odG1sW2RhdGEtdGhlbWU9bGlnaHRdIC5sYW5nLXBpY2tlci1idG4sXG5ib2R5LmxpZ2h0LXRoZW1lIC5sYW5nLXBpY2tlci1idG4ge1xuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudCAhaW1wb3J0YW50O1xuICBib3JkZXItY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4yKSAhaW1wb3J0YW50O1xuICBjb2xvcjogIzAwMDAwMCAhaW1wb3J0YW50O1xufVxuXG5odG1sLmxpZ2h0LXRoZW1lIC5sYW5nLXBpY2tlci1idG46aG92ZXIsXG5odG1sW2RhdGEtdGhlbWU9bGlnaHRdIC5sYW5nLXBpY2tlci1idG46aG92ZXIsXG5ib2R5LmxpZ2h0LXRoZW1lIC5sYW5nLXBpY2tlci1idG46aG92ZXIge1xuICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuMDUpICFpbXBvcnRhbnQ7XG4gIGJvcmRlci1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjMpICFpbXBvcnRhbnQ7XG59XG5cbmh0bWwubGlnaHQtdGhlbWUgLmxhbmctcGlja2VyLWJ0bi5hY3RpdmUsXG5odG1sW2RhdGEtdGhlbWU9bGlnaHRdIC5sYW5nLXBpY2tlci1idG4uYWN0aXZlLFxuYm9keS5saWdodC10aGVtZSAubGFuZy1waWNrZXItYnRuLmFjdGl2ZSB7XG4gIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4xKSAhaW1wb3J0YW50O1xuICBib3JkZXItY29sb3I6IHJnYmEoMCwgMCwgMCwgMC40KSAhaW1wb3J0YW50O1xufVxuXG5odG1sLmxpZ2h0LXRoZW1lIC50aGVtZS1waWNrZXItYnRuLFxuaHRtbFtkYXRhLXRoZW1lPWxpZ2h0XSAudGhlbWUtcGlja2VyLWJ0bixcbmJvZHkubGlnaHQtdGhlbWUgLnRoZW1lLXBpY2tlci1idG4ge1xuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudCAhaW1wb3J0YW50O1xuICBib3JkZXItY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4yKSAhaW1wb3J0YW50O1xuICBjb2xvcjogIzAwMDAwMCAhaW1wb3J0YW50O1xufVxuXG5odG1sLmxpZ2h0LXRoZW1lIC50aGVtZS1waWNrZXItYnRuOmhvdmVyLFxuaHRtbFtkYXRhLXRoZW1lPWxpZ2h0XSAudGhlbWUtcGlja2VyLWJ0bjpob3ZlcixcbmJvZHkubGlnaHQtdGhlbWUgLnRoZW1lLXBpY2tlci1idG46aG92ZXIge1xuICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuMDUpICFpbXBvcnRhbnQ7XG4gIGJvcmRlci1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjMpICFpbXBvcnRhbnQ7XG59XG5cbmh0bWwubGlnaHQtdGhlbWUgLmxhbmctbWVudS1wb3B1cCxcbmh0bWxbZGF0YS10aGVtZT1saWdodF0gLmxhbmctbWVudS1wb3B1cCxcbmJvZHkubGlnaHQtdGhlbWUgLmxhbmctbWVudS1wb3B1cCB7XG4gIGJhY2tncm91bmQ6ICNmZmZmZmYgIWltcG9ydGFudDtcbiAgYm9yZGVyLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMikgIWltcG9ydGFudDtcbn1cblxuaHRtbC5saWdodC10aGVtZSAubGFuZy1tZW51LWNob2ljZSxcbmh0bWxbZGF0YS10aGVtZT1saWdodF0gLmxhbmctbWVudS1jaG9pY2UsXG5ib2R5LmxpZ2h0LXRoZW1lIC5sYW5nLW1lbnUtY2hvaWNlIHtcbiAgYmFja2dyb3VuZDogI2ZmZmZmZiAhaW1wb3J0YW50O1xuICBjb2xvcjogIzAwMDAwMCAhaW1wb3J0YW50O1xufVxuXG5odG1sLmxpZ2h0LXRoZW1lIC5sYW5nLW1lbnUtY2hvaWNlOmhvdmVyLFxuaHRtbFtkYXRhLXRoZW1lPWxpZ2h0XSAubGFuZy1tZW51LWNob2ljZTpob3ZlcixcbmJvZHkubGlnaHQtdGhlbWUgLmxhbmctbWVudS1jaG9pY2U6aG92ZXIge1xuICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuMDUpICFpbXBvcnRhbnQ7XG4gIGNvbG9yOiAjMDAwMDAwICFpbXBvcnRhbnQ7XG59XG5cbmh0bWwubGlnaHQtdGhlbWUgLmxhbmctbWVudS1jaG9pY2UuYWN0aXZlLFxuaHRtbFtkYXRhLXRoZW1lPWxpZ2h0XSAubGFuZy1tZW51LWNob2ljZS5hY3RpdmUsXG5ib2R5LmxpZ2h0LXRoZW1lIC5sYW5nLW1lbnUtY2hvaWNlLmFjdGl2ZSB7XG4gIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4xKSAhaW1wb3J0YW50O1xuICBjb2xvcjogIzAwMDAwMCAhaW1wb3J0YW50O1xufVxuXG4vKiA9PT09PSBEQVJLIFRIRU1FIC0gRGFyayBiYWNrZ3JvdW5kLCB3aGl0ZSB0ZXh0ID09PT09ICovXG5odG1sLmRhcmstdGhlbWUgLmxvYy13aWRnZXQtcm9vdCxcbmh0bWxbZGF0YS10aGVtZT1kYXJrXSAubG9jLXdpZGdldC1yb290LFxuYm9keS5kYXJrLXRoZW1lIC5sb2Mtd2lkZ2V0LXJvb3Qge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS13aWRnZXQtYmctcHJpbWFyeSwgIzJjM2U1MCkgIWltcG9ydGFudDtcbn1cblxuaHRtbC5kYXJrLXRoZW1lIC5oZWFkZXItdGl0bGUtbGFyZ2UsXG5odG1sW2RhdGEtdGhlbWU9ZGFya10gLmhlYWRlci10aXRsZS1sYXJnZSxcbmJvZHkuZGFyay10aGVtZSAuaGVhZGVyLXRpdGxlLWxhcmdlIHtcbiAgY29sb3I6ICNmZmZmZmYgIWltcG9ydGFudDtcbn1cblxuaHRtbC5kYXJrLXRoZW1lIC5oZWFkZXItdGl0bGUtc21hbGwsXG5odG1sW2RhdGEtdGhlbWU9ZGFya10gLmhlYWRlci10aXRsZS1zbWFsbCxcbmJvZHkuZGFyay10aGVtZSAuaGVhZGVyLXRpdGxlLXNtYWxsIHtcbiAgY29sb3I6ICNjYmQ1ZTEgIWltcG9ydGFudDtcbn1cblxuaHRtbC5kYXJrLXRoZW1lIC5sYW5nLXBpY2tlci1idG4sXG5odG1sW2RhdGEtdGhlbWU9ZGFya10gLmxhbmctcGlja2VyLWJ0bixcbmJvZHkuZGFyay10aGVtZSAubGFuZy1waWNrZXItYnRuIHtcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQgIWltcG9ydGFudDtcbiAgYm9yZGVyLWNvbG9yOiB2YXIoLS1ib3JkZXItcHJpbWFyeSwgIzQ4NWM2YikgIWltcG9ydGFudDtcbiAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSwgI2ZmZmZmZikgIWltcG9ydGFudDtcbn1cblxuaHRtbC5kYXJrLXRoZW1lIC5sYW5nLXBpY2tlci1idG46aG92ZXIsXG5odG1sW2RhdGEtdGhlbWU9ZGFya10gLmxhbmctcGlja2VyLWJ0bjpob3ZlcixcbmJvZHkuZGFyay10aGVtZSAubGFuZy1waWNrZXItYnRuOmhvdmVyIHtcbiAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpICFpbXBvcnRhbnQ7XG4gIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjQpICFpbXBvcnRhbnQ7XG59XG5cbmh0bWwuZGFyay10aGVtZSAudGhlbWUtcGlja2VyLWJ0bixcbmh0bWxbZGF0YS10aGVtZT1kYXJrXSAudGhlbWUtcGlja2VyLWJ0bixcbmJvZHkuZGFyay10aGVtZSAudGhlbWUtcGlja2VyLWJ0biB7XG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50ICFpbXBvcnRhbnQ7XG4gIGJvcmRlci1jb2xvcjogdmFyKC0tYm9yZGVyLXByaW1hcnksICM0ODVjNmIpICFpbXBvcnRhbnQ7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICNmZmZmZmYpICFpbXBvcnRhbnQ7XG59XG5cbmh0bWwuZGFyay10aGVtZSAudGhlbWUtcGlja2VyLWJ0bjpob3Zlcixcbmh0bWxbZGF0YS10aGVtZT1kYXJrXSAudGhlbWUtcGlja2VyLWJ0bjpob3ZlcixcbmJvZHkuZGFyay10aGVtZSAudGhlbWUtcGlja2VyLWJ0bjpob3ZlciB7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSAhaW1wb3J0YW50O1xuICBib3JkZXItY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC40KSAhaW1wb3J0YW50O1xufVxuXG5odG1sLmRhcmstdGhlbWUgLmxhbmctbWVudS1wb3B1cCxcbmh0bWxbZGF0YS10aGVtZT1kYXJrXSAubGFuZy1tZW51LXBvcHVwLFxuYm9keS5kYXJrLXRoZW1lIC5sYW5nLW1lbnUtcG9wdXAge1xuICBiYWNrZ3JvdW5kOiAjMWUyOTNiICFpbXBvcnRhbnQ7XG4gIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpICFpbXBvcnRhbnQ7XG59XG5cbmh0bWwuZGFyay10aGVtZSAubGFuZy1tZW51LWNob2ljZSxcbmh0bWxbZGF0YS10aGVtZT1kYXJrXSAubGFuZy1tZW51LWNob2ljZSxcbmJvZHkuZGFyay10aGVtZSAubGFuZy1tZW51LWNob2ljZSB7XG4gIGJhY2tncm91bmQ6ICMxZTI5M2IgIWltcG9ydGFudDtcbiAgY29sb3I6ICNmZmZmZmYgIWltcG9ydGFudDtcbn1cblxuaHRtbC5kYXJrLXRoZW1lIC5sYW5nLW1lbnUtY2hvaWNlOmhvdmVyLFxuaHRtbFtkYXRhLXRoZW1lPWRhcmtdIC5sYW5nLW1lbnUtY2hvaWNlOmhvdmVyLFxuYm9keS5kYXJrLXRoZW1lIC5sYW5nLW1lbnUtY2hvaWNlOmhvdmVyIHtcbiAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpICFpbXBvcnRhbnQ7XG4gIGNvbG9yOiAjZmZmZmZmICFpbXBvcnRhbnQ7XG59XG5cbmh0bWwuZGFyay10aGVtZSAubGFuZy1tZW51LWNob2ljZS5hY3RpdmUsXG5odG1sW2RhdGEtdGhlbWU9ZGFya10gLmxhbmctbWVudS1jaG9pY2UuYWN0aXZlLFxuYm9keS5kYXJrLXRoZW1lIC5sYW5nLW1lbnUtY2hvaWNlLmFjdGl2ZSB7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xNSkgIWltcG9ydGFudDtcbiAgY29sb3I6ICNmZmZmZmYgIWltcG9ydGFudDtcbn1cblxuLyogPT09PT0gQ09OVEFJTkVSIFFVRVJJRVMgRkFMTEJBQ0sgPT09PT0gKi9cbkBjb250YWluZXIgbG9jYWxpemF0aW9uLXdpZGdldCAobWF4LXdpZHRoOiA0MDBweCkge1xuICAubG9jLXdpZGdldC1yb290IHtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xuICB9XG4gIC5oZWFkZXItdGl0bGUtbGFyZ2Uge1xuICAgIGZvbnQtc2l6ZTogMThweDtcbiAgfVxuICAuaGVhZGVyLXRpdGxlLXNtYWxsIHtcbiAgICBmb250LXNpemU6IDEycHg7XG4gIH1cbiAgLmNvbnRyb2xzLXNlY3Rpb24ge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIH1cbiAgLmxhbmd1YWdlLXNlbGVjdG9yLXdyYXAsXG4gIC50aGVtZS1zZWxlY3Rvci13cmFwIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgfVxuICAubGFuZy1waWNrZXItYnRuLFxuICAudGhlbWUtcGlja2VyLWJ0biB7XG4gICAgd2lkdGg6IDEwMCU7XG4gIH1cbn1cbkBjb250YWluZXIgbG9jYWxpemF0aW9uLXdpZGdldCAobWF4LWhlaWdodDogNTBweCkge1xuICAuaGVhZGVyLXRpdGxlLWxhcmdlIHtcbiAgICBmb250LXNpemU6IDE2cHg7XG4gIH1cbiAgLmhlYWRlci10aXRsZS1zbWFsbCB7XG4gICAgZm9udC1zaXplOiAxMXB4O1xuICB9XG4gIC5sYW5ndWFnZS1zZWxlY3Rvci13cmFwLFxuICAudGhlbWUtc2VsZWN0b3Itd3JhcCB7XG4gICAgZmxleDogMTtcbiAgfVxuICAubGFuZy1waWNrZXItYnRuLFxuICAudGhlbWUtcGlja2VyLWJ0biB7XG4gICAgbWluLWhlaWdodDogMThweDtcbiAgICBwYWRkaW5nOiAycHggOHB4O1xuICAgIGdhcDogNHB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDIwcHg7XG4gIH1cbiAgLmdsb2JlLWljb24sXG4gIC50aGVtZS1pY29uIHtcbiAgICB3aWR0aDogMTJweDtcbiAgICBoZWlnaHQ6IDEycHg7XG4gIH1cbiAgLmxhbmctdGV4dCxcbiAgLnRoZW1lLXRleHQge1xuICAgIGZvbnQtc2l6ZTogOXB4O1xuICB9XG4gIC5jaGV2cm9uLWljb24ge1xuICAgIHdpZHRoOiAxMHB4O1xuICAgIGhlaWdodDogMTBweDtcbiAgfVxufVxuQGNvbnRhaW5lciBsb2NhbGl6YXRpb24td2lkZ2V0IChtaW4taGVpZ2h0OiA1MXB4KSBhbmQgKG1heC1oZWlnaHQ6IDgwcHgpIHtcbiAgLmxhbmctcGlja2VyLWJ0bixcbiAgLnRoZW1lLXBpY2tlci1idG4ge1xuICAgIG1pbi1oZWlnaHQ6IDI0cHg7XG4gICAgcGFkZGluZzogNHB4IDEwcHg7XG4gICAgZ2FwOiA1cHg7XG4gIH1cbiAgLmdsb2JlLWljb24sXG4gIC50aGVtZS1pY29uIHtcbiAgICB3aWR0aDogMTZweDtcbiAgICBoZWlnaHQ6IDE2cHg7XG4gIH1cbiAgLmxhbmctdGV4dCxcbiAgLnRoZW1lLXRleHQge1xuICAgIGZvbnQtc2l6ZTogMTFweDtcbiAgfVxufVxuQGNvbnRhaW5lciBsb2NhbGl6YXRpb24td2lkZ2V0IChtaW4taGVpZ2h0OiA4MXB4KSBhbmQgKG1heC1oZWlnaHQ6IDEyMHB4KSB7XG4gIC5sYW5nLXBpY2tlci1idG4sXG4gIC50aGVtZS1waWNrZXItYnRuIHtcbiAgICBtaW4taGVpZ2h0OiAzMnB4O1xuICAgIHBhZGRpbmc6IDZweCAxNHB4O1xuICAgIGdhcDogNnB4O1xuICB9XG4gIC5nbG9iZS1pY29uLFxuICAudGhlbWUtaWNvbiB7XG4gICAgd2lkdGg6IDIwcHg7XG4gICAgaGVpZ2h0OiAyMHB4O1xuICB9XG4gIC5sYW5nLXRleHQsXG4gIC50aGVtZS10ZXh0IHtcbiAgICBmb250LXNpemU6IDEzcHg7XG4gIH1cbn1cbkBjb250YWluZXIgbG9jYWxpemF0aW9uLXdpZGdldCAobWluLWhlaWdodDogMTIxcHgpIGFuZCAobWF4LWhlaWdodDogMTgwcHgpIHtcbiAgLmxhbmctcGlja2VyLWJ0bixcbiAgLnRoZW1lLXBpY2tlci1idG4ge1xuICAgIG1pbi1oZWlnaHQ6IDQycHg7XG4gICAgcGFkZGluZzogOHB4IDIwcHg7XG4gICAgZ2FwOiAxMHB4O1xuICB9XG4gIC5nbG9iZS1pY29uLFxuICAudGhlbWUtaWNvbiB7XG4gICAgd2lkdGg6IDI2cHg7XG4gICAgaGVpZ2h0OiAyNnB4O1xuICB9XG4gIC5sYW5nLXRleHQsXG4gIC50aGVtZS10ZXh0IHtcbiAgICBmb250LXNpemU6IDE2cHg7XG4gIH1cbn1cbkBjb250YWluZXIgbG9jYWxpemF0aW9uLXdpZGdldCAobWluLWhlaWdodDogMTgxcHgpIHtcbiAgLmxhbmctcGlja2VyLWJ0bixcbiAgLnRoZW1lLXBpY2tlci1idG4ge1xuICAgIG1pbi1oZWlnaHQ6IDU2cHg7XG4gICAgcGFkZGluZzogMTJweCAyOHB4O1xuICAgIGdhcDogMTRweDtcbiAgfVxuICAuZ2xvYmUtaWNvbixcbiAgLnRoZW1lLWljb24ge1xuICAgIHdpZHRoOiAzMnB4O1xuICAgIGhlaWdodDogMzJweDtcbiAgfVxuICAubGFuZy10ZXh0LFxuICAudGhlbWUtdGV4dCB7XG4gICAgZm9udC1zaXplOiAyMHB4O1xuICB9XG59XG4vKiA9PT09PSBBQ0NFU1NJQklMSVRZID09PT09ICovXG5AbWVkaWEgKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSkge1xuICAqIHtcbiAgICB0cmFuc2l0aW9uOiBub25lICFpbXBvcnRhbnQ7XG4gICAgYW5pbWF0aW9uOiBub25lICFpbXBvcnRhbnQ7XG4gIH1cbiAgLmxhbmctcGlja2VyLWJ0bjpob3ZlcixcbiAgLnRoZW1lLXBpY2tlci1idG46aG92ZXIge1xuICAgIHRyYW5zZm9ybTogbm9uZSAhaW1wb3J0YW50O1xuICB9XG59YCwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9Mb2NhbGl6YXRpb25XaWRnZXRWMjAvc3JjL3J1bnRpbWUvd2lkZ2V0LmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQSx1REFBQTtBQUNBLG1FQUFBO0FBRUEsMkNBQUE7QUFDQTtFQUNFLDRCQUFBO0VBQ0EsOEJBQUE7RUFDQSw2QkFBQTtFQUNBLHVCQUFBO0VBQ0EseUJBQUE7RUFDQSx5QkFBQTtBQUFGOztBQUdBO0VBQ0UsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsbUJBQUE7RUFDQSw4QkFBQTtFQUNBLFNBQUE7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QWxDRjtFQW9DQTs7SUFFRSxXQUFBO0lBQ0EsWUFBQTtFQWxDRjtFQW9DQTs7SUFFRSxlQUFBO0VBbENGO0FBQ0Y7QUFxQ0E7RUFDRTs7SUFFRSxnQkFBQTtJQUNBLGtCQUFBO0lBQ0EsU0FBQTtFQW5DRjtFQXFDQTs7SUFFRSxXQUFBO0lBQ0EsWUFBQTtFQW5DRjtFQXFDQTs7SUFFRSxlQUFBO0VBbkNGO0FBQ0Y7QUFzQ0EsOEJBQUE7QUFDQTtFQUNFO0lBQ0UsMkJBQUE7SUFDQSwwQkFBQTtFQXBDRjtFQXNDQTs7SUFFRSwwQkFBQTtFQXBDRjtBQUNGXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIi8qID09PT09IERZTkFNSUMgUkVTUE9OU0lWRSBMT0NBTElaQVRJT04gV0lER0VUID09PT09ICovXFxuLyogRGVzaWduIG1hdGNoaW5nIHRoZSBpbWFnZSAtIEdsb2JlIGljb24sIExhbmd1YWdlIHRleHQsIENoZXZyb24gKi9cXG5cXG4vKiBDU1MgVmFyaWFibGVzIC0gbWF0Y2hpbmcgb3RoZXIgd2lkZ2V0cyAqL1xcbjpyb290IHtcXG4gIC0td2lkZ2V0LWJnLXByaW1hcnk6ICMyYzNlNTA7XFxuICAtLXdpZGdldC1iZy1zZWNvbmRhcnk6ICMzNDQ5NWU7XFxuICAtLXdpZGdldC1iZy10ZXJ0aWFyeTogIzNhNGE1YztcXG4gIC0tdGV4dC1wcmltYXJ5OiAjZmZmZmZmO1xcbiAgLS10ZXh0LXNlY29uZGFyeTogI2JkYzNjNztcXG4gIC0tYm9yZGVyLXByaW1hcnk6ICM0ODVjNmI7XFxufVxcblxcbi5sb2Mtd2lkZ2V0LXJvb3Qge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiByb3c7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgZ2FwOiAxNnB4O1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgcGFkZGluZzogMTJweCAxNnB4O1xcbiAgbWluLWhlaWdodDogYXV0bztcXG4gIGNvbnRhaW5lci10eXBlOiBzaXplO1xcbiAgY29udGFpbmVyLW5hbWU6IGxvY2FsaXphdGlvbi13aWRnZXQ7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgYmFja2dyb3VuZDogdmFyKC0td2lkZ2V0LWJnLXByaW1hcnksICMyYzNlNTApO1xcbiAgYm9yZGVyLXJhZGl1czogOHB4O1xcbiAgdHJhbnNpdGlvbjogYmFja2dyb3VuZC1jb2xvciAwLjNzIGVhc2U7XFxufVxcblxcbi8qIEhlYWRlciBUZXh0IFNlY3Rpb24gLSBMZWZ0IFNpZGUgKi9cXG4uaGVhZGVyLXRleHQtc2VjdGlvbiB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIGdhcDogNHB4O1xcbiAgZmxleDogMTtcXG4gIG1pbi13aWR0aDogMDtcXG59XFxuXFxuLmhlYWRlci10aXRsZS1sYXJnZSB7XFxuICBtYXJnaW46IDA7XFxuICBmb250LXNpemU6IDI0cHg7XFxuICBmb250LXdlaWdodDogNzAwO1xcbiAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSwgI2ZmZmZmZik7XFxuICBsZXR0ZXItc3BhY2luZzogMC4wMmVtO1xcbiAgbGluZS1oZWlnaHQ6IDEuMjtcXG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XFxuICB0cmFuc2l0aW9uOiBjb2xvciAwLjNzIGVhc2U7XFxufVxcblxcbi5oZWFkZXItdGl0bGUtc21hbGwge1xcbiAgbWFyZ2luOiAwO1xcbiAgZm9udC1zaXplOiAxNHB4O1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSwgI2JkYzNjNyk7XFxuICBsZXR0ZXItc3BhY2luZzogMC4wMWVtO1xcbiAgbGluZS1oZWlnaHQ6IDEuMztcXG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XFxuICB0cmFuc2l0aW9uOiBjb2xvciAwLjNzIGVhc2U7XFxufVxcblxcbi8qIENvbnRyb2xzIFNlY3Rpb24gLSBSaWdodCBTaWRlICovXFxuLmNvbnRyb2xzLXNlY3Rpb24ge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBhbGlnbi1pdGVtczogZmxleC1lbmQ7XFxuICBnYXA6IDhweDtcXG4gIGZsZXgtc2hyaW5rOiAwO1xcbiAgbWluLXdpZHRoOiAwO1xcbn1cXG5cXG4vKiA9PT09PSBMQU5HVUFHRSBTRUxFQ1RPUiAtIE1hdGNoaW5nIEltYWdlIERlc2lnbiA9PT09PSAqL1xcbi5sYW5ndWFnZS1zZWxlY3Rvci13cmFwIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiBhdXRvO1xcbiAgbWluLXdpZHRoOiAxMDBweDtcXG4gIGZsZXgtc2hyaW5rOiAwO1xcbiAgZGlzcGxheTogZmxleDtcXG59XFxuXFxuLmxhbmctcGlja2VyLWJ0biB7XFxuICB3aWR0aDogYXV0bztcXG4gIG1pbi13aWR0aDogMTAwcHg7XFxuICBoZWlnaHQ6IGF1dG87XFxuICBtaW4taGVpZ2h0OiAzNnB4O1xcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XFxuICBib3JkZXI6IDJweCBzb2xpZCB2YXIoLS1ib3JkZXItcHJpbWFyeSwgIzQ4NWM2Yik7XFxuICBib3JkZXItcmFkaXVzOiA1MHB4O1xcbiAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSwgI2ZmZmZmZik7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBvdXRsaW5lOiBub25lO1xcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBnYXA6IDZweDtcXG4gIHBhZGRpbmc6IDZweCAxNHB4O1xcbiAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXFxcIlNlZ29lIFVJXFxcIiwgUm9ib3RvLCBBcmlhbCxcXG4gICAgc2Fucy1zZXJpZjtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxufVxcblxcbi5sYW5nLXBpY2tlci1idG46aG92ZXIge1xcbiAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xcbiAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNCk7XFxuICB0cmFuc2Zvcm06IHNjYWxlKDEuMDIpO1xcbn1cXG5cXG4ubGFuZy1waWNrZXItYnRuLmFjdGl2ZSB7XFxuICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTUpO1xcbiAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNSk7XFxuICBib3gtc2hhZG93OiAwIDAgMCAycHggcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xcbn1cXG5cXG4vKiBHbG9iZSBJY29uICovXFxuLmdsb2JlLWljb24ge1xcbiAgd2lkdGg6IDE4cHg7XFxuICBoZWlnaHQ6IDE4cHg7XFxuICBmbGV4LXNocmluazogMDtcXG4gIHN0cm9rZTogY3VycmVudENvbG9yO1xcbn1cXG5cXG4vKiBMYW5ndWFnZSBUZXh0ICovXFxuLmxhbmctdGV4dCB7XFxuICBmb250LXNpemU6IDE0cHg7XFxuICBmb250LXdlaWdodDogNTAwO1xcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcXG4gIGZsZXgtc2hyaW5rOiAwO1xcbn1cXG5cXG4vKiBDaGV2cm9uIEljb24gKi9cXG4uY2hldnJvbi1pY29uIHtcXG4gIHdpZHRoOiAxNHB4O1xcbiAgaGVpZ2h0OiAxNHB4O1xcbiAgZmxleC1zaHJpbms6IDA7XFxuICBzdHJva2U6IGN1cnJlbnRDb2xvcjtcXG4gIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjJzIGVhc2U7XFxufVxcblxcbi5sYW5nLXBpY2tlci1idG4uYWN0aXZlIC5jaGV2cm9uLWljb24ge1xcbiAgdHJhbnNmb3JtOiByb3RhdGUoMTgwZGVnKTtcXG59XFxuXFxuLyogPT09PT0gVEhFTUUgU0VMRUNUT1IgLSBTYW1lIERlc2lnbiA9PT09PSAqL1xcbi50aGVtZS1zZWxlY3Rvci13cmFwIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiBhdXRvO1xcbiAgbWluLXdpZHRoOiAxMDBweDtcXG4gIGZsZXgtc2hyaW5rOiAwO1xcbiAgZGlzcGxheTogZmxleDtcXG59XFxuXFxuLnRoZW1lLXBpY2tlci1idG4ge1xcbiAgd2lkdGg6IGF1dG87XFxuICBtaW4td2lkdGg6IDEwMHB4O1xcbiAgaGVpZ2h0OiBhdXRvO1xcbiAgbWluLWhlaWdodDogMzZweDtcXG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xcbiAgYm9yZGVyOiAycHggc29saWQgdmFyKC0tYm9yZGVyLXByaW1hcnksICM0ODVjNmIpO1xcbiAgYm9yZGVyLXJhZGl1czogNTBweDtcXG4gIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICNmZmZmZmYpO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgb3V0bGluZTogbm9uZTtcXG4gIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgZ2FwOiA2cHg7XFxuICBwYWRkaW5nOiA2cHggMTRweDtcXG4gIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIFxcXCJTZWdvZSBVSVxcXCIsIFJvYm90bywgQXJpYWwsXFxuICAgIHNhbnMtc2VyaWY7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbn1cXG5cXG4udGhlbWUtcGlja2VyLWJ0bi5kYXJrIHtcXG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xcbiAgYm9yZGVyLWNvbG9yOiB2YXIoLS1ib3JkZXItcHJpbWFyeSwgIzQ4NWM2Yik7XFxuICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjZmZmZmZmKTtcXG59XFxuXFxuLnRoZW1lLXBpY2tlci1idG4ubGlnaHQge1xcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XFxuICBib3JkZXItY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4yKTtcXG4gIGNvbG9yOiAjMDAwMDAwO1xcbn1cXG5cXG4udGhlbWUtcGlja2VyLWJ0bjpob3ZlciB7XFxuICB0cmFuc2Zvcm06IHNjYWxlKDEuMDIpO1xcbiAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNCk7XFxuICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSk7XFxufVxcblxcbi50aGVtZS1waWNrZXItYnRuLmRhcms6aG92ZXIge1xcbiAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xcbiAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNCk7XFxufVxcblxcbi50aGVtZS1waWNrZXItYnRuLmxpZ2h0OmhvdmVyIHtcXG4gIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4wNSk7XFxuICBib3JkZXItY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4zKTtcXG59XFxuXFxuLyogVGhlbWUgSWNvbiAqL1xcbi50aGVtZS1pY29uIHtcXG4gIHdpZHRoOiAxOHB4O1xcbiAgaGVpZ2h0OiAxOHB4O1xcbiAgZmxleC1zaHJpbms6IDA7XFxufVxcblxcbi8qIFRoZW1lIFRleHQgKi9cXG4udGhlbWUtdGV4dCB7XFxuICBmb250LXNpemU6IDE0cHg7XFxuICBmb250LXdlaWdodDogNTAwO1xcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcXG4gIGZsZXgtc2hyaW5rOiAwO1xcbn1cXG5cXG4vKiA9PT09PSBEUk9QRE9XTiBNRU5VID09PT09ICovXFxuLmxhbmctbWVudS1wb3B1cCB7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBiYWNrZ3JvdW5kOiAjMWUyOTNiO1xcbiAgYm9yZGVyOiAycHggc29saWQgIzM4YmRmODtcXG4gIGJvcmRlci1yYWRpdXM6IDEycHg7XFxuICBib3gtc2hhZG93OiAwIDhweCAyNHB4IHJnYmEoMCwgMCwgMCwgMC40KTtcXG4gIHotaW5kZXg6IDk5OTk5OTtcXG4gIG1pbi13aWR0aDogMTQwcHg7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgbWFyZ2luLXRvcDogNHB4O1xcbn1cXG5cXG4ubGFuZy1tZW51LWNob2ljZSB7XFxuICBwYWRkaW5nOiAxMHB4IDE0cHg7XFxuICBmb250LXNpemU6IDE0cHg7XFxuICBmb250LXdlaWdodDogNTAwO1xcbiAgY29sb3I6ICNmMWY1Zjk7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICB0cmFuc2l0aW9uOiBhbGwgMC4xNXMgZWFzZTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgYmFja2dyb3VuZDogIzFlMjkzYjtcXG59XFxuXFxuLmxhbmctbWVudS1jaG9pY2U6aG92ZXIge1xcbiAgYmFja2dyb3VuZDogIzBmMTcyYTtcXG4gIGNvbG9yOiAjMzhiZGY4O1xcbn1cXG5cXG4ubGFuZy1tZW51LWNob2ljZS5hY3RpdmUge1xcbiAgYmFja2dyb3VuZDogIzBmMTcyYTtcXG4gIGNvbG9yOiAjMzhiZGY4O1xcbn1cXG5cXG4ubGFuZy1vcHRpb24tY29udGVudCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGdhcDogOHB4O1xcbn1cXG5cXG4ubGFuZy1vcHRpb24tZmxhZyB7XFxuICBmb250LXNpemU6IDE4cHg7XFxufVxcblxcbi5sYW5nLW9wdGlvbi10ZXh0IHtcXG4gIGZvbnQtc2l6ZTogMTRweDtcXG4gIGZvbnQtd2VpZ2h0OiA1MDA7XFxufVxcblxcbi5jaGVja21hcmsge1xcbiAgY29sb3I6ICMzOGJkZjg7XFxuICBmb250LXdlaWdodDogNzAwO1xcbiAgZm9udC1zaXplOiAxNHB4O1xcbn1cXG5cXG4vKiA9PT09PSBSRVNQT05TSVZFIExBWU9VVCA9PT09PSAqL1xcbkBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xcbiAgLmxvYy13aWRnZXQtcm9vdCB7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGdhcDogMTJweDtcXG4gICAgcGFkZGluZzogMTBweCAxMnB4O1xcbiAgfVxcblxcbiAgLmhlYWRlci10ZXh0LXNlY3Rpb24ge1xcbiAgICBmbGV4OiAxO1xcbiAgICBnYXA6IDNweDtcXG4gICAgbWluLXdpZHRoOiAwO1xcbiAgfVxcblxcbiAgLmhlYWRlci10aXRsZS1sYXJnZSB7XFxuICAgIGZvbnQtc2l6ZTogMjBweDtcXG4gIH1cXG5cXG4gIC5oZWFkZXItdGl0bGUtc21hbGwge1xcbiAgICBmb250LXNpemU6IDEzcHg7XFxuICB9XFxuXFxuICAuY29udHJvbHMtc2VjdGlvbiB7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LWVuZDtcXG4gICAgZ2FwOiA2cHg7XFxuICAgIGZsZXgtc2hyaW5rOiAwO1xcbiAgfVxcblxcbiAgLmxhbmd1YWdlLXNlbGVjdG9yLXdyYXAsXFxuICAudGhlbWUtc2VsZWN0b3Itd3JhcCB7XFxuICAgIG1pbi13aWR0aDogOTBweDtcXG4gIH1cXG5cXG4gIC5sYW5nLXBpY2tlci1idG4sXFxuICAudGhlbWUtcGlja2VyLWJ0biB7XFxuICAgIG1pbi13aWR0aDogOTBweDtcXG4gICAgcGFkZGluZzogNXB4IDEycHg7XFxuICAgIGdhcDogNXB4O1xcbiAgfVxcblxcbiAgLmdsb2JlLWljb24sXFxuICAudGhlbWUtaWNvbiB7XFxuICAgIHdpZHRoOiAxNnB4O1xcbiAgICBoZWlnaHQ6IDE2cHg7XFxuICB9XFxuXFxuICAubGFuZy10ZXh0LFxcbiAgLnRoZW1lLXRleHQge1xcbiAgICBmb250LXNpemU6IDEycHg7XFxuICB9XFxuXFxuICAuY2hldnJvbi1pY29uIHtcXG4gICAgd2lkdGg6IDEycHg7XFxuICAgIGhlaWdodDogMTJweDtcXG4gIH1cXG59XFxuXFxuQG1lZGlhIChtYXgtd2lkdGg6IDQ4MHB4KSB7XFxuICAubG9jLXdpZGdldC1yb290IHtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XFxuICAgIHBhZGRpbmc6IDhweCAxMHB4O1xcbiAgICBnYXA6IDEwcHg7XFxuICB9XFxuXFxuICAuaGVhZGVyLXRleHQtc2VjdGlvbiB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBnYXA6IDJweDtcXG4gIH1cXG5cXG4gIC5oZWFkZXItdGl0bGUtbGFyZ2Uge1xcbiAgICBmb250LXNpemU6IDE4cHg7XFxuICB9XFxuXFxuICAuaGVhZGVyLXRpdGxlLXNtYWxsIHtcXG4gICAgZm9udC1zaXplOiAxMnB4O1xcbiAgfVxcblxcbiAgLmNvbnRyb2xzLXNlY3Rpb24ge1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgYWxpZ24taXRlbXM6IHN0cmV0Y2g7XFxuICAgIGdhcDogNnB4O1xcbiAgfVxcblxcbiAgLmxhbmd1YWdlLXNlbGVjdG9yLXdyYXAsXFxuICAudGhlbWUtc2VsZWN0b3Itd3JhcCB7XFxuICAgIGZsZXg6IDE7XFxuICAgIG1pbi13aWR0aDogMDtcXG4gIH1cXG5cXG4gIC5sYW5nLXBpY2tlci1idG4sXFxuICAudGhlbWUtcGlja2VyLWJ0biB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBtaW4td2lkdGg6IDA7XFxuICAgIG1pbi1oZWlnaHQ6IDMycHg7XFxuICAgIHBhZGRpbmc6IDVweCAxMHB4O1xcbiAgICBnYXA6IDVweDtcXG4gIH1cXG5cXG4gIC5nbG9iZS1pY29uLFxcbiAgLnRoZW1lLWljb24ge1xcbiAgICB3aWR0aDogMTZweDtcXG4gICAgaGVpZ2h0OiAxNnB4O1xcbiAgfVxcblxcbiAgLmxhbmctdGV4dCxcXG4gIC50aGVtZS10ZXh0IHtcXG4gICAgZm9udC1zaXplOiAxMnB4O1xcbiAgfVxcblxcbiAgLmNoZXZyb24taWNvbiB7XFxuICAgIHdpZHRoOiAxMnB4O1xcbiAgICBoZWlnaHQ6IDEycHg7XFxuICB9XFxufVxcblxcbi8qID09PT09IFNJWkUgQ0xBU1NFUyAtIER5bmFtaWMgUmVzcG9uc2l2ZSA9PT09PSAqL1xcblxcbi8qIEV4dHJhIFNtYWxsICg8IDUwcHggaGVpZ2h0KSAqL1xcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS14cyB7XFxuICBnYXA6IDNweDtcXG4gIHBhZGRpbmc6IDNweDtcXG59XFxuXFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXhzIC5sYW5nLXBpY2tlci1idG4sXFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXhzIC50aGVtZS1waWNrZXItYnRuIHtcXG4gIG1pbi1oZWlnaHQ6IDE4cHg7XFxuICBwYWRkaW5nOiAycHggOHB4O1xcbiAgZ2FwOiA0cHg7XFxuICBib3JkZXItcmFkaXVzOiAyMHB4O1xcbiAgYm9yZGVyLXdpZHRoOiAxcHg7XFxufVxcblxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS14cyAuZ2xvYmUtaWNvbixcXG4ubG9jLXdpZGdldC1yb290LnNpemUteHMgLnRoZW1lLWljb24ge1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxufVxcblxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS14cyAubGFuZy10ZXh0LFxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS14cyAudGhlbWUtdGV4dCB7XFxuICBmb250LXNpemU6IDlweDtcXG59XFxuXFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXhzIC5jaGV2cm9uLWljb24ge1xcbiAgd2lkdGg6IDEwcHg7XFxuICBoZWlnaHQ6IDEwcHg7XFxufVxcblxcbi8qIFNtYWxsICg1MHB4IC0gODBweCBoZWlnaHQpICovXFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXNtIHtcXG4gIGdhcDogNHB4O1xcbiAgcGFkZGluZzogNHB4O1xcbn1cXG5cXG4ubG9jLXdpZGdldC1yb290LnNpemUtc20gLmxhbmctcGlja2VyLWJ0bixcXG4ubG9jLXdpZGdldC1yb290LnNpemUtc20gLnRoZW1lLXBpY2tlci1idG4ge1xcbiAgbWluLWhlaWdodDogMjRweDtcXG4gIHBhZGRpbmc6IDRweCAxMHB4O1xcbiAgZ2FwOiA1cHg7XFxuICBib3JkZXItcmFkaXVzOiAyNXB4O1xcbiAgYm9yZGVyLXdpZHRoOiAxLjVweDtcXG59XFxuXFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXNtIC5nbG9iZS1pY29uLFxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1zbSAudGhlbWUtaWNvbiB7XFxuICB3aWR0aDogMTZweDtcXG4gIGhlaWdodDogMTZweDtcXG59XFxuXFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXNtIC5sYW5nLXRleHQsXFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXNtIC50aGVtZS10ZXh0IHtcXG4gIGZvbnQtc2l6ZTogMTFweDtcXG59XFxuXFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXNtIC5jaGV2cm9uLWljb24ge1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxufVxcblxcbi8qIE1lZGl1bSAoODBweCAtIDEyMHB4IGhlaWdodCkgKi9cXG4ubG9jLXdpZGdldC1yb290LnNpemUtbWQge1xcbiAgZ2FwOiA2cHg7XFxuICBwYWRkaW5nOiA2cHg7XFxufVxcblxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1tZCAubGFuZy1waWNrZXItYnRuLFxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1tZCAudGhlbWUtcGlja2VyLWJ0biB7XFxuICBtaW4taGVpZ2h0OiAzMnB4O1xcbiAgcGFkZGluZzogNnB4IDE0cHg7XFxuICBnYXA6IDZweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMwcHg7XFxuICBib3JkZXItd2lkdGg6IDJweDtcXG59XFxuXFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLW1kIC5nbG9iZS1pY29uLFxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1tZCAudGhlbWUtaWNvbiB7XFxuICB3aWR0aDogMjBweDtcXG4gIGhlaWdodDogMjBweDtcXG59XFxuXFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLW1kIC5sYW5nLXRleHQsXFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLW1kIC50aGVtZS10ZXh0IHtcXG4gIGZvbnQtc2l6ZTogMTNweDtcXG59XFxuXFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLW1kIC5jaGV2cm9uLWljb24ge1xcbiAgd2lkdGg6IDE0cHg7XFxuICBoZWlnaHQ6IDE0cHg7XFxufVxcblxcbi8qIExhcmdlICgxMjBweCAtIDE4MHB4IGhlaWdodCkgKi9cXG4ubG9jLXdpZGdldC1yb290LnNpemUtbGcge1xcbiAgZ2FwOiA4cHg7XFxuICBwYWRkaW5nOiA4cHg7XFxufVxcblxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1sZyAubGFuZy1waWNrZXItYnRuLFxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1sZyAudGhlbWUtcGlja2VyLWJ0biB7XFxuICBtaW4taGVpZ2h0OiA0MnB4O1xcbiAgcGFkZGluZzogOHB4IDIwcHg7XFxuICBnYXA6IDEwcHg7XFxuICBib3JkZXItcmFkaXVzOiA0MHB4O1xcbiAgYm9yZGVyLXdpZHRoOiAycHg7XFxufVxcblxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1sZyAuZ2xvYmUtaWNvbixcXG4ubG9jLXdpZGdldC1yb290LnNpemUtbGcgLnRoZW1lLWljb24ge1xcbiAgd2lkdGg6IDI2cHg7XFxuICBoZWlnaHQ6IDI2cHg7XFxufVxcblxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1sZyAubGFuZy10ZXh0LFxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1sZyAudGhlbWUtdGV4dCB7XFxuICBmb250LXNpemU6IDE2cHg7XFxufVxcblxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS1sZyAuY2hldnJvbi1pY29uIHtcXG4gIHdpZHRoOiAxOHB4O1xcbiAgaGVpZ2h0OiAxOHB4O1xcbn1cXG5cXG4vKiBFeHRyYSBMYXJnZSAoPiAxODBweCBoZWlnaHQpICovXFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXhsIHtcXG4gIGdhcDogMTJweDtcXG4gIHBhZGRpbmc6IDEycHg7XFxufVxcblxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS14bCAubGFuZy1waWNrZXItYnRuLFxcbi5sb2Mtd2lkZ2V0LXJvb3Quc2l6ZS14bCAudGhlbWUtcGlja2VyLWJ0biB7XFxuICBtaW4taGVpZ2h0OiA1NnB4O1xcbiAgcGFkZGluZzogMTJweCAyOHB4O1xcbiAgZ2FwOiAxNHB4O1xcbiAgYm9yZGVyLXJhZGl1czogNTBweDtcXG4gIGJvcmRlci13aWR0aDogM3B4O1xcbn1cXG5cXG4ubG9jLXdpZGdldC1yb290LnNpemUteGwgLmdsb2JlLWljb24sXFxuLmxvYy13aWRnZXQtcm9vdC5zaXplLXhsIC50aGVtZS1pY29uIHtcXG4gIHdpZHRoOiAzMnB4O1xcbiAgaGVpZ2h0OiAzMnB4O1xcbn1cXG5cXG4ubG9jLXdpZGdldC1yb290LnNpemUteGwgLmxhbmctdGV4dCxcXG4ubG9jLXdpZGdldC1yb290LnNpemUteGwgLnRoZW1lLXRleHQge1xcbiAgZm9udC1zaXplOiAyMHB4O1xcbn1cXG5cXG4ubG9jLXdpZGdldC1yb290LnNpemUteGwgLmNoZXZyb24taWNvbiB7XFxuICB3aWR0aDogMjJweDtcXG4gIGhlaWdodDogMjJweDtcXG59XFxuXFxuLyogPT09PT0gTElHSFQgVEhFTUUgLSBXaGl0ZSBiYWNrZ3JvdW5kLCBibGFjayB0ZXh0ID09PT09ICovXFxuaHRtbC5saWdodC10aGVtZSAubG9jLXdpZGdldC1yb290LFxcbmh0bWxbZGF0YS10aGVtZT1cXFwibGlnaHRcXFwiXSAubG9jLXdpZGdldC1yb290LFxcbmJvZHkubGlnaHQtdGhlbWUgLmxvYy13aWRnZXQtcm9vdCB7XFxuICBiYWNrZ3JvdW5kOiAjZjVmN2ZhICFpbXBvcnRhbnQ7XFxufVxcblxcbmh0bWwubGlnaHQtdGhlbWUgLmhlYWRlci10aXRsZS1sYXJnZSxcXG5odG1sW2RhdGEtdGhlbWU9XFxcImxpZ2h0XFxcIl0gLmhlYWRlci10aXRsZS1sYXJnZSxcXG5ib2R5LmxpZ2h0LXRoZW1lIC5oZWFkZXItdGl0bGUtbGFyZ2Uge1xcbiAgY29sb3I6ICMwMDAwMDAgIWltcG9ydGFudDtcXG59XFxuXFxuaHRtbC5saWdodC10aGVtZSAuaGVhZGVyLXRpdGxlLXNtYWxsLFxcbmh0bWxbZGF0YS10aGVtZT1cXFwibGlnaHRcXFwiXSAuaGVhZGVyLXRpdGxlLXNtYWxsLFxcbmJvZHkubGlnaHQtdGhlbWUgLmhlYWRlci10aXRsZS1zbWFsbCB7XFxuICBjb2xvcjogIzM3NDE1MSAhaW1wb3J0YW50O1xcbn1cXG5cXG5odG1sLmxpZ2h0LXRoZW1lIC5sYW5nLXBpY2tlci1idG4sXFxuaHRtbFtkYXRhLXRoZW1lPVxcXCJsaWdodFxcXCJdIC5sYW5nLXBpY2tlci1idG4sXFxuYm9keS5saWdodC10aGVtZSAubGFuZy1waWNrZXItYnRuIHtcXG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50ICFpbXBvcnRhbnQ7XFxuICBib3JkZXItY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4yKSAhaW1wb3J0YW50O1xcbiAgY29sb3I6ICMwMDAwMDAgIWltcG9ydGFudDtcXG59XFxuXFxuaHRtbC5saWdodC10aGVtZSAubGFuZy1waWNrZXItYnRuOmhvdmVyLFxcbmh0bWxbZGF0YS10aGVtZT1cXFwibGlnaHRcXFwiXSAubGFuZy1waWNrZXItYnRuOmhvdmVyLFxcbmJvZHkubGlnaHQtdGhlbWUgLmxhbmctcGlja2VyLWJ0bjpob3ZlciB7XFxuICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuMDUpICFpbXBvcnRhbnQ7XFxuICBib3JkZXItY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4zKSAhaW1wb3J0YW50O1xcbn1cXG5cXG5odG1sLmxpZ2h0LXRoZW1lIC5sYW5nLXBpY2tlci1idG4uYWN0aXZlLFxcbmh0bWxbZGF0YS10aGVtZT1cXFwibGlnaHRcXFwiXSAubGFuZy1waWNrZXItYnRuLmFjdGl2ZSxcXG5ib2R5LmxpZ2h0LXRoZW1lIC5sYW5nLXBpY2tlci1idG4uYWN0aXZlIHtcXG4gIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4xKSAhaW1wb3J0YW50O1xcbiAgYm9yZGVyLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNCkgIWltcG9ydGFudDtcXG59XFxuXFxuaHRtbC5saWdodC10aGVtZSAudGhlbWUtcGlja2VyLWJ0bixcXG5odG1sW2RhdGEtdGhlbWU9XFxcImxpZ2h0XFxcIl0gLnRoZW1lLXBpY2tlci1idG4sXFxuYm9keS5saWdodC10aGVtZSAudGhlbWUtcGlja2VyLWJ0biB7XFxuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudCAhaW1wb3J0YW50O1xcbiAgYm9yZGVyLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMikgIWltcG9ydGFudDtcXG4gIGNvbG9yOiAjMDAwMDAwICFpbXBvcnRhbnQ7XFxufVxcblxcbmh0bWwubGlnaHQtdGhlbWUgLnRoZW1lLXBpY2tlci1idG46aG92ZXIsXFxuaHRtbFtkYXRhLXRoZW1lPVxcXCJsaWdodFxcXCJdIC50aGVtZS1waWNrZXItYnRuOmhvdmVyLFxcbmJvZHkubGlnaHQtdGhlbWUgLnRoZW1lLXBpY2tlci1idG46aG92ZXIge1xcbiAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjA1KSAhaW1wb3J0YW50O1xcbiAgYm9yZGVyLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMykgIWltcG9ydGFudDtcXG59XFxuXFxuaHRtbC5saWdodC10aGVtZSAubGFuZy1tZW51LXBvcHVwLFxcbmh0bWxbZGF0YS10aGVtZT1cXFwibGlnaHRcXFwiXSAubGFuZy1tZW51LXBvcHVwLFxcbmJvZHkubGlnaHQtdGhlbWUgLmxhbmctbWVudS1wb3B1cCB7XFxuICBiYWNrZ3JvdW5kOiAjZmZmZmZmICFpbXBvcnRhbnQ7XFxuICBib3JkZXItY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4yKSAhaW1wb3J0YW50O1xcbn1cXG5cXG5odG1sLmxpZ2h0LXRoZW1lIC5sYW5nLW1lbnUtY2hvaWNlLFxcbmh0bWxbZGF0YS10aGVtZT1cXFwibGlnaHRcXFwiXSAubGFuZy1tZW51LWNob2ljZSxcXG5ib2R5LmxpZ2h0LXRoZW1lIC5sYW5nLW1lbnUtY2hvaWNlIHtcXG4gIGJhY2tncm91bmQ6ICNmZmZmZmYgIWltcG9ydGFudDtcXG4gIGNvbG9yOiAjMDAwMDAwICFpbXBvcnRhbnQ7XFxufVxcblxcbmh0bWwubGlnaHQtdGhlbWUgLmxhbmctbWVudS1jaG9pY2U6aG92ZXIsXFxuaHRtbFtkYXRhLXRoZW1lPVxcXCJsaWdodFxcXCJdIC5sYW5nLW1lbnUtY2hvaWNlOmhvdmVyLFxcbmJvZHkubGlnaHQtdGhlbWUgLmxhbmctbWVudS1jaG9pY2U6aG92ZXIge1xcbiAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjA1KSAhaW1wb3J0YW50O1xcbiAgY29sb3I6ICMwMDAwMDAgIWltcG9ydGFudDtcXG59XFxuXFxuaHRtbC5saWdodC10aGVtZSAubGFuZy1tZW51LWNob2ljZS5hY3RpdmUsXFxuaHRtbFtkYXRhLXRoZW1lPVxcXCJsaWdodFxcXCJdIC5sYW5nLW1lbnUtY2hvaWNlLmFjdGl2ZSxcXG5ib2R5LmxpZ2h0LXRoZW1lIC5sYW5nLW1lbnUtY2hvaWNlLmFjdGl2ZSB7XFxuICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuMSkgIWltcG9ydGFudDtcXG4gIGNvbG9yOiAjMDAwMDAwICFpbXBvcnRhbnQ7XFxufVxcblxcbi8qID09PT09IERBUksgVEhFTUUgLSBEYXJrIGJhY2tncm91bmQsIHdoaXRlIHRleHQgPT09PT0gKi9cXG5odG1sLmRhcmstdGhlbWUgLmxvYy13aWRnZXQtcm9vdCxcXG5odG1sW2RhdGEtdGhlbWU9XFxcImRhcmtcXFwiXSAubG9jLXdpZGdldC1yb290LFxcbmJvZHkuZGFyay10aGVtZSAubG9jLXdpZGdldC1yb290IHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLXdpZGdldC1iZy1wcmltYXJ5LCAjMmMzZTUwKSAhaW1wb3J0YW50O1xcbn1cXG5cXG5odG1sLmRhcmstdGhlbWUgLmhlYWRlci10aXRsZS1sYXJnZSxcXG5odG1sW2RhdGEtdGhlbWU9XFxcImRhcmtcXFwiXSAuaGVhZGVyLXRpdGxlLWxhcmdlLFxcbmJvZHkuZGFyay10aGVtZSAuaGVhZGVyLXRpdGxlLWxhcmdlIHtcXG4gIGNvbG9yOiAjZmZmZmZmICFpbXBvcnRhbnQ7XFxufVxcblxcbmh0bWwuZGFyay10aGVtZSAuaGVhZGVyLXRpdGxlLXNtYWxsLFxcbmh0bWxbZGF0YS10aGVtZT1cXFwiZGFya1xcXCJdIC5oZWFkZXItdGl0bGUtc21hbGwsXFxuYm9keS5kYXJrLXRoZW1lIC5oZWFkZXItdGl0bGUtc21hbGwge1xcbiAgY29sb3I6ICNjYmQ1ZTEgIWltcG9ydGFudDtcXG59XFxuXFxuaHRtbC5kYXJrLXRoZW1lIC5sYW5nLXBpY2tlci1idG4sXFxuaHRtbFtkYXRhLXRoZW1lPVxcXCJkYXJrXFxcIl0gLmxhbmctcGlja2VyLWJ0bixcXG5ib2R5LmRhcmstdGhlbWUgLmxhbmctcGlja2VyLWJ0biB7XFxuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudCAhaW1wb3J0YW50O1xcbiAgYm9yZGVyLWNvbG9yOiB2YXIoLS1ib3JkZXItcHJpbWFyeSwgIzQ4NWM2YikgIWltcG9ydGFudDtcXG4gIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICNmZmZmZmYpICFpbXBvcnRhbnQ7XFxufVxcblxcbmh0bWwuZGFyay10aGVtZSAubGFuZy1waWNrZXItYnRuOmhvdmVyLFxcbmh0bWxbZGF0YS10aGVtZT1cXFwiZGFya1xcXCJdIC5sYW5nLXBpY2tlci1idG46aG92ZXIsXFxuYm9keS5kYXJrLXRoZW1lIC5sYW5nLXBpY2tlci1idG46aG92ZXIge1xcbiAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpICFpbXBvcnRhbnQ7XFxuICBib3JkZXItY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC40KSAhaW1wb3J0YW50O1xcbn1cXG5cXG5odG1sLmRhcmstdGhlbWUgLnRoZW1lLXBpY2tlci1idG4sXFxuaHRtbFtkYXRhLXRoZW1lPVxcXCJkYXJrXFxcIl0gLnRoZW1lLXBpY2tlci1idG4sXFxuYm9keS5kYXJrLXRoZW1lIC50aGVtZS1waWNrZXItYnRuIHtcXG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50ICFpbXBvcnRhbnQ7XFxuICBib3JkZXItY29sb3I6IHZhcigtLWJvcmRlci1wcmltYXJ5LCAjNDg1YzZiKSAhaW1wb3J0YW50O1xcbiAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSwgI2ZmZmZmZikgIWltcG9ydGFudDtcXG59XFxuXFxuaHRtbC5kYXJrLXRoZW1lIC50aGVtZS1waWNrZXItYnRuOmhvdmVyLFxcbmh0bWxbZGF0YS10aGVtZT1cXFwiZGFya1xcXCJdIC50aGVtZS1waWNrZXItYnRuOmhvdmVyLFxcbmJvZHkuZGFyay10aGVtZSAudGhlbWUtcGlja2VyLWJ0bjpob3ZlciB7XFxuICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkgIWltcG9ydGFudDtcXG4gIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjQpICFpbXBvcnRhbnQ7XFxufVxcblxcbmh0bWwuZGFyay10aGVtZSAubGFuZy1tZW51LXBvcHVwLFxcbmh0bWxbZGF0YS10aGVtZT1cXFwiZGFya1xcXCJdIC5sYW5nLW1lbnUtcG9wdXAsXFxuYm9keS5kYXJrLXRoZW1lIC5sYW5nLW1lbnUtcG9wdXAge1xcbiAgYmFja2dyb3VuZDogIzFlMjkzYiAhaW1wb3J0YW50O1xcbiAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMikgIWltcG9ydGFudDtcXG59XFxuXFxuaHRtbC5kYXJrLXRoZW1lIC5sYW5nLW1lbnUtY2hvaWNlLFxcbmh0bWxbZGF0YS10aGVtZT1cXFwiZGFya1xcXCJdIC5sYW5nLW1lbnUtY2hvaWNlLFxcbmJvZHkuZGFyay10aGVtZSAubGFuZy1tZW51LWNob2ljZSB7XFxuICBiYWNrZ3JvdW5kOiAjMWUyOTNiICFpbXBvcnRhbnQ7XFxuICBjb2xvcjogI2ZmZmZmZiAhaW1wb3J0YW50O1xcbn1cXG5cXG5odG1sLmRhcmstdGhlbWUgLmxhbmctbWVudS1jaG9pY2U6aG92ZXIsXFxuaHRtbFtkYXRhLXRoZW1lPVxcXCJkYXJrXFxcIl0gLmxhbmctbWVudS1jaG9pY2U6aG92ZXIsXFxuYm9keS5kYXJrLXRoZW1lIC5sYW5nLW1lbnUtY2hvaWNlOmhvdmVyIHtcXG4gIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSAhaW1wb3J0YW50O1xcbiAgY29sb3I6ICNmZmZmZmYgIWltcG9ydGFudDtcXG59XFxuXFxuaHRtbC5kYXJrLXRoZW1lIC5sYW5nLW1lbnUtY2hvaWNlLmFjdGl2ZSxcXG5odG1sW2RhdGEtdGhlbWU9XFxcImRhcmtcXFwiXSAubGFuZy1tZW51LWNob2ljZS5hY3RpdmUsXFxuYm9keS5kYXJrLXRoZW1lIC5sYW5nLW1lbnUtY2hvaWNlLmFjdGl2ZSB7XFxuICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTUpICFpbXBvcnRhbnQ7XFxuICBjb2xvcjogI2ZmZmZmZiAhaW1wb3J0YW50O1xcbn1cXG5cXG4vKiA9PT09PSBDT05UQUlORVIgUVVFUklFUyBGQUxMQkFDSyA9PT09PSAqL1xcbkBjb250YWluZXIgbG9jYWxpemF0aW9uLXdpZGdldCAobWF4LXdpZHRoOiA0MDBweCkge1xcbiAgLmxvYy13aWRnZXQtcm9vdCB7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgfVxcblxcbiAgLmhlYWRlci10aXRsZS1sYXJnZSB7XFxuICAgIGZvbnQtc2l6ZTogMThweDtcXG4gIH1cXG5cXG4gIC5oZWFkZXItdGl0bGUtc21hbGwge1xcbiAgICBmb250LXNpemU6IDEycHg7XFxuICB9XFxuXFxuICAuY29udHJvbHMtc2VjdGlvbiB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgfVxcblxcbiAgLmxhbmd1YWdlLXNlbGVjdG9yLXdyYXAsXFxuICAudGhlbWUtc2VsZWN0b3Itd3JhcCB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgfVxcblxcbiAgLmxhbmctcGlja2VyLWJ0bixcXG4gIC50aGVtZS1waWNrZXItYnRuIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICB9XFxufVxcblxcbkBjb250YWluZXIgbG9jYWxpemF0aW9uLXdpZGdldCAobWF4LWhlaWdodDogNTBweCkge1xcbiAgLmhlYWRlci10aXRsZS1sYXJnZSB7XFxuICAgIGZvbnQtc2l6ZTogMTZweDtcXG4gIH1cXG5cXG4gIC5oZWFkZXItdGl0bGUtc21hbGwge1xcbiAgICBmb250LXNpemU6IDExcHg7XFxuICB9XFxuXFxuICAubGFuZ3VhZ2Utc2VsZWN0b3Itd3JhcCxcXG4gIC50aGVtZS1zZWxlY3Rvci13cmFwIHtcXG4gICAgZmxleDogMTtcXG4gIH1cXG4gIC5sYW5nLXBpY2tlci1idG4sXFxuICAudGhlbWUtcGlja2VyLWJ0biB7XFxuICAgIG1pbi1oZWlnaHQ6IDE4cHg7XFxuICAgIHBhZGRpbmc6IDJweCA4cHg7XFxuICAgIGdhcDogNHB4O1xcbiAgICBib3JkZXItcmFkaXVzOiAyMHB4O1xcbiAgfVxcbiAgLmdsb2JlLWljb24sXFxuICAudGhlbWUtaWNvbiB7XFxuICAgIHdpZHRoOiAxMnB4O1xcbiAgICBoZWlnaHQ6IDEycHg7XFxuICB9XFxuICAubGFuZy10ZXh0LFxcbiAgLnRoZW1lLXRleHQge1xcbiAgICBmb250LXNpemU6IDlweDtcXG4gIH1cXG4gIC5jaGV2cm9uLWljb24ge1xcbiAgICB3aWR0aDogMTBweDtcXG4gICAgaGVpZ2h0OiAxMHB4O1xcbiAgfVxcbn1cXG5cXG5AY29udGFpbmVyIGxvY2FsaXphdGlvbi13aWRnZXQgKG1pbi1oZWlnaHQ6IDUxcHgpIGFuZCAobWF4LWhlaWdodDogODBweCkge1xcbiAgLmxhbmctcGlja2VyLWJ0bixcXG4gIC50aGVtZS1waWNrZXItYnRuIHtcXG4gICAgbWluLWhlaWdodDogMjRweDtcXG4gICAgcGFkZGluZzogNHB4IDEwcHg7XFxuICAgIGdhcDogNXB4O1xcbiAgfVxcbiAgLmdsb2JlLWljb24sXFxuICAudGhlbWUtaWNvbiB7XFxuICAgIHdpZHRoOiAxNnB4O1xcbiAgICBoZWlnaHQ6IDE2cHg7XFxuICB9XFxuICAubGFuZy10ZXh0LFxcbiAgLnRoZW1lLXRleHQge1xcbiAgICBmb250LXNpemU6IDExcHg7XFxuICB9XFxufVxcblxcbkBjb250YWluZXIgbG9jYWxpemF0aW9uLXdpZGdldCAobWluLWhlaWdodDogODFweCkgYW5kIChtYXgtaGVpZ2h0OiAxMjBweCkge1xcbiAgLmxhbmctcGlja2VyLWJ0bixcXG4gIC50aGVtZS1waWNrZXItYnRuIHtcXG4gICAgbWluLWhlaWdodDogMzJweDtcXG4gICAgcGFkZGluZzogNnB4IDE0cHg7XFxuICAgIGdhcDogNnB4O1xcbiAgfVxcbiAgLmdsb2JlLWljb24sXFxuICAudGhlbWUtaWNvbiB7XFxuICAgIHdpZHRoOiAyMHB4O1xcbiAgICBoZWlnaHQ6IDIwcHg7XFxuICB9XFxuICAubGFuZy10ZXh0LFxcbiAgLnRoZW1lLXRleHQge1xcbiAgICBmb250LXNpemU6IDEzcHg7XFxuICB9XFxufVxcblxcbkBjb250YWluZXIgbG9jYWxpemF0aW9uLXdpZGdldCAobWluLWhlaWdodDogMTIxcHgpIGFuZCAobWF4LWhlaWdodDogMTgwcHgpIHtcXG4gIC5sYW5nLXBpY2tlci1idG4sXFxuICAudGhlbWUtcGlja2VyLWJ0biB7XFxuICAgIG1pbi1oZWlnaHQ6IDQycHg7XFxuICAgIHBhZGRpbmc6IDhweCAyMHB4O1xcbiAgICBnYXA6IDEwcHg7XFxuICB9XFxuICAuZ2xvYmUtaWNvbixcXG4gIC50aGVtZS1pY29uIHtcXG4gICAgd2lkdGg6IDI2cHg7XFxuICAgIGhlaWdodDogMjZweDtcXG4gIH1cXG4gIC5sYW5nLXRleHQsXFxuICAudGhlbWUtdGV4dCB7XFxuICAgIGZvbnQtc2l6ZTogMTZweDtcXG4gIH1cXG59XFxuXFxuQGNvbnRhaW5lciBsb2NhbGl6YXRpb24td2lkZ2V0IChtaW4taGVpZ2h0OiAxODFweCkge1xcbiAgLmxhbmctcGlja2VyLWJ0bixcXG4gIC50aGVtZS1waWNrZXItYnRuIHtcXG4gICAgbWluLWhlaWdodDogNTZweDtcXG4gICAgcGFkZGluZzogMTJweCAyOHB4O1xcbiAgICBnYXA6IDE0cHg7XFxuICB9XFxuICAuZ2xvYmUtaWNvbixcXG4gIC50aGVtZS1pY29uIHtcXG4gICAgd2lkdGg6IDMycHg7XFxuICAgIGhlaWdodDogMzJweDtcXG4gIH1cXG4gIC5sYW5nLXRleHQsXFxuICAudGhlbWUtdGV4dCB7XFxuICAgIGZvbnQtc2l6ZTogMjBweDtcXG4gIH1cXG59XFxuXFxuLyogPT09PT0gQUNDRVNTSUJJTElUWSA9PT09PSAqL1xcbkBtZWRpYSAocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKSB7XFxuICAqIHtcXG4gICAgdHJhbnNpdGlvbjogbm9uZSAhaW1wb3J0YW50O1xcbiAgICBhbmltYXRpb246IG5vbmUgIWltcG9ydGFudDtcXG4gIH1cXG4gIC5sYW5nLXBpY2tlci1idG46aG92ZXIsXFxuICAudGhlbWUtcGlja2VyLWJ0bjpob3ZlciB7XFxuICAgIHRyYW5zZm9ybTogbm9uZSAhaW1wb3J0YW50O1xcbiAgfVxcbn1cXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107XG5cbiAgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBjb250ZW50ICs9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSk7XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07XG5cbiAgLy8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3RcbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBfayA9IDA7IF9rIDwgbW9kdWxlcy5sZW5ndGg7IF9rKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2tdKTtcbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlbSkge1xuICB2YXIgY29udGVudCA9IGl0ZW1bMV07XG4gIHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oXCJcXG5cIik7XG59OyIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanM/P3J1bGVTZXRbMV0ucnVsZXNbM10udXNlWzFdIS4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9yZXNvbHZlLXVybC1sb2FkZXIvaW5kZXguanM/P3J1bGVTZXRbMV0ucnVsZXNbM10udXNlWzJdIS4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9zYXNzLWxvYWRlci9kaXN0L2Nqcy5qcz8/cnVsZVNldFsxXS5ydWxlc1szXS51c2VbM10hLi93aWRnZXQuY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5vcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzPz9ydWxlU2V0WzFdLnJ1bGVzWzNdLnVzZVsxXSEuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvcmVzb2x2ZS11cmwtbG9hZGVyL2luZGV4LmpzPz9ydWxlU2V0WzFdLnJ1bGVzWzNdLnVzZVsyXSEuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvc2Fzcy1sb2FkZXIvZGlzdC9janMuanM/P3J1bGVTZXRbMV0ucnVsZXNbM10udXNlWzNdIS4vd2lkZ2V0LmNzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgc3R5bGVzSW5ET00gPSBbXTtcbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcbiAgICBpZiAoaW5kZXhCeUlkZW50aWZpZXIgIT09IC0xKSB7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0ucmVmZXJlbmNlcysrO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnVwZGF0ZXIob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHVwZGF0ZXIgPSBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKTtcbiAgICAgIG9wdGlvbnMuYnlJbmRleCA9IGk7XG4gICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoaSwgMCwge1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiB1cGRhdGVyLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5mdW5jdGlvbiBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKSB7XG4gIHZhciBhcGkgPSBvcHRpb25zLmRvbUFQSShvcHRpb25zKTtcbiAgYXBpLnVwZGF0ZShvYmopO1xuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiB1cGRhdGVyO1xufVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG4gICAgdmFyIG5ld0xhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShuZXdMaXN0LCBvcHRpb25zKTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG4gICAgICBpZiAoc3R5bGVzSW5ET01bX2luZGV4XS5yZWZlcmVuY2VzID09PSAwKSB7XG4gICAgICAgIHN0eWxlc0luRE9NW19pbmRleF0udXBkYXRlcigpO1xuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpO1xuXG4gICAgLy8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG4gIHJldHVybiBtZW1vW3RhcmdldF07XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG4gIHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0U3R5bGVFbGVtZW50OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcyhzdHlsZUVsZW1lbnQpIHtcbiAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSBcInVuZGVmaW5lZFwiID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuICBpZiAobm9uY2UpIHtcbiAgICBzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibm9uY2VcIiwgbm9uY2UpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIkBtZWRpYSBcIi5jb25jYXQob2JqLm1lZGlhLCBcIiB7XCIpO1xuICB9XG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG4gIGNzcyArPSBvYmouY3NzO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9XG5cbiAgLy8gRm9yIG9sZCBJRVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgc3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKCkge30sXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgfTtcbiAgfVxuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50KSB7XG4gIGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cbiAgICBzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfY29yZV9fOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsIl9fd2VicGFja19yZXF1aXJlX18ubmMgPSB1bmRlZmluZWQ7IiwiLyoqXHJcbiAqIFdlYnBhY2sgd2lsbCByZXBsYWNlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHdpdGggX193ZWJwYWNrX3JlcXVpcmVfXy5wIHRvIHNldCB0aGUgcHVibGljIHBhdGggZHluYW1pY2FsbHkuXHJcbiAqIFRoZSByZWFzb24gd2h5IHdlIGNhbid0IHNldCB0aGUgcHVibGljUGF0aCBpbiB3ZWJwYWNrIGNvbmZpZyBpczogd2UgY2hhbmdlIHRoZSBwdWJsaWNQYXRoIHdoZW4gZG93bmxvYWQuXHJcbiAqICovXHJcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxyXG4vLyBAdHMtaWdub3JlXHJcbl9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gd2luZG93LmppbXVDb25maWcuYmFzZVVybFxyXG4iLCIvKiogQGpzeCBqc3ggKi9cbmltcG9ydCB7IFJlYWN0LCBqc3gsIEFsbFdpZGdldFByb3BzIH0gZnJvbSBcImppbXUtY29yZVwiO1xuaW1wb3J0IFwiLi93aWRnZXQuY3NzXCI7XG5cbmV4cG9ydCB0eXBlIExhbmdDb2RlID0gXCJ1el9sYXRcIiB8IFwidXpfY3lybFwiIHwgXCJydVwiO1xuZXhwb3J0IHR5cGUgVGhlbWVNb2RlID0gXCJsaWdodFwiIHwgXCJkYXJrXCI7XG5cbmludGVyZmFjZSBTdGF0ZSB7XG4gIGxhbmc6IExhbmdDb2RlO1xuICB0aGVtZTogVGhlbWVNb2RlO1xuICBpc0xhbmdPcGVuOiBib29sZWFuO1xuICBpc1RoZW1lT3BlbjogYm9vbGVhbjtcbiAgbGFuZ01lbnVQb3NpdGlvbjogeyB0b3A6IG51bWJlcjsgbGVmdDogbnVtYmVyOyB3aWR0aDogbnVtYmVyIH0gfCBudWxsO1xuICB0aGVtZU1lbnVQb3NpdGlvbjogeyB0b3A6IG51bWJlcjsgbGVmdDogbnVtYmVyOyB3aWR0aDogbnVtYmVyIH0gfCBudWxsO1xufVxuXG5jb25zdCBMQU5HX09QVElPTlM6IEFycmF5PHtcbiAgY29kZTogTGFuZ0NvZGU7XG4gIGZsYWc6IHN0cmluZztcbiAgbGFiZWw6IHN0cmluZztcbiAgc2hvcnRMYWJlbDogc3RyaW5nO1xufT4gPSBbXG4gIHsgY29kZTogXCJ1el9sYXRcIiwgZmxhZzogXCLwn4e68J+Hv1wiLCBsYWJlbDogXCJPJ3piZWtjaGFcIiwgc2hvcnRMYWJlbDogXCJVWlwiIH0sXG4gIHsgY29kZTogXCJ1el9jeXJsXCIsIGZsYWc6IFwi8J+HuvCfh79cIiwgbGFiZWw6IFwi0I7Qt9Cx0LXQutGH0LBcIiwgc2hvcnRMYWJlbDogXCLQjtCXXCIgfSxcbiAgeyBjb2RlOiBcInJ1XCIsIGZsYWc6IFwi8J+Ht/Cfh7pcIiwgbGFiZWw6IFwi0KDRg9GB0YHQutC40LlcIiwgc2hvcnRMYWJlbDogXCJSVVwiIH0sXG5dO1xuXG4vLyBUaGVtZSBsYWJlbHMgLSB0aWxnYSBxYXJhYiBkaW5hbWlrXG5jb25zdCBUSEVNRV9MQUJFTFM6IFJlY29yZDxUaGVtZU1vZGUsIFJlY29yZDxMYW5nQ29kZSwgc3RyaW5nPj4gPSB7XG4gIGxpZ2h0OiB7XG4gICAgdXpfbGF0OiBcIkt1bmR1elwiLFxuICAgIHV6X2N5cmw6IFwi0JrRg9C90LTRg9C3XCIsXG4gICAgcnU6IFwi0JTQtdC90YxcIixcbiAgfSxcbiAgZGFyazoge1xuICAgIHV6X2xhdDogXCJUdW5naVwiLFxuICAgIHV6X2N5cmw6IFwi0KLRg9C90LPQuFwiLFxuICAgIHJ1OiBcItCd0L7Rh9GMXCIsXG4gIH0sXG59O1xuXG4vLyBIZWFkZXIgdGV4dCBsYWJlbHMgLSB0aWxnYSBxYXJhYiBkaW5hbWlrXG5jb25zdCBIRUFERVJfTEFCRUxTOiBSZWNvcmQ8TGFuZ0NvZGUsIHsgd2F0ZXI6IHN0cmluZzsgc3BhY2VNb25pdG9yaW5nOiBzdHJpbmcgfT4gPSB7XG4gIHV6X2xhdDoge1xuICAgIHdhdGVyOiBcIldhdGVyXCIsXG4gICAgc3BhY2VNb25pdG9yaW5nOiBcIlNwYWNlIE1vbml0b3JpbmdcIixcbiAgfSxcbiAgdXpfY3lybDoge1xuICAgIHdhdGVyOiBcIldhdGVyXCIsXG4gICAgc3BhY2VNb25pdG9yaW5nOiBcIlNwYWNlIE1vbml0b3JpbmdcIixcbiAgfSxcbiAgcnU6IHtcbiAgICB3YXRlcjogXCJXYXRlclwiLFxuICAgIHNwYWNlTW9uaXRvcmluZzogXCJTcGFjZSBNb25pdG9yaW5nXCIsXG4gIH0sXG59O1xuXG5jb25zdCBnZXRUaGVtZU9wdGlvbnMgPSAoXG4gIGxhbmc6IExhbmdDb2RlXG4pOiBBcnJheTx7IGNvZGU6IFRoZW1lTW9kZTsgaWNvbjogc3RyaW5nOyBsYWJlbDogc3RyaW5nIH0+ID0+IFtcbiAgeyBjb2RlOiBcImxpZ2h0XCIsIGljb246IFwi4piA77iPXCIsIGxhYmVsOiBUSEVNRV9MQUJFTFMubGlnaHRbbGFuZ10gfSxcbiAgeyBjb2RlOiBcImRhcmtcIiwgaWNvbjogXCLwn4yZXCIsIGxhYmVsOiBUSEVNRV9MQUJFTFMuZGFya1tsYW5nXSB9LFxuXTtcblxuZnVuY3Rpb24gbm9ybWFsaXplTGFuZyhpbnB1dDogYW55KTogTGFuZ0NvZGUge1xuICBjb25zdCByYXcgPSBTdHJpbmcoaW5wdXQgPz8gXCJcIilcbiAgICAudHJpbSgpXG4gICAgLnRvTG93ZXJDYXNlKCk7XG4gIGlmIChyYXcgPT09IFwicnVcIiB8fCByYXcgPT09IFwicnVzXCIgfHwgcmF3ID09PSBcInJ1c3NpYW5cIikgcmV0dXJuIFwicnVcIjtcbiAgaWYgKFxuICAgIHJhdyA9PT0gXCJ1el9jeXJsXCIgfHxcbiAgICByYXcgPT09IFwidXotY3lybFwiIHx8XG4gICAgcmF3ID09PSBcInV6Y3lybFwiIHx8XG4gICAgcmF3ID09PSBcImN5cmlsbGljXCJcbiAgKVxuICAgIHJldHVybiBcInV6X2N5cmxcIjtcbiAgcmV0dXJuIFwidXpfbGF0XCI7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVRoZW1lKGlucHV0OiBhbnkpOiBUaGVtZU1vZGUge1xuICBjb25zdCByYXcgPSBTdHJpbmcoaW5wdXQgPz8gXCJcIilcbiAgICAudHJpbSgpXG4gICAgLnRvTG93ZXJDYXNlKCk7XG4gIGlmIChyYXcgPT09IFwibGlnaHRcIiB8fCByYXcgPT09IFwia3VuXCIgfHwgcmF3ID09PSBcImRheVwiKSByZXR1cm4gXCJsaWdodFwiO1xuICByZXR1cm4gXCJkYXJrXCI7XG59XG5cbmZ1bmN0aW9uIGdldEluaXRpYWxMYW5nKCk6IExhbmdDb2RlIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB1cmxMYW5nID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKS5nZXQoXCJsYW5nXCIpO1xuICAgIGlmICh1cmxMYW5nKSByZXR1cm4gbm9ybWFsaXplTGFuZyh1cmxMYW5nKTtcbiAgICBjb25zdCBzZXNzaW9uTGFuZyA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJldmFwb19zZXNzaW9uX2xhbmdcIik7XG4gICAgaWYgKHNlc3Npb25MYW5nKSByZXR1cm4gbm9ybWFsaXplTGFuZyhzZXNzaW9uTGFuZyk7XG4gICAgcmV0dXJuIFwidXpfbGF0XCI7XG4gIH0gY2F0Y2gge31cbiAgcmV0dXJuIFwidXpfbGF0XCI7XG59XG5cbmZ1bmN0aW9uIGdldEluaXRpYWxUaGVtZSgpOiBUaGVtZU1vZGUge1xuICB0cnkge1xuICAgIGNvbnN0IHVybFRoZW1lID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKS5nZXQoXCJ0aGVtZVwiKTtcbiAgICBpZiAodXJsVGhlbWUpIHJldHVybiBub3JtYWxpemVUaGVtZSh1cmxUaGVtZSk7XG4gICAgY29uc3Qgc2Vzc2lvblRoZW1lID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShcImV2YXBvX3Nlc3Npb25fdGhlbWVcIik7XG4gICAgaWYgKHNlc3Npb25UaGVtZSkgcmV0dXJuIG5vcm1hbGl6ZVRoZW1lKHNlc3Npb25UaGVtZSk7XG4gICAgY29uc3Qgc3RvcmVkVGhlbWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImV2YXBvX2FwcF90aGVtZVwiKTtcbiAgICBpZiAoc3RvcmVkVGhlbWUpIHJldHVybiBub3JtYWxpemVUaGVtZShzdG9yZWRUaGVtZSk7XG4gICAgcmV0dXJuIFwiZGFya1wiO1xuICB9IGNhdGNoIHt9XG4gIHJldHVybiBcImRhcmtcIjtcbn1cblxuZnVuY3Rpb24gcGVyc2lzdExhbmd1YWdlKGxhbmc6IExhbmdDb2RlKTogdm9pZCB7XG4gIHRyeSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJldmFwb19hcHBfbGFuZ1wiLCBsYW5nKTtcbiAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFwiZXZhcG9fc2Vzc2lvbl9sYW5nXCIsIGxhbmcpO1xuICB9IGNhdGNoIHt9XG4gIHRyeSB7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJsYW5nXCIsIGxhbmcpO1xuICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgXCJcIiwgdXJsLnRvU3RyaW5nKCkpO1xuICB9IGNhdGNoIHt9XG59XG5cbmZ1bmN0aW9uIHBlcnNpc3RUaGVtZSh0aGVtZTogVGhlbWVNb2RlKTogdm9pZCB7XG4gIHRyeSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJldmFwb19hcHBfdGhlbWVcIiwgdGhlbWUpO1xuICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXCJldmFwb19zZXNzaW9uX3RoZW1lXCIsIHRoZW1lKTtcbiAgfSBjYXRjaCB7fVxuICB0cnkge1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuICAgIHVybC5zZWFyY2hQYXJhbXMuc2V0KFwidGhlbWVcIiwgdGhlbWUpO1xuICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgXCJcIiwgdXJsLnRvU3RyaW5nKCkpO1xuICB9IGNhdGNoIHt9XG59XG5cbmZ1bmN0aW9uIGJyb2FkY2FzdExhbmd1YWdlQ2hhbmdlKGxhbmc6IExhbmdDb2RlKTogdm9pZCB7XG4gIGNvbnN0IGRldGFpbCA9IHsgbGFuZywgdGltZXN0YW1wOiBEYXRlLm5vdygpLCBzb3VyY2U6IFwiTG9jYWxpemF0aW9uV2lkZ2V0XCIgfTtcbiAgY29uc29sZS5sb2coXCJbTG9jYWxpemF0aW9uV2lkZ2V0XSBCcm9hZGNhc3RpbmcgbGFuZ3VhZ2VDaGFuZ2VkOlwiLCBkZXRhaWwpO1xuICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KFxuICAgIG5ldyBDdXN0b21FdmVudChcImxhbmd1YWdlQ2hhbmdlZFwiLCB7IGRldGFpbCwgYnViYmxlczogdHJ1ZSB9KVxuICApO1xufVxuXG5mdW5jdGlvbiBicm9hZGNhc3RUaGVtZUNoYW5nZSh0aGVtZTogVGhlbWVNb2RlKTogdm9pZCB7XG4gIGNvbnN0IGRldGFpbCA9IHsgdGhlbWUsIHRpbWVzdGFtcDogRGF0ZS5ub3coKSwgc291cmNlOiBcIkxvY2FsaXphdGlvbldpZGdldFwiIH07XG4gIGNvbnNvbGUubG9nKFwiW0xvY2FsaXphdGlvbldpZGdldF0gQnJvYWRjYXN0aW5nIHRoZW1lQ2hhbmdlZDpcIiwgZGV0YWlsKTtcbiAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChcbiAgICBuZXcgQ3VzdG9tRXZlbnQoXCJ0aGVtZUNoYW5nZWRcIiwgeyBkZXRhaWwsIGJ1YmJsZXM6IHRydWUgfSlcbiAgKTtcbiAgYXBwbHlUaGVtZVRvRG9jdW1lbnQodGhlbWUpO1xuXG4gIC8vIFJlLWFwcGx5IGFmdGVyIHNob3J0IGRlbGF5IHRvIGNhdGNoIGR5bmFtaWNhbGx5IGxvYWRlZCBjb250ZW50XG4gIHNldFRpbWVvdXQoKCkgPT4gYXBwbHlUaGVtZVRvRG9jdW1lbnQodGhlbWUpLCAxMDApO1xuICBzZXRUaW1lb3V0KCgpID0+IGFwcGx5VGhlbWVUb0RvY3VtZW50KHRoZW1lKSwgNTAwKTtcbn1cblxuZnVuY3Rpb24gYXBwbHlUaGVtZVRvRG9jdW1lbnQodGhlbWU6IFRoZW1lTW9kZSk6IHZvaWQge1xuICBjb25zdCBhZGRDbGFzcyA9IHRoZW1lID09PSBcImxpZ2h0XCIgPyBcImxpZ2h0LXRoZW1lXCIgOiBcImRhcmstdGhlbWVcIjtcbiAgY29uc3QgcmVtb3ZlQ2xhc3MgPSB0aGVtZSA9PT0gXCJsaWdodFwiID8gXCJkYXJrLXRoZW1lXCIgOiBcImxpZ2h0LXRoZW1lXCI7XG5cbiAgLy8gQXBwbHkgdG8gYSBkb2N1bWVudFxuICBjb25zdCBhcHBseVRvRG9jID0gKGRvYzogRG9jdW1lbnQpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgaHRtbCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICBjb25zdCBib2R5ID0gZG9jLmJvZHk7XG4gICAgICBpZiAoaHRtbCkge1xuICAgICAgICBodG1sLmNsYXNzTGlzdC5yZW1vdmUocmVtb3ZlQ2xhc3MpO1xuICAgICAgICBodG1sLmNsYXNzTGlzdC5hZGQoYWRkQ2xhc3MpO1xuICAgICAgICBodG1sLnNldEF0dHJpYnV0ZShcImRhdGEtdGhlbWVcIiwgdGhlbWUpO1xuICAgICAgICBodG1sLnN0eWxlLnNldFByb3BlcnR5KFwiLS1jdXJyZW50LXRoZW1lXCIsIHRoZW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChib2R5KSB7XG4gICAgICAgIGJvZHkuY2xhc3NMaXN0LnJlbW92ZShyZW1vdmVDbGFzcyk7XG4gICAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZChhZGRDbGFzcyk7XG4gICAgICAgIGJvZHkuc2V0QXR0cmlidXRlKFwiZGF0YS10aGVtZVwiLCB0aGVtZSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gU2lsZW50bHkgZmFpbFxuICAgIH1cbiAgfTtcblxuICAvLyBBcHBseSB0byBjdXJyZW50IGRvY3VtZW50XG4gIGFwcGx5VG9Eb2MoZG9jdW1lbnQpO1xuXG4gIC8vIEFwcGx5IHRvIHBhcmVudCB3aW5kb3cgKGlmIGluIGlmcmFtZSlcbiAgdHJ5IHtcbiAgICBpZiAod2luZG93LnBhcmVudCAmJiB3aW5kb3cucGFyZW50ICE9PSB3aW5kb3cgJiYgd2luZG93LnBhcmVudC5kb2N1bWVudCkge1xuICAgICAgYXBwbHlUb0RvYyh3aW5kb3cucGFyZW50LmRvY3VtZW50KTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgLy8gQXBwbHkgdG8gdG9wIHdpbmRvd1xuICB0cnkge1xuICAgIGlmICh3aW5kb3cudG9wICYmIHdpbmRvdy50b3AgIT09IHdpbmRvdyAmJiB3aW5kb3cudG9wLmRvY3VtZW50KSB7XG4gICAgICBhcHBseVRvRG9jKHdpbmRvdy50b3AuZG9jdW1lbnQpO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge31cblxuICAvLyBBcHBseSB0byBhbGwgaWZyYW1lcyBpbiBjdXJyZW50IGRvY3VtZW50XG4gIGNvbnN0IGFwcGx5VG9BbGxJZnJhbWVzID0gKGRvYzogRG9jdW1lbnQpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgaWZyYW1lcyA9IGRvYy5xdWVyeVNlbGVjdG9yQWxsKFwiaWZyYW1lXCIpO1xuICAgICAgaWZyYW1lcy5mb3JFYWNoKChpZnJhbWUpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoaWZyYW1lLmNvbnRlbnREb2N1bWVudCkge1xuICAgICAgICAgICAgYXBwbHlUb0RvYyhpZnJhbWUuY29udGVudERvY3VtZW50KTtcbiAgICAgICAgICAgIC8vIFJlY3Vyc2l2ZWx5IGFwcGx5IHRvIG5lc3RlZCBpZnJhbWVzXG4gICAgICAgICAgICBhcHBseVRvQWxsSWZyYW1lcyhpZnJhbWUuY29udGVudERvY3VtZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9O1xuXG4gIGFwcGx5VG9BbGxJZnJhbWVzKGRvY3VtZW50KTtcblxuICAvLyBUcnkgdG8gYXBwbHkgdG8gcGFyZW50J3MgaWZyYW1lcyB0b29cbiAgdHJ5IHtcbiAgICBpZiAod2luZG93LnBhcmVudCAmJiB3aW5kb3cucGFyZW50ICE9PSB3aW5kb3cgJiYgd2luZG93LnBhcmVudC5kb2N1bWVudCkge1xuICAgICAgYXBwbHlUb0FsbElmcmFtZXMod2luZG93LnBhcmVudC5kb2N1bWVudCk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7fVxuXG4gIC8vIFRyeSB0byBhcHBseSB0byB0b3Agd2luZG93J3MgaWZyYW1lc1xuICB0cnkge1xuICAgIGlmICh3aW5kb3cudG9wICYmIHdpbmRvdy50b3AgIT09IHdpbmRvdyAmJiB3aW5kb3cudG9wLmRvY3VtZW50KSB7XG4gICAgICBhcHBseVRvQWxsSWZyYW1lcyh3aW5kb3cudG9wLmRvY3VtZW50KTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgY29uc29sZS5sb2coXCJbTG9jYWxpemF0aW9uV2lkZ2V0XSBUaGVtZSBhcHBsaWVkIHRvIGFsbCBkb2N1bWVudHM6XCIsIHRoZW1lKTtcblxuICBjb25zb2xlLmxvZyhcIltMb2NhbGl6YXRpb25XaWRnZXRdIFRoZW1lIGFwcGxpZWQ6XCIsIHRoZW1lKTtcbn1cblxuaW50ZXJmYWNlIExvY2FsaXphdGlvbldpZGdldFByb3BzIGV4dGVuZHMgQWxsV2lkZ2V0UHJvcHM8YW55PiB7fVxuXG5pbnRlcmZhY2UgQ29udGFpbmVyU2l6ZSB7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xufVxuXG5jbGFzcyBMb2NhbGl6YXRpb25XaWRnZXRDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8XG4gIExvY2FsaXphdGlvbldpZGdldFByb3BzLFxuICBTdGF0ZVxuPiB7XG4gIF9pc01vdW50ZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBsYW5nRHJvcGRvd25SZWYgPSBSZWFjdC5jcmVhdGVSZWY8SFRNTERpdkVsZW1lbnQ+KCk7XG4gIHByaXZhdGUgbGFuZ0J1dHRvblJlZiA9IFJlYWN0LmNyZWF0ZVJlZjxIVE1MQnV0dG9uRWxlbWVudD4oKTtcbiAgcHJpdmF0ZSB0aGVtZURyb3Bkb3duUmVmID0gUmVhY3QuY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuICBwcml2YXRlIHRoZW1lQnV0dG9uUmVmID0gUmVhY3QuY3JlYXRlUmVmPEhUTUxCdXR0b25FbGVtZW50PigpO1xuICBwcml2YXRlIGNvbnRhaW5lclJlZiA9IFJlYWN0LmNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcbiAgcHJpdmF0ZSByZXNpemVPYnNlcnZlcjogUmVzaXplT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjb250YWluZXJTaXplOiBDb250YWluZXJTaXplID0geyB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IExvY2FsaXphdGlvbldpZGdldFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBsYW5nOiBnZXRJbml0aWFsTGFuZygpLFxuICAgICAgdGhlbWU6IGdldEluaXRpYWxUaGVtZSgpLFxuICAgICAgaXNMYW5nT3BlbjogZmFsc2UsXG4gICAgICBpc1RoZW1lT3BlbjogZmFsc2UsXG4gICAgICBsYW5nTWVudVBvc2l0aW9uOiBudWxsLFxuICAgICAgdGhlbWVNZW51UG9zaXRpb246IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2lzTW91bnRlZCA9IHRydWU7XG4gICAgY29uc29sZS5sb2coXG4gICAgICBcIltMb2NhbGl6YXRpb25XaWRnZXRdIE1vdW50ZWQgLSBsYW5nOlwiLFxuICAgICAgdGhpcy5zdGF0ZS5sYW5nLFxuICAgICAgXCJ0aGVtZTpcIixcbiAgICAgIHRoaXMuc3RhdGUudGhlbWVcbiAgICApO1xuICAgIGJyb2FkY2FzdExhbmd1YWdlQ2hhbmdlKHRoaXMuc3RhdGUubGFuZyk7XG4gICAgYnJvYWRjYXN0VGhlbWVDaGFuZ2UodGhpcy5zdGF0ZS50aGVtZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwibGFuZ3VhZ2VDaGFuZ2VkXCIsXG4gICAgICB0aGlzLm9uRXh0ZXJuYWxMYW5ndWFnZUNoYW5nZWRcbiAgICApO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0aGVtZUNoYW5nZWRcIiwgdGhpcy5vbkV4dGVybmFsVGhlbWVDaGFuZ2VkKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuaGFuZGxlQ2xpY2tPdXRzaWRlKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmhhbmRsZUVzY2FwZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgdGhpcy5oYW5kbGVTY3JvbGwsIHRydWUpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuaGFuZGxlUmVzaXplKTtcblxuICAgIC8vIFNldHVwIFJlc2l6ZU9ic2VydmVyIGZvciBkeW5hbWljIHJlc3BvbnNpdmUgc2l6aW5nXG4gICAgdGhpcy5zZXR1cFJlc2l6ZU9ic2VydmVyKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc01vdW50ZWQgPSBmYWxzZTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJsYW5ndWFnZUNoYW5nZWRcIixcbiAgICAgIHRoaXMub25FeHRlcm5hbExhbmd1YWdlQ2hhbmdlZFxuICAgICk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRoZW1lQ2hhbmdlZFwiLCB0aGlzLm9uRXh0ZXJuYWxUaGVtZUNoYW5nZWQpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5oYW5kbGVDbGlja091dHNpZGUpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMuaGFuZGxlRXNjYXBlKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLmhhbmRsZVNjcm9sbCwgdHJ1ZSk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5oYW5kbGVSZXNpemUpO1xuXG4gICAgLy8gQ2xlYW51cCBSZXNpemVPYnNlcnZlclxuICAgIGlmICh0aGlzLnJlc2l6ZU9ic2VydmVyKSB7XG4gICAgICB0aGlzLnJlc2l6ZU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgIHRoaXMucmVzaXplT2JzZXJ2ZXIgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNldHVwIFJlc2l6ZU9ic2VydmVyIGZvciBkeW5hbWljIHJlc3BvbnNpdmUgc2l6aW5nXG4gIHNldHVwUmVzaXplT2JzZXJ2ZXIgPSAoKTogdm9pZCA9PiB7XG4gICAgaWYgKCF0aGlzLmNvbnRhaW5lclJlZi5jdXJyZW50KSByZXR1cm47XG5cbiAgICB0aGlzLnJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKChlbnRyaWVzKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBlbnRyeS5jb250ZW50UmVjdDtcbiAgICAgICAgdGhpcy5jb250YWluZXJTaXplID0geyB3aWR0aCwgaGVpZ2h0IH07XG4gICAgICAgIHRoaXMudXBkYXRlQ29udGFpbmVyU2l6ZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLmNvbnRhaW5lclJlZi5jdXJyZW50KTtcblxuICAgIC8vIEluaXRpYWwgc2l6ZSB1cGRhdGVcbiAgICBjb25zdCByZWN0ID0gdGhpcy5jb250YWluZXJSZWYuY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB0aGlzLmNvbnRhaW5lclNpemUgPSB7IHdpZHRoOiByZWN0LndpZHRoLCBoZWlnaHQ6IHJlY3QuaGVpZ2h0IH07XG4gICAgdGhpcy51cGRhdGVDb250YWluZXJTaXplKHJlY3Qud2lkdGgsIHJlY3QuaGVpZ2h0KTtcbiAgfTtcblxuICAvLyBVcGRhdGUgY29udGFpbmVyIHNpemUgY2xhc3Nlc1xuICB1cGRhdGVDb250YWluZXJTaXplID0gKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogdm9pZCA9PiB7XG4gICAgaWYgKCF0aGlzLmNvbnRhaW5lclJlZi5jdXJyZW50KSByZXR1cm47XG5cbiAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lclJlZi5jdXJyZW50O1xuICAgIGNvbnN0IHNpemVDbGFzcyA9IHRoaXMuZ2V0U2l6ZUNsYXNzKHdpZHRoLCBoZWlnaHQpO1xuICAgIGNvbnN0IGxheW91dENsYXNzID0gdGhpcy5nZXRMYXlvdXRDbGFzcyh3aWR0aCwgaGVpZ2h0KTtcblxuICAgIC8vIFJlbW92ZSBhbGwgc2l6ZSBjbGFzc2VzXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoXG4gICAgICBcInNpemUteHNcIixcbiAgICAgIFwic2l6ZS1zbVwiLFxuICAgICAgXCJzaXplLW1kXCIsXG4gICAgICBcInNpemUtbGdcIixcbiAgICAgIFwic2l6ZS14bFwiXG4gICAgKTtcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZShcImxheW91dC1ob3Jpem9udGFsXCIsIFwibGF5b3V0LXZlcnRpY2FsXCIpO1xuXG4gICAgLy8gQWRkIGFwcHJvcHJpYXRlIHNpemUgY2xhc3NcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZChzaXplQ2xhc3MpO1xuICAgIGlmIChsYXlvdXRDbGFzcykge1xuICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQobGF5b3V0Q2xhc3MpO1xuICAgIH1cbiAgfTtcblxuICAvLyBHZXQgc2l6ZSBjbGFzcyBiYXNlZCBvbiBjb250YWluZXIgSEVJR0hUIChsaWtlIEV2YXBvQ3JvcFYxMClcbiAgZ2V0U2l6ZUNsYXNzID0gKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogc3RyaW5nID0+IHtcbiAgICAvLyBVc2UgaGVpZ2h0IGFzIHByaW1hcnkgZGltZW5zaW9uIGZvciB2ZXJ0aWNhbCBsYXlvdXRcbiAgICBpZiAoaGVpZ2h0IDwgNTApIHJldHVybiBcInNpemUteHNcIjtcbiAgICBpZiAoaGVpZ2h0IDwgODApIHJldHVybiBcInNpemUtc21cIjtcbiAgICBpZiAoaGVpZ2h0IDwgMTIwKSByZXR1cm4gXCJzaXplLW1kXCI7XG4gICAgaWYgKGhlaWdodCA8IDE4MCkgcmV0dXJuIFwic2l6ZS1sZ1wiO1xuICAgIHJldHVybiBcInNpemUteGxcIjtcbiAgfTtcblxuICAvLyBHZXQgbGF5b3V0IGNsYXNzIGJhc2VkIG9uIGFzcGVjdCByYXRpb1xuICBnZXRMYXlvdXRDbGFzcyA9ICh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHN0cmluZyB8IG51bGwgPT4ge1xuICAgIC8vIEFsd2F5cyB2ZXJ0aWNhbCBsYXlvdXQgLSBsYW5ndWFnZSBhbmQgdGhlbWUgc3RhY2tlZFxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIGhhbmRsZUNsaWNrT3V0c2lkZSA9IChldmVudDogTW91c2VFdmVudCkgPT4ge1xuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldCBhcyBOb2RlO1xuICAgIGlmIChcbiAgICAgIHRoaXMubGFuZ0Ryb3Bkb3duUmVmLmN1cnJlbnQgJiZcbiAgICAgICF0aGlzLmxhbmdEcm9wZG93blJlZi5jdXJyZW50LmNvbnRhaW5zKHRhcmdldClcbiAgICApIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc0xhbmdPcGVuOiBmYWxzZSwgbGFuZ01lbnVQb3NpdGlvbjogbnVsbCB9KTtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgdGhpcy50aGVtZURyb3Bkb3duUmVmLmN1cnJlbnQgJiZcbiAgICAgICF0aGlzLnRoZW1lRHJvcGRvd25SZWYuY3VycmVudC5jb250YWlucyh0YXJnZXQpXG4gICAgKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgaXNUaGVtZU9wZW46IGZhbHNlLCB0aGVtZU1lbnVQb3NpdGlvbjogbnVsbCB9KTtcbiAgICB9XG4gIH07XG5cbiAgaGFuZGxlRXNjYXBlID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgaWYgKGV2ZW50LmtleSA9PT0gXCJFc2NhcGVcIikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzTGFuZ09wZW46IGZhbHNlLFxuICAgICAgICBpc1RoZW1lT3BlbjogZmFsc2UsXG4gICAgICAgIGxhbmdNZW51UG9zaXRpb246IG51bGwsXG4gICAgICAgIHRoZW1lTWVudVBvc2l0aW9uOiBudWxsLFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGhhbmRsZVNjcm9sbCA9ICgpID0+IHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzTGFuZ09wZW46IGZhbHNlLFxuICAgICAgaXNUaGVtZU9wZW46IGZhbHNlLFxuICAgICAgbGFuZ01lbnVQb3NpdGlvbjogbnVsbCxcbiAgICAgIHRoZW1lTWVudVBvc2l0aW9uOiBudWxsLFxuICAgIH0pO1xuICB9O1xuXG4gIGhhbmRsZVJlc2l6ZSA9ICgpID0+IHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzTGFuZ09wZW46IGZhbHNlLFxuICAgICAgaXNUaGVtZU9wZW46IGZhbHNlLFxuICAgICAgbGFuZ01lbnVQb3NpdGlvbjogbnVsbCxcbiAgICAgIHRoZW1lTWVudVBvc2l0aW9uOiBudWxsLFxuICAgIH0pO1xuICB9O1xuXG4gIHRvZ2dsZUxhbmdEcm9wZG93biA9IChlOiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGlzVGhlbWVPcGVuOiBmYWxzZSwgdGhlbWVNZW51UG9zaXRpb246IG51bGwgfSk7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNMYW5nT3Blbikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGlzTGFuZ09wZW46IGZhbHNlLCBsYW5nTWVudVBvc2l0aW9uOiBudWxsIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBidXR0b24gPSB0aGlzLmxhbmdCdXR0b25SZWYuY3VycmVudDtcbiAgICAgIGlmIChidXR0b24pIHtcbiAgICAgICAgY29uc3QgcmVjdCA9IGJ1dHRvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgaXNMYW5nT3BlbjogdHJ1ZSxcbiAgICAgICAgICBsYW5nTWVudVBvc2l0aW9uOiB7XG4gICAgICAgICAgICB0b3A6IHJlY3QuYm90dG9tLFxuICAgICAgICAgICAgbGVmdDogcmVjdC5sZWZ0LFxuICAgICAgICAgICAgd2lkdGg6IHJlY3Qud2lkdGgsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgaXNMYW5nT3BlbjogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdG9nZ2xlVGhlbWVEcm9wZG93biA9IChlOiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGlzTGFuZ09wZW46IGZhbHNlLCBsYW5nTWVudVBvc2l0aW9uOiBudWxsIH0pO1xuICAgIGlmICh0aGlzLnN0YXRlLmlzVGhlbWVPcGVuKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgaXNUaGVtZU9wZW46IGZhbHNlLCB0aGVtZU1lbnVQb3NpdGlvbjogbnVsbCB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYnV0dG9uID0gdGhpcy50aGVtZUJ1dHRvblJlZi5jdXJyZW50O1xuICAgICAgaWYgKGJ1dHRvbikge1xuICAgICAgICBjb25zdCByZWN0ID0gYnV0dG9uLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBpc1RoZW1lT3BlbjogdHJ1ZSxcbiAgICAgICAgICB0aGVtZU1lbnVQb3NpdGlvbjoge1xuICAgICAgICAgICAgdG9wOiByZWN0LmJvdHRvbSxcbiAgICAgICAgICAgIGxlZnQ6IHJlY3QubGVmdCxcbiAgICAgICAgICAgIHdpZHRoOiByZWN0LndpZHRoLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGlzVGhlbWVPcGVuOiB0cnVlIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBzZWxlY3RMYW5nT3B0aW9uID0gKGNvZGU6IExhbmdDb2RlLCBlOiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdGhpcy5zZXRMYW5ndWFnZShjb2RlKTtcbiAgICB0aGlzLnNldFN0YXRlKHsgaXNMYW5nT3BlbjogZmFsc2UsIGxhbmdNZW51UG9zaXRpb246IG51bGwgfSk7XG4gIH07XG5cbiAgc2VsZWN0VGhlbWVPcHRpb24gPSAoY29kZTogVGhlbWVNb2RlLCBlOiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdGhpcy5zZXRUaGVtZShjb2RlKTtcbiAgICB0aGlzLnNldFN0YXRlKHsgaXNUaGVtZU9wZW46IGZhbHNlLCB0aGVtZU1lbnVQb3NpdGlvbjogbnVsbCB9KTtcbiAgfTtcblxuICBvbkV4dGVybmFsTGFuZ3VhZ2VDaGFuZ2VkID0gKGV2OiBFdmVudCkgPT4ge1xuICAgIGNvbnN0IGNlID0gZXYgYXMgQ3VzdG9tRXZlbnQ7XG4gICAgaWYgKGNlPy5kZXRhaWw/LnNvdXJjZSA9PT0gXCJMb2NhbGl6YXRpb25XaWRnZXRcIikgcmV0dXJuO1xuICAgIGNvbnN0IGxhbmcgPSBub3JtYWxpemVMYW5nKGNlPy5kZXRhaWw/LmxhbmcpO1xuICAgIGlmIChsYW5nICE9PSB0aGlzLnN0YXRlLmxhbmcgJiYgdGhpcy5faXNNb3VudGVkKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgbGFuZyB9KTtcbiAgICB9XG4gIH07XG5cbiAgb25FeHRlcm5hbFRoZW1lQ2hhbmdlZCA9IChldjogRXZlbnQpID0+IHtcbiAgICBjb25zdCBjZSA9IGV2IGFzIEN1c3RvbUV2ZW50O1xuICAgIGlmIChjZT8uZGV0YWlsPy5zb3VyY2UgPT09IFwiTG9jYWxpemF0aW9uV2lkZ2V0XCIpIHJldHVybjtcbiAgICBjb25zdCB0aGVtZSA9IG5vcm1hbGl6ZVRoZW1lKGNlPy5kZXRhaWw/LnRoZW1lKTtcbiAgICBpZiAodGhlbWUgIT09IHRoaXMuc3RhdGUudGhlbWUgJiYgdGhpcy5faXNNb3VudGVkKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgdGhlbWUgfSk7XG4gICAgfVxuICB9O1xuXG4gIHNldExhbmd1YWdlID0gKGxhbmc6IExhbmdDb2RlKTogdm9pZCA9PiB7XG4gICAgaWYgKGxhbmcgPT09IHRoaXMuc3RhdGUubGFuZykgcmV0dXJuO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBsYW5nIH0sICgpID0+IHtcbiAgICAgIHBlcnNpc3RMYW5ndWFnZShsYW5nKTtcbiAgICAgIGJyb2FkY2FzdExhbmd1YWdlQ2hhbmdlKGxhbmcpO1xuICAgIH0pO1xuICB9O1xuXG4gIHNldFRoZW1lID0gKHRoZW1lOiBUaGVtZU1vZGUpOiB2b2lkID0+IHtcbiAgICBpZiAodGhlbWUgPT09IHRoaXMuc3RhdGUudGhlbWUpIHJldHVybjtcbiAgICB0aGlzLnNldFN0YXRlKHsgdGhlbWUgfSwgKCkgPT4ge1xuICAgICAgcGVyc2lzdFRoZW1lKHRoZW1lKTtcbiAgICAgIGJyb2FkY2FzdFRoZW1lQ2hhbmdlKHRoZW1lKTtcbiAgICB9KTtcbiAgfTtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge1xuICAgICAgbGFuZyxcbiAgICAgIHRoZW1lLFxuICAgICAgaXNMYW5nT3BlbixcbiAgICAgIGlzVGhlbWVPcGVuLFxuICAgICAgbGFuZ01lbnVQb3NpdGlvbixcbiAgICAgIHRoZW1lTWVudVBvc2l0aW9uLFxuICAgIH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgLy8gRGluYW1payB0aGVtZSBvcHRpb25zIC0gdGlsZ2EgcWFyYWJcbiAgICBjb25zdCBUSEVNRV9PUFRJT05TID0gZ2V0VGhlbWVPcHRpb25zKGxhbmcpO1xuXG4gICAgY29uc3QgY3VycmVudExhbmdPcHRpb24gPVxuICAgICAgTEFOR19PUFRJT05TLmZpbmQoKG9wdCkgPT4gb3B0LmNvZGUgPT09IGxhbmcpIHx8IExBTkdfT1BUSU9OU1swXTtcbiAgICBjb25zdCBjdXJyZW50VGhlbWVPcHRpb24gPVxuICAgICAgVEhFTUVfT1BUSU9OUy5maW5kKChvcHQpID0+IG9wdC5jb2RlID09PSB0aGVtZSkgfHwgVEhFTUVfT1BUSU9OU1sxXTtcblxuICAgIGNvbnN0IGxhbmdNZW51U3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSBsYW5nTWVudVBvc2l0aW9uXG4gICAgICA/IHtcbiAgICAgICAgICBwb3NpdGlvbjogXCJmaXhlZFwiLFxuICAgICAgICAgIHRvcDogbGFuZ01lbnVQb3NpdGlvbi50b3AsXG4gICAgICAgICAgbGVmdDogbGFuZ01lbnVQb3NpdGlvbi5sZWZ0LFxuICAgICAgICAgIHdpZHRoOiBsYW5nTWVudVBvc2l0aW9uLndpZHRoLFxuICAgICAgICAgIHpJbmRleDogOTk5OTk5LFxuICAgICAgICB9XG4gICAgICA6IHt9O1xuXG4gICAgY29uc3QgdGhlbWVNZW51U3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB0aGVtZU1lbnVQb3NpdGlvblxuICAgICAgPyB7XG4gICAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAgICAgICB0b3A6IHRoZW1lTWVudVBvc2l0aW9uLnRvcCxcbiAgICAgICAgICBsZWZ0OiB0aGVtZU1lbnVQb3NpdGlvbi5sZWZ0LFxuICAgICAgICAgIHdpZHRoOiB0aGVtZU1lbnVQb3NpdGlvbi53aWR0aCxcbiAgICAgICAgICB6SW5kZXg6IDk5OTk5OSxcbiAgICAgICAgfVxuICAgICAgOiB7fTtcblxuICAgIC8vIEdldCBsYW5ndWFnZSBsYWJlbCBiYXNlZCBvbiBjdXJyZW50IGxhbmd1YWdlXG4gICAgY29uc3QgbGFuZ0xhYmVsczogUmVjb3JkPExhbmdDb2RlLCBzdHJpbmc+ID0ge1xuICAgICAgdXpfbGF0OiBcIlRpbFwiLFxuICAgICAgdXpfY3lybDogXCLQotC40LtcIixcbiAgICAgIHJ1OiBcItCv0LfRi9C6XCIsXG4gICAgfTtcbiAgICBjb25zdCBjdXJyZW50TGFuZ0xhYmVsID0gbGFuZ0xhYmVsc1tsYW5nXSB8fCBcIkxhbmd1YWdlXCI7XG4gICAgY29uc3QgaGVhZGVyTGFiZWxzID0gSEVBREVSX0xBQkVMU1tsYW5nXTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImxvYy13aWRnZXQtcm9vdFwiIHJlZj17dGhpcy5jb250YWluZXJSZWZ9PlxuICAgICAgICB7LyogSGVhZGVyIFRleHQgU2VjdGlvbiAtIExlZnQgU2lkZSAqL31cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoZWFkZXItdGV4dC1zZWN0aW9uXCI+XG4gICAgICAgICAgPGgxIGNsYXNzTmFtZT1cImhlYWRlci10aXRsZS1sYXJnZVwiPntoZWFkZXJMYWJlbHMud2F0ZXJ9PC9oMT5cbiAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwiaGVhZGVyLXRpdGxlLXNtYWxsXCI+e2hlYWRlckxhYmVscy5zcGFjZU1vbml0b3Jpbmd9PC9oMj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgey8qIENvbnRyb2xzIFNlY3Rpb24gLSBSaWdodCBTaWRlICovfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRyb2xzLXNlY3Rpb25cIj5cbiAgICAgICAgICB7LyogTGFuZ3VhZ2UgRHJvcGRvd24gLSBOZXcgRGVzaWduICovfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGFuZ3VhZ2Utc2VsZWN0b3Itd3JhcFwiIHJlZj17dGhpcy5sYW5nRHJvcGRvd25SZWZ9PlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHJlZj17dGhpcy5sYW5nQnV0dG9uUmVmfVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtcImxhbmctcGlja2VyLWJ0blwiICsgKGlzTGFuZ09wZW4gPyBcIiBhY3RpdmVcIiA6IFwiXCIpfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy50b2dnbGVMYW5nRHJvcGRvd259XG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIHRpdGxlPVwiVGlsIHRhbmxhc2hcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIHsvKiBHbG9iZSBJY29uICovfVxuICAgICAgICAgICAgPHN2Z1xuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJnbG9iZS1pY29uXCJcbiAgICAgICAgICAgICAgdmlld0JveD1cIjAgMCAyNCAyNFwiXG4gICAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxLjVcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjEwXCIgLz5cbiAgICAgICAgICAgICAgPGVsbGlwc2UgY3g9XCIxMlwiIGN5PVwiMTJcIiByeD1cIjRcIiByeT1cIjEwXCIgLz5cbiAgICAgICAgICAgICAgPHBhdGggZD1cIk0yIDEyaDIwXCIgLz5cbiAgICAgICAgICAgICAgPHBhdGggZD1cIk0xMiAyYzIuNSAzIDQgNi41IDQgMTBzLTEuNSA3LTQgMTBcIiAvPlxuICAgICAgICAgICAgICA8cGF0aCBkPVwiTTEyIDJjLTIuNSAzLTQgNi41LTQgMTBzMS41IDcgNCAxMFwiIC8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIHsvKiBMYW5ndWFnZSBUZXh0ICovfVxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibGFuZy10ZXh0XCI+e2N1cnJlbnRMYW5nTGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgey8qIENoZXZyb24gKi99XG4gICAgICAgICAgICA8c3ZnXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImNoZXZyb24taWNvblwiXG4gICAgICAgICAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPVwiMi41XCJcbiAgICAgICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxwb2x5bGluZSBwb2ludHM9XCI2IDkgMTIgMTUgMTggOVwiIC8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgIHtpc0xhbmdPcGVuICYmIChcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibGFuZy1tZW51LXBvcHVwXCJcbiAgICAgICAgICAgICAgcm9sZT1cImxpc3Rib3hcIlxuICAgICAgICAgICAgICBzdHlsZT17bGFuZ01lbnVTdHlsZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge0xBTkdfT1BUSU9OUy5tYXAoKG9wdCkgPT4gKFxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgIGtleT17b3B0LmNvZGV9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e1xuICAgICAgICAgICAgICAgICAgICBcImxhbmctbWVudS1jaG9pY2VcIiArIChsYW5nID09PSBvcHQuY29kZSA/IFwiIGFjdGl2ZVwiIDogXCJcIilcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB0aGlzLnNlbGVjdExhbmdPcHRpb24ob3B0LmNvZGUsIGUpfVxuICAgICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibGFuZy1vcHRpb24tY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJsYW5nLW9wdGlvbi1mbGFnXCI+e29wdC5mbGFnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibGFuZy1vcHRpb24tdGV4dFwiPntvcHQubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAge2xhbmcgPT09IG9wdC5jb2RlICYmIDxzcGFuIGNsYXNzTmFtZT1cImNoZWNrbWFya1wiPuKckzwvc3Bhbj59XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIHsvKiBUaGVtZSBUb2dnbGUgLSBTYW1lIERlc2lnbiBhcyBMYW5ndWFnZSAqL31cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRoZW1lLXNlbGVjdG9yLXdyYXBcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9e1xuICAgICAgICAgICAgICBcInRoZW1lLXBpY2tlci1idG5cIiArICh0aGVtZSA9PT0gXCJkYXJrXCIgPyBcIiBkYXJrXCIgOiBcIiBsaWdodFwiKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5zZXRUaGVtZSh0aGVtZSA9PT0gXCJkYXJrXCIgPyBcImxpZ2h0XCIgOiBcImRhcmtcIil9XG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIHRpdGxlPXtcbiAgICAgICAgICAgICAgdGhlbWUgPT09IFwiZGFya1wiXG4gICAgICAgICAgICAgICAgPyBcIkt1bmR1eiByZWppbWlnYSBvJ3Rpc2hcIlxuICAgICAgICAgICAgICAgIDogXCJUdW5naSByZWppbWdhIG8ndGlzaFwiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgey8qIFRoZW1lIEljb24gKi99XG4gICAgICAgICAgICB7dGhlbWUgPT09IFwiZGFya1wiID8gKFxuICAgICAgICAgICAgICA8c3ZnXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidGhlbWUtaWNvblwiXG4gICAgICAgICAgICAgICAgdmlld0JveD1cIjAgMCAyNCAyNFwiXG4gICAgICAgICAgICAgICAgZmlsbD1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgICAgICAgc3Ryb2tlPVwibm9uZVwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTIxIDEyLjc5QTkgOSAwIDEgMSAxMS4yMSAzIDcgNyAwIDAgMCAyMSAxMi43OXpcIiAvPlxuICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxzdmdcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0aGVtZS1pY29uXCJcbiAgICAgICAgICAgICAgICB2aWV3Qm94PVwiMCAwIDI0IDI0XCJcbiAgICAgICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD1cIjJcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCI0XCIgLz5cbiAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTEyIDJ2Mk0xMiAyMHYyTTQuOTMgNC45M2wxLjQxIDEuNDFNMTcuNjYgMTcuNjZsMS40MSAxLjQxTTIgMTJoMk0yMCAxMmgyTTQuOTMgMTkuMDdsMS40MS0xLjQxTTE3LjY2IDYuMzRsMS40MS0xLjQxXCIgLz5cbiAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgey8qIFRoZW1lIFRleHQgKi99XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0aGVtZS10ZXh0XCI+XG4gICAgICAgICAgICAgIHt0aGVtZSA9PT0gXCJkYXJrXCJcbiAgICAgICAgICAgICAgICA/IFRIRU1FX0xBQkVMUy5kYXJrW2xhbmddXG4gICAgICAgICAgICAgICAgOiBUSEVNRV9MQUJFTFMubGlnaHRbbGFuZ119XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYWxpemF0aW9uV2lkZ2V0IGV4dGVuZHMgTG9jYWxpemF0aW9uV2lkZ2V0Q29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHM6IExvY2FsaXphdGlvbldpZGdldFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICB9XG59XG5cbiBleHBvcnQgZnVuY3Rpb24gX19zZXRfd2VicGFja19wdWJsaWNfcGF0aF9fKHVybCkgeyBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHVybCB9Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9