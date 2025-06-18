"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoginModal = void 0;
var _react = _interopRequireWildcard(require("react"));
var _sharedContexts = require("@amc-platfrom/shared-contexts");
var _Icons = require("./Icons");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var LoginModal = exports.LoginModal = function LoginModal(_ref) {
  var isOpen = _ref.isOpen,
    onClose = _ref.onClose;
  var _useAuth = (0, _sharedContexts.useAuth)(),
    login = _useAuth.login,
    mfaRequired = _useAuth.mfaRequired,
    mfaHint = _useAuth.mfaHint,
    resolveMfa = _useAuth.resolveMfa;
  var _useState = (0, _react.useState)(''),
    _useState2 = _slicedToArray(_useState, 2),
    email = _useState2[0],
    setEmail = _useState2[1];
  var _useState3 = (0, _react.useState)(''),
    _useState4 = _slicedToArray(_useState3, 2),
    password = _useState4[0],
    setPassword = _useState4[1];
  var _useState5 = (0, _react.useState)(''),
    _useState6 = _slicedToArray(_useState5, 2),
    mfaCode = _useState6[0],
    setMfaCode = _useState6[1];
  var _useState7 = (0, _react.useState)(false),
    _useState8 = _slicedToArray(_useState7, 2),
    isLoading = _useState8[0],
    setIsLoading = _useState8[1];
  var _useState9 = (0, _react.useState)(''),
    _useState0 = _slicedToArray(_useState9, 2),
    error = _useState0[0],
    setError = _useState0[1];
  var _useState1 = (0, _react.useState)('login'),
    _useState10 = _slicedToArray(_useState1, 2),
    currentStep = _useState10[0],
    setCurrentStep = _useState10[1]; // 'login' or 'mfa'

  (0, _react.useEffect)(function () {
    if (mfaRequired) {
      setCurrentStep('mfa');
      setIsLoading(false);
      setError('');
    }
  }, [mfaRequired]);
  (0, _react.useEffect)(function () {
    if (!isOpen) {
      // Reset state when modal is closed
      setTimeout(function () {
        setCurrentStep('login');
        setError('');
        setEmail('');
        setPassword('');
        setMfaCode('');
        setIsLoading(false);
      }, 300); // Delay to allow closing animation
    }
  }, [isOpen]);
  var handleLoginSubmit = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(e) {
      var result;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            e.preventDefault();
            setIsLoading(true);
            setError('');
            _context.n = 1;
            return login(email, password);
          case 1:
            result = _context.v;
            if (result.success) {
              onClose();
            } else if (!result.mfa) {
              setError(result.error || 'Nieprawidłowy email lub hasło.');
              setIsLoading(false);
            }
            // If MFA is required, useEffect will handle the step change
          case 2:
            return _context.a(2);
        }
      }, _callee);
    }));
    return function handleLoginSubmit(_x) {
      return _ref2.apply(this, arguments);
    };
  }();
  var handleMfaSubmit = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(e) {
      var result;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            e.preventDefault();
            setIsLoading(true);
            setError('');
            _context2.n = 1;
            return resolveMfa(mfaCode);
          case 1:
            result = _context2.v;
            if (result.success) {
              onClose();
            } else {
              setError(result.error || 'Wystąpił nieoczekiwany błąd.');
              setIsLoading(false);
            }
          case 2:
            return _context2.a(2);
        }
      }, _callee2);
    }));
    return function handleMfaSubmit(_x2) {
      return _ref3.apply(this, arguments);
    };
  }();
  if (!isOpen) return null;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    className: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50",
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "modal-card w-full max-w-md p-8 rounded-2xl relative",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        onClick: onClose,
        className: "absolute top-4 right-4 text-gray-500 hover:text-white transition-colors",
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.CloseIcon, {})
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "modal-step ".concat(currentStep === 'login' ? 'active' : 'hidden'),
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
          className: "text-2xl font-bold text-text-primary mb-2",
          children: "Witaj z powrotem"
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "text-text-muted mb-6",
          children: "Zaloguj si\u0119, aby uzyska\u0107 dost\u0119p do platformy."
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("form", {
          onSubmit: handleLoginSubmit,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("label", {
              htmlFor: "email",
              className: "text-sm font-medium text-text-secondary block mb-2",
              children: "Email"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
              type: "email",
              id: "email",
              value: email,
              onChange: function onChange(e) {
                return setEmail(e.target.value);
              },
              className: "modal-input w-full text-sm rounded-lg",
              placeholder: "jan.kowalski@firma.com",
              required: true
            })]
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            className: "mt-4",
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("label", {
              htmlFor: "password",
              className: "text-sm font-medium text-text-secondary block mb-2",
              children: "Has\u0142o"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
              type: "password",
              id: "password",
              value: password,
              onChange: function onChange(e) {
                return setPassword(e.target.value);
              },
              className: "modal-input w-full text-sm rounded-lg",
              required: true
            })]
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
            className: "mt-6",
            children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
              type: "submit",
              disabled: isLoading,
              className: "modal-btn modal-btn-primary w-full inline-flex items-center justify-center gap-2 text-white font-medium rounded-lg text-sm py-3",
              children: [isLoading ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.SpinnerIcon, {}) : null, /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                children: isLoading ? 'Logowanie...' : 'Zaloguj się'
              })]
            })
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: "text-red-500 text-sm mt-4 text-center h-5",
          children: error && currentStep === 'login' ? error : ''
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "modal-step ".concat(currentStep === 'mfa' ? 'active' : 'hidden'),
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
          className: "text-2xl font-bold text-text-primary mb-2",
          children: "Weryfikacja dwuetapowa"
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
          className: "text-text-muted mb-6",
          children: ["Dla Twojego bezpiecze\u0144stwa, wpisz kod wys\u0142any na Tw\xF3j numer telefonu ", /*#__PURE__*/(0, _jsxRuntime.jsx)("strong", {
            className: "text-text-primary",
            children: mfaHint
          }), "."]
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("form", {
          onSubmit: handleMfaSubmit,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("label", {
              htmlFor: "mfaCode",
              className: "text-sm font-medium text-text-secondary block mb-2",
              children: "Kod weryfikacyjny (6 cyfr)"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
              type: "text",
              id: "mfaCode",
              value: mfaCode,
              onChange: function onChange(e) {
                return setMfaCode(e.target.value);
              },
              inputMode: "numeric",
              pattern: "\\d{6}",
              maxLength: "6",
              className: "modal-input w-full text-center text-xl tracking-[0.5em] rounded-lg",
              required: true
            })]
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
            className: "mt-6",
            children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
              type: "submit",
              disabled: isLoading,
              className: "modal-btn modal-btn-primary w-full inline-flex items-center justify-center gap-2 text-white font-medium rounded-lg text-sm py-3",
              children: [isLoading ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icons.SpinnerIcon, {}) : null, /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                children: isLoading ? 'Weryfikacja...' : 'Weryfikuj'
              })]
            })
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: "text-red-500 text-sm mt-4 text-center h-5",
          children: error && currentStep === 'mfa' ? error : ''
        })]
      })]
    })
  });
};