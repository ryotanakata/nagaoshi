/*
 * 長押しイベントのオプション
*/
type NagaoshiOptions = {
  interval?: number;
  delay?: number;
  onStart?: () => void;
  onFinish?: () => void;
  onCancel?: () => void;
};

/*
 * 長押しイベントのポインターイベント
*/
type NagaoshiPointerEvent = PointerEvent & {
  target: HTMLElement & {
    setAttribute: (arg0: string, arg1: string) => void;
  };
};

/*
 * 長押しイベントのキーボードイベント
*/
type NagaoshiKeyEvent = KeyboardEvent & {
  key: string;
  type: string;
};

/*
 * 長押しイベントを処理する
 *
 * @param {HTMLElement} element - イベントを設定する要素
 * @param {Function} action - 長押し時に実行するアクション
 * @param {NagaoshiOptions} options - オプション
 * @returns {Function} クリーンアップ関数
*/
const nagaoshi = (
  element: HTMLElement,
  action: () => void = () => {},
  options: NagaoshiOptions = {}
): Function => {
  const {
    interval = 75,
    delay = 100,
    onStart,
    onFinish,
    onCancel
  } = options;

  let longPressTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let isLongPress: boolean = false;
  let isKeyDown: boolean = false;

/*
 * 長押しを開始する
 *
 * @param {NagaoshiPointerEvent | NagaoshiKeyEvent} e - イベント
 * @returns {void}
*/
  const startLongPress = (
    e: NagaoshiPointerEvent | NagaoshiKeyEvent
  ): void => {
    onStart?.();
    if (e instanceof PointerEvent) {
      (e.target as HTMLElement).setAttribute('aria-pressed', 'true');
    }

    longPressTimeoutId = setTimeout(() => {
      isLongPress = true;
      intervalId = setInterval(() => {
        action();
        onFinish?.();
      }, interval);
    }, delay);
  };

  /*
  * 長押しを停止する
  *
  * @param {NagaoshiPointerEvent | NagaoshiKeyEvent} e - イベント
  * @param {boolean} isCancelled - キャンセルされたかどうか
  * @returns {void}
  */
  const stopLongPress = (
    e: NagaoshiPointerEvent | NagaoshiKeyEvent,
    isCancelled = false
  ): void => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (longPressTimeoutId !== null) {
      clearTimeout(longPressTimeoutId);
      longPressTimeoutId = null;
    }

    isLongPress = false;

    if (e instanceof PointerEvent) {
      (e.target as HTMLElement).setAttribute('aria-pressed', 'false');
    }

    if (isCancelled) {
      onCancel?.();
    }
  };

  /*
  * 長押しが始まる前に単一のアクションを実行
  *
  * @param {NagaoshiPointerEvent | NagaoshiKeyEvent} e - イベント
  * @returns {void}
  */
  const executeActionOnce = (
    e: NagaoshiPointerEvent | NagaoshiKeyEvent
  ): void => {
    if (!isLongPress) {
      action();
      onFinish?.();
    }
    stopLongPress(e);
  };

  /*
  * キーボードイベントを処理する
  *
  * @param {NagaoshiKeyEvent} e - イベント
  * @returns {void}
  */
  const handleKeyAction = (e: NagaoshiKeyEvent): void => {
    const { key, type } = e;
    const isEnterOrSpace = key === 'Enter' || key === ' ';

    if (!isEnterOrSpace) return;

    if (type === 'keydown' && !isKeyDown) {
      isKeyDown = true;
      startLongPress(e);
    } else if (type === 'keyup') {
      isKeyDown = false;
      executeActionOnce(e);
    }
  };


  /* addEventListerner と removeEventListener　に同一の関数を渡すために on~でラップ */
  const onPointerDown = (e: PointerEvent):void => startLongPress(e as NagaoshiPointerEvent);
  const onPointerUp = (e: PointerEvent):void => executeActionOnce(e as NagaoshiPointerEvent);
  const onPointerLeave = (e: PointerEvent):void => stopLongPress(e as NagaoshiPointerEvent, true);
  const onPointerCancel = (e: PointerEvent):void => stopLongPress(e as NagaoshiPointerEvent, true);
  const onKeyDown = (e: KeyboardEvent):void => handleKeyAction(e as NagaoshiKeyEvent);
  const onKeyUp = (e: KeyboardEvent):void => handleKeyAction(e as NagaoshiKeyEvent);

  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('pointerup', onPointerUp);
  element.addEventListener('pointerleave', onPointerLeave);
  element.addEventListener('pointercancel', onPointerCancel);
  element.addEventListener('keydown', onKeyDown);
  element.addEventListener('keyup', onKeyUp);

  /*
  * イベントリスナーを解除するクリーンアップ関数を返します。
  * この関数は、コンポーネントが破棄されるときや、イベントハンドラが不要になったときに呼び出してください。
  *
  * @returns {Function} イベントリスナーを解除するための関数
  */
  return () => {
    element.removeEventListener('pointerdown', onPointerDown);
    element.removeEventListener('pointerup', onPointerUp);
    element.removeEventListener('pointerleave', onPointerLeave);
    element.removeEventListener('pointercancel', onPointerCancel);
    element.removeEventListener('keydown', onKeyDown);
    element.removeEventListener('keyup', onKeyUp);
  };
};
