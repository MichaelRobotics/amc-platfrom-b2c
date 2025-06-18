"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProtectedRoute = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactRouterDom = require("react-router-dom");
var _sharedContexts = require("@amc-platfrom/shared-contexts");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/**
 * A client-side route guard.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The component to render if the user is authorized.
 * @param {string} props.product - The specific product claim required to access this route.
 */
var ProtectedRoute = exports.ProtectedRoute = function ProtectedRoute(_ref) {
  var children = _ref.children,
    product = _ref.product;
  var _useAuth = (0, _sharedContexts.useAuth)(),
    user = _useAuth.user,
    claims = _useAuth.claims,
    loading = _useAuth.loading;
  var location = (0, _reactRouterDom.useLocation)();
  if (loading) {
    // While checking auth state, show a loading indicator or a blank page.
    // This prevents a flash of the login page before the user session is loaded.
    return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "flex justify-center items-center h-screen",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "text-white",
        children: "Loading..."
      })
    });
  }
  var hasAccess = user && claims && claims.products && claims.products[product];
  if (!hasAccess) {
    // User is not authorized. Redirect them to the main landing page.
    // We also pass the original location they tried to access,
    // which could be used to show a message like "You need to subscribe to access this page."
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactRouterDom.Navigate, {
      to: "/",
      state: {
        from: location
      },
      replace: true
    });
  }

  // User is authorized, render the child components.
  return children;
};