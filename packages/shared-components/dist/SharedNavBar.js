"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SharedNavBar = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactRouterDom = require("react-router-dom");
var _Icons = require("./Icons");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; } // Ensure you have this Icons.js file with strokeWidth="1.0"
// The configuration for the mega menu content.
var menuConfig = {
  'digital-twins': {
    title: 'Digital Twins',
    items: [{
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.DigitalTwinXIcon, {}),
      title: 'Digital Twin X',
      desc: 'Podstawowa symulacja procesów.',
      href: '/products/digital-twin-x'
    }, {
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.DigitalTwinAIIcon, {}),
      title: 'Digital Twin AI',
      desc: 'Zaawansowane modele z AI.',
      href: '/products/digital-twin-ai'
    }, {
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.DigitalTwinSuperIcon, {}),
      title: 'Digital Twin Super',
      desc: 'Kompleksowe bliźniaki cyfrowe.',
      href: '/products/digital-twin-super'
    }]
  },
  'agenty-ai': {
    title: 'Agenty AI',
    items: [{
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.LeanAIAgentIcon, {}),
      title: 'Lean AI Agent',
      desc: 'Agent do analizy danych i optymalizacji.',
      href: '/products/agent-lean-ai'
    }, {
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.LeanAISuperAgentIcon, {}),
      title: 'Lean AI Super Agent',
      desc: 'Pełna automatyzacja z agentem AI.',
      href: '/products/lean-ai-super-agent'
    }]
  },
  'szkolenia': {
    title: 'Szkolenia',
    items: [{
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.BehavioralTrainingIcon, {}),
      title: 'Szkolenia behawioralne',
      desc: 'Rozwój kompetencji miękkich.',
      href: '/products/szkolenia-behawioralne'
    }, {
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.SkillsTrainingIcon, {}),
      title: 'Szkolenia umiejętności',
      desc: 'Praktyczne warsztaty techniczne.',
      href: '/products/szkolenia-umiejetnosci'
    }]
  },
  'wiecej': {
    title: 'Więcej',
    items: [{
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.PartnersIcon, {}),
      title: 'Partnerzy',
      desc: 'Nasi zaufani współpracownicy.',
      href: '/partners'
    }, {
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.AboutUsIcon, {}),
      title: 'O nas',
      desc: 'Poznaj naszą misję i zespół.',
      href: '/about'
    }, {
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.ContactIcon, {}),
      title: 'Kontakt',
      desc: 'Skontaktuj się z nami.',
      href: '/contact'
    }]
  }
};
var SharedNavBar = exports.SharedNavBar = function SharedNavBar(_ref) {
  var user = _ref.user,
    claims = _ref.claims,
    onLogin = _ref.onLogin,
    onLogout = _ref.onLogout;
  var _useState = (0, _react.useState)(null),
    _useState2 = _slicedToArray(_useState, 2),
    activeMenu = _useState2[0],
    setActiveMenu = _useState2[1];
  var _useState3 = (0, _react.useState)(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isPanelVisible = _useState4[0],
    setIsPanelVisible = _useState4[1];
  var _useState5 = (0, _react.useState)(false),
    _useState6 = _slicedToArray(_useState5, 2),
    isClosing = _useState6[0],
    setIsClosing = _useState6[1];
  var navigate = (0, _reactRouterDom.useNavigate)();
  // Use useRef to hold timer IDs, which persists them across renders.
  var mouseLeaveTimeoutRef = (0, _react.useRef)(null);
  var closingTimeoutRef = (0, _react.useRef)(null);

  // This function cancels all pending "close" actions.
  var cancelClosing = function cancelClosing() {
    clearTimeout(mouseLeaveTimeoutRef.current);
    clearTimeout(closingTimeoutRef.current);
    setIsClosing(false);
  };
  var handleMouseEnter = function handleMouseEnter(menuKey) {
    cancelClosing();
    setActiveMenu(menuKey);
    setIsPanelVisible(true);
  };
  var handleMouseLeave = function handleMouseLeave() {
    // Start a timer to close the menu.
    mouseLeaveTimeoutRef.current = setTimeout(function () {
      setIsClosing(true); // Trigger the .is-closing CSS animation

      // After the animation is done (300ms), fully hide the panel and reset state.
      closingTimeoutRef.current = setTimeout(function () {
        setIsPanelVisible(false);
        setActiveMenu(null);
        setIsClosing(false);
      }, 300); // Must match the animation duration in CSS
    }, 200);
  };
  var handleItemClick = function handleItemClick(href) {
    cancelClosing();
    setIsPanelVisible(false);
    setActiveMenu(null);
    navigate(href);
  };

  // Construct the className string for the panel dynamically
  var panelClassName = [isPanelVisible ? 'active' : '', isClosing ? 'is-closing' : ''].filter(Boolean).join(' ');
  var ActiveMenuContent = activeMenu ? menuConfig[activeMenu] : null;

  // In SharedNavBar.js, update the entire return block

  return (
    /*#__PURE__*/
    // This parent container handles the main mouse leave event
    (0, _jsxRuntime.jsxs)("div", {
      onMouseLeave: handleMouseLeave,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("header", {
        className: "top-bar",
        children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          className: "top-bar-content",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            className: "top-bar-left",
            children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactRouterDom.Link, {
              to: "/",
              className: "platform-logo-topbar hover:opacity-80 transition-opacity",
              children: ["Platforma ", /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                className: "amc-highlight",
                children: "AMC"
              })]
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("nav", {
              className: "top-nav-links",
              children: Object.keys(menuConfig).map(function (key) {
                return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
                  className: "nav-link-top ".concat(activeMenu === key ? 'active-hover' : ''),
                  onMouseEnter: function onMouseEnter() {
                    return handleMouseEnter(key);
                  },
                  children: menuConfig[key].title
                }, key);
              })
            })]
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
            className: "user-status-container",
            children: user ? claims !== null && claims !== void 0 && claims.admin ? /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
              className: "admin-status-in",
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactRouterDom.Link, {
                to: "/admin",
                className: "user-avatar-icon",
                title: "Admin Panel",
                children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.AdminIcon, {})
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                className: "user-greeting",
                children: "Panel Administratora"
              }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
                onClick: onLogout,
                className: "btn-base sign-out-btn",
                children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.SignOutIcon, {}), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                  children: "Wyloguj"
                })]
              })]
            }) : /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
              className: "user-status-in",
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactRouterDom.Link, {
                to: "/account",
                className: "user-avatar-icon",
                title: "Moje Konto",
                children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.UserIcon, {})
              }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
                className: "user-greeting",
                children: ["Witaj, ", user.displayName || 'Użytkowniku']
              }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
                onClick: onLogout,
                className: "btn-base sign-out-btn",
                children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.SignOutIcon, {}), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                  children: "Wyloguj"
                })]
              })]
            }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
              className: "user-status-out",
              children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
                onClick: onLogin,
                className: "btn-base sign-in-btn",
                children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.SignInIcon, {}), "Zaloguj si\u0119"]
              })
            })
          })]
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        id: "mega-menu-panel",
        className: panelClassName,
        onMouseEnter: cancelClosing,
        children: ActiveMenuContent && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: "mega-menu-content",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
            className: "mega-menu-grid",
            children: ActiveMenuContent.items.map(function (item, index) {
              return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
                onClick: function onClick() {
                  return handleItemClick(item.href);
                },
                className: "mega-menu-item",
                children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
                  className: "item-icon",
                  children: item.icon
                }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
                  children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
                    className: "item-title",
                    children: item.title
                  }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
                    className: "item-desc",
                    children: item.desc
                  })]
                })]
              }, index);
            })
          })
        })
      })]
    })
  );
};