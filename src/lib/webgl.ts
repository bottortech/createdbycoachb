export function detectWebGL(): { supported: boolean; performance: "high" | "medium" | "low" | "none" } {
  if (typeof window === "undefined") return { supported: false, performance: "none" };
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ||
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return { supported: false, performance: "none" };

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
      const lower = renderer.toLowerCase();
      if (lower.includes("swiftshader") || lower.includes("llvmpipe") || lower.includes("softpipe")) {
        return { supported: true, performance: "low" };
      }
      if (lower.includes("intel") || lower.includes("mesa")) {
        return { supported: true, performance: "medium" };
      }
    }
    return { supported: true, performance: "high" };
  } catch {
    return { supported: false, performance: "none" };
  }
}
