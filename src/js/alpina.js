/** @format */

window._ALPINA_ID = "c917af68-1564-4a68-9735-4a31fa7bc33a";

var AlpinaJSWebAnalytics = (function (e) {
    var t = {};
    function n(r) {
        if (t[r]) return t[r].exports;
        var o = (t[r] = { i: r, l: !1, exports: {} });
        return e[r].call(o.exports, o, o.exports, n), (o.l = !0), o.exports;
    }
    return (
        (n.m = e),
        (n.c = t),
        (n.d = function (e, t, r) {
            n.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: r });
        }),
        (n.r = function (e) {
            "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
                Object.defineProperty(e, "__esModule", { value: !0 });
        }),
        (n.t = function (e, t) {
            if ((1 & t && (e = n(e)), 8 & t)) return e;
            if (4 & t && "object" == typeof e && e && e.__esModule) return e;
            var r = Object.create(null);
            if ((n.r(r), Object.defineProperty(r, "default", { enumerable: !0, value: e }), 2 & t && "string" != typeof e))
                for (var o in e)
                    n.d(
                        r,
                        o,
                        function (t) {
                            return e[t];
                        }.bind(null, o)
                    );
            return r;
        }),
        (n.n = function (e) {
            var t =
                e && e.__esModule
                    ? function () {
                          return e.default;
                      }
                    : function () {
                          return e;
                      };
            return n.d(t, "a", t), t;
        }),
        (n.o = function (e, t) {
            return Object.prototype.hasOwnProperty.call(e, t);
        }),
        (n.p = "/"),
        n((n.s = 0))
    );
})([
    function (e, t, n) {
        "use strict";
        n.r(t),
            n.d(t, "WebAnalytics", function () {
                return o;
            });
        var r = function () {
                return (r =
                    Object.assign ||
                    function (e) {
                        for (var t, n = 1, r = arguments.length; n < r; n++)
                            for (var o in (t = arguments[n])) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
                        return e;
                    }).apply(this, arguments);
            },
            o = function () {
                try {
                    var e = window,
                        t = e._ALPINA_ID || e._TOASTED_ID;
                    if (!t) return console.error("window._ALPINA_ID not found");
                    var n,
                        o = e.location || {},
                        a = e.navigator || {},
                        i = e.document,
                        l = function (r, l) {
                            if ("y" === localStorage.getItem("_ta" + t) || "y" === localStorage.getItem("_apnwa" + t))
                                return console.log("AlpinaWebAnalytics: Visit skipped");
                            var u = o.protocol + "//" + o.hostname + o.pathname;
                            if (
                                (!a.hasOwnProperty("doNotTrack") || "1" !== a.doNotTrack) &&
                                !/bot|googlebot|crawler|spider|robot|crawling/i.test(a.userAgent) &&
                                (n !== u || l)
                            ) {
                                n = u;
                                var c = {
                                    ua: a.userAgent,
                                    url: u,
                                    locale: a.language,
                                    ref: r ? "" : i.referrer,
                                    ps: r,
                                    s: { w: window.innerWidth, h: window.innerHeight },
                                    event: l,
                                };
                                try {
                                    var s = new URLSearchParams(e.location.search),
                                        p = s.get("utm_source"),
                                        f = s.get("ref");
                                    c.utm = p || f;
                                } catch (e) {}
                                var d = new XMLHttpRequest();
                                d.open("POST", "https://alpina.cloud/api/v1/waapi/" + t, !0),
                                    d.setRequestHeader("Content-Type", "application/json"),
                                    d.send(JSON.stringify(c));
                            }
                        },
                        u = history.pushState;
                    history.pushState = function () {
                        u.apply(history, arguments), l(!0);
                    };
                    var c = {
                        trigger: l,
                        emit: function (t, n) {
                            l(!0, { name: t, data: r(r({}, e.alpinaEventBase), n) });
                        },
                        setBaseEventProps: function (t) {
                            return (e.alpinaEventBase = t);
                        },
                    };
                    (e.alpinaWebAnalytics = c), (e.toastedAnalytics = c), l();
                } catch (e) {
                    console.log("AlpinaWebAnalytics: request failed", e);
                }
            };
        o(), window.onAlpinaWebAnalyticsLoad && window.onAlpinaWebAnalyticsLoad();
    },
]);
