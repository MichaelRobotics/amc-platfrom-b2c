"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoginModal = void 0;
var _react = _interopRequireDefault(require("react"));
var _Icons = require("./Icons");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// packages/shared-components/src/LoginModal.jsx

var LoginModal = exports.LoginModal = function LoginModal(_ref) {
  var isOpen = _ref.isOpen,
    onClose = _ref.onClose,
    onLoginSubmit = _ref.onLoginSubmit,
    onMfaSubmit = _ref.onMfaSubmit,
    mfaHint = _ref.mfaHint,
    loginError = _ref.loginError,
    mfaError = _ref.mfaError,
    isLoading = _ref.isLoading,
    isMfa = _ref.isMfa;
  if (!isOpen) {
    return null;
  }
  var handleLogin = function handleLogin(e) {
    e.preventDefault();
    var formData = new FormData(e.target);
    var email = formData.get('email');
    var password = formData.get('password');
    onLoginSubmit(email, password);
  };
  var handleMfa = function handleMfa(e) {
    e.preventDefault();
    var formData = new FormData(e.target);
    var mfaCode = formData.get('mfaCode');
    onMfaSubmit(mfaCode);
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    className: "modal-overlay ".concat(isOpen ? 'active' : ''),
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "modal-card relative",
      style: {
        maxWidth: '420px'
      },
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        id: "loginStep",
        className: "modal-step ".concat(!isMfa ? 'active' : ''),
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          className: "modal-header",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
            className: "modal-title",
            children: "Witaj z powrotem"
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
            onClick: onClose,
            className: "modal-close-btn",
            children: "\xD7"
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("form", {
          onSubmit: handleLogin,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            className: "modal-body",
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
              className: "mb-6",
              children: "Zaloguj si\u0119, aby uzyska\u0107 dost\u0119p do platformy."
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("label", {
                htmlFor: "email-input",
                className: "form-label",
                children: "Email"
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
                type: "email",
                id: "email-input",
                name: "email",
                className: "modal-input",
                placeholder: "jan.kowalski@firma.com",
                required: true
              })]
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
              children: [" ", /*#__PURE__*/(0, _jsxRuntime.jsx)("label", {
                htmlFor: "password-input",
                className: "form-label",
                children: "Has\u0142o"
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
                type: "password",
                id: "password-input",
                name: "password",
                className: "modal-input",
                required: true
              })]
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
              className: "text-red-500 text-sm text-center h-5",
              children: loginError
            })]
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
            className: "modal-footer",
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
              type: "submit",
              className: "modal-btn modal-btn-primary w-full",
              disabled: isLoading && !isMfa,
              children: isLoading && !isMfa ? /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
                children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                  className: "spinner-modal"
                }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                  children: "Logowanie..."
                })]
              }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                children: "Zaloguj si\u0119"
              })
            })
          })]
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        id: "mfaStep",
        className: "modal-step ".concat(isMfa ? 'active' : ''),
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          className: "modal-header",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
            className: "modal-title",
            children: "Weryfikacja dwuetapowa"
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
            onClick: onClose,
            className: "modal-close-btn",
            children: "\xD7"
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("form", {
          onSubmit: handleMfa,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            className: "modal-body",
            children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
              className: "mb-6",
              children: ["Dla Twojego bezpiecze\u0144stwa, wpisz kod wys\u0142any na Tw\xF3j numer telefonu ", /*#__PURE__*/(0, _jsxRuntime.jsx)("strong", {
                className: "text-text-primary",
                children: mfaHint
              }), "."]
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("label", {
                htmlFor: "mfaCode-input",
                className: "form-label",
                children: "Kod weryfikacyjny (6 cyfr)"
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
                type: "text",
                id: "mfaCode-input",
                name: "mfaCode",
                inputMode: "numeric",
                pattern: "\\d{6}",
                maxLength: "6",
                className: "modal-input text-center text-xl tracking-[0.5em]",
                required: true
              })]
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
              className: "text-red-500 text-sm text-center h-5",
              children: mfaError
            })]
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
            className: "modal-footer",
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
              type: "submit",
              className: "modal-btn modal-btn-primary w-full",
              disabled: isLoading && isMfa,
              children: isLoading && isMfa ? /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
                children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                  className: "spinner-modal"
                }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                  children: "Weryfikacja..."
                })]
              }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                children: "Weryfikuj"
              })
            })
          })]
        })]
      })]
    })
  });
};