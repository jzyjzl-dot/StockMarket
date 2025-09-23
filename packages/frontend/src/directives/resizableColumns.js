// Lightweight directive to make ElTable columns resizable by dragging header edges
// Usage: v-resizable-columns on <el-table>

function applyResizers(el) {
  const headerWrapper = el.querySelector('.el-table__header-wrapper');
  if (!headerWrapper) return;

  const headerTable = headerWrapper.querySelector('table');
  const headerCols = headerWrapper.querySelectorAll('colgroup col');
  const bodyWrapper = el.querySelector('.el-table__body-wrapper');
  const bodyCols = bodyWrapper
    ? bodyWrapper.querySelectorAll('colgroup col')
    : null;
  const bodyTable = bodyWrapper ? bodyWrapper.querySelector('table') : null;

  const syncTableWidth = (clampToContainer = false) => {
    const ths = headerWrapper.querySelectorAll('thead th');
    let total = 0;
    ths.forEach((th, i) => {
      const wStyle = headerCols && headerCols[i] && headerCols[i].style.width;
      const w = wStyle ? parseFloat(wStyle) : th.offsetWidth;
      total += isNaN(w) ? th.offsetWidth : w;
    });
    if (total > 0) {
      if (clampToContainer) {
        const container =
          el.clientWidth ||
          (el.parentElement && el.parentElement.clientWidth) ||
          total;
        total = Math.min(total, container);
      }
      const px = total + 'px';
      if (headerTable) {
        headerTable.style.width = px;
        headerTable.style.minWidth = px;
      }
      if (bodyTable) {
        bodyTable.style.width = px;
        bodyTable.style.minWidth = px;
      }
    }
  };

  const ths = headerWrapper.querySelectorAll('thead th');
  ths.forEach((th, index) => {
    if (th.dataset.resizableAdded) return;
    th.style.position = th.style.position || 'relative';

    // Record default width once
    if (!th.dataset.defaultWidth) {
      const initialWidth =
        th.offsetWidth || parseFloat(getComputedStyle(th).width) || 100;
      th.dataset.defaultWidth = String(Math.max(50, Math.round(initialWidth)));
    }

    const handle = document.createElement('span');
    handle.className = 'col-resizer-handle';
    handle.title = '拖动调整列宽';
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.pageX;
      const startWidth = th.offsetWidth;
      const minWidth = 50;

      const move = (ev) => {
        const delta = ev.pageX - startX;
        const newWidth = Math.max(minWidth, startWidth + delta);

        // Apply to header th
        th.style.width = newWidth + 'px';
        th.style.minWidth = newWidth + 'px';

        // Apply to colgroups (header + body) to sync widths
        if (headerCols && headerCols[index]) {
          headerCols[index].style.width = newWidth + 'px';
        }
        if (bodyCols && bodyCols[index]) {
          bodyCols[index].style.width = newWidth + 'px';
        }

        // Expand/shrink table total width based on sum
        syncTableWidth();

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      };

      const up = () => {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });

    // Double-click to reset this column to default width
    handle.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const defaultWidth = parseFloat(th.dataset.defaultWidth || '100') || 100;
      const finalWidth = Math.max(50, Math.round(defaultWidth));
      th.style.width = finalWidth + 'px';
      th.style.minWidth = finalWidth + 'px';
      if (headerCols && headerCols[index]) {
        headerCols[index].style.width = finalWidth + 'px';
      }
      if (bodyCols && bodyCols[index]) {
        bodyCols[index].style.width = finalWidth + 'px';
      }
      syncTableWidth();
    });

    th.appendChild(handle);
    th.dataset.resizableAdded = 'true';
  });

  // Initial sync to match starting widths but avoid default overflow
  if (!el._colResizeInitialSynced) {
    syncTableWidth(true);
    el._colResizeInitialSynced = true;
  } else {
    syncTableWidth();
  }
}

function observeWhenReady(el) {
  // Try immediately, then observe for header render changes
  applyResizers(el);
  const observer = new MutationObserver(() => applyResizers(el));
  observer.observe(el, { childList: true, subtree: true });
  el._colResizeObserver = observer;
}

export default {
  mounted(el) {
    // Defer to ensure ElTable has rendered DOM
    if (document.readyState === 'complete') {
      setTimeout(() => observeWhenReady(el), 0);
    } else {
      window.addEventListener('load', () => observeWhenReady(el), {
        once: true,
      });
    }
  },
  unmounted(el) {
    if (el._colResizeObserver) {
      el._colResizeObserver.disconnect();
      delete el._colResizeObserver;
    }
  },
};
