export const EDITOR_UI_TEXT = {
  desktopOnly: {
    description: "Use a laptop or a larger screen to edit this floor map.",
    title: "Editor unavailable on mobile",
  },
  errors: {
    reload: "Reload",
    title: "Unable to load editor",
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
    title: "Objects",
    description:
      "Choose an object, then double-click the map to place it. Drag an existing object to move it.",
  },
  referencePanel: {
    altFieldLabel: "Alt Text",
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
    noAltFallback: "No alt text provided",
    readyToUploadPrefix: "Ready to upload:",
    remove: "Remove",
    replaceAction: "Replace Reference Image",
    title: "Reference",
    uploadAction: "Upload Reference Image",
    uploading: "Uploading Image",
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
    floorPrefix: "Floor",
    modes: {
      node: "Add Path Nodes",
      object: "Place & Move Objects",
      path: "Connect Paths",
      select: "Select & Move",
    },
    save: "Save Changes",
    saving: "Saving...",
    unsaved: "Unsaved Changes",
  },
} as const;
