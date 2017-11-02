import {
  aliasOf,
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

import Accessor = require("esri/core/Accessor");
import MapView = require("esri/views/MapView");
import SceneView = require("esri/views/SceneView");

import Graphic = require("esri/Graphic");
import Geometry = require("esri/geometry/Geometry");

type State = "ready" | "disabled";

@subclass("esri.widgets.custom.FloatPop.FloatPopViewModel")
class FloatPopViewModel extends declared(Accessor) {

  destroy() {
    this.view = null;
  }

  @property({
    dependsOn: [
      "view.ready"
    ],
    readOnly: true
  })
  get state(): State {
    return this.get("view.ready") ? "ready" : "disabled";
  }

  @property()
  view: MapView | SceneView = null;

  @property()
  visible: boolean = false;

  @property()
  promises: IPromise<Graphic[]>[] = null;

  clear() {
    this.set({
      promises: []
    })
  }

  _getPointFromGeometry(a) {
    switch (a && a.type) {
      case "point":
        return a;
      case "extent":
        return a.center;
      case "polygon":
        return a.centroid;
      case "multipoint":
      case "polyline":
        return a.extent.center;
      default:
        return null;
    }
  }
}

export = FloatPopViewModel;
