import fs from "fs";
import path from "path";

export interface FriendLink {
  title: string;
  url: string;
  description?: string;
  avatar?: string;
  submittedAt: string;
  approvedAt?: string;
  status: "approved" | "pending" | "rejected";
}

export interface FriendLinksData {
  approved: FriendLink[];
  pending: FriendLink[];
}

// 已批准的链接：从 public/ 读取（静态部署，只读）
const APPROVED_FILE = path.join(process.cwd(), "public/links/data.json");

// 待审核的链接：写入 /tmp/（Vercel 可写）
const PENDING_FILE = path.join("/tmp", "friend-links-pending.json");

/** 读取已批准的友链 */
export function readApproved(): FriendLink[] {
  try {
    const raw = fs.readFileSync(APPROVED_FILE, "utf-8");
    const data = JSON.parse(raw);
    return (data.approved || data.links || data) as FriendLink[];
  } catch {
    return [];
  }
}

/** 读取待审核的友链 */
export function readPending(): FriendLink[] {
  try {
    if (!fs.existsSync(PENDING_FILE)) return [];
    const raw = fs.readFileSync(PENDING_FILE, "utf-8");
    return JSON.parse(raw) as FriendLink[];
  } catch {
    return [];
  }
}

/** 写入待审核队列 */
export function writePending(links: FriendLink[]) {
  try {
    const dir = path.dirname(PENDING_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PENDING_FILE, JSON.stringify(links, null, 2), "utf-8");
  } catch (err) {
    console.error("writePending error:", err);
  }
}

/** 追加一条待审核链接 */
export function addPending(link: FriendLink): boolean {
  try {
    const pending = readPending();
    pending.push(link);
    writePending(pending);
    return true;
  } catch {
    return false;
  }
}
