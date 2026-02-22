(() => {
  function isOverflowing(input) {
    return input.scrollWidth > input.clientWidth;
  }

  function handleClick(e) {
    const input = e.currentTarget;
    if (isOverflowing(input)) {
      const len = input.value.length;
      input.setSelectionRange(len, len);
      input.scrollLeft = input.scrollWidth;
    }
  }

  function initInput(input) {
    if (input.dataset.caretEndInitialized) return;
    input.dataset.caretEndInitialized = "true";
    input.addEventListener("click", handleClick);
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
