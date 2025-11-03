// VS Code Portfolio - Interactive JavaScript

// Store original explorer content
let originalExplorerContent = null;

// Sidebar resize functionality
function initSidebarResize() {
  const sidebar = document.querySelector(".sidebar");
  const resizeHandle = document.querySelector(".sidebar-resize-handle");
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  resizeHandle.addEventListener("mousedown", (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = sidebar.offsetWidth;
    resizeHandle.classList.add("resizing");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;

    const width = startWidth + (e.clientX - startX);
    const minWidth = 170;
    const maxWidth = 600;

    if (width >= minWidth && width <= maxWidth) {
      sidebar.style.width = width + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    if (isResizing) {
      isResizing = false;
      resizeHandle.classList.remove("resizing");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  });
}

// Tab Management
document.addEventListener("DOMContentLoaded", () => {
  // Save original explorer content
  const sidebarContent = document.querySelector(".sidebar-content");
  if (sidebarContent) {
    originalExplorerContent = sidebarContent.innerHTML;
  }

  // Initialize sidebar features
  initSidebarResize();

  // Make all code content areas editable
  initializeEditableEditors();

  // Initialize markdown viewer toggles
  initMarkdownViewerToggles();

  // File item clicks
  const fileItems = document.querySelectorAll(".file-item");
  const tabs = document.querySelectorAll(".tab");
  const editorFiles = document.querySelectorAll(".editor-file");

  fileItems.forEach((item) => {
    item.addEventListener("click", () => {
      const fileName = item.getAttribute("data-file");
      openFile(fileName);
    });
  });

  // Tab clicks
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      if (!e.target.classList.contains("tab-close")) {
        const fileName = tab.getAttribute("data-file");
        switchToTab(fileName);
      }
    });

    // Tab close button
    const closeBtn = tab.querySelector(".tab-close");
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeTab(tab.getAttribute("data-file"));
    });
  });

  // Activity bar icons
  const activityIcons = document.querySelectorAll(".activity-icon[data-tab]");
  activityIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      activityIcons.forEach((i) => i.classList.remove("active"));
      icon.classList.add("active");

      // You can add different sidebar content based on the tab
      const tabType = icon.getAttribute("data-tab");
      updateSidebar(tabType);
    });
  });

  // Folder toggling
  const folderItems = document.querySelectorAll(
    ".folder-item, .subfolder-item"
  );
  folderItems.forEach((folder) => {
    folder.addEventListener("click", (e) => {
      e.stopPropagation();
      const folderName = folder.getAttribute("data-folder");
      const folderContent = folder.nextElementSibling;
      const toggle = folder.querySelector(".folder-toggle");

      if (folderContent && folderContent.classList.contains("folder-content")) {
        folderContent.classList.toggle("collapsed");
        if (toggle) {
          toggle.textContent = folderContent.classList.contains("collapsed")
            ? "▶"
            : "▼";
        }
      }
    });
  });

  // Image Viewer Functionality
  initImageViewer();
  initLogoImageViewer();
});

function openFile(fileName) {
  // Check if tab already exists
  const existingTab = document.querySelector(`.tab[data-file="${fileName}"]`);

  if (existingTab) {
    switchToTab(fileName);
  } else {
    createTab(fileName);
  }

  // Update file item active state
  document.querySelectorAll(".file-item").forEach((item) => {
    item.classList.remove("active");
  });
  document
    .querySelector(`.file-item[data-file="${fileName}"]`)
    .classList.add("active");
}

function createTab(fileName) {
  const tabsContainer = document.querySelector(".tabs");
  const tab = document.createElement("div");
  tab.className = "tab";
  tab.setAttribute("data-file", fileName);
  tab.innerHTML = `
        <span class="tab-icon">📄</span>
        <span class="tab-name">${fileName}</span>
        <span class="tab-close">✕</span>
    `;

  tabsContainer.appendChild(tab);

  // Add event listeners to the new tab
  tab.addEventListener("click", (e) => {
    if (!e.target.classList.contains("tab-close")) {
      switchToTab(fileName);
    }
  });

  const closeBtn = tab.querySelector(".tab-close");
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeTab(fileName);
  });

  switchToTab(fileName);
}

function switchToTab(fileName) {
  // Update tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  document
    .querySelector(`.tab[data-file="${fileName}"]`)
    .classList.add("active");

  // Update editor content - hide all files first
  document.querySelectorAll(".editor-file").forEach((file) => {
    file.classList.remove("active");
  });

  // Show the active file
  const editorFile = document.querySelector(
    `.editor-file[data-file="${fileName}"]`
  );
  if (editorFile) {
    editorFile.classList.add("active");

    // Reset to editor view when switching tabs
    const editorBtn = editorFile.querySelector('[data-mode="editor"]');
    const previewBtn = editorFile.querySelector('[data-mode="preview"]');

    if (editorBtn && previewBtn) {
      editorBtn.classList.add("active");
      previewBtn.classList.remove("active");
      showEditor(editorFile);
    }
  }

  // Update file item active state
  document.querySelectorAll(".file-item").forEach((item) => {
    item.classList.remove("active");
  });
  const fileItem = document.querySelector(
    `.file-item[data-file="${fileName}"]`
  );
  if (fileItem) {
    fileItem.classList.add("active");
  }
}

function closeTab(fileName) {
  const tab = document.querySelector(`.tab[data-file="${fileName}"]`);
  const wasActive = tab.classList.contains("active");

  tab.remove();

  // If the closed tab was active, switch to another tab
  if (wasActive) {
    const remainingTabs = document.querySelectorAll(".tab");
    if (remainingTabs.length > 0) {
      const newActiveFile =
        remainingTabs[remainingTabs.length - 1].getAttribute("data-file");
      switchToTab(newActiveFile);
    }
  }
}

function updateSidebar(tabType) {
  const sidebarTitle = document.querySelector(".sidebar-title");
  const sidebarContent = document.querySelector(".sidebar-content");

  switch (tabType) {
    case "explorer":
      sidebarTitle.textContent = "EXPLORER";
      // Restore original explorer content
      if (originalExplorerContent) {
        sidebarContent.innerHTML = originalExplorerContent;
        // Re-attach event listeners for folders and files
        reattachExplorerListeners();
      }
      break;
    case "search":
      sidebarTitle.textContent = "SEARCH";
      sidebarContent.innerHTML = `
                <div style="padding: 20px; color: #858585;">
                    <input type="text" placeholder="Search..." 
                           style="width: 100%; padding: 8px; background: #3c3c3c; 
                                  border: 1px solid #454545; color: #cccccc; 
                                  border-radius: 3px; font-size: 13px;">
                    <p style="margin-top: 20px; font-size: 12px;">No results found</p>
                </div>
            `;
      break;
    case "source":
      sidebarTitle.textContent = "SOURCE CONTROL";
      sidebarContent.innerHTML = `
                <div style="padding: 20px; color: #858585; font-size: 12px;">
                    <p>No source control providers registered.</p>
                </div>
            `;
      break;
    case "extensions":
      sidebarTitle.textContent = "EXTENSIONS";
      sidebarContent.innerHTML = `
                <div style="padding: 20px; color: #cccccc; font-size: 12px;">
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 11px; color: #858585; margin-bottom: 10px; text-transform: uppercase;">Installed</h3>
                        
                        <div style="display: flex; gap: 10px; padding: 10px; background: #252526; border-radius: 4px; margin-bottom: 10px; cursor: pointer;" onmouseover="this.style.background='#2a2d2e'" onmouseout="this.style.background='#252526'">
                            <div style="font-size: 24px;">🖼️</div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; margin-bottom: 4px;">Image Viewer</div>
                                <div style="font-size: 11px; color: #858585;">Preview images with zoom and pan controls</div>
                                <div style="font-size: 10px; color: #007acc; margin-top: 4px;">v1.0.0</div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 10px; padding: 10px; background: #252526; border-radius: 4px; margin-bottom: 10px; cursor: pointer;" onmouseover="this.style.background='#2a2d2e'" onmouseout="this.style.background='#252526'">
                            <div style="font-size: 24px;">📝</div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; margin-bottom: 4px;">Markdown Preview</div>
                                <div style="font-size: 11px; color: #858585;">Preview Markdown files with syntax highlighting</div>
                                <div style="font-size: 10px; color: #007acc; margin-top: 4px;">v2.5.1</div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 10px; padding: 10px; background: #252526; border-radius: 4px; cursor: pointer;" onmouseover="this.style.background='#2a2d2e'" onmouseout="this.style.background='#252526'">
                            <div style="font-size: 24px;">🎨</div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; margin-bottom: 4px;">Dark+ Theme</div>
                                <div style="font-size: 11px; color: #858585;">VS Code's default dark theme</div>
                                <div style="font-size: 10px; color: #007acc; margin-top: 4px;">v1.0.0</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
      break;
  }
}

// Re-attach event listeners after restoring explorer content
function reattachExplorerListeners() {
  // Re-attach file item listeners
  const fileItems = document.querySelectorAll(".file-item");
  fileItems.forEach((item) => {
    item.addEventListener("click", () => {
      const fileName = item.getAttribute("data-file");
      openFile(fileName);
    });
  });

  // Re-attach folder toggle listeners
  const folderItems = document.querySelectorAll(
    ".folder-item, .subfolder-item"
  );
  folderItems.forEach((folder) => {
    folder.addEventListener("click", (e) => {
      e.stopPropagation();
      const folderName = folder.getAttribute("data-folder");
      const folderContent = folder.nextElementSibling;
      const toggle = folder.querySelector(".folder-toggle");

      if (folderContent && folderContent.classList.contains("folder-content")) {
        folderContent.classList.toggle("collapsed");
        if (toggle) {
          toggle.textContent = folderContent.classList.contains("collapsed")
            ? "▶"
            : "▼";
        }
      }
    });
  });
}

// Image Viewer Functions
function initImageViewer() {
  const profileImage = document.getElementById("profileImage");
  const imageContainer = document.getElementById("imageContainer");
  const zoomInBtn = document.getElementById("zoomIn");
  const zoomOutBtn = document.getElementById("zoomOut");
  const resetZoomBtn = document.getElementById("resetZoom");
  const zoomLevelDisplay = document.getElementById("zoomLevel");
  const imageDimensions = document.getElementById("imageDimensions");
  const imageSize = document.getElementById("imageSize");

  let currentZoom = 1;
  const zoomStep = 0.1;
  const minZoom = 0.1;
  const maxZoom = 5;

  if (!profileImage) return;

  // Function to update image dimensions
  function updateImageInfo() {
    if (profileImage.naturalWidth && profileImage.naturalHeight) {
      imageDimensions.textContent = `${profileImage.naturalWidth} × ${profileImage.naturalHeight}`;

      // Estimate file size (approximate)
      fetch(profileImage.src)
        .then((response) => response.blob())
        .then((blob) => {
          const sizeKB = (blob.size / 1024).toFixed(2);
          imageSize.textContent = `${sizeKB} KB`;
        })
        .catch(() => {
          imageSize.textContent = "Size unknown";
        });
    }
  }

  // Check if image is already loaded (from cache)
  if (profileImage.complete && profileImage.naturalWidth > 0) {
    updateImageInfo();
  }

  // Also set up onload event for fresh loads
  profileImage.onload = function () {
    updateImageInfo();
  };

  // Zoom In
  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => {
      if (currentZoom < maxZoom) {
        currentZoom += zoomStep;
        updateZoom();
      }
    });
  }

  // Zoom Out
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => {
      if (currentZoom > minZoom) {
        currentZoom -= zoomStep;
        updateZoom();
      }
    });
  }

  // Reset Zoom
  if (resetZoomBtn) {
    resetZoomBtn.addEventListener("click", () => {
      currentZoom = 1;
      updateZoom();
    });
  }

  // Update zoom transform
  function updateZoom() {
    imageContainer.style.transform = `scale(${currentZoom})`;
    zoomLevelDisplay.textContent = `${Math.round(currentZoom * 100)}%`;
  }

  // Mouse wheel zoom
  const imageViewerContent = document.querySelector(".image-viewer-content");
  if (imageViewerContent) {
    imageViewerContent.addEventListener("wheel", (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0 && currentZoom < maxZoom) {
          currentZoom += zoomStep;
          updateZoom();
        } else if (e.deltaY > 0 && currentZoom > minZoom) {
          currentZoom -= zoomStep;
          updateZoom();
        }
      }
    });
  }
}

// Logo Image Viewer Functions
function initLogoImageViewer() {
  const logoImage = document.getElementById("logoImage");
  const logoImageContainer = document.getElementById("logoImageContainer");
  const logoZoomInBtn = document.getElementById("logoZoomIn");
  const logoZoomOutBtn = document.getElementById("logoZoomOut");
  const logoResetZoomBtn = document.getElementById("logoResetZoom");
  const logoZoomLevelDisplay = document.getElementById("logoZoomLevel");
  const logoDimensions = document.getElementById("logoDimensions");
  const logoSize = document.getElementById("logoSize");

  let currentZoom = 1;
  const zoomStep = 0.1;
  const minZoom = 0.1;
  const maxZoom = 5;

  if (!logoImage) return;

  // Function to update image dimensions
  function updateImageInfo() {
    if (logoImage.naturalWidth && logoImage.naturalHeight) {
      logoDimensions.textContent = `${logoImage.naturalWidth} × ${logoImage.naturalHeight}`;

      // Estimate file size (approximate)
      fetch(logoImage.src)
        .then((response) => response.blob())
        .then((blob) => {
          const sizeKB = (blob.size / 1024).toFixed(2);
          logoSize.textContent = `${sizeKB} KB`;
        })
        .catch(() => {
          logoSize.textContent = "Size unknown";
        });
    }
  }

  // Check if image is already loaded (from cache)
  if (logoImage.complete && logoImage.naturalWidth > 0) {
    updateImageInfo();
  }

  // Also set up onload event for fresh loads
  logoImage.onload = function () {
    updateImageInfo();
  };

  // Zoom In
  if (logoZoomInBtn) {
    logoZoomInBtn.addEventListener("click", () => {
      if (currentZoom < maxZoom) {
        currentZoom += zoomStep;
        updateZoom();
      }
    });
  }

  // Zoom Out
  if (logoZoomOutBtn) {
    logoZoomOutBtn.addEventListener("click", () => {
      if (currentZoom > minZoom) {
        currentZoom -= zoomStep;
        updateZoom();
      }
    });
  }

  // Reset Zoom
  if (logoResetZoomBtn) {
    logoResetZoomBtn.addEventListener("click", () => {
      currentZoom = 1;
      updateZoom();
    });
  }

  // Update zoom transform
  function updateZoom() {
    logoImageContainer.style.transform = `scale(${currentZoom})`;
    logoZoomLevelDisplay.textContent = `${Math.round(currentZoom * 100)}%`;
  }

  // Mouse wheel zoom
  const imageViewerContent = document.querySelectorAll(
    ".image-viewer-content"
  )[1]; // Get second image viewer
  if (imageViewerContent) {
    imageViewerContent.addEventListener("wheel", (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0 && currentZoom < maxZoom) {
          currentZoom += zoomStep;
          updateZoom();
        } else if (e.deltaY > 0 && currentZoom > minZoom) {
          currentZoom -= zoomStep;
          updateZoom();
        }
      }
    });
  }
}

// Markdown Viewer Functionality
function initMarkdownViewerToggles() {
  const viewerToggles = document.querySelectorAll(".md-viewer-toggle");

  viewerToggles.forEach((toggle) => {
    const editorFile = toggle.closest(".editor-file");
    const editorBtn = toggle.querySelector('[data-mode="editor"]');
    const previewBtn = toggle.querySelector('[data-mode="preview"]');

    if (!editorBtn || !previewBtn) {
      console.error("Toggle buttons not found");
      return;
    }

    editorBtn.addEventListener("click", () => {
      console.log("Editor button clicked");
      editorBtn.classList.add("active");
      previewBtn.classList.remove("active");
      showEditor(editorFile);
    });

    previewBtn.addEventListener("click", () => {
      console.log("Preview button clicked");
      previewBtn.classList.add("active");
      editorBtn.classList.remove("active");
      showMarkdownPreview(editorFile);
    });
  });
}

function showEditor(editorFile) {
  // Remove any existing preview
  const existingPreview = editorFile.querySelector(".full-preview");
  if (existingPreview) {
    existingPreview.remove();
  }

  // Show original editor content
  const editorView = editorFile.querySelector(".md-editor-view");
  const previewView = editorFile.querySelector(".md-preview-view");
  if (editorView) editorView.style.display = "flex";
  if (previewView) previewView.style.display = "none";
}

function showMarkdownPreview(editorFile) {
  console.log("Creating markdown preview");

  // Hide original editor content
  const editorView = editorFile.querySelector(".md-editor-view");
  const previewView = editorFile.querySelector(".md-preview-view");
  if (editorView) editorView.style.display = "none";
  if (previewView) previewView.style.display = "none";

  // Get markdown content
  let markdownText = "";
  const codeContent = editorFile.querySelector(".code-content pre");
  if (codeContent) {
    markdownText = codeContent.textContent;
  } else {
    const codeLines = editorFile.querySelectorAll(".code-line");
    const lines = [];
    codeLines.forEach((line) => {
      lines.push(line.textContent);
    });
    markdownText = lines.join("\n");
  }

  console.log("Markdown text length:", markdownText.length);
  console.log("First 100 chars:", markdownText.substring(0, 100));

  // Convert to HTML
  const html = convertMarkdownToHTML(markdownText);
  console.log("Generated HTML length:", html.length);
  console.log("First 200 chars of HTML:", html.substring(0, 200));

  // Create full preview element
  const fullPreview = document.createElement("div");
  fullPreview.className = "full-preview";
  fullPreview.innerHTML = html;

  // Remove existing preview if any
  const existingPreview = editorFile.querySelector(".full-preview");
  if (existingPreview) {
    existingPreview.remove();
  }

  // Add to editor file
  editorFile.appendChild(fullPreview);

  console.log("Preview element added to DOM");
  console.log(
    "Preview element dimensions:",
    fullPreview.getBoundingClientRect()
  );
}

function renderMarkdownPreview(editorFile) {
  const previewContent = editorFile.querySelector(".markdown-preview-content");
  if (!previewContent) {
    console.error("Preview content not found!");
    return;
  }

  // Try to get content from the pre element (if initialized by editable editor)
  let codeContent = editorFile.querySelector(".code-content pre");
  let markdownText = "";

  if (codeContent) {
    // Content is in a pre element
    markdownText = codeContent.textContent;
  } else {
    // Content is still in code-line divs (fallback)
    const codeLines = editorFile.querySelectorAll(".code-line");
    const lines = [];
    codeLines.forEach((line) => {
      lines.push(line.textContent);
    });
    markdownText = lines.join("\n");
  }

  console.log("Markdown text length:", markdownText.length);
  const html = convertMarkdownToHTML(markdownText);
  console.log("HTML output:", html.substring(0, 200));
  previewContent.innerHTML = html;
  console.log("Preview content innerHTML set");
}

function convertMarkdownToHTML(markdown) {
  console.log("Converting markdown to HTML...");

  // Split into lines for processing
  const lines = markdown.split("\n");
  const result = [];
  let inList = false;
  let currentParagraph = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    console.log(`Processing line ${i}: "${trimmed}"`);

    if (trimmed.startsWith("### ")) {
      // H3 header
      if (currentParagraph.length > 0) {
        result.push("<p>" + currentParagraph.join(" ") + "</p>");
        currentParagraph = [];
      }
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      result.push("<h3>" + trimmed.substring(4) + "</h3>");
    } else if (trimmed.startsWith("## ")) {
      // H2 header
      if (currentParagraph.length > 0) {
        result.push("<p>" + currentParagraph.join(" ") + "</p>");
        currentParagraph = [];
      }
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      result.push("<h2>" + trimmed.substring(3) + "</h2>");
    } else if (trimmed.startsWith("# ")) {
      // H1 header
      if (currentParagraph.length > 0) {
        result.push("<p>" + currentParagraph.join(" ") + "</p>");
        currentParagraph = [];
      }
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      result.push("<h1>" + trimmed.substring(2) + "</h1>");
    } else if (trimmed.startsWith("- ")) {
      // List item
      if (currentParagraph.length > 0) {
        result.push("<p>" + currentParagraph.join(" ") + "</p>");
        currentParagraph = [];
      }
      if (!inList) {
        result.push("<ul>");
        inList = true;
      }
      let listText = trimmed.substring(2);
      // Process inline formatting for list items
      listText = processInlineFormatting(listText);
      result.push("<li>" + listText + "</li>");
    } else if (trimmed === "") {
      // Empty line
      if (currentParagraph.length > 0) {
        result.push(
          "<p>" + processInlineFormatting(currentParagraph.join(" ")) + "</p>"
        );
        currentParagraph = [];
      }
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
    } else if (trimmed.length > 0) {
      // Regular text
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      currentParagraph.push(trimmed);
    }
  }

  // Handle remaining content
  if (currentParagraph.length > 0) {
    result.push(
      "<p>" + processInlineFormatting(currentParagraph.join(" ")) + "</p>"
    );
  }
  if (inList) {
    result.push("</ul>");
  }

  const finalHTML = result.join("\n");
  console.log("Final HTML:", finalHTML);
  return finalHTML;
}

function processInlineFormatting(text) {
  // Bold text
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Links
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank">$1</a>'
  );

  // Inline code
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

  return text;
}

// Initialize Editable Editors with Syntax Highlighting
function initializeEditableEditors() {
  const editorFiles = document.querySelectorAll(".editor-file");

  editorFiles.forEach((editorFile) => {
    const fileName = editorFile.getAttribute("data-file");

    // Skip image files
    if (fileName && (fileName.endsWith(".jpg") || fileName.endsWith(".png"))) {
      return;
    }

    const codeContent = editorFile.querySelector(".code-content");
    if (!codeContent) return;

    // Get original text from code lines
    const codeLines = codeContent.querySelectorAll(".code-line");
    let originalText = "";
    codeLines.forEach((line) => {
      const lineText = line.textContent.replace(/\u00A0/g, " ");
      originalText += lineText + "\n";
    });

    // Remove trailing newline
    if (originalText.endsWith("\n\n")) {
      originalText = originalText.slice(0, -1);
    }

    // Create editable pre element
    const pre = document.createElement("pre");
    pre.setAttribute("contenteditable", "true");
    pre.setAttribute("spellcheck", "false");
    pre.textContent = originalText;

    // Replace code-content children with pre
    codeContent.innerHTML = "";
    codeContent.appendChild(pre);

    // Update line numbers on input
    let updateTimeout;
    pre.addEventListener("input", function () {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        const text = this.textContent;
        const lineCount = text.split("\n").length;

        const lineNumbers = editorFile.querySelector(".line-numbers");
        if (lineNumbers) {
          let numbersHTML = "";
          for (let i = 1; i <= lineCount; i++) {
            numbersHTML += `<div>${i}</div>`;
          }
          lineNumbers.innerHTML = numbersHTML;
        }
      }, 50);
    });

    // Initial line numbers
    const lineCount = originalText.split("\n").length;
    const lineNumbers = editorFile.querySelector(".line-numbers");
    if (lineNumbers) {
      let numbersHTML = "";
      for (let i = 1; i <= lineCount; i++) {
        numbersHTML += `<div>${i}</div>`;
      }
      lineNumbers.innerHTML = numbersHTML;
    }
  });
}

// Apply syntax highlighting using CSS
function applySyntaxHighlighting(element, fileName) {
  const text = element.textContent;
  const cursorPos = saveCursorPositionSimple(element);

  let html = escapeHtml(text);

  if (fileName.endsWith(".js")) {
    html = highlightJavaScript(html);
  } else if (fileName.endsWith(".css")) {
    html = highlightCSS(html);
  } else if (fileName.endsWith(".html")) {
    html = highlightHTML(html);
  } else if (fileName.endsWith(".md")) {
    html = highlightMarkdown(html);
  }

  element.innerHTML = html;
  restoreCursorPositionSimple(element, cursorPos);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function saveCursorPositionSimple(element) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return 0;

  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);

  return preCaretRange.toString().length;
}

function restoreCursorPositionSimple(element, offset) {
  const selection = window.getSelection();
  const range = document.createRange();

  let charCount = 0;
  let nodeStack = [element];
  let node,
    foundNode = null,
    foundOffset = 0;

  while ((node = nodeStack.pop())) {
    if (node.nodeType === 3) {
      // Text node
      const nextCharCount = charCount + node.length;
      if (!foundNode && offset >= charCount && offset <= nextCharCount) {
        foundNode = node;
        foundOffset = offset - charCount;
      }
      charCount = nextCharCount;
    } else {
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }
  }

  if (foundNode) {
    range.setStart(foundNode, foundOffset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

// Update line numbers
function updateLineNumbers(codeContent) {
  const editorFile = codeContent.closest(".editor-file");
  if (!editorFile) return;

  const lineNumbersContainer = editorFile.querySelector(".line-numbers");
  if (!lineNumbersContainer) return;

  const codeLines = codeContent.querySelectorAll(".code-line");
  lineNumbersContainer.innerHTML = "";

  codeLines.forEach((_, index) => {
    const lineNum = document.createElement("div");
    lineNum.className = "line-number";
    lineNum.textContent = index + 1;
    lineNumbersContainer.appendChild(lineNum);
  });
}

// Syntax Highlighters
function highlightJavaScript(text) {
  if (!text) return "&nbsp;";

  // Escape HTML first
  text = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Comments (do first to avoid highlighting inside comments)
  text = text.replace(/(\/\/.*$)/gm, '<span class="js-comment">$1</span>');
  text = text.replace(
    /(\/\*[\s\S]*?\*\/)/g,
    '<span class="js-comment">$1</span>'
  );

  // Strings
  text = text.replace(
    /('(?:[^'\\]|\\.)*')/g,
    '<span class="js-string">$1</span>'
  );
  text = text.replace(
    /("(?:[^"\\]|\\.)*")/g,
    '<span class="js-string">$1</span>'
  );
  text = text.replace(
    /(`(?:[^`\\]|\\.)*`)/g,
    '<span class="js-string">$1</span>'
  );

  // Keywords
  text = text.replace(
    /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|new|this|document|window|console|break|continue|switch|case|default|throw)\b/g,
    '<span class="js-keyword">$1</span>'
  );

  // Functions
  text = text.replace(
    /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
    '<span class="js-function">$1</span>('
  );

  return text;
}

function highlightCSS(text) {
  if (!text) return "&nbsp;";

  // Comments
  text = text.replace(
    /(\/\*[\s\S]*?\*\/)/g,
    '<span class="css-comment">$1</span>'
  );

  // Selectors (anything before {)
  text = text.replace(
    /^([^{}/]+)(\s*{)/gm,
    '<span class="css-selector">$1</span>$2'
  );

  // Properties
  text = text.replace(
    /\b([a-z-]+)(\s*):/g,
    '<span class="css-property">$1</span>$2:'
  );

  // Values (anything between : and ;)
  text = text.replace(
    /:\s*([^;{}]+)(;)/g,
    ': <span class="css-value">$1</span>$2'
  );

  return text;
}

function highlightHTML(text) {
  if (!text) return "&nbsp;";

  // Escape HTML
  text = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Comments
  text = text.replace(
    /(&lt;!--[\s\S]*?--&gt;)/g,
    '<span class="html-comment">$1</span>'
  );

  // Tags
  text = text.replace(
    /(&lt;\/?[a-zA-Z0-9]+)/g,
    '<span class="html-tag">$1</span>'
  );
  text = text.replace(/(\/?&gt;)/g, '<span class="html-tag">$1</span>');

  // Attributes
  text = text.replace(
    /\s([a-zA-Z-]+)=/g,
    ' <span class="html-attr">$1</span>='
  );

  // Attribute values
  text = text.replace(
    /=(&quot;[^&]*&quot;|'[^']*')/g,
    '=<span class="html-string">$1</span>'
  );

  return text;
}

function highlightMarkdown(text) {
  if (!text) return "&nbsp;";

  // Headers
  if (text.match(/^#{1,6}\s+/)) {
    return '<span class="markdown-heading">' + text + "</span>";
  }

  // Bold
  text = text.replace(
    /(\*\*.*?\*\*)/g,
    '<span class="markdown-bold">$1</span>'
  );

  // Links
  text = text.replace(
    /(\[.*?\]\(.*?\))/g,
    '<span class="markdown-link">$1</span>'
  );

  return text;
}

// Sync line numbers scroll with code content
function initLineNumberSync() {
  // Get all code-content elements
  const codeContents = document.querySelectorAll(".code-content");

  codeContents.forEach((codeContent) => {
    // Find the corresponding line-numbers element
    const parent = codeContent.parentElement;
    const lineNumbers = parent.querySelector(".line-numbers");

    if (lineNumbers) {
      // Sync scroll position
      codeContent.addEventListener("scroll", () => {
        lineNumbers.scrollTop = codeContent.scrollTop;
      });
    }

    // Check if this is a markdown file (has md-viewer-toggle in ancestor)
    const editorFile = codeContent.closest(".editor-file");
    const isMarkdownFile =
      editorFile && editorFile.querySelector(".md-viewer-toggle");

    if (isMarkdownFile) {
      // Markdown files: allow editing but prevent adding new lines
      codeContent.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          return false;
        }
      });

      codeContent.addEventListener("paste", (e) => {
        e.preventDefault();
        // Get pasted text and remove line breaks
        const pastedText = (e.clipboardData || window.clipboardData).getData(
          "text"
        );
        const singleLineText = pastedText.replace(/[\r\n]+/g, " ");
        document.execCommand("insertText", false, singleLineText);
        return false;
      });

      // Make code-lines editable
      const codeLines = codeContent.querySelectorAll(".code-line");
      codeLines.forEach((line) => {
        line.setAttribute("contenteditable", "true");
      });
    } else {
      // Non-markdown files: completely read-only
      codeContent.addEventListener("keydown", (e) => {
        e.preventDefault();
        return false;
      });

      codeContent.addEventListener("paste", (e) => {
        e.preventDefault();
        return false;
      });

      codeContent.addEventListener("cut", (e) => {
        e.preventDefault();
        return false;
      });

      codeContent.addEventListener("input", (e) => {
        e.preventDefault();
        return false;
      });
    }

    // Prevent drag and drop for all files
    codeContent.addEventListener("drop", (e) => {
      e.preventDefault();
      return false;
    });
  });
}

// Initialize scroll sync when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initLineNumberSync();
});
