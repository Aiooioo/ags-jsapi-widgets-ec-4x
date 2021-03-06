/**
 * The popup widget allows users to view content from feature attributes. Popups enhance web applications
 * by providing users with a simple way to interact with and view attributes in a layer.
 * They play an important role in relaying information to the user, which improves the storytelling capabilities of the application.
 *
 * All {@link module:esri/views/View Views} contain a default popup.
 * This popup can display generic content, which is set in its [title](#title)
 * and [content](#content) properties.
 * When  content is set directly on the Popup instance it is not tied to a specific feature or layer.
 *
 * [![popup-basic-example](../assets/img/apiref/widgets/popup-basic.png)](../sample-code/sandbox/sandbox.html?sample=intro-popup)
 *
 * In the image above, the text "Marriage in NY, Zip Code: 11385" is the popup's `title`. The remaining text is
 * its `content`. A dock button ![popup-dock-btn](../assets/img/apiref/widgets/popup-dock.png) may also be available in the
 * top right corner of the popup. This allows the user to dock the popup to one of the sides or corners of the view.
 * The options for docking may be set in the [dockOptions](#dockOptions) property.
 *
 * Popups can also contain [actions](#actions) that act like buttons,
 * which execute a function defined by the developer when clicked.
 * By default, every popup has a "Zoom in" action ![popupTemplate-zoom-action](../assets/img/apiref/widgets/popuptemplate-zoom-action.png)
 * that allows users to zoom to the selected feature. See the [actions](#actions)
 * property for information about adding custom actions to a popup.
 *
 * In most cases this module will not need to be loaded into your application because the view contains a default instance of popup.
 *
 * {@link module:esri/PopupTemplate} is closely related to Popup, but is more specific to {@link module:esri/layers/Layer layers}
 * and {@link module:esri/Graphic graphics}. It allows you to define custom title and content templates based on the source of the
 * [selected feature](#selectedFeature). When a layer or a graphic has a defined
 * PopupTemplate, the popup will display the content
 * defined in the PopupTemplate when the feature is clicked. The content may contain field values from the attributes of the [selected feature](#selectedFeature).
 *
 * Custom PopupTemplates may also be assigned directly to a popup by setting {@link module:esri/Graphic graphics} on the
 * [features](#features) property. For more information about Popup
 * and how it relates to {@link module:esri/PopupTemplate} see the samples listed below.
 *
 * @module esri/widgets/Popup
 * @since 4.0
 *
 * @see [Popup.js (widget view)]({{ JSAPI_BOWER_URL }}/widgets/Popup.js)
 * @see [Popup.scss]({{ JSAPI_BOWER_URL }}/themes/base/widgets/_Popup.scss)
 * @see module:esri/PopupTemplate
 * @see {@link module:esri/views/View#popup View.popup}
 * @see [Intro to popups](../sample-code/intro-popup/index.html)
 * @see [Intro to PopupTemplate](../sample-code/intro-popuptemplate/index.html)
 * @see [Sample - Dock positions with popup](../sample-code/popup-docking-position/index.html)
 * @see [Sample - Popup actions](../sample-code/popup-actions/index.html)
 * @see [Sample - Custom popup actions per feature](../sample-code/popup-custom-action/index.html)
 * @see [Guide - Esri Icon Font](../guide/esri-icon-font/index.html)
 * @see module:esri/widgets/Popup/PopupViewModel
 */

/**
 * Fires after the user clicks on an {@link module:esri/support/Action action} inside a popup. This
 * event may be used to define a custom function to execute when particular
 * actions are clicked. See the example below for details of how this works.
 *
 * @event module:esri/widgets/Popup#trigger-action
 * @property {module:esri/support/Action} action - The action clicked by the user. For a description
 *                    of this object and a specification of its properties,
 *                    see the [actions](#actions) property of this class.
 *
 * @see [actions](#actions)
 * @example
 * // Defines an action to zoom out from the selected feature
 * var zoomOutAction = {
 *   // This text is displayed as a tooltip
 *   title: "Zoom out",
 *   // The ID used to reference this action in the event handler
 *   id: "zoom-out",
 *   // Sets the icon font used to style the action button
 *   className: "esri-icon-zoom-out-magnifying-glass"
 * };
 * // Adds the custom action to the popup.
 * view.popup.actions.push(zoomOutAction);
 *
 * // Fires each time an action is clicked
 * view.popup.on("trigger-action", function(event){
 *   // If the zoom-out action is clicked, then execute the following code
 *   if(event.action.id === "zoom-out"){
 *     // Zoom out two levels (LODs)
 *     view.goTo({
 *       center: view.center,
 *       zoom: view.zoom - 2
 *     });
 *   }
 * });
 */

/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
/// <amd-dependency path="esri/core/tsSupport/assignHelper" name="__assign" />

import {
  accessibleHandler,
  join,
  tsx,
  renderable,
  vmEvent
} from "esri/widgets/support/widget";

import {
  aliasOf,
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

import Collection = require("esri/core/Collection");
import esriLang = require("esri/core/lang");
import HandleRegistry = require("esri/core/HandleRegistry");
import watchUtils = require("esri/core/watchUtils");

import Widget = require("esri/widgets/Widget");
import widgetUtils = require("esri/widgets/support/widgetUtils");

import Action = require("esri/support/Action");

import PopupRenderer = require("esri/widgets/Popup/PopupRenderer");
import PopupViewModel = require("esri/widgets/Popup/PopupViewModel");

import i18n = require("dojo/i18n!esri/widgets/Popup/nls/Popup");

import Graphic = require("esri/Graphic");

import Point = require("esri/geometry/Point");
import ScreenPoint = require("esri/geometry/ScreenPoint");

import Spinner = require("esri/widgets/Spinner");

import UI = require("esri/views/ui/UI");
import MapView = require("esri/views/MapView");
import SceneView = require("esri/views/SceneView");

import domGeometry = require("dojo/dom-geometry");

import _WidgetBase = require("dijit/_WidgetBase");

const DEFAULT_ACTION_IMAGE = require.toUrl("esri/widgets/Popup/images/default-action.svg");

const CSS = {
  // common
  iconLeftTriangleArrow: "esri-icon-left-triangle-arrow",
  iconRightTriangleArrow: "esri-icon-right-triangle-arrow",
  iconDockToTop: "esri-icon-maximize",
  iconDockToBottom: "esri-icon-dock-bottom",
  iconDockToLeft: "esri-icon-dock-left",
  iconDockToRight: "esri-icon-dock-right",
  iconClose: "esri-icon-close",
  iconUndock: "esri-icon-minimize",
  iconFeatureMenu: "esri-icon-layer-list",
  iconCheckMark: "esri-icon-check-mark",
  iconLoading: "esri-rotating esri-icon-loading-indicator",
  iconZoom: "esri-icon-zoom-in-magnifying-glass",
  iconEcPin: "esri-icon-map-pin",
  // base
  base: "esri-popup",
  // containers
  widget: "esri-widget",
  container: "esri-popup__position-container",
  main: "esri-popup__main-container ec-widgets-floatpop__main-container",
  loadingContainer: "esri-popup__loading-container",
  // global modifiers
  shadow: "esri-popup--shadow",
  isDocked: "esri-popup--is-docked",
  isDockedFloatPop: "ec-widgets-floatpop--is-docked",
  isDockedTopLeft: "esri-popup--is-docked-top-left",
  isDockedTopCenter: "esri-popup--is-docked-top-center",
  isDockedTopRight: "esri-popup--is-docked-top-right",
  isDockedBottomLeft: "esri-popup--is-docked-bottom-left",
  isDockedBottomCenter: "esri-popup--is-docked-bottom-center",
  isDockedBottomRight: "esri-popup--is-docked-bottom-right",
  alignTopCenter: "esri-popup--aligned-top-center",
  alignBottomCenter: "esri-popup--aligned-bottom-center",
  alignTopLeft: "esri-popup--aligned-top-left",
  alignBottomLeft: "esri-popup--aligned-bottom-left",
  alignTopRight: "esri-popup--aligned-top-right",
  alignBottomRight: "esri-popup--aligned-bottom-right",
  isFeatureMenuOpen: "esri-popup--feature-menu-open",
  hasFeatureUpdated: "esri-popup--feature-updated",
  // header and content
  header: "esri-popup__header ec-widgets-floatpop__header",
  headerButtons: "esri-popup__header-buttons ec-widgets-floatpop__header-buttons",
  headerTitle: "esri-popup__header-title",
  headerTitleButton: "esri-popup__header-title--button",
  content: "esri-popup__content ec-widgets-floatpop__content",
  featureButtons: "esri-popup__feature-buttons",
  // buttons
  button: "esri-popup__button ec-widgets-floatpop__button",
  buttonDock: "esri-popup__button--dock",
  // icons
  icon: "esri-popup__icon",
  iconDock: "esri-popup__icon--dock-icon",
  // actions
  actions: "esri-popup__actions",
  action: "esri-popup__action",
  actionImage: "esri-popup__action-image",
  actionText: "esri-popup__action-text",
  // pointer
  pointer: "esri-popup__pointer",
  pointerDirection: "esri-popup__pointer-direction ec-widgets-floatpop__pointer-direction",
  // ec widgets float pop pin
  ecpinWrapper: "ec-widgets-floatpop__pin-wrap",
  ecpin: "ec-widgets-floatpop__pin",
  // navigation
  navigation: "esri-popup__navigation",
  navigationButtons: "esri-popup__navigation-buttons",
  // pagination
  paginationPrevious: "esri-popup__pagination-previous",
  paginationNext: "esri-popup__pagination-next",
  paginationPreviousIconLTR: "esri-popup__pagination-previous-icon",
  paginationPreviousIconRTL: "esri-popup__pagination-previous-icon--rtl",
  paginationNextIconLTR: "esri-popup__pagination-next-icon",
  paginationNextIconRTL: "esri-popup__pagination-next-icon--rtl",
  paginationText: "esri-popup__pagination-page-text",
  // feature menu
  featureMenu: "esri-popup__feature-menu",
  featureMenuList: "esri-popup__feature-menu-list",
  featureMenuItem: "esri-popup__feature-menu-item",
  featureMenuViewport: "esri-popup__feature-menu-viewport",
  featureMenuHeader: "esri-popup__feature-menu-header",
  featureMenuNote: "esri-popup__feature-menu-note",
  featureMenuSelected: "esri-popup__feature-menu-item--selected",
  featureMenuButton: "esri-popup__feature-menu-button",
  featureMenuTitle: "esri-popup__feature-menu-title"
};

const ZOOM_TO_ACTION_ID = "zoom-to";

const DOCK_OPTIONS: __esri.PopupDockOptions = {
  buttonEnabled: true,
  position: "auto",
  breakpoint: {
    width: 544
  }
};

const WIDGET_KEY_PARTIAL = "esri-popup";

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

/**
 * Fires after the user clicks on an {@link module:esri/support/Action action} inside a popup. This
 * event may be used to define a custom function to execute when particular
 * actions are clicked. See the example below for details of how this works.
 *
 * @event module:esri/widgets/Popup#trigger-action
 * @property {module:esri/support/Action} action - The action clicked by the user. For a description
 * of this object and a specification of its properties, see the [actions](#actions) property of this
 * class.
 *
 * @see [actions](#actions)
 * @example
 * // Defines an action to zoom out from the selected feature
 * var zoomOutAction = {
 *  // This text is displayed as a tooltip
 *  title: "Zoom out",
 *  // The ID used to reference this action in the event handler
 *  id: "zoom-out",
 *  // Sets the icon font used to style the action button
 *  className: "esri-icon-zoom-out-magnifying-glass"
 * };
 * // Adds the custom action to the popup
 * view.popup.actions.push(zoomOutAction);
 *
 * // Fires each time an action is clicked
 * view.popup.on("trigger-action"), function(event){
 *   // If the zoom-out action is clicked, than execute the following code
 *   if(event.action.id === "zoom-out"){
 *     // Zoom out two levels (LODs)
 *     view.goTo({
 *       center: view.center,
 *       zoom: view.zoom - 2
 *     });
 *   }
 * });
 */

@subclass("esri.widgets.custom.FloatPop")
class FloatPop extends declared(Widget) {

  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------

  /**
   * @extends module:esri/widgets/Widget
   * @mixes module:esri/core/Evented
   * @constructor
   * @alias module:esri/widgets/Popup
   * @param {Object} [properties] - See the [properties](#properties-summary) for a list of all the properties
   *                              that may be passed into the constructor.
   */
  constructor(params?: any) {
    super();
  }

  postInitialize() {
    const closeFeatureMenuHandle = watchUtils.pausable(this, `
      viewModel.visible,
      dockEnabled,
      viewModel.selectedFeature
    `, () => this._closeFeatureMenu());

    this._closeFeatureMenuHandle = closeFeatureMenuHandle;

    this.own([
      watchUtils.watch(this, "viewModel.screenLocation", () => this._positionContainer()),

      watchUtils.watch(this, [
        "viewModel.visible",
        "dockEnabled"
      ], () => this._toggleScreenLocationEnabled()),

      watchUtils.watch(this, "viewModel.screenLocation", (newValue, oldValue) => {
        if (!!newValue !== !!oldValue) {
          this.reposition();
        }
      }),

      watchUtils.watch(this, "viewModel.features", features => this._createPopupRenderers(features)),

      watchUtils.watch(this, [
        "viewModel.view.padding",
        "viewModel.view.size",
        "viewModel.visible",
        "viewModel.waitingForResult",
        "viewModel.location",
        "alignment"
      ], () => this.reposition()),

      closeFeatureMenuHandle,

      watchUtils.watch(this, "spinnerEnabled", value => this._spinnerEnabledChange(value)),

      watchUtils.watch(this, [
        "title",
        "content"
      ], () => this._hasFeatureUpdated()),

      watchUtils.watch(this, "viewModel.view.size", (newSize, oldSize) => this._updateDockEnabledForViewSize(newSize, oldSize)),

      watchUtils.watch(this, "viewModel.view", (newView, oldView) => this._viewChange(newView, oldView)),

      watchUtils.watch(this, "viewModel.view.ready", (isReady, wasReady) => this._viewReadyChange(isReady, wasReady)),

      watchUtils.watch(this, [
        "viewModel.waitingForResult",
        "viewModel.location"
      ], () => this._displaySpinner()),

      watchUtils.watch(this, [
        "popupRenderers",
        "viewModel.selectedFeatureIndex"
      ], () => this._updatePopupRenderer()),

      watchUtils.watch(this, "selectedPopupRenderer.viewModel.title", title => this._setTitleFromPopupRenderer(title)),

      watchUtils.watch(this, [
        "selectedPopupRenderer.viewModel.content",
        "selectedPopupRenderer.viewModel.waitingForContent"
      ], () => this._setContentFromPopupRenderer()),

      watchUtils.on(this, "viewModel", "trigger-action", (event) => this._zoomToAction(event))
    ]);
  }

  destroy() {
    this._destroyPopupRenderers();
    this._destroySpinner();
    this._handleRegistry.destroy();
    this._handleRegistry = null;
  }

  //--------------------------------------------------------------------------
  //
  //  Variables
  //
  //--------------------------------------------------------------------------

  private _containerNode: HTMLDivElement = null;

  private _mainContainerNode: HTMLDivElement = null;

  private _featureMenuButtonNode: HTMLDivElement = null;

  private _featureMenuViewportNode: HTMLElement = null;

  private _handleRegistry: HandleRegistry = new HandleRegistry();

  private _displayActionTextLimit = 2;

  private _pointerOffsetInPx = 16;

  private _spinner: Spinner = null;

  private _closeFeatureMenuHandle: any = null;

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  //----------------------------------
  //  actions
  //----------------------------------

  /**
   * Defines actions that may be executed by clicking the icon
   * or image symbolizing them in the popup. By default, every popup has a `zoom-to`
   * action styled with a magnifying glass icon
   * ![popupTemplate-zoom-action](../assets/img/apiref/widgets/popuptemplate-zoom-action.png).
   * When this icon is clicked, the view zooms in four LODs and centers on the selected feature.
   *
   * You may override this action by removing it from the `actions` array or by setting the
   * {@link module:esri/PopupTemplate#overwriteActions overwriteActions} property to `true` in a
   * {@link module:esri/PopupTemplate}. The order of each action in the popup is the order in which
   * they appear in the array.
   *
   * The [trigger-action](#event:trigger-action) event fires each time an action in the popup is clicked.
   * This event should be used to execute custom code for each action clicked. For example, if you would
   * like to add a `zoom-out` action to the popup that zooms the view out several LODs, you would
   * define the zoom-out code in a separate function. Then you would call the custom `zoom-out` function
   * in the [trigger-action](#event:trigger-action) event handler. See the sample code
   * snippet below for more details on how this works.
   *
   * Actions are defined with the properties listed in the {@link module:esri/support/Action} class.
   *
   * @name actions
   * @instance
   *
   * @type {module:esri/core/Collection<module:esri/support/Action>}
   * @see [Sample - Popup actions](../sample-code/popup-actions/index.html)
   * @see [Sample - Custom popup actions per feature](../sample-code/popup-custom-action/index.html)
   *
   * @example
   * // Defines an action to zoom out from the selected feature
   * var zoomOutAction = {
   *   // This text is displayed as a tooltip
   *   title: "Zoom out",
   *   // The ID by which to reference the action in the event handler
   *   id: "zoom-out",
   *   // Sets the icon font used to style the action button
   *   className: "esri-icon-zoom-out-magnifying-glass"
   * };
   * // Adds the custom action to the popup.
   * view.popup.actions.push(zoomOutAction);
   *
   * // The function to execute when the zoom-out action is clicked
   * function zoomOut() {
   *   // in this case the view zooms out two LODs on each click
   *   view.goTo({
   *     center: view.center,
   *     zoom: view.zoom - 2
   *   });
   * }
   *
   * // This event fires for each click on any action
   * view.popup.on("trigger-action", function(event){
   *   // If the zoom-out action is clicked, fire the zoomOut() function
   *   if(event.action.id === "zoom-out"){
   *     zoomOut();
   *   }
   * });
   */
  @aliasOf("viewModel.actions")
  @renderable()
  actions: Collection<Action> = null;

  //----------------------------------
  //  alignment
  //----------------------------------

  /**
   * Position of the popup in relation to the selected feature.
   *
   * **Known Values:** auto | top-center | top-right | bottom-left | bottom-center | bottom-right | Function
   *
   * @type {Alignment}
   * @see [alignmentPositions](#alignmentPositions)
   * @default
   * @ignore
   *
   * @example
   * // The popup will display to the left of the feature
   * view.popup.alignment = "auto";
   */
  @property()
  alignment: any = "auto";

  //----------------------------------
  //  autoCloseEnabled
  //----------------------------------

  /**
   *
   * This closes the popup when the {@link module:esri/views/View} camera or {@link module:esri/Viewpoint} changes.
   *
   * @since 4.5
   * @name autoCloseEnabled
   * @instance
   *
   * @type {boolean}
   * @default false
   */
  @aliasOf("viewModel.autoCloseEnabled")
  autoCloseEnabled: boolean = null;

  //----------------------------------
  //  content
  //----------------------------------

  /**
   * The content of the popup. When set directly on the Popup, this content is
   * static and cannot use fields to set content templates. To set a template
   * for the content based on field or attribute names, see
   * {@link module:esri/PopupTemplate#content PopupTemplate.content}.
   *
   * @name content
   * @instance
   *
   * @type {string | Node}
   * @see [Sample - Popup Docking](../sample-code/popup-docking-position/index.html)
   *
   * @example
   * // This sets generic instructions in the popup that will always be displayed
   * // unless it is overridden by a PopupTemplate
   * view.popup.content = "Click a feature on the map to view its attributes";
   */
  @aliasOf("viewModel.content")
  @renderable()
  content: any = null;

  //----------------------------------
  //  collapsed
  //----------------------------------

  /**
   *
   * Indicates whether the popup displays its content. If `true`, only the header displays.
   *
   * @name collapsed
   * @instance
   * @type {boolean}
   * @since 4.5
   * @default false
   */
  @property()
  @renderable()
  collapsed = false;

  //----------------------------------
  //  collapseEnabled
  //----------------------------------

  /**
   * @todo document
   */
  @property()
  @renderable()
  collapseEnabled = true;

  //----------------------------------
  //  currentAlignment
  //----------------------------------

  /**
   *
   * **Known Values:**  top-center | top-right | bottom-left | bottom-center | bottom-right
   *
   * @type {string}
   * @default
   * @ignore
   */
  @property({
    readOnly: true,
    dependsOn: [
      "dockEnabled",
      "alignment"
    ]
  })
  @renderable()
  get currentAlignment(): any {
    return this._getCurrentAlignment();
  }

  //----------------------------------
  //  currentDockPosition
  //----------------------------------

  /**
   * Dock position in the {@link module:esri/views/View}.
   *
   * **Known Values:** top-left | top-center | top-right | bottom-left | bottom-center | bottom-right
   *
   * @type {string}
   * @instance
   * @name currentDockPosition
   * @readonly
   */
  @property({
    readOnly: true,
    dependsOn: [
      "dockEnabled",
      "dockOptions"
    ]
  })
  @renderable()
  get currentDockPosition(): any {
    return this._getCurrentDockPosition();
  }

  //----------------------------------
  //  dockOptions
  //----------------------------------

  /**
   * Docking the popup allows for a better user experience, particularly when opening
   * popups in apps on mobile devices. When a popup is "dockEnabled" it means the popup no
   * longer points to the [selected feature](#selectedFeature) or the [location](#location)
   * assigned to it. Rather it is placed in one of the corners of the view or to the top or bottom
   * of it. This property allows the developer to set various options for docking the popup.
   *
   * See the object specification table below to override default docking properties on the popup.
   *
   * @type {Object}
   * @instance
   * @name dockOptions
   * @see [Sample - Popup docking](../sample-code/popup-docking-position/index.html)
   *
   * @property {Object | boolean} [breakpoint] - Defines the dimensions of the {@link module:esri/views/View}
   *                        at which to dock the popup. Set to `false` to disable docking at a breakpoint.
   *                        <br><br>**Default:** true
   * @property {number} [breakpoint.width] - The maximum width of the {@link module:esri/views/View}
   *                        at which the popup will be set to dockEnabled automatically.
   *                        <br><br>**Default:** 544
   * @property {number} [breakpoint.height] - The maximum height of the {@link module:esri/views/View}
   *                        at which the popup will be set to dockEnabled automatically.
   *                        <br><br>**Default:** 544
   * @property {boolean} [buttonEnabled] - If `true`, displays the dock button. If `false`, hides the dock
   *                         button from the popup.
   * @property {string | function} [position] - The position in the view at which to dock the popup.
   *                        Can be set as either a string or function. See the table below for known
   *                        string values and their position in the view based on the view's size.
   *                        <br><br>
   * Known Value | View size > breakpoint | View size < breakpoint
   * --------------- | ------------------------------- | -------------
   * auto | top-right | bottom 100%
   * top-left | top-left | top 100%
   * top-center | top-center | top 100%
   * top-right | top-right | top 100%
   * bottom-left | bottom-left | bottom 100%
   * bottom-center | bottom-center | bottom 100%
   * bottom-right | bottom-right | bottom 100%
   *
   * **Default:** auto
   *
   * @example
   * view.popup.dockOptions = {
   *   // Disable the dock button so users cannot undock the popup
   *   buttonEnabled: false,
   *   // Dock the popup when the size of the view is less than or equal to 600x1000 pixels
   *   breakpoint: {
   *     width: 600,
   *     height: 1000
   *   }
   * };
   */
  @property()
  @renderable()
  get dockOptions() {
    return this._get<__esri.PopupDockOptions>("dockOptions") || DOCK_OPTIONS;
  }
  set dockOptions(dockOptions: __esri.PopupDockOptions) {
    const dockOptionDefaults = { ...DOCK_OPTIONS };
    const breakpoints = this.get<Object>("viewModel.view.breakpoints");
    const viewDockSize: __esri.PopupDockOptionsBreakpoint = {};

    if (breakpoints) {
      viewDockSize.width = breakpoints.xsmall;
      viewDockSize.height = breakpoints.xsmall;
    }

    const dockOptionsMixin = { ...dockOptionDefaults, ...dockOptions };
    const breakpointDefaults = { ...dockOptionDefaults.breakpoint, ...viewDockSize };
    const { breakpoint } = dockOptionsMixin;

    if (breakpoint === true) {
      dockOptionsMixin.breakpoint = breakpointDefaults;
    }
    else if (typeof breakpoint === "object") {
      dockOptionsMixin.breakpoint = { ...breakpointDefaults, ...breakpoint };
    }

    this._set("dockOptions", dockOptionsMixin);
    this._setCurrentDockPosition();
    this.reposition();
  }

  //----------------------------------
  //  dockEnabled
  //----------------------------------

  /**
   * Indicates whether the placement of the popup is docked to the side of the view.
   *
   * Docking the popup allows for a better user experience, particularly when opening
   * popups in apps on mobile devices. When a popup is "dockEnabled" it means the popup no
   * longer points to the [selected feature](#selectedFeature) or the [location](#location)
   * assigned to it. Rather it is attached to a side, the top, or the bottom of the view.
   *
   * See [dockOptions](#dockOptions) to override default options related to docking the popup.
   *
   * @name dockEnabled
   * @instance
   *
   * @type {Boolean}
   * @default false
   * @see [Sample - Popup docking](../sample-code/popup-docking-position/index.html)
   *
   * @example
   * // The popup will automatically be dockEnabled when made visible
   * view.popup.dockEnabled = true;
   */
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
  //  featureMenuOpen
  //----------------------------------

  /**
   * @todo document
   */

  @property()
  @renderable()
  featureMenuOpen = false;

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
  //  featureNavigationEnabled
  //----------------------------------

  /**
   * Shows pagination for the popup if available. This allows the user to
   * scroll through various [selected features](#features) using either
   * arrows
   *
   * ![popup-pagination-arrows](../assets/img/apiref/widgets/popup-pagination-arrows.png)
   *
   * or a menu.
   *
   * ![popup-feature-menu](../assets/img/apiref/widgets/popup-pagination-menu.png)
   *
   * @type {Boolean}
   * @default
   * @ignore
   */
  @property()
  @renderable()
  featureNavigationEnabled = true;

  //----------------------------------
  //  highlightEnabled
  //----------------------------------

  /**
   * Highlight the selected popup feature using the {@link module:esri/views/SceneView#highlightOptions highlightOptions}
   * set on the {@link module:esri/views/SceneView}. Currently highlight only works in 3D.
   *
   * @name highlightEnabled
   * @instance
   *
   * @type {Boolean}
   * @default true
   */
  @aliasOf("viewModel.highlightEnabled")
  highlightEnabled: boolean = null;

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
  //  selectedFeature
  //----------------------------------

  /**
   * The selected feature accessed by the popup. The content of the Popup is
   * determined based on the {@link module:esri/PopupTemplate} assigned to
   * this feature.
   *
   * @name selectedFeature
   * @instance
   *
   * @type {module:esri/Graphic}
   * @readonly
   */
  @aliasOf("viewModel.selectedFeature")
  @renderable()
  selectedFeature: Graphic = null;

  //----------------------------------
  //  selectedFeatureIndex
  //----------------------------------

  /**
   * Index of the feature that is [selected](#selectedFeature). When [features](#features) are set,
   * the first index is automatically selected.
   *
   * @name selectedFeatureIndex
   * @instance
   *
   * @type {Number}
   */
  @aliasOf("viewModel.selectedFeatureIndex")
  @renderable()
  selectedFeatureIndex: number = null;

  //----------------------------------
  //  selectedPopupRenderer
  //----------------------------------

  /**
   * @todo document
   */
  @property({
    readOnly: true
  })
  @renderable()
  selectedPopupRenderer: PopupRenderer = null;

  //----------------------------------
  //  spinnerEnabled
  //----------------------------------

  /**
   * Indicates whether to display a spinner at the popup location prior to its
   * display when it has pending promises.
   *
   * @type {boolean}
   * @default
   * @ignore
   */
  @property()
  spinnerEnabled = true;

  //----------------------------------
  //  title
  //----------------------------------

  /**
   * The title of the popup. This can be set generically on the popup no
   * matter the features that are selected. If the [selected feature](#selectedFeature)
   * has a {@link module:esri/PopupTemplate}, then the title set in the
   * corresponding template is used here.
   *
   * @name title
   * @instance
   *
   * @type {String}
   *
   * @example
   * // This title will display in the popup unless a selected feature's
   * // PopupTemplate overrides it
   * view.popup.title = "Population by zip codes in Southern California";
   */
  @aliasOf("viewModel.title")
  @renderable()
  title: string = null;

  //----------------------------------
  //  updateLocationEnabled
  //----------------------------------

  /**
   * @todo document
   */
  @aliasOf("viewModel.updateLocationEnabled")
  updateLocationEnabled: boolean = null;

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

  /**
   * This is a class that contains all the logic
   * (properties and methods) that controls this widget's behavior. See the
   * {@link module:esri/widgets/Popup/PopupViewModel} class to access
   * all properties and methods on the widget.
   *
   * @name viewModel
   * @instance
   * @type {module:esri/widgets/Popup/PopupViewModel}
   * @autocast
   */
  @property({
    type: PopupViewModel
  })
  @renderable([
    "viewModel.screenLocation",
    "viewModel.screenLocationEnabled",
    "viewModel.state",
    "viewModel.pendingPromisesCount",
    "viewModel.promiseCount",
    "viewModel.waitingForResult"
  ])
  @vmEvent(["triggerAction", "trigger-action"])
  viewModel = new PopupViewModel();

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

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  /**
   * Removes [promises](#promises), [features](#features), [content](#content),
   * [title](#title) and [location](#location) from the Popup.
   *
   * @method
   */
  @aliasOf("viewModel.clear")
  clear(): void { }

  /**
   * Closes the popup by setting its [visible](#visible) property to `false`. Users can
   * alternatively close the popup
   * by directly setting the [visible](#visible) property to `false`.
   *
   * @see [Popup.visible](#visible)
   */
  close() {
    this.visible = false;
  }

  /**
   * Selects the feature at the next index in relation to the selected feature.
   *
   * @method
   *
   * @see [selectedFeatureIndex](#selectedFeatureIndex)
   *
   * @return {module:esri/widgets/Popup/PopupViewModel} Returns an instance of the popup's view model.
   */
  @aliasOf("viewModel.next")
  next(): PopupViewModel { return null; }

  /**
   * Opens the popup at the given location with content defined either explicitly with `content`
   * or driven from the {@link module:esri/PopupTemplate} of input features. This method sets
   * the popup's [visible](#visible) property to `true`. Users can alternatively open the popup
   * by directly setting the [visible](#visible) property to `true`. The popup will only display if
   * the view's size constraints in [dockOptions](#dockOptions) are met or the [location](#location)
   * property is set to a geometry.
   *
   * @see [Intro to popups](../sample-code/intro-popup/index.html)
   * @see [Popup.visible](#visible)
   * @see [Sample - QueryTask](../sample-code/tasks-query/index.html)
   *
   * @param {Object} [options] - Defines the location and content of the popup when opened.
   * @param {string} [options.title] - Sets the [title](#title) of the popup.
   * @param {string} [options.content] - Sets the the [content](#content) of the popup.
   * @param {module:esri/geometry/Geometry} [options.location] - Sets the popup's [location](#location), which is the geometry used to position the popup.
   * @param {module:esri/Graphic[]} [options.features] - Sets the popup's [features](#features), which populate the title and content of the popup based on each graphic's {@link module:esri/PopupTemplate}.
   * @param {Promise[]} [options.promises] - Sets pending [promises](#promises) on the popup. The popup will display once the promises resolve. Each promise must resolve to an array of {@link module:esri/Graphic Graphics}.
   * @param {boolean} [options.featureMenuOpen] - **Since:** 4.5 <br> This property enables multiple features in a popup to display in a list rather than displaying the first selected feature. Setting this to `true`
   * allows the user to scroll through the list of features returned from the query and choose the selection they want to display within the popup.
   * <br><br>**Default Value:** false
   * @param {boolean} [options.updateLocationEnabled] - When `true` indicates the popup should update its [location](#location) for each paginated feature based on the [selected feature's](#selectedFeature) geometry.
   * <br><br>**Default Value:** false
   * @param {boolean} [options.collapsed] - **Since:** 4.5 <br> When `true`, indicates that only the popup header will display.
   * <br><br>**Default Value:** false
   *
   * @example
   * view.on("click", function(event){
   *   view.popup.open({
   *    location: event.mapPoint,  // location of the click on the view
   *    title: "You clicked here",  // title displayed in the popup
   *    content: "This is a point of interest"  // content displayed in the popup
   *   });
   * });   * view.on("click", function(event){
   *   view.popup.open({
   *    location: event.mapPoint,  // location of the click on the view
   *    title: "You clicked here",  // title displayed in the popup
   *    content: "This is a point of interest"  // content displayed in the popup
   *   });
   * });
   *
   * @example
   * view.popup.open({
   *   title: "You clicked here",  // title displayed in the popup
   *   content: "This is a point of interest",  // content displayed in the popup
   *   updateLocationEnabled: true  // updates the location of popup based on
   *   // selected feature's geometry
   * });
   *
   * @example
   * view.popup.open({
   *   features: graphics,  // array of graphics
   *   featureMenuOpen: true, // selected features initially display in a list
   * });
   *
   */
  open(options?: __esri.PopupOpenOptions) {
    const defaultOptions: __esri.PopupOpenOptions = {
      featureMenuOpen: false,
      updateLocationEnabled: false,
      promises: []
    };

    const setOptions = {
      visible: true,
      ...defaultOptions,
      ...options
    };

    if (setOptions.featureMenuOpen) {
      this._closeFeatureMenuHandle.pause();
    }

    this.set(setOptions);
  }

  /**
   * Selects the feature at the previous index in relation to the selected feature.
   *
   * @method
   *
   * @see [selectedFeatureIndex](#selectedFeatureIndex)
   *
   * @return {module:esri/widgets/Popup/PopupViewModel} Returns an instance of the popup's view model.
   */
  @aliasOf("viewModel.previous")
  previous(): PopupViewModel { return null; }

  /**
   * Positions the popup on the view.
   * Moves the popup into the view's extent if the popup is partially or fully outside
   * the view's extent.
   *
   * If the popup is partially out of view, the view will move to fully show the popup.
   * If the popup is fully out of view, the view will move to the popup's location.
   */
  reposition() {
    this.renderNow();
    this._positionContainer();
    this._setCurrentAlignment();
  }

  /**
   * Triggers the [trigger-action](#event:trigger-action) event and executes the [action](#actions)
   * at the specified index in the [actions](#actions) array.
   *
   * @param {number} actionIndex - The index of the [action](#actions) to execute.
   *
   * @method
   */
  @aliasOf("viewModel.triggerAction")
  triggerAction(actionIndex: number): void { return null; }

  render() {
    const {
      collapsed,
      collapseEnabled,
      dockEnabled,
      dockOptions,
      actions,
      featureMenuOpen,
      featureNavigationEnabled,
      popupRenderers,
      visible
    } = this;

    const {
      featureCount,
      promiseCount,
      pendingPromisesCount,
      selectedFeatureIndex,
      title,
      waitingForResult
    } = this.viewModel;

    const featureNavigationVisible = featureCount > 1 && featureNavigationEnabled;
    const isFeatureMenuOpen = featureCount > 1 && featureMenuOpen;
    const contentVisible = collapseEnabled && !isFeatureMenuOpen && collapsed;
    const actionsCount = actions && actions.length;
    const pageText = featureNavigationVisible && this._getPageText(featureCount, selectedFeatureIndex);
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

    const featureMenuIconClasses = {
      [CSS.iconFeatureMenu]: !isFeatureMenuOpen,
      [CSS.iconClose]: isFeatureMenuOpen
    };

    const featureMenuIconNode = (
      <span aria-hidden="true"
        class={CSS.icon} classes={featureMenuIconClasses} />
    );

    const previousIconClasses = {
      [CSS.iconRightTriangleArrow]: isRtl,
      [CSS.paginationPreviousIconRTL]: isRtl,
      [CSS.iconLeftTriangleArrow]: !isRtl,
      [CSS.paginationPreviousIconLTR]: !isRtl
    };

    const previousIconNode = (
      <span aria-hidden="true"
        class={CSS.icon} classes={previousIconClasses} />
    );

    const paginationPreviousButtonNode = (
      <div role="button"
        tabIndex={0}
        bind={this}
        onclick={this._previous}
        onkeydown={this._previous}
        class={join(CSS.button, CSS.paginationPrevious)}
        aria-label={i18n.previous}
        title={i18n.previous}>
        {previousIconNode}
      </div>
    );

    const nextIconClasses = {
      [CSS.iconLeftTriangleArrow]: isRtl,
      [CSS.paginationNextIconRTL]: isRtl,
      [CSS.iconRightTriangleArrow]: !isRtl,
      [CSS.paginationNextIconLTR]: !isRtl
    };

    const nextIconNode = (
      <span aria-hidden="true"
        class={CSS.icon} classes={nextIconClasses} />
    );

    const paginationNextButtonNode = (
      <div role="button"
        tabIndex={0}
        bind={this}
        onclick={this._next}
        onkeydown={this._next}
        class={join(CSS.button, CSS.paginationNext)}
        aria-label={i18n.next}
        title={i18n.next}>
        {nextIconNode}
      </div>
    );

    const featureMenuToggleNode = (
      <div role="button"
        tabIndex={0}
        bind={this}
        onclick={this._toggleFeatureMenu}
        onkeydown={this._toggleFeatureMenu}
        afterCreate={this._storeFeatureMenuButtonNode}
        afterUpdate={this._storeFeatureMenuButtonNode}
        class={join(CSS.button, CSS.featureMenuButton)}
        aria-label={i18n.menu}
        title={i18n.menu}>
        {featureMenuIconNode}
      </div>
    );

    const paginationTextNode = (
      <div class={CSS.paginationText}>{pageText}</div>
    );

    const navigationButtonsNode = featureNavigationVisible ? (
      <div class={CSS.navigationButtons}>
        {paginationPreviousButtonNode}
        {paginationTextNode}
        {paginationNextButtonNode}
        {featureMenuToggleNode}
      </div>
    ) : null;

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

    const canBeCollapsed = collapseEnabled && (hasContent || actionsCount || featureNavigationVisible);
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

    // const actionsNode = !isFeatureMenuOpen ? (
    //   <div key={buildKey("actions")} class={CSS.actions}>{this._renderActions()}</div>
    // ) : null;

    // 不再渲染底部的actions菜单
    const actionsNode = null;

    const navigationNode = (
      <section key={buildKey("navigation")} class={CSS.navigation}>
        {loadingContainerNode}
        {navigationButtonsNode}
      </section>
    );

    const featureButtonsNode = (featureNavigationVisible || actionsCount) ? (
      <div key={buildKey("feature-buttons")} class={CSS.featureButtons}>
        {actionsNode}
        {navigationNode}
      </div>
    ) : null;

    const featureMenuNode = this._renderFeatureMenuNode(popupRenderers, selectedFeatureIndex, isFeatureMenuOpen);

    if (featureMenuNode) {
      this._closeFeatureMenuHandle.resume();
    }

    const infoText = esriLang.substitute({
      total: popupRenderers.length
    }, i18n.selectedFeatures);

    const menuNode = (
      <section key={buildKey("menu")}
        class={CSS.featureMenu}>
        <h2 class={CSS.featureMenuHeader}>{infoText}</h2>
        <nav class={CSS.featureMenuViewport}
          afterCreate={this._storeFeatureMenuViewportNode}
          afterUpdate={this._storeFeatureMenuViewportNode}>
          {featureMenuNode}
        </nav>
      </section>
    );

    if (this._featureMenuViewportNode) {
      this._featureMenuViewportNode.scrollTop = 0;
    }

    const pointerNode = !dockEnabled ? (
      <div key={buildKey("pointer")} class={CSS.pointer}
        role="presentation">
        <div class={join(CSS.pointerDirection, CSS.shadow)} />
      </div>
    ) : null;

    const pinNode = dockEnabled ? (
      <div key={buildKey("ecpin")} class={CSS.ecpin}
        role="presentation"
        bind={this}
        onclick={this._triggerEcPin}>
        <span aria-hidden="true"
          class={join(CSS.icon, CSS.iconEcPin)}></span>
      </div>
    ) : null;

    const containerClasses = {
      [CSS.alignTopCenter]: currentAlignment === "top-center",
      [CSS.alignBottomCenter]: currentAlignment === "bottom-center",
      [CSS.alignTopLeft]: currentAlignment === "top-left",
      [CSS.alignBottomLeft]: currentAlignment === "bottom-left",
      [CSS.alignTopRight]: currentAlignment === "top-right",
      [CSS.alignBottomRight]: currentAlignment === "bottom-right",
      [CSS.isDocked]: dockEnabled,
      [CSS.isDockedFloatPop]: dockEnabled,
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

    const menuTopNode = showButtonsTop ? menuNode : null;
    const menuBottomNode = showButtonsBottom ? menuNode : null;
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
        <div class={CSS.ecpinWrapper}>
          {pinNode}
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
        </div>
        {pointerNode}
      </div>
    ) : null;

    return (
      <div key={buildKey("base")} class={CSS.base} role="presentation">{containerNode}</div>
    );
  }

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  private _setTitleFromPopupRenderer(title: string): void {
    this.viewModel.title = title || "";
  }

  private _setContentFromPopupRenderer(): void {
    this.viewModel.content = this.selectedPopupRenderer || null;
    this.scheduleRender();
  }

  private _zoomToAction(event: any): void {
    if (!event.action || event.action.id !== ZOOM_TO_ACTION_ID) {
      return;
    }

    this.viewModel.zoomToLocation();
  }

  private _spinnerEnabledChange(spinnerEnabled: boolean): void {
    this._destroySpinner();

    if (!spinnerEnabled) {
      return;
    }

    const view = this.get<MapView | SceneView>("viewModel.view");
    this._createSpinner(view);
  }

  private _displaySpinner(): void {
    const { _spinner: spinner } = this;

    if (!spinner) {
      return;
    }

    const {
      location,
      waitingForResult
    } = this.viewModel;

    if (waitingForResult) {
      spinner.show({
        location
      });

      return;
    }

    spinner.hide();
  }

  private _getIconStyles(subActionImage: string): HashMap<string> {
    return {
      "background-image": subActionImage ? `url(${subActionImage})` : ""
    };
  }

  private _renderAction(action: Action, actionIndex: number, total: number, actionsKey: string): any {
    const actionHandle = watchUtils.watch(action, [
      "id",
      "className",
      "title",
      "image",
      "visible"
    ], () => this.scheduleRender());

    this._handleRegistry.add(actionHandle, actionsKey);

    const selectedFeatureAttributes = this.get("selectedFeature.attributes");

    if (action.id === ZOOM_TO_ACTION_ID) {
      action.title = i18n.zoom;
      action.className = CSS.iconZoom;
    }

    const { title: actionTitle, className: actionClassName } = action;
    const actionImage = !action.image && !actionClassName ? DEFAULT_ACTION_IMAGE : action.image;

    const subActionTitle = actionTitle && selectedFeatureAttributes ?
      esriLang.substitute(selectedFeatureAttributes, actionTitle) :
      actionTitle;
    const subActionClass = actionClassName && selectedFeatureAttributes ?
      esriLang.substitute(selectedFeatureAttributes, actionClassName) :
      actionClassName;
    const subActionImage = actionImage && selectedFeatureAttributes ?
      esriLang.substitute(selectedFeatureAttributes, actionImage) :
      actionImage;

    const iconClasses = {
      [subActionClass]: !!subActionClass,
      [CSS.actionImage]: !!subActionImage
    };

    const textNode = total <= this._displayActionTextLimit ? (
      <span key={buildKey(`action-text-${actionIndex}-${action.uid}`)}
        class={CSS.actionText}>{subActionTitle}</span>
    ) : null;

    return action.visible ? (
      <div key={buildKey(`action-${actionIndex}-${action.uid}`)}
        role="button"
        tabIndex={0}
        title={subActionTitle}
        aria-label={subActionTitle}
        class={join(CSS.button, CSS.action)}
        bind={this}
        data-action-index={actionIndex}
        onclick={this._triggerAction}
        onkeydown={this._triggerAction}>
        <span key={buildKey(`action-icon-${actionIndex}-${action.uid}`)}
          aria-hidden="true"
          class={CSS.icon}
          classes={iconClasses}
          styles={this._getIconStyles(subActionImage)} />
        {textNode}
      </div >
    ) : null;
  }

  private _renderActions(): any {
    const actionsKey = "actions";
    this._handleRegistry.remove(actionsKey);

    const { actions } = this;

    if (!actions) {
      return;
    }

    const totalActions = actions.length;
    const actionsArray = actions.toArray();

    const actionNodes = actionsArray.map((action, index) => {
      return this._renderAction(action, index, totalActions, actionsKey);
    });

    return (
      <div key={buildKey("actions")} class={CSS.actions}>{actionNodes}</div>
    );
  }

  private _updatePopupRenderer(): void {
    const { popupRenderers } = this;
    const { selectedFeatureIndex } = this.viewModel;
    const selectedPopupRenderer = popupRenderers[selectedFeatureIndex] || null;

    if (selectedPopupRenderer && !selectedPopupRenderer.contentEnabled) {
      selectedPopupRenderer.contentEnabled = true;
    }

    this._set("selectedPopupRenderer", selectedPopupRenderer);
  }

  private _destroyPopupRenderers(): void {
    this.popupRenderers.forEach(popupRenderer => popupRenderer.destroy());
    this._set("popupRenderers", []);
  }

  private _createPopupRenderers(features: Graphic[]): void {
    this._destroyPopupRenderers();

    const popupRenderers: PopupRenderer[] = [];

    features && features.forEach(feature => {
      const popupRenderer = new PopupRenderer({
        contentEnabled: false,
        graphic: feature,
        view: this.get("viewModel.view")
      });
      popupRenderers.push(popupRenderer);
    });

    this._set("popupRenderers", popupRenderers);
  }

  private _isScreenLocationWithinView(screenLocation: ScreenPoint, view: MapView | SceneView): boolean {
    return (screenLocation.x > -1 &&
      screenLocation.y > -1 &&
      screenLocation.x <= view.width &&
      screenLocation.y <= view.height);
  }

  private _isOutsideView(options: any): boolean {
    const { popupHeight, popupWidth, screenLocation, side, view } = options;

    if (isNaN(popupWidth) || isNaN(popupHeight) || !view || !screenLocation) {
      return false;
    }

    const padding = view.padding;

    if (side === "right" && ((screenLocation.x + (popupWidth / 2)) > (view.width - padding.right))) {
      return true;
    }

    if (side === "left" && (screenLocation.x - (popupWidth / 2) < padding.left)) {
      return true;
    }

    if (side === "top" && ((screenLocation.y - popupHeight) < padding.top)) {
      return true;
    }

    if (side === "bottom" && ((screenLocation.y + popupHeight) > (view.height - padding.bottom))) {
      return true;
    }

    return false;
  }

  private _determineCurrentAlignment(): any {
    const {
      _pointerOffsetInPx: pointerOffset,
      _containerNode: containerNode,
      _mainContainerNode: mainContainerNode,
      viewModel
    } = this;

    const { screenLocation, view } = viewModel;

    if (!screenLocation || !view || !containerNode) {
      return "top-center";
    }

    if (!this._isScreenLocationWithinView(screenLocation, view)) {
      return this._get("currentAlignment") || "top-center";
    }

    function cssPropertyToInteger(value: string): number {
      return parseInt(value.replace(/[^-\d\.]/g, ""), 10);
    }

    const mainComputedStyle = mainContainerNode ?
      window.getComputedStyle(mainContainerNode, null) :
      null;

    const contentMaxHeight = mainComputedStyle ?
      cssPropertyToInteger(mainComputedStyle.getPropertyValue("max-height")) :
      0;

    const contentHeight = mainComputedStyle ?
      cssPropertyToInteger(mainComputedStyle.getPropertyValue("height")) :
      0;

    const contentBox = domGeometry.getContentBox(containerNode);
    const popupWidth = contentBox.w + pointerOffset;
    const popupHeight = Math.max(contentBox.h, contentMaxHeight, contentHeight) + pointerOffset;

    const isOutsideViewRight = this._isOutsideView({
      popupHeight,
      popupWidth,
      screenLocation,
      side: "right",
      view
    });

    const isOutsideViewLeft = this._isOutsideView({
      popupHeight,
      popupWidth,
      screenLocation,
      side: "left",
      view
    });

    const isOutsideViewTop = this._isOutsideView({
      popupHeight,
      popupWidth,
      screenLocation,
      side: "top",
      view
    });

    const isOutsideViewBottom = this._isOutsideView({
      popupHeight,
      popupWidth,
      screenLocation,
      side: "bottom",
      view
    });

    return isOutsideViewLeft ?
      isOutsideViewTop ?
        "bottom-right" :
        "top-right" :
      isOutsideViewRight ?
        isOutsideViewTop ?
          "bottom-left" :
          "top-left" :
        isOutsideViewTop ?
          isOutsideViewBottom ?
            "top-center" :
            "bottom-center" :
          "top-center";
  }

  private _getCurrentAlignment(): any {
    const { alignment, dockEnabled } = this;

    if (dockEnabled) {
      return null;
    }

    const currentAlignment = alignment === "auto" ?
      this._determineCurrentAlignment() :
      typeof alignment === "function" ?
        alignment.call(this) :
        alignment;
    return currentAlignment;
  }

  private _setCurrentAlignment(): void {
    this._set("currentAlignment", this._getCurrentAlignment());
  }

  private _setCurrentDockPosition(): void {
    this._set("currentDockPosition", this._getCurrentDockPosition());
  }

  private _getDockPosition(): any {
    const dockPosition = this.get<any>("dockOptions.position");
    const position = dockPosition === "auto" ?
      this._determineCurrentDockPosition() :
      typeof dockPosition === "function" ?
        dockPosition.call(this) :
        dockPosition;
    return position;
  }

  private _getCurrentDockPosition(): any {
    return this.dockEnabled ? this._getDockPosition() : null;
  }

  private _wouldDockTo(): any {
    return !this.dockEnabled ? this._getDockPosition() : null;
  }

  private _renderFeatureMenuItemNode(popupRenderer: PopupRenderer, popupRendererIndex: number, selectedFeatureIndex: number, featureMenuOpen: boolean): any {
    const isSelectedFeature = popupRendererIndex === selectedFeatureIndex;

    const itemClasses = {
      [CSS.featureMenuSelected]: isSelectedFeature
    };

    const itemLabel = popupRenderer.title || i18n.untitled;

    const checkMarkNode = isSelectedFeature ?
      (
        <span key={buildKey(`feature-menu-selected-feature-${selectedFeatureIndex}`)}
          title={i18n.selectedFeature}
          aria-label={i18n.selectedFeature}
          class={CSS.iconCheckMark} />
      ) :
      null;

    return (
      <li role="menuitem"
        tabIndex={isSelectedFeature || !featureMenuOpen ? -1 : 0}
        key={buildKey(`feature-menu-feature-${selectedFeatureIndex}`)}
        classes={itemClasses}
        class={CSS.featureMenuItem}
        title={itemLabel}
        aria-label={itemLabel}
        bind={this}
        data-feature-index={popupRendererIndex}
        onclick={this._selectFeature}
        onkeydown={this._selectFeature}>
        <span class={CSS.featureMenuTitle}>
          {itemLabel}
          {checkMarkNode}
        </span>
      </li>
    );
  }

  private _renderFeatureMenuNode(popupRenderers: PopupRenderer[], selectedFeatureIndex: number, featureMenuOpen: boolean): any {
    return popupRenderers.length > 1 ? (
      <ol class={CSS.featureMenuList}
        role="menu">
        {popupRenderers.map((popupRenderer, popupRendererIndex) => {
          return this._renderFeatureMenuItemNode(popupRenderer, popupRendererIndex, selectedFeatureIndex, featureMenuOpen);
        })}
      </ol>
    ) : null;
  }

  private _determineCurrentDockPosition(): string {
    const view = this.get<MapView | SceneView>("viewModel.view");
    const defaultDockPosition = widgetUtils.isRtl() ? "top-left" : "top-right";

    if (!view) {
      return defaultDockPosition;
    }

    const viewPadding = view.padding || { left: 0, right: 0, top: 0, bottom: 0 };
    const viewWidth = view.width - viewPadding.left - viewPadding.right;
    const breakpoints = view.get<Object>("breakpoints");

    if (breakpoints && viewWidth <= breakpoints.xsmall) {
      return "bottom-center";
    }

    return defaultDockPosition;
  }

  private _renderContent(): any {
    const content = this.get<any>("viewModel.content");
    const contentKey = "content";

    if (typeof content === "string") {
      return <div key={buildKey(`${contentKey}-string`)} innerHTML={content} />;
    }

    if (isWidget(content)) {
      return <div key={buildKey(`${contentKey}-widget`)}>
        {content.render()}
      </div>;
    }

    if (content instanceof HTMLElement) {
      return <div key={buildKey(`${contentKey}-html-element`)}
        bind={content}
        afterUpdate={this._attachToNode}
        afterCreate={this._attachToNode} />;
    }

    if (isWidgetBase(content)) {
      return <div key={buildKey(`${contentKey}-dijit`)}
        bind={content.domNode}
        afterUpdate={this._attachToNode}
        afterCreate={this._attachToNode} />;
    }
  }

  private _attachToNode(this: HTMLElement, node: HTMLElement): void {
    const content = this;
    node.appendChild(content);
  }

  private _positionContainer(containerNode: HTMLDivElement = this._containerNode): void {
    if (containerNode) {
      this._containerNode = containerNode;
    }

    if (!containerNode) {
      return;
    }

    const { screenLocation } = this.viewModel;
    const domGeometryBox = domGeometry.getContentBox(containerNode);
    const positionStyle = this._calculatePositionStyle(screenLocation, domGeometryBox);

    if (!positionStyle) {
      return;
    }

    containerNode.style.top = positionStyle.top;
    containerNode.style.left = positionStyle.left;
    containerNode.style.bottom = positionStyle.bottom;
    containerNode.style.right = positionStyle.right;
  }

  private _calculateFullWidth(width: number): number {
    const { currentAlignment, _pointerOffsetInPx: pointerOffset } = this;

    if (
      currentAlignment === "top-left" ||
      currentAlignment === "bottom-left" ||
      currentAlignment === "top-right" ||
      currentAlignment === "bottom-right"
    ) {
      return width + pointerOffset;
    }

    return width;
  }

  private _calculateAlignmentPosition(x: number, y: number, view: MapView | SceneView, width: number): any {
    const { currentAlignment, _pointerOffsetInPx: pointerOffset } = this;
    const halfWidth = width / 2;
    const viewHeightOffset = view.height - y;
    const viewWidthOffset = view.width - x;

    if (currentAlignment === "bottom-center") {
      return {
        top: y + pointerOffset,
        left: x - halfWidth
      };
    }

    if (currentAlignment === "top-left") {
      return {
        bottom: viewHeightOffset + pointerOffset,
        right: viewWidthOffset + pointerOffset
      };
    }

    if (currentAlignment === "bottom-left") {
      return {
        top: y + pointerOffset,
        right: viewWidthOffset + pointerOffset
      };
    }

    if (currentAlignment === "top-right") {
      return {
        bottom: viewHeightOffset + pointerOffset,
        left: x + pointerOffset
      };
    }

    if (currentAlignment === "bottom-right") {
      return {
        top: y + pointerOffset,
        left: x + pointerOffset
      };
    }

    if (currentAlignment === "top-center") {
      return {
        bottom: viewHeightOffset + pointerOffset,
        left: x - halfWidth
      };
    }
  }

  private _calculatePositionStyle(screenLocation: ScreenPoint, domGeometryBox: dojo.DomGeometryBox): any {
    const { dockEnabled, view } = this;

    if (!view) {
      return;
    }

    const padding = view.padding;

    if (dockEnabled) {
      return {
        left: padding.left ?
          `${padding.left}px` :
          "",
        top: padding.top ?
          `${padding.top}px` :
          "",
        right: padding.right ?
          `${padding.right}px` :
          "",
        bottom: padding.bottom ?
          `${padding.bottom}px` :
          ""
      };
    }

    if (!screenLocation || !domGeometryBox) {
      return;
    }

    const width = this._calculateFullWidth(domGeometryBox.w);
    const position = this._calculateAlignmentPosition(screenLocation.x, screenLocation.y, view, width);

    if (!position) {
      return;
    }

    return {
      top: position.top !== undefined ?
        `${position.top}px` :
        "auto",
      left: position.left !== undefined ?
        `${position.left}px` :
        "auto",
      bottom: position.bottom !== undefined ?
        `${position.bottom}px` :
        "auto",
      right: position.right !== undefined ?
        `${position.right}px` :
        "auto"
    };
  }

  private _viewChange(newView: MapView | SceneView, oldView: MapView | SceneView): void {
    if (newView && oldView) {
      this.close();
      this.clear();
    }
  }

  private _viewReadyChange(isReady: boolean, wasReady: boolean): void {
    if (isReady) {
      const view = this.get<MapView | SceneView>("viewModel.view");
      this._wireUpView(view);
      return;
    }

    if (wasReady) {
      this.close();
      this.clear();
    }
  }

  private _wireUpView(view?: MapView | SceneView): void {
    this._destroySpinner();

    if (!view) {
      return;
    }

    const { spinnerEnabled } = this;

    if (spinnerEnabled) {
      this._createSpinner(view);
    }

    this._setDockEnabledForViewSize(this.dockOptions);
  }

  private _dockingThresholdCrossed(newSize: number[], oldSize: number[], dockingThreshold: __esri.PopupDockOptionsBreakpoint): boolean {
    const [currWidth, currHeight] = newSize,
      [prevWidth, prevHeight] = oldSize,
      { width: dockingWidth, height: dockingHeight } = dockingThreshold;

    return (currWidth <= dockingWidth && prevWidth > dockingWidth) ||
      (currWidth > dockingWidth && prevWidth <= dockingWidth) ||
      (currHeight <= dockingHeight && prevHeight > dockingHeight) ||
      (currHeight > dockingHeight && prevHeight <= dockingHeight);
  }

  private _updateDockEnabledForViewSize(newSize: number[], oldSize: number[]): void {
    if (!newSize || !oldSize) {
      return;
    }

    const viewPadding = this.get<__esri.ViewPadding>("viewModel.view.padding") || { left: 0, right: 0, top: 0, bottom: 0 };
    const widthPadding = viewPadding.left + viewPadding.right;
    const heightPadding = viewPadding.top + viewPadding.bottom;
    const newUISize: number[] = [],
      oldUISize: number[] = [];
    newUISize[0] = newSize[0] - widthPadding;
    newUISize[1] = newSize[1] - heightPadding;
    oldUISize[0] = oldSize[0] - widthPadding;
    oldUISize[1] = oldSize[1] - heightPadding;
    /*
      When the size of the view changes, check to see if we need to switch the dockEnabled state
    */
    const { dockOptions } = this;
    const breakpoint = dockOptions.breakpoint;

    if (this._dockingThresholdCrossed(newUISize, oldUISize, breakpoint)) {
      this._setDockEnabledForViewSize(dockOptions);
    }

    this._setCurrentDockPosition();
  }

  private _hasFeatureUpdated(): void {
    const { _containerNode } = this;
    const { pendingPromisesCount } = this.viewModel;
    const waitingForContent = this.get<boolean>("selectedPopupRenderer.viewModel.waitingForContent");

    if (!_containerNode || !!pendingPromisesCount || waitingForContent) {
      return;
    }

    // todo: @juan6600 need a better way to do this.
    _containerNode.classList.remove(CSS.hasFeatureUpdated);
    _containerNode.offsetHeight;
    _containerNode.classList.add(CSS.hasFeatureUpdated);
  }

  private _storeMainContainerNode(element: HTMLDivElement): void {
    this._mainContainerNode = element;
  }

  private _storeFeatureMenuButtonNode(element: HTMLDivElement): void {
    this._featureMenuButtonNode = element;
  }

  private _storeFeatureMenuViewportNode(element: HTMLElement): void {
    this._featureMenuViewportNode = element;
  }

  private _toggleScreenLocationEnabled(): void {
    const { dockEnabled, visible, viewModel } = this;

    if (!viewModel) {
      return;
    }

    const screenLocationEnabled = visible && !dockEnabled;
    viewModel.screenLocationEnabled = screenLocationEnabled;
  }

  private _shouldDockAtCurrentViewSize(dockOptions: __esri.PopupDockOptions): boolean {
    const breakpoint = dockOptions.breakpoint;
    const { width: uiWidth, height: uiHeight } = this.get<UI>("viewModel.view.ui");

    if (isNaN(uiWidth) || isNaN(uiHeight)) {
      return false;
    }

    const crossedWidthBreakpoint = breakpoint.hasOwnProperty("width") && uiWidth <= breakpoint.width;
    const crossedHeightBreakpoint = breakpoint.hasOwnProperty("height") && uiHeight <= breakpoint.height;

    return crossedWidthBreakpoint || crossedHeightBreakpoint;
  }

  private _setDockEnabledForViewSize(dockOptions: __esri.PopupDockOptions): void {
    if (dockOptions.breakpoint) {
      this.dockEnabled = this._shouldDockAtCurrentViewSize(dockOptions);
    }
  }

  private _getPageText(featureCount: number, selectedFeatureIndex: number): string {
    return esriLang.substitute({
      index: selectedFeatureIndex + 1,
      total: featureCount
    }, i18n.pageText);
  }

  private _destroySpinner(): void {
    if (this._spinner) {
      this._spinner.destroy();
      this._spinner = null;
    }
  }

  private _createSpinner(view: MapView | SceneView): void {
    if (!view) {
      return;
    }

    this._spinner = new Spinner({
      container: document.createElement("div"),
      view: view
    });

    view.root.appendChild(this._spinner.container);
  }

  private _closeFeatureMenu(): void {
    this.featureMenuOpen = false;
  }

  @accessibleHandler()
  private _toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  @accessibleHandler()
  private _close(): void {
    this.close();
  }

  @accessibleHandler()
  private _toggleDockEnabled(): void {
    this.dockEnabled = !this.dockEnabled;
  }

  @accessibleHandler()
  private _toggleFeatureMenu(): void {
    this.featureMenuOpen = !this.featureMenuOpen;
  }

  @accessibleHandler()
  private _triggerEcPin(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.viewModel.triggerAction(0);
  }

  @accessibleHandler()
  private _triggerAction(event: Event): void {
    const node = event.currentTarget as Element;
    const actionIndex = node["data-action-index"] as number;
    this.viewModel.triggerAction(actionIndex);
  }

  @accessibleHandler()
  private _selectFeature(event: Event): void {
    const node = event.currentTarget as Element;
    const featureIndex = node["data-feature-index"] as number;

    if (!isNaN(featureIndex)) {
      this.viewModel.selectedFeatureIndex = featureIndex;
    }

    if (this._featureMenuButtonNode) {
      this._featureMenuButtonNode.focus();
    }
  }

  @accessibleHandler()
  private _next(): void {
    this.next();
  }

  @accessibleHandler()
  private _previous(): void {
    this.previous();
  }

}

export = FloatPop;
