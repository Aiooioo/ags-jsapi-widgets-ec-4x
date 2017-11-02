/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

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
import _WidgetBase = require("dijit/_WidgetBase");
import widgetUtils = require("esri/widgets/support/widget");

import domGeometry = require("dojo/dom-geometry");

const DOCK_OPTIONS: DockOptions = {
  buttonEnabled: true,
  position: "auto",
  breakpoint: {
    width: 544
  }
};

const WIDGET_KEY_PARTIAL = "ec-float-pop";
function buildKey(element: string, index?: number): string {
  if (index === undefined) {
    return `${WIDGET_KEY_PARTIAL}__${element}`;
  }

  return `${WIDGET_KEY_PARTIAL}__${element}-${index}`;
}

function isWidget(value: any): value is Widget {
  return value && value.isInstanceOf && value.isInstanceOf(Widget);
}

function isWidgetBase(value: any): value is _WidgetBase {
  // naive type check

  return value &&
    typeof value.postMixInProperties === "function" &&
    typeof value.buildRendering === "function" &&
    typeof value.postCreate === "function" &&
    typeof value.startup === "function";
}

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

  //----------------------------------
  //  featureCount
  //----------------------------------

  /**
   * The number of selected [features](#features) available to the popup.
   *
   * @name featureCount
   * @instance
   *
   * @type {Number}
   * @default 0
   * @readonly
   */
  @aliasOf("viewModel.featureCount")
  @renderable()
  featureCount: number = null;

  //----------------------------------
  //  features
  //----------------------------------

  /**
   * An array of features associated with the popup. Each graphic in this array must
   * have a valid {@link module:esri/PopupTemplate} set. They may share the same
   * {@link module:esri/PopupTemplate} or have unique
   * {@link module:esri/PopupTemplate PopupTemplates} depending on their attributes.
   * The [content](#content) and [title](#title)
   * of the poup is set based on the `content` and `title` properties of each graphic's respective
   * {@link module:esri/PopupTemplate}.
   *
   * When more than one graphic exists in this array, the current content of the
   * Popup is set based on the value of the [selected feature](#selectedFeature).
   *
   * This value is `null` if no features are associated with the popup.
   *
   * @name features
   * @instance
   *
   * @type {module:esri/Graphic[]}
   *
   * @example
   * // When setting the features property, the graphics pushed to this property
   * // must have a PopupTemplate set.
   * var g1 = new Graphic();
   * g1.popupTemplate = new PopupTemplate({
   *   title: "Results title",
   *   content: "Results: {ATTRIBUTE_NAME}"
   * });
   * // Set the graphics as an array to the popup instance. The content and title of
   * // the popup will be set depending on the PopupTemplate of the graphics.
   * // Each graphic may share the same PopupTemplate or have a unique PopupTemplate
   * var graphics = [g1, g2, g3, g4, g5];
   * view.popup.features = graphics;
   */
  @aliasOf("viewModel.features")
  @renderable()
  features: Graphic[] = null;

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


  //----------------------------------
  //  location
  //----------------------------------

  /**
   * Point used to position the popup. This is automatically set when viewing the
   * popup by selecting a feature. If using the Popup to display content not related
   * to features in the map, such as the results from a task, then you must set this
   * property before making the popup [visible](#visible) to the user.
   *
   * @name location
   * @instance
   *
   * @type {module:esri/geometry/Point}
   * @autocast
   *
   * @see [Intro to popups](../sample-code/intro-popup/index.html)
   *
   * @example
   * // Sets the location of the popup to the center of the view
   * view.popup.location = view.center;
   * // Displays the popup
   * view.popup.visible = true;
   *
   * @example
   * // Sets the location of the popup to a specific place (using autocast)
   * // Note: using latlong only works if view is in Web Mercator or WGS84 spatial reference.
   * view.popup.location = {latitude: 34.0571, longitude: -117.1968};
   *
   * @example
   * // Sets the location of the popup to the location of a click on the view
   * view.on("click", function(event){
   *   view.popup.location = event.mapPoint;
   *   // Displays the popup
   *   view.popup.visible = true;
   * });
   */
  @aliasOf("viewModel.location")
  @renderable()
  location: Point = null;

  //----------------------------------
  //  popupRenderers
  //----------------------------------

  /**
   * @todo document
   */
  @property({
    readOnly: true
  })
  @renderable()
  popupRenderers: PopupRenderer[] = [];

  render() {
    const {
      dockEnabled,
      dockOptions,
      popupRenderers,
      visible
    } = this;

    const {
      featureCount,
      promiseCount,
      pendingPromisesCount,
      title,
      waitingForResult
    } = this.viewModel;

    const content = this._renderContent();
    const isRtl = widgetUtils.isRtl();
    const hasContent = this.get("selectedPopupRenderer") ?
      this.get("selectedPopupRenderer.viewModel.waitingForContent") ||
      this.get("selectedPopupRenderer.viewModel.content") :
      content;
    const dockTitle = dockEnabled ?
      i18n.undock :
      i18n.dock;

    const {
        currentAlignment,
      currentDockPosition
       } = this;

    const loadingContainerNode = !!pendingPromisesCount ? (
      <div key={buildKey("loading-container")} role="presentation"
        class={CSS.loadingContainer}
        aria-label={i18n.loading}
        title={i18n.loading}>
        <span aria-hidden="true"
          class={join(CSS.icon, CSS.iconLoading)} />
      </div>
    ) : null;

    const containerNode = isVisible ? (
      <div>
      </div>
    ) : null;

    // pagination

    const wouldDockTo = this._wouldDockTo();
    const wouldDockToRight = wouldDockTo === "top-right" || wouldDockTo === "bottom-right";
    const wouldDockToLeft = wouldDockTo === "top-left" || wouldDockTo === "bottom-left";
    const wouldDockToTop = wouldDockTo === "top-center";
    const wouldDockToBottom = wouldDockTo === "bottom-center";

    const dockRightIconNode = wouldDockToRight ? (
      <span aria-hidden="true"
        key={buildKey("dock-right-icon")}
        class={join(CSS.icon, CSS.iconDock, CSS.iconDockToRight)} />
    ) : null;

    const dockLeftIconNode = wouldDockToLeft ? (
      <span aria-hidden="true"
        key={buildKey("dock-left-icon")}
        class={join(CSS.icon, CSS.iconDock, CSS.iconDockToLeft)} />
    ) : null;

    const dockTopIconNode = wouldDockToTop ? (
      <span aria-hidden="true"
        key={buildKey("dock-top-icon")}
        class={join(CSS.icon, CSS.iconDock, CSS.iconDockToTop)} />
    ) : null;

    const dockBottomIconNode = wouldDockToBottom ? (
      <span aria-hidden="true"
        key={buildKey("dock-bottom-icon")}
        class={join(CSS.icon, CSS.iconDock, CSS.iconDockToBottom)} />
    ) : null;

    const undockIconNode = dockEnabled ? (
      <span aria-hidden="true"
        key={buildKey("undocked-icon")}
        class={join(CSS.icon, CSS.iconUndock)} />
    ) : null;

    const dockButtonNode = dockOptions.buttonEnabled ? (
      <div role="button"
        aria-label={dockTitle}
        title={dockTitle}
        tabIndex={0}
        bind={this}
        onclick={this._toggleDockEnabled}
        onkeydown={this._toggleDockEnabled}
        class={join(CSS.button, CSS.buttonDock)}>
        {dockRightIconNode}
        {dockTopIconNode}
        {dockLeftIconNode}
        {dockBottomIconNode}
        {undockIconNode}
      </div>
    ) : null;

    const titleClasses = {
      [CSS.headerTitleButton]: canBeCollapsed
    };

    const titleRole = canBeCollapsed ? "button" : "heading";

    const titleLabel = canBeCollapsed ?
      contentVisible ?
        i18n.expand :
        i18n.collapse :
      "";

    const titleNode = title ? (
      <h1 class={CSS.headerTitle}
        role={titleRole}
        aria-label={titleLabel}
        title={titleLabel}
        classes={titleClasses}
        bind={this}
        tabIndex={canBeCollapsed ? 0 : -1}
        onclick={this._toggleCollapsed}
        onkeydown={this._toggleCollapsed}
        innerHTML={title} />
    ) : null;

    const closeIconNode = (
      <span aria-hidden="true"
        class={join(CSS.icon, CSS.iconClose)} />
    );

    const closeButtonNode = (
      <div role="button"
        tabIndex={0}
        bind={this}
        onclick={this._close}
        onkeydown={this._close}
        class={CSS.button}
        aria-label={i18n.close}
        title={i18n.close}>
        {closeIconNode}
      </div>
    );

    const headerNode = (
      <header class={CSS.header}>
        {titleNode}
        <div class={CSS.headerButtons}>
          {dockButtonNode}
          {closeButtonNode}
        </div>
      </header>
    );

    const contentNode = hasContent && !contentVisible ? (
      <article key={buildKey("content-container")} class={CSS.content}>{content}</article>
    ) : null;

    const showButtonsTop = !contentVisible && (
      (currentAlignment === "bottom-left") ||
      (currentAlignment === "bottom-center") ||
      (currentAlignment === "bottom-right") ||
      (currentDockPosition === "top-left") ||
      (currentDockPosition === "top-center") ||
      (currentDockPosition === "top-right"));

    const showButtonsBottom = !contentVisible && (
      (currentAlignment === "top-left") ||
      (currentAlignment === "top-center") ||
      (currentAlignment === "top-right") ||
      (currentDockPosition === "bottom-left") ||
      (currentDockPosition === "bottom-center") ||
      (currentDockPosition === "bottom-right"));

    const actionsNode = !isFeatureMenuOpen ? (
      <div key={buildKey("actions")} class={CSS.actions}>{this._renderActions()}</div>
    ) : null;

    const containerClasses = {
      [CSS.alignTopCenter]: currentAlignment === "top-center",
      [CSS.alignBottomCenter]: currentAlignment === "bottom-center",
      [CSS.alignTopLeft]: currentAlignment === "top-left",
      [CSS.alignBottomLeft]: currentAlignment === "bottom-left",
      [CSS.alignTopRight]: currentAlignment === "top-right",
      [CSS.alignBottomRight]: currentAlignment === "bottom-right",
      [CSS.isDocked]: dockEnabled,
      [CSS.shadow]: !dockEnabled,
      [CSS.hasFeatureUpdated]: visible,
      [CSS.isDockedTopLeft]: currentDockPosition === "top-left",
      [CSS.isDockedTopCenter]: currentDockPosition === "top-center",
      [CSS.isDockedTopRight]: currentDockPosition === "top-right",
      [CSS.isDockedBottomLeft]: currentDockPosition === "bottom-left",
      [CSS.isDockedBottomCenter]: currentDockPosition === "bottom-center",
      [CSS.isDockedBottomRight]: currentDockPosition === "bottom-right",
      [CSS.isFeatureMenuOpen]: isFeatureMenuOpen
    };
    const layerTitle = this.get("selectedFeature.layer.title");
    const layerId = this.get("selectedFeature.layer.id");

    const mainContainerClasses = {
      [CSS.shadow]: dockEnabled
    };

    const hasPromises = !!promiseCount;
    const hasFeatures = !!featureCount;
    const canBeDisplayed = hasPromises ? hasFeatures : true;
    const isVisible = visible && !waitingForResult && canBeDisplayed;

    const buttonsTopNode = showButtonsTop ? featureButtonsNode : null;
    const buttonsBottomNode = showButtonsBottom ? featureButtonsNode : null;

    const containerNode = isVisible ? (
      <div key={buildKey("container")} class={CSS.container}
        classes={containerClasses}
        data-layer-title={layerTitle}
        data-layer-id={layerId}
        bind={this}
        afterCreate={this._positionContainer}
        afterUpdate={this._positionContainer}>
        <div class={join(CSS.main, CSS.widget)}
          classes={mainContainerClasses}
          bind={this}
          afterCreate={this._storeMainContainerNode}
          afterUpdate={this._storeMainContainerNode}>
          {buttonsTopNode}
          {menuTopNode}
          {headerNode}
          {contentNode}
          {buttonsBottomNode}
          {menuBottomNode}
        </div>
        {pointerNode}
      </div>
    ) : null;

    return (
      <div role="presentation"
        class={CSS.base} key={buildKey("base")}
      >{containerNode}</div>
    );
  }
}

export = FloatPop;
