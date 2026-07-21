export const EDITOR_UI_TEXT = {
  desktopOnly: {
    description: "Use a laptop or a larger screen to edit this floor map.",
    title: "Editor unavailable on mobile",
  },
  errors: {
    reload: "Reload",
    title: "Unable to load editor",
  },
  leftPanel: {
    tabs: {
      automation: "Automation",
      create: "Create",
      image: "Image",
    },
  },
  inspector: {
    description: "View and edit the selected item.",
    emptyDescription:
      "Click an object, node, or path edge on the canvas to inspect it.",
    emptyTitle: "No element selected",
    title: "Inspector",
  },
  loading: {
    editor: "Loading editor...",
    floor: "Loading floor...",
  },
  objectToolbox: {
    title: "Add to Map",
    description:
      "Pick something below, then double-click anywhere on the map to place it. Drag anything already placed to move it.",
  },
  referencePanel: {
    imageNameFieldLabel: "Image Name",
    attachedStatus: "Attached",
    currentImageFallback: "Current reference image",
    defaultAlt: (floorName: string) => `${floorName} reference image`,
    description:
      "Add an image to line up walls, rooms, and paths while you edit the floor.",
    emptyStatus: "No image",
    error: "Failed to upload reference image.",
    fileFieldLabel: "Image File",
    fileHint: "Choose a PNG, JPG, or similar image file.",
    imageTypeLabel: "Floor plan or sketch",
    noAltFallback: "No name provided",
    readyToUploadPrefix: "Ready to upload:",
    remove: "Remove",
    replaceAction: "Replace Reference Image",
    title: "Reference",
    uploadAction: "Upload Reference Image",
    uploading: "Uploading Image",
    adjust: {
      title: "Adjust",
      moveHint: "Drag the image on the canvas to reposition it, or use the sliders below.",
      positionX: "Position X",
      positionY: "Position Y",
      rotation: "Rotation",
      zoom: "Zoom",
      opacity: "Opacity",
      fit: "Fit",
      fitFill: "Fill",
      fitCover: "Cover",
      fitContain: "Contain",
      lock: "Lock reference image",
      lockDescription: "Prevents accidental changes to position, zoom, and opacity.",
    },
  },
  smartBuilder: {
    actions: "Actions",
    autoConnect: {
      description: "Link object nodes to the nearest hallway point.",
      label: "Auto Connect",
    },
    autoNodes: {
      description: "Create default object nodes for eligible objects.",
      label: "Auto Nodes",
    },
    clearPath: "Clear Path",
    enabledDescription:
      "Manual editing stays the same. This only adds assisted actions.",
    enabledLabel: "Enable automation",
    finishHallwayPath: "Finish Hallway Path",
    generateNodes: "Generate Nodes",
    off: "Off",
    on: "On",
    options: "Options",
    queuedPoints: (count: number) =>
      `${count} hallway point${count === 1 ? "" : "s"} queued. In path mode, click empty canvas to add more points, then finish the path.`,
    queuedPointsEmpty:
      "In path mode, click empty canvas to queue hallway points while automation is enabled.",
    subtitle: "Assisted tools",
    summary: "Speed up node creation, connections, and hallway path drawing.",
    title: "Automation",
  },
  toolbar: {
    backToDashboard: "Back to dashboard",
    floorPrefix: "Floor",
    modes: {
      node: "Add Path Nodes",
      path: "Connect Paths",
      select: "Select & Place",
    },
    modeHints: {
      node: "Click the map to drop a new path node. Drag existing nodes to reposition them.",
      path: "Click a node, then another, to connect them. Click the same node again to cancel.",
      select: "Drag anything to move, resize, or rotate it. Double-click empty space to place the object picked below.",
    },
    save: "Save Changes",
    saving: "Saving...",
    unsaved: "Unsaved Changes",
  },
} as const;
