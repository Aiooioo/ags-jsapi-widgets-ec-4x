var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/accessorSupport/decorators", "esri/core/promiseUtils", "dojo/_base/array", "dojo/on", "dojo/dom-construct", "dojo/Deferred", "esri/geometry/support/scaleUtils", "esri/geometry/Extent", "esri/tasks/support/Query", "esri/layers/GroupLayer", "esri/core/Accessor", "esri/core/Collection", "ec-widgets/FloatPop"], function (require, exports, decorators_1, promiseUtils, arrayUtil, on, domConstruct, Deferred, scaleUtils, Extent, Query, GroupLayer, Accessor, Collection, FloatPop) {
    "use strict";
    var FloatPopManager = /** @class */ (function (_super) {
        __extends(FloatPopManager, _super);
        function FloatPopManager(params) {
            var _this = _super.call(this) || this;
            _this.options = null;
            _this.floatpops = null;
            _this.autoclose = false;
            _this.layer = null;
            _this.features = null;
            _this._featureLayersCache = null;
            _this._clickHandle = null;
            _this._featureLayersCache = {};
            _this.floatpops = new Collection();
            _this.options = {
                shape: "normal",
                showButton: true,
            };
            return _this;
        }
        FloatPopManager.prototype.destroy = function () {
            this._featureLayersCache = {};
            this.view = null;
        };
        Object.defineProperty(FloatPopManager.prototype, "enabled", {
            set: function (value) {
                this._clickHandle && (value ? this._clickHandle.resume() : this._clickHandle.pause());
                this._set("enabled", value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FloatPopManager.prototype, "view", {
            set: function (value) {
                if (this._clickHandle) {
                    this._clickHandle.remove();
                    this._clickHandle = null;
                }
                if (value) {
                    this._clickHandle = on.pausable(value, "click", this._clickHandler.bind(this));
                    this.enabled || this._clickHandle.pause();
                }
                this._set("view", value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FloatPopManager.prototype, "map", {
            get: function () {
                return this.get("view.map") || null;
            },
            enumerable: true,
            configurable: true
        });
        FloatPopManager.prototype.closeAll = function () {
            if (this.autoclose) {
                if (this.floatpops && this.floatpops.length) {
                    this.floatpops.forEach(function (pop) {
                        pop.clear();
                        pop.close();
                    });
                }
            }
        };
        FloatPopManager.prototype.showAll = function () {
        };
        FloatPopManager.prototype._showPopup = function (b, a) {
            function f(c) { return h.allLayerViews.find(function (a) { return a.layer === c; }); }
            function g(c) {
                if (null == c)
                    return !1;
                var a = f(c);
                return null == a ? !1 : c.loaded && !a.suspended &&
                    (
                    // 这里需要关闭popupEnabled，从而避免view自身的popup弹出
                    // 将来考虑增加一个标识
                    // c.popupEnabled &&
                    c.popupTemplate
                        || "graphics" === c.type || "geo-rss" === c.type || "map-notes" ===
                        c.type || "kml" === c.type || a.getPopupData);
            }
            function x(a) { return (a = f(a)) && a.hasDraped; }
            var h = this.view, 
            // y = h.popup,
            y = new FloatPop({
                container: document.createElement("div"),
            }), r = this, d = [], e = "3d" === h.type;
            // initialize the float pop
            y.viewModel.view = h;
            var popupContainer = h.get('popup');
            domConstruct.place(y.container, popupContainer.domNode);
            arrayUtil.forEach(this.map.layers.toArray(), function (a) {
                a.isInstanceOf(GroupLayer) ? arrayUtil.forEach(a.layers.toArray(), function (a) {
                    !g(a) || e && !x(a) || d.push(a);
                }) : !g(a) || e && !x(a) || d.push(a);
            });
            0 < h.graphics.length && d.push(h.graphics);
            (a && h.graphics.includes(a) ? a.popupTemplate : !a || g(a.layer)) || (a = null);
            if (d.length || a) {
                var p = [], t = !!a, v = r._calculateClickTolerance(d), n = b.mapPoint;
                if (n) {
                    var w = 1;
                    h.state && (w = h.state.resolution);
                    var k = h.basemapTerrain;
                    k && k.overlayManager && (w = k.overlayManager.overlayPixelSizeInMapUnits(n));
                    v *= w;
                    k && !k.spatialReference.equals(h.spatialReference) && (v *= scaleUtils.getMetersPerUnitForSR(k.spatialReference) / scaleUtils.getMetersPerUnitForSR(h.spatialReference));
                    var k = n.clone().offset(-v, -v), n = n.clone().offset(v, v), q = new Extent(Math.min(k.x, n.x), Math.min(k.y, n.y), Math.max(k.x, n.x), Math.max(k.y, n.y), h.spatialReference), n = function (c) {
                        var g;
                        if ("imagery" === c.type) {
                            g = new Query();
                            g.geometry = b.mapPoint;
                            var d = f(c), e = { rasterAttributeTableFieldPrefix: "Raster.", returnDomainValues: !0 };
                            e.layerView = d;
                            g = c.queryVisibleRasters(g, e).then(function (a) { t = t || 0 < a.length; return a; });
                        }
                        else if ("csv" === c.type || !r._featureLayersCache[c.id] && "function" !== typeof c.queryFeatures) {
                            if ("map-image" === c.type || "wms" === c.type)
                                return d = f(c), d.getPopupData(q);
                            var e = [], h;
                            "esri.core.Collection\x3cesri.Graphic\x3e" === c.declaredClass ? (d = c, h = !0) : "graphics" === c.type ? (d = c.graphics, h = !0) : (d = (d = f(c)) && d.loadedGraphics, h = !1);
                            d && (e = d.filter(function (a) {
                                return a && (!h || a.popupTemplate) && a.visible && q.intersects(a.geometry);
                            }).toArray());
                            0 < e.length && (t = !0, g = "scene" === c.type ? r._fetchSceneAttributes(c, e) : promiseUtils.resolve(e));
                        }
                        else
                            d = c.createQuery(), d.geometry = q, g = c.queryFeatures(d).then(function (b) {
                                b = b.features;
                                if (a && a.layer === c && c.objectIdField) {
                                    var g = c.objectIdField, d = a.attributes[g];
                                    b = b.filter(function (a) { return a.attributes[g] !== d; });
                                }
                                if (!a && "function" === typeof f(c).getGraphics3DGraphics) {
                                    var e = [], h = f(c).getGraphics3DGraphics(), r;
                                    for (r in h)
                                        e.push(h[r].graphic.attributes[c.objectIdField]);
                                    b = b.filter(function (a) { return -1 !== e.indexOf(a.attributes[c.objectIdField]); });
                                }
                                t = t || 0 < b.length;
                                return b;
                            });
                        return g;
                    };
                    if (e && !a || !e)
                        var p = d.map(n).filter(function (a) { return !!a; }), u = function (a) { return a.reduce(function (a, b) { return a.concat(b.items ? u(b.items) : b); }, []); }, p = u(p);
                    a && (a.layer && "scene" === a.layer.type ? p.unshift(this._fetchSceneAttributes(a.layer, [a])) : a.popupTemplate && (n = new Deferred(), p.unshift(n.resolve([a]))));
                    arrayUtil.some(p, function (a) { return !a.isFulfilled(); }) || t ?
                        p.length && (y.open({ promises: p, location: b.mapPoint }), r.floatpops.add(y)) :
                        r._closePopup();
                }
                else {
                    r._closePopup();
                }
            }
            else {
                r._closePopup();
            }
        };
        FloatPopManager.prototype._closePopup = function () {
            var pops = this.floatpops;
            if (this.autoclose) {
                if (pops && pops.length > 0) {
                    pops.forEach(function (pop) {
                        pop.clear();
                        pop.close();
                        pop.destroy();
                    });
                    pops.removeAll();
                }
            }
        };
        FloatPopManager.prototype._fetchSceneAttributes = function (b, a) {
            return this.view.whenLayerView(b)
                .then(function (f) {
                var g = this._getOutFields(b.popupTemplate), x = a.map(function (a) {
                    return f.whenGraphicAttributes(a, g)
                        .otherwise(function () { return a; });
                });
                return z.eachAlways(x);
            }.bind(this))
                .then(function (a) { return a.map(function (a) { return a.value; }); });
        };
        FloatPopManager.prototype._calculateClickTolerance = function (b) {
            var a = 6;
            arrayUtil.forEach(b, function (b) {
                if (b = b.renderer)
                    "simple" === b.type ? ((b = b.symbol) && b.xoffset && (a = Math.max(a, Math.abs(b.xoffset))), b && b.yoffset && (a = Math.max(a, Math.abs(b.yoffset)))) : "unique-value" !== b.type && "class-breaks" !== b.type || arrayUtil.forEach(b.uniqueValueInfos || b.classBreakInfos, function (b) {
                        (b = b.symbol) && b.xoffset && (a = Math.max(a, Math.abs(b.xoffset)));
                        b && b.yoffset && (a = Math.max(a, Math.abs(b.yoffset)));
                    });
            });
            return a;
        };
        FloatPopManager.prototype._clickHandler = function (b) {
            function a(a) { return f.allLayerViews.find(function (b) { return b.layer === a; }); }
            var f = this.view, g = b.screenPoint, l = this;
            if (0 === b.button && f.popup && f.ready) {
                var h = "3d" === f.type, y = f.map.allLayers.some(function (b) {
                    if (b.isInstanceOf(GroupLayer)) {
                        return false;
                    }
                    var d;
                    null == b ?
                        d = false :
                        (d = a(b),
                            d = null == d ? false :
                                b.loaded && !d.suspended && (b.popupEnabled && b.popupTemplate || "graphics" === b.type || d.getPopupData));
                    d && !(d = !h) && (d = (b = a(b)) && b.hasDraped);
                    return d ? true : false;
                });
                null != g ? this.view.hitTest(g.x, g.y).then(function (a) {
                    y || 0 < a.results.length ?
                        l._showPopup(b, 0 < a.results.length ? a.results[0].graphic : null) :
                        l._closePopup();
                }) : l._showPopup(b);
            }
        };
        __decorate([
            decorators_1.property({
                value: false
            })
        ], FloatPopManager.prototype, "enabled", null);
        __decorate([
            decorators_1.property()
        ], FloatPopManager.prototype, "view", null);
        __decorate([
            decorators_1.property({
                dependsOn: ["view.map"],
                readOnly: true
            })
        ], FloatPopManager.prototype, "map", null);
        __decorate([
            decorators_1.property()
        ], FloatPopManager.prototype, "options", void 0);
        __decorate([
            decorators_1.property()
        ], FloatPopManager.prototype, "floatpops", void 0);
        __decorate([
            decorators_1.property()
        ], FloatPopManager.prototype, "autoclose", void 0);
        __decorate([
            decorators_1.property()
        ], FloatPopManager.prototype, "layer", void 0);
        __decorate([
            decorators_1.property()
        ], FloatPopManager.prototype, "features", void 0);
        FloatPopManager = __decorate([
            decorators_1.subclass("esri.widgets.custom.FloatPopManager")
        ], FloatPopManager);
        return FloatPopManager;
    }(decorators_1.declared(Accessor)));
    return FloatPopManager;
});
//# sourceMappingURL=FloatPopManager.js.map