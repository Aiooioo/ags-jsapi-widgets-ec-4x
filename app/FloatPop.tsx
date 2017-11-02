import {
  aliasOf,
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

import {
  accessibleHandler,
  join,
  tsx,
  renderable,
  vmEvent,
} from "esri/widgets/support/widget";

import Collection = require("esri/core/Collection");
import esriLang = require("esri/core/lang");
import watchUtils = require("esri/core/watchUtils");
import Point = require("esri/geometry/Point");
import ScreenPoint = require("esri/geometry/ScreenPoint");

import FloatPopViewModel = require("./FloatPop/FloatPopViewModel");

import Graphic = require("esri/Graphic");
import UI = require("esri/views/ui/UI");
import MapView = require("esri/views/MapView");
import SceneView = require("esri/views/SceneView");

import Widget = require("esri/widgets/Widget");
import widgetUtils = require("esri/widgets/support/widget");

import domGeometry = require("dojo/dom-geometry");

const DOCK_OPTIONS: DockOptions = {
  buttonEnabled: true,
  position: "auto",
  breakpoint: {
    width: 544
  }
};

@subclass("esri.widgets.custom.FloatPop")
class FloatPop extends declared(Widget) {
  constructor(params?: any) {
    super();
  }

  //--------------------------------------------------------------------------
  //
  //  Variables
  //
  //--------------------------------------------------------------------------

  private _containerNode: HTMLDivElement = null;

  private _mainContainerNode: HTMLDivElement = null;

  private _pointerOffsetInPx = 16;

  postInitialize() {
    this.own(
      watchUtils.watch<ScreenPoint>(this, "viewModel.screenLocation", () => this._positionContainer()),

      watchUtils.watch(this, [
        "viewModel.visible",
        "dockEnabled"
      ], () => this._toggleScreenLocationEnabled())
    );
  }

  destroy() {
    this._destroyPopupRenderers();
  }

  //----------------------------------
  //  dockOptions
  //----------------------------------

  @property()
  @renderable()
  get dockOptions() {
    return this._get<DockOptions>("dockOptions") || DOCK_OPTIONS;
  }
  set dockOptions(dockOptions: DockOptions) {

  }

  @property()
  @renderable()
  dockEnabled = false;

  @aliasOf("viewModel.location")
  @renderable()
  location: Point = null;

  //----------------------------------
  //  promises
  //----------------------------------

  /**
   * An array of pending Promises that have not yet been fulfilled. If there are
   * no pending promises, the value is `null`. When the pending promises are
   * resolved they are removed from this array and the features they return
   * are pushed into the [features](#features) array.
   *
   * @name promises
   * @instance
   *
   * @type {Promise[]}
   */
  @aliasOf("viewModel.promises")
  promises: IPromise<Graphic[]>[] = null;

  //----------------------------------
  //  title
  //----------------------------------

  @aliasOf("viewModel.title")
  @renderable()
  title: string = null;

  //----------------------------------
  //  view
  //----------------------------------

  /**
   * A reference to the {@link module:esri/views/MapView} or {@link module:esri/views/SceneView}. Set this to link the widget to a specific view.
   *
   * @name view
   * @instance
   *
   * @type {module:esri/views/MapView | module:esri/views/SceneView}
   */
  @aliasOf("viewModel.view")
  view: MapView | SceneView = null;

  //----------------------------------
  //  viewModel
  //----------------------------------

  @property({
    type: FloatPopViewModel
  })
  @renderable([

  ])
  viewModel = new FloatPopViewModel();

  //----------------------------------
  //  visible
  //----------------------------------

  /**
   * Indicates whether the popup is visible.
   *
   * @name visible
   * @instance
   * @type {boolean}
   */
  @aliasOf("viewModel.visible")
  @renderable()
  visible: boolean = null;

  render() {
    const {
      dockEnabled,
      dockOptions,
      popupRenderers,
      visible
    } = this;

    const containerNode = isVisible ? (
      <div>
      </div>
    ) : null;

    return (
      <div role="presentation">{containerNode}</div>
    );
  }
}

export = FloatPop;
