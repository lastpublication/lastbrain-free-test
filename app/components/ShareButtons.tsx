"use client";

import { useState, useRef, useEffect } from "react";
import {
  Share as ShareIcon,
  Save,
  Mail,
  Copy,
  FileText,
  Share2,
} from "lucide-react";
import { LBButton } from "./ui/Primitives";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useGlobal } from "../context/GlobalContext";

type Props = {
  articleSelector?: string;
};

export const ShareButtons = ({ articleSelector = "article" }: Props) => {
  const { isOpen, onOpenChange } = useDisclosure();
  const [isExporting, setIsExporting] = useState(false);
  const { isMobile } = useGlobal();
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);
  const [copiedCard, setCopiedCard] = useState(false);
  const copyCardTimeoutRef = useRef<number | null>(null);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      // show small tooltip instead of alert
      setCopied(true);
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 1500) as unknown as number;
    } catch (e) {
      console.error("Copy failed", e);
      alert("Impossible de copier le lien");
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
      if (copyCardTimeoutRef.current)
        window.clearTimeout(copyCardTimeoutRef.current);
    };
  }, []);

  function escapeHtml(unsafe: string | null) {
    if (!unsafe) return "";
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Try to fetch an image URL and return a Blob (or null on failure)
  async function fetchImageBlob(url: string | null): Promise<Blob | null> {
    if (!url) return null;
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) return null;
      const blob = await res.blob();
      return blob;
    } catch (e) {
      return null;
    }
  }

  function blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((res, rej) => {
      try {
        const reader = new FileReader();
        reader.onload = () => res(String(reader.result || ""));
        reader.onerror = rej;
        reader.readAsDataURL(blob);
      } catch (e) {
        rej(e);
      }
    });
  }

  const copyPreviewCardToClipboard = async () => {
    const { title, image } = getArticlePreview();
    const safeTitle = escapeHtml(title || document.title || "Article");
    const safeUrl = escapeHtml(currentUrl);

    // Try to fetch the image and embed it as a data URL so mail clients show it when pasted.
    let embeddedImgHtml = "";
    let imageBlob: Blob | null = null;
    if (image) {
      imageBlob = await fetchImageBlob(image).catch(() => null);
      if (imageBlob) {
        try {
          const dataUrl = await blobToDataURL(imageBlob);
          embeddedImgHtml = `<img src="${escapeHtml(
            dataUrl
          )}" style="width:100%;height:auto;display:block;object-fit:cover"/>`;
        } catch (e) {
          // fallback to remote URL
          embeddedImgHtml = `<img src="${escapeHtml(
            image
          )}" style="width:100%;height:auto;display:block;object-fit:cover"/>`;
        }
      } else {
        embeddedImgHtml = `<img src="${escapeHtml(
          image
        )}" style="width:100%;height:auto;display:block;object-fit:cover"/>`;
      }
    }

    const html = `
      <div style="border:1px solid #eee;border-radius:8px;overflow:hidden;max-width:600px;font-family:system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
        ${embeddedImgHtml}
        <div style="padding:12px;">
          <h2 style="margin:0 0 6px 0;font-size:18px;color:#111;">${safeTitle}</h2>
          <div style="font-size:13px;color:#555"><a href="${safeUrl}">${safeUrl}</a></div>
        </div>
      </div>
    `;

    const plain = `${title || document.title}\n${currentUrl}`;

    try {
      // Prefer rich clipboard with image + HTML when supported
      if (navigator.clipboard && (window as any).ClipboardItem && imageBlob) {
        const blobHtml = new Blob([html], { type: "text/html" });
        const blobPlain = new Blob([plain], { type: "text/plain" });
        const item: any = new (window as any).ClipboardItem({
          "image/png": imageBlob,
          "text/html": blobHtml,
          "text/plain": blobPlain,
        });
        // @ts-ignore
        await navigator.clipboard.write([item]);
      } else if (
        navigator.clipboard &&
        (window as any).ClipboardItem &&
        !imageBlob &&
        image
      ) {
        // try to fetch via canvas fallback (html2canvas) to create image blob
        try {
          const previewWrapper = document.createElement("div");
          previewWrapper.style.position = "fixed";
          previewWrapper.style.left = "-9999px";
          previewWrapper.style.top = "0";
          previewWrapper.style.background = "#fff";
          previewWrapper.style.padding = "8px";
          previewWrapper.style.border = "1px solid #eee";
          previewWrapper.style.borderRadius = "6px";

          const imgEl = document.createElement("img");
          imgEl.src = image;
          imgEl.style.width = "560px";
          imgEl.style.height = "320px";
          imgEl.style.objectFit = "cover";
          imgEl.style.display = "block";
          imgEl.style.borderRadius = "4px";
          previewWrapper.appendChild(imgEl);

          const titleEl = document.createElement("div");
          titleEl.innerText = title || document.title;
          titleEl.style.marginTop = "8px";
          titleEl.style.fontSize = "16px";
          titleEl.style.color = "#111";
          titleEl.style.maxWidth = "560px";
          previewWrapper.appendChild(titleEl);

          document.body.appendChild(previewWrapper);
          await new Promise((res) => {
            if (!imgEl) return res(null);
            if (imgEl.complete) return res(null);
            imgEl.onload = imgEl.onerror = () => res(null);
          });

          const html2canvasModule: any = (await import("html2canvas")).default;
          const canvas: HTMLCanvasElement = await html2canvasModule(
            previewWrapper,
            {
              useCORS: true,
              scale: 2,
              backgroundColor: "#ffffff",
            }
          );
          const blob: Blob | null = await new Promise((res) =>
            canvas.toBlob((b) => res(b), "image/png")
          );
          previewWrapper.remove();
          if (blob) {
            const blobHtml = new Blob([html], { type: "text/html" });
            const blobPlain = new Blob([plain], { type: "text/plain" });
            const item: any = new (window as any).ClipboardItem({
              "image/png": blob,
              "text/html": blobHtml,
              "text/plain": blobPlain,
            });
            // @ts-ignore
            await navigator.clipboard.write([item]);
          } else {
            await writeHtmlToClipboard(html, plain);
          }
        } catch (err) {
          await writeHtmlToClipboard(html, plain);
        }
      } else {
        // fallback to writing HTML/text only
        await writeHtmlToClipboard(html, plain);
      }

      setCopiedCard(true);
      if (copyCardTimeoutRef.current)
        window.clearTimeout(copyCardTimeoutRef.current);
      copyCardTimeoutRef.current = window.setTimeout(() => {
        setCopiedCard(false);
        copyCardTimeoutRef.current = null;
      }, 1500) as unknown as number;
    } catch (err) {
      console.error("Copy preview card failed", err);
      alert("Impossible de copier la carte dans le presse-papier");
    }
  };

  const shareViaMail = () => {
    const { title, image } = getArticlePreview();
    const subject = title || document.title || "Article";

    const safeTitle = escapeHtml(title || document.title || "Article");
    const safeUrl = escapeHtml(currentUrl);
    let embeddedImgHtml = "";

    (async () => {
      let wroteImage = false;
      try {
        // Try to fetch the thumbnail as a blob and embed it as data URL in the HTML
        let blob: Blob | null = null;
        if (image) {
          blob = await fetchImageBlob(image);
          if (blob) {
            try {
              const dataUrl = await blobToDataURL(blob);
              embeddedImgHtml = `<img src="${escapeHtml(
                dataUrl
              )}" style="width:100%;height:auto;display:block;object-fit:cover"/>`;
            } catch (e) {
              embeddedImgHtml = `<img src="${escapeHtml(
                image
              )}" style="width:100%;height:auto;display:block;object-fit:cover"/>`;
            }
          } else {
            embeddedImgHtml = `<img src="${escapeHtml(
              image
            )}" style="width:100%;height:auto;display:block;object-fit:cover"/>`;
          }
        }

        const htmlCard = `
      <div style="border:1px solid #eee;border-radius:8px;overflow:hidden;max-width:600px;font-family:system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
        ${embeddedImgHtml}
        <div style="padding:12px;">
          <h2 style="margin:0 0 6px 0;font-size:18px;color:#111;">${safeTitle}</h2>
          <div style="font-size:13px;color:#555"><a href="${safeUrl}">${safeUrl}</a></div>
        </div>
      </div>
    `;
        const plainBody = `${title || document.title}\n${currentUrl}`;

        // If we have a blob and ClipboardItem is supported, write image + HTML to clipboard
        if (blob && navigator.clipboard && (window as any).ClipboardItem) {
          const blobHtml = new Blob([htmlCard], { type: "text/html" });
          const blobPlain = new Blob([plainBody], { type: "text/plain" });
          const item: any = new (window as any).ClipboardItem({
            "image/png": blob,
            "text/html": blobHtml,
            "text/plain": blobPlain,
          });
          // @ts-ignore
          try {
            // try combined write first
            await navigator.clipboard.write([item]);
          } catch (writeErr) {
            console.warn(
              "Combined clipboard write failed, will try image-only write",
              writeErr
            );
            try {
              // try image-only
              const itemImg: any = new (window as any).ClipboardItem({
                "image/png": blob,
              });
              // @ts-ignore
              await navigator.clipboard.write([itemImg]);
            } catch (imgErr) {
              console.warn("Image-only clipboard write also failed", imgErr);
              throw imgErr;
            }
          }
          wroteImage = true;
        } else {
          // fallback: try to render a small preview and capture it (html2canvas)
          try {
            if (image) {
              const previewWrapper = document.createElement("div");
              previewWrapper.style.position = "fixed";
              previewWrapper.style.left = "-9999px";
              previewWrapper.style.top = "0";
              previewWrapper.style.background = "#fff";
              previewWrapper.style.padding = "8px";
              previewWrapper.style.border = "1px solid #eee";
              previewWrapper.style.borderRadius = "6px";
              previewWrapper.style.display = "inline-block";

              const imgEl = document.createElement("img");
              imgEl.src = image;
              imgEl.style.width = "560px";
              imgEl.style.height = "320px";
              imgEl.style.objectFit = "cover";
              imgEl.style.display = "block";
              imgEl.style.borderRadius = "4px";
              previewWrapper.appendChild(imgEl);

              const titleEl = document.createElement("div");
              titleEl.innerText = title || document.title;
              titleEl.style.marginTop = "8px";
              titleEl.style.fontSize = "16px";
              titleEl.style.color = "#111";
              titleEl.style.maxWidth = "560px";
              previewWrapper.appendChild(titleEl);

              document.body.appendChild(previewWrapper);
              await new Promise((res) => {
                if (imgEl.complete) return res(null);
                imgEl.onload = imgEl.onerror = () => res(null);
              });

              const html2canvasModule: any = (await import("html2canvas"))
                .default;
              const canvas: HTMLCanvasElement = await html2canvasModule(
                previewWrapper,
                {
                  useCORS: true,
                  scale: 2,
                  backgroundColor: "#ffffff",
                }
              );
              const canvasBlob: Blob | null = await new Promise((res) =>
                canvas.toBlob((b) => res(b), "image/png")
              );
              previewWrapper.remove();
              if (
                canvasBlob &&
                navigator.clipboard &&
                (window as any).ClipboardItem
              ) {
                const blobHtml = new Blob([htmlCard], { type: "text/html" });
                const blobPlain = new Blob([plainBody], { type: "text/plain" });
                const item: any = new (window as any).ClipboardItem({
                  "image/png": canvasBlob,
                  "text/html": blobHtml,
                  "text/plain": blobPlain,
                });
                // @ts-ignore
                await navigator.clipboard.write([item]);
                wroteImage = true;
              } else {
                await writeHtmlToClipboard(htmlCard, plainBody);
              }
            } else {
              await writeHtmlToClipboard(htmlCard, plainBody);
            }
          } catch (err) {
            await writeHtmlToClipboard(htmlCard, plainBody);
          }
        }
      } catch (err) {
        /* ignore */
      } finally {
        const description = (
          (
            document.querySelector(
              `${articleSelector} .prose p`
            ) as HTMLElement | null
          )?.innerText || ""
        ).trim();
        if (wroteImage) {
          setCopiedCard(true);
          if (copyCardTimeoutRef.current)
            window.clearTimeout(copyCardTimeoutRef.current);
          copyCardTimeoutRef.current = window.setTimeout(() => {
            setCopiedCard(false);
            copyCardTimeoutRef.current = null;
          }, 1500) as unknown as number;
        } else {
          try {
            await writeHtmlToClipboard(
              `
      <div style="border:1px solid #eee;border-radius:8px;overflow:hidden;max-width:600px;font-family:system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
        <div style="padding:12px;">
          <h2 style="margin:0 0 6px 0;font-size:18px;color:#111;">${safeTitle}</h2>
          <div style="font-size:13px;color:#555"><a href="${safeUrl}">${safeUrl}</a></div>
          <p>${description}</p>
          <img src="${image}" alt="${safeTitle}" style="width:100%;height:auto;"/>
        </div>
      </div>
    `,
              `${title || document.title}\n${currentUrl}`
            );
            setCopiedCard(true);
            if (copyCardTimeoutRef.current)
              window.clearTimeout(copyCardTimeoutRef.current);
            copyCardTimeoutRef.current = window.setTimeout(() => {
              setCopiedCard(false);
              copyCardTimeoutRef.current = null;
            }, 1500) as unknown as number;
          } catch (err) {
            /* ignore */
          }
        }

        // Build a simple plain-text mail body (title, optional description, article link and image URL)

        const mailBody = `
(La carte a été copiée dans le presse-papier si votre client supporte le collage d'images)
coller l'élément cmd + V | ctrl + V
        `.trim();

        window.location.href = `mailto:?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(mailBody)}`;
      }
    })();
  };

  // Try to write an HTML fragment to the clipboard, fallback to plain text
  async function writeHtmlToClipboard(html: string, plain: string) {
    try {
      // Prefer the async Clipboard API with HTML mime if available
      if (navigator.clipboard && (window as any).ClipboardItem) {
        const blobHtml = new Blob([html], { type: "text/html" });
        const blobPlain = new Blob([plain], { type: "text/plain" });
        const item: any = new (window as any).ClipboardItem({
          "text/html": blobHtml,
          "text/plain": blobPlain,
        });
        // @ts-ignore
        await navigator.clipboard.write([item]);
        return;
      }
    } catch (err) {
      // ignore and fallback
    }
    // fallback
    return navigator.clipboard.writeText(plain || html);
  }

  const nativeShare = async () => {
    if ((navigator as any).share) {
      try {
        // Prefer large thumbnail for native share if available
        const globalArticle = (window as any).article;
        let nativeImage: string | null = null;
        if (globalArticle && Array.isArray(globalArticle.thumbnails)) {
          nativeImage =
            globalArticle.thumbnails[2] ||
            globalArticle.thumbnails[1] ||
            globalArticle.thumbnails[0] ||
            null;
        }
        const { title, image: fallbackImage } = getArticlePreview();
        const image = nativeImage || fallbackImage;
        // Build share text (title + small description + url)
        const shortDescription = (
          (
            document.querySelector(
              `${articleSelector} .prose p`
            ) as HTMLElement | null
          )?.innerText || ""
        ).trim();
        const shareText = `${
          title || document.title
        }\n\n${shortDescription}\n\n${currentUrl}`;

        // Try to fetch image and share as a file if possible
        if (image && (navigator as any).canShare) {
          try {
            // Build a small preview card off-screen (image + title) and capture it to PNG
            const previewWrapper = document.createElement("div");
            previewWrapper.style.position = "fixed";
            previewWrapper.style.left = "-9999px";
            previewWrapper.style.top = "0";
            previewWrapper.style.background = "#fff";
            previewWrapper.style.padding = "12px";
            previewWrapper.style.border = "1px solid #eee";
            previewWrapper.style.borderRadius = "12px";
            previewWrapper.style.display = "inline-block";
            previewWrapper.style.width = `560px`;
            previewWrapper.style.boxSizing = "border-box";

            // image area
            const imgWrapper = document.createElement("div");
            imgWrapper.style.width = "100%";
            imgWrapper.style.height = "320px";
            imgWrapper.style.overflow = "hidden";
            imgWrapper.style.borderRadius = "8px";
            imgWrapper.style.background = "#f8f8f8";
            imgWrapper.style.display = "block";

            const imgEl = document.createElement("img");
            imgEl.src = image as string;
            imgEl.style.width = "100%";
            imgEl.style.height = "100%";
            imgEl.style.objectFit = "cover";
            imgEl.style.display = "block";
            imgWrapper.appendChild(imgEl);
            previewWrapper.appendChild(imgWrapper);

            // title
            const titleEl = document.createElement("div");
            titleEl.innerText = title || document.title;
            titleEl.style.marginTop = "12px";
            titleEl.style.fontSize = "20px";
            titleEl.style.fontWeight = "600";
            titleEl.style.color = "#111";
            titleEl.style.lineHeight = "1.2";
            titleEl.style.maxWidth = "100%";
            previewWrapper.appendChild(titleEl);

            // short description
            const desc = (
              (
                document.querySelector(
                  `${articleSelector} .prose p`
                ) as HTMLElement | null
              )?.innerText || ""
            ).trim();
            if (desc) {
              const descEl = document.createElement("div");
              descEl.innerText =
                desc.length > 200 ? desc.slice(0, 197) + "..." : desc;
              descEl.style.marginTop = "8px";
              descEl.style.fontSize = "13px";
              descEl.style.color = "#444";
              descEl.style.maxWidth = "100%";
              previewWrapper.appendChild(descEl);
            }

            // small link text
            const linkEl = document.createElement("div");
            linkEl.innerText = currentUrl;
            linkEl.style.marginTop = "10px";
            linkEl.style.fontSize = "12px";
            linkEl.style.color = "#3b82f6";
            linkEl.style.wordBreak = "break-all";
            previewWrapper.appendChild(linkEl);

            document.body.appendChild(previewWrapper);
            // wait for image to load
            await new Promise((res) => {
              if (imgEl.complete) return res(null);
              imgEl.onload = imgEl.onerror = () => res(null);
            });

            const canvasPreview: HTMLCanvasElement = await (
              await import("html2canvas")
            ).default(previewWrapper, {
              useCORS: true,
              scale: 2,
              backgroundColor: "#ffffff",
            });
            const blob = await new Promise<Blob | null>((res) =>
              canvasPreview.toBlob((b) => res(b), "image/png")
            );
            previewWrapper.remove();
            if (blob) {
              const file = new File([blob], "preview.png", { type: blob.type });
              if ((navigator as any).canShare({ files: [file] })) {
                await (navigator as any).share({
                  title: title || document.title,
                  text: shareText,
                  files: [file],
                  url: currentUrl,
                });
                return;
              }
            }
          } catch (err) {
            // fetching/attaching image failed, fallback to simple share
          }
        }

        await (navigator as any).share({
          title: title || document.title,
          text: shareText,
          url: currentUrl,
        });
      } catch (e) {
        // If the user cancels the native share the browser may throw a "Share canceled" error.
        // Ignore cancel/abort errors silently to avoid alarming the user.
        try {
          const msg = (e && (e as any).message) || String(e);
          if (msg && String(msg).toLowerCase().includes("cancel")) {
            return;
          }
        } catch (err) {
          /* ignore */
        }
        console.error("Web Share failed", e);
      }
    } else {
      alert("Partage natif non supporté sur ce navigateur");
    }
  };

  // Extract a preview: use ONLY article.thumbnails (public URLs). Do NOT use cover_image or DOM/meta fallbacks for share/card.
  function getArticlePreview() {
    try {
      const globalArticle = (window as any).article;
      let image: string | null = null;
      if (globalArticle && Array.isArray(globalArticle.thumbnails)) {
        // thumbnails: [small, medium, large] -> prefer medium for preview/card
        const thumbs = globalArticle.thumbnails;
        image = thumbs[1] || thumbs[0] || thumbs[2] || null;
      }

      const title =
        (document.querySelector(`${articleSelector} h1`) as HTMLElement | null)
          ?.innerText || document.title;
      return { title, image } as { title: string | null; image: string | null };
    } catch (err) {
      return { title: document.title, image: null };
    }
  }

  const exportPdf = async () => {
    setIsExporting(true);
    try {
      const html2canvasModule: any = (await import("html2canvas")).default;
      const jspdfModule: any = await import("jspdf");
      const { jsPDF } = jspdfModule;

      const el = document.querySelector(articleSelector) as HTMLElement | null;
      if (!el) {
        alert("Impossible de trouver le contenu de l'article à exporter.");
        setIsExporting(false);
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.left = "-9999px";
      wrapper.style.top = "0";
      wrapper.style.width = `${el.clientWidth || 1200}px`;
      wrapper.style.overflow = "visible";

      const lightVars: Record<string, string> = {
        "--lb-color-background": "#ffffff",
        "--lb-color-foreground": "#111111",
        "--lb-color-content1": "#f7f7f8",
        "--lb-color-content2": "#efeff1",
        "--lb-color-content3": "#e7e7ea",
      };
      Object.entries(lightVars).forEach(([k, v]) =>
        wrapper.style.setProperty(k, v)
      );

      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.background = "var(--lb-color-background)";
      clone.style.color = "var(--lb-color-foreground)";

      // remove export-ignored elements (buttons etc.)
      const ignoreEls = Array.from(
        clone.querySelectorAll("[data-export-ignore]")
      );
      ignoreEls.forEach((n) => n.remove());

      // Remove card backgrounds / borders / shadows in clone
      const selectorsToClear = [
        ".card-solid",
        ".card-bordered",
        ".LBCard",
        ".bg-content1",
        ".bg-content-1",
        ".bg-content-2",
        ".bg-content-3",
        ".card",
        "[class*='card']",
        "[class*='Card']",
      ];
      wrapper.appendChild(clone);
      const elementsToClear = Array.from(
        clone.querySelectorAll(selectorsToClear.join(","))
      );
      elementsToClear.forEach((node: Element) => {
        const eln = node as HTMLElement;
        eln.style.background = "transparent";
        eln.style.border = "none";
        eln.style.boxShadow = "none";
      });

      const allChildren = Array.from(
        clone.querySelectorAll("*")
      ) as HTMLElement[];
      allChildren.forEach((c) => {
        try {
          const bg = window.getComputedStyle(c).backgroundColor;
          if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
            c.style.background = "transparent";
          }
          const bd = window.getComputedStyle(c).borderStyle;
          if (bd && bd !== "none") {
            c.style.border = "none";
          }
          const sh = window.getComputedStyle(c).boxShadow;
          if (sh && sh !== "none") c.style.boxShadow = "none";
        } catch (err) {
          /* ignore */
        }
      });

      // Force semantic text colors for export (headings -> dark, body -> muted, links -> primary)
      try {
        const titleColor = "#111827"; // text-default-800
        const mutedColor = "#4b5563"; // text-default-600
        const primaryColor = "#7c3aed"; // primary

        const headings = clone.querySelectorAll(
          "h1,h2,h3,h4,h5,h6,.h1,.h2,.h3"
        );
        headings.forEach((h) => {
          (h as HTMLElement).style.color = titleColor;
        });

        const bodyText = clone.querySelectorAll(
          "p,li,span,small,blockquote,pre"
        );
        bodyText.forEach((t) => {
          const el = t as HTMLElement;
          if (!/(H[1-6])/.test(el.tagName)) el.style.color = mutedColor;
        });

        const links = clone.querySelectorAll("a");
        links.forEach((a) => {
          (a as HTMLElement).style.color = primaryColor;
        });
      } catch (err) {
        /* ignore */
      }

      document.body.appendChild(wrapper);

      // Map original images to cloned images (assume same order) and force inline sizing + object-fit
      const origImgs = Array.from(
        el.querySelectorAll("img")
      ) as HTMLImageElement[];
      const cloneImgs = Array.from(
        clone.querySelectorAll("img")
      ) as HTMLImageElement[];
      cloneImgs.forEach((img, idx) => {
        try {
          const orig = origImgs[idx];
          const cs = window.getComputedStyle(img);
          const objectFit =
            (orig ? window.getComputedStyle(orig) : cs).getPropertyValue(
              "object-fit"
            ) || "cover";
          const objectPosition =
            (orig ? window.getComputedStyle(orig) : cs).getPropertyValue(
              "object-position"
            ) || "center center";

          if (objectFit === "cover") {
            // replace <img> with a div using background-image cover to preserve cropping
            const rect = orig
              ? orig.getBoundingClientRect()
              : img.getBoundingClientRect();
            const width = rect.width || img.naturalWidth || 300;
            const height = rect.height || img.naturalHeight || 200;
            const wrapperDiv = document.createElement("div");
            wrapperDiv.style.width = `${Math.round(width)}px`;
            wrapperDiv.style.height = `${Math.round(height)}px`;
            wrapperDiv.style.backgroundImage = `url('${img.src}')`;
            wrapperDiv.style.backgroundSize = "cover";
            wrapperDiv.style.backgroundPosition = objectPosition;
            wrapperDiv.style.backgroundRepeat = "no-repeat";
            wrapperDiv.style.display = "block";
            wrapperDiv.style.maxWidth = "none";
            img.replaceWith(wrapperDiv);
          } else {
            // keep as img but force sizing to prevent stretching
            if (orig) {
              const rect = orig.getBoundingClientRect();
              img.style.width = `${Math.round(rect.width)}px`;
              img.style.height = `${Math.round(rect.height)}px`;
            }
            img.style.objectFit = objectFit;
            img.style.objectPosition = objectPosition;
            img.style.display = "block";
            img.style.maxWidth = "none";
          }
        } catch (err) {
          // ignore
        }
      });

      const imgs = Array.from(
        wrapper.querySelectorAll("img")
      ) as HTMLImageElement[];
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise((res) => {
              if (!img || img.complete) return res(null);
              img.onload = img.onerror = () => res(null);
            })
        )
      );

      await new Promise((r) => setTimeout(r, 80));

      wrapper.style.background = "transparent";
      const canvas: HTMLCanvasElement = await html2canvasModule(wrapper, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
      });
      const imgData = canvas.toDataURL("image/png");

      // PDF margin: configurable in millimeters
      const marginMm = 20; // default margin in mm (change if needed)
      // convert mm to px (approx. 96 DPI): px = mm * 96 / 25.4
      const pxPerMm = 96 / 25.4;
      const marginPx = Math.round(marginMm * pxPerMm);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width + marginPx * 2, canvas.height + marginPx * 2],
      });

      // draw image leaving the margin on all sides
      pdf.addImage(
        imgData,
        "PNG",
        marginPx,
        marginPx,
        canvas.width,
        canvas.height
      );
      const filename =
        (document.title || "article").replace(/[^a-z0-9]/gi, "_") + ".pdf";
      pdf.save(filename);

      wrapper.remove();
    } catch (e) {
      console.error("Export PDF failed", e);
      alert("Erreur lors de l'export en PDF. Voir la console pour détails.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="w-full space-x-3 inline-flex items-center">
        <LBButton
          data-export-ignore="true"
          size="lg"
          color="secondary"
          startContent={<Share2 />}
          className="px-3 py-1 w-full"
          onPress={() => onOpenChange()}
        >
          Partager
        </LBButton>
      </div>

      <Modal
        size={isMobile ? "full" : "lg"}
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalHeader>{"Partager l'article"}</ModalHeader>
          <ModalBody className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div
                  className="w-full"
                  style={{ position: "relative", display: "inline-block" }}
                >
                  <LBButton
                    size="lg"
                    className="w-full"
                    data-export-ignore="true"
                    startContent={<Copy size={24} />}
                    onPress={copyLink}
                  >
                    Copier le lien
                  </LBButton>

                  {/* Tooltip sombre avec flèche en bas + animation slideUp + fadeIn */}
                  {copied && (
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        bottom: "100%",
                        marginBottom: 8,
                        background: "rgba(17,17,17,0.95)",
                        color: "#fff",
                        padding: "6px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        lineHeight: "1",
                        whiteSpace: "nowrap",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                        zIndex: 9999,
                        opacity: 0,
                        animation: "copied-tooltip-in 220ms ease-out forwards",
                      }}
                    >
                      <span>Copié !</span>

                      <style>{`
                        @keyframes copied-tooltip-in {
                          from { transform: translateX(-50%) translateY(6px); opacity: 0 }
                          to { transform: translateX(-50%) translateY(0); opacity: 1 }
                        }
                      `}</style>
                    </div>
                  )}
                </div>
                <div style={{ height: 8 }} />
                <div style={{ position: "relative", display: "inline-block" }}>
                  <LBButton
                    size="lg"
                    className="w-full"
                    data-export-ignore="true"
                    startContent={<Copy size={18} />}
                    onPress={copyPreviewCardToClipboard}
                  >
                    Copier la carte
                  </LBButton>
                  {copiedCard && (
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        bottom: "100%",
                        marginBottom: 8,
                        background: "rgba(17,17,17,0.95)",
                        color: "#fff",
                        padding: "6px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        lineHeight: "1",
                        whiteSpace: "nowrap",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                        zIndex: 9999,
                        opacity: 0,
                        animation: "copied-tooltip-in 220ms ease-out forwards",
                      }}
                    >
                      <span>Copié !</span>
                      <span
                        style={{
                          position: "absolute",
                          left: "50%",
                          transform: "translateX(-50%)",
                          bottom: -6,
                          width: 0,
                          height: 0,
                          borderLeft: "6px solid transparent",
                          borderRight: "6px solid transparent",
                          borderTop: "6px solid rgba(17,17,17,0.95)",
                        }}
                      />
                      <style>{`
                        @keyframes copied-tooltip-in {
                          from { transform: translateX(-50%) translateY(6px); opacity: 0 }
                          to { transform: translateX(-50%) translateY(0); opacity: 1 }
                        }
                      `}</style>
                    </div>
                  )}
                </div>
                <LBButton
                  size="lg"
                  data-export-ignore="true"
                  startContent={<Mail size={24} />}
                  onPress={shareViaMail}
                >
                  Envoyer par mail
                </LBButton>
                <LBButton
                  size="lg"
                  data-export-ignore="true"
                  startContent={<ShareIcon size={24} />}
                  onPress={nativeShare}
                >
                  Partage natif
                </LBButton>
                <LBButton
                  size="lg"
                  data-export-ignore="true"
                  startContent={<FileText size={24} />}
                  onPress={exportPdf}
                  isDisabled={isExporting}
                >
                  {isExporting ? "Export..." : "Exporter en PDF"}
                </LBButton>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
