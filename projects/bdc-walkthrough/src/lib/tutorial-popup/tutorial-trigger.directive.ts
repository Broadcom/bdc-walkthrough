import {
  AfterContentInit,
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewContainerRef
} from '@angular/core';
import {MAT_MENU_SCROLL_STRATEGY, MatMenuTrigger} from '@angular/material/menu';
import {FocusMonitor} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {
  ConnectionPositionPair,
  FlexibleConnectedPositionStrategy,
  HorizontalConnectionPos,
  Overlay,
  OverlayConfig,
  VerticalConnectionPos
} from '@angular/cdk/overlay';
import {Subscription} from 'rxjs';
import {BdcWalkPopupComponent} from './tutorial-popup.component';
import {BdcDisplayEventAction, BdcWalkService} from '../bdc-walk.service';

@Directive({
  selector: '[bdcWalkTriggerFor]'
})
export class BdcWalkTriggerDirective extends MatMenuTrigger implements OnInit, AfterContentInit, OnChanges, OnDestroy {
  private _componentSubscription: Subscription;
  private _lastPosition: ConnectionPositionPair;
  private _initialized = false;
  private _timer: any;
  private _contentInited = false;

  @Input('bdcWalkTriggerFor') popup: BdcWalkPopupComponent;
  @Input() enabled = true;
  @Input() mustCompleted: { [taskName: string]: any | boolean } = {};
  @Input() data: any;

  constructor(private ngZone: NgZone,
              private tutorialService: BdcWalkService,
              private __overlay: Overlay, private __elementRef: ElementRef<HTMLElement>, private __dir: Directionality,
              __viewContainerRef: ViewContainerRef, __focusMonitor: FocusMonitor,
              @Inject(MAT_MENU_SCROLL_STRATEGY) private __scrollStrategy) {

    super(__overlay, __elementRef, __viewContainerRef, __scrollStrategy, null, null, __dir, __focusMonitor);
  }

  ngOnInit() {
    if (!this.popup || !this.popup.menu) {
      return;
    }
    // overrides
    this['_setPosition'] = this.__setPosition;
    this['_getOverlayConfig'] = this.__getOverlayConfig;
    this['_handleClick'] = () => {};

    this.menu = this.popup.menu;
    this.restoreFocus = false;
  }

  ngAfterContentInit() {
    super.ngAfterContentInit();
    this._contentInited = true;
    this._componentSubscription = this.tutorialService.changes.subscribe(() => this._sync());
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

    super.ngOnDestroy();
  }

  @HostListener('click')
  _click() {
    // element click
    if (this._initialized && this.popup.closeOnClick) {
      this.close(false);
    }
  }

  private _sync() {
    if (this.menu && this.popup.name) {
      if (this.enabled && !this.tutorialService.getTaskCompleted(this.popup.name) &&
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
    this.tutorialService.logUserAction(this.popup.name, buttonClicked ? BdcDisplayEventAction.ButtonClicked : BdcDisplayEventAction.UserClosed);
    this.tutorialService.setTaskCompleted(this.popup.name);
    this.tutorialService.setTasks(this.popup.onCloseCompleteTask);

    if (buttonClicked) {
      this.tutorialService.setTasks(this.popup.onButtonCompleteTask);
    }
  }

  private __getOverlayConfig(): OverlayConfig {
    // override overlay to avoid resizing of popups
    const positionStrategy = this.__overlay.position()
      .flexibleConnectedTo(this.__elementRef)
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

    this._componentSubscription.add(positionStrategy.positionChanges.subscribe(position => {
      if (!this._lastPosition || this._lastPosition.originX !== position.connectionPair.originX ||
        this._lastPosition.originY !== position.connectionPair.originY) {
        // selected position changed, we must run detect changes to update arrow css
        this._lastPosition = position.connectionPair;
        this.ngZone.run(() => setTimeout(() => {}));
      }
    }));

    return new OverlayConfig({
      positionStrategy,
      scrollStrategy: this.__scrollStrategy(),
      direction: this.__dir
    });
  }

  private __setPosition(positionStrategy: FlexibleConnectedPositionStrategy) {
    // override position strategy to support open to the sides
    let [originX, originFallbackX]: HorizontalConnectionPos[] =
      this.menu.xPosition === 'before' ? ['end', 'start'] : ['start', 'end'];

    const [overlayY, overlayFallbackY]: VerticalConnectionPos[] =
      this.menu.yPosition === 'above' ? ['bottom', 'top'] : ['top', 'bottom'];

    let [originY, originFallbackY] = [overlayY, overlayFallbackY];
    let [overlayX, overlayFallbackX] = [originX, originFallbackX];

    // align popup's arrow to center of attached element if element size < 70
    const offsetX = this.popup.offsetX || ((this.popup.alignCenter || (this.__elementRef.nativeElement.offsetWidth < 130 && this.popup.alignCenter === undefined)) && !this.popup.horizontal ? (this.__elementRef.nativeElement.offsetWidth / -2 + 29) * (this.menu.xPosition === 'before' ? 1 : -1) : 0);
    const offsetY = this.popup.offsetY || ((this.popup.alignCenter || (this.__elementRef.nativeElement.offsetHeight < 80 && this.popup.alignCenter === undefined)) && this.popup.horizontal ? (this.__elementRef.nativeElement.offsetHeight / 2 - 29) * (this.menu.yPosition === 'below' ? 1 : -1) : 0);

    if (this.popup.horizontal) {
      // When the menu is a sub-menu, it should always align itself
      // to the edges of the trigger, instead of overlapping it.
      overlayFallbackX = originX = this.menu.xPosition === 'before' ? 'start' : 'end';
      originFallbackX = overlayX = originX === 'end' ? 'start' : 'end';
    } else if (!this.menu.overlapTrigger) {
      originY = overlayY === 'top' ? 'bottom' : 'top';
      originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';
    }

    const original = {originX, originY, overlayX, overlayY, offsetX, offsetY};
    const flipX = {originX: originFallbackX, originY, overlayX: overlayFallbackX, overlayY, offsetX: -offsetX, offsetY};
    const flipY = {originX, originY: originFallbackY, overlayX, overlayY: overlayFallbackY, offsetX, offsetY: -offsetY};
    const flipXY = {originX: originFallbackX, originY: originFallbackY, overlayX: overlayFallbackX, overlayY: overlayFallbackY, offsetX: -offsetX, offsetY: -offsetY}

    positionStrategy.withPositions(this.popup.horizontal ? [original, flipX] : [original, flipY, flipXY]);
  }
}
