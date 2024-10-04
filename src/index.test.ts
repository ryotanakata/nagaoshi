import { nagaoshi } from './index';

describe('nagaoshi', () => {
  jest.useFakeTimers();

  if (typeof PointerEvent === 'undefined') {
    global.PointerEvent = class extends MouseEvent {
      constructor(type: string, params: PointerEventInit = {}) {
        super(type, params);
      }
    } as typeof PointerEvent;
  }

  let element: HTMLElement;
  let actionMock: jest.Mock;

  beforeEach(() => {
    element = document.createElement('button');
    actionMock = jest.fn();
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  test('should trigger the specified action on long press (長押しで指定アクションが実行される)', () => {
    const cleanup = nagaoshi(element, actionMock, { delay: 500, interval: 100 });

    element.dispatchEvent(new PointerEvent('pointerdown'));

    jest.advanceTimersByTime(500);

    expect(actionMock).not.toHaveBeenCalled();
    jest.advanceTimersByTime(100);
    expect(actionMock).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(100);
    expect(actionMock).toHaveBeenCalledTimes(2);

    cleanup();
  });

  test('should start long press with Enter key (Enterキーで長押しが開始される)', () => {
    const cleanup = nagaoshi(element, actionMock, { delay: 500 });

    element.focus();

    const keyDownEvent = new Event('keydown', {
      bubbles: true,
      cancelable: true
    });
    (keyDownEvent as any).key = 'Enter';
    element.dispatchEvent(keyDownEvent);

    jest.advanceTimersByTime(500);

    jest.runOnlyPendingTimers();

    expect(actionMock).toHaveBeenCalled();

    const keyUpEvent = new Event('keyup', {
      bubbles: true,
      cancelable: true
    });
    (keyUpEvent as any).key = 'Enter';
    element.dispatchEvent(keyUpEvent);

    cleanup();
  });

  test('should cancel long press when pointer is removed (ポインターが離れたときに長押しがキャンセルされる)', () => {
    const onCancelMock = jest.fn();
    const cleanup = nagaoshi(element, actionMock, { delay: 500, onCancel: onCancelMock });

    element.dispatchEvent(new PointerEvent('pointerdown'));

    jest.advanceTimersByTime(300);

    element.dispatchEvent(new PointerEvent('pointerleave'));

    expect(actionMock).not.toHaveBeenCalled();
    expect(onCancelMock).toHaveBeenCalled();

    cleanup();
  });

  test('should correctly remove event listeners with cleanup function (クリーンアップ関数がイベントリスナーを正しく解除する)', () => {
    const cleanup = nagaoshi(element, actionMock);

    element.dispatchEvent(new PointerEvent('pointerdown'));

    cleanup();

    element.dispatchEvent(new PointerEvent('pointerdown'));
    jest.advanceTimersByTime(1000);

    expect(actionMock).not.toHaveBeenCalled();
  });
});
