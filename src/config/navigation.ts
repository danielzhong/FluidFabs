import { withBase } from "../lib/paths";

export const navigation = [
  { label: "Platform", zh: "平台介绍", path: "/platform/" },
  { label: "Explorer", zh: "交互模型", path: "/explorer/" },
  { label: "Experiments", zh: "实验展示", path: "/experiments/" },
  { label: "Roadmap", zh: "开发路线", path: "/roadmap/" },
  { label: "Partners", zh: "合作交流", path: "/partners/" },
] as const;

/** Compare complete paths, including the configured deployment base. */
export function isCurrentPage(pathname: string, path: string): boolean {
  const normalize = (value: string) => value.replace(/\/+$/, "") || "/";
  return normalize(pathname) === normalize(withBase(path));
}
