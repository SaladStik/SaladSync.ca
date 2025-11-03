// CLEAN TAB SYSTEM - NO BULLSHIT

// Initialize the tab system
function initTabSystem() {
  console.log("Initializing tab system...");

  // Make sure about.md is visible on load
  showFile("about.md");

  // Setup tab click handlers
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      if (!e.target.classList.contains("tab-close")) {
        const fileName = tab.getAttribute("data-file");
        showFile(fileName);
        setActiveTab(fileName);
      }
    });

    // Tab close handler
    const closeBtn = tab.querySelector(".tab-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeTab(tab.getAttribute("data-file"));
      });
    }
  });

  // Setup file item click handlers
  const fileItems = document.querySelectorAll(".file-item");
  fileItems.forEach((item) => {
    item.addEventListener("click", () => {
      const fileName = item.getAttribute("data-file");
      showFile(fileName);
      setActiveTab(fileName);
      item.classList.add("active");
    });
  });
}

// Show a specific file
function showFile(fileName) {
  console.log(`Showing file: ${fileName}`);

  // Get parent and lock its dimensions FIRST (before hiding any files)
  const parent = document.querySelector(".editor-content");
  let parentWidth = parent.offsetWidth;
  let parentHeight = parent.offsetHeight;

  // If parent has no dimensions, force them
  if (parentWidth === 0 || parentHeight === 0) {
    parentWidth = parent.parentElement.offsetWidth;
    parentHeight = parent.parentElement.offsetHeight;
  }

  // Lock parent dimensions so it doesn't collapse
  parent.style.width = parentWidth + "px";
  parent.style.height = parentHeight + "px";

  console.log("Parent dimensions locked:", parentWidth, parentHeight);

  // Hide ALL editor files
  const allFiles = document.querySelectorAll(".editor-file");
  allFiles.forEach((file) => {
    file.style.display = "none";
    file.classList.remove("active");
  });

  // Show the requested file
  const targetFile = document.querySelector(
    `.editor-file[data-file="${fileName}"]`
  );
  if (targetFile) {
    targetFile.classList.add("active");

    console.log(`File ${fileName} is now visible`);

    // Check dimensions immediately
    console.log(
      "Target file rect (immediate):",
      targetFile.getBoundingClientRect()
    );

    // Check dimensions after a delay
    setTimeout(() => {
      console.log(
        "Target file rect (after 100ms):",
        targetFile.getBoundingClientRect()
      );
      console.log("Target file parent:", targetFile.parentElement);
      console.log("Target file is connected to DOM:", targetFile.isConnected);
    }, 100);

    // Make sure it's in editor mode (not preview)
    resetToEditorMode(targetFile);
  } else {
    console.error(`File not found: ${fileName}`);
  }
}

// Set active tab styling
function setActiveTab(fileName) {
  // Remove active from all tabs
  const allTabs = document.querySelectorAll(".tab");
  allTabs.forEach((tab) => tab.classList.remove("active"));

  // Add active to the clicked tab
  const targetTab = document.querySelector(`.tab[data-file="${fileName}"]`);
  if (targetTab) {
    targetTab.classList.add("active");
  }

  // Update file item active state
  const allFileItems = document.querySelectorAll(".file-item");
  allFileItems.forEach((item) => item.classList.remove("active"));

  const targetFileItem = document.querySelector(
    `.file-item[data-file="${fileName}"]`
  );
  if (targetFileItem) {
    targetFileItem.classList.add("active");
  }
}

// Reset file to editor mode (hide preview)
function resetToEditorMode(editorFile) {
  const editorBtn = editorFile.querySelector('[data-mode="editor"]');
  const previewBtn = editorFile.querySelector('[data-mode="preview"]');
  const editorView = editorFile.querySelector(".md-editor-view");
  const previewView = editorFile.querySelector(".md-preview-view");
  const fullPreview = editorFile.querySelector(".full-preview");

  // Reset buttons
  if (editorBtn) editorBtn.classList.add("active");
  if (previewBtn) previewBtn.classList.remove("active");

  // Show editor, hide preview
  if (editorView) editorView.style.display = "flex";
  if (previewView) previewView.style.display = "none";
  if (fullPreview) fullPreview.remove();
}

// Close a tab
function closeTab(fileName) {
  const tab = document.querySelector(`.tab[data-file="${fileName}"]`);
  const wasActive = tab.classList.contains("active");

  tab.remove();

  // If closed tab was active, switch to another tab
  if (wasActive) {
    const remainingTabs = document.querySelectorAll(".tab");
    if (remainingTabs.length > 0) {
      const firstTab = remainingTabs[0];
      const firstFileName = firstTab.getAttribute("data-file");
      showFile(firstFileName);
      setActiveTab(firstFileName);
    }
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initTabSystem();
});
