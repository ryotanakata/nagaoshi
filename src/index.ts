/*
 * Options for the long press event (長押しイベントのオプション)
 */
type NagaoshiOptions = {
  interval?: number;
  delay?: number;
  onStart?: () => void;
  onFinish?: () => void;
  onCancel?: () => void;
};

/*
 * Pointer event type for the long press event (長押しイベントのポインターイベントタイプ)
 */
type NagaoshiPointerEvent = PointerEvent & {
  target: HTMLElement & {
    setAttribute: (arg0: string, arg1: string) => void;
  };
};

/*
 * Keyboard event type for the long press event (長押しイベントのキーボードイベントタイプ)
 */
type NagaoshiKeyEvent = KeyboardEvent & {
  key: string;
  type: string;
};

/*
 * Default interval and delay (デフォルトのインターバルとディレイ)
 */
const DEFAULT_INTERVAL = 75;
const DEFAULT_DELAY = 1000;

/*
 * Handles the long press event (長押しイベントを処理します)
 *
 * @param {HTMLElement} element - The element to set the event on (イベントを設定する要素)
 * @param {Function} action - The action to execute on long press (長押し時に実行するアクション)
 * @param {NagaoshiOptions} options - The options for the long press event (長押しイベントのオプション)
 * @returns {Function} Cleanup function (クリーンアップ関数)
 */
const nagaoshi = (
  element: HTMLElement,
  action: () => void = () => {
    // No-op function (デフォルトでは何もしません)
  },
  options: NagaoshiOptions = {},
): (() => void) => {
  const {
    interval = DEFAULT_INTERVAL,
    delay = DEFAULT_DELAY,
    onStart,
    onFinish,
    onCancel,
  } = options;

  let longPressTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let isLongPress = false;
  let isKeyDown = false;

  /*
   * Starts the long press (長押しを開始します)
   *
   * @param {NagaoshiPointerEvent | NagaoshiKeyEvent} e - The event that triggered the long press (長押しをトリガーしたイベント)
   * @returns {void}
   */
  const startLongPress = (e: NagaoshiPointerEvent | NagaoshiKeyEvent): void => {
    onStart?.();
    if (e instanceof PointerEvent) {
      (e.target as HTMLElement).setAttribute("aria-pressed", "true");
    }

    longPressTimeoutId = setTimeout(() => {
      isLongPress = true;
      intervalId = setInterval(() => {
        action();
      }, interval);
    }, delay);
  };

  /*
   * Stops the long press (長押しを停止します)
   *
   * @param {NagaoshiPointerEvent | NagaoshiKeyEvent} e - The event that triggered the stop (停止をトリガーしたイベント)
   * @param {boolean} isCancelled - Whether the event was cancelled (イベントがキャンセルされたかどうか)
   * @returns {void}
   */
  const stopLongPress = (
    e: NagaoshiPointerEvent | NagaoshiKeyEvent,
    isCancelled = false,
  ): void => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (longPressTimeoutId !== null) {
      clearTimeout(longPressTimeoutId);
      longPressTimeoutId = null;
    }

    if (isLongPress) {
      onFinish?.();
    }

    isLongPress = false;

    if (e instanceof PointerEvent) {
      (e.target as HTMLElement).setAttribute("aria-pressed", "false");
    }

    if (isCancelled) {
      onCancel?.();
    }
  };

  /*
   * Executes a single action before long press starts (長押しが始まる前に単一のアクションを実行します)
   *
   * @param {NagaoshiPointerEvent | NagaoshiKeyEvent} e - The event to handle (処理するイベント)
   * @returns {void}
   */
  const handleShortPress = (
    e: NagaoshiPointerEvent | NagaoshiKeyEvent,
  ): void => {
    if (!isLongPress) {
      action();
      onFinish?.();
    }
    stopLongPress(e);
  };

  /*
   * Handles the keyboard events for long press (長押しのキーボードイベントを処理します)
   *
   * @param {NagaoshiKeyEvent} e - The keyboard event to handle (処理するキーボードイベント)
   * @returns {void}
   */
  const handleKeyAction = (e: NagaoshiKeyEvent): void => {
    const { key, type } = e;
    const isEnterOrSpace = key === "Enter" || key === " ";

    if (!isEnterOrSpace) return;

    if (type === "keydown" && !isKeyDown) {
      isKeyDown = true;
      startLongPress(e);
    } else if (type === "keyup") {
      isKeyDown = false;
      handleShortPress(e);
    }
  };

  /* addEventListener and removeEventListener wrapped with on~ for consistency (addEventListener と removeEventListener に同一の関数を渡すために on~でラップ) */
  const onPointerDown = (e: PointerEvent): void =>
    startLongPress(e as NagaoshiPointerEvent);
  const onPointerUp = (e: PointerEvent): void =>
    handleShortPress(e as NagaoshiPointerEvent);
  const onPointerLeave = (e: PointerEvent): void =>
    stopLongPress(e as NagaoshiPointerEvent, true);
  const onPointerCancel = (e: PointerEvent): void =>
    stopLongPress(e as NagaoshiPointerEvent, true);
  const onKeyDown = (e: KeyboardEvent): void =>
    handleKeyAction(e as NagaoshiKeyEvent);
  const onKeyUp = (e: KeyboardEvent): void =>
    handleKeyAction(e as NagaoshiKeyEvent);

  element.addEventListener("pointerdown", onPointerDown);
  element.addEventListener("pointerup", onPointerUp);
  element.addEventListener("pointerleave", onPointerLeave);
  element.addEventListener("pointercancel", onPointerCancel);
  element.addEventListener("keydown", onKeyDown);
  element.addEventListener("keyup", onKeyUp);

  /*
   * Returns a cleanup function that removes event listeners (イベントリスナーを解除するクリーンアップ関数を返します)
   *
   * @returns {Function} Cleanup function (クリーンアップ関数)
   */
  return () => {
    element.removeEventListener("pointerdown", onPointerDown);
    element.removeEventListener("pointerup", onPointerUp);
    element.removeEventListener("pointerleave", onPointerLeave);
    element.removeEventListener("pointercancel", onPointerCancel);
    element.removeEventListener("keydown", onKeyDown);
    element.removeEventListener("keyup", onKeyUp);
  };
};

/*
 * Searches for interactive elements (インタラクティブな要素を検索します)
 *
 * @param {Node | null} element - The element to search within (検索する要素)
 * @returns {HTMLElement | null} The found interactive element (見つかったインタラクティブな要素)
 */
const findInteractiveElement = (element: Node | null): HTMLElement | null => {
  const string =
    'a[href], button, details, embed, iframe, label, select, textarea, audio[controls], video[controls], img[usemap], input:not([type="hidden"])';

  return element instanceof Element && element.matches(string)
    ? (element as HTMLElement)
    : null;
};

/*
 * Detects long press (長押しを検知します)
 *
 * @param {HTMLElement | null} element - The element to set the detection on (イベントを設定する要素)
 * @returns {void}
 */
const handleLongPressDetection = (element: HTMLElement | null): void => {
  if (!element) return;

  let timer: ReturnType<typeof setTimeout> | null = null;

  /*
   * Resets the long press timer (長押しタイマーをリセットします)
   *
   * @returns {void}
   */
  const clearLongPressTimer = () => timer && clearTimeout(timer);

  /*
   * Starts the long press timer (長押しタイマーを開始します)
   *
   * @returns {void}
   */
  const startLongPressTimer = (): void => {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      element.dispatchEvent(new CustomEvent("nagaoshi"));
      element.removeEventListener("pointerdown", startLongPressTimer);
      element.removeEventListener("pointerup", clearLongPressTimer);
      element.removeEventListener("pointerleave", clearLongPressTimer);
    }, DEFAULT_DELAY);
  };

  startLongPressTimer();
  element.addEventListener("pointerdown", startLongPressTimer);
  element.addEventListener("pointerup", clearLongPressTimer);
  element.addEventListener("pointerleave", clearLongPressTimer);
};

/*
 * Registers handleLongPressDetection globally (handleLongPressDetectionをグローバルに登録します)
 *
 * @param {PointerEvent} e - The event that triggered the detection (検知をトリガーしたイベント)
 * @returns {void}
 */
document.addEventListener("pointerdown", (e: PointerEvent) => {
  const element = findInteractiveElement(e.target as Node);

  if (!element) return;

  handleLongPressDetection(element);
});

export { nagaoshi };
