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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/tsSupport/assignHelper", "esri/widgets/support/widget", "esri/core/accessorSupport/decorators", "esri/core/lang", "esri/core/HandleRegistry", "esri/core/watchUtils", "esri/widgets/Widget", "esri/widgets/support/widgetUtils", "esri/widgets/Popup/PopupRenderer", "esri/widgets/Popup/PopupViewModel", "dojo/i18n!esri/widgets/Popup/nls/Popup", "esri/widgets/Spinner", "dojo/dom-geometry"], function (require, exports, __extends, __decorate, __assign, widget_1, decorators_1, esriLang, HandleRegistry, watchUtils, Widget, widgetUtils, PopupRenderer, PopupViewModel, i18n, Spinner, domGeometry) {
    "use strict";
    var DEFAULT_ACTION_IMAGE = require.toUrl("esri/widgets/Popup/images/default-action.svg");
    var CSS = {
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
    var ZOOM_TO_ACTION_ID = "zoom-to";
    var DOCK_OPTIONS = {
        buttonEnabled: true,
        position: "auto",
        breakpoint: {
            width: 544
        }
    };
    var WIDGET_KEY_PARTIAL = "esri-popup";
    function buildKey(element, index) {
        if (index === undefined) {
            return WIDGET_KEY_PARTIAL + "__" + element;
        }
        return WIDGET_KEY_PARTIAL + "__" + element + "-" + index;
    }
    function isWidget(value) {
        return value && value.isInstanceOf && value.isInstanceOf(Widget);
    }
    function isWidgetBase(value) {
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
    var FloatPop = /** @class */ (function (_super) {
        __extends(FloatPop, _super);
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
        function FloatPop(params) {
            var _this = _super.call(this) || this;
            //--------------------------------------------------------------------------
            //
            //  Variables
            //
            //--------------------------------------------------------------------------
            _this._containerNode = null;
            _this._mainContainerNode = null;
            _this._featureMenuButtonNode = null;
            _this._featureMenuViewportNode = null;
            _this._handleRegistry = new HandleRegistry();
            _this._displayActionTextLimit = 2;
            _this._pointerOffsetInPx = 16;
            _this._spinner = null;
            _this._closeFeatureMenuHandle = null;
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
            _this.actions = null;
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
            _this.alignment = "auto";
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
            _this.autoCloseEnabled = null;
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
            _this.content = null;
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
            _this.collapsed = false;
            //----------------------------------
            //  collapseEnabled
            //----------------------------------
            /**
             * @todo document
             */
            _this.collapseEnabled = true;
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
            _this.dockEnabled = false;
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
            _this.featureCount = null;
            //----------------------------------
            //  featureMenuOpen
            //----------------------------------
            /**
             * @todo document
             */
            _this.featureMenuOpen = false;
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
            _this.features = null;
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
            _this.featureNavigationEnabled = true;
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
            _this.highlightEnabled = null;
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
            _this.location = null;
            //----------------------------------
            //  popupRenderers
            //----------------------------------
            /**
             * @todo document
             */
            _this.popupRenderers = [];
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
            _this.promises = null;
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
            _this.selectedFeature = null;
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
            _this.selectedFeatureIndex = null;
            //----------------------------------
            //  selectedPopupRenderer
            //----------------------------------
            /**
             * @todo document
             */
            _this.selectedPopupRenderer = null;
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
            _this.spinnerEnabled = true;
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
            _this.title = null;
            //----------------------------------
            //  updateLocationEnabled
            //----------------------------------
            /**
             * @todo document
             */
            _this.updateLocationEnabled = null;
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
            _this.view = null;
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
            _this.viewModel = new PopupViewModel();
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
            _this.visible = null;
            return _this;
        }
        FloatPop.prototype.postInitialize = function () {
            var _this = this;
            var closeFeatureMenuHandle = watchUtils.pausable(this, "\n      viewModel.visible,\n      dockEnabled,\n      viewModel.selectedFeature\n    ", function () { return _this._closeFeatureMenu(); });
            this._closeFeatureMenuHandle = closeFeatureMenuHandle;
            this.own([
                watchUtils.watch(this, "viewModel.screenLocation", function () { return _this._positionContainer(); }),
                watchUtils.watch(this, [
                    "viewModel.visible",
                    "dockEnabled"
                ], function () { return _this._toggleScreenLocationEnabled(); }),
                watchUtils.watch(this, "viewModel.screenLocation", function (newValue, oldValue) {
                    if (!!newValue !== !!oldValue) {
                        _this.reposition();
                    }
                }),
                watchUtils.watch(this, "viewModel.features", function (features) { return _this._createPopupRenderers(features); }),
                watchUtils.watch(this, [
                    "viewModel.view.padding",
                    "viewModel.view.size",
                    "viewModel.visible",
                    "viewModel.waitingForResult",
                    "viewModel.location",
                    "alignment"
                ], function () { return _this.reposition(); }),
                closeFeatureMenuHandle,
                watchUtils.watch(this, "spinnerEnabled", function (value) { return _this._spinnerEnabledChange(value); }),
                watchUtils.watch(this, [
                    "title",
                    "content"
                ], function () { return _this._hasFeatureUpdated(); }),
                watchUtils.watch(this, "viewModel.view.size", function (newSize, oldSize) { return _this._updateDockEnabledForViewSize(newSize, oldSize); }),
                watchUtils.watch(this, "viewModel.view", function (newView, oldView) { return _this._viewChange(newView, oldView); }),
                watchUtils.watch(this, "viewModel.view.ready", function (isReady, wasReady) { return _this._viewReadyChange(isReady, wasReady); }),
                watchUtils.watch(this, [
                    "viewModel.waitingForResult",
                    "viewModel.location"
                ], function () { return _this._displaySpinner(); }),
                watchUtils.watch(this, [
                    "popupRenderers",
                    "viewModel.selectedFeatureIndex"
                ], function () { return _this._updatePopupRenderer(); }),
                watchUtils.watch(this, "selectedPopupRenderer.viewModel.title", function (title) { return _this._setTitleFromPopupRenderer(title); }),
                watchUtils.watch(this, [
                    "selectedPopupRenderer.viewModel.content",
                    "selectedPopupRenderer.viewModel.waitingForContent"
                ], function () { return _this._setContentFromPopupRenderer(); }),
                watchUtils.on(this, "viewModel", "trigger-action", function (event) { return _this._zoomToAction(event); })
            ]);
        };
        FloatPop.prototype.destroy = function () {
            this._destroyPopupRenderers();
            this._destroySpinner();
            this._handleRegistry.destroy();
            this._handleRegistry = null;
        };
        Object.defineProperty(FloatPop.prototype, "currentAlignment", {
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
            get: function () {
                return this._getCurrentAlignment();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FloatPop.prototype, "currentDockPosition", {
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
            get: function () {
                return this._getCurrentDockPosition();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FloatPop.prototype, "dockOptions", {
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
            get: function () {
                return this._get("dockOptions") || DOCK_OPTIONS;
            },
            set: function (dockOptions) {
                var dockOptionDefaults = __assign({}, DOCK_OPTIONS);
                var breakpoints = this.get("viewModel.view.breakpoints");
                var viewDockSize = {};
                if (breakpoints) {
                    viewDockSize.width = breakpoints.xsmall;
                    viewDockSize.height = breakpoints.xsmall;
                }
                var dockOptionsMixin = __assign({}, dockOptionDefaults, dockOptions);
                var breakpointDefaults = __assign({}, dockOptionDefaults.breakpoint, viewDockSize);
                var breakpoint = dockOptionsMixin.breakpoint;
                if (breakpoint === true) {
                    dockOptionsMixin.breakpoint = breakpointDefaults;
                }
                else if (typeof breakpoint === "object") {
                    dockOptionsMixin.breakpoint = __assign({}, breakpointDefaults, breakpoint);
                }
                this._set("dockOptions", dockOptionsMixin);
                this._setCurrentDockPosition();
                this.reposition();
            },
            enumerable: true,
            configurable: true
        });
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
        FloatPop.prototype.clear = function () { };
        /**
         * Closes the popup by setting its [visible](#visible) property to `false`. Users can
         * alternatively close the popup
         * by directly setting the [visible](#visible) property to `false`.
         *
         * @see [Popup.visible](#visible)
         */
        FloatPop.prototype.close = function () {
            this.visible = false;
        };
        /**
         * Selects the feature at the next index in relation to the selected feature.
         *
         * @method
         *
         * @see [selectedFeatureIndex](#selectedFeatureIndex)
         *
         * @return {module:esri/widgets/Popup/PopupViewModel} Returns an instance of the popup's view model.
         */
        FloatPop.prototype.next = function () { return null; };
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
        FloatPop.prototype.open = function (options) {
            var defaultOptions = {
                featureMenuOpen: false,
                updateLocationEnabled: false,
                promises: []
            };
            var setOptions = __assign({ visible: true }, defaultOptions, options);
            if (setOptions.featureMenuOpen) {
                this._closeFeatureMenuHandle.pause();
            }
            this.set(setOptions);
        };
        /**
         * Selects the feature at the previous index in relation to the selected feature.
         *
         * @method
         *
         * @see [selectedFeatureIndex](#selectedFeatureIndex)
         *
         * @return {module:esri/widgets/Popup/PopupViewModel} Returns an instance of the popup's view model.
         */
        FloatPop.prototype.previous = function () { return null; };
        /**
         * Positions the popup on the view.
         * Moves the popup into the view's extent if the popup is partially or fully outside
         * the view's extent.
         *
         * If the popup is partially out of view, the view will move to fully show the popup.
         * If the popup is fully out of view, the view will move to the popup's location.
         */
        FloatPop.prototype.reposition = function () {
            this.renderNow();
            this._positionContainer();
            this._setCurrentAlignment();
        };
        /**
         * Triggers the [trigger-action](#event:trigger-action) event and executes the [action](#actions)
         * at the specified index in the [actions](#actions) array.
         *
         * @param {number} actionIndex - The index of the [action](#actions) to execute.
         *
         * @method
         */
        FloatPop.prototype.triggerAction = function (actionIndex) { return null; };
        FloatPop.prototype.render = function () {
            var _a = this, collapsed = _a.collapsed, collapseEnabled = _a.collapseEnabled, dockEnabled = _a.dockEnabled, dockOptions = _a.dockOptions, actions = _a.actions, featureMenuOpen = _a.featureMenuOpen, featureNavigationEnabled = _a.featureNavigationEnabled, popupRenderers = _a.popupRenderers, visible = _a.visible;
            var _b = this.viewModel, featureCount = _b.featureCount, promiseCount = _b.promiseCount, pendingPromisesCount = _b.pendingPromisesCount, selectedFeatureIndex = _b.selectedFeatureIndex, title = _b.title, waitingForResult = _b.waitingForResult;
            var featureNavigationVisible = featureCount > 1 && featureNavigationEnabled;
            var isFeatureMenuOpen = featureCount > 1 && featureMenuOpen;
            var contentVisible = collapseEnabled && !isFeatureMenuOpen && collapsed;
            var actionsCount = actions && actions.length;
            var pageText = featureNavigationVisible && this._getPageText(featureCount, selectedFeatureIndex);
            var content = this._renderContent();
            var isRtl = widgetUtils.isRtl();
            var hasContent = this.get("selectedPopupRenderer") ?
                this.get("selectedPopupRenderer.viewModel.waitingForContent") ||
                    this.get("selectedPopupRenderer.viewModel.content") :
                content;
            var dockTitle = dockEnabled ?
                i18n.undock :
                i18n.dock;
            var _c = this, currentAlignment = _c.currentAlignment, currentDockPosition = _c.currentDockPosition;
            var loadingContainerNode = !!pendingPromisesCount ? (widget_1.tsx("div", { key: buildKey("loading-container"), role: "presentation", class: CSS.loadingContainer, "aria-label": i18n.loading, title: i18n.loading },
                widget_1.tsx("span", { "aria-hidden": "true", class: widget_1.join(CSS.icon, CSS.iconLoading) }))) : null;
            var featureMenuIconClasses = (_d = {},
                _d[CSS.iconFeatureMenu] = !isFeatureMenuOpen,
                _d[CSS.iconClose] = isFeatureMenuOpen,
                _d);
            var featureMenuIconNode = (widget_1.tsx("span", { "aria-hidden": "true", class: CSS.icon, classes: featureMenuIconClasses }));
            var previousIconClasses = (_e = {},
                _e[CSS.iconRightTriangleArrow] = isRtl,
                _e[CSS.paginationPreviousIconRTL] = isRtl,
                _e[CSS.iconLeftTriangleArrow] = !isRtl,
                _e[CSS.paginationPreviousIconLTR] = !isRtl,
                _e);
            var previousIconNode = (widget_1.tsx("span", { "aria-hidden": "true", class: CSS.icon, classes: previousIconClasses }));
            var paginationPreviousButtonNode = (widget_1.tsx("div", { role: "button", tabIndex: 0, bind: this, onclick: this._previous, onkeydown: this._previous, class: widget_1.join(CSS.button, CSS.paginationPrevious), "aria-label": i18n.previous, title: i18n.previous }, previousIconNode));
            var nextIconClasses = (_f = {},
                _f[CSS.iconLeftTriangleArrow] = isRtl,
                _f[CSS.paginationNextIconRTL] = isRtl,
                _f[CSS.iconRightTriangleArrow] = !isRtl,
                _f[CSS.paginationNextIconLTR] = !isRtl,
                _f);
            var nextIconNode = (widget_1.tsx("span", { "aria-hidden": "true", class: CSS.icon, classes: nextIconClasses }));
            var paginationNextButtonNode = (widget_1.tsx("div", { role: "button", tabIndex: 0, bind: this, onclick: this._next, onkeydown: this._next, class: widget_1.join(CSS.button, CSS.paginationNext), "aria-label": i18n.next, title: i18n.next }, nextIconNode));
            var featureMenuToggleNode = (widget_1.tsx("div", { role: "button", tabIndex: 0, bind: this, onclick: this._toggleFeatureMenu, onkeydown: this._toggleFeatureMenu, afterCreate: this._storeFeatureMenuButtonNode, afterUpdate: this._storeFeatureMenuButtonNode, class: widget_1.join(CSS.button, CSS.featureMenuButton), "aria-label": i18n.menu, title: i18n.menu }, featureMenuIconNode));
            var paginationTextNode = (widget_1.tsx("div", { class: CSS.paginationText }, pageText));
            var navigationButtonsNode = featureNavigationVisible ? (widget_1.tsx("div", { class: CSS.navigationButtons },
                paginationPreviousButtonNode,
                paginationTextNode,
                paginationNextButtonNode,
                featureMenuToggleNode)) : null;
            var wouldDockTo = this._wouldDockTo();
            var wouldDockToRight = wouldDockTo === "top-right" || wouldDockTo === "bottom-right";
            var wouldDockToLeft = wouldDockTo === "top-left" || wouldDockTo === "bottom-left";
            var wouldDockToTop = wouldDockTo === "top-center";
            var wouldDockToBottom = wouldDockTo === "bottom-center";
            var dockRightIconNode = wouldDockToRight ? (widget_1.tsx("span", { "aria-hidden": "true", key: buildKey("dock-right-icon"), class: widget_1.join(CSS.icon, CSS.iconDock, CSS.iconDockToRight) })) : null;
            var dockLeftIconNode = wouldDockToLeft ? (widget_1.tsx("span", { "aria-hidden": "true", key: buildKey("dock-left-icon"), class: widget_1.join(CSS.icon, CSS.iconDock, CSS.iconDockToLeft) })) : null;
            var dockTopIconNode = wouldDockToTop ? (widget_1.tsx("span", { "aria-hidden": "true", key: buildKey("dock-top-icon"), class: widget_1.join(CSS.icon, CSS.iconDock, CSS.iconDockToTop) })) : null;
            var dockBottomIconNode = wouldDockToBottom ? (widget_1.tsx("span", { "aria-hidden": "true", key: buildKey("dock-bottom-icon"), class: widget_1.join(CSS.icon, CSS.iconDock, CSS.iconDockToBottom) })) : null;
            var undockIconNode = dockEnabled ? (widget_1.tsx("span", { "aria-hidden": "true", key: buildKey("undocked-icon"), class: widget_1.join(CSS.icon, CSS.iconUndock) })) : null;
            var dockButtonNode = dockOptions.buttonEnabled ? (widget_1.tsx("div", { role: "button", "aria-label": dockTitle, title: dockTitle, tabIndex: 0, bind: this, onclick: this._toggleDockEnabled, onkeydown: this._toggleDockEnabled, class: widget_1.join(CSS.button, CSS.buttonDock) },
                dockRightIconNode,
                dockTopIconNode,
                dockLeftIconNode,
                dockBottomIconNode,
                undockIconNode)) : null;
            var canBeCollapsed = collapseEnabled && (hasContent || actionsCount || featureNavigationVisible);
            var titleClasses = (_g = {},
                _g[CSS.headerTitleButton] = canBeCollapsed,
                _g);
            var titleRole = canBeCollapsed ? "button" : "heading";
            var titleLabel = canBeCollapsed ?
                contentVisible ?
                    i18n.expand :
                    i18n.collapse :
                "";
            var titleNode = title ? (widget_1.tsx("h1", { class: CSS.headerTitle, role: titleRole, "aria-label": titleLabel, title: titleLabel, classes: titleClasses, bind: this, tabIndex: canBeCollapsed ? 0 : -1, onclick: this._toggleCollapsed, onkeydown: this._toggleCollapsed, innerHTML: title })) : null;
            var closeIconNode = (widget_1.tsx("span", { "aria-hidden": "true", class: widget_1.join(CSS.icon, CSS.iconClose) }));
            var closeButtonNode = (widget_1.tsx("div", { role: "button", tabIndex: 0, bind: this, onclick: this._close, onkeydown: this._close, class: CSS.button, "aria-label": i18n.close, title: i18n.close }, closeIconNode));
            var headerNode = (widget_1.tsx("header", { class: CSS.header },
                titleNode,
                widget_1.tsx("div", { class: CSS.headerButtons },
                    dockButtonNode,
                    closeButtonNode)));
            var contentNode = hasContent && !contentVisible ? (widget_1.tsx("article", { key: buildKey("content-container"), class: CSS.content }, content)) : null;
            var showButtonsTop = !contentVisible && ((currentAlignment === "bottom-left") ||
                (currentAlignment === "bottom-center") ||
                (currentAlignment === "bottom-right") ||
                (currentDockPosition === "top-left") ||
                (currentDockPosition === "top-center") ||
                (currentDockPosition === "top-right"));
            var showButtonsBottom = !contentVisible && ((currentAlignment === "top-left") ||
                (currentAlignment === "top-center") ||
                (currentAlignment === "top-right") ||
                (currentDockPosition === "bottom-left") ||
                (currentDockPosition === "bottom-center") ||
                (currentDockPosition === "bottom-right"));
            // const actionsNode = !isFeatureMenuOpen ? (
            //   <div key={buildKey("actions")} class={CSS.actions}>{this._renderActions()}</div>
            // ) : null;
            // 不再渲染底部的actions菜单
            var actionsNode = null;
            var navigationNode = (widget_1.tsx("section", { key: buildKey("navigation"), class: CSS.navigation },
                loadingContainerNode,
                navigationButtonsNode));
            var featureButtonsNode = (featureNavigationVisible || actionsCount) ? (widget_1.tsx("div", { key: buildKey("feature-buttons"), class: CSS.featureButtons },
                actionsNode,
                navigationNode)) : null;
            var featureMenuNode = this._renderFeatureMenuNode(popupRenderers, selectedFeatureIndex, isFeatureMenuOpen);
            if (featureMenuNode) {
                this._closeFeatureMenuHandle.resume();
            }
            var infoText = esriLang.substitute({
                total: popupRenderers.length
            }, i18n.selectedFeatures);
            var menuNode = (widget_1.tsx("section", { key: buildKey("menu"), class: CSS.featureMenu },
                widget_1.tsx("h2", { class: CSS.featureMenuHeader }, infoText),
                widget_1.tsx("nav", { class: CSS.featureMenuViewport, afterCreate: this._storeFeatureMenuViewportNode, afterUpdate: this._storeFeatureMenuViewportNode }, featureMenuNode)));
            if (this._featureMenuViewportNode) {
                this._featureMenuViewportNode.scrollTop = 0;
            }
            var pointerNode = !dockEnabled ? (widget_1.tsx("div", { key: buildKey("pointer"), class: CSS.pointer, role: "presentation" },
                widget_1.tsx("div", { class: widget_1.join(CSS.pointerDirection, CSS.shadow) }))) : null;
            var pinNode = dockEnabled ? (widget_1.tsx("div", { key: buildKey("ecpin"), class: CSS.ecpin, role: "presentation", bind: this, onclick: this._triggerEcPin },
                widget_1.tsx("span", { "aria-hidden": "true", class: widget_1.join(CSS.icon, CSS.iconEcPin) }))) : null;
            var containerClasses = (_h = {},
                _h[CSS.alignTopCenter] = currentAlignment === "top-center",
                _h[CSS.alignBottomCenter] = currentAlignment === "bottom-center",
                _h[CSS.alignTopLeft] = currentAlignment === "top-left",
                _h[CSS.alignBottomLeft] = currentAlignment === "bottom-left",
                _h[CSS.alignTopRight] = currentAlignment === "top-right",
                _h[CSS.alignBottomRight] = currentAlignment === "bottom-right",
                _h[CSS.isDocked] = dockEnabled,
                _h[CSS.isDockedFloatPop] = dockEnabled,
                _h[CSS.shadow] = !dockEnabled,
                _h[CSS.hasFeatureUpdated] = visible,
                _h[CSS.isDockedTopLeft] = currentDockPosition === "top-left",
                _h[CSS.isDockedTopCenter] = currentDockPosition === "top-center",
                _h[CSS.isDockedTopRight] = currentDockPosition === "top-right",
                _h[CSS.isDockedBottomLeft] = currentDockPosition === "bottom-left",
                _h[CSS.isDockedBottomCenter] = currentDockPosition === "bottom-center",
                _h[CSS.isDockedBottomRight] = currentDockPosition === "bottom-right",
                _h[CSS.isFeatureMenuOpen] = isFeatureMenuOpen,
                _h);
            var layerTitle = this.get("selectedFeature.layer.title");
            var layerId = this.get("selectedFeature.layer.id");
            var mainContainerClasses = (_j = {},
                _j[CSS.shadow] = dockEnabled,
                _j);
            var hasPromises = !!promiseCount;
            var hasFeatures = !!featureCount;
            var canBeDisplayed = hasPromises ? hasFeatures : true;
            var isVisible = visible && !waitingForResult && canBeDisplayed;
            var menuTopNode = showButtonsTop ? menuNode : null;
            var menuBottomNode = showButtonsBottom ? menuNode : null;
            var buttonsTopNode = showButtonsTop ? featureButtonsNode : null;
            var buttonsBottomNode = showButtonsBottom ? featureButtonsNode : null;
            var containerNode = isVisible ? (widget_1.tsx("div", { key: buildKey("container"), class: CSS.container, classes: containerClasses, "data-layer-title": layerTitle, "data-layer-id": layerId, bind: this, afterCreate: this._positionContainer, afterUpdate: this._positionContainer },
                widget_1.tsx("div", { class: CSS.ecpinWrapper },
                    pinNode,
                    widget_1.tsx("div", { class: widget_1.join(CSS.main, CSS.widget), classes: mainContainerClasses, bind: this, afterCreate: this._storeMainContainerNode, afterUpdate: this._storeMainContainerNode },
                        buttonsTopNode,
                        menuTopNode,
                        headerNode,
                        contentNode,
                        buttonsBottomNode,
                        menuBottomNode)),
                pointerNode)) : null;
            return (widget_1.tsx("div", { key: buildKey("base"), class: CSS.base, role: "presentation" }, containerNode));
            var _d, _e, _f, _g, _h, _j;
        };
        //--------------------------------------------------------------------------
        //
        //  Private Methods
        //
        //--------------------------------------------------------------------------
        FloatPop.prototype._setTitleFromPopupRenderer = function (title) {
            this.viewModel.title = title || "";
        };
        FloatPop.prototype._setContentFromPopupRenderer = function () {
            this.viewModel.content = this.selectedPopupRenderer || null;
            this.scheduleRender();
        };
        FloatPop.prototype._zoomToAction = function (event) {
            if (!event.action || event.action.id !== ZOOM_TO_ACTION_ID) {
                return;
            }
            this.viewModel.zoomToLocation();
        };
        FloatPop.prototype._spinnerEnabledChange = function (spinnerEnabled) {
            this._destroySpinner();
            if (!spinnerEnabled) {
                return;
            }
            var view = this.get("viewModel.view");
            this._createSpinner(view);
        };
        FloatPop.prototype._displaySpinner = function () {
            var spinner = this._spinner;
            if (!spinner) {
                return;
            }
            var _a = this.viewModel, location = _a.location, waitingForResult = _a.waitingForResult;
            if (waitingForResult) {
                spinner.show({
                    location: location
                });
                return;
            }
            spinner.hide();
        };
        FloatPop.prototype._getIconStyles = function (subActionImage) {
            return {
                "background-image": subActionImage ? "url(" + subActionImage + ")" : ""
            };
        };
        FloatPop.prototype._renderAction = function (action, actionIndex, total, actionsKey) {
            var _this = this;
            var actionHandle = watchUtils.watch(action, [
                "id",
                "className",
                "title",
                "image",
                "visible"
            ], function () { return _this.scheduleRender(); });
            this._handleRegistry.add(actionHandle, actionsKey);
            var selectedFeatureAttributes = this.get("selectedFeature.attributes");
            if (action.id === ZOOM_TO_ACTION_ID) {
                action.title = i18n.zoom;
                action.className = CSS.iconZoom;
            }
            var actionTitle = action.title, actionClassName = action.className;
            var actionImage = !action.image && !actionClassName ? DEFAULT_ACTION_IMAGE : action.image;
            var subActionTitle = actionTitle && selectedFeatureAttributes ?
                esriLang.substitute(selectedFeatureAttributes, actionTitle) :
                actionTitle;
            var subActionClass = actionClassName && selectedFeatureAttributes ?
                esriLang.substitute(selectedFeatureAttributes, actionClassName) :
                actionClassName;
            var subActionImage = actionImage && selectedFeatureAttributes ?
                esriLang.substitute(selectedFeatureAttributes, actionImage) :
                actionImage;
            var iconClasses = (_a = {},
                _a[subActionClass] = !!subActionClass,
                _a[CSS.actionImage] = !!subActionImage,
                _a);
            var textNode = total <= this._displayActionTextLimit ? (widget_1.tsx("span", { key: buildKey("action-text-" + actionIndex + "-" + action.uid), class: CSS.actionText }, subActionTitle)) : null;
            return action.visible ? (widget_1.tsx("div", { key: buildKey("action-" + actionIndex + "-" + action.uid), role: "button", tabIndex: 0, title: subActionTitle, "aria-label": subActionTitle, class: widget_1.join(CSS.button, CSS.action), bind: this, "data-action-index": actionIndex, onclick: this._triggerAction, onkeydown: this._triggerAction },
                widget_1.tsx("span", { key: buildKey("action-icon-" + actionIndex + "-" + action.uid), "aria-hidden": "true", class: CSS.icon, classes: iconClasses, styles: this._getIconStyles(subActionImage) }),
                textNode)) : null;
            var _a;
        };
        FloatPop.prototype._renderActions = function () {
            var _this = this;
            var actionsKey = "actions";
            this._handleRegistry.remove(actionsKey);
            var actions = this.actions;
            if (!actions) {
                return;
            }
            var totalActions = actions.length;
            var actionsArray = actions.toArray();
            var actionNodes = actionsArray.map(function (action, index) {
                return _this._renderAction(action, index, totalActions, actionsKey);
            });
            return (widget_1.tsx("div", { key: buildKey("actions"), class: CSS.actions }, actionNodes));
        };
        FloatPop.prototype._updatePopupRenderer = function () {
            var popupRenderers = this.popupRenderers;
            var selectedFeatureIndex = this.viewModel.selectedFeatureIndex;
            var selectedPopupRenderer = popupRenderers[selectedFeatureIndex] || null;
            if (selectedPopupRenderer && !selectedPopupRenderer.contentEnabled) {
                selectedPopupRenderer.contentEnabled = true;
            }
            this._set("selectedPopupRenderer", selectedPopupRenderer);
        };
        FloatPop.prototype._destroyPopupRenderers = function () {
            this.popupRenderers.forEach(function (popupRenderer) { return popupRenderer.destroy(); });
            this._set("popupRenderers", []);
        };
        FloatPop.prototype._createPopupRenderers = function (features) {
            var _this = this;
            this._destroyPopupRenderers();
            var popupRenderers = [];
            features && features.forEach(function (feature) {
                var popupRenderer = new PopupRenderer({
                    contentEnabled: false,
                    graphic: feature,
                    view: _this.get("viewModel.view")
                });
                popupRenderers.push(popupRenderer);
            });
            this._set("popupRenderers", popupRenderers);
        };
        FloatPop.prototype._isScreenLocationWithinView = function (screenLocation, view) {
            return (screenLocation.x > -1 &&
                screenLocation.y > -1 &&
                screenLocation.x <= view.width &&
                screenLocation.y <= view.height);
        };
        FloatPop.prototype._isOutsideView = function (options) {
            var popupHeight = options.popupHeight, popupWidth = options.popupWidth, screenLocation = options.screenLocation, side = options.side, view = options.view;
            if (isNaN(popupWidth) || isNaN(popupHeight) || !view || !screenLocation) {
                return false;
            }
            var padding = view.padding;
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
        };
        FloatPop.prototype._determineCurrentAlignment = function () {
            var _a = this, pointerOffset = _a._pointerOffsetInPx, containerNode = _a._containerNode, mainContainerNode = _a._mainContainerNode, viewModel = _a.viewModel;
            var screenLocation = viewModel.screenLocation, view = viewModel.view;
            if (!screenLocation || !view || !containerNode) {
                return "top-center";
            }
            if (!this._isScreenLocationWithinView(screenLocation, view)) {
                return this._get("currentAlignment") || "top-center";
            }
            function cssPropertyToInteger(value) {
                return parseInt(value.replace(/[^-\d\.]/g, ""), 10);
            }
            var mainComputedStyle = mainContainerNode ?
                window.getComputedStyle(mainContainerNode, null) :
                null;
            var contentMaxHeight = mainComputedStyle ?
                cssPropertyToInteger(mainComputedStyle.getPropertyValue("max-height")) :
                0;
            var contentHeight = mainComputedStyle ?
                cssPropertyToInteger(mainComputedStyle.getPropertyValue("height")) :
                0;
            var contentBox = domGeometry.getContentBox(containerNode);
            var popupWidth = contentBox.w + pointerOffset;
            var popupHeight = Math.max(contentBox.h, contentMaxHeight, contentHeight) + pointerOffset;
            var isOutsideViewRight = this._isOutsideView({
                popupHeight: popupHeight,
                popupWidth: popupWidth,
                screenLocation: screenLocation,
                side: "right",
                view: view
            });
            var isOutsideViewLeft = this._isOutsideView({
                popupHeight: popupHeight,
                popupWidth: popupWidth,
                screenLocation: screenLocation,
                side: "left",
                view: view
            });
            var isOutsideViewTop = this._isOutsideView({
                popupHeight: popupHeight,
                popupWidth: popupWidth,
                screenLocation: screenLocation,
                side: "top",
                view: view
            });
            var isOutsideViewBottom = this._isOutsideView({
                popupHeight: popupHeight,
                popupWidth: popupWidth,
                screenLocation: screenLocation,
                side: "bottom",
                view: view
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
        };
        FloatPop.prototype._getCurrentAlignment = function () {
            var _a = this, alignment = _a.alignment, dockEnabled = _a.dockEnabled;
            if (dockEnabled) {
                return null;
            }
            var currentAlignment = alignment === "auto" ?
                this._determineCurrentAlignment() :
                typeof alignment === "function" ?
                    alignment.call(this) :
                    alignment;
            return currentAlignment;
        };
        FloatPop.prototype._setCurrentAlignment = function () {
            this._set("currentAlignment", this._getCurrentAlignment());
        };
        FloatPop.prototype._setCurrentDockPosition = function () {
            this._set("currentDockPosition", this._getCurrentDockPosition());
        };
        FloatPop.prototype._getDockPosition = function () {
            var dockPosition = this.get("dockOptions.position");
            var position = dockPosition === "auto" ?
                this._determineCurrentDockPosition() :
                typeof dockPosition === "function" ?
                    dockPosition.call(this) :
                    dockPosition;
            return position;
        };
        FloatPop.prototype._getCurrentDockPosition = function () {
            return this.dockEnabled ? this._getDockPosition() : null;
        };
        FloatPop.prototype._wouldDockTo = function () {
            return !this.dockEnabled ? this._getDockPosition() : null;
        };
        FloatPop.prototype._renderFeatureMenuItemNode = function (popupRenderer, popupRendererIndex, selectedFeatureIndex, featureMenuOpen) {
            var isSelectedFeature = popupRendererIndex === selectedFeatureIndex;
            var itemClasses = (_a = {},
                _a[CSS.featureMenuSelected] = isSelectedFeature,
                _a);
            var itemLabel = popupRenderer.title || i18n.untitled;
            var checkMarkNode = isSelectedFeature ?
                (widget_1.tsx("span", { key: buildKey("feature-menu-selected-feature-" + selectedFeatureIndex), title: i18n.selectedFeature, "aria-label": i18n.selectedFeature, class: CSS.iconCheckMark })) :
                null;
            return (widget_1.tsx("li", { role: "menuitem", tabIndex: isSelectedFeature || !featureMenuOpen ? -1 : 0, key: buildKey("feature-menu-feature-" + selectedFeatureIndex), classes: itemClasses, class: CSS.featureMenuItem, title: itemLabel, "aria-label": itemLabel, bind: this, "data-feature-index": popupRendererIndex, onclick: this._selectFeature, onkeydown: this._selectFeature },
                widget_1.tsx("span", { class: CSS.featureMenuTitle },
                    itemLabel,
                    checkMarkNode)));
            var _a;
        };
        FloatPop.prototype._renderFeatureMenuNode = function (popupRenderers, selectedFeatureIndex, featureMenuOpen) {
            var _this = this;
            return popupRenderers.length > 1 ? (widget_1.tsx("ol", { class: CSS.featureMenuList, role: "menu" }, popupRenderers.map(function (popupRenderer, popupRendererIndex) {
                return _this._renderFeatureMenuItemNode(popupRenderer, popupRendererIndex, selectedFeatureIndex, featureMenuOpen);
            }))) : null;
        };
        FloatPop.prototype._determineCurrentDockPosition = function () {
            var view = this.get("viewModel.view");
            var defaultDockPosition = widgetUtils.isRtl() ? "top-left" : "top-right";
            if (!view) {
                return defaultDockPosition;
            }
            var viewPadding = view.padding || { left: 0, right: 0, top: 0, bottom: 0 };
            var viewWidth = view.width - viewPadding.left - viewPadding.right;
            var breakpoints = view.get("breakpoints");
            if (breakpoints && viewWidth <= breakpoints.xsmall) {
                return "bottom-center";
            }
            return defaultDockPosition;
        };
        FloatPop.prototype._renderContent = function () {
            var content = this.get("viewModel.content");
            var contentKey = "content";
            if (typeof content === "string") {
                return widget_1.tsx("div", { key: buildKey(contentKey + "-string"), innerHTML: content });
            }
            if (isWidget(content)) {
                return widget_1.tsx("div", { key: buildKey(contentKey + "-widget") }, content.render());
            }
            if (content instanceof HTMLElement) {
                return widget_1.tsx("div", { key: buildKey(contentKey + "-html-element"), bind: content, afterUpdate: this._attachToNode, afterCreate: this._attachToNode });
            }
            if (isWidgetBase(content)) {
                return widget_1.tsx("div", { key: buildKey(contentKey + "-dijit"), bind: content.domNode, afterUpdate: this._attachToNode, afterCreate: this._attachToNode });
            }
        };
        FloatPop.prototype._attachToNode = function (node) {
            var content = this;
            node.appendChild(content);
        };
        FloatPop.prototype._positionContainer = function (containerNode) {
            if (containerNode === void 0) { containerNode = this._containerNode; }
            if (containerNode) {
                this._containerNode = containerNode;
            }
            if (!containerNode) {
                return;
            }
            var screenLocation = this.viewModel.screenLocation;
            var domGeometryBox = domGeometry.getContentBox(containerNode);
            var positionStyle = this._calculatePositionStyle(screenLocation, domGeometryBox);
            if (!positionStyle) {
                return;
            }
            containerNode.style.top = positionStyle.top;
            containerNode.style.left = positionStyle.left;
            containerNode.style.bottom = positionStyle.bottom;
            containerNode.style.right = positionStyle.right;
        };
        FloatPop.prototype._calculateFullWidth = function (width) {
            var _a = this, currentAlignment = _a.currentAlignment, pointerOffset = _a._pointerOffsetInPx;
            if (currentAlignment === "top-left" ||
                currentAlignment === "bottom-left" ||
                currentAlignment === "top-right" ||
                currentAlignment === "bottom-right") {
                return width + pointerOffset;
            }
            return width;
        };
        FloatPop.prototype._calculateAlignmentPosition = function (x, y, view, width) {
            var _a = this, currentAlignment = _a.currentAlignment, pointerOffset = _a._pointerOffsetInPx;
            var halfWidth = width / 2;
            var viewHeightOffset = view.height - y;
            var viewWidthOffset = view.width - x;
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
        };
        FloatPop.prototype._calculatePositionStyle = function (screenLocation, domGeometryBox) {
            var _a = this, dockEnabled = _a.dockEnabled, view = _a.view;
            if (!view) {
                return;
            }
            var padding = view.padding;
            if (dockEnabled) {
                return {
                    left: padding.left ?
                        padding.left + "px" :
                        "",
                    top: padding.top ?
                        padding.top + "px" :
                        "",
                    right: padding.right ?
                        padding.right + "px" :
                        "",
                    bottom: padding.bottom ?
                        padding.bottom + "px" :
                        ""
                };
            }
            if (!screenLocation || !domGeometryBox) {
                return;
            }
            var width = this._calculateFullWidth(domGeometryBox.w);
            var position = this._calculateAlignmentPosition(screenLocation.x, screenLocation.y, view, width);
            if (!position) {
                return;
            }
            return {
                top: position.top !== undefined ?
                    position.top + "px" :
                    "auto",
                left: position.left !== undefined ?
                    position.left + "px" :
                    "auto",
                bottom: position.bottom !== undefined ?
                    position.bottom + "px" :
                    "auto",
                right: position.right !== undefined ?
                    position.right + "px" :
                    "auto"
            };
        };
        FloatPop.prototype._viewChange = function (newView, oldView) {
            if (newView && oldView) {
                this.close();
                this.clear();
            }
        };
        FloatPop.prototype._viewReadyChange = function (isReady, wasReady) {
            if (isReady) {
                var view = this.get("viewModel.view");
                this._wireUpView(view);
                return;
            }
            if (wasReady) {
                this.close();
                this.clear();
            }
        };
        FloatPop.prototype._wireUpView = function (view) {
            this._destroySpinner();
            if (!view) {
                return;
            }
            var spinnerEnabled = this.spinnerEnabled;
            if (spinnerEnabled) {
                this._createSpinner(view);
            }
            this._setDockEnabledForViewSize(this.dockOptions);
        };
        FloatPop.prototype._dockingThresholdCrossed = function (newSize, oldSize, dockingThreshold) {
            var currWidth = newSize[0], currHeight = newSize[1], prevWidth = oldSize[0], prevHeight = oldSize[1], dockingWidth = dockingThreshold.width, dockingHeight = dockingThreshold.height;
            return (currWidth <= dockingWidth && prevWidth > dockingWidth) ||
                (currWidth > dockingWidth && prevWidth <= dockingWidth) ||
                (currHeight <= dockingHeight && prevHeight > dockingHeight) ||
                (currHeight > dockingHeight && prevHeight <= dockingHeight);
        };
        FloatPop.prototype._updateDockEnabledForViewSize = function (newSize, oldSize) {
            if (!newSize || !oldSize) {
                return;
            }
            var viewPadding = this.get("viewModel.view.padding") || { left: 0, right: 0, top: 0, bottom: 0 };
            var widthPadding = viewPadding.left + viewPadding.right;
            var heightPadding = viewPadding.top + viewPadding.bottom;
            var newUISize = [], oldUISize = [];
            newUISize[0] = newSize[0] - widthPadding;
            newUISize[1] = newSize[1] - heightPadding;
            oldUISize[0] = oldSize[0] - widthPadding;
            oldUISize[1] = oldSize[1] - heightPadding;
            /*
              When the size of the view changes, check to see if we need to switch the dockEnabled state
            */
            var dockOptions = this.dockOptions;
            var breakpoint = dockOptions.breakpoint;
            if (this._dockingThresholdCrossed(newUISize, oldUISize, breakpoint)) {
                this._setDockEnabledForViewSize(dockOptions);
            }
            this._setCurrentDockPosition();
        };
        FloatPop.prototype._hasFeatureUpdated = function () {
            var _containerNode = this._containerNode;
            var pendingPromisesCount = this.viewModel.pendingPromisesCount;
            var waitingForContent = this.get("selectedPopupRenderer.viewModel.waitingForContent");
            if (!_containerNode || !!pendingPromisesCount || waitingForContent) {
                return;
            }
            // todo: @juan6600 need a better way to do this.
            _containerNode.classList.remove(CSS.hasFeatureUpdated);
            _containerNode.offsetHeight;
            _containerNode.classList.add(CSS.hasFeatureUpdated);
        };
        FloatPop.prototype._storeMainContainerNode = function (element) {
            this._mainContainerNode = element;
        };
        FloatPop.prototype._storeFeatureMenuButtonNode = function (element) {
            this._featureMenuButtonNode = element;
        };
        FloatPop.prototype._storeFeatureMenuViewportNode = function (element) {
            this._featureMenuViewportNode = element;
        };
        FloatPop.prototype._toggleScreenLocationEnabled = function () {
            var _a = this, dockEnabled = _a.dockEnabled, visible = _a.visible, viewModel = _a.viewModel;
            if (!viewModel) {
                return;
            }
            var screenLocationEnabled = visible && !dockEnabled;
            viewModel.screenLocationEnabled = screenLocationEnabled;
        };
        FloatPop.prototype._shouldDockAtCurrentViewSize = function (dockOptions) {
            var breakpoint = dockOptions.breakpoint;
            var _a = this.get("viewModel.view.ui"), uiWidth = _a.width, uiHeight = _a.height;
            if (isNaN(uiWidth) || isNaN(uiHeight)) {
                return false;
            }
            var crossedWidthBreakpoint = breakpoint.hasOwnProperty("width") && uiWidth <= breakpoint.width;
            var crossedHeightBreakpoint = breakpoint.hasOwnProperty("height") && uiHeight <= breakpoint.height;
            return crossedWidthBreakpoint || crossedHeightBreakpoint;
        };
        FloatPop.prototype._setDockEnabledForViewSize = function (dockOptions) {
            if (dockOptions.breakpoint) {
                this.dockEnabled = this._shouldDockAtCurrentViewSize(dockOptions);
            }
        };
        FloatPop.prototype._getPageText = function (featureCount, selectedFeatureIndex) {
            return esriLang.substitute({
                index: selectedFeatureIndex + 1,
                total: featureCount
            }, i18n.pageText);
        };
        FloatPop.prototype._destroySpinner = function () {
            if (this._spinner) {
                this._spinner.destroy();
                this._spinner = null;
            }
        };
        FloatPop.prototype._createSpinner = function (view) {
            if (!view) {
                return;
            }
            this._spinner = new Spinner({
                container: document.createElement("div"),
                view: view
            });
            view.root.appendChild(this._spinner.container);
        };
        FloatPop.prototype._closeFeatureMenu = function () {
            this.featureMenuOpen = false;
        };
        FloatPop.prototype._toggleCollapsed = function () {
            this.collapsed = !this.collapsed;
        };
        FloatPop.prototype._close = function () {
            this.close();
        };
        FloatPop.prototype._toggleDockEnabled = function () {
            this.dockEnabled = !this.dockEnabled;
        };
        FloatPop.prototype._toggleFeatureMenu = function () {
            this.featureMenuOpen = !this.featureMenuOpen;
        };
        FloatPop.prototype._triggerEcPin = function (event) {
            event.preventDefault();
            event.stopPropagation();
            this.viewModel.triggerAction(0);
        };
        FloatPop.prototype._triggerAction = function (event) {
            var node = event.currentTarget;
            var actionIndex = node["data-action-index"];
            this.viewModel.triggerAction(actionIndex);
        };
        FloatPop.prototype._selectFeature = function (event) {
            var node = event.currentTarget;
            var featureIndex = node["data-feature-index"];
            if (!isNaN(featureIndex)) {
                this.viewModel.selectedFeatureIndex = featureIndex;
            }
            if (this._featureMenuButtonNode) {
                this._featureMenuButtonNode.focus();
            }
        };
        FloatPop.prototype._next = function () {
            this.next();
        };
        FloatPop.prototype._previous = function () {
            this.previous();
        };
        __decorate([
            decorators_1.aliasOf("viewModel.actions"),
            widget_1.renderable()
        ], FloatPop.prototype, "actions", void 0);
        __decorate([
            decorators_1.property()
        ], FloatPop.prototype, "alignment", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.autoCloseEnabled")
        ], FloatPop.prototype, "autoCloseEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.content"),
            widget_1.renderable()
        ], FloatPop.prototype, "content", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], FloatPop.prototype, "collapsed", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], FloatPop.prototype, "collapseEnabled", void 0);
        __decorate([
            decorators_1.property({
                readOnly: true,
                dependsOn: [
                    "dockEnabled",
                    "alignment"
                ]
            }),
            widget_1.renderable()
        ], FloatPop.prototype, "currentAlignment", null);
        __decorate([
            decorators_1.property({
                readOnly: true,
                dependsOn: [
                    "dockEnabled",
                    "dockOptions"
                ]
            }),
            widget_1.renderable()
        ], FloatPop.prototype, "currentDockPosition", null);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], FloatPop.prototype, "dockOptions", null);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], FloatPop.prototype, "dockEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.featureCount"),
            widget_1.renderable()
        ], FloatPop.prototype, "featureCount", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], FloatPop.prototype, "featureMenuOpen", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.features"),
            widget_1.renderable()
        ], FloatPop.prototype, "features", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], FloatPop.prototype, "featureNavigationEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.highlightEnabled")
        ], FloatPop.prototype, "highlightEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.location"),
            widget_1.renderable()
        ], FloatPop.prototype, "location", void 0);
        __decorate([
            decorators_1.property({
                readOnly: true
            }),
            widget_1.renderable()
        ], FloatPop.prototype, "popupRenderers", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.promises")
        ], FloatPop.prototype, "promises", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.selectedFeature"),
            widget_1.renderable()
        ], FloatPop.prototype, "selectedFeature", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.selectedFeatureIndex"),
            widget_1.renderable()
        ], FloatPop.prototype, "selectedFeatureIndex", void 0);
        __decorate([
            decorators_1.property({
                readOnly: true
            }),
            widget_1.renderable()
        ], FloatPop.prototype, "selectedPopupRenderer", void 0);
        __decorate([
            decorators_1.property()
        ], FloatPop.prototype, "spinnerEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.title"),
            widget_1.renderable()
        ], FloatPop.prototype, "title", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.updateLocationEnabled")
        ], FloatPop.prototype, "updateLocationEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.view")
        ], FloatPop.prototype, "view", void 0);
        __decorate([
            decorators_1.property({
                type: PopupViewModel
            }),
            widget_1.renderable([
                "viewModel.screenLocation",
                "viewModel.screenLocationEnabled",
                "viewModel.state",
                "viewModel.pendingPromisesCount",
                "viewModel.promiseCount",
                "viewModel.waitingForResult"
            ]),
            widget_1.vmEvent(["triggerAction", "trigger-action"])
        ], FloatPop.prototype, "viewModel", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.visible"),
            widget_1.renderable()
        ], FloatPop.prototype, "visible", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.clear")
        ], FloatPop.prototype, "clear", null);
        __decorate([
            decorators_1.aliasOf("viewModel.next")
        ], FloatPop.prototype, "next", null);
        __decorate([
            decorators_1.aliasOf("viewModel.previous")
        ], FloatPop.prototype, "previous", null);
        __decorate([
            decorators_1.aliasOf("viewModel.triggerAction")
        ], FloatPop.prototype, "triggerAction", null);
        __decorate([
            widget_1.accessibleHandler()
        ], FloatPop.prototype, "_toggleCollapsed", null);
        __decorate([
            widget_1.accessibleHandler()
        ], FloatPop.prototype, "_close", null);
        __decorate([
            widget_1.accessibleHandler()
        ], FloatPop.prototype, "_toggleDockEnabled", null);
        __decorate([
            widget_1.accessibleHandler()
        ], FloatPop.prototype, "_toggleFeatureMenu", null);
        __decorate([
            widget_1.accessibleHandler()
        ], FloatPop.prototype, "_triggerEcPin", null);
        __decorate([
            widget_1.accessibleHandler()
        ], FloatPop.prototype, "_triggerAction", null);
        __decorate([
            widget_1.accessibleHandler()
        ], FloatPop.prototype, "_selectFeature", null);
        __decorate([
            widget_1.accessibleHandler()
        ], FloatPop.prototype, "_next", null);
        __decorate([
            widget_1.accessibleHandler()
        ], FloatPop.prototype, "_previous", null);
        FloatPop = __decorate([
            decorators_1.subclass("esri.widgets.custom.FloatPop")
        ], FloatPop);
        return FloatPop;
    }(decorators_1.declared(Widget)));
    return FloatPop;
});
//# sourceMappingURL=FloatPop.js.map