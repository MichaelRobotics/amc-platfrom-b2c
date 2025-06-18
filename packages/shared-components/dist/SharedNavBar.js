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
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; } // Ensure Icons.jsx is complete
// The configuration for the mega menu content. This makes it easy to update.
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
    }]
  },
  'agenty-ai': {
    title: 'Agenty AI',
    items: [{
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.LeanAIAgentIcon, {}),
      title: 'Lean AI Agent',
      desc: 'Agent do analizy danych i optymalizacji.',
      href: '/products/agent-lean-ai'
    }]
  },
  'szkolenia': {
    title: 'Szkolenia',
    items: [{
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.BehavioralTrainingIcon, {}),
      title: 'Szkolenia behawioralne',
      desc: 'Rozwój kompetencji miękkich.',
      href: '/products/szkolenia-behawioralne'
    }]
  },
  'wiecej': {
    title: 'Więcej',
    items: [{
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
  var navigate = (0, _reactRouterDom.useNavigate)();
  var menuTimeout; // Used to manage the delay before the menu closes.

  var handleMouseEnter = function handleMouseEnter(menu) {
    clearTimeout(menuTimeout);
    setActiveMenu(menu);
  };
  var handleMouseLeave = function handleMouseLeave() {
    // Set a brief timeout before closing the menu to allow the user's
    // mouse to travel from the link to the menu panel without it closing.
    menuTimeout = setTimeout(function () {
      setActiveMenu(null);
    }, 200);
  };

  // Navigate to the item's link using React Router and close the menu.
  var handleItemClick = function handleItemClick(href) {
    setActiveMenu(null);
    navigate(href);
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("header", {
      className: "top-bar",
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "top-bar-content",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactRouterDom.Link, {
          to: "/",
          className: "platform-logo-topbar hover:opacity-80 transition-opacity",
          children: ["Platforma ", /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            className: "amc-highlight",
            children: "AMC"
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("nav", {
          className: "top-nav-links",
          onMouseLeave: handleMouseLeave,
          children: Object.keys(menuConfig).map(function (key) {
            return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
              className: "nav-link-top ".concat(activeMenu === key ? 'active-hover' : ''),
              onMouseEnter: function onMouseEnter() {
                return handleMouseEnter(key);
              },
              children: menuConfig[key].title
            }, key);
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: "user-status-container",
          children: user ? claims !== null && claims !== void 0 && claims.admin ? /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            className: "admin-status-in",
            style: {
              display: 'flex'
            },
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactRouterDom.Link, {
              to: "/admin",
              className: "user-avatar-icon",
              title: "Admin Panel",
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.AdminIcon, {})
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
              className: "user-greeting ml-2",
              children: "Panel Administratora"
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
              onClick: onLogout,
              className: "btn-base sign-out-btn ml-4",
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.SignOutIcon, {}), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                children: "Wyloguj"
              })]
            })]
          }) : /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            className: "user-status-in",
            style: {
              display: 'flex'
            },
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactRouterDom.Link, {
              to: "/account",
              className: "user-avatar-icon",
              title: "Moje Konto",
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.UserIcon, {})
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
              className: "user-greeting ml-2",
              children: ["Witaj, ", user.displayName || 'Użytkowniku']
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
              onClick: onLogout,
              className: "btn-base sign-out-btn ml-4",
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
      className: activeMenu ? 'active' : '',
      onMouseEnter: function onMouseEnter() {
        return clearTimeout(menuTimeout);
      } // Keep menu open when mouse enters it
      ,
      onMouseLeave: handleMouseLeave // Close menu when mouse leaves it
      ,
      children: Object.keys(menuConfig).map(function (key) {
        return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          id: "menu-".concat(key),
          className: "mega-menu-content ".concat(activeMenu === key ? 'active' : ''),
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
            className: "mega-menu-grid",
            children: menuConfig[key].items.map(function (item, index) {
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
        }, key);
      })
    })]
  });
};