"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SharedNavBar = void 0;
var _react = _interopRequireWildcard(require("react"));
var _sharedContexts = require("@amc-platfrom/shared-contexts");
var _Icons = require("./Icons");
var _reactRouterDom = require("react-router-dom");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var MegaMenuItem = function MegaMenuItem(_ref) {
  var href = _ref.href,
    product = _ref.product,
    icon = _ref.icon,
    title = _ref.title,
    desc = _ref.desc,
    userClaims = _ref.userClaims;
  var isSubscribed = userClaims && userClaims.products && userClaims.products[product];
  var targetUrl = isSubscribed ? "/app/".concat(product) : href; // Example logic

  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("a", {
    href: targetUrl,
    className: "mega-menu-item group text-decoration-none",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "item-icon",
      children: icon
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "item-title",
        children: title
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "item-desc",
        children: desc
      })]
    })]
  });
};
var SharedNavBar = exports.SharedNavBar = function SharedNavBar(_ref2) {
  var onLoginClick = _ref2.onLoginClick,
    _ref2$isAdminPanel = _ref2.isAdminPanel,
    isAdminPanel = _ref2$isAdminPanel === void 0 ? false : _ref2$isAdminPanel;
  var _useAuth = (0, _sharedContexts.useAuth)(),
    user = _useAuth.user,
    claims = _useAuth.claims,
    logout = _useAuth.logout;
  var _useState = (0, _react.useState)(null),
    _useState2 = _slicedToArray(_useState, 2),
    activeMenu = _useState2[0],
    setActiveMenu = _useState2[1];
  var menuTimeoutRef = (0, _react.useRef)(null);
  var openMenu = function openMenu(menuId) {
    clearTimeout(menuTimeoutRef.current);
    setActiveMenu(menuId);
  };
  var closeMenu = function closeMenu() {
    menuTimeoutRef.current = setTimeout(function () {
      setActiveMenu(null);
    }, 200);
  };
  (0, _react.useEffect)(function () {
    return function () {
      return clearTimeout(menuTimeoutRef.current);
    };
  }, []);
  var menuData = {
    'digital-twins': [{
      href: '/products/digital-twin-x',
      product: 'digitalTwinX',
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.DigitalTwinIcon, {}),
      title: 'Digital Twin X',
      desc: 'Podstawowa symulacja procesów.'
    }, {
      href: '/products/digital-twin-ai',
      product: 'digitalTwinAI',
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.AgentIcon, {}),
      title: 'Digital Twin AI',
      desc: 'Zaawansowane modele z AI.'
    }],
    'agenty-ai': [{
      href: '/products/agent-lean-ai',
      product: 'agentLeanAI',
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.AgentIcon, {}),
      title: 'Lean AI Agent',
      desc: 'Agent do analizy danych i optymalizacji.'
    }],
    'szkolenia': [{
      href: '/products/szkolenia-behawioralne',
      product: 'szkoleniaBehawioralne',
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.TrainingIcon, {}),
      title: 'Szkolenia behawioralne',
      desc: 'Rozwój kompetencji miękkich.'
    }],
    'wiecej': [{
      href: '/products/partnerzy',
      product: 'partnerzy',
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.PartnersIcon, {}),
      title: 'Partnerzy',
      desc: 'Nasi zaufani współpracownicy.'
    }, {
      href: '/products/o-nas',
      product: 'oNas',
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.AboutIcon, {}),
      title: 'O nas',
      desc: 'Poznaj naszą misję i zespół.'
    }, {
      href: '/products/kontakt',
      product: 'kontakt',
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.ContactIcon, {}),
      title: 'Kontakt',
      desc: 'Skontaktuj się z nami.'
    }]
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("header", {
      className: "top-bar",
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "flex justify-between items-center w-full max-w-7xl mx-auto px-8 h-full",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactRouterDom.Link, {
          to: "/",
          className: "platform-logo-topbar hover:opacity-80 transition-opacity no-underline",
          children: ["Platforma ", /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            className: "amc-highlight",
            children: "AMC"
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("nav", {
          className: "hidden lg:flex gap-6 items-center h-full ml-8",
          onMouseLeave: closeMenu,
          children: Object.keys(menuData).map(function (menuKey) {
            return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
              onMouseEnter: function onMouseEnter() {
                return openMenu(menuKey);
              },
              className: "nav-link-top h-full flex items-center cursor-pointer ".concat(activeMenu === menuKey ? 'active-hover' : ''),
              children: menuKey.replace('-', ' ').replace(/\b\w/g, function (l) {
                return l.toUpperCase();
              })
            }, menuKey);
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: "ml-auto",
          children: user ? claims !== null && claims !== void 0 && claims.admin && isAdminPanel ? /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            className: "flex items-center",
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
              className: "flex items-center justify-center w-7 h-7 rounded-full bg-slate-700",
              title: "Admin",
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.AdminIcon, {})
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
              className: "text-sm font-medium text-gray-300 ml-2",
              children: "Panel Administratora"
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
              onClick: logout,
              className: "btn-base sign-out-btn ml-4",
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.LogoutIcon, {}), " Wyloguj"]
            })]
          }) : /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            className: "flex items-center",
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactRouterDom.Link, {
              to: claims !== null && claims !== void 0 && claims.admin ? '/admin' : '/my-account',
              className: "flex items-center no-underline",
              title: claims !== null && claims !== void 0 && claims.admin ? 'Panel Administratora' : 'Moje Konto',
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
                className: "flex items-center justify-center w-7 h-7 rounded-full bg-slate-700",
                children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.UserIcon, {})
              })
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
              className: "text-sm font-medium text-gray-300 ml-2",
              children: ["Witaj, ", user.displayName || 'Użytkowniku']
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
              onClick: logout,
              className: "btn-base sign-out-btn ml-4",
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.LogoutIcon, {}), " Wyloguj"]
            })]
          }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
            onClick: onLoginClick,
            className: "btn-base sign-in-btn",
            children: "Zaloguj si\u0119"
          })
        })]
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      id: "mega-menu-panel",
      className: "fixed top-[var(--top-bar-height)] left-0 right-0 z-[999] shadow-2xl transition-all duration-300 ease-out ".concat(activeMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-full'),
      onMouseEnter: function onMouseEnter() {
        return openMenu(activeMenu);
      },
      onMouseLeave: closeMenu,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "max-w-7xl mx-auto p-10",
        children: Object.entries(menuData).map(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
            key = _ref4[0],
            items = _ref4[1];
          return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
            className: "mega-menu-content ".concat(activeMenu === key ? 'block' : 'hidden'),
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
              className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
              children: items.map(function (item) {
                return /*#__PURE__*/(0, _jsxRuntime.jsx)(MegaMenuItem, _objectSpread(_objectSpread({}, item), {}, {
                  userClaims: claims
                }), item.product);
              })
            })
          }, key);
        })
      })
    })]
  });
};