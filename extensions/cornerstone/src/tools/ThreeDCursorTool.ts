import { BaseTool } from '@cornerstonejs/tools';
import { EventTypes, PublicToolProps, ToolProps } from '@cornerstonejs/tools/src/types';
import { getEnabledElements, type Types } from '@cornerstonejs/core';
import { vec3 } from 'gl-matrix';

/**
 * Tool ThreeDCursorTool giúp đồng bộ vị trí con trỏ trên tất cả các viewport
 * và tự động điều chỉnh lát cắt phù hợp.
 */
class ThreeDCursorTool extends BaseTool {
  static toolName = 'ThreeDCursorTool';
  public toolGroupId = 'default';

  public STYLE_CURSOR: {
    default: string;
    crosshair: string;
  } = {
    default: 'default',
    crosshair: 'crosshair',
  };

  public TOOL_MODE: {
    active: string;
    disable: string;
  } = {
    active: 'Active',
    disable: 'Disable',
  };

  private viewportGridContainer: HTMLDivElement | null = null;

  constructor(
    toolProps: PublicToolProps = {},
    defaultToolProps: ToolProps = {
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        touchDragThreshold: 1, // Thêm ngưỡng phát hiện kéo cảm ứng
      },
    }
  ) {
    super(toolProps, defaultToolProps);
  }

  /**
   * Sets the CSS cursor style for the main viewport grid container.
   * @param style The desired cursor style ('default' or 'crosshair').
   */
  setStyleCursor(style: string) {
    if (!this.viewportGridContainer) {
      this.viewportGridContainer = document.querySelector(
        '[data-cy="viewport-grid"]'
      ) as HTMLDivElement;
    }

    if (!this.viewportGridContainer) {
      return;
    }

    if (style === this.STYLE_CURSOR.default) {
      this.viewportGridContainer.style.cursor = 'default';
    }

    if (style === this.STYLE_CURSOR.crosshair) {
      // SVG crosshair with white lines, no center dot.
      // Assigned to the container.
      this.viewportGridContainer.style.cursor =
        'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PGxpbmUgeDE9IjE2IiB5MT0iMCIgeDI9IjE2IiB5Mj0iMTAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIvPjxsaW5lIHgxPSIxNiIgeTE9IjIyIiB4Mj0iMTYiIHkyPSIzMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+PGxpbmUgeDE9IjAiIHkxPSIxNiIgeDI9IjEwIiB5Mj0iMTYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIvPjxsaW5lIHgxPSIyMiIgeTE9IjE2IiB4Mj0iMzEiIHkyPSIxNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+PC9zdmc+") 16 16, crosshair';
    }
  }

  /**
   * Kích hoạt khi tool được chọn trên thanh công cụ.
   * Thêm sự kiện `mousemove` và `mouseleave` vào tất cả các viewport.
   */
  onSetToolActive() {
    this.setStyleCursor(this.STYLE_CURSOR.crosshair);

    const viewports = this.getViewports();
    viewports.forEach(viewport => {
      const element = viewport.element;
      if (!element) {
        return;
      }

      // element.addEventListener('mousemove', this.mouseMoveHandler);
      element.addEventListener('mouseleave', this.mouseLeaveHandler);
      element.addEventListener('touchend', this.mouseLeaveHandler);
    });
  }

  /**
   * Xử lý sự kiện khi kéo thả chuột trên viewport.
   * @param evt Sự kiện kéo chuột
   */
  mouseDragCallback(evt: EventTypes.InteractionEventType) {
    const element = evt.currentTarget as HTMLDivElement;
    this.hideOrShowCursor(element, true);
    const { currentPoints } = evt.detail;
    const worldPos = currentPoints.world;

    const viewports = this.getViewports();
    if (!viewports.length) {
      return;
    }

    viewports.forEach(viewport => {
      this.syncViewport(viewport, worldPos);
    });

    this.setStyleCursor(this.STYLE_CURSOR.crosshair);
  }

  touchDragCallback(evt: EventTypes.InteractionEventType) {
    this.mouseDragCallback(evt);
  }

  /**
   * Xử lý khi tool bị vô hiệu hóa hoặc chuyển sang tool khác.
   * Gỡ bỏ các sự kiện đã đăng ký và ẩn hồng tâm.
   */
  onSetToolPassive() {
    const container = document.querySelector('[data-cy="viewport-grid"]') as HTMLDivElement;
    if (container) {
      // Khôi phục con trỏ mặc định
      container.style.cursor = 'default';
    }

    const viewports = this.getViewports();
    viewports.forEach(viewport => {
      const element = viewport.element;
      if (!element) {
        return;
      }

      this.hideOrShowCursor(element, false);
      element.removeEventListener('mouseleave', this.mouseLeaveHandler);
      element.removeEventListener('touchend', this.mouseLeaveHandler);
    });
  }

  /**
   * Trả về viewport tương ứng với một element HTML.
   * @param element Phần tử HTML của viewport
   */
  getViewportFromElement(element: HTMLDivElement) {
    const viewports = this.getViewports();
    return viewports.find(vp => vp.element === element) || null;
  }

  touchEndCallback(evt: EventTypes.InteractionEventType) {
    this.mouseMoveCallback(evt);
  }

  /**
   * Xử lý khi di chuyển chuột trong viewport.
   * @param evt Sự kiện chuột
   */
  mouseMoveCallback(evt: EventTypes.InteractionEventType) {
    if (this.mode !== this.TOOL_MODE.active) {
      this.setStyleCursor(this.STYLE_CURSOR.default);
      return;
    }

    this.setStyleCursor(this.STYLE_CURSOR.crosshair);

    const element = evt.currentTarget as HTMLDivElement;
    const viewport = this.getViewportFromElement(element);
    if (!viewport) {
      return;
    }

    const canvasPos = [evt.detail.event.offsetX, evt.detail.event.offsetY] as Types.Point2;
    const worldPos = viewport.canvasToWorld(canvasPos);
    if (!worldPos) {
      return;
    }

    const viewports = this.getViewports();
    if (!viewports.length) {
      return;
    }

    if (evt.detail.event.buttons === 0) {
      // Đây là sự kiện mousemove (ko có nút chuột đang được nhấn)
      this.hideOrShowCursor(element, false);

      // Nếu không đồng bộ, xóa hồng tâm khỏi tất cả các viewport trừ viewport hiện tại
      viewports.forEach(vp => {
        this.clearCrosshair(vp);
      });
    } else {
      // Đây là sự kiện mousedrag (có nút chuột đang được nhấn)
      this.hideOrShowCursor(element, true);

      viewports.forEach(viewport => {
        this.syncViewport(viewport, worldPos);
      });
    }
  }

  /**
   * Xử lý khi chuột rời khỏi viewport.
   * @param evt Sự kiện chuột rời đi
   */
  mouseLeaveHandler = (evt: MouseEvent) => {
    this.setStyleCursor(this.STYLE_CURSOR.crosshair);
    const element = evt.currentTarget as HTMLDivElement;
    const viewport = this.getViewportFromElement(element);
    if (!viewport) {
      return;
    }

    this.clearCrosshair(viewport);
  };

  /**
   * Đồng bộ viewport với vị trí hồng tâm.
   * @param viewport Viewport cần đồng bộ
   * @param worldPos Vị trí thế giới của con trỏ
   */
  syncViewport(viewport: Types.IStackViewport | Types.IVolumeViewport, worldPos: Types.Point3) {
    if (!viewport) {
      return;
    }

    const { closestIndex, minDistance } = this.findClosestSlice(viewport, worldPos);
    const crosshairColor = minDistance > 5 ? 'red' : '#11b9e3';

    if (closestIndex !== null) {
      viewport.setImageIdIndex(closestIndex);
      viewport.render();
    }

    this.drawCrosshair(viewport, worldPos, crosshairColor);
  }

  /**
   * Tìm lát cắt gần nhất với vị trí hiện tại.
   */
  findClosestSlice(viewport: Types.IStackViewport | Types.IVolumeViewport, worldPos: Types.Point3) {
    const imageIndex = viewport.getCurrentImageIdIndex();
    const imageIds = viewport.getImageIds();

    let closestIndex = imageIndex;
    let minDistance = Infinity;

    const camera = viewport.getCamera();
    const viewPlaneNormal = camera.viewPlaneNormal;

    imageIds.forEach((imageId, index) => {
      const imagePlane = cornerstone.metaData.get('imagePlaneModule', imageId);
      if (!imagePlane || !imagePlane.imagePositionPatient) {
        return;
      }

      const slicePosition = imagePlane.imagePositionPatient;

      const projectedDistance = Math.abs(
        vec3.dot(viewPlaneNormal, [
          worldPos[0] - slicePosition[0],
          worldPos[1] - slicePosition[1],
          worldPos[2] - slicePosition[2],
        ])
      );

      if (projectedDistance < minDistance) {
        minDistance = projectedDistance;
        closestIndex = index;
      }
    });

    return { closestIndex: closestIndex !== imageIndex ? closestIndex : null, minDistance };
  }

  /**
   * Vẽ hồng tâm trên viewport.
   */
  drawCrosshair(
    viewport: Types.IStackViewport | Types.IVolumeViewport,
    worldPos: Types.Point3,
    color = 'yellow'
  ) {
    if (!viewport) {
      return;
    }

    const element = viewport.element;
    if (!element) {
      return;
    }

    let overlayCanvas = element.querySelector('.crosshair-overlay') as HTMLCanvasElement;
    if (!overlayCanvas) {
      overlayCanvas = document.createElement('canvas');
      overlayCanvas.classList.add('crosshair-overlay');
      overlayCanvas.style.position = 'absolute';
      overlayCanvas.style.top = '0';
      overlayCanvas.style.left = '0';
      overlayCanvas.style.pointerEvents = 'none';
      element.appendChild(overlayCanvas);
    }

    overlayCanvas.width = element.clientWidth;
    overlayCanvas.height = element.clientHeight;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    const canvasPos = viewport.worldToCanvas(worldPos);
    if (!canvasPos) {
      return;
    }

    ctx.strokeStyle = color;

    // Kích thước hồng tâm giống RadiAnt Viewer
    const gap = 7; // khoảng cách trống giữa tâm
    const armLength = 10; // độ dài mỗi đoạn hồng tâm

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5; // độ dày nét vẽ

    // Vẽ 4 đoạn hồng tâm rời
    ctx.beginPath();
    // Ngang trái
    ctx.moveTo(canvasPos[0] - gap - armLength, canvasPos[1]);
    ctx.lineTo(canvasPos[0] - gap, canvasPos[1]);
    // Ngang phải
    ctx.moveTo(canvasPos[0] + gap, canvasPos[1]);
    ctx.lineTo(canvasPos[0] + gap + armLength, canvasPos[1]);
    // Dọc trên
    ctx.moveTo(canvasPos[0], canvasPos[1] - gap - armLength);
    ctx.lineTo(canvasPos[0], canvasPos[1] - gap);
    // Dọc dưới
    ctx.moveTo(canvasPos[0], canvasPos[1] + gap);
    ctx.lineTo(canvasPos[0], canvasPos[1] + gap + armLength);
    ctx.stroke();

    ctx.beginPath();
    ctx.fill();
  }

  getViewports() {
    const enabledElements = getEnabledElements();
    return enabledElements.map(element => element.viewport);
  }

  /**
   * Xóa hồng tâm khỏi viewport.
   */
  clearCrosshair(viewport: Types.IStackViewport | Types.IVolumeViewport) {
    const element = viewport.element;
    element?.querySelector('.crosshair-overlay')?.remove();
  }

  hideOrShowCursor(element: HTMLDivElement, hide: boolean) {
    element.style.cursor = hide ? 'none' : '';
  }
}

export default ThreeDCursorTool;
