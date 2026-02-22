(() => {
  const MIN_FONT = 12;
  const MAX_FONT = 24;
  const HORIZONTAL_PADDING_BUFFER = 4;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  function measureText(text, fontSize, style) {
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
    return ctx.measureText(text).width;
  }

  function resizeInput(input) {
    const style = window.getComputedStyle(input);
    const text = input.value || input.placeholder || "";

    const availableWidth =
      input.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight) -
      HORIZONTAL_PADDING_BUFFER;

    if (availableWidth <= 0) return;

    const textWidthAtMax = measureText(text, MAX_FONT, style);

    if (textWidthAtMax === 0) {
      input.style.fontSize = MAX_FONT + "px";
      return;
    }

    // Initial estimate
    let calculatedSize = (availableWidth / textWidthAtMax) * MAX_FONT;
    calculatedSize = Math.max(MIN_FONT, Math.min(MAX_FONT, calculatedSize));

    while (
      calculatedSize > MIN_FONT &&
      measureText(text, calculatedSize, style) > availableWidth
    ) {
      calculatedSize = Math.max(MIN_FONT, calculatedSize - 0.5);
    }

    input.style.fontSize = calculatedSize + "px";
  }

  function initInput(input) {
    if (input.dataset.autoResizeInitialized) return;
    input.dataset.autoResizeInitialized = "true";

    const handler = () => resizeInput(input);
    input.addEventListener("input", handler);
    window.addEventListener("resize", handler);

    // Defer first resize until fonts/layout is ready
    document.fonts.ready.then(() => resizeInput(input));
  }

  document.querySelectorAll(".card-input").forEach(initInput);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.classList?.contains("card-input")) initInput(node);
        node.querySelectorAll?.(".card-input").forEach(initInput);
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
