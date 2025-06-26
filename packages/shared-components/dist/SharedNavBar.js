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
var _excluded = ["href", "shellUrl", "children"]; // Ensure you have this Icons.js file with strokeWidth="1.0"
// The configuration for the mega menu content.
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
var menuConfig = {
  'digital-twins': {
    title: 'Digital Twins',
    items: [{
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.DigitalTwinXIcon, {}),
      title: 'Digital Twin X',
      desc: 'Basic process simulation.',
      href: '/products/digital-twin-x'
    }, {
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.DigitalTwinAIIcon, {}),
      title: 'Digital Twin AI',
      desc: 'Advanced models with AI.',
      href: '/products/digital-twin-ai'
    }, {
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.DigitalTwinSuperIcon, {}),
      title: 'Digital Twin Super',
      desc: 'Comprehensive digital twins.',
      href: '/products/digital-twin-super'
    }]
  },
  'agenty-ai': {
    title: 'AI Agents',
    items: [{
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.LeanAIAgentIcon, {}),
      title: 'Lean AI Agent',
      desc: 'Agent for data analysis and optimization.',
      href: '/products/agent-lean-ai'
    }, {
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.LeanAISuperAgentIcon, {}),
      title: 'Lean AI Super Agent',
      desc: 'Full automation with an AI agent.',
      href: '/products/lean-ai-super-agent'
    }]
  },
  'szkolenia': {
    title: 'Training',
    items: [{
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.BehavioralTrainingIcon, {}),
      title: 'Behavioral Training',
      desc: 'Soft skills development.',
      href: '/products/szkolenia-behawioralne'
    }, {
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.SkillsTrainingIcon, {}),
      title: 'Skills Training',
      desc: 'Practical technical workshops.',
      href: '/products/szkolenia-umiejetnosci'
    }]
  },
  'wiecej': {
    title: 'More',
    items: [{
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.PartnersIcon, {}),
      title: 'Partners',
      desc: 'Our trusted collaborators.',
      href: '/partners'
    }, {
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.AboutUsIcon, {}),
      title: 'About',
      desc: 'Get to know our mission and team.',
      href: '/about'
    }, {
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.ContactIcon, {}),
      title: 'Contact',
      desc: 'Contact us.',
      href: '/contact'
    }]
  }
};

/**
 * A versatile NavLink component that can render either a React Router <Link>
 * for internal navigation or a standard <a> tag for external navigation.
 */
var SmartNavLink = function SmartNavLink(_ref) {
  var href = _ref.href,
    shellUrl = _ref.shellUrl,
    children = _ref.children,
    props = _objectWithoutProperties(_ref, _excluded);
  if (shellUrl) {
    // If shellUrl is provided, it's an external link.
    // We construct the full URL and use a standard anchor tag.
    return /*#__PURE__*/(0, _jsxRuntime.jsx)("a", _objectSpread(_objectSpread({
      href: "".concat(shellUrl).concat(href)
    }, props), {}, {
      children: children
    }));
  }
  // Otherwise, use the React Router <Link> for client-side navigation.
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactRouterDom.Link, _objectSpread(_objectSpread({
    to: href
  }, props), {}, {
    children: children
  }));
};
var SharedNavBar = exports.SharedNavBar = function SharedNavBar(_ref2) {
  var user = _ref2.user,
    claims = _ref2.claims,
    onLogin = _ref2.onLogin,
    onLogout = _ref2.onLogout,
    shellUrl = _ref2.shellUrl;
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
  var mouseLeaveTimeoutRef = (0, _react.useRef)(null);
  var closingTimeoutRef = (0, _react.useRef)(null);
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
    mouseLeaveTimeoutRef.current = setTimeout(function () {
      setIsClosing(true);
      closingTimeoutRef.current = setTimeout(function () {
        setIsPanelVisible(false);
        setActiveMenu(null);
        setIsClosing(false);
      }, 300);
    }, 200);
  };
  var handleItemClick = function handleItemClick(href) {
    cancelClosing();
    setIsPanelVisible(false);
    setActiveMenu(null);
    if (shellUrl) {
      // If it's an external link, perform a full browser redirect.
      window.location.href = "".concat(shellUrl).concat(href);
    } else {
      // Otherwise, navigate internally.
      navigate(href);
    }
  };
  var panelClassName = [isPanelVisible ? 'active' : '', isClosing ? 'is-closing' : ''].filter(Boolean).join(' ');
  var ActiveMenuContent = activeMenu ? menuConfig[activeMenu] : null;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    onMouseLeave: handleMouseLeave,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("header", {
      className: "top-bar",
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "top-bar-content",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          className: "top-bar-left",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(SmartNavLink, {
            href: "/",
            shellUrl: shellUrl,
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
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(SmartNavLink, {
              href: "/admin",
              shellUrl: shellUrl,
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
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(SmartNavLink, {
              href: "/account",
              shellUrl: shellUrl,
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
  });
};