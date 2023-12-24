import {Direction, Directionality} from '@angular/cdk/bidi';
import {
  ConnectionPositionPair,
  FlexibleConnectedPositionStrategy,
  HorizontalConnectionPos,
  Overlay,
  OverlayConfig,
  OverlayRef,
  ScrollStrategy,
  VerticalConnectionPos,
} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {
  AfterContentChecked,
  AfterContentInit,
  Directive,
  ElementRef,
  EventEmitter, HostListener,
  Inject,
  InjectionToken,
  Input,
  NgZone, OnChanges,
  OnDestroy,
  Optional,
  Output,
  Self,
  ViewContainerRef,
} from '@angular/core';
import {merge, Observable, of as observableOf, Subscription} from 'rxjs';
import {delay, filter, take, takeUntil} from 'rxjs/operators';
import {MatMenu, MAT_MENU_SCROLL_STRATEGY, MatMenuPanel, MenuPositionX, MenuPositionY} from '@angular/material/menu';
import {BdcWalkPopupComponent} from './tutorial-popup.component';
import {BdcDisplayEventAction, BdcWalkService} from '../bdc-walk.service';

@Directive({
  selector: '[bdcWalkTriggerFor]'
})
export class BdcWalkTriggerDirective implements OnDestroy, OnChanges, AfterContentInit, AfterContentChecked {
  private _portal: TemplatePortal;
  private _overlayRef: OverlayRef | null = null;
  private _menuOpen = false;
  private _closingActionsSubscription = Subscription.EMPTY;
  private _hoverSubscription = Subscription.EMPTY;
  private _menuCloseSubscription = Subscription.EMPTY;
  private _scrollStrategy: () => ScrollStrategy;

  private _componentSubscription: Subscription;
  private _lastPosition: ConnectionPositionPair;
  private _initialized = false;
  private _timer: any;
  private _contentInited = false;
  private _isTriggerVisible = true;

  @Input() enabled = true;
  @Input() mustCompleted: { [taskName: string]: any | boolean } = {};
  @Input() data: any;

  /** References the popup instance that the trigger is associated with. */
  @Input('bdcWalkTriggerFor')
  get popup(): BdcWalkPopupComponent {
    return this._popup;
  }
  set popup(popup: BdcWalkPopupComponent) {
    if (popup === this._popup) {
      return;
    }

    this._popup = popup;
    this._menu = popup.menu;
    this._menuCloseSubscription.unsubscribe();

    if (popup) {
      this._menuCloseSubscription = popup.menu.closed.subscribe(() => {
        this._destroyMenu();
      });
    }
  }

  private _menu: MatMenuPanel | null;
  private _popup: BdcWalkPopupComponent;

  constructor(
    private tutorialService: BdcWalkService,
    private _overlay: Overlay,
    private _element: ElementRef<HTMLElement>,
    private _viewContainerRef: ViewContainerRef,
    @Inject(MAT_MENU_SCROLL_STRATEGY) scrollStrategy: any,
    @Optional() private _dir: Directionality,
    private _ngZone?: NgZone,
  ) {
    this._scrollStrategy = scrollStrategy;
  }

  ngAfterContentInit() {
    this._contentInited = true;
    this._componentSubscription = this.tutorialService.changes.subscribe(() => this._sync());
  }

  ngAfterContentChecked() {
    // detect changes if trigger visibility changed
    const isTriggerVisible = !!this._element.nativeElement.offsetParent;

    if (isTriggerVisible !== this._isTriggerVisible && this._contentInited) {
      this._isTriggerVisible = isTriggerVisible;
      this._sync();
    }
  }

  ngOnChanges(): void {
    if (this._contentInited) {
      this._sync();
    }
  }

  ngOnDestroy() {
    if (this._componentSubscription) {
      this._componentSubscription.unsubscribe();
    }

    // must disable auto-init and release popup so others may use it
    clearTimeout(this._timer);

    if (this._initialized) {
      this.popup.trigger = null;
      this.popup.data = null;
      this.tutorialService.setIsDisplaying(this.popup.name, false);
    }

    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }

    this._menuCloseSubscription.unsubscribe();
    this._closingActionsSubscription.unsubscribe();
    this._hoverSubscription.unsubscribe();
  }

  /** Whether the menu is open. */
  get menuOpen(): boolean {
    return this._menuOpen;
  }

  /** The text direction of the containing app. */
  get dir(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /** Opens the menu. */
  openMenu(): void {
    const menu = this._menu;

    if (this._menuOpen || !menu) {
      return;
    }

    const overlayRef = this._createOverlay(menu);
    const overlayConfig = overlayRef.getConfig();
    const positionStrategy = overlayConfig.positionStrategy as FlexibleConnectedPositionStrategy;

    this._setPosition(menu, positionStrategy);
    overlayConfig.hasBackdrop = menu.hasBackdrop;
    overlayRef.attach(this._getPortal(menu));

    if (menu.lazyContent) {
      menu.lazyContent.attach();
    }

    this._closingActionsSubscription = this._menuClosingActions().subscribe(() => this.closeMenu());
    this._initMenu(menu);

    if (menu instanceof MatMenu) {
      menu._startAnimation();
      menu._directDescendantItems.changes.pipe(takeUntil(menu.close)).subscribe(() => {
        // Re-adjust the position without locking when the amount of items
        // changes so that the overlay is allowed to pick a new optimal position.
        positionStrategy.withLockedPosition(false).reapplyLastPosition();
        positionStrategy.withLockedPosition(true);
      });
    }
  }

  /** Closes the menu. */
  closeMenu(): void {
    this._menu?.close.emit();
  }

  /**
   * Updates the position of the menu to ensure that it fits all options within the viewport.
   */
  updatePosition(): void {
    this._overlayRef?.updatePosition();
  }

  /** Closes the menu and does the necessary cleanup. */
  private _destroyMenu() {
    if (!this._overlayRef || !this.menuOpen) {
      return;
    }

    const menu = this._menu;
    this._closingActionsSubscription.unsubscribe();
    this._overlayRef.detach();

    if (menu instanceof MatMenu) {
      menu._resetAnimation();

      if (menu.lazyContent) {
        // Wait for the exit animation to finish before detaching the content.
        menu._animationDone
          .pipe(
            filter(event => event.toState === 'void'),
            take(1),
            // Interrupt if the content got re-attached.
            takeUntil(menu.lazyContent._attached),
          )
          .subscribe({
            next: () => menu.lazyContent!.detach(),
            // No matter whether the content got re-attached, reset the menu.
            complete: () => this._setIsMenuOpen(false),
          });
      } else {
        this._setIsMenuOpen(false);
      }
    } else {
      this._setIsMenuOpen(false);
      menu?.lazyContent?.detach();
    }
  }

  /**
   * This method sets the menu state to open and focuses the first item if
   * the menu was opened via the keyboard.
   */
  private _initMenu(menu: MatMenuPanel): void {
    menu.direction = this.dir;
    this._setIsMenuOpen(true);
  }

  // set state rather than toggle to support triggers sharing a menu
  private _setIsMenuOpen(isOpen: boolean): void {
    this._menuOpen = isOpen;
  }

  /**
   * This method creates the overlay from the provided menu's template and saves its
   * OverlayRef so that it can be attached to the DOM when openMenu is called.
   */
  private _createOverlay(menu: MatMenuPanel): OverlayRef {
    if (!this._overlayRef) {
      const config = this._getOverlayConfig(menu);
      this._subscribeToPositions(
        menu,
        config.positionStrategy as FlexibleConnectedPositionStrategy,
      );
      this._overlayRef = this._overlay.create(config);
    }

    return this._overlayRef;
  }

  /**
   * This method builds the configuration object needed to create the overlay, the OverlayState.
   * @returns OverlayConfig
   */
  private _getOverlayConfig(menu: MatMenuPanel): OverlayConfig {
    // override overlay to avoid resizing of popups
    const positionStrategy = this._overlay.position()
      .flexibleConnectedTo(this._element)
      .withPush(true)
      .withFlexibleDimensions(false)
      .withTransformOriginOn('.mat-menu-panel, .mat-mdc-menu-panel');

    // patch positionStrategy to disable push for Y axis
    const curGetExactOverlayY = positionStrategy['_getExactOverlayY'];

    positionStrategy['_getExactOverlayY'] = (...args) => {
      const curIsPushed = positionStrategy['_isPushed'];
      positionStrategy['_isPushed'] = false;
      const value = curGetExactOverlayY.call(positionStrategy, ...args);
      positionStrategy['_isPushed'] = curIsPushed;
      return value;
    };

    return new OverlayConfig({
      positionStrategy,
      scrollStrategy: this._scrollStrategy(),
      direction: this._dir
    });
  }

  /**
   * Listens to changes in the position of the overlay and sets the correct classes
   * on the menu based on the new position. This ensures the animation origin is always
   * correct, even if a fallback position is used for the overlay.
   */
  private _subscribeToPositions(menu: MatMenuPanel, position: FlexibleConnectedPositionStrategy) {
    if (menu.setPositionClasses) {
      position.positionChanges.subscribe(change => {
        const posX: MenuPositionX = change.connectionPair.overlayX === 'start' ? 'after' : 'before';
        const posY: MenuPositionY = change.connectionPair.overlayY === 'top' ? 'below' : 'above';

        if (!this._lastPosition || this._lastPosition.originX !== change.connectionPair.originX ||
          this._lastPosition.originY !== change.connectionPair.originY) {
          // selected position changed, we must run detect changes to update arrow css
          this._lastPosition = change.connectionPair;
          // this._ngZone.run(() => setTimeout(() => {}));
          this._ngZone.run(() => menu.setPositionClasses(posX, posY));
        }
      });
    }
  }

  /**
   * Sets the appropriate positions on a position strategy
   * so the overlay connects with the trigger correctly.
   */
  private _setPosition(menu: MatMenuPanel, positionStrategy: FlexibleConnectedPositionStrategy) {
    // override position strategy to support open to the sides
    let [originX, originFallbackX]: HorizontalConnectionPos[] =
      menu.xPosition === 'before' ? ['end', 'start'] : ['start', 'end'];

    const [overlayY, overlayFallbackY]: VerticalConnectionPos[] =
      menu.yPosition === 'above' ? ['bottom', 'top'] : ['top', 'bottom'];

    let [originY, originFallbackY] = [overlayY, overlayFallbackY];
    let [overlayX, overlayFallbackX] = [originX, originFallbackX];

    // align popup's arrow to center of attached element if element size < 70
    const offsetX = this.popup.offsetX || ((this.popup.alignCenter || (this._element.nativeElement.offsetWidth < 130 &&
      this.popup.alignCenter === undefined)) && !this.popup.horizontal ? (this._element.nativeElement.offsetWidth / -2 + 29) *
      (menu.xPosition === 'before' ? 1 : -1) : 0);

    const offsetY = this.popup.offsetY || ((this.popup.alignCenter || (this._element.nativeElement.offsetHeight < 80 &&
      this.popup.alignCenter === undefined)) && this.popup.horizontal ? (this._element.nativeElement.offsetHeight / 2 - 29) *
      (menu.yPosition === 'below' ? 1 : -1) : 0);

    if (this.popup.horizontal) {
      // When the menu is a sub-menu, it should always align itself
      // to the edges of the trigger, instead of overlapping it.
      overlayFallbackX = originX = menu.xPosition === 'before' ? 'start' : 'end';
      originFallbackX = overlayX = originX === 'end' ? 'start' : 'end';
    } else if (!menu.overlapTrigger) {
      originY = overlayY === 'top' ? 'bottom' : 'top';
      originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';
    }

    const original = {originX, originY, overlayX, overlayY, offsetX, offsetY};
    const flipX = {originX: originFallbackX, originY, overlayX: overlayFallbackX, overlayY, offsetX: -offsetX, offsetY};
    const flipY = {originX, originY: originFallbackY, overlayX, overlayY: overlayFallbackY, offsetX, offsetY: -offsetY};
    const flipXY = {originX: originFallbackX, originY: originFallbackY, overlayX: overlayFallbackX, overlayY: overlayFallbackY,
      offsetX: -offsetX, offsetY: -offsetY};

    positionStrategy.withPositions(this.popup.horizontal ? [original, flipX] : [original, flipY, flipXY]);
  }

  /** Returns a stream that emits whenever an action that should close the menu occurs. */
  private _menuClosingActions() {
    const backdrop = this._overlayRef!.backdropClick();
    const detachments = this._overlayRef!.detachments();
    const parentClose = observableOf();
    const hover = observableOf();

    return merge(backdrop, parentClose as Observable<void>, hover, detachments);
  }

  /** Gets the portal that should be attached to the overlay. */
  private _getPortal(menu: MatMenuPanel): TemplatePortal {
    // Note that we can avoid this check by keeping the portal on the menu panel.
    // While it would be cleaner, we'd have to introduce another required method on
    // `MatMenuPanel`, making it harder to consume.
    if (!this._portal || this._portal.templateRef !== menu.templateRef) {
      this._portal = new TemplatePortal(menu.templateRef, this._viewContainerRef);
    }

    return this._portal;
  }

  /// custom code

  @HostListener('click')
  _click() {
    // element click
    if (this._initialized && this.popup.closeOnClick) {
      this.close(false);
    }
  }

  private _sync() {
    const isTriggerVisible = !!this._element.nativeElement.offsetParent;

    if (this._menu && this.popup.name) {
      if (this.enabled && isTriggerVisible && !this.tutorialService.getTaskCompleted(this.popup.name) &&
        !this.tutorialService.disabled &&
        this.tutorialService.evalMustCompleted(this.mustCompleted) &&
        this.tutorialService.evalMustCompleted(this.popup.mustCompleted) &&
        this.tutorialService.evalMustNotDisplaying(this.popup.mustNotDisplaying)) {

        // should be visible, but let's check if popup not already in use by other trigger (in table or ngFor)
        if (!this.popup.trigger) {
          this._initialized = true;
          this.popup.trigger = this;
          this.popup.data = this.data;
          clearTimeout(this._timer);
          this._timer = setTimeout(() => this.openMenu(), 500);
          this.tutorialService.setIsDisplaying(this.popup.name, true);
          this.popup.opened.emit();
        }
      } else if (this._initialized) {
        // only close if this is our popup (initialized)
        this._initialized = false;
        this.popup.trigger = null;
        this.popup.data = null;
        clearTimeout(this._timer);
        this.closeMenu();
        this.tutorialService.setIsDisplaying(this.popup.name, false);
        this.popup.closed.emit();
      }
    }
  }

  reposition() {
    if (this._initialized && this._componentSubscription) {
      this.closeMenu();
      this.openMenu();
    }
  }

  close(buttonClicked: boolean) {
    this.tutorialService.logUserAction(this.popup.name, buttonClicked ? BdcDisplayEventAction.ButtonClicked :
      BdcDisplayEventAction.UserClosed);
    this.tutorialService.setTaskCompleted(this.popup.name);
    this.tutorialService.setTasks(this.popup.onCloseCompleteTask);

    if (buttonClicked) {
      this.tutorialService.setTasks(this.popup.onButtonCompleteTask);
    }
  }
}
