import * as React from 'react';
import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import { init as initNiftiLoader } from '@cornerstonejs/nifti-volume-loader';
import { Buffer } from 'buffer';
import { Jimp } from "jimp";
import dcmjs from "dcmjs";
const { datasetToDict } = dcmjs.data

// ONLY WORKS IN NODEJS ENVIRONMENT!
// channels = 4 = RGBA, 3 = RGB, 1 = MONOCHROME
function convertImageBuffer(source: any, width: number, height: number, inChannels = 3, outChannels = 1) {
  if (outChannels === 2 || inChannels === 2)
    return source // error! 
  if (outChannels >= inChannels)
    return source // error! 
  const buf = Buffer.alloc(width * height * outChannels)
  for (let i = 0, j = 0; i < source.length; i += inChannels) {
    const R = source[i + 0]
    const G = source[i + 1]
    const B = source[i + 2]
    if (outChannels === 1) { // Rec.709 conversion
      buf[j++] = Math.round((R * 0.2126) + (G * 0.7152) + (B * 0.0722))
    } else {
      buf[j++] = R
      buf[j++] = G
      buf[j++] = B
    }
  }
  return buf
}

// FIXME: this should ideally be performed at upload-time not render-time!
async function image2DICOM(input: any, monochrome = true, compression = false) {
  let image: any = await Jimp.read(input)
  let buffer: any = null
  if (compression) {
    if (monochrome)
      image = image.greyscale()
    buffer = await image.getBuffer("image/jpeg", { quality: 99 })
  } else {
    buffer = convertImageBuffer(image.bitmap.data, image.width, image.height, 4, 1)
  }
  const pixelBuffer = buffer.buffer ? new Uint8Array(buffer.buffer) : new Uint8Array(buffer)
  const dataset = {
    _meta: {
      TransferSyntaxUID: {
        Value: [compression ? "1.2.840.10008.1.2.4.50" : "1.2.840.10008.1.2.1"],
        vr: "UI"
      },
    },
    _vrMap: {
      PixelData: "OB",
    },
    Rows: image.height,
    Columns: image.width,
    BitsAllocated: 8,
    BitsStored: 8,
    HighBit: 7,
    SamplesPerPixel: monochrome ? 1 : 3,
    PixelRepresentation: 0,
    PlanarConfiguration: 0,
    PhotometricInterpretation: monochrome ? "MONOCHROME2" : "RGB",
    PixelData: pixelBuffer.buffer,
  }
  return new Blob([datasetToDict(dataset).write()], { type: 'application/dicom' })
}

function b64ToFile(str: string) {
  const parts = str.split(';base64,');
  const byteChars = window.atob(parts[1]);
  const buf = new ArrayBuffer(byteChars.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = byteChars.length; i < strLen; i++) {
    bufView[i] = byteChars.charCodeAt(i);
  }
  const type = parts[0].replace("data:", "")
  return new File([new Blob([buf])], type.replace('/', '.'), { type })
}

let cornerstoneInitialized = false;

const TOOL_LIST = [
  cornerstoneTools.StackScrollTool,
  cornerstoneTools.ZoomTool,
  cornerstoneTools.PanTool,
  cornerstoneTools.WindowLevelTool,
  cornerstoneTools.LengthTool,
];

function registerTools() {
  TOOL_LIST.forEach((ToolClass) => {
    try {
      cornerstoneTools.addTool(ToolClass);
    } catch (_) {
      // Tool already registered — safe to ignore
    }
  });
}

async function initCornerstone() {
  if (!cornerstoneInitialized) {
    cornerstoneInitialized = true;
    await cornerstone.init();
    await cornerstoneTools.init();

    const maxWebWorkers = navigator.hardwareConcurrency ? Math.min(navigator.hardwareConcurrency, 7) : 1;
    cornerstoneDICOMImageLoader.init({
      maxWebWorkers,
    });
    initNiftiLoader();
  }
  // Always re-register tools (HMR can clear the internal registry)
  registerTools();
}

export const DICOMViewer = ({ images, convertMonochrome, viewerId, tool, initialSettings, onUpdate }: { images: any[]; convertMonochrome?: boolean; viewerId: string; tool: string; initialSettings?: any; onUpdate?: (settings: any) => void }) => {
  const [loadProgress, setLoadProgress] = React.useState(0);
  const [isReady, setIsReady] = React.useState(false);
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const onUpdateRef = React.useRef(onUpdate);

  React.useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  React.useEffect(() => {
    const setup = async () => {
      await initCornerstone();
      setIsReady(true);
    };
    setup();
  }, []);

  React.useEffect(() => {
    if (!isReady || !viewerRef.current) return;

    const element = viewerRef.current;

    const renderingEngineId = `myRenderingEngine_${viewerId}`;
    const viewportId = `CT_VIEWPORT_${viewerId}`;

    // Note: getRenderingEngine returns an engine if it already exists, otherwise create it.
    let renderingEngine = cornerstone.getRenderingEngine(renderingEngineId);
    if (!renderingEngine) {
        renderingEngine = new cornerstone.RenderingEngine(renderingEngineId);
    }

    const viewportInput = {
      viewportId,
      type: cornerstone.Enums.ViewportType.STACK,
      element,
      defaultOptions: {
        background: [0, 0, 0] as cornerstone.Types.Point3,
      },
    };

    renderingEngine.enableElement(viewportInput);
    const viewport = renderingEngine.getViewport(viewportId) as cornerstone.Types.IStackViewport;

    const toolGroupId = `myToolGroup_${viewerId}`;
    let toolGroup = cornerstoneTools.ToolGroupManager.getToolGroup(toolGroupId);
    if (!toolGroup) {
      toolGroup = cornerstoneTools.ToolGroupManager.createToolGroup(toolGroupId);
      if (toolGroup) {
        [
          cornerstoneTools.StackScrollTool.toolName,
          cornerstoneTools.ZoomTool.toolName,
          cornerstoneTools.PanTool.toolName,
          cornerstoneTools.WindowLevelTool.toolName,
          cornerstoneTools.LengthTool.toolName,
        ].forEach((toolName) => {
          try {
            toolGroup?.addTool(toolName);
          } catch (e) {
            console.warn(`Error adding tool ${toolName} to group:`, e);
          }
        });
      }
    }
    
    if (toolGroup) {
      toolGroup.addViewport(viewportId, renderingEngineId);
    }

    let imageIds: string[] = [];
    let isMounted = true;

    const loadImages = async () => {
      setLoadProgress(10);
      if (images && images.length > 0) {
        if (images[0]?.startsWith?.("data:image/")) {
           const image = await image2DICOM(images[0], convertMonochrome ?? true, !(convertMonochrome ?? true));
           const file = new File([image], "file.dcm", { type: "application/dicom" });
           const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(file);
           imageIds.push(imageId);
        } else {
           imageIds = images.map(url => `wadouri:${url}`);
        }
      }

      if (!isMounted) return;
      setLoadProgress(50);

      if (imageIds.length === 0) {
        return;
      }

      try {
        await viewport.setStack(imageIds, 0);
        viewport.render();
        if (!isMounted) return;
        setLoadProgress(100);

        if (initialSettings) {
           const properties: any = {};
           if (initialSettings.ww !== undefined && initialSettings.wl !== undefined) {
             properties.voiRange = { lower: initialSettings.wl - initialSettings.ww / 2, upper: initialSettings.wl + initialSettings.ww / 2 };
           }
           if (initialSettings.zoom !== undefined) {
             viewport.setZoom(initialSettings.zoom);
           }
           if (Object.keys(properties).length > 0) {
             viewport.setProperties(properties);
             viewport.render();
           }
        }
      } catch (e) {
        console.error(`DICOMViewer(${viewerId}): Error loading images:`, e);
        setLoadProgress(0);
      }
    };

    loadImages();

    const handleCameraModified = (evt: any) => {
      const { viewportId: evtViewportId } = evt.detail;
      if (evtViewportId === viewportId && onUpdateRef.current) {
         const vp = renderingEngine?.getViewport(viewportId) as cornerstone.Types.IStackViewport | undefined;
         if (!vp) return;
         const props = vp.getProperties();
         const zoom = vp.getZoom();
         let ww;
         let wl;
         if (props.voiRange) {
           ww = props.voiRange.upper - props.voiRange.lower;
           wl = props.voiRange.lower + ww / 2;
         }
         onUpdateRef.current({ ww, wl, zoom });
      }
    };
    
    element.addEventListener(cornerstone.Enums.Events.CAMERA_MODIFIED, handleCameraModified);
    element.addEventListener(cornerstone.Enums.Events.VOI_MODIFIED, handleCameraModified);

    const observer = new ResizeObserver(() => {
      renderingEngine?.resize(true);
    });
    observer.observe(element);

    return () => {
      isMounted = false;
      observer.disconnect();
      element.removeEventListener(cornerstone.Enums.Events.CAMERA_MODIFIED, handleCameraModified);
      element.removeEventListener(cornerstone.Enums.Events.VOI_MODIFIED, handleCameraModified);
      
      if (toolGroup) {
         cornerstoneTools.ToolGroupManager.destroyToolGroup(toolGroupId);
      }
      renderingEngine?.disableElement(viewportId);
    };
  }, [isReady, viewerId, images]);

  React.useEffect(() => {
    if (!isReady) return;
    const toolGroupId = `myToolGroup_${viewerId}`;
    const toolGroup = cornerstoneTools.ToolGroupManager.getToolGroup(toolGroupId);
    if (!toolGroup) return;

    const mappedToolName = (() => {
      switch(tool) {
        case 'Scroll': return cornerstoneTools.StackScrollTool.toolName;
        case 'Zoom': return cornerstoneTools.ZoomTool.toolName;
        case 'Pan': return cornerstoneTools.PanTool.toolName;
        case 'WindowLevel': return cornerstoneTools.WindowLevelTool.toolName;
        case 'Draw': return cornerstoneTools.LengthTool.toolName;
        default: return cornerstoneTools.StackScrollTool.toolName;
      }
    })();

    toolGroup.setToolPassive(cornerstoneTools.StackScrollTool.toolName);
    toolGroup.setToolPassive(cornerstoneTools.ZoomTool.toolName);
    toolGroup.setToolPassive(cornerstoneTools.PanTool.toolName);
    toolGroup.setToolPassive(cornerstoneTools.WindowLevelTool.toolName);
    toolGroup.setToolPassive(cornerstoneTools.LengthTool.toolName);

    toolGroup.setToolActive(mappedToolName, {
      bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Primary }],
    });

    if (mappedToolName !== cornerstoneTools.PanTool.toolName) {
      toolGroup.setToolActive(cornerstoneTools.PanTool.toolName, {
        bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Auxiliary }],
      });
    }
    if (mappedToolName !== cornerstoneTools.ZoomTool.toolName) {
      toolGroup.setToolActive(cornerstoneTools.ZoomTool.toolName, {
        bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Secondary }],
      });
    }
  }, [isReady, tool, viewerId]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {loadProgress > 0 && loadProgress < 100 &&
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '10%',
          width: '80%',
          height: '4px',
          backgroundColor: '#333',
          borderRadius: '2px',
          overflow: 'hidden',
          zIndex: 10
        }}>
          <div style={{
            width: `${loadProgress}%`,
            height: '100%',
            backgroundColor: '#1976d2',
            transition: 'width 0.2s ease-in-out'
          }} />
        </div>
      }
      <div
        id={viewerId}
        ref={viewerRef}
        onContextMenu={(e) => e.preventDefault()}
        role="presentation"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};
